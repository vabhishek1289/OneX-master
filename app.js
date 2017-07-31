const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');


//Connection to database
mongoose.connect(config.database);

// on connection
mongoose.connection.on('connected',() => {
    console.log('Connection established to the database:: '+config.database);
});

// on Error
mongoose.connection.on('error',(err) => {
    console.log('Database Error :: '+err);
});


const app = express();

//requiring routes users
const users = require('./routes/users');

// PORT number
const port = 3010;

//using public static folder where whole angular app will reside
app.use(express.static(path.join(__dirname,'public')));

// Using cors middleware for request from other domains
app.use(cors());

//using body Parser
app.use(bodyParser.json());

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

//routes
app.use('/users',users);

// Getting index route
app.get('/', (req, res) => {
    res.send('Invalid Request');
});


// Starting server
app.listen(port, () => {
    console.log('server started on port '+port);
});