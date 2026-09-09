-- ============================================================================
-- SEED DATA 
-- Default Password for sample users: 'Password123!'
-- ============================================================================

-- 1. Sample Users
-- Primary test user: demo@example.com / Password123!
-- Secondary test user: sarah.connor@example.com / Password123!
INSERT INTO users (id, name, email, password_hash)
VALUES
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Demo User',
    'demo@example.com',
    crypt('Password123!', gen_salt('bf', 10))
  ),
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Sarah Connor',
    'sarah.connor@example.com',
    crypt('Password123!', gen_salt('bf', 10))
  )
ON CONFLICT (email) DO NOTHING;

-- 2. Sample Appointments (Safe, Idempotent Inserts)
-- Demonstrates upcoming scheduled, completed, and cancelled statuses
INSERT INTO appointments (id, user_id, appointment_date, appointment_time, description, status)
SELECT 
  'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55'::uuid,
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
  CURRENT_DATE + INTERVAL '1 day',
  '09:30:00'::time,
  'Annual Health Consultation',
  'scheduled'::appointment_status
WHERE NOT EXISTS (
  SELECT 1 FROM appointments 
  WHERE id = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55' 
     OR (appointment_date = CURRENT_DATE + INTERVAL '1 day' AND appointment_time = '09:30:00' AND status = 'scheduled')
);

INSERT INTO appointments (id, user_id, appointment_date, appointment_time, description, status)
SELECT 
  'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a56'::uuid,
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
  CURRENT_DATE + INTERVAL '3 days',
  '14:30:00'::time,
  'Dental Checkup & Cleaning',
  'scheduled'::appointment_status
WHERE NOT EXISTS (
  SELECT 1 FROM appointments 
  WHERE id = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a56' 
     OR (appointment_date = CURRENT_DATE + INTERVAL '3 days' AND appointment_time = '14:30:00' AND status = 'scheduled')
);

INSERT INTO appointments (id, user_id, appointment_date, appointment_time, description, status)
SELECT 
  'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a57'::uuid,
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
  CURRENT_DATE - INTERVAL '7 days',
  '09:00:00'::time,
  'Initial Blood Test & General Checkup',
  'completed'::appointment_status
WHERE NOT EXISTS (
  SELECT 1 FROM appointments 
  WHERE id = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a57'
);

INSERT INTO appointments (id, user_id, appointment_date, appointment_time, description, status)
SELECT 
  'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a58'::uuid,
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
  CURRENT_DATE + INTERVAL '2 days',
  '16:00:00'::time,
  'Follow-up Eye Examination',
  'cancelled'::appointment_status
WHERE NOT EXISTS (
  SELECT 1 FROM appointments 
  WHERE id = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a58'
);

INSERT INTO appointments (id, user_id, appointment_date, appointment_time, description, status)
SELECT 
  'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a59'::uuid,
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::uuid,
  CURRENT_DATE + INTERVAL '1 day',
  '11:30:00'::time,
  'Physical Therapy Assessment',
  'scheduled'::appointment_status
WHERE NOT EXISTS (
  SELECT 1 FROM appointments 
  WHERE id = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a59' 
     OR (appointment_date = CURRENT_DATE + INTERVAL '1 day' AND appointment_time = '11:30:00' AND status = 'scheduled')
);

