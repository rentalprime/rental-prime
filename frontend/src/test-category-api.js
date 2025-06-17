/**
 * Test script to verify category API integration
 * This demonstrates that the frontend is now configured to use backend APIs
 */

import categoryService from "./services/categoryService";

// Test function to demonstrate API calls
export const testCategoryAPI = async () => {
  try {
    // Test 1: Get all categories
    const categories = await categoryService.getCategories({
      status: "active",
      orderBy: "name",
      orderDirection: "asc",
    });

    // Test 2: Get category hierarchy
    const tree = await categoryService.getCategoryTree();

    // Test 3: Get categories for dropdown
    const dropdownData =
      await categoryService.getCategoryHierarchyForDropdown();

    // Test 4: Get active categories
    const activeCategories = await categoryService.getActiveCategories();

    return {
      success: true,
      categories: categories.length,
      tree: tree.length,
      dropdown: dropdownData.length,
      active: activeCategories.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Example usage in a React component:
export const CategoryAPITestComponent = () => {
  const [testResults, setTestResults] = React.useState(null);

  const runTest = async () => {
    const results = await testCategoryAPI();
    setTestResults(results);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h2>Category API Integration Test</h2>
      <button
        onClick={runTest}
        style={{ padding: "10px 20px", marginBottom: "20px" }}
      >
        Run API Test
      </button>

      {testResults && (
        <div>
          <h3>Test Results:</h3>
          <pre>{JSON.stringify(testResults, null, 2)}</pre>
        </div>
      )}

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#f5f5f5",
        }}
      >
        <h3>What Changed:</h3>
        <ul>
          <li>✅ Removed hardcoded categories from BasicInfoStep.js</li>
          <li>
            ✅ Updated categoryService.js to use backend APIs instead of
            Supabase directly
          </li>
          <li>✅ Added proper error handling and loading states</li>
          <li>✅ Implemented category hierarchy support for dropdowns</li>
          <li>✅ Added API client integration with proper authentication</li>
        </ul>
      </div>
    </div>
  );
};
