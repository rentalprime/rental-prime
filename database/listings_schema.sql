-- Rental Prima Database Structure for Listings
-- This SQL script creates or modifies the listings table with category relationships
 -- First, ensure the categories table exists with parent_id support

CREATE TABLE IF NOT EXISTS categories
  (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                               name TEXT NOT NULL,
                                         description TEXT, image_url TEXT, status VARCHAR(20) NOT NULL DEFAULT 'active',
                                                                                                               created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                                                                                                                                       updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                                                                                                                                                                               parent_id UUID REFERENCES categories(id) ON DELETE
   SET NULL,
       slug TEXT UNIQUE);

-- Create indices for better performance

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);


CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);


CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Create or modify the listings table

CREATE TABLE IF NOT EXISTS listings (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                                                 title VARCHAR(255) NOT NULL,
                                                                                    description TEXT, price DECIMAL(12, 2) DEFAULT 0,
                                                                                                                                   category_id UUID REFERENCES categories(id) NOT NULL,
                                                                                                                                                                              subcategory_id UUID REFERENCES categories(id), -- This refers to a category that is a child of category_id
 location VARCHAR(255),
          status VARCHAR(20) DEFAULT 'active',
                                     user_id UUID REFERENCES auth.users(id) NOT NULL,
                                                                            featured BOOLEAN DEFAULT false,
                                                                                                     images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs/paths
 attributes JSONB DEFAULT '{}'::jsonb, -- Flexible schema for custom attributes
 created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                                             updated_at TIMESTAMP WITH TIME ZONE DEFAULT now());

-- Create indices for better query performance

CREATE INDEX IF NOT EXISTS idx_listings_category_id ON listings(category_id);


CREATE INDEX IF NOT EXISTS idx_listings_subcategory_id ON listings(subcategory_id);


CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);


CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);


CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(featured);


CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);


CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at);

-- Add a trigger to update the updated_at timestamp whenever a listing is modified

CREATE OR REPLACE FUNCTION update_listings_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_update_listings_timestamp
BEFORE
UPDATE ON listings
FOR EACH ROW EXECUTE PROCEDURE update_listings_updated_at();

-- Create a function to count listings by category

CREATE OR REPLACE FUNCTION count_listings_by_category(category_uuid UUID) RETURNS INTEGER AS $$
DECLARE
  listing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO listing_count
  FROM listings
  WHERE category_id = category_uuid OR subcategory_id = category_uuid;

  RETURN listing_count;
END;
$$ LANGUAGE plpgsql;

-- Create a view for listings with their categories and subcategories

CREATE OR REPLACE VIEW vw_listings_with_categories AS
SELECT l.id,
       l.title,
       l.description,
       l.price,
       l.status,
       l.featured,
       l.created_at,
       l.updated_at,
       l.user_id,
       l.category_id,
       c.name AS category_name,
       l.subcategory_id,
       sc.name AS subcategory_name,
       l.location,
       l.images,
       l.attributes
FROM listings l
LEFT JOIN categories c ON l.category_id = c.id
LEFT JOIN categories sc ON l.subcategory_id = sc.id;

-- Add RLS policies for listings

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Policy for administrators - full access

CREATE POLICY admin_all_access ON listings TO authenticated USING (EXISTS
                                                                     (SELECT 1
                                                                      FROM user_roles ur
                                                                      WHERE ur.user_id = auth.uid()
                                                                        AND ur.role = 'admin' ));

-- Policy for users to view all active listings

CREATE POLICY view_active_listings ON listings
FOR
SELECT TO authenticated,
          anon USING (status = 'active');

-- Policy for users to manage their own listings

CREATE POLICY users_manage_own_listings ON listings USING (user_id = auth.uid());

COMMENT ON TABLE listings IS 'Rental listings with category and subcategory relationships';

