/*
  # Add Consent Tracking Columns to Inquiry Tables

  ## Overview
  This migration adds dual-consent compliance tracking to all inquiry forms on the website.
  This enables proper GDPR/privacy law compliance by tracking both mandatory privacy consent
  and optional marketing consent separately.

  ## Changes Made

  ### 1. Property Inquiries Table
  - Adds `privacy_consent` boolean column (NOT NULL, DEFAULT false)
  - Adds `marketing_consent` boolean column (NOT NULL, DEFAULT false)
  - Privacy consent tracks acceptance of Privacy Policy (mandatory for submission)
  - Marketing consent tracks opt-in for newsletters and property updates (optional)

  ### 2. Contact Inquiries Table
  - Adds `privacy_consent` boolean column (NOT NULL, DEFAULT false)
  - Adds `marketing_consent` boolean column (NOT NULL, DEFAULT false)
  - Same dual-consent structure as property inquiries

  ### 3. Seller Inquiries Table
  - Adds `privacy_consent` boolean column (NOT NULL, DEFAULT false)
  - Adds `marketing_consent` boolean column (NOT NULL, DEFAULT false)
  - Tracks consent for sellers listing their properties

  ### 4. Seller Inquiry Emails Table
  - Adds `privacy_consent` boolean column (NOT NULL, DEFAULT false)
  - Adds `marketing_consent` boolean column (NOT NULL, DEFAULT false)
  - Maintains consent tracking in email records

  ## Compliance Notes
  - Privacy consent is mandatory (enforced at UI level) - tracks acceptance of Privacy Policy
  - Marketing consent is optional - tracks permission to send promotional communications
  - Both consent values are stored for audit trail and legal compliance
  - Existing records will have false defaults (grandfathered in with implied consent)
  - Future submissions will explicitly capture user consent choices
*/

-- ============================================================================
-- 1. ADD CONSENT COLUMNS TO PROPERTY_INQUIRIES
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_inquiries' AND column_name = 'privacy_consent'
  ) THEN
    ALTER TABLE property_inquiries 
    ADD COLUMN privacy_consent boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_inquiries' AND column_name = 'marketing_consent'
  ) THEN
    ALTER TABLE property_inquiries 
    ADD COLUMN marketing_consent boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- ============================================================================
-- 2. ADD CONSENT COLUMNS TO CONTACT_INQUIRIES
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_inquiries' AND column_name = 'privacy_consent'
  ) THEN
    ALTER TABLE contact_inquiries 
    ADD COLUMN privacy_consent boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_inquiries' AND column_name = 'marketing_consent'
  ) THEN
    ALTER TABLE contact_inquiries 
    ADD COLUMN marketing_consent boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- ============================================================================
-- 3. ADD CONSENT COLUMNS TO SELLER_INQUIRIES
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_inquiries' AND column_name = 'privacy_consent'
  ) THEN
    ALTER TABLE seller_inquiries 
    ADD COLUMN privacy_consent boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_inquiries' AND column_name = 'marketing_consent'
  ) THEN
    ALTER TABLE seller_inquiries 
    ADD COLUMN marketing_consent boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- ============================================================================
-- 4. ADD CONSENT COLUMNS TO SELLER_INQUIRY_EMAILS
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_inquiry_emails' AND column_name = 'privacy_consent'
  ) THEN
    ALTER TABLE seller_inquiry_emails 
    ADD COLUMN privacy_consent boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_inquiry_emails' AND column_name = 'marketing_consent'
  ) THEN
    ALTER TABLE seller_inquiry_emails 
    ADD COLUMN marketing_consent boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- ============================================================================
-- 5. CREATE INDEXES FOR CONSENT QUERIES
-- ============================================================================

-- Index for finding users who opted into marketing
CREATE INDEX IF NOT EXISTS idx_property_inquiries_marketing_consent 
ON property_inquiries(marketing_consent) WHERE marketing_consent = true;

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_marketing_consent 
ON contact_inquiries(marketing_consent) WHERE marketing_consent = true;

CREATE INDEX IF NOT EXISTS idx_seller_inquiries_marketing_consent 
ON seller_inquiries(marketing_consent) WHERE marketing_consent = true;

-- ============================================================================
-- 6. ADD HELPFUL COMMENTS
-- ============================================================================

COMMENT ON COLUMN property_inquiries.privacy_consent IS 'User accepted Privacy Policy (mandatory)';
COMMENT ON COLUMN property_inquiries.marketing_consent IS 'User opted into marketing communications (optional)';

COMMENT ON COLUMN contact_inquiries.privacy_consent IS 'User accepted Privacy Policy (mandatory)';
COMMENT ON COLUMN contact_inquiries.marketing_consent IS 'User opted into marketing communications (optional)';

COMMENT ON COLUMN seller_inquiries.privacy_consent IS 'User accepted Privacy Policy (mandatory)';
COMMENT ON COLUMN seller_inquiries.marketing_consent IS 'User opted into marketing communications (optional)';

COMMENT ON COLUMN seller_inquiry_emails.privacy_consent IS 'User accepted Privacy Policy (mandatory)';
COMMENT ON COLUMN seller_inquiry_emails.marketing_consent IS 'User opted into marketing communications (optional)';
