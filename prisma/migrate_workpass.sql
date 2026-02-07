-- Clear existing WorkerProfiles that have old enum values
-- This is safe in development to allow schema change
DELETE FROM "WorkerProfile";
