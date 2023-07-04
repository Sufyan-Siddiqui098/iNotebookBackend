const mongoose = require('mongoose')
const { Schema } = mongoose;


const NotesSchema = new Schema({
    user:{
       type: mongoose.Schema.Types.ObjectId, //stores userID in the user
       ref: 'user'  //Referencing to the user model
    },
    title:{
        type: String,
        require: true
    },
    description:{
        type: String,
        require: true,
    },
    tag:{
        type: String,
        defualt: "General"
    },
    date:{ //Date
        type: Date,
        defual: Date.now
    }
});

module.exports = mongoose.model("notes", NotesSchema);