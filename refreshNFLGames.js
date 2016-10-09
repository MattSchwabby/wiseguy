var request = require('request');
var mongoose = require("mongoose");
var Scores = require('./models/scores');

var data = {games:[]};

var populateScore = function()
{
    var uri = 'http://www.nfl.com/liveupdate/scores/scores.json';
    request(uri, function(error, response, body)
    {
        if (!error && response.statusCode == 200)
        {
            var response = JSON.parse(body);
            var gameID, gameObject;
            for(gameID in response)
            {
                var game = {};
                game.gameID = gameID;
                gameObject = response[gameID] ;
                var homeTeam = gameObject.home.abbr;
                game.home = homeTeam;
                var awayTeam = gameObject.away.abbr;
                game.away = awayTeam;
                var homeScore = Number(gameObject["home"]["score"]["T"]);
                game.homeScore = homeScore;
                var awayScore = Number(gameObject["away"]["score"]["T"]);
                game.awayScore = awayScore;
                data.games.push(game);
            }
            Scores.create(data, function(error, score)
            {
              if(error)
              {
                  console.log("Unable to add new weekly games to the DB.");
                  console.log(error);
              }
              else
              {
                  console.log("Added new weekly games to the DB.");
                  console.log(score);
              }
            });
        }
        else
        {
            console.log(error);
        }
    });
};

module.exports = populateScore;