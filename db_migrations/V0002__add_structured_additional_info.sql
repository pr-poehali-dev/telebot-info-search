-- Add additional_info JSONB column for structured extra data
ALTER TABLE phone_records 
ADD COLUMN IF NOT EXISTS additional_info JSONB DEFAULT '[]'::jsonb;

-- Update existing records to convert info to additional_info format
UPDATE phone_records 
SET additional_info = jsonb_build_array(
  jsonb_build_object(
    'label', 'Информация',
    'value', info
  )
)
WHERE info IS NOT NULL AND info != '' AND additional_info = '[]'::jsonb;

-- Create index for JSONB column
CREATE INDEX IF NOT EXISTS idx_phone_records_additional_info ON phone_records USING GIN (additional_info);

-- Add comment
COMMENT ON COLUMN phone_records.additional_info IS 'Structured additional information as array of {label, value} objects';
