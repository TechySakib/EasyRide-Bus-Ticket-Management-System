-- Change conductor_id to UUID to match Supabase Auth IDs
ALTER TABLE easyride_bus_assignments 
DROP COLUMN conductor_id;

ALTER TABLE easyride_bus_assignments 
ADD COLUMN conductor_id UUID REFERENCES auth.users(id);

-- Re-create index
CREATE INDEX idx_bus_assignments_conductor ON easyride_bus_assignments(conductor_id);
