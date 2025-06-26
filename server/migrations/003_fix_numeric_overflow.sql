-- Fix numeric field overflow issues
-- Increase precision for percentage fields and calculated ratios

-- Update percentage fields to allow values up to 999.9999% instead of 9.9999%
ALTER TABLE pos_weekly_data 
ALTER COLUMN variable_labor_percent TYPE NUMERIC(8,4),
ALTER COLUMN fixed_labor_percent TYPE NUMERIC(8,4),
ALTER COLUMN total_labor_percent TYPE NUMERIC(8,4),
ALTER COLUMN total_labor_percent_py TYPE NUMERIC(8,4);

-- Update delta percentage fields to handle larger ranges (-999.9999% to +999.9999%)
ALTER TABLE pos_weekly_data 
ALTER COLUMN delta_sales_percent TYPE NUMERIC(8,4),
ALTER COLUMN delta_hours_percent TYPE NUMERIC(8,4),
ALTER COLUMN delta_total_labor_percent TYPE NUMERIC(8,4);

-- Increase precision for sales and transactions per labor hour to handle edge cases
ALTER TABLE pos_weekly_data 
ALTER COLUMN sales_per_labor_hour TYPE NUMERIC(15,2),
ALTER COLUMN transactions_per_labor_hour TYPE NUMERIC(12,2);

-- Add comments to document the changes
COMMENT ON COLUMN pos_weekly_data.variable_labor_percent IS 'Variable labor as percentage of sales (NUMERIC(8,4) allows up to 9999.9999%)';
COMMENT ON COLUMN pos_weekly_data.fixed_labor_percent IS 'Fixed labor as percentage of sales (NUMERIC(8,4) allows up to 9999.9999%)';
COMMENT ON COLUMN pos_weekly_data.total_labor_percent IS 'Total labor as percentage of sales (NUMERIC(8,4) allows up to 9999.9999%)';
COMMENT ON COLUMN pos_weekly_data.sales_per_labor_hour IS 'Sales per labor hour (NUMERIC(15,2) allows up to 9,999,999,999,999.99)';
COMMENT ON COLUMN pos_weekly_data.transactions_per_labor_hour IS 'Transactions per labor hour (NUMERIC(12,2) allows up to 9,999,999,999.99)'; 