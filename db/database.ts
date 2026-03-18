import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.resolve(__dirname, 'halleyx.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS customer_orders (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName     TEXT NOT NULL,
    lastName      TEXT NOT NULL,
    email         TEXT NOT NULL,
    phone         TEXT NOT NULL,
    streetAddress TEXT NOT NULL,
    city          TEXT NOT NULL,
    stateProvince TEXT NOT NULL,
    postalCode    TEXT NOT NULL,
    country       TEXT NOT NULL,
    product       TEXT NOT NULL,
    quantity      INTEGER NOT NULL DEFAULT 1,
    unitPrice     REAL NOT NULL,
    totalAmount   REAL NOT NULL,
    status        TEXT NOT NULL DEFAULT 'Pending',
    createdBy     TEXT NOT NULL,
    createdAt     TEXT NOT NULL,
    updatedAt     TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title        TEXT NOT NULL DEFAULT 'Untitled',
    type         TEXT NOT NULL,
    description  TEXT,
    width        INTEGER NOT NULL,
    height       INTEGER NOT NULL,
    x            INTEGER DEFAULT 0,
    y            INTEGER DEFAULT 0,
    dataSettings TEXT NOT NULL DEFAULT '{}',
    styling      TEXT NOT NULL DEFAULT '{}',
    createdAt    TEXT NOT NULL,
    updatedAt    TEXT NOT NULL
  );
`);

console.log('✅ SQLite database initialised at', DB_PATH);

export default db;
