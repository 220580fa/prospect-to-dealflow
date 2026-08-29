UPDATE public.whatsapp_connection_secrets
SET base_url = regexp_replace(base_url, '^http://2\.25\.120\.71(?=[:/]|$)', 'http://2-25-120-71.sslip.io')
WHERE base_url ~ '^http://2\.25\.120\.71(?=[:/]|$)';