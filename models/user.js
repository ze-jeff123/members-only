const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName : {type: String, required:true},
    lastName : {type: String, required:true},
    username : {type: String, required:true},
    password : {type: String, required:true},
    membershipStatus : {type: Boolean, required:true },
    isAdmin: {type: Boolean},
})


UserSchema.virtual("url").get(function() {
    return "/user/" + this._id;
})

module.exports = mongoose.model("Book", BookSchema);