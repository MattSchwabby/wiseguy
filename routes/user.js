var express = require("express");
var router = express.Router();
var Scores = require("../models/scores");
var Pool = require("../models/pool");
var User = require("../models/user");
var calculateUserStats = require("../calculateUserStats")
var Comment = require("../models/comment");

// USER ROUTES

router.get("/:id", isLoggedIn, function(req, res)
{
    calculateUserStats(req.user._id, function()
    {
        User.findById(req.user._id, function(error, foundUser)
        {
            if(error)
            {
                console.log("ERROR RETRIEVING A USER");
                console.log(error);
            }
            else
            {
                res.render("user/show", {user: foundUser, currentUser: req.user});
            }
        });
    })
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
        res.redirect("/login");
    }
}

module.exports = router;