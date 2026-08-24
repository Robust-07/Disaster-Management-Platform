require('dotenv').config();
const connectDB = require("./config/db.js");
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

connectDB();

const User = require("./models/user.js");
const sosReport = require("./models/report.js");
const Resource = require('./models/Resource.js');


const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));


// Routes
app.use('/api/auth', require('./routes/authroutes.js'));
app.use('/api/sos', require('./routes/sosroutes.js'));
app.use('/api/rescue', require('./routes/rescueroutes.js'));
app.use('/api/shelter', require('./routes/shelterroutes.js'));
app.use('/api/riskzones', require('./routes/riskzoneroutes.js'));
app.use('/api/resource', require('./routes/resourceroutes.js'));


// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'server is running'
  });
});


const PORT = process.env.PORT;

app.listen(PORT, (req,res)=>{
  consol
})
