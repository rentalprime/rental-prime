-- Add parent_id field to categories table
ALTER TABLE public.categories 
ADD COLUMN parent_id UUID REFERENCES public.categories(id);

-- Index for performance
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

-- Comment on table
COMMENT ON COLUMN public.categories.parent_id IS 'Reference to parent category for hierarchical category structure';
