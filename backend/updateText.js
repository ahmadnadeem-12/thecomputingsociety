require('dotenv').config();
const mongoose = require('mongoose');
const HomeContent = require('./models/HomeContent');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/the-computing-society').then(async () => {
    try {
        const content = await HomeContent.findOne();
        if (content) {
            const notice = content.notices.find(n => n.title === 'Tickets Open');
            if (notice) {
                notice.title = 'Get Tickets';
                await content.save();
                console.log('Database updated successfully: Tickets Open -> Get Tickets');
            } else {
                console.log('Notice not found or already updated.');
            }
        } else {
            console.log('Home content not found in DB.');
        }
    } catch(err) {
        console.error(err);
    }
    process.exit();
});
