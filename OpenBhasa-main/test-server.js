// Simple test server to check if basic Node.js works
const express = require('express');

const app = express();
const PORT = 5001;

console.log('Starting test server...');

app.use(express.json());

app.get('/', (req, res) => {
  console.log('Test route hit');
  res.json({ 
    message: 'Test server is running!',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', port: PORT });
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`📍 Access at: http://localhost:${PORT}`);
});

// Handle process errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});