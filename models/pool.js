var mongoose = require("mongoose");

//Pool schema
var poolSchema = new mongoose.Schema({
    name: String,
    games:
    [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Scores"
        }    
    ],
    picks:
    [
        {
            gameID: Number,
            winner: String,
            spread: Number,
            toWin: Number
        }    
    ]
},
{
    timestamps: true
});

module.exports = mongoose.model("Pool", poolSchema);