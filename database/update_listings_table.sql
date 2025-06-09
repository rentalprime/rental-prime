-- Update listings table to match the UI form fields
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS condition TEXT,
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS price_period TEXT DEFAULT 'day',
ADD COLUMN IF NOT EXISTS deposit NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_duration INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS available_from TIMESTAMP,
ADD COLUMN IF NOT EXISTS available_to TIMESTAMP,
ADD COLUMN IF NOT EXISTS delivery BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shipping NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS video TEXT,
ADD COLUMN IF NOT EXISTS rental_terms TEXT,
ADD COLUMN IF NOT EXISTS accept_deposit BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cancellation TEXT DEFAULT 'flexible',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comment to explain the table structure
COMMENT ON TABLE listings IS 'Rental listings with detailed product information';
