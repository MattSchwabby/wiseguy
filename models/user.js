var mongoose = require("mongoose");


//User Schema - email, name
var userSchema = new mongoose.Schema({
    email: String,
    name: String,
    pools: 
    [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pool"
        }    
    ]
},
{
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);