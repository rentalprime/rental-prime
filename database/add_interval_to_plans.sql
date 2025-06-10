-- Migration: Add interval column to plans table
-- This migration adds the interval column to support different billing periods
 -- Add the interval column with default value and constraint

ALTER TABLE public.plans ADD COLUMN interval TEXT NOT NULL DEFAULT 'monthly',
                                                                   ADD CONSTRAINT interval_check CHECK (interval IN ('monthly',
                                                                                                                     'quarterly',
                                                                                                                     'half-yearly',
                                                                                                                     'yearly'));

-- Update existing plans to have monthly interval (if any exist)

UPDATE public.plans
SET interval = 'monthly'
WHERE interval IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN public.plans.interval IS 'Billing interval for the plan: monthly, quarterly, half-yearly, or yearly';

-- Verify the changes

SELECT column_name,
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns
WHERE table_name = 'plans'
  AND table_schema = 'public'
ORDER BY ordinal_position;

