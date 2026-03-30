// List users and reset password for testing
const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const User = require('./models/User');

    // List all users
    const users = await User.find({}).select('+password').lean();
    console.log(`\nFound ${users.length} user(s):\n`);
    users.forEach((u, i) => {
        console.log(`${i + 1}. Name: ${u.name} | Email: ${u.email} | Role: ${u.role}`);
    });

    // Reset password for the first user to "test1234"
    if (users.length > 0) {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(12);
        const hashed = await bcrypt.hash('test1234', salt);

        // Update all users to password "test1234"
        await User.updateMany({}, { $set: { password: hashed } });
        console.log('\n✅ All user passwords reset to: test1234');
    }

    await mongoose.disconnect();
    console.log('\nDone!');
}

main().catch(err => { console.error(err); process.exit(1); });
