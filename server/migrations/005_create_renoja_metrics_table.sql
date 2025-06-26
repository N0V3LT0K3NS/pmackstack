-- Migration: Create Renoja weekly metrics table
-- This table stores Renoja-specific metrics that are completely different from Kilwins

-- Create the main Renoja metrics table
CREATE TABLE IF NOT EXISTS renoja_weekly_metrics (
  id SERIAL PRIMARY KEY,
  store_code TEXT REFERENCES pos_stores(store_code),
  fiscal_year INT NOT NULL CHECK (fiscal_year >= 2020 AND fiscal_year <= 2050),
  week_number INT NOT NULL CHECK (week_number >= 1 AND week_number <= 53),
  week_ending DATE NOT NULL,
  
  -- Weekly Actionables
  digital_posts INT DEFAULT 0 CHECK (digital_posts >= 0),
  new_google_reviews INT DEFAULT 0 CHECK (new_google_reviews >= 0),
  total_google_reviews INT DEFAULT 0 CHECK (total_google_reviews >= 0),
  new_partnerships INT DEFAULT 0 CHECK (new_partnerships >= 0),
  events_in_studio INT DEFAULT 0 CHECK (events_in_studio >= 0),
  events_outside_studio INT DEFAULT 0 CHECK (events_outside_studio >= 0),
  
  -- Measured Results
  new_members_signed INT DEFAULT 0 CHECK (new_members_signed >= 0),
  total_paying_members INT NOT NULL CHECK (total_paying_members >= 0),
  members_lost INT DEFAULT 0 CHECK (members_lost >= 0),
  avg_member_rate NUMERIC(10,2) DEFAULT 0 CHECK (avg_member_rate >= 0),
  
  -- Calculated fields (stored for performance)
  net_member_change INT GENERATED ALWAYS AS (new_members_signed - members_lost) STORED,
  total_events INT GENERATED ALWAYS AS (events_in_studio + events_outside_studio) STORED,
  review_growth_rate NUMERIC(5,2),
  member_retention_rate NUMERIC(5,2),
  
  -- Metadata
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure unique entries per store per week
  UNIQUE(store_code, fiscal_year, week_number),
  UNIQUE(store_code, week_ending)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_renoja_weekly_store_week ON renoja_weekly_metrics(store_code, week_ending);
CREATE INDEX IF NOT EXISTS idx_renoja_weekly_created ON renoja_weekly_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_renoja_weekly_fiscal ON renoja_weekly_metrics(fiscal_year, week_number);
CREATE INDEX IF NOT EXISTS idx_renoja_weekly_members ON renoja_weekly_metrics(store_code, total_paying_members);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_renoja_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_renoja_metrics_updated_at
  BEFORE UPDATE ON renoja_weekly_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_renoja_metrics_updated_at();

-- Add comments for documentation
COMMENT ON TABLE renoja_weekly_metrics IS 'Weekly metrics specific to Renoja wellness studios focusing on membership and engagement';
COMMENT ON COLUMN renoja_weekly_metrics.digital_posts IS 'Number of social media posts made during the week';
COMMENT ON COLUMN renoja_weekly_metrics.new_google_reviews IS 'Number of new Google reviews received during the week';
COMMENT ON COLUMN renoja_weekly_metrics.total_google_reviews IS 'Running total of all Google reviews';
COMMENT ON COLUMN renoja_weekly_metrics.new_partnerships IS 'Number of new business partnerships established';
COMMENT ON COLUMN renoja_weekly_metrics.events_in_studio IS 'Number of events held in the studio';
COMMENT ON COLUMN renoja_weekly_metrics.events_outside_studio IS 'Number of events held outside the studio';
COMMENT ON COLUMN renoja_weekly_metrics.new_members_signed IS 'Number of new members who signed up';
COMMENT ON COLUMN renoja_weekly_metrics.total_paying_members IS 'Total active paying members at week end';
COMMENT ON COLUMN renoja_weekly_metrics.members_lost IS 'Number of members who cancelled or churned';
COMMENT ON COLUMN renoja_weekly_metrics.avg_member_rate IS 'Average monthly membership rate';
COMMENT ON COLUMN renoja_weekly_metrics.net_member_change IS 'Calculated: new_members_signed - members_lost';
COMMENT ON COLUMN renoja_weekly_metrics.total_events IS 'Calculated: events_in_studio + events_outside_studio';
COMMENT ON COLUMN renoja_weekly_metrics.review_growth_rate IS 'Percentage growth in reviews week-over-week';
COMMENT ON COLUMN renoja_weekly_metrics.member_retention_rate IS 'Percentage of members retained from previous week'; 