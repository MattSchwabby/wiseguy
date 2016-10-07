var request = require('request');
var mongoose = require("mongoose");
var Scores = require('./models/scores');

//mongoose.connect("mongodb://localhost/pickem");

var updateScore = function()
{
    var uri = 'http://www.nfl.com/liveupdate/scores/scores.json';
    request(uri, function(error, response, body)
    {
        if (!error && response.statusCode == 200)
        {
            var APIGames = JSON.parse(body);
            parseGames(APIGames, function(parsedGames)
            {
                if(parsedGames)
                {
                    // find latest score and update it
                    Scores.findOne({},{}, { sort: { 'createdAt' : -1 } }, function(error, scores)
                    {
                        if(error)
                        {
                            console.log("ERROR RETRIVING SCORES");
                            console.log(error);
                        }
                        else
                        {
                            //call function here
                            parsedGames.forEach(function(game)
                            {
                                scores.games.forEach(function(score)
                                {
                                    if(Number(game.gameID) === Number(score.gameID))
                                    {
                                        score.homeScore = game.homeScore;
                                        score.awayScore = game.awayScore;
                                    }
                                });
                            });
                            console.log("Saving updated scores to the DB.");
                            scores.save();
                        }
                    }); // end find one score
                }
            });
        }
        else
        {
            console.log("ERROR RETRIEVING NFL SCORES");
            console.log(error);
        }
    });
};

module.exports = updateScore;

function parseGames(games, cb)
{
    var gameID, gameObject;
    var resultGames = [];
    for(gameID in games)
    {
        var game = {};
        game.gameID = gameID;
        gameObject = games[gameID] ;
        var homeTeam = gameObject.home.abbr;
        game.home = homeTeam;
        var awayTeam = gameObject.away.abbr;
        game.away = awayTeam;
        var homeScore = Number(gameObject["home"]["score"]["T"]);
        game.homeScore = homeScore;
        var awayScore = Number(gameObject["away"]["score"]["T"]);
        game.awayScore = awayScore;
        resultGames.push(game);
    }
    cb(resultGames);
}

module.exports = updateScore;