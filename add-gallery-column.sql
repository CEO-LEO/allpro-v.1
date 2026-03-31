-- Add gallery column to products table
-- Stores array of image paths for multi-image product gallery
ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery TEXT[] DEFAULT '{}';
