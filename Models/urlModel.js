const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid');


const urlSchema = new Schema({

    long : {
        type : String
    },
    short : {
        type : String,
        default : shortid.generate
    },
    clicks : {
        type : Number,
        default :0
    }


},{
    timestamps: true
});



module.exports = mongoose.model('Url', urlSchema );