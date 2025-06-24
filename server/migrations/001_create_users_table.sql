-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('executive', 'bookkeeper', 'manager')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_store mapping table for managers
CREATE TABLE IF NOT EXISTS user_store (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  store_code TEXT REFERENCES pos_stores(store_code) ON DELETE CASCADE,
  can_write BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, store_code)
);

-- Create index for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_store_user_id ON user_store(user_id);

-- Insert test users with hashed passwords (password: "demo123")
-- $2b$10$kBc5qqr.y3A1Jh5jqnYtA.FLqWqaJqT8XBxjbT4hxQ/6.qKGcO0bC = bcrypt hash of "demo123"
INSERT INTO users (email, password_hash, full_name, role) VALUES
  ('exec@kilwins.com', '$2b$10$kBc5qqr.y3A1Jh5jqnYtA.FLqWqaJqT8XBxjbT4hxQ/6.qKGcO0bC', 'Executive User', 'executive'),
  ('bookkeeper@kilwins.com', '$2b$10$kBc5qqr.y3A1Jh5jqnYtA.FLqWqaJqT8XBxjbT4hxQ/6.qKGcO0bC', 'Bookkeeper User', 'bookkeeper'),
  ('manager1@kilwins.com', '$2b$10$kBc5qqr.y3A1Jh5jqnYtA.FLqWqaJqT8XBxjbT4hxQ/6.qKGcO0bC', 'Store Manager 1', 'manager'),
  ('manager2@kilwins.com', '$2b$10$kBc5qqr.y3A1Jh5jqnYtA.FLqWqaJqT8XBxjbT4hxQ/6.qKGcO0bC', 'Store Manager 2', 'manager');

-- Assign stores to managers
INSERT INTO user_store (user_id, store_code, can_write) VALUES
  ((SELECT id FROM users WHERE email = 'manager1@kilwins.com'), 'anna', true),
  ((SELECT id FROM users WHERE email = 'manager1@kilwins.com'), 'char', true),
  ((SELECT id FROM users WHERE email = 'manager2@kilwins.com'), 'fell', true),
  ((SELECT id FROM users WHERE email = 'manager2@kilwins.com'), 'vabe', true),
  ((SELECT id FROM users WHERE email = 'manager2@kilwins.com'), 'will', true); 