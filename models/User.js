const mongoose = require('mongoose')
const { Schema } = mongoose;

const UserSchema = new Schema({
    name:{
        type: String,
        require: true
    },
    email:{
        type: String,
        require: true,
        unique: true
    },
    password:{
        type: String,
        require: true
    },
    date:{ //Date
        type: Date,
        default: Date.now
    }
});

//Creating mongoose model and then declaring a name "user" and also passing Schema
module.exports = mongoose.model("user", UserSchema); //create a MongoDB Collection named "user"