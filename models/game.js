var mongoose = require("mongoose");

//Score schema
var gameSchema = new mongoose.Schema({
    gameID: Number,
    home: String,
    away: String,
    homeScore: Number,
    awayScore: Number
});

module.exports = mongoose.model("Ga", scoreSchema);