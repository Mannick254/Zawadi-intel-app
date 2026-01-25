import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_EMAIL = 'MANNICKOCHIENG@GMAIL.COM';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifyAdminRole() {
    try {
        const { data: { users }, error } = await supabase.auth.admin.listUsers();

        if (error) {
            throw new Error(`Failed to fetch users: ${error.message}`);
        }

        const user = users.find(u => u.email === USER_EMAIL);

        if (!user) {
            console.log(`User with email ${USER_EMAIL} was not found.`);
            return;
        }

        const isAdmin = user.app_metadata?.roles?.includes('admin');

        if (isAdmin) {
            console.log(`SUCCESS: The user ${USER_EMAIL} is correctly registered as an admin.`);
        } else {
            console.log(`FAILURE: The user ${USER_EMAIL} was found, but is NOT an admin.`);
            console.log('User app_metadata:', user.app_metadata);
        }

    } catch (e) {
        console.error('An unexpected error occurred:', e.message);
    }
}

verifyAdminRole();
