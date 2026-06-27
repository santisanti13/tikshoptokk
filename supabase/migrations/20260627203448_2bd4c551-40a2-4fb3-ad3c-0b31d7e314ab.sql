
-- Revoke EXECUTE on SECURITY DEFINER functions from public/anon/authenticated
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;

-- Revoke all access to internal email tables from anon/authenticated so they
-- disappear from the public GraphQL schema. Only the service role (used by
-- edge functions) needs access.
REVOKE ALL ON TABLE public.email_send_log FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_send_state FROM anon, authenticated;
REVOKE ALL ON TABLE public.email_unsubscribe_tokens FROM anon, authenticated;
REVOKE ALL ON TABLE public.suppressed_emails FROM anon, authenticated;

GRANT ALL ON TABLE public.email_send_log TO service_role;
GRANT ALL ON TABLE public.email_send_state TO service_role;
GRANT ALL ON TABLE public.email_unsubscribe_tokens TO service_role;
GRANT ALL ON TABLE public.suppressed_emails TO service_role;
