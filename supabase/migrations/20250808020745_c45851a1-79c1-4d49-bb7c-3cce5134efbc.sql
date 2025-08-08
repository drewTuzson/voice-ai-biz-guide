-- Create storage bucket for audio responses
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-responses', 'audio-responses', false);

-- Create policies for audio uploads
CREATE POLICY "Users can upload their own audio responses" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'audio-responses' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own audio responses" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'audio-responses' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audio responses" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'audio-responses' AND auth.uid()::text = (storage.foldername(name))[1]);