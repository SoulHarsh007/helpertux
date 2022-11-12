module.exports = {
  apps: [
    {
      name: 'Helper Tux',
      script: './TuxManager.js',
      env_production: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
};
