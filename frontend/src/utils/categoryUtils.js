/**
 * Utility functions for category operations
 */

/**
 * Fetch listing count for a specific category
 * @param {string} categoryId - Category ID
 * @returns {Promise<number>} Number of listings
 */
export const fetchListingCountForCategory = async (categoryId) => {
  try {
    console.log(`Fetching listings count for category ID: ${categoryId}`);

    // Use the specific API endpoint for category listings
    const apiUrl =
      process.env.REACT_APP_API_URL ||
      "https://rental-prime-backend-8ilt.onrender.com";
    const fullUrl = `${apiUrl}/api/listings/category/${categoryId}`;

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch listings for category ${categoryId}:`,
        response.status
      );
      return 0;
    }

    const data = await response.json();

    if (data.success && typeof data.count === "number") {
      console.log(
        `Successfully fetched ${data.count} listings for category ${categoryId}`
      );
      return data.count;
    }

    console.warn(
      `Unexpected response format for category ${categoryId}:`,
      data
    );
    return 0;
  } catch (error) {
    console.error(
      `Error counting listings by category ${categoryId}:`,
      error
    );
    return 0;
  }
};

/**
 * Fetch listing counts for multiple categories
 * @param {Array} categories - Array of category objects
 * @returns {Promise<Array>} Array of categories with listing counts
 */
export const fetchListingCountsForCategories = async (categories) => {
  try {
    console.log(`Fetching listing counts for ${categories.length} categories`);

    // Fetch listing counts for each category in parallel
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        try {
          const listingsCount = await fetchListingCountForCategory(category.id);
          return {
            ...category,
            listingsCount,
          };
        } catch (error) {
          console.error(
            `Error fetching count for category ${category.id}:`,
            error
          );
          return {
            ...category,
            listingsCount: 0,
          };
        }
      })
    );

    console.log(
      `Successfully fetched listing counts for ${categoriesWithCounts.length} categories`
    );
    return categoriesWithCounts;
  } catch (error) {
    console.error("Error fetching listing counts for categories:", error);
    throw error;
  }
};

/**
 * Process category tree with listing counts recursively
 * @param {Array} categories - Array of category tree nodes
 * @returns {Promise<Array>} Array of processed categories with listing counts
 */
export const processCategoryTreeWithCounts = async (categories) => {
  return Promise.all(
    categories.map(async (category) => {
      // Fetch listing count for this category
      let listingsCount = 0;
      try {
        listingsCount = await fetchListingCountForCategory(category.id);
      } catch (error) {
        console.error(
          `Error fetching count for category ${category.id}:`,
          error
        );
      }

      // Process children recursively if they exist
      const children = category.children
        ? await processCategoryTreeWithCounts(category.children)
        : [];

      return {
        ...category,
        listingsCount,
        children,
      };
    })
  );
};
