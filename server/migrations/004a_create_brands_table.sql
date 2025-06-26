-- Migration: Create brands table
-- This table stores all brands in the multi-franchise system

CREATE TABLE IF NOT EXISTS brands (
  brand_id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add brand_id column to pos_stores if it doesn't exist
ALTER TABLE pos_stores 
ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brands(brand_id);

-- Insert initial brands
INSERT INTO brands (name) 
VALUES 
  ('Kilwins'),
  ('Renoja')
ON CONFLICT (name) DO NOTHING;

-- Update existing Kilwins stores to have the correct brand_id
UPDATE pos_stores 
SET brand_id = (SELECT brand_id FROM brands WHERE name = 'Kilwins')
WHERE store_code NOT LIKE 'ren%' AND brand_id IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_pos_stores_brand ON pos_stores(brand_id); 