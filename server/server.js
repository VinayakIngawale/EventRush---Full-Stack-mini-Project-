const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Allows cross-origin requests (from your frontend)
app.use(express.json()); // Allows parsing of JSON in request bodies

// server.js

// ... other require statements
require('dotenv').config();



// ... app.use statements

// Add this line to debug
console.log('My MONGO_URI is:', process.env.MONGO_URI); 

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { // This is line 13 from the error
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

//... rest of the file

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));

// --- This is a placeholder to add some default events if the database is empty ---
const Event = require('./models/Event');
const seedDatabase = async () => {
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
        console.log('No events found, seeding database...');
        const events = [
             { title: 'City Marathon 2025', sport: 'Running', description: 'Annual city-wide marathon for all skill levels.', date: new Date('2025-10-26T07:00:00Z'), location: 'Pune Downtown', imageUrl: 'https://unsplash.com/photos/people-watching-padova-marathon-during-daytime-x5GcXFvJJhI' },
             { title: 'Community Football Cup', sport: 'Football', description: 'A friendly 5-a-side football tournament.', date: new Date('2025-11-02T10:00:00Z'), location: 'Khadki Football Ground', imageUrl: 'https://unsplash.com/photos/a-group-of-men-posing-for-a-photo-NzV3tv7qXgc' },
             { title: 'Open Badminton Championship', sport: 'Badminton', description: 'Open entry badminton championship.', date: new Date('2025-11-15T09:00:00Z'), location: 'Shivaji Sports Complex', imageUrl: 'https://unsplash.com/photos/badminton-players-compete-in-a-competitive-match-f16jLNyap7I' }
        ];
        await Event.insertMany(events);
    }
};
seedDatabase();
// ---------------------------------------------------------------------------------


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));