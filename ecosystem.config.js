module.exports = {
  apps: [
    {
      name: "jarvis-gateway",
      script: "gateway/index.ts",
      interpreter: "bun",
      cwd: __dirname,
      watch: false,
      autorestart: true,
      max_restarts: 20,
      restart_delay: 3000,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
