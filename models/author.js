const mongoose = require('mongoose');
const quote = require('./quote');
const authorSchema = mongoose.Schema({
    first_name: String,
    last_name: String,
    year_of_birth: String,
    year_of_death: String
});

const Author = mongoose.model('Author', authorSchema);
module.exports = Author;