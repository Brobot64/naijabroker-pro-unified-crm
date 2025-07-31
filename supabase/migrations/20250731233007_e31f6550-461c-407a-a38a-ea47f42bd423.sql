-- Fix Tayo Kupoluyi's SuperAdmin access
-- First, let's find the user and update their role
WITH user_info AS (
  SELECT id 
  FROM auth.users 
  WHERE email = 'tayokupoluyi@gmail.com'
  LIMIT 1
)
UPDATE user_roles 
SET role = 'SuperAdmin'
FROM user_info
WHERE user_roles.user_id = user_info.id;