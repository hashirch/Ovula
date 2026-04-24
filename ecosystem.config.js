module.exports = {
  apps: [
    {
      name: "ovula-backend",
      cwd: "/home/fyp-22p9181/ovula/backend",
      script: "/home/fyp-22p9181/ovula/backend/venv/bin/python",
      args: "main.py",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
        PATH: "/home/fyp-22p9181/.local/bin:/home/fyp-22p9181/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
      },
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "/home/fyp-22p9181/logs/backend.error.log",
      out_file: "/home/fyp-22p9181/logs/backend.out.log",
      merge_logs: true,
      autorestart: true
    },
    {
      name: "ovula-frontend",
      cwd: "/home/fyp-22p9181/ovula/frontend",
      script: "serve",
      args: "-s build -l 3000",
      env: {
        NODE_ENV: "production",
        PATH: "/home/fyp-22p9181/.nvm/versions/node/v20.20.2/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
      },
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "/home/fyp-22p9181/logs/frontend.error.log",
      out_file: "/home/fyp-22p9181/logs/frontend.out.log",
      merge_logs: true,
      autorestart: true
    },
    {
      name: "ovula-ollama",
      script: "/home/fyp-22p9181/bin/ollama",
      args: "serve",
      env: {
        OLLAMA_HOST: "0.0.0.0"
      },
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "/home/fyp-22p9181/logs/ollama.error.log",
      out_file: "/home/fyp-22p9181/logs/ollama.out.log",
      autorestart: true
    }
  ]
};
