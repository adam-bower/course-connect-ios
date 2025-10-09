import VideoView from "../../components/VideoView";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { RootStackParams } from "../../app/_layout";
import { ROUTES } from "../../types";
import {
  ApiServiceImpl,
  QUERY_KEYS,
  useGetSubscriptionByChannelQuery,
  useGetVideoCaptionsCollectionQuery,
  useGetVideoCaptionsQuery,
  useGetVideoFullInfoCollectionQuery,
  useGetVideoQuery,
} from "../../api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader, FocusWrapper, FullScreenModal, ErrorTextWithRetry, Button } from "../../components";
import { useCustomFocusManager, useViewHistory } from "../../hooks";
import { StatusBar } from "expo-status-bar";
import { Settings } from "../../components/VideoControlsOverlay/components/modals";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import useFullScreenVideoPlayback from "../../hooks/useFullScreenVideoPlayback";
import Share from "../../components/VideoControlsOverlay/components/modals/Share";
import VideoDetails from "../../components/VideoControlsOverlay/components/modals/VideoDetails";
import { colorSchemes, spacing } from "../../theme";
import { useAppConfigContext } from "../../contexts";
import { VideoStreamingPlaylist } from "@peertube/peertube-types";
import { useCustomDiagnosticsEvents } from "../../diagnostics/useCustomDiagnosticEvents";
import { CustomPostHogEvents } from "../../diagnostics/constants";

