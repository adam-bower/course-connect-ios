import { View, Image, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { FC, useState, useEffect } from "react";
import { ViewHistoryEntry } from "../hooks";
import { GetVideosVideo, ApiServiceImpl } from "../api";
import { borderRadius, spacing } from "../theme";
import { Typography } from "./Typography";
import { getHumanReadableDuration } from "../utils";
import { useTranslation } from "react-i18next";

interface VideoThumbnailProps {
  video: GetVideosVideo & Partial<ViewHistoryEntry>;
  backend?: string;
  timestamp?: number;
  isVisible?: boolean;
  imageDimensions: { width: number; height: number };
}

const fallback = require("../assets/thumbnailFallback.png");

export const VideoThumbnail: FC<VideoThumbnailProps> = ({ video, backend, timestamp, imageDimensions }) => {
  const { colors } = useTheme();
  const [isError, setIsError] = useState(false);
  const [imageToken, setImageToken] = useState<string | null>(null);
  const { t } = useTranslation();
  const isVideoCurrentlyLive = video.state?.id === 1 && video.isLive;

  const percentageWatched = timestamp ? (timestamp / video.duration) * 100 : 0;

  // Fetch token for private thumbnails
  useEffect(() => {
    if (!backend || !video.uuid || !video.previewPath) return;

    // Check if thumbnail is private
    if (video.previewPath.includes("/lazy-static/") && backend) {
      // Private thumbnails might need authentication, try to fetch token
      ApiServiceImpl.requestVideoToken(backend, video.uuid)
        .then((tokenData) => {
          if (tokenData?.files?.token) {
            setImageToken(tokenData.files.token);
          }
        })
        .catch(() => {
          // If token fetch fails, image will try to load without token
        });
    }
  }, [backend, video.uuid, video.previewPath]);

  const imageUrl = video.previewPath ? `https://${backend}${video.previewPath}` : null;
  const imageUrlWithToken =
    imageUrl && imageToken ? `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}videoFileToken=${imageToken}` : imageUrl;

  const imageSource = imageUrlWithToken ? { uri: imageUrlWithToken } : fallback;

  // Debug logging
  if (video.previewPath) {
    console.log("[Thumbnail Debug]", {
      videoName: video.name,
      backend,
      previewPath: video.previewPath,
      fullURL: imageUrlWithToken,
      hasToken: !!imageToken,
      dimensions: imageDimensions,
    });
  }

  if (!backend || !imageDimensions.width || !imageDimensions.height) {
    return null;
  }

  return (
    <View style={[styles.videoThumbnailContainer, { backgroundColor: colors.themeDesaturated500 }]}>
      <Image
        {...imageDimensions}
        resizeMode="cover"
        source={isError ? fallback : imageSource}
        style={styles.videoImage}
        onError={() => setIsError(true)}
      />
      {!!percentageWatched && percentageWatched > 0 && !video.isLive && (
        <View style={[styles.progressContainer, { backgroundColor: colors.white25 }]}>
          <View style={{ backgroundColor: colors.theme500, width: `${percentageWatched}%`, height: spacing.xs }} />
        </View>
      )}
      {video.isLive ? (
        <View
          style={[
            styles.durationContainer,
            {
              backgroundColor: isVideoCurrentlyLive ? colors.error500 : colors.black100,
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.sm,
              paddingLeft: spacing.sm,
            },
          ]}
        >
          <View
            style={{ width: spacing.sm, height: spacing.sm, backgroundColor: colors.white94, borderRadius: spacing.xs }}
          />
          <Typography
            color={colors.white94}
            fontSize="sizeXS"
            fontWeight="SemiBold"
            style={{ textTransform: "uppercase" }}
          >
            {isVideoCurrentlyLive ? t("live") : t("offline")}
          </Typography>
        </View>
      ) : (
        <View style={[styles.durationContainer, { backgroundColor: colors.black100 }]}>
          <Typography color={colors.white94} fontSize="sizeXS" fontWeight="SemiBold">
            {getHumanReadableDuration(video.duration * 1000)}
          </Typography>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  durationContainer: {
    borderRadius: borderRadius.radiusMd,
    bottom: spacing.xs + 2,
    padding: spacing.xs,
    position: "absolute",
    right: spacing.sm,
    zIndex: 1,
  },
  progressContainer: {
    bottom: 0,
    flex: 1,
    height: spacing.xs,
    left: 0,
    position: "absolute",
    right: 0,
    width: "100%",
    zIndex: 1,
  },
  videoImage: {
    aspectRatio: 16 / 9,
    flex: 1,
  },
  videoThumbnailContainer: {
    aspectRatio: 16 / 9,
    borderRadius: borderRadius.radiusMd,
    flex: 1,
    overflow: "hidden",
    width: "100%",
  },
});
