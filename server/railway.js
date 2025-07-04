// This is a special entry file for Railway deployment
// It ensures path resolution works correctly in production

// Register tsconfig-paths to resolve TypeScript paths
require('tsconfig-paths/register');

// Run the compiled server code
require('./dist/index.js');
