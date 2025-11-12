# Database Setup Instructions

## ⚠️ IMPORTANT: Run This SQL Migration First

The fees and announcements features require database tables that don't exist yet. Follow these steps:

### Steps:

1. **Go to the Cloud Tab** in Lovable (left sidebar)

2. **Click "Open in Supabase"** to access your database

3. **Go to SQL Editor** (in the left sidebar of Supabase)

4. **Copy the entire contents** of the file `DATABASE_MIGRATION_ANNOUNCEMENTS_FEES_FIXED.sql`

5. **Paste into the SQL Editor** and click "Run"

6. **Wait for success message** - you should see confirmation that tables were created

7. **Return to Lovable** - the TypeScript errors will automatically resolve once the tables exist

### What This Migration Creates:

- ✅ `announcements` table - for class announcements
- ✅ `fee_structures` table - stores total fees per class per year
- ✅ `fee_payments` table - tracks student payments
- ✅ `student_fee_summary` view - automatically calculates paid/pending amounts
- ✅ Proper RLS policies for security

### Changes Made to Fees Page:

✅ **Removed** fee type selection (tuition, exam, etc.)
✅ **Simplified** to single total fee amount per class/year
✅ **Payment form** now asks for class first, then shows students from that class
✅ **Student summary** automatically reflects when fees are added or payments recorded
✅ **Paid/Pending amounts** update in real-time

### After Running Migration:

The app will work perfectly - all dropdowns will populate and data will flow correctly!
