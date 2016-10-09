var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");


//User Schema - email, name
var UserSchema = new mongoose.Schema(
{
    username: String,
    name: String,
    password: String,
    pools: 
    [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pool"
        }    
    ],
    friends:
    [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }  
    ],
    settings:
    {
        useSpread: Boolean,
        useToWin: Boolean
    },
    stats:
    {
        correctPicks: Number,
        correctSpreadPicks: Number,
        totalPicks: Number,
        totalPools: Number
    }
},
{
    timestamps: true
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);