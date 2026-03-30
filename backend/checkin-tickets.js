// Check-in script: find tickets and mark all as checkedIn
const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Load both models so populate works
    require('./models/Event');
    const Ticket = require('./models/Ticket');

    // Find all tickets
    const tickets = await Ticket.find({}).populate('eventId').lean();
    console.log(`\nFound ${tickets.length} ticket(s):\n`);

    tickets.forEach((t, i) => {
        console.log(`${i + 1}. ${t.name} | AG: ${t.agNo} | Event: ${t.eventId?.title || t.eventId} | CheckedIn: ${t.checkedIn}`);
    });

    if (tickets.length === 0) {
        console.log('\nNo tickets found. You need to create a ticket first from the Tickets page.');
    } else {
        // Mark ALL tickets as checked in
        const result = await Ticket.updateMany({}, { $set: { checkedIn: true } });
        console.log(`\n✅ Updated ${result.modifiedCount} ticket(s) to checkedIn: true`);
    }

    await mongoose.disconnect();
    console.log('\nDone!');
}

main().catch(err => { console.error(err); process.exit(1); });
