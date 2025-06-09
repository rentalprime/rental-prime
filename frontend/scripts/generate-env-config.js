const fs = require('fs');
const path = require('path');

// Get environment variables with REACT_APP prefix
const envVars = Object.keys(process.env)
  .filter(key => key.startsWith('REACT_APP_'))
  .reduce((env, key) => {
    env[key] = process.env[key];
    return env;
  }, {});

// Add additional runtime variables
envVars.REACT_APP_BUILD_TIME = new Date().toISOString();
envVars.REACT_APP_VERSION = process.env.npm_package_version || '1.0.0';

// Create the runtime config
const content = `window._env_ = ${JSON.stringify(envVars, null, 2)};`;

// Ensure the public directory exists
const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write to the env-config.js file
fs.writeFileSync(
  path.resolve(publicDir, 'env-config.js'),
  content
);

console.log('Runtime environment configuration generated successfully');
