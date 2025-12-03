-- Add conductor_id to easyride_bus_assignments
ALTER TABLE easyride_bus_assignments 
ADD COLUMN conductor_id BIGINT REFERENCES easyride_users(id);

-- Optional: Add an index for performance
CREATE INDEX idx_bus_assignments_conductor ON easyride_bus_assignments(conductor_id);
