var express = require("express");
var router = express.Router({mergeParams: true});
var Pool = require("../models/pool");
var User = require("../models/user");
var Comment = require("../models/comment");

//================================
//COMMENTS ROUTES
//=================================

// Show new comment form
router.get("/new", isLoggedIn, function(req, res)
{
    // find campground by id
    Pool.findById(req.params.id, function(error, foundPool)
    {
        if(error)
        {
            req.flash("error", "Error retrieving pool from the database when adding a new comment");
            console.log(error);
            res.redirect("back");
        }
        else
        {
            res.render("comments/new", {pool: foundPool});
        }
    });
});

// Comments Create
router.post("/", isLoggedIn, function(req, res)
{
    //lookup pool using ID
    Pool.findById(req.params.id, function(error, foundPool)
    {
        if(error)
        {
            req.flash("error", "Error retrieving pool from the database when attempting to add comment");
            console.log(error);
            res.redirect("back");
        }
        else
        {
            Comment.create(req.body.comment, function(err, comment)
            {
                if(err)
                {
                    req.flash("error", "Error saving comment to the database");
                    console.log(err);
                }
                else
                {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.author.name = req.user.name;
                    comment.author.image = req.user.image;
                    //save comment
                    comment.save();
                    console.log(comment);
                    foundPool.comments.push(comment);
                    foundPool.save();
                    res.redirect("/pools/" + foundPool._id);
                }
            });
        }
    });
});


// SHOW EDIT COMMENT ROUTE
router.get("/:comment_id/edit", checkCommentOwnership, function(req, res)
{
   Comment.findById(req.params.comment_id, function(err, foundComment)
   {
      if(err)
      {
          req.flash("error", "Error retrieving comment to edit from the database");
          console.log("ERROR RETRIEVING COMMENT TO EDIT");
          console.log(err);
          res.redirect("back");
      }
      else
      {
        res.render("comments/edit", {pool: req.params.id, comment: foundComment});
      }
   });
});


// UPDATE COMMENT ROUTE
router.put("/:comment_id", checkCommentOwnership, function(req, res)
{
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment)
    {
        if(err)
        {
            req.flash("error", "Error updating comment");
            console.log("ERROR UPDATING COMMENT");
            console.log(err);
            res.redirect("back");
        }
        else
        {
            res.redirect("/pools/" + req.params.id);
        }
    });
});


// DESTROY COMMENT ROUTE
router.delete("/:comment_id", checkCommentOwnership, function(req, res)
{
    // find comment by id and remove
    Comment.findByIdAndRemove(req.params.comment_id, function(err)
    {
        if(err)
        {
            req.flash("error", "Error deleting comment");
            console.log("ERROR DELETING COMMENT");
            console.log(err);
            res.redirect("back");
        }
        else
        {
            //comment successfully removed
            res.redirect("/pools/" + req.params.id);
        }
    });
});


//Middleware to check user ownership of a comment
function checkCommentOwnership(req, res, next)
{
    //is user logged in
    if(req.isAuthenticated())
    {
        Comment.findById(req.params.comment_id, function(err, foundComment)
        {
            if(err)
            {
                req.flash("error", "Error retrieving comment from the database");
                res.redirect("back");
            }
            else
            {
                //does user own the comment
                if(foundComment.author.id.equals(req.user._id)) // .equals() is a method that comes with mongoose that allows you to compare variables of different types
                {
                    next();
                }
                else
                {
                    req.flash("error", "You don't have permission to edit that comment");
                   res.redirect("back");
                }
            }
        });
    }
    else
    {        
        req.flash("error", "You need to be logged in to do that");
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