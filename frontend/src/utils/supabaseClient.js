// Temporary stub for supabaseClient to prevent compilation errors
// This file should be removed once all services are updated to use the API layer

console.warn('supabaseClient is deprecated. Please use the API layer instead.');

// Create a stub object that throws errors when used
const supabaseStub = {
  from: () => {
    throw new Error('Direct Supabase access is deprecated. Please use the API layer instead.');
  },
  auth: {
    admin: {
      createUser: () => {
        throw new Error('Direct Supabase access is deprecated. Please use the API layer instead.');
      }
    }
  }
};

export default supabaseStub;
