-- Add missing columns to quotes table for enhanced quote intake
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS insured_item TEXT,
ADD COLUMN IF NOT EXISTS insured_description TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS risk_details TEXT,
ADD COLUMN IF NOT EXISTS coverage_requirements TEXT;