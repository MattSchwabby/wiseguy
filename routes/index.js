var express = require("express");
var router = express.Router({mergeParams: true});
var Comment = require("../models/comment");
var Scores = require("../models/scores");
var methodOverride = require("method-override");
var Pool = require("../models/pool");
var User = require("../models/user");
var passport = require("passport");
var indexUsers = require('../indexUsers');
var addVIPs = require("../addVIPs");


// landing page
router.get("/", function(req, res)
{
    // Get the latest scores from DB
    Scores.findOne({},{}, { sort: { 'createdAt' : -1 } }, function(error, scores)
    {
        if(error)
        {
            console.log("ERROR RETRIEVING LATEST SCORES FROM THE DATABASE WHEN RENDERING LANDING PAGE.");
            console.log(error);
        }
        else
        {   
            Pool.find({},{}, { sort: {'updatedAt':-1}}).limit(7).exec(function(error, pools)
            {
                if(error)
                {
                    console.log("ERROR RETRIEVING POOLS WHEN RENDERING LANDING PAGE.");
                    console.log(error);
                }
                else
                {
                    res.render("landing", {scores: scores, pools: pools});
                }
            });
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
    if (req.body.username === req.body.confirmEmail && req.body.password === req.body.confirmPassword && req.body.name.length < 21 && req.body.name.length > 2)
    {
        if(req.body.image === "" || req.body.image === " ")
        {
            req.body.image = "https://upload.wikimedia.org/wikipedia/en/b/b1/Portrait_placeholder.png";
        }
        var newUser = new User({username: req.body.username, name: req.body.name, image: req.body.image});
        User.register(newUser, req.body.password, function(err, user)
        {
            if(err)
            {
                req.flash("error", "Error adding new user to the database. Please try again. If issues persist, contact me at matthew.schwabby@gmail.com");
                console.log(err);
                return res.render("register");
            }
            passport.authenticate("local")(req, res, function()
            {
                addVIPs(user._id);
                console.log("NEW USER IS:");
                console.log(user);
                console.log("NEW USER ID IS:");
                console.log(user._id);
                req.flash("success", "Thank you for signing up with Wiseguy. This is a very early version of this application, so some issues should be expected. If you run into any issues, please feel free to let me know by e-mailing me at matthew.schwabby@gmail.com. Good luck with your pools!");
                res.redirect("/pools");
                indexUsers();
            });
        });
    }
    else
    {
        if(req.body.username != req.body.confirmEmail)
        {
            req.flash("error", "Error adding new user to the database. Please check that your e-mail and confirm e-mail fields match.");
            res.redirect("/register");
        }
        else if(req.body.password != req.body.confirmPassword)
        {
            req.flash("error", "Error adding new user to the database. Please check that your password and confirm password fields match.");
            res.redirect("/register");
        }
        else if(req.body.name.length > 20)
        {
            req.flash("error", "Error adding new user to the database. User names can be a maximum of 20 characters long.");
            res.redirect("/register");
        }
        else if(req.body.name.length)
        {
            req.flash("error", "Error adding new user to the database. User names must be at least three characters long.");
            res.redirect("/register");
        }
        else
        {
            req.flash("error", "Error adding new user to the database.");
            res.redirect("/register");
        }
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
    req.flash("success", "Logged out");
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
        req.flash("error", "Please log in first");
        res.redirect("/login");
    }
}

module.exports = router;