import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'node:fs';
import path from 'node:path';
import { checkDatabase, createGoal, getProduct, initializeDatabase, listGoals, listProducts } from './database.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const providers = new Set(['M-Pesa', 'Tigo Pesa', 'Airtel Money']);
const validMonths = new Set([3, 6, 9, 12]);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      imgSrc: ["'self'", 'data:', 'https://images.unsplash.com', 'https://cdn.simpleicons.org', 'https://*.tile.openstreetmap.org'],
    },
  },
}));
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? false : true }));
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', async (_request, response, next) => {
  try {
    await checkDatabase();
    return response.json({ status: 'ok', service: 'ubepari-api', database: 'postgresql' });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/products', async (request, response, next) => {
  try {
    const { brand, category, search } = request.query;
    return response.json({ products: await listProducts({ brand, category, search }) });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/products/:id', async (request, response, next) => {
  try {
    const product = await getProduct(request.params.id);
    if (!product) return response.status(404).json({ error: 'Product not found.' });
    return response.json({ product });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/goals', async (_request, response, next) => {
  try {
    return response.json({ goals: await listGoals(), demo: true });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/goals', async (request, response, next) => {
  try {
    const { productId, months, provider, phone } = request.body ?? {};
    const targetMonths = Number(months);
    const normalizedPhone = String(phone ?? '').replace(/[\s()-]/g, '');
    if (!productId || !validMonths.has(targetMonths) || !providers.has(provider)) {
      return response.status(400).json({ error: 'Choose a product, a 3, 6, 9, or 12 month pace, and a listed demo carrier.' });
    }
    if (!/^(?:\+?255|0)?[67]\d{8}$/.test(normalizedPhone)) {
      return response.status(400).json({ error: 'Enter a valid Tanzanian mobile number.' });
    }
    const product = await getProduct(String(productId));
    if (!product) return response.status(404).json({ error: 'Product not found.' });
    const goal = await createGoal({ product, months: targetMonths, provider, phone: normalizedPhone });
    return response.status(201).json({ goal, demo: true, message: 'Demo savings goal saved. No payment was requested.' });
  } catch (error) {
    return next(error);
  }
});

app.use('/api', (_request, response) => response.status(404).json({ error: 'API route not found.' }));

const webBuild = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(webBuild)) {
  app.use(express.static(webBuild));
  app.get('*', (_request, response) => response.sendFile(path.join(webBuild, 'index.html')));
}

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: 'The request could not be completed.' });
});

await initializeDatabase();
app.listen(port, () => console.log(`Ubepari API listening at http://localhost:${port}`));