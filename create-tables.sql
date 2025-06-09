-- Enable UUID extension if not already enabled

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist

DROP TABLE IF EXISTS public.support;


DROP TABLE IF EXISTS public.notifications;


DROP TABLE IF EXISTS public.payments;


DROP TABLE IF EXISTS public.listings;


DROP TABLE IF EXISTS public.plans;


DROP TABLE IF EXISTS public.settings;


DROP TABLE IF EXISTS public.categories;


DROP TABLE IF EXISTS public.users;


DROP TABLE IF EXISTS public.roles;

-- Create roles table

CREATE TABLE public.roles ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                                        name TEXT UNIQUE NOT NULL,
                                                                         description TEXT, permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
                                                                                                                              is_system_role BOOLEAN NOT NULL DEFAULT false,
                                                                                                                                                                      status TEXT NOT NULL DEFAULT 'active',
                                                                                                                                                                                                   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                                                                                                                                                                                                               updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);

-- Create users table

CREATE TABLE public.users ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                                        name TEXT NOT NULL,
                                                                  email TEXT UNIQUE NOT NULL,
                                                                                    password TEXT NOT NULL,
                                                                                                  user_type TEXT NOT NULL CHECK (user_type IN ('super_admin',
                                                                                                                                               'owner',
                                                                                                                                               'customer')), role_id UUID NOT NULL REFERENCES public.roles(id),
                                                                                                                                                                                              status TEXT NOT NULL DEFAULT 'active',
                                                                                                                                                                                                                           created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                                                                                                                                                                                                                                       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);

-- Create categories table

CREATE TABLE public.categories ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                                             name TEXT NOT NULL,
                                                                       description TEXT, image_url TEXT, status TEXT NOT NULL DEFAULT 'active',
                                                                                                                                      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                                                                                                                                                  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);

-- Create listings table

CREATE TABLE public.listings ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                                           user_id UUID REFERENCES public.users(id),
                                                                                   category_id UUID REFERENCES public.categories(id),
                                                                                                               title TEXT NOT NULL,
                                                                                                                          description TEXT, price DECIMAL(10,2) NOT NULL,
                                                                                                                                                                location TEXT, is_featured BOOLEAN DEFAULT false,
                                                                                                                                                                                                           status TEXT NOT NULL DEFAULT 'active',
                                                                                                                                                                                                                                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                                                                                                                                                                                                                                                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);

-- Create payments table

CREATE TABLE public.payments ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                                           user_id UUID REFERENCES public.users(id),
                                                                                   listing_id UUID REFERENCES public.listings(id),
                                                                                                              amount DECIMAL(10,2) NOT NULL,
                                                                                                                                   payment_method TEXT, status TEXT NOT NULL DEFAULT 'pending',
                                                                                                                                                                                     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                                                                                                                                                                                                 updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);

-- Create plans table

CREATE TABLE public.plans ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                                        name TEXT NOT NULL,
                                                                  description TEXT, price DECIMAL(10,2) NOT NULL,
                                                                                                        features JSONB,
                                                                                                        status TEXT NOT NULL DEFAULT 'active',
                                                                                                                                     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                                                                                                                                                 updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);

-- Create settings table

CREATE TABLE public.settings ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                                           key TEXT UNIQUE NOT NULL,
                                                                           value TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                                                                                                   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);

-- Create notifications table

CREATE TABLE public.notifications ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                                                user_id UUID REFERENCES public.users(id),
                                                                                        title TEXT NOT NULL,
                                                                                                   message TEXT, status TEXT NOT NULL DEFAULT 'unread',
                                                                                                                                              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                                                                                                                                                          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);

-- Create support table

CREATE TABLE public.support ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                                          user_id UUID REFERENCES public.users(id),
                                                                                  subject TEXT NOT NULL,
                                                                                               message TEXT, status TEXT NOT NULL DEFAULT 'open',
                                                                                                                                          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                                                                                                                                                      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);

-- Insert initial roles

INSERT INTO public.roles (name, description, permissions, is_system_role, status)
VALUES ('admin',
        'Administrator with full access',
        '{"all": true}'::jsonb,
        true,
        'active'), ('customer',
                    'Regular customer with limited access',
                    '{"listings": {"read": true}, "categories": {"read": true}}'::jsonb,
                    true,
                    'active'), ('manager',
                                'Manager with moderate access',
                                '{"users": {"read": true}, "listings": {"read": true, "create": true, "update": true}, "categories": {"read": true}}'::jsonb,
                                false,
                                'active');

-- Get role IDs
DO $$
DECLARE
    admin_role_id UUID;
    customer_role_id UUID;
BEGIN
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
    SELECT id INTO customer_role_id FROM public.roles WHERE name = 'customer';

    -- Insert initial super admin user
    INSERT INTO public.users (name, email, password, user_type, role_id, status)
    VALUES ('Super Admin', 'admin@rentalprimasuperadmin.com', 'hashed_password_here', 'super_admin', admin_role_id, 'active');

    -- Insert sample owner user
    INSERT INTO public.users (name, email, password, user_type, role_id, status)
    VALUES ('Property Owner', 'owner@example.com', 'hashed_password_here', 'owner', admin_role_id, 'active');

    -- Insert sample customer user
    INSERT INTO public.users (name, email, password, user_type, role_id, status)
    VALUES ('Regular Customer', 'customer@example.com', 'hashed_password_here', 'customer', customer_role_id, 'active');
END $$;

-- Insert sample categories

INSERT INTO public.categories (name, description, status)
VALUES ('Apartments',
        'Apartment rentals including flats and condos',
        'active'), ('Houses',
                    'Full house rentals including villas and cottages',
                    'active'), ('Commercial',
                                'Commercial properties for business use',
                                'active');

-- Insert sample settings

INSERT INTO public.settings (key, value)
VALUES ('site_name',
        'Rental Prima');

