require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const xssClean = require('xss-clean');

const { testConnection } = require('./config/db.config');
const seedAdmin = require('./utils/seedAdmin');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const formRoutes = require('./routes/formRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ---------------------------------------------------------------------
// Security & core middleware
// ---------------------------------------------------------------------
app.use(helmet()); // sets secure HTTP headers
app.set('trust proxy', 1); // needed for correct req.ip behind Render/Railway/Vercel proxies

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin(origin, callback) {
      // allow non-browser tools (curl/Postman -- no origin header) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(xssClean()); // sanitizes req.body / req.query / req.params against XSS payloads
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', apiLimiter);

// ---------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy', time: new Date().toISOString() });
});

app.use('/api/submissions', formRoutes); // public
app.use('/api/auth', authRoutes); // public login, protected /me
app.use('/api/admin', adminRoutes); // fully protected

app.use(notFound);
app.use(errorHandler);

// ---------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await testConnection();
    console.log('[db] MySQL connection pool is ready.');

    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`[server] Listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (err) {
    console.error('[server] Failed to start:', err.message);
    process.exit(1);
  }
}

start();

module.exports = app;
