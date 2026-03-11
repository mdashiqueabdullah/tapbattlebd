-- Drop old phone verification trigger and function
DROP TRIGGER IF EXISTS on_phone_verified ON public.profiles;
DROP FUNCTION IF EXISTS public.complete_referral_on_phone_verify() CASCADE;