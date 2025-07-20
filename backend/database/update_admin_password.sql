-- Update admin password
-- New password: AdminEstudos@2024
UPDATE users 
SET password_hash = '$argon2id$v=19$m=65536,t=4,p=3$ekxSWnBodndWejNQemRiag$NiM5dJBBf1dsNu7BOAlkxKiv8+0A6gQAtbXR+sfWj58',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@estudos.com';