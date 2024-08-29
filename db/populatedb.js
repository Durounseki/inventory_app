const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
    connectionString: process.env.LOCAL_DB_URL,
});

const createEventsTable = `
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                description JSONB,
                venue JSONB NOT NULL,
                date DATE NOT NULL,
                sns JSONB[] NOT NULL,
                flyer JSONB NOT NULL
            );
        `;
const populateEvents = `
            INSERT INTO events (name, description, venue, date, sns, flyer)
            VALUES (
                'Salsa Bachata Temptation Singapore',
                '{
                    "headline": "Experience the energy of Asia''s hottest Latin dance festival!",
                    "body": "Get ready to learn from world-class instructors, witness incredible performances, and party all night long with the best dancers in Asia and renowned DJs.",
                    "cta": "Don''t miss out on this unforgettable experience!"
                }',
                '{
                    "name": "MAX Atria Garnet",
                    "url": "https://www.google.com/maps/place/Singapore+EXPO+Meeting+Rooms/@1.3332953,103.9567683,15z/data=!4m6!3m5!1s0x31da3d29b4a86847:0x62aaab711af2fcdf!8m2!3d1.3332953!4d103.9567683!16s%2Fg%2F11btww6m0q?entry=ttu"
                }', 
                '2024-08-09',
                ARRAY[
                    '{"name": "website", "url": "https://salsabachatatemptation.com/", "faClass": "fa-solid fa-globe"}',
                    '{"name": "facebook", "url": "https://www.facebook.com/SBTS2023", "faClass": "fa-brands fa-square-facebook"}',
                    '{"name": "instagram", "url": "https://www.instagram.com/Salsabachatatemptationsg/", "faClass": "fa-brands fa-instagram"}',
                    '{"name": "youtube", "url": "https://www.youtube.com/channel/UCnFxI6FMl4lAxA1UmY6d2ng", "faClass": "fa-brands fa-youtube"}'
                ]::jsonb[],
                '{
                    "src": "../public/images/sbts.png",
                    "alt": "SBTS"
                }'
            );
        `;
const createArtistsTable = `
            CREATE TABLE IF NOT EXISTS artists (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                nationality VARCHAR(255),
                bio TEXT,
                sns JSONB[],
                picture TEXT
            );
        `;
const populateArtists = `
            INSERT INTO artists (name, nationality, bio, sns, picture)
            VALUES (
                'Francisco Watanabe', 
                'Peru',
                'A passionate bachata dancer whose dedication to his craft is evident in his precise footwork and expressive movements. His infectious energy and natural musicality make him a joy to watch on the dance floor.',
                ARRAY[
                    '{"name": "instagram", "url": "https://www.instagram.com/watanabefran?igsh=dHNncG4wd3V4MnBm", "faClass": "fa-brands fa-instagram"}'
                ]::jsonb[],
                ''
            ),
            (
                'Lacey Gerdes', 
                'USA',
                'A graceful bachatera with a captivating blend of musicality and technique. Her passion for movement shines through in every dance, creating an unforgettable connection with her partner and the music.',
                ARRAY[
                    '{"name": "instagram", "url": "https://www.instagram.com/laceychan?igsh=MXBxYjZnYTQ2NHB4eA==", "faClass": "fa-brands fa-instagram"}'
                ]::jsonb[],
                ''
            ),
            (
                'Alonso Oliva', 
                'Spain',
                'With a masterful command of bachata technique and a deep appreciation for the music''s nuances, he leads with confidence and grace. His connection with his partner is seamless, creating a captivating dance experience.',
                ARRAY[
                    '{"name": "instagram", "url": "https://www.instagram.com/alonso.bachata?igsh=MWx6bWVnb2gyemo1MA==", "faClass": "fa-brands fa-instagram"}'
                ]::jsonb[],
                ''
            ),
            (
                'Noelia Otero', 
                'Spain',
                'With an infectious energy and a deep understanding of bachata''s rhythms, she brings life to the dance floor. Her fluid movements and precise technique create a mesmerizing experience for all who watch.',
                ARRAY[
                    '{"name": "instagram", "url": "https://www.instagram.com/noeliaoterobs?igsh=MWF6YzBoY2Q3aDlvcg==", "faClass": "fa-brands fa-instagram"}'
                ]::jsonb[],
                ''
            ),
            (
                'Gabriella Crist', 
                'Spain',
                'A talented bachata dancer whose love for the music is evident in every step. Her dedication to honing her craft shines through in her flawless technique and captivating connection with her partner.',
                ARRAY[
                    '{"name": "instagram", "url": "https://www.instagram.com/_gabriellacrist?igsh=aWs0NXJ0dnhvNDQx", "faClass": "fa-brands fa-instagram"}'
                ]::jsonb[],
                ''
            ),
            (
                'Cristian Garcia', 
                'Spain',
                'A charismatic bachatero with a powerful presence on the dance floor. His dynamic energy and impeccable musicality create an electrifying atmosphere, drawing everyone into the rhythm.',
                ARRAY[
                    '{"name": "instagram", "url": "https://www.instagram.com/cristiaangaarcia?igsh=Y3Rzd3BmMnFvb3R6", "faClass": "fa-brands fa-instagram"}'
                ]::jsonb[],
                ''
            );

        `;
