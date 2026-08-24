require('dotenv').config();
const express = require('express');
const connectDB = require("./config/db.js");
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


// Routes
app.use('/api/auth', require('./routes/authroutes.js'));
app.use('/api/sos', require('./routes/sosroutes.js'));
app.use('/api/rescue', require('./routes/rescueroutes.js'));
app.use('/api/shelters', require('./routes/shelterroutes.js'));
app.use('/api/risk-zones', require('./routes/riskzoneroutes.js'));
app.use('/api/resources', require('./routes/resourceroutes'));
app.use('/api/resource-requests', require('./routes/resourcerequestroutes'));
app.use('/api/volunteers', require('./routes/volunteerroutes'));
app.use('/api/campaigns', require('./routes/campaignroutes'));


const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
