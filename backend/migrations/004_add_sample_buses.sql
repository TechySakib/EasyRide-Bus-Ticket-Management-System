-- Add sample buses to the easyride_buses table
-- This migration adds 10 sample buses with different types and statuses

INSERT INTO easyride_buses (bus_number, bus_type, capacity, manufacturer, registration_date, maintenance_due_date, status)
VALUES
    ('BUS-001', 'standard', 40, 'Tata Motors', '2022-01-15', '2025-01-15', 'active'),
    ('BUS-002', 'standard', 40, 'Tata Motors', '2022-02-20', '2025-02-20', 'active'),
    ('BUS-003', 'express', 35, 'Ashok Leyland', '2022-03-10', '2025-03-10', 'active'),
    ('BUS-004', 'express', 35, 'Ashok Leyland', '2022-04-05', '2025-04-05', 'active'),
    ('BUS-005', 'deluxe', 30, 'Volvo', '2023-01-20', '2025-06-20', 'active'),
    ('BUS-006', 'deluxe', 30, 'Volvo', '2023-02-15', '2025-07-15', 'active'),
    ('BUS-007', 'standard', 45, 'Tata Motors', '2021-11-10', '2025-01-10', 'active'),
    ('BUS-008', 'express', 35, 'Mercedes-Benz', '2023-05-01', '2025-08-01', 'active'),
    ('BUS-009', 'standard', 40, 'Ashok Leyland', '2021-09-15', '2024-12-15', 'maintenance'),
    ('BUS-010', 'deluxe', 28, 'Scania', '2023-07-20', '2025-10-20', 'active')
ON CONFLICT (bus_number) DO NOTHING;
