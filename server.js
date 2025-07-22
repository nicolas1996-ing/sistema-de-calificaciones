const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());

// Configuración de CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// limite de peticiones
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por ventana
  message: {
      success: false,
      error: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
  }
});
app.use(limiter);

// Middleware para parsear JSON - todo en formato json
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Importar rutas
const authRoutes = require('./routes/auth'); // ruta de autenticación
const calculatorRoutes = require('./routes/calculator'); // ruta de calculo

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/calculadora', calculatorRoutes);

// Ruta para verificar el estado de la api
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sistema de Gestión de Calificaciones funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta raíz localhost:3000
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API del Sistema de Gestión de Calificaciones',
    endpoints: {
        auth: '/api/auth',
        calculator: '/api/calculadora',
        health: '/api/health'
    },
    documentation: 'Consulte la documentación para más detalles'
  });
});

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor'
        : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor de Gestión de Calificaciones corriendo en puerto ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Autenticación: http://localhost:${PORT}/api/auth`);
  console.log(`Calculadora: http://localhost:${PORT}/api/calculadora`);
});

module.exports = app;
