CREATE POLICY "Users can read their own ugc video files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'ugc-videos' AND (storage.foldername(name))[1] = auth.uid()::text);