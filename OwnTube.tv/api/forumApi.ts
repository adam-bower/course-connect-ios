import { AxiosInstanceBasedApi } from "./axiosInstance";
import { handleAxiosErrorWithRetry } from "./errorHandler";
import {
  ForumCategory,
  ForumThread,
  ForumPost,
  CreateThreadInput,
  CreatePostInput,
  ForumPaginationParams,
  ForumSearchParams,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./models/forum";

/**
 * Forum API for community discussions
 * This is a mock implementation that will be replaced with actual backend integration
 */
export class ForumApi extends AxiosInstanceBasedApi {
  constructor(debugLogging: boolean = false) {
    super();
    this.debugLogging = debugLogging;
  }

  debugLogging: boolean = false;

  /**
   * Get all forum categories
   */
  async getCategories(_baseURL: string): Promise<ForumCategory[]> {
    try {
      // Mock data for now - replace with actual API call
      const mockCategories: ForumCategory[] = [
        {
          id: "general",
          name: "General Discussion",
          description: "General topics about videos and the community",
          slug: "general",
          threadCount: 42,
          postCount: 156,
          order: 1,
          isLocked: false,
          lastPost: {
            id: "1",
            title: "Welcome to the community!",
            authorName: "admin",
            createdAt: new Date().toISOString(),
          },
        },
        {
          id: "feedback",
          name: "Feedback & Suggestions",
          description: "Share your ideas and feedback",
          slug: "feedback",
          threadCount: 15,
          postCount: 48,
          order: 2,
          isLocked: false,
        },
        {
          id: "creators",
          name: "Creator Discussion",
          description: "For video creators to connect and share tips",
          slug: "creators",
          threadCount: 28,
          postCount: 93,
          order: 3,
          isLocked: false,
        },
        {
          id: "tech",
          name: "Technical Support",
          description: "Get help with technical issues",
          slug: "tech",
          threadCount: 19,
          postCount: 67,
          order: 4,
          isLocked: false,
        },
      ];

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockCategories;

      // Future implementation:
      // const response = await this.instance.get("forum/categories", {
      //   baseURL: `https://${baseURL}/api/v1`,
      // });
      // return response.data as ForumCategory[];
    } catch (error: unknown) {
      return handleAxiosErrorWithRetry(error, "forum categories");
    }
  }

  /**
   * Get threads in a category
   */
  async getThreads(
    baseURL: string,
    categoryId: string,
    _params?: ForumPaginationParams,
  ): Promise<{ threads: ForumThread[]; total: number }> {
    try {
      // Mock data
      const mockThreads: ForumThread[] = [
        {
          id: "thread-1",
          title: "How to get started with video creation?",
          content: "I'm new to creating videos and would love some tips...",
          categoryId,
          categoryName: "General Discussion",
          author: {
            id: "user-1",
            username: "newcreator",
            displayName: "New Creator",
            accountHost: baseURL,
          },
          isPinned: true,
          isLocked: false,
          viewCount: 234,
          replyCount: 12,
          lastReply: {
            id: "post-5",
            authorName: "helper",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "thread-2",
          title: "Best practices for thumbnails",
          content: "What makes a good thumbnail? Share your experiences!",
          categoryId,
          categoryName: "General Discussion",
          author: {
            id: "user-2",
            username: "videomaker",
            displayName: "Video Maker",
            accountHost: baseURL,
          },
          isPinned: false,
          isLocked: false,
          viewCount: 156,
          replyCount: 8,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];

      await new Promise((resolve) => setTimeout(resolve, 300));
      return { threads: mockThreads, total: mockThreads.length };

      // Future implementation:
      // const response = await this.instance.get(`forum/categories/${categoryId}/threads`, {
      //   params,
      //   baseURL: `https://${baseURL}/api/v1`,
      // });
      // return response.data;
    } catch (error: unknown) {
      return handleAxiosErrorWithRetry(error, "forum threads");
    }
  }

  /**
   * Get a specific thread with its posts
   */
  async getThread(baseURL: string, threadId: string): Promise<ForumThread> {
    try {
      const mockThread: ForumThread = {
        id: threadId,
        title: "How to get started with video creation?",
        content:
          "I'm new to creating videos and would love some tips on getting started. What equipment do you recommend for beginners?",
        categoryId: "general",
        categoryName: "General Discussion",
        author: {
          id: "user-1",
          username: "newcreator",
          displayName: "New Creator",
          accountHost: baseURL,
        },
        isPinned: true,
        isLocked: false,
        viewCount: 235,
        replyCount: 12,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
      };

      await new Promise((resolve) => setTimeout(resolve, 200));
      return mockThread;

      // Future implementation:
      // const response = await this.instance.get(`forum/threads/${threadId}`, {
      //   baseURL: `https://${baseURL}/api/v1`,
      // });
      // return response.data as ForumThread;
    } catch (error: unknown) {
      return handleAxiosErrorWithRetry(error, "forum thread");
    }
  }

  /**
   * Get posts in a thread
   */
  async getPosts(
    baseURL: string,
    threadId: string,
    _params?: ForumPaginationParams,
  ): Promise<{ posts: ForumPost[]; total: number }> {
    try {
      const mockPosts: ForumPost[] = [
        {
          id: "post-1",
          threadId,
          content: "Welcome! I'd recommend starting with your phone camera and free editing software.",
          author: {
            id: "user-3",
            username: "experienced",
            displayName: "Experienced Creator",
            accountHost: baseURL,
          },
          likes: 5,
          isEdited: false,
          createdAt: new Date(Date.now() - 82800000).toISOString(),
          updatedAt: new Date(Date.now() - 82800000).toISOString(),
        },
        {
          id: "post-2",
          threadId,
          content: "Check out the creator resources section for tutorials!",
          author: {
            id: "user-4",
            username: "helper",
            displayName: "Community Helper",
            accountHost: baseURL,
          },
          replyToId: "post-1",
          likes: 3,
          isEdited: false,
          createdAt: new Date(Date.now() - 79200000).toISOString(),
          updatedAt: new Date(Date.now() - 79200000).toISOString(),
        },
      ];

      await new Promise((resolve) => setTimeout(resolve, 200));
      return { posts: mockPosts, total: mockPosts.length };

      // Future implementation:
      // const response = await this.instance.get(`forum/threads/${threadId}/posts`, {
      //   params,
      //   baseURL: `https://${baseURL}/api/v1`,
      // });
      // return response.data;
    } catch (error: unknown) {
      return handleAxiosErrorWithRetry(error, "forum posts");
    }
  }

  /**
   * Create a new thread
   */
  async createThread(baseURL: string, input: CreateThreadInput): Promise<ForumThread> {
    try {
      const mockThread: ForumThread = {
        id: `thread-${Date.now()}`,
        title: input.title,
        content: input.content,
        categoryId: input.categoryId,
        categoryName: "General Discussion",
        author: {
          id: "current-user",
          username: "currentuser",
          displayName: "Current User",
          accountHost: baseURL,
        },
        isPinned: false,
        isLocked: false,
        viewCount: 0,
        replyCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        relatedVideoId: input.relatedVideoId,
        relatedChannelId: input.relatedChannelId,
      };

      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockThread;

      // Future implementation:
      // const response = await this.instance.post("forum/threads", input, {
      //   baseURL: `https://${baseURL}/api/v1`,
      // });
      // return response.data as ForumThread;
    } catch (error: unknown) {
      return handleAxiosErrorWithRetry(error, "create forum thread");
    }
  }

  /**
   * Create a new post/reply
   */
  async createPost(baseURL: string, input: CreatePostInput): Promise<ForumPost> {
    try {
      const mockPost: ForumPost = {
        id: `post-${Date.now()}`,
        threadId: input.threadId,
        content: input.content,
        author: {
          id: "current-user",
          username: "currentuser",
          displayName: "Current User",
          accountHost: baseURL,
        },
        replyToId: input.replyToId,
        likes: 0,
        isEdited: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockPost;

      // Future implementation:
      // const response = await this.instance.post("forum/posts", input, {
      //   baseURL: `https://${baseURL}/api/v1`,
      // });
      // return response.data as ForumPost;
    } catch (error: unknown) {
      return handleAxiosErrorWithRetry(error, "create forum post");
    }
  }

  /**
   * Search forum threads
   */
  async searchThreads(
    _baseURL: string,
    _params: ForumSearchParams,
  ): Promise<{ threads: ForumThread[]; total: number }> {
    try {
      // For mock, just return empty results
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { threads: [], total: 0 };

      // Future implementation:
      // const response = await this.instance.get("forum/search", {
      //   params,
      //   baseURL: `https://${baseURL}/api/v1`,
      // });
      // return response.data;
    } catch (error: unknown) {
      return handleAxiosErrorWithRetry(error, "search forum threads");
    }
  }

  /**
   * Create a new category (admin only)
   */
  async createCategory(baseURL: string, input: CreateCategoryInput): Promise<ForumCategory> {
    try {
      const mockCategory: ForumCategory = {
        id: `category-${Date.now()}`,
        name: input.name,
        description: input.description,
        slug: input.slug,
        icon: input.icon,
        threadCount: 0,
        postCount: 0,
        order: input.order || 999,
        isLocked: false,
      };

      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockCategory;

      // Future implementation:
      // const response = await this.instance.post("forum/categories", input, {
      //   baseURL: `https://${baseURL}/api/v1`,
      // });
      // return response.data as ForumCategory;
    } catch (error: unknown) {
      return handleAxiosErrorWithRetry(error, "create forum category");
    }
  }

  /**
   * Update a category (admin only)
   */
  async updateCategory(baseURL: string, categoryId: string, input: UpdateCategoryInput): Promise<ForumCategory> {
    try {
      // Mock: return updated category
      const mockCategory: ForumCategory = {
        id: categoryId,
        name: input.name || "Updated Category",
        description: input.description || "Updated description",
        slug: input.slug || "updated-category",
        icon: input.icon,
        threadCount: 10,
        postCount: 50,
        order: input.order || 1,
        isLocked: input.isLocked || false,
      };

      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockCategory;

      // Future implementation:
      // const response = await this.instance.patch(`forum/categories/${categoryId}`, input, {
      //   baseURL: `https://${baseURL}/api/v1`,
      // });
      // return response.data as ForumCategory;
    } catch (error: unknown) {
      return handleAxiosErrorWithRetry(error, "update forum category");
    }
  }

  /**
   * Delete a category (admin only)
   */
  async deleteCategory(_baseURL: string, _categoryId: string): Promise<void> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Future implementation:
      // await this.instance.delete(`forum/categories/${categoryId}`, {
      //   baseURL: `https://${baseURL}/api/v1`,
      // });
    } catch (error: unknown) {
      return handleAxiosErrorWithRetry(error, "delete forum category");
    }
  }
}

export const forumApi = new ForumApi();
