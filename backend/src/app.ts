import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import tipsterRoutes from './routes/tipster.routes';
import tipRoutes from './routes/tip.routes';
import statsRoutes from './routes/stats.routes';
import followRoutes from './routes/follow.routes';
import stripeRoutes from './routes/stripe.routes';
import offerRoutes from './routes/offer.routes';
import subscriptionRoutes from './routes/subscription.routes';
import { handleStripeWebhook } from './webhooks/stripe.webhook';

const app = express();

// CORS configuration - allow frontend to make requests
app.use(
  cors({
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true,
  })
);

// Stripe webhook needs raw body - must be before express.json()
app.post(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// JSON parsing for all other routes
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tipsters', tipsterRoutes);
app.use('/api/tips', tipRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

export default app;
