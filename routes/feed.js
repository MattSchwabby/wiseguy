var express = require("express");
var router = express.Router({mergeParams: true});
var Comment = require("../models/comment");
var Scores = require("../models/scores");
var methodOverride = require("method-override");
var Pool = require("../models/pool");
var User = require("../models/user");
var passport = require("passport");
var indexUsers = require('../indexUsers');


// MAIN FEED ROUTE
router.get("/", isLoggedIn, function(req, res)
{
    User.findById(req.user.id, function(err, foundUser)
    {
        if(err)
        {
            req.flash("error", "Error retrieving data on users you follow from the database");
            console.log("ERROR RETRIEVING USER FEED");
            console.log(err);
        }
        else
        {
            var following = foundUser.following;
            Pool.find({'author.id':{ $in: following }}, {}, {sort:{'updatedAt': -1}}).limit(30).exec(function(err, foundPools)
                {
                    if(err)
                    {
                        req.flash("error", "Error retrieving pools for users you follow from the database");
                        console.log("ERROR RETRIEVING FOLLOWING POOLS");
                        console.log(err);
                    }
                    else
                    {
                        res.render("feed", {feed: foundPools});
                    }
                });
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

module.exports = router;