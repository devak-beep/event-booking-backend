const app = require('./app');
const connectDB = require('./config/database');
const config = require('./config/env');
const { startScheduler } = require('./jobs/alertScheduler');

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port} in ${config.env} mode`);
      startScheduler();
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
