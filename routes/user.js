var express = require("express");
var router = express.Router();
var Scores = require("../models/scores");
var Pool = require("../models/pool");
var User = require("../models/user");
var calculateUserStats = require("../calculateUserStats")
var Comment = require("../models/comment");

// USER ROUTES


// SHOW USER SEARCH RESULTS
router.get("/results/?query=matt", isLoggedIn, function(req, res)
{
    console.log("RECEIVED SEARCH REQUEST FOR QUERY ");
    console.lot(req.body);
    console.log(req.params.id);
    console.log(req.params.id);
    User.find(
        { $text : { $search : req.params.id } }, 
        { score : { $meta: "textScore" } }
    )
    .sort({ score : { $meta : 'textScore' } })
    .exec(function(err, results)
    {
        if(err)
        {
            console.log("ERROR RETRIEVING SEARCH RESULTS FOR " + req.params.id);
            console.log(err);
        }
        else
        {
            console.log("RECEIVED SEARCH REQUEST FOR");
            
            res.render("user/results", {results:results, currentUser: req.user});
            
        }
        // callback
    });
});


// SHOW USER SEARCH FORM
router.get("/search", isLoggedIn, function(req, res)
{
    res.render("user/search", {currentUser: req.user});
});


// SHOW USER PROFILE
router.get("/:id", isLoggedIn, function(req, res)
{
    calculateUserStats(req.params.id, function(returnedUser)
    {
        if(returnedUser)
        {
            User.findById(req.params.id, function(error, foundUser)
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
        }
        else
        {
            console.log("ERROR SAVING USER STATS");
            res.redirect("/pools");
        }
    });
});


// SHOW EDIT USER PROFILE
router.get("/:id/edit", isLoggedIn, function(req, res)
{

    User.findById(req.user.id, function(error, foundUser)
    {
        if(error)
        {
            console.log("ERROR RETRIEVING A USER");
            console.log(error);
        }
        else
        {
            res.render("user/edit", {currentUser: req.user});
        }
    });
});


// UPDATE USER ROUTE
router.put("/:id", checkUserOwnership, function(req, res)
{
    User.findByIdAndUpdate(req.params.id, {image: req.body.image, name: req.body.name}, function(err, updatedUser)
    {
        if(err)
        {
            console.log("ERROR UPDATING CAMPGROUND.");
            console.log(err);
            res.redirect("/pools");
        }
        else
        {
            res.redirect("/users/" + updatedUser._id);
        }
    });
});

// SHOW EDIT USER PROFILE
router.post("/:id/follow", isLoggedIn, isntFollowing, function(req, res)
{
    if()
    User.findById(req.user.id, function(error, foundCurrentUser)
    {
        if(error)
        {
            console.log("ERROR RETRIEVING A USER WHEN ADDING A FOLLOWING");
            console.log(error);
        }
        else
        {
            foundCurrentUser.following.push(req.params.id);
            foundCurrentUser.save();
            User.findById(req.params.id, function(error, foundUser)
            {
                if(error)
                {
                    console.log("ERROR RETRIEVING USER WHEN ADDING A FOLLOWER");
                    console.log(error);
                }
                else
                {
                    // add a follower to the subject user
                    foundUser.followers.push(req.user.id);
                    foundUser.save();
                    res.redirect("back");
                }
            })
            // res.render("user/edit", {currentUser: req.user});
        }
    });
});

// Middleware for ensuring a user isn't already following someone
function isntFollowing(req, res, next)
{
    User.findById(req.user._id, function(error, foundCurrentUser)
    {
        if(error)
        {
            console.log("ERROR FINDING USER IN isntFollowing()");
            console.log(error);
        }
        else
        {
            foundCurrentUser.following.forEach(function(follow)
            {
                if(follow._id === req.params.id)
                {
                    console.log("CURRENT USER ALREADY FOLLOWS THE REQUESTED FOLLOW");
                    res.redirect("back");
                }
                else
                {
                    next();
                }
            })
        }
    })
}

// Middleware for checking the ownership of a user profile
function checkUserOwnership(req, res, next)
{
    //is user logged in
    if(req.isAuthenticated())
    {
        User.findById(req.params.id, function(err, foundUser)
        {
            if(err)
            {
                res.redirect("back");
            }
            else
            {
                //does user own the account
                if(foundUser._id.equals(req.user._id)) // .equals() is a method that comes with mongoose that allows you to compare variables of different types
                {
                    next();
                }
                else
                {
                   res.redirect("back");
                }
            }
        });
    }
    else
    {
        res.redirect("back");
    }
}

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