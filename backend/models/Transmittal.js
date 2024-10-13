const mongoose = require('mongoose');

const transmittalSchema = new mongoose.Schema({
    number: {
        type: Number,
        default: 1
    }
});

module.exports = mongoose.model('Transmittal', transmittalSchema);