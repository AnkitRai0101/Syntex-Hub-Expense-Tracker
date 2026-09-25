const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load env vars locally from config.env.
// On Vercel, this file won't exist — set the same variables
// in Project Settings -> Environment Variables instead.
dotenv.config({ path: './config/config.env' });

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const transactions = require('./routes/transactions');
app.use('/api/v1/transactions', transactions);

// Only serve the React build if it's actually been built and included
// in the deployment. If this is an API-only deploy, leave this out.
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

// Connect to the DB, and only start listening once it succeeds.
// This also means a failed DB connection shows up clearly in logs
// instead of crashing the whole function silently.
connectDB()
  .then(() => {
    if (require.main === module) {
      // Only call app.listen when running locally (node server.js).
      // On Vercel, the platform invokes the exported app directly.
      app.listen(
        PORT,
        console.log(
          `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
        )
      );
    }
  })
  .catch((err) => {
    console.error('Failed to connect to database:'.red.bold, err.message);
    process.exit(1);
  });

module.exports = app;
