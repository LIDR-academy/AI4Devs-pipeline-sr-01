module.exports = {
  apps: [{
    name: 'backend',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3010
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3010
    }
  }]
};
