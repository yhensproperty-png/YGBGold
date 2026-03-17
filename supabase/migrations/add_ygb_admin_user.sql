-- ============================================================
-- Add new admin user: ygbgoldbuysell@gmail.com
-- ============================================================

DO $$
DECLARE
  new_user_id uuid;
  existing_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO existing_id FROM auth.users WHERE email = 'ygbgoldbuysell@gmail.com';

  IF existing_id IS NULL THEN
    new_user_id := gen_random_uuid();

    -- Create the auth user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'ygbgoldbuysell@gmail.com',
      crypt('MARCH2015@', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"],"role":"admin"}',
      '{"display_name":"YGB Admin"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    -- Create the identity record
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      new_user_id,
      'ygbgoldbuysell@gmail.com',
      json_build_object('sub', new_user_id::text, 'email', 'ygbgoldbuysell@gmail.com'),
      'email',
      NOW(),
      NOW(),
      NOW()
    );

    -- Create the profile with admin role
    INSERT INTO profiles (id, email, display_name, role, login_enabled)
    VALUES (new_user_id, 'ygbgoldbuysell@gmail.com', 'YGB Admin', 'admin', true);

    RAISE NOTICE 'Admin user created successfully with id: %', new_user_id;

  ELSE
    -- User exists, just ensure they have admin role
    INSERT INTO profiles (id, email, display_name, role, login_enabled)
    VALUES (existing_id, 'ygbgoldbuysell@gmail.com', 'YGB Admin', 'admin', true)
    ON CONFLICT (id) DO UPDATE SET role = 'admin', login_enabled = true;

    RAISE NOTICE 'Admin profile updated for existing user: %', existing_id;
  END IF;
END $$;