export const VideoScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<RootStackParams[ROUTES.VIDEO]>();
  const { data, isLoading, isError, refetch } = useGetVideoQuery({ id: params?.id });
  const isPremiumVideo = [true, "true"].includes(data?.pluginData?.["is-premium-content"]);
  const qualifiedChannelName = `${data?.channel?.name}@${data?.channel?.host}`;
  useCustomFocusManager();

  const { data: subscriptionData, isLoading: isLoadingSubscriptionData } = useGetSubscriptionByChannelQuery(
    qualifiedChannelName,
    isPremiumVideo && !!data,
  );

  const isPremiumVideoAvailable = useMemo(() => {
    return isPremiumVideo && Boolean(subscriptionData?.[qualifiedChannelName]);
  }, [isPremiumVideo, subscriptionData, qualifiedChannelName]);
  const isPremiumVideoUnavailable = isPremiumVideo && !isPremiumVideoAvailable;

  const { currentInstanceConfig } = useAppConfigContext();
  const { captureDiagnosticsEvent } = useCustomDiagnosticsEvents();

  const premiumAds = currentInstanceConfig?.customizations?.premiumContentAds;
  const premiumAdsData = useGetVideoFullInfoCollectionQuery(premiumAds, QUERY_KEYS.premiumAdsCollection);
  const premiumAdsCaptions = useGetVideoCaptionsCollectionQuery(premiumAds, QUERY_KEYS.premiumAdsCaptionsCollection);

  const { data: captions } = useGetVideoCaptionsQuery(params?.id);
  const { updateHistory } = useViewHistory();
  const { isFullscreen, toggleFullscreen } = useFullScreenVideoPlayback();
  const { top } = useSafeAreaInsets();
  const [quality, setQuality] = useState("auto");

  const isWaitingForLive = [4, 5].includes(Number(data?.state?.id));

  useEffect(() => {
    if (data && params?.backend && !isPremiumVideoUnavailable) {
      const updateData = {
        ...data,
        previewPath: `https://${params.backend}${data.previewPath}`,
        backend: params.backend,
        lastViewedAt: new Date().getTime(),
      };

      updateHistory({ data: updateData });
    }
  }, [data, params?.backend]);

  useFocusEffect(
    useCallback(() => {
      captureDiagnosticsEvent(CustomPostHogEvents.VideoView, {
        videoId: params?.id,
        backend: params?.backend,
      });
    }, [params?.id, params?.backend]),
  );

  const randomPremiumAdIndex = useMemo(() => {
    return Math.floor(Math.random() * premiumAdsData.length);
  }, [premiumAdsData.length]);

  const [videoToken, setVideoToken] = useState<string | null>(null);

  // Fetch video token for private videos
  useEffect(() => {
    if (!params?.id || !params?.backend || !data) return;

    // Check if video URL contains 'private' which indicates it needs a token
    const needsToken =
      data.streamingPlaylists?.[0]?.playlistUrl?.includes("/private/") ||
      data.files?.[0]?.fileUrl?.includes("/private/");

    console.log("[Video Token Check]", {
      videoId: params.id,
      needsToken,
      hasStreamingPlaylists: !!data.streamingPlaylists?.length,
      playlistUrl: data.streamingPlaylists?.[0]?.playlistUrl,
    });

    if (needsToken) {
      ApiServiceImpl.requestVideoToken(params.backend, params.id)
        .then((tokenData) => {
          console.log("[Video Token Response]", { tokenData });
          if (tokenData) {
            // Use streamingPlaylists token for HLS, files token for direct files
            const token = data.streamingPlaylists?.length
              ? tokenData.streamingPlaylists?.token
              : tokenData.files?.token;
            setVideoToken(token);
            console.log("[Video Token]", { hasToken: !!token, token });
          }
        })
        .catch((error) => {
          console.error("[Video Token Error]", error);
        });
    }
  }, [params?.id, params?.backend, data]);

  const uri = useMemo(() => {
    if (!params?.id || !data) {
      return;
    }

    let videoUrl;

    if (data.streamingPlaylists?.length) {
      let hlsStream: VideoStreamingPlaylist;

      const premiumAd = premiumAdsData[randomPremiumAdIndex];

      if (isPremiumVideoUnavailable && premiumAd?.streamingPlaylists?.length) {
        hlsStream = premiumAd.streamingPlaylists[0];
      } else {
        hlsStream = data.streamingPlaylists[0];
      }

      videoUrl = hlsStream.playlistUrl;

      // Add videoFileToken and reinjectVideoFileToken for private HLS streams
      if (videoToken && videoUrl?.includes("/private/")) {
        const separator = videoUrl.includes("?") ? "&" : "?";
        videoUrl = `${videoUrl}${separator}videoFileToken=${videoToken}&reinjectVideoFileToken=true`;
      }
    } else {
      const webVideoFileByQuality = data.files?.find(({ resolution }) => String(resolution.id) === quality);

      if (!webVideoFileByQuality) {
        videoUrl = data.files?.filter(({ resolution }) => resolution.id <= 1080)[0]?.fileUrl;
      } else {
        videoUrl = webVideoFileByQuality?.fileUrl;
      }

      // Add videoFileToken for private direct files
      if (videoToken && videoUrl?.includes("/private/")) {
        const separator = videoUrl.includes("?") ? "&" : "?";
        videoUrl = `${videoUrl}${separator}videoFileToken=${videoToken}`;
      }
    }

    // Debug logging
    console.log("[Video URL Debug]", {
      videoName: data.name,
      backend: params?.backend,
      hasStreamingPlaylists: !!data.streamingPlaylists?.length,
      hasFiles: !!data.files?.length,
      videoUrl,
      hasToken: !!videoToken,
      filesCount: data.files?.length,
      firstFileUrl: data.files?.[0]?.fileUrl,
    });

    return videoUrl;
  }, [params, data, quality, premiumAdsData, isPremiumVideoUnavailable, videoToken]);

  const handleSetTimeStamp = (timestamp: number) => {
    if (!params?.id || isPremiumVideoUnavailable) {
      return;
    }

    updateHistory({ data: { uuid: params.id, timestamp, lastViewedAt: new Date().getTime() } });
  };

  const [visibleModal, setVisibleModal] = useState<"details" | "share" | "settings" | null>(null);
  const closeModal = () => {
    setVisibleModal(null);
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        closeModal();
        setQuality("auto");
      };
    }, []),
  );

  const handleBackButtonPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate({ pathname: ROUTES.HOME, params });
    }
  };
  const handleOpenDetails = () => {
    setVisibleModal("details");
    captureDiagnosticsEvent(CustomPostHogEvents.ShowVideoDescription);
  };

  const handleCloseDetails = () => {
    setVisibleModal(null);
    captureDiagnosticsEvent(CustomPostHogEvents.HideVideoDescription);
  };

  const handleOpenShare = () => {
    setVisibleModal("share");
    captureDiagnosticsEvent(CustomPostHogEvents.Share, { type: "video" });
  };

  const handleSetQuality = (quality: string) => {
    setQuality(quality);
    captureDiagnosticsEvent(CustomPostHogEvents.ResolutionChanged, { resolution: quality });
  };

  if (isLoading || (isPremiumVideo && isLoadingSubscriptionData)) {
    return (
      <View style={[{ paddingTop: top }, styles.flex1]}>
        {Platform.OS !== "web" && (
          <Button onPress={handleBackButtonPress} contrast="low" icon="Arrow-Left" style={styles.backButton} />
        )}
        <View style={styles.flex1}>
          <Loader />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <ErrorTextWithRetry refetch={refetch} errorText={t("videoFailedToLoad")} />
      </View>
    );
  }

  if (!uri && !isWaitingForLive) {
    return null;
  }

  return (
    <FocusWrapper>
      <StatusBar hidden={isFullscreen} backgroundColor="black" style="light" />
      <View style={[{ height: Platform.isTV ? 0 : top }, styles.statusBarUnderlay]} />
      <View
        id="video-container"
        style={[styles.videoContainer, { paddingTop: Platform.isTV ? 0 : top, marginTop: Platform.isTV ? 0 : -top }]}
      >
        <VideoView
          videoData={data}
          isModalOpen={!!visibleModal}
          timestamp={isPremiumVideoUnavailable ? "0" : params?.timestamp}
          handleSetTimeStamp={handleSetTimeStamp}
          testID={`${params.id}-video-view`}
          uri={uri}
          title={data?.name}
          channel={data?.channel}
          toggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
          handleOpenDetails={handleOpenDetails}
          handleOpenSettings={() => {
            setVisibleModal("settings");
          }}
          handleShare={handleOpenShare}
          viewUrl={data?.url}
          selectedQuality={quality}
          handleSetQuality={handleSetQuality}
          captions={isPremiumVideoUnavailable ? premiumAdsCaptions[randomPremiumAdIndex] : captions}
          isWaitingForLive={isWaitingForLive}
        />
        <FullScreenModal onBackdropPress={handleCloseDetails} isVisible={visibleModal === "details"}>
          <VideoDetails
            onClose={handleCloseDetails}
            name={data?.name || ""}
            channel={data?.channel}
            description={data?.description || ""}
            datePublished={data?.originallyPublishedAt || data?.publishedAt || ""}
          />
        </FullScreenModal>
        <FullScreenModal onBackdropPress={closeModal} isVisible={visibleModal === "share"}>
          <Share onClose={closeModal} titleKey="shareVideo" />
        </FullScreenModal>
        <FullScreenModal onBackdropPress={closeModal} isVisible={visibleModal === "settings"}>
          <Settings onClose={closeModal} />
        </FullScreenModal>
      </View>
    </FocusWrapper>
  );
};

const styles = StyleSheet.create({
  backButton: { alignSelf: "flex-start", height: 48, margin: spacing.sm, width: 48 },
  errorContainer: { alignItems: "center", flex: 1, height: "100%", justifyContent: "center", width: "100%" },
  flex1: { flex: 1 },
  statusBarUnderlay: { backgroundColor: colorSchemes.dark.colors.black100, width: "100%" },
  videoContainer: { minHeight: "100%", minWidth: "100%" },
});
