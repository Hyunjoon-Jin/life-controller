const { createClient } = require('@supabase/supabase-js');

// Values from .env.local
const SUPABASE_URL = 'https://eyckmlteaidaudljfhfb.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5Y2ttbHRlYWlkYXVkbGpmaGZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDc3MDM0OCwiZXhwIjoyMDg2MzQ2MzQ4fQ.fFQmt9GGc_zxP6gmrIEIUs20azWPRgcrxD8d9nx1los';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function confirmUser() {
    const email = 'jhj980912@naver.com';
    console.log(`Searching for user: ${email}...`);

    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const user = listData.users.find(u => u.email === email);

    if (!user) {
        console.log('❌ User NOT FOUND.');
        return;
    }

    console.log(`✅ User FOUND. ID: ${user.id}`);
    console.log(`   Current Status: ${user.email_confirmed_at ? 'CONFIRMED' : 'UNCONFIRMED'}`);

    if (!user.email_confirmed_at) {
        console.log('⚡ Attempting to manually confirm email...');
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
            user.id,
            { email_confirm: true }
        );

        if (updateError) {
            console.error('❌ Failed to confirm email:', updateError);
        } else {
            console.log('✅ Email successfully CONFIRMED! User can now login.');
        }
    } else {
        console.log('ℹ️ Email is already confirmed.');
    }
}

confirmUser();
