var express = require("express");
var router = express.Router();
var Scores = require("../models/scores");
var Pool = require("../models/pool");
var User = require("../models/user");
var Comment = require("../models/comment");

//=============================================================
// POOL ROUTES
//=============================================================

// Show all Pools
router.get("/", isLoggedIn, function(req, res)
{
    // get the current user's pools from DB
    Pool.find({'author.id': req.user._id}, {}, { sort: { 'createdAt' : -1 } }).limit(30).exec(function(error, pools)
    {
        if(error)
        {
            req.flash("error", "Error retrieving pools from the database");
            console.log("ERROR " + error);
            res.redirect("back");
        }
        else
        {
            res.render("pools/index", {pools: pools, currentUser: req.user, targetUser: req.user});
        }
    });
});


// Show the new pool form
router.get("/new", isLoggedIn, function(req, res)
{
    // Get the latest scores from DB
    Scores.findOne({},{}, { sort: { 'createdAt' : -1 } }, function(error, scores)
    {
        if(error)
        {
            req.flash("error", "Error retrieving scores from the database");
            console.log("ERROR RETRIEVING SCORES FROM DATABASE");
            console.log(error);
            res.redirect("back");
        }
        else
        {
            res.render("pools/new", {scores: scores, currentUser: req.user});
        }
    });
});


// Take data from the new pool form and save it to the database
router.post("/", isLoggedIn, function(req, res)
{
    Scores.findOne({},{}, { sort: { 'createdAt' : -1 } }, function(error, scores)
    {
        if(error)
        {
            req.flash("error", "Error creating pool");
            console.log("Error retrieving scores from DB before creating a new pool.");
            console.log(error);
            res.redirect("/pools");
        }
        else
        {
            poolArray(req.body, function(parsedPool)
            {
                if(parsedPool)
                {
                    pickChecker(parsedPool, function(response)
                    {
                        if(response)
                        {
                            Pool.create(parsedPool, function(err, pool)
                            {
                                if(err)
                                {
                                    req.flash("error", "Error saving pool to the database");
                                    console.log("ERROR SAVING POOL TO DB.");
                                    console.log(err);
                                    res.redirect("back");
                                }
                                else
                                {
                                    pool.author.id = req.user._id;
                                    pool.author.username = req.user.username;
                                    pool.author.name = req.user.name;
                                    pool.author.image = req.user.image;
                                    pool.games.push(scores);
                                    pool.save();
                                    console.log("NEW POOL ADDED TO THE DB");
                                }
                            });
                        }
                        else
                        {
                        }
                    });
                }
                else
                {
                    req.flash("error", "You need to have at least one pick to create a pool");
                }
            });
            res.redirect("/pools");
        }
    });
});


// Show more information about a specific pool
router.get("/:id", function(req, res)
{
    //find the pool with provided id
    Pool.findById(req.params.id).populate("games.games").populate("comments").exec(function(err, foundPool)
    {
        if(err)
        {
            req.flash("error", "Error finding information about the requested pool");
            console.log(err);
            res.redirect("back");
        }
        else
        {
            var gameID = foundPool.games;
            Scores.findById(gameID, function(err, foundScores)
            {
                if(err)
                {
                    req.flash("error", "Error finding information about the requested pool");
                    console.log("ERROR FINDING SCORES WHEN ROUTING TO THE SHOW POOL PAGE");
                    console.log(err);
                    res.redirect("back");
                }
                else
                {
                    res.render("pools/show", {pool: foundPool, scores: foundScores, currentUser: req.user});
                }
            });
        }
    });
});


//EDIT POOL ROUTE
router.get("/:id/edit", checkPoolOwnership, function(req, res)
{
    Pool.findById(req.params.id, function(err, foundPool)
    {
        var gameID = foundPool.games;
        Scores.findById(gameID, function(err, foundScores)
        {
            if(err)
            {
                req.flash("error", "Error loading edit pool page");
                console.log("ERROR FINDING SCORES WHEN ROUTING TO THE EDIT POOL PAGE");
                console.log(err);
                res.redirect("/pools");
            }
            else
            {
                res.render("pools/edit", {pool: foundPool, scores: foundScores, currentUser: req.user});
            }
        });
    });
});


// UPDATE POOL ROUTE
router.put("/:id", checkPoolOwnership, function(req, res)
{
    poolArray(req.body, function(parsedPool)
    {
        if(parsedPool)
        {
            Pool.findById(req.params.id, function(err,pool)
            {
                if(err)
                {
                    req.flash("error", "Error updating pool");
                    console.log("ERROR FINDING POOL TO UPDATE.");
                    res.redirect("back");
                }
                else
                {
                    pool.picks = parsedPool.picks;
                    pool.picks.name = parsedPool.name;
                    pool.save();
                }
            });
        }
        else
        {
            // do nothing?
            req.flash("error", "Error updating pool");
            res.redirect("back");
        }
    });
    res.redirect("/pools/" + req.params.id);
});


// DESTROY POOL ROUTE
router.delete("/:id", checkPoolOwnership, function(req, res)
{
    Pool.findByIdAndRemove(req.params.id, function(err)
    {
        if(err)
        {
            req.flash("error", "Error deleting pool");
            console.log("ERROR DELETING POOL");
            console.log(err);
            res.redirect("/pools");
        }
        else
        {
            res.redirect("/pools");
        }
    });
});


// Middleware for checking if a user is logged in
function isLoggedIn(req, res, next)
{
    if(req.isAuthenticated())
    {
        return next();
    }
    else
    {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("/login");
    }
}


// Middleware for checking the ownership of a pool
function checkPoolOwnership(req, res, next)
{
    //is user logged in
    if(req.isAuthenticated())
    {
        Pool.findById(req.params.id, function(err, foundPool)
        {
            if(err)
            {
                req.flash("error", "Pool not found");
                res.redirect("back");
            }
            else
            {
                //does user own the pool
                if(foundPool.author.id.equals(req.user._id)) // .equals() is a method that comes with mongoose that allows you to compare variables of different types
                {
                    next();
                }
                else
                {
                    req.flash("error", "You don't have permission to modify that pool");
                    res.redirect("back");
                }
            }
        });
    }
    else
    {
        req.flash("error", "Please log in first");
        res.redirect("back");
    }
}

// Function to parse data from the new pool form and model it into the Pool schema
function poolArray(pool, cb)
{
    var picks = {"picks":[],"games":[], "author":[],"comments":[]};
    picks.name = pool.name;
    
    var poolID, poolObject;
    for(poolID in pool)
    {
        if(poolID === "name")
        {
            // do nothing
        }
        else
        {
            var pick = {};
            pick.gameID = poolID;
            poolObject = pool[poolID];
            pick.winner = poolObject.winner;
            pick.spread = poolObject.spread;
            pick.toWin = poolObject.toWin;
            picks.picks.push(pick);
        }
    }

    cb(picks);
}


// function to ensure there is at least one pick in a pool
function pickChecker(pool, callback)
{
    var response = false;
    pool.picks.forEach(function(pick)
    {
        if(String(pick.winner) === "undefined")
        {
            //do nothing
        }
        else
        {
            response = true;
        }
    });
    callback(response);
}



module.exports = router;