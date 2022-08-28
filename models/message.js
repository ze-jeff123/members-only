const mongoose = require('mongoose');
const {format} = require('date-fns');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    title : {type: String, required:true},
    text : {type: String, required:true},
    timestamp : {type: Date, required: true},
    author: {type: Schema.Types.ObjectId, ref: "User"},
})


MessageSchema.virtual("url").get(function() {
    return "/message/" + this._id;
})

MessageSchema.virtual('formattedTimestamp').get(function() {
    return format(this.timestamp, 'MM-dd-yyyy');
})

module.exports = mongoose.model("Message", MessageSchema);