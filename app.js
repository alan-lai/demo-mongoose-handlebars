const connectionString = require('./connections/mongodb');
const path = require('path');
const express = require('express');

const exphbs = require('express-handlebars');
// const Pronto = require('vue-pronto');
// const expressVue = require('express-vue');
var helpers = require('handlebars-helpers')();

const Promise = require('bluebird');
const mongoose = require('mongoose');
mongoose.Promise = Promise;
mongoose.connect(connectionString);

const MongoClient = require('mongodb').MongoClient;

// var uri = "mongodb+srv://kay:myRealPassword@cluster0.mongodb.net/test";
// MongoClient.connect(uri, function (err, client) {
//     const collection = client.db("test").collection("devices");
//     // perform actions on the collection object
//     client.close();
// });

const db = mongoose.connection;

//add module for post
const bodyParser = require('body-parser');

//add routes
const apiRoute = require('./routes/api');
const htmlRoute = require('./routes/html');

//check for errors
db.on('error', (err) => {
    console.log(err);
});

//init connection to db
db.once('open', () => {
    console.log('Connection to database established.');    
});

//models
let Author = require('./models/author');
let Quote = require('./models/quote');

//set up app
const app = express();

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// to support JSON-encoded bodies
app.use(bodyParser.json());
// to support URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// const expressVueMiddleware = expressVue.init();
// app.use(expressVueMiddleware);

// defining middleware to serve static files
app.use('/static', express.static('public'));

app.listen(3000, () => {
    console.log('Listening to Port 3000');
});

//views
app.set('views', path.join(__dirname, 'views'));

//routes
app.use('/', htmlRoute);
app.use('/api', apiRoute);


module.exports = app;