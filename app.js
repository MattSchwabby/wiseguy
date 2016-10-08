var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    methodOverride = require("method-override"),
    Scores = require("./models/scores"),
    Pool = require("./models/pool"),
    User = require("./models/user"),
    populateScore = require('./nfl'),
    updateScore = require('./updateNFL'),
    schedule = require('node-schedule');
    
// Require Routes
var poolRoutes          = require("./routes/pools"),
    indexRoutes         = require("./routes/index");
    
mongoose.connect("mongodb://localhost/pickem");
    
// const util = require('util');
    
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

app.use(bodyParser.urlencoded({extended: true}));

app.use(methodOverride("_method"));

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

// PASSPORT CONFIGURATION
app.use(require("express-session")(
    {
        secret: "Who is Mike Jones?",
        resave: false,
        saveUninitialized: false
    }));
    
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use("/", indexRoutes);
app.use("/pools", poolRoutes);

app.use(function(req, res, next)
{
   res.locals.currentUser = req.user;
   next();
});


app.listen(process.env.PORT, process.env.IP, function()
{
    console.log("PICKEM SERVER IS LISTENING ON PORT " + process.env.PORT + " AND IP ADDRESS " + process.env.IP);
});