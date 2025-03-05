const path = require("path");

module.exports = {
  apps: [
    {
      name: "Denamu",
      script: "./server/dist/src/main.js",
      instances: "1",
      exec_mode: "fork",
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: "production",
        ENV_PATH: "server/configs/.env.db.production",
      },
    },
    {
      name: "feed-crawler",
      script: "./feed-crawler/dist/src/main.js",
      instances: "1",
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
