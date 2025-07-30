-- Create storage bucket for claim documents
INSERT INTO storage.buckets (id, name, public) VALUES ('claim-documents', 'claim-documents', true);

-- Create storage policies for claim documents
CREATE POLICY "Public can view claim documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'claim-documents');

CREATE POLICY "Authenticated users can upload claim documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'claim-documents');

CREATE POLICY "Users can update their organization's claim documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'claim-documents');

CREATE POLICY "Users can delete their organization's claim documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'claim-documents');