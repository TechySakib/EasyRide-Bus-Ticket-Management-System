-- Add location_id to easyride_bus_assignments
ALTER TABLE easyride_bus_assignments 
ADD COLUMN location_id BIGINT REFERENCES locations(id);

-- Make route_id nullable (since we are using location_id now)
ALTER TABLE easyride_bus_assignments 
ALTER COLUMN route_id DROP NOT NULL;
