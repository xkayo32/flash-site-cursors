-- Add image blob support to courses table
-- This migration adds a thumbnail_blob column to store images directly in the database

-- Add the thumbnail_blob column to store image data
ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_blob BYTEA;

-- Add metadata columns for the image
ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_mime_type VARCHAR(50);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_size INTEGER;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_filename VARCHAR(255);

-- Add constraint to limit mime types to common image formats
ALTER TABLE courses ADD CONSTRAINT check_thumbnail_mime_type 
CHECK (thumbnail_mime_type IS NULL OR thumbnail_mime_type IN (
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
));

-- Add constraint to limit file size to 5MB (5 * 1024 * 1024 bytes)
ALTER TABLE courses ADD CONSTRAINT check_thumbnail_size
CHECK (thumbnail_size IS NULL OR thumbnail_size <= 5242880);

-- Create an index on courses without images for faster queries
CREATE INDEX idx_courses_no_thumbnail ON courses(id) WHERE thumbnail_blob IS NULL;

-- Comment on new columns
COMMENT ON COLUMN courses.thumbnail_blob IS 'Binary data of the course thumbnail image';
COMMENT ON COLUMN courses.thumbnail_mime_type IS 'MIME type of the thumbnail image';
COMMENT ON COLUMN courses.thumbnail_size IS 'Size of the thumbnail image in bytes';
COMMENT ON COLUMN courses.thumbnail_filename IS 'Original filename of the uploaded image';