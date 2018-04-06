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
app.get('/', function(req, resp, next){
    Author.find({}).lean().exec(
        (err, authors) => {
            if(err) {
                console.log(err);
            }
            // redirect if error
            resp.render('index', { title: 'Welcome', authors: authors });
        }
    );
});

app.get('/author/:lastName/:firstName', function(req, resp, next){
    let firstNamePattern = new RegExp(req.params.firstName, 'i');
    let lastNamePattern = new RegExp(req.params.lastName, 'i');
    Author.findOne({ first_name: firstNamePattern, last_name: lastNamePattern }).lean().exec(
        (err, author) => {
            if (err) {
                console.log(err);
                resp.redirect('/');
            } else {
                if(author) {
                    resp.render('author', { title: author.first_name + author.last_name, author: author });
                } else {
                    resp.render('author', { title: 'Author not found' });
                }
            }
        }
    )
});

app.get('/quote/:id', (req, resp, next) => {
    let id = req.params.id;
    Quote.findOne({ id: id}).lean().exec((err, quote) => {
        if(err) {
            console.log(err);
            resp.redirect('/');
        } else {
            if(quote) {
                if(quote.author_id) {
                    Author.findOne({ _id : quote.author_id }).lean().exec((err2, author) => {
                        if(err2) {
                            console.log(err2);
                            resp.redirect('/');
                        } else {
                            if(author) {
                                resp.render('quote', { title: 'Quote ' + id, quote: quote, author: author });
                            } else {
                                resp.render('quote', { title: 'Quote ' + id, quote: quote });
                            }
                        }
                    });
                } else {
                    resp.render('quote', { title: 'Quote ' + id, quote: quote });
                }
            } else {
                resp.render('quote', { title: 'Quote not found' });
            }
        }
    });
});

app.get('/author/new', (req, resp, next) => {
    resp.render('author-create', {title: 'Add an author'});
});

app.post('/author/new', (req, resp, next) => {
    let firstName = req.body.first_name.trim();
    let lastName = req.body.last_name.trim();
    let yearOfBirth = req.body.year_of_birth.trim();
    let yearOfDeath = req.body.year_of_death.trim();
    // console.log(first_name, last_name, year_of_birth, year_of_death);

    //check if exists
    let firstNamePattern = new RegExp(firstName, 'i');
    let lastNamePattern = new RegExp(lastName, 'i');
    let yearOfBirthPattern = new RegExp(yearOfBirth, 'i');
    let yearOfBirthDeathPattern = new RegExp(yearOfDeath, 'i');
    Author.findOne({
            first_name: firstNamePattern,
            last_name: lastNamePattern,
            year_of_birth: yearOfBirthPattern,
        }, {
            first_name: firstNamePattern,
            last_name: lastNamePattern,
            year_of_death: yearOfBirthDeathPattern
        }, (err, author) => {
        if(err) {
            console.log(err);
        } else {
            if(author) {
                let msg = 'Author exists already.';
                console.log(msg);
                resp.render('author-create', {
                    warning: msg,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    year_of_birth: req.body.year_of_birth,
                    year_of_death: req.body.year_of_death
                });
            } else {
                console.log('creating user');
                //create new author
                let newAuthor = new Author({
                    first_name: firstName,
                    last_name: lastName,
                    year_of_birth: yearOfBirth,
                    year_of_death: yearOfDeath
                });
                newAuthor.save((err) => {
                    if(err) {
                        console.log(err);
                        //render error page
                        resp.render('author-create', {
                            error: err,
                            first_name: req.body.first_name,
                            last_name: req.body.last_name,
                            year_of_birth: req.body.year_of_birth,
                            year_of_death: req.body.year_of_death
                        });
                    } else {
                        resp.render('author-create', {
                            success: 'New author added to the database'
                        });
                    }
                });
            }
        }
    });
});

module.exports = app;