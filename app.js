const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db/index.js'); 

const app = express();

app.use(express.json());

app.use(cors({
  origin: [
    'https://symphonious-blini-abc03c.netlify.app',
    'http://localhost:5173'
  ],
  credentials: true,
}));

try {
  require('./config')(app);
} catch (e) {}

const indexRoutes = require('./routes/index.routes.js'); 
const authRoutes  = require('./routes/auth.routes.js');  
const eventsRoutes  = require('./routes/events.routes.js');  
const myEventsRoutes  = require('./routes/myEvents.routes.js');
const savedEventsRoutes  = require('./routes/savedEvents.routes.js');

app.use('/api', indexRoutes);
app.use('/auth', authRoutes);
app.use('/events', eventsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/my-events', myEventsRoutes);
app.use('/api/saved-events', savedEventsRoutes);

try {
  require('./error-handling')(app);
} catch (e) {}

module.exports = app;
