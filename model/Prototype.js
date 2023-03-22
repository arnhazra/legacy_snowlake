//Import Statements
const mongoose = require('mongoose')

//Prototype NoSQL Schema
const PrototypeSchema = new mongoose.Schema
({
    creator:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

    title:
    {
        type: String,
        required: true
    },

    description:
    {
        type: String,
        required: true
    },

    link:
    {
        type: String,
        required: true
    },

    accesstoken:
    {
        type: String,
        required: true
    },

    date:
    {
        type: String,
        default: Date()
    }
})

//EXPORT STATEMENTS
module.exports = Prototype = mongoose.model('prototype', PrototypeSchema)