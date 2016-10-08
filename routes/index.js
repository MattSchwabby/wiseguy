var express = require("express");
var router = express.Router({mergeParams: true});
var Comment = require("../models/comment");
var Scores = require("../models/scores");
var methodOverride = require("method-override");
var Pool = require("../models/pool");
var User = require("../models/user");
var passport = require("passport");


// landing page
router.get("/", function(req, res)
{
    // Get the latest scores from DB
    Scores.findOne({},{}, { sort: { 'createdAt' : -1 } }, function(error, scores)
    {
        if(error)
        {
            console.log("ERROR " + error);
        }
        else
        {
            res.render("landing", {scores: scores});
        }
    });
});

//===========================================
// AUTH ROUTES
//===========================================

//show register form
router.get("/register", function(req, res)
{
    res.render("register");
});

//handle sign up logic
router.post("/register", function(req, res)
{
    if (req.body.username === req.body.confirmEmail && req.body.password === req.body.confirmPassword)
    {
        var newUser = new User({username: req.body.username, name: req.body.name});
        User.register(newUser, req.body.password, function(err, user)
        {
            if(err)
            {
                console.log(err);
                return res.render("register");
            }
            passport.authenticate("local")(req, res, function()
            {
                res.redirect("/pools");
            });
        });
    }
    else
    {
        return res.render("register");
    }
});

// show login form
router.get("/login", function(req, res)
{
   res.render("login");
});

//handle login logic
router.post("/login", passport.authenticate("local", 
{
    successRedirect:"/pools",
    failureRedirect:"/login"
}), function(req, res)
{
    
});

// logout route
router.get("/logout", function(req, res)
{
    req.logout();
    res.redirect("/");
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