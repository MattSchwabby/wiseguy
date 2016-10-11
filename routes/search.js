var express = require("express");
var router = express.Router();
var Scores = require("../models/scores");
var Pool = require("../models/pool");
var User = require("../models/user");
var calculateUserStats = require("../calculateUserStats")
var Comment = require("../models/comment");


// Search ROUTES


// SHOW USER SEARCH RESULTS
router.get("/user/", isLoggedIn, function(req, res)
{
    User.find(
        { $text : { $search : req.query.user } }, 
        { score : { $meta: "textScore" } }
    )
    .sort({ score : { $meta : 'textScore' } })
    .exec(function(err, results)
    {
        if(err)
        {
            console.log("ERROR RETRIEVING SEARCH RESULTS FOR " + req.query.user);
            console.log(err);
        }
        else
        {
            res.render("user/results", {results:results, currentUser: req.user});
        }
        // callback
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
        res.redirect("/login");
    }
}

module.exports = router;