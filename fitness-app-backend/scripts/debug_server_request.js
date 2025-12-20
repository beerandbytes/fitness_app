require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { db } = require('../db/db_config');
const { users } = require('../db/schema');

async function run() {
    try {
        console.log("Fetching a test user...");
        const userResult = await db.select().from(users).limit(1);
        const user = userResult[0];

        if (!user) { console.error("No user found in DB to generate token."); process.exit(1); }

        console.log(`Found user: ${user.email} (ID: ${user.user_id})`);

        const tokenPayload = {
            id: user.user_id,
            email: user.email,
            isAdmin: user.role === 'ADMIN',
            role: user.role
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);

        const port = process.env.PORT || 4000;
        const url = `http://localhost:${port}/api/exercises?page=1&limit=24`;

        console.log(`Requesting ${url}...`);

        try {
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Success! Status:", res.status);
            console.log("Data:", JSON.stringify(res.data).substring(0, 200) + "...");
        } catch (err) {
            if (err.response) {
                console.error("Server Error Status:", err.response.status);
                console.error("Server Error Data:", JSON.stringify(err.response.data, null, 2));
            } else {
                console.error("Network/Client Error:", err.message);
                if (err.code === 'ECONNREFUSED') {
                    console.error("Is the backend server running?");
                }
            }
        }
    } catch (e) {
        console.error("Script Error:", e);
    }
    process.exit(0);
}
run();
