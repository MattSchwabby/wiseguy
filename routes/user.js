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
            req.flash("error", "Error retrieving search results");
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
                    req.flash("error", "Error retrieving a user from the database");
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
            req.flash("error", "error saving user information to the database");
            console.log("ERROR SAVING USER STATS");
            res.redirect("/pools");
        }
    });
});


// SHOW USER FOLLOWING PAGE
router.get("/:id/following", isLoggedIn, function(req, res)
{
    User.findById(req.params.id, function(err, foundUser)
    {
        if(err)
        {
            req.flash("error", "Error generating feed");
            console.log("ERROR RETRIEVING USER FEED");
            console.log(err);
        }
        else
        {
            var following = foundUser.following;
            User.find({'_id':{ $in: following }}, {}).exec(function(err, foundUsers)
                {
                    if(err)
                    {
                        req.flash("error", "Error retrieiving pools for user you follow");
                        console.log("ERROR RETRIEVING FOLLOWING POOLS");
                        console.log(err);
                    }
                    else
                    {
                        res.render("user/following", {users: foundUsers, currentUser: req.user, user: foundUser});
                    }
                });
        }
    });
});


// SHOW USER FOLLOWERS PAGE
router.get("/:id/followers", isLoggedIn, function(req, res)
{
    User.findById(req.params.id, function(err, foundUser)
    {
        if(err)
        {
            req.flash("error", "Error generating feed");
            console.log("ERROR RETRIEVING USER FEED");
            console.log(err);
        }
        else
        {
            var followers = foundUser.followers;
            User.find({'_id':{ $in: followers }}, {}).exec(function(err, foundUsers)
                {
                    if(err)
                    {
                        req.flash("error", "Error retrieving pool data from the database for users you follow");
                        console.log("ERROR RETRIEVING FOLLOWING POOLS");
                        console.log(err);
                    }
                    else
                    {
                        res.render("user/followers", {users: foundUsers, currentUser: req.user, user: foundUser});
                    }
                });
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
            req.flash("error", "Error retrieving user information from the database");
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
            req.flash("error", "Error updating user data in the database");
            console.log("ERROR UPDATING USER.");
            console.log(err);
            res.redirect("/pools");
        }
        else
        {
            res.redirect("/users/" + updatedUser._id);
        }
    });
});


// Route to add someone to a user's following and them to the target's followers
router.post("/:id/follow", isLoggedIn, function(req, res)
{
    User.findById(req.user.id, function(error, foundCurrentUser)
    {
        if(error)
        {
            req.flash("error", "Error retrieving user information from the database when attemption to follow a user");
            console.log("ERROR RETRIEVING A USER WHEN ADDING A FOLLOWING");
            console.log(error);
        }
        else
        {
            User.findById(req.params.id, function(error, foundUser)
            {
                if(error)
                {
                    req.flash("error", "Error retrieving user information from the database when attempting to add a follower");
                    console.log("ERROR RETRIEVING USER WHEN ADDING A FOLLOWER");
                    console.log(error);
                }
                else
                {
                    isntFollowing(foundCurrentUser, req.params.id, function()
                    {
                        foundUser.followers.push(req.user.id);
                        foundUser.save();
                        foundCurrentUser.following.push(req.params.id);
                        foundCurrentUser.save();
                        console.log(req.user.id + " STARTED FOLLOWING " + req.params.id);
                        res.redirect("back");   
                    });
                }
                
            });
            // res.render("user/edit", {currentUser: req.user});
        }
    });
});


//UNFOLLOW ROUTE
router.post("/:id/unfollow", isLoggedIn, function(req, res)
{
    User.findById(req.params.id, function(err, foundTargetUser)
    {
        if(err)
        {
            req.flash("error", "Error unfollowing user");
            console.log("ERROR REMOVING FOLLOWING");
            console.log(err);
            res.redirect("back");
        }
        else
        {
            User.findById(req.user.id, function(err, foundCurrentUser)
            {
                if(err)
                {
                    req.flash("error", "Error removing follower");
                    console.log("ERROR REMOVING FOLLOWER");
                    console.log(err);
                    res.redirect("back");
                }
                else
                {
                    foundCurrentUser.following.remove(req.params.id);
                    foundTargetUser.followers.remove(req.user.id);
                    foundCurrentUser.save();
                    foundTargetUser.save();
                    console.log(req.user.id + " STOPPED FOLLOWING " + req.params.id);
                    res.redirect("back");
                }
            });
        }
    });
});



// A specific user's pools
router.get("/:id/pools", isLoggedIn, function(req, res)
{
    // get the current user's pools from DB
    Pool.find({'author.id': req.params.id}, {}, { sort: { 'createdAt' : -1 } }).limit(30).exec(function(error, pools)
    {
        if(error)
        {
            req.flash("error", "Error retrieving pool information from the database");
            console.log("ERROR " + error);
        }
        else
        {
            res.render("pools/index", {pools: pools, currentUser: req.user});
        }
    });
});


// Middleware for ensuring a user isn't already following someone
function isntFollowing(currentUser, targetUser, callback)
{
    if(currentUser.following === [])
    {
        currentUser.following.forEach(function(follow)
        {
            if(follow === targetUser)
            {
                req.flash("error", "You already follow that user");
                console.log("Current user already follows target user");
            }
            else
            {
                callback();
            }
        });
    }
    else
    {
        callback();
    }
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
                req.flash("error", "Error retrieving user information from the database");
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
                    req.flash("error", "You don't have permission to edit that user");
                   res.redirect("back");
                }
            }
        });
    }
    else
    {
        req.flash("error", "You must be logged in to do that");
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
        req.flash("error", "You need to be logged in to do that");
        res.redirect("/login");
    }
}

module.exports = router;