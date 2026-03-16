
-- Fix incorrect referral points: recalculate based on actual completed referrals
UPDATE public.profiles p
SET referral_points = (
  SELECT COALESCE(COUNT(*) * 5000, 0)
  FROM public.referrals r
  WHERE r.referrer_user_id = p.id AND r.status = 'completed'
)
WHERE referral_points > 0;
