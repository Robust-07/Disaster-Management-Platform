require('dotenv').config();
const connectDB = require("./config/db.js");
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');


connectDB();
const User = require("./models/user.js");
const sosReport = require("./models/report.js");


const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use('/api/auth', require('./routes/authroutes.js'));
app.use('/api/sos', require('./routes/sosroutes.js'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});









const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
