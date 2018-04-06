const express = require('express');
const router = express.Router();
const Author = require('./../models/author');
const Quote = require('./../models/quote');

function formatAuthor(author) {
    return {
        firstName: author.first_name,
        lastName: author.last_name,
        dob: author.year_of_birth,
        dod: author.year_of_death
    }
}

function formatQuote(quote) {
    return {
        id: quote.id,
        text: quote.text
    }
}

router.get('/', (req, res) => {
    res.json({ connected: 1 });
});

router.get('/authors/', (req, res) => {
    Author.find({}).lean().exec(
        (err, authors) => {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            } else {
                let obj = {};
                obj.authors = authors.map(author => {return formatAuthor(author)});
                res.json(obj);
            }
        }
    );
});

router.get('/author/:lastName/:firstName', function (req, res, next) {
    let firstNamePattern = new RegExp(req.params.firstName, 'i');
    let lastNamePattern = new RegExp(req.params.lastName, 'i');
    Author.findOne({ first_name: firstNamePattern, last_name: lastNamePattern }).lean().exec(
        (err, author) => {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            } else {
                if (author) {
                    var obj = {};
                    obj.author = formatAuthor(author);
                    Quote.find({ author_id: author._id }).lean().exec((err, quotes) => {
                        console.log(quotes)
                        if(err) {
                            console.log(err);
                            res.sendStatus(500);
                        } else {
                            obj.quotes = quotes.map(quote => {return formatQuote(quote)});
                            res.json(obj);
                        }
                    });
                } else {
                    res.sendStatus(400);
                }
            }
        }
    )
});

router.get('/quote/:id', (req, res) => {
    let id = req.params.id;
    Quote.findOne({ id: id }).lean().exec((err, quote) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            if (quote) {
                if (quote.author_id) {
                    Author.findOne({ _id: quote.author_id }).lean().exec((err2, author) => {
                        if (err2) {
                            console.log(err2);
                            res.sendStatus(500);
                        } else {
                            if (author) {
                                res.json({quote: formatQuote(quote), author: formatAuthor(author)});
                            } else {
                                res.json({quote: formatQuote(quote)});
                            }
                        }
                    });
                } else {
                    res.json({quote: formatQuote(quote)});
                }
            } else {
                res.sendStatus(400);
            }
        }
    });
});

router.post('/author/new', (req, res) => {
    let firstName = req.body.first_name.trim();
    let lastName = req.body.last_name.trim();
    let yearOfBirth = req.body.year_of_birth.trim();
    let yearOfDeath = req.body.year_of_death.trim();

    //check if exists
    let firstNamePattern = new RegExp(firstName, 'i');
    let lastNamePattern = new RegExp(lastName, 'i');
    let yearOfBirthPattern = new RegExp(yearOfBirth, 'i');
    let yearOfBirthDeathPattern = new RegExp(yearOfDeath, 'i');
    Author.findOne({
        first_name: firstNamePattern,
        last_name: lastNamePattern,
        year_of_birth: yearOfBirthPattern,
    },
    {
        first_name: firstNamePattern,
        last_name: lastNamePattern,
        year_of_death: yearOfBirthDeathPattern
    }, (err, author) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            if (author) {
                res.json({ success: 0 })
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
                        res.sendStatus(500);
                    } else {
                        res.send({ success: 1 });
                    }
                });
            }
        }
    });
});

module.exports = router;