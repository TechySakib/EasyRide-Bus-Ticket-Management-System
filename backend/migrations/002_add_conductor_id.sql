ALTER TABLE easyride_bus_assignments 
ADD COLUMN IF NOT EXISTS conductor_id UUID REFERENCES easyride_users(id);
