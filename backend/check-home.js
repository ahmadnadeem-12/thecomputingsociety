const mongoose = require('mongoose');
require('dotenv').config();
const HomeContent = require('./models/HomeContent');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const content = await HomeContent.findOne().lean();
        console.log('--- Current Home Content ---');
        console.log(JSON.stringify(content, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
