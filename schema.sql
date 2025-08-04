CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  category_id TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  table_number TEXT NOT NULL,
  products TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'waiter',
  created_at TEXT NOT NULL
);

-- Sample data
INSERT INTO categories (id, name) VALUES
  ('1', 'Beer'),
  ('2', 'Alcohol'),
  ('3', 'Soda'),
  ('4', 'Water');

INSERT INTO products (id, name, price, category_id) VALUES
  ('1', 'Estrella Galicia', 2.5, '1'),
  ('2', 'Gin Tonic', 6.0, '2'),
  ('3', 'Water', 1.5, '4'),
  ('4', 'Coca Cola', 2.0, '3');
