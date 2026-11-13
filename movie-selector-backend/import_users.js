const admin = require('firebase-admin');
const sqlite3 = require('sqlite3');
const path = require('path');

admin.initializeApp({
    credential: admin.credential.cert(require('./serviceAccountKey.json')),
});

const db = new sqlite3.Database(path.join(__dirname, 'movies.db'));

const sql = `INSERT INTO users (firebase_uid, email, display_name)
                VALUES (?, ?, ?)
                ON CONFLICT(firebase_uid) DO UPDATE SET
                    email = excluded.email,
                    display_name = excluded.display_name`;

async function fillUsers(){
    let pageToken;
    let total = 0;
    do {
        const result = await admin.auth().listUsers(1000, pageToken);
        for (const u of result.users){
            await new Promise((res, rej) =>
            db.run(sql, [u.uid, u.email || null, u.displayName || null],
                (err) => (err ? rej(err) : resolve()))
            );
            total++;
        }
        pageToken = result.pageToken;
    } while(pageToken);
    console.log(`Synced ${total} users`);
    db.close();
}

fillUsers().catch(console.error);