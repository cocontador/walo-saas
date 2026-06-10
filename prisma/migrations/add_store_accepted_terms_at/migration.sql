-- Add acceptedTermsAt to Store for tracking legal acceptance timestamps
ALTER TABLE "Store" ADD COLUMN "acceptedTermsAt" timestamp(3);
