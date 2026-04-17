/**
 * TIVO Backend — Express Server
 * Punto de entrada principal
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { checkDbConnection } from './infrastructure/db/connection.js';
import authRoutes      from './infrastructure/http/routes/auth.js';
import productsRoutes  from './infrastructure/http/routes/products.js';
import salesRoutes     from './infrastructure/http/routes/sales.js';
import customersRoutes from './infrastructure/http/routes/customers.js';
import dashboardRoutes from './infrastructure/http/routes/dashboard.js';
import aiRoutes        from './infrastructure/http/routes/ai.js';

const app  = express();
const PORT = parseInt(process.env.PORT ?? '3000', 10);

// ─── Middlewares globales ─────────────────────────────────────────────────────

app.use(helmet());
app.use(cors({
  origin:      process.env.CORS_ORIGIN?.split(',') ?? '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting general
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max:      300,
  message:  { error: 'Demasiadas solicitudes. Intenta en unos minutos.' },
}));

// Rate limiting estricto para IA (llamadas son costosas)
app.use('/api/ai', rateLimit({
  windowMs: 60 * 1000, // 1 min
  max:      20,
  message:  { error: 'Límite de llamadas a IA alcanzado. Espera un momento.' },
}));

// ─── Rutas ────────────────────────────────────────────────────────────────────

app.use('/api/auth',      authRoutes);
app.use('/api/products',  productsRoutes);
app.use('/api/sales',     salesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai',        aiRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', (_, res) => {
  res.json({
    status:    'ok',
    service:   'TIVO Backend',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
    ai:        process.env.DASHSCOPE_API_KEY ? 'Qwen configured' : '⚠ DASHSCOPE_API_KEY missing',
  });
});

app.get('/', (_, res) => {
  res.json({ message: 'TIVO POS API v1.0 — Running ✅' });
});

// 404 handler
app.use((_, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// ─── Startup ──────────────────────────────────────────────────────────────────

async function start() {
  try {
    await checkDbConnection();

    if (!process.env.DASHSCOPE_API_KEY) {
      console.warn('⚠️  DASHSCOPE_API_KEY no configurada — Las funciones de IA no funcionarán');
    } else {
      console.log('✅ Qwen AI (DashScope) configurado');
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 TIVO Backend corriendo en http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/health`);
      console.log(`   Env:    ${process.env.NODE_ENV ?? 'development'}`);
    });
  } catch (err) {
    console.error('❌ Error al iniciar el servidor:', err);
    process.exit(1);
  }
}

start();
