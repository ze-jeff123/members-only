const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    title : {type: String, required:true},
    text : {type: String, required:true},
    timestamp : {type: Date, required: true},
    author: {type: Schema.Types.ObjectId, ref: "Author"},
})


MessageSchema.virtual("url").get(function() {
    return "/message/" + this._id;
})

module.exports = mongoose.model("Message", MessageSchema);