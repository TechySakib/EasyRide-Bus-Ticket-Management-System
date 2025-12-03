-- Add attachment_url column to easyride_support_tickets table
ALTER TABLE easyride_support_tickets 
ADD COLUMN attachment_url TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'easyride_support_tickets' AND column_name = 'attachment_url';
