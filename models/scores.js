var mongoose = require("mongoose");

//Score schema
var scoreSchema = new mongoose.Schema({
    games:
    [
        {
            gameID: Number,
            home: String,
            away: String,
            homeScore: Number,
            awayScore: Number
        }
    ],
},
{
    timestamps: true
});

module.exports = mongoose.model("Scores", scoreSchema);