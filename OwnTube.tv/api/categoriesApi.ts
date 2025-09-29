import { AxiosInstanceBasedApi } from "./axiosInstance";

/**
 * Get available categories from the PeerTube backend `/api/v1/videos/categories` API
 *
 * @description https://docs.joinpeertube.org/api-rest-reference.html#tag/Video/operation/getCategories
 */
export class CategoriesApi extends AxiosInstanceBasedApi {
  constructor() {
    super();
  }

  /**
   * Get a list of available categories from the PeerTube instance
   * NOTE: Returns custom training categories instead of PeerTube defaults
   *
   * @param [baseURL] - Selected instance url
   * @returns List of available categories
   */
  async getCategories(_baseURL: string): Promise<Array<{ name: string; id: number }>> {
    // Custom training/course categories
    const customCategories = [
      { id: 1, name: "Popular Videos" },
      { id: 2, name: "Uploading & File Formats" },
      { id: 3, name: "Intro to Machine Control" },
      { id: 4, name: "Earthworks Infield Design" },
      { id: 5, name: "Earthworks Core Features" },
      { id: 6, name: "Earthworks Project Setup" },
      { id: 7, name: "Earthworks First-Time Setup" },
      { id: 8, name: "Earthworks Basics" },
      { id: 9, name: "Siteworks Advanced Layout" },
      { id: 10, name: "Siteworks Basic Layout" },
      { id: 11, name: "Siteworks Project Setup" },
      { id: 12, name: "Siteworks Basics" },
      { id: 13, name: "Siteworks First-Time Setup" },
    ];

    // Return custom categories directly
    // In the future, this could be made configurable via environment variables or a config file
    return Promise.resolve(customCategories);

    // Original PeerTube API call (kept for reference):
    // try {
    //   const response = await this.instance.get<Record<number, string>>("videos/categories", {
    //     baseURL: `https://${baseURL}/api/v1`,
    //   });
    //   return Object.entries(response.data).map(([id, name]) => ({ id: Number(id), name }));
    // } catch (error: unknown) {
    //   return handleAxiosErrorWithRetry(error, "categories");
    // }
  }
}

export const CategoriesApiImpl = new CategoriesApi();
