const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db/index.js'); 

const app = express();

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

try {
  require('./config')(app);
} catch (e) {}

const indexRoutes = require('./routes/index.routes.js'); 
const authRoutes  = require('./routes/auth.routes.js');  

app.use('/api', indexRoutes);
app.use('/auth', authRoutes);

try {
  require('./error-handling')(app);
} catch (e) {}

module.exports = app;
