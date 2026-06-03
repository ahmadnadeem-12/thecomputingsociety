const { MongoClient } = require('mongodb');

// Connection URIs
const ONLINE_URI = 'mongodb://ahmadnadeem12413_db_user:ahmad123@ac-ktlkpji-shard-00-00.kb6ugju.mongodb.net:27017/tcs_database?ssl=true&authSource=admin';
const LOCAL_URI = 'mongodb://localhost:27017/tcs_database';

async function sync() {
    let onlineClient, localClient;
    try {
        console.log('🔄 Connecting to ONLINE MongoDB (Read-Only)...');
        onlineClient = new MongoClient(ONLINE_URI);
        await onlineClient.connect();
        const onlineDb = onlineClient.db();
        console.log('✅ Connected to ONLINE MongoDB.');

        console.log('🔄 Connecting to LOCAL MongoDB...');
        localClient = new MongoClient(LOCAL_URI);
        await localClient.connect();
        const localDb = localClient.db();
        console.log('✅ Connected to LOCAL MongoDB.');

        // Get all collections from online DB
        const collections = await onlineDb.listCollections().toArray();
        console.log(`📁 Found ${collections.length} collections online.`);

        for (const colInfo of collections) {
            const colName = colInfo.name;
            // Skip system collections if any
            if (colName.startsWith('system.')) continue;

            console.log(`\n⏳ Syncing collection: "${colName}"...`);
            
            // Read from online document-by-document using cursor
            const docs = [];
            const cursor = onlineDb.collection(colName).find({});
            
            let count = 0;
            while (await cursor.hasNext()) {
                const doc = await cursor.next();
                docs.push(doc);
                count++;
                // Print progress, especially for large documents
                const docIdentifier = doc.title || doc.name || doc.email || doc._id;
                console.log(`   📖 [${count}] Fetched document: "${docIdentifier}"`);
            }

            // Drop local collection to avoid duplicates
            try {
                await localDb.collection(colName).drop();
                console.log(`   🗑️ Dropped existing local collection "${colName}".`);
            } catch (err) {
                // Collection might not exist locally, ignore this error
                if (err.codeName !== 'NamespaceNotFound') {
                    console.log(`   ⚠️ Note: ${err.message}`);
                }
            }

            // Insert into local
            if (docs.length > 0) {
                console.log(`   ✍️ Inserting ${docs.length} documents into local collection "${colName}"...`);
                const insertResult = await localDb.collection(colName).insertMany(docs);
                console.log(`   ✅ Inserted ${insertResult.insertedCount} documents successfully.`);
            } else {
                console.log(`   ℹ️ Collection was empty, created empty local collection.`);
                // Create empty collection locally
                await localDb.createCollection(colName);
            }
        }

        console.log('\n🎉 Database synchronization complete! Online data has been successfully copied to local.');
    } catch (error) {
        console.error('❌ Error during synchronization:', error);
    } finally {
        if (onlineClient) {
            await onlineClient.close();
            console.log('🔌 Closed connection to online database.');
        }
        if (localClient) {
            await localClient.close();
            console.log('🔌 Closed connection to local database.');
        }
    }
}

sync();
