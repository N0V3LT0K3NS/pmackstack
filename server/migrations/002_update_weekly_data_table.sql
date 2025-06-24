-- Add columns for tracking data entry
ALTER TABLE pos_weekly_data 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add additional calculated fields if they don't exist
ALTER TABLE pos_weekly_data 
ADD COLUMN IF NOT EXISTS sales_per_labor_hour DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS transactions_per_labor_hour DECIMAL(10,2);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pos_weekly_data_created_at ON pos_weekly_data(created_at);
CREATE INDEX IF NOT EXISTS idx_pos_weekly_data_created_by ON pos_weekly_data(created_by);

-- Update existing rows to calculate missing fields
UPDATE pos_weekly_data 
SET 
  sales_per_labor_hour = CASE 
    WHEN variable_hours > 0 THEN total_sales / variable_hours 
    ELSE 0 
  END,
  transactions_per_labor_hour = CASE 
    WHEN variable_hours > 0 THEN num_transactions / variable_hours 
    ELSE 0 
  END
WHERE sales_per_labor_hour IS NULL OR transactions_per_labor_hour IS NULL; 