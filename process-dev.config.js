'use strict';
module.exports = {
  apps: [
    {
      name: 'messageStore-dev',
      script: 'bin/server.js',
      exec_mode: 'cluster',
      // Log STDOUT/STDERR to error log
      log: process.env.ERROR_LOG_FILE,
      log_type: 'json',
      merge_logs: true,
      instances: 1,
      max_restarts: 5,
      min_uptime: 5000,
      instance_var: 'PM2_APP_INSTANCE',
      watch: ['./'],
      env: {
        MS_PORT: process.env.MS_PORT || 9000,
        NODE_ENV: 'development'
      }
    }
  ]
};
