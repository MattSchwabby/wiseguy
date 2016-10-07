var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    Scores = require("./models/scores"),
    Pool = require("./models/pool"),
    User = require("./models/user"),
    populateScore = require('./nfl'),
    updateScore = require('./updateNFL'),
    schedule = require('node-schedule');
    
const util = require('util');
    
// Schedule rule to update games in DB
var weeklyRule = new schedule.RecurrenceRule();
weeklyRule.dayOfWeek = 3;
weeklyRule.hour = 1;
weeklyRule.minute = 0;
 
// Scheduled task to populate a new set of NFL scores each week
var weeklyJob = schedule.scheduleJob(weeklyRule, function()
{
    populateScore();
});


// Schedule rule to update game scores every five minutes
var minutes = 1, the_interval = minutes * 60 * 1000;
setInterval(function() {
    updateScore();
}, the_interval);
 

// var updateRule = new schedule.RecurrenceRule();
// updateRule.minute = 5;
 
// var updateJob = schedule.scheduleJob(updateRule, function()
// {
//   updateScore();
// });
 
mongoose.connect("mongodb://localhost/pickem");

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

// landing page
app.get("/", function(req, res)
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


// Show all Pools
app.get("/pools", function(req, res)
{
    // get all pools from DB
    Pool.find({}, {}, { sort: { 'createdAt' : -1 } }, function(error, pools)
    {
        if(error)
        {
            console.log("ERROR " + error);
        }
        else
        {
            res.render("pools", {pools: pools});
        }
    });
});

// Show the new pool form
app.get("/pools/new", function(req, res)
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
            res.render("pools/new", {scores: scores});
        }
    });
});

// Show more information about a specific pool
app.get("/pools/:id", function(req, res)
{
    //find the campground with provided id
    Pool.findById(req.params.id).populate("games.games").exec(function(err, foundPool)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            var gameID = foundPool.games;
            Scores.findById(gameID, function(err, foundScores)
            {
                if(err)
                {
                    console.log("ERROR FINDING SCORES WHEN ROUTING TO THE SHOW POOL PAGE");
                    console.log(err);
                }
                else
                {
                    // console.log("GAMES ID IS :");
                    // console.log(gameID);
                    // console.log("FOUND SCORES ARE");
                    // console.log(foundScores.games);
                    res.render("pools/show", {pool: foundPool, scores: foundScores});
                }
            });
        }
    });
});

// Take data from the new pool form and save it to the database
app.post("/pools", function(req, res)
{
    Scores.findOne({},{}, { sort: { 'createdAt' : -1 } }, function(error, scores)
    {
        if(error)
        {
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
                    Pool.create(parsedPool, function(err, pool)
                    {
                        if(err)
                        {
                            console.log("ERROR SAVING POOL TO DB.");
                            console.log(err);
                        }
                        else
                        {
                            pool.games.push(scores);
                            pool.save();
                            console.log("NEW POOL ADDED TO THE DB");
                            console.log(util.inspect(pool, false, null));
                        }
                    });
                }
                else
                {
                    // do nothing?
                }
            });
            res.redirect("/pools");
        }
    });

});

// Function to parse data from the new pool form and model it into the Pool schema
function poolArray(pool, cb)
{
    var picks = {"picks":[],"games":[]};
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

app.listen(process.env.PORT, process.env.IP, function()
{
    console.log("PICKEM SERVER IS LISTENING ON PORT " + process.env.PORT + " AND IP ADDRESS " + process.env.IP);
});