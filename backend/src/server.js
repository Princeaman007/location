// Charger les variables d'environnement EN PREMIER
import dotenv from 'dotenv';
import path from 'path';

// Charger le .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';

// Configurer Cloudinary APRÈS le chargement de dotenv
configureCloudinary();

// Connexion à la base de données
connectDB();

const app = express();
app.set('trust proxy', 1);

// Middleware de sécurité
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Trop de requêtes, veuillez réessayer plus tard',
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS - Configuration complète
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://location-i91q.onrender.com', // production frontend
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin not allowed — ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600, // 10 minutes
  })
);

// Compression
app.use(compression());

// Logger en développement
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes de test
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚗 Bienvenue sur l\'API DCM groupe agence',
    version: '1.0.0',
  });
});

// Routes API
import authRoutes from './routes/auth.js';
import vehicleRoutes from './routes/vehicles.js';
import reservationRoutes from './routes/reservations.js';
import paymentRoutes from './routes/payments.js';
import reviewRoutes from './routes/reviews.js';
import userRoutes from './routes/users.js';
import airportTransferRoutes from './routes/airportTransfers.js';
import adminRoutes from './routes/admin.js';

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/airport-transfers', airportTransferRoutes);
app.use('/api/admin', adminRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Serveur démarré en mode ${process.env.NODE_ENV}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}`);
  console.log(`🔗 Frontend sur ${process.env.FRONTEND_URL}\n`);
});

// Gestion des rejets non gérés
process.on('unhandledRejection', (err) => {
  console.error(`❌ Erreur: ${err.message}`);
  server.close(() => process.exit(1));
});

export default app;
