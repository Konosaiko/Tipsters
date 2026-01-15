import express from 'express';
import tipRoutes from './routes/tip.routes';

const app = express();

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/tips', tipRoutes);

export default app;
