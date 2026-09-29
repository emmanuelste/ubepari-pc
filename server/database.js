import fs from 'node:fs/promises';
import path from 'node:path';
import initSqlJs from 'sql.js';

const products = [
  { id: 'macbook-pro-m4', name: 'MacBook Pro 14” M4', brand: 'Apple', category: 'workstation', price: 5400000, monthly: 450000, tag: 'Creator pick', details: 'M4 · 16GB unified memory · 512GB SSD · Liquid Retina XDR', image: 'photo-1517336714731-489689fd1ca8', accent: 'mint' },
  { id: 'macbook-air-m3', name: 'MacBook Air 13” M3', brand: 'Apple', category: 'everyday', price: 3700000, monthly: 310000, tag: 'Light & ready', details: 'M3 · 16GB unified memory · 256GB SSD · 18-hour battery', image: 'photo-1496181133206-80ce9b88a853', accent: 'blue' },
  { id: 'hp-spectre-x360', name: 'HP Spectre x360 14', brand: 'HP', category: 'everyday', price: 4100000, monthly: 340000, tag: '2-in-1 OLED', details: 'Core Ultra 7 · 16GB RAM · 1TB SSD · OLED touchscreen', image: 'photo-1588872657578-7efd1f1555ed', accent: 'gold' },
  { id: 'hp-omen-16', name: 'HP Omen 16', brand: 'HP', category: 'gaming', price: 3950000, monthly: 330000, tag: 'RTX 4060', details: 'Ryzen 7 · RTX 4060 · 32GB RAM · 165Hz QHD display', image: 'photo-1593642632823-8f785ba67e45', accent: 'coral' },
  { id: 'dell-xps-15', name: 'Dell XPS 15 OLED', brand: 'Dell', category: 'workstation', price: 4800000, monthly: 400000, tag: 'Studio grade', details: 'Core i7 · RTX 4060 · 32GB RAM · 3.5K OLED display', image: 'photo-1593642634367-d91a135587b5', accent: 'blue' },
  { id: 'alienware-m16', name: 'Alienware m16 R2', brand: 'Dell', category: 'gaming', price: 5100000, monthly: 425000, tag: '240Hz ready', details: 'Core Ultra 9 · RTX 4070 · 32GB RAM · QHD+ 240Hz', image: 'photo-1593642634443-44adaa06623a', accent: 'coral' },
  { id: 'legion-pro-5', name: 'Lenovo Legion Pro 5', brand: 'Lenovo', category: 'gaming', price: 4450000, monthly: 370000, tag: 'Built to play', details: 'Ryzen 7 · RTX 4070 · 32GB RAM · 240Hz display', image: 'photo-1603302576837-37561b2e2302', accent: 'gold' },
  { id: 'thinkpad-x1', name: 'ThinkPad X1 Carbon Gen 12', brand: 'Lenovo', category: 'workstation', price: 4680000, monthly: 390000, tag: 'Work anywhere', details: 'Core Ultra 7 · 32GB RAM · 1TB SSD · 1.09kg', image: 'photo-1588872657578-7efd1f1555ed', accent: 'mint' },
  { id: 'rog-strix-g16', name: 'ASUS ROG Strix G16', brand: 'ASUS', category: 'gaming', price: 4200000, monthly: 350000, tag: 'Gaming rig', details: 'Core i9 · RTX 4070 · 32GB DDR5 · 240Hz QHD', image: 'photo-1593642632823-8f785ba67e45', accent: 'coral' },
  { id: 'zenbook-pro-duo', name: 'Zenbook Pro 14 Duo OLED', brand: 'ASUS', category: 'workstation', price: 4950000, monthly: 410000, tag: 'Dual-screen', details: 'Core i9 · RTX 4060 · 32GB RAM · dual OLED touchscreens', image: 'photo-1525547719571-a2d4ac8945e2', accent: 'blue' },
];

const dataDirectory = path.resolve(process.cwd(), 'data');
const databasePath = path.resolve(process.cwd(), process.env.DATABASE_PATH || './data/ubepari.sqlite');
let database;

function saveDatabase() {
  return fs.writeFile(databasePath, Buffer.from(database.export()));
}

export async function initializeDatabase() {
  await fs.mkdir(dataDirectory, { recursive: true });
  await fs.mkdir(path.dirname(databasePath), { recursive: true });
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
  });
  try {
    const file = await fs.readFile(databasePath);
    database = new SQL.Database(new Uint8Array(file));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    database = new SQL.Database();
  }

  database.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, brand TEXT NOT NULL,
      category TEXT NOT NULL, price INTEGER NOT NULL, monthly INTEGER NOT NULL,
      tag TEXT NOT NULL, details TEXT NOT NULL, image TEXT NOT NULL, accent TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT, product_id TEXT NOT NULL,
      product_name TEXT NOT NULL, target_amount INTEGER NOT NULL,
      target_months INTEGER NOT NULL, monthly_amount INTEGER NOT NULL,
      provider TEXT NOT NULL, phone TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const count = database.exec('SELECT COUNT(*) AS total FROM products')[0]?.values[0][0] ?? 0;
  if (!count) {
    const insert = database.prepare('INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const product of products) insert.run(Object.values(product));
    insert.free();
  }
  await saveDatabase();
}

function rows(statement, values = []) {
  const query = database.prepare(statement);
  query.bind(values);
  const results = [];
  while (query.step()) results.push(query.getAsObject());
  query.free();
  return results;
}

export function listProducts({ brand, category, search } = {}) {
  const filters = [];
  const values = [];
  if (brand && brand !== 'all') { filters.push('brand = ?'); values.push(brand); }
  if (category && category !== 'all') { filters.push('category = ?'); values.push(category); }
  if (search) {
    filters.push('(LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(details) LIKE ?)');
    const term = `%${search.toLowerCase()}%`;
    values.push(term, term, term);
  }
  return rows(`SELECT * FROM products ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''} ORDER BY price`, values);
}

export function getProduct(id) {
  return rows('SELECT * FROM products WHERE id = ?', [id])[0] || null;
}

export async function createGoal({ product, months, provider, phone }) {
  const monthly = Math.ceil(product.price / months);
  database.run(
    'INSERT INTO goals (product_id, product_name, target_amount, target_months, monthly_amount, provider, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [product.id, product.name, product.price, months, monthly, provider, phone],
  );
  const goal = rows('SELECT * FROM goals WHERE id = last_insert_rowid()')[0];
  await saveDatabase();
  return goal;
}

export function listGoals() {
  return rows('SELECT * FROM goals ORDER BY created_at DESC, id DESC');
}