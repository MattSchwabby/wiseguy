var mongoose = require("mongoose"),
    User = require("./models/user"),
    Scores = require("./models/scores"),
    Pool = require("./models/pool");

var updateUserStats = function(user, cb)
{
    var correctPicks = 0;
    var correctSpreadPicks = 0;
    var totalPicks = 0; 
    var totalPools = 0;
    User.findById(user, function(error, foundUser)
    {
        if(error)
        {
            console.log("Error finding user when attempting to update user stats");
            console.log(error);
        }
        else
        {
            Pool.find({'author.id': user}, function(error, foundPools)
            {
                if(error)
                {
                    console.log("ERROR RETRIEVING POOL WHEN UPDATING USER STATS");
                    console.log(error);
                }
                else
                {
                    foundPools.forEach(function(pool)
                    {
                        // update total pool count
                        totalPools ++;
                        Scores.findById(pool.games, function(error, foundScores)
                        {
                            if(error)
                            {
                                console.log("ERROR RETRIEVING SCORES FROM DB WHEN CALCULATING USER STATS");
                                console.log(error);
                            }
                            else
                            {
                                pool.picks.forEach(function(pick)
                                {
                                    // update total pick count for user
                                    if(String(pick.winner) === "undefined")
                                    {
                                        // do nothing
                                    }
                                    else
                                    {
                                        totalPicks++;
                                        foundScores.games.forEach(function(score)
                                        {
                                            if(score.gameID == pick.gameID)
                                            {
                                                var winner = "";
                                                var loser = "";
                                                if(score.homeScore > score.awayScore)
                                                {
                                                    if(pick.spread && pick.winner == String(score.home))
                                                    {
                                                        if((score.homeScore + pick.spread) > score.awayScore)
                                                        {
                                                            correctSpreadPicks++;
                                                            correctPicks++;
                                                            winner = String(score.home);
                                                            loser = String(score.away);
                                                        }
                                                        else
                                                        {
                                                            loser = String(score.home);
                                                            winner = String(score.away);
                                                        }
                                                    }
                                                    else
                                                    {
                                                        correctPicks++;
                                                        winner = String(score.home);
                                                        loser = String(score.away);
                                                    }
                                                }
                                                else if(score.awayScore > score.homeScore)
                                                {
                                                    if(pick.spread && pick.winner == String(score.away))
                                                    {
                                                        if((score.awayScore + pick.spread) > score.homeScore)
                                                        {
                                                            correctSpreadPicks++;
                                                            correctPicks++;
                                                            winner = String(score.away);
                                                            loser = String(score.home);
                                                        }
                                                        else
                                                        {
                                                            winner = String(score.home);
                                                            loser = String(score.away);
                                                        }
                                                    }
                                                    else
                                                    {
                                                        correctPicks++;
                                                        winner = String(score.away);
                                                        loser = String(score.home);
                                                    }
                                                }
                                            }
                                        });
                                        // update correct pick and spread pick count

                                    }
                                });
                            }
                        });
                    });
                }
            });
        }
        console.log("Correct picks is " + correctPicks);
        console.log("Correct spread picks is " + correctSpreadPicks)
        user.stats.correctPicks = correctPicks;
        user.stats.correctSpreadPicks = correctSpreadPicks;
        user.stats.totalPicks = totalPicks;
        user.stats.totalPools = totalPools;
        user.save();
        cb(user);
    });
}

module.exports = updateUserStats;