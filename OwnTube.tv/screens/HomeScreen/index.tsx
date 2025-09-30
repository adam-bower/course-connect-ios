import { InfoFooter, Loader } from "../../components";
import { useTheme } from "@react-navigation/native";
import { useGetCategoriesQuery } from "../../api";
import { useCustomFocusManager, usePageContentTopPadding } from "../../hooks";
import { borderRadius, spacing, colors } from "../../theme";
import { ROUTES } from "../../types";
import { FlatList, Image, Platform, Pressable, SectionList, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RootStackParams } from "../../app/_layout";
import { Typography } from "../../components/Typography";
import { useMemo } from "react";

// Category images mapping
// Place your images in assets/categories/ folder with these names:
const categoryImages: Record<number, any> = {
  1: require("../../assets/categories/popular-videos.png"),
  2: require("../../assets/categories/uploading-file-formats.png"),
  3: require("../../assets/categories/intro-machine-control.png"),
  4: require("../../assets/categories/earthworks-infield-design.png"),
  5: require("../../assets/categories/earthworks-core-features.png"),
  6: require("../../assets/categories/earthworks-project-setup.png"),
  7: require("../../assets/categories/earthworks-first-time-setup.png"),
  8: require("../../assets/categories/earthworks-basics.png"),
  9: require("../../assets/categories/siteworks-advanced-layout.png"),
  10: require("../../assets/categories/siteworks-basic-layout.png"),
  11: require("../../assets/categories/siteworks-project-setup.png"),
  12: require("../../assets/categories/siteworks-basics.png"),
  13: require("../../assets/categories/siteworks-first-time-setup.png"),
};

export const HomeScreen = () => {
  const { colors } = useTheme();
  const { backend } = useLocalSearchParams<RootStackParams[ROUTES.INDEX]>();
  const { top } = usePageContentTopPadding();
  const router = useRouter();
  useCustomFocusManager();

  const { data: categories, isLoading } = useGetCategoriesQuery({});

  const handleCategoryPress = (categoryId: number) => {
    router.push({
      pathname: `/${ROUTES.CATEGORY}`,
      params: { category: String(categoryId), backend },
    });
  };

  // Group categories into sections
  const categoryGroups = useMemo(() => {
    if (!categories) return [];

    return [
      {
        title: "General",
        data: categories.filter(
          (c) => c.id <= 3, // Popular, Uploading, Intro to Machine Control
        ),
      },
      {
        title: "Earthworks",
        data: categories.filter(
          (c) => c.id >= 4 && c.id <= 8, // All Earthworks categories
        ),
      },
      {
        title: "Siteworks",
        data: categories.filter(
          (c) => c.id >= 9 && c.id <= 13, // All Siteworks categories
        ),
      },
    ];
  }, [categories]);

  if (isLoading) {
    return <Loader />;
  }

  const renderCategoryItem = (category: { name: string; id: number }) => (
    <Pressable
      key={category.id}
      onPress={() => handleCategoryPress(category.id)}
      style={({ pressed, focused }) => [
        styles.categoryCard,
        {
          transform: [{ scale: pressed ? 0.98 : 1 }],
          opacity: pressed ? 0.9 : 1,
        },
        Platform.isTV && focused && styles.categoryCardFocused,
      ]}
    >
      <Image
        source={categoryImages[category.id] || require("../../assets/thumbnailFallback.png")}
        style={styles.categoryImage}
        resizeMode="cover"
      />
    </Pressable>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <Typography variant="h3" style={[styles.sectionTitle, { color: colors.text }]}>
      {section.title}
    </Typography>
  );

  const renderSection = ({ item }: { item: Array<{ name: string; id: number }> }) => (
    <FlatList
      horizontal
      data={item}
      renderItem={({ item: category }) => renderCategoryItem(category)}
      keyExtractor={(item) => String(item.id)}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carousel}
      style={styles.horizontalList}
    />
  );

  // Transform data for SectionList - each section has a single item (the array of categories)
  const sections = categoryGroups.map((group) => ({
    title: group.title,
    data: [group.data], // Wrap in array since SectionList expects array of items
  }));

  return (
    <View
      style={{
        ...styles.container,
        backgroundColor: colors.background,
      }}
    >
      <SectionList
        sections={sections}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderSection}
        keyExtractor={(item, index) => `section-${index}`}
        contentContainerStyle={[styles.scrollContent, { paddingTop: top + spacing.lg }]}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListFooterComponent={<InfoFooter />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  carousel: {
    paddingHorizontal: spacing.lg,
  },
  categoryCard: {
    borderRadius: borderRadius.lg,
    height: Platform.select({ web: 140, default: 120 }),
    marginRight: spacing.md,
    overflow: "hidden",
    width: Platform.select({ web: 200, default: 160 }),
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
      default: {},
    }),
  },
  categoryCardFocused: {
    elevation: 8,
    shadowColor: colors.black100,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    transform: [{ scale: 1.05 }],
  },
  categoryImage: {
    height: "100%",
    width: "100%",
  },
  container: {
    flex: 1,
  },
  horizontalList: {
    marginBottom: spacing.xl,
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
