/*
  # Create admin user account

  Creates the initial admin user for Yhen's Property with:
  - Email: Yhensproperty@gmail.com
  - Role: admin
  - login_enabled: true
*/

DO $$
DECLARE
  new_user_id uuid;
  existing_id uuid;
BEGIN
  SELECT id INTO existing_id FROM auth.users WHERE email = 'Yhensproperty@gmail.com';

  IF existing_id IS NULL THEN
    new_user_id := gen_random_uuid();

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
      'Yhensproperty@gmail.com',
      crypt('Manila2026!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"display_name":"Yhen"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

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
      'Yhensproperty@gmail.com',
      json_build_object('sub', new_user_id::text, 'email', 'Yhensproperty@gmail.com'),
      'email',
      NOW(),
      NOW(),
      NOW()
    );

    INSERT INTO profiles (id, email, display_name, role, login_enabled)
    VALUES (new_user_id, 'Yhensproperty@gmail.com', 'Yhen', 'admin', true);
  ELSE
    INSERT INTO profiles (id, email, display_name, role, login_enabled)
    VALUES (existing_id, 'Yhensproperty@gmail.com', 'Yhen', 'admin', true)
    ON CONFLICT (id) DO UPDATE SET role = 'admin', login_enabled = true;
  END IF;
END $$;
