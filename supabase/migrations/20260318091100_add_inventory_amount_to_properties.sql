ALTER TABLE properties ADD COLUMN IF NOT EXISTS inventory_amount INTEGER DEFAULT 1;

COMMENT ON COLUMN properties.inventory_amount IS 'Internal inventory tracking for gold items';
