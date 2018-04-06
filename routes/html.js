const express = require('express');
const router = express.Router();
const Author = require('./../models/author');
const Quote = require('./../models/quote');

router.get('/', function (req, resp, next) {
    Author.find({}).lean().exec(
        (err, authors) => {
            if (err) {
                console.log(err);
            }
            // redirect if error
            resp.render('index', { title: 'Welcome', authors: authors });
        }
    );
});

router.get('/author/:lastName/:firstName', function (req, resp, next) {
    let firstNamePattern = new RegExp(req.params.firstName, 'i');
    let lastNamePattern = new RegExp(req.params.lastName, 'i');
    Author.findOne({ first_name: firstNamePattern, last_name: lastNamePattern }).lean().exec(
        (err, author) => {
            if (err) {
                console.log(err);
                resp.redirect('/');
            } else {
                if (author) {
                    resp.render('author', { title: author.first_name + author.last_name, author: author });
                } else {
                    resp.render('author', { title: 'Author not found' });
                }
            }
        }
    )
});

router.get('/quote/:id', (req, resp, next) => {
    let id = req.params.id;
    Quote.findOne({ id: id }).lean().exec((err, quote) => {
        if (err) {
            console.log(err);
            resp.redirect('/');
        } else {
            if (quote) {
                if (quote.author_id) {
                    Author.findOne({ _id: quote.author_id }).lean().exec((err2, author) => {
                        if (err2) {
                            console.log(err2);
                            resp.redirect('/');
                        } else {
                            if (author) {
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

router.get('/author/new', (req, resp, next) => {
    resp.render('author-create', { title: 'Add an author' });
});

router.post('/author/new', (req, resp, next) => {
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
            if (err) {
                console.log(err);
            } else {
                if (author) {
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
                        if (err) {
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

module.exports = router;