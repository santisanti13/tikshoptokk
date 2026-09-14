CREATE POLICY "Users manage own product images" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'ugc-products' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'ugc-products' AND (storage.foldername(name))[1] = auth.uid()::text);