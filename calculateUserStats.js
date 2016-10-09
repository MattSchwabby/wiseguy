var mongoose = require("mongoose"),
    User = require("./models/user"),
    Scores = require("./models/scores"),
    Pool = require("./models/pool");

var calculateUserStats = function(user, cb)
{
    var stats=
    {
        correctPicks: 0,
        correctSpreadPicks: 0,
        totalPicks: 0,
        totalPools: 0
    };
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
                        stats.totalPools++;
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
                                        stats.totalPicks++;
                                        foundScores.games.forEach(function(score)
                                        {
                                            if(score.gameID == pick.gameID)
                                            {
                                                if(score.homeScore > score.awayScore)
                                                {
                                                    if(String(pick.winner) === score.home)
                                                    {
                                                        stats.correctPicks++;
                                                    }
                                                    if(pick.spread && pick.winner == String(score.home))
                                                    {
                                                        if((score.homeScore + pick.spread) > score.awayScore)
                                                        {
                                                            stats.correctSpreadPicks++;
                                                        }
                                                        else
                                                        {
                                                        }
                                                    }
                                                    else
                                                    {
                                                    }
                                                }
                                                else if(score.awayScore > score.homeScore)
                                                {
                                                    if(String(pick.winner) === score.away)
                                                    {
                                                        stats.correctPicks++;
                                                    }
                                                    if(pick.spread && pick.winner == String(score.away))
                                                    {
                                                        if((score.awayScore + pick.spread) > score.homeScore)
                                                        {
                                                            stats.correctSpreadPicks++;
                                                        }
                                                        else
                                                        {
                                                        }
                                                    }
                                                    else
                                                    {
                                                    }
                                                }
                                            }
                                         
                                        });
                                    }
                                });
                            }
                        });
                    });
                    cb(stats);
                }
            });
        }
    });
};

function saveUserStats(user, cb)
{
    calculateUserStats(user, function(stats)
    {
        User.findById(user, function(error, foundUser)
        {
            if(error)
            {
                
            }
            else
            {
                foundUser.stats = stats;
                foundUser.save();
                cb(foundUser);
            }
        });
    });
}

module.exports = saveUserStats;