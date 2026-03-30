require("dotenv").config();
const mongoose = require("mongoose");

const testConnection = async () => {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connection successful!");
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log("\n--- COLLECTION AUDIT ---");
        for (const c of collections) {
            const count = await db.collection(c.name).countDocuments();
            console.log(`| ${c.name.padEnd(20)} | ${count.toString().padStart(5)} docs |`);
        }
        console.log("------------------------\n");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Connection failed!");
        console.error(error);
        process.exit(1);
    }
};

testConnection();
