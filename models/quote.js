const mongoose = require('mongoose');
const quoteSchema = mongoose.Schema({
    id: Number,
    author_id: String,
    text: String
});

const Quote = mongoose.model('Quote', quoteSchema);
module.exports = Quote;