const createDJsTable = `
            CREATE TABLE IF NOT EXISTS djs (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                nationality VARCHAR(255),
                bio TEXT,
                sns JSONB[],
                picture TEXT
            );
        `;
const populateDJs = `
            INSERT INTO djs (name, nationality, bio, sns, picture)
            VALUES (
                'DJ Husky', 
                'Spain', 
                'A master of bachata beats, electrifies the dance floor with his infectious energy and seamless mixes. His deep understanding of the genre''s rhythms and his ability to read the crowd create an unforgettable experience, leaving everyone wanting more.', 
                ARRAY[
                    '{"name": "instagram", "url": "https://www.instagram.com/djhuskybachata?igsh=MTBuandvdm5obm11Mg==", "faClass": "fa-brands fa-instagram"}'
                ]::jsonb[],
                ''
            ),
            (
                'DJ Mami', 
                'Japan', 
                'An emerging talent in the bachata scene, this DJ captivates with her carefully curated selections and intuitive transitions. Her passion for the music shines through in every set, creating an atmosphere of pure joy and connection on the dance floor.', 
                ARRAY[
                    '{"name": "instagram", "url": "https://www.instagram.com/mamitadaka?igsh=MWw0ZWFnc2kzZTV1ag==", "faClass": "fa-brands fa-instagram"}'
                ]::jsonb[],
                ''
            );
        `;
const createEventsArtistRelation = `
            CREATE TABLE IF NOT EXISTS event_artists (
                event_id INT REFERENCES events(id),
                artist_id INT REFERENCES artists(id),
                PRIMARY KEY (event_id, artist_id)
            );

        `;
const relateEventsArtists = `
            INSERT INTO event_artists (event_id, artist_id)
            VALUES (1, 1), (1,2), (1,5), (1,6); 
        `;
const createEventsDJsRelation = `
            CREATE TABLE IF NOT EXISTS event_djs (
                event_id INT REFERENCES events(id),
                dj_id INT REFERENCES djs(id),
                PRIMARY KEY (event_id, dj_id)
            );
        `;
const relateEventsDJs = `
            INSERT INTO event_djs (event_id, dj_id)
            VALUES (1, 1); 
        `;
const createArtistsRelation = `
            CREATE TABLE IF NOT EXISTS artist_partnerships (
                artist1_id INT REFERENCES artists(id),
                artist2_id INT REFERENCES artists(id),
                PRIMARY KEY (artist1_id, artist2_id)
            );
        `;
const relateArtists = `
            INSERT INTO artist_partnerships (artist1_id, artist2_id)
            VALUES (1, 2),(3,4),(5,6); 
        `;

async function createAndPopulateTables() {
    try {
        
        await client.connect();
        console.log('Connected to the database');
        console.log('Seeding...');
        // Create tables (same as before, but included here for completeness)
        await client.query(createEventsTable);
        await client.query(createArtistsTable);
        await client.query(createDJsTable);
        await client.query(createEventsArtistRelation);
        await client.query(createEventsDJsRelation);
        await client.query(createArtistsRelation);

        // Populate tables with sample data
        await client.query(populateEvents);

        await client.query(populateArtists);

        await client.query(populateDJs);

        //Add relationships
        await client.query(relateEventsArtists);

        await client.query(relateEventsDJs);

        // Add artist partnerships
        await client.query(relateArtists);

    } catch (err) {
        console.error('Error creating or populating tables:', err);
    } finally {
        console.log('done');
        await client.end();
        console.log('Disconnected from the database');
    }
}

createAndPopulateTables();