const app = require('./src/app');
const prisma = require('./src/config/prisma');
const { startScheduler } = require('./src/services/jobAggregationService');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startScheduler();
});

// Ping DB every 4 minutes to keep connection alive
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    console.log('DB keep-alive ping failed, reconnecting...');
    await prisma.$disconnect();
    try {
      await prisma.$connect();
      console.log('Database reconnected successfully');
    } catch (err) {
      console.error('Failed to reconnect to database:', err);
    }
  }
}, 4 * 60 * 1000);