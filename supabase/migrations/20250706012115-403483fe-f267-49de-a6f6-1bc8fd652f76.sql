-- Update insurers to belong to the current user's organization
UPDATE public.insurers 
SET organization_id = '960d58d9-8329-4850-b377-08cf06b6574f'
WHERE organization_id != '960d58d9-8329-4850-b377-08cf06b6574f';