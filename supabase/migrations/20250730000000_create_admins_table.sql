-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can view all admin records" ON admins
  FOR SELECT USING (auth.uid() IN (SELECT id FROM admins));

CREATE POLICY "Admins can insert admin records" ON admins
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM admins));

CREATE POLICY "Admins can update admin records" ON admins
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM admins));

CREATE POLICY "Admins can delete admin records" ON admins
  FOR DELETE USING (auth.uid() IN (SELECT id FROM admins));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 