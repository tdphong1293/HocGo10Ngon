import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGO_ROOT = process.env.MONGO_ROOT || 'root';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'password';
const SERVER_HOST = process.env.SERVER_HOST || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const MONGO_DB = process.env.MONGO_DB || 'hocgo10ngon';

const MONGO_URL = `mongodb://${MONGO_ROOT}:${MONGO_PASSWORD}@${SERVER_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

async function resetMongoDB() {
    try {
        console.log('Connecting to MongoDB:', MONGO_URL.replace(MONGO_PASSWORD, '****'));
        await mongoose.connect(MONGO_URL);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Failed to get database instance');
        }

        const collections = await db.listCollections().toArray();
        console.log(`Found ${collections.length} collections`);

        for (const collection of collections) {
            if (collection.name.startsWith('system.')) continue;

            try {
                await db.dropCollection(collection.name);
                console.log(`✓ Dropped collection: ${collection.name}`);
            } catch (err) {
                console.warn(`⚠ Failed to drop collection ${collection.name}:`, err);
            }
        }

        console.log('\n✓ MongoDB reset complete');
    } catch (error) {
        console.error('✗ MongoDB reset failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

resetMongoDB();