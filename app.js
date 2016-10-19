var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),
    Scores          = require("./models/scores"),
    Comment         = require("./models/comment"),
    Pool            = require("./models/pool"),
    User            = require("./models/user"),
    refreshNFLGames = require('./refreshNFLGames'),
    updateNFLScores = require('./updateNFLScores'),
    indexUsers      = require('./indexUsers'),
    favicon         = require('serve-favicon'),
    schedule        = require('node-schedule');
    
    
// Require Routes
var commentRoutes       = require("./routes/comments"),
    poolRoutes          = require("./routes/pools"),
    userRoutes          = require("./routes/user"),
    searchRoutes          = require("./routes/search"),
    indexRoutes         = require("./routes/index"),
    feedRoutes         = require("./routes/feed");
    
    
// Schedule rule to update games in DB
var weeklyRule = new schedule.RecurrenceRule();
weeklyRule.dayOfWeek = 3;
weeklyRule.hour = 14;
weeklyRule.minute = 40;
 
 
// Scheduled task to populate a new set of NFL scores each week
var weeklyJob = schedule.scheduleJob(weeklyRule, function()
{
    refreshNFLGames();
});


// Schedule rule to update game scores every minute
var minutes = 1, the_interval = minutes * 60 * 1000;
setInterval(function() {
    updateNFLScores();
}, the_interval);
 

// var updateRule = new schedule.RecurrenceRule();
// updateRule.minute = 5;
 
// var updateJob = schedule.scheduleJob(updateRule, function()
// {
//   updateScore();
// });


// UNCOMMENT THE BELOW LINE BEFORE PUSHING TO PROD
app.set('port', (process.env.PORT || 8080));

//*************************
// DATABASE CONNECTION
//*************************

mongoose.connect('mongodb://localhost:27017/pickem');


app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(flash());


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

app.use(function(req, res, next)
{
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

indexUsers();

app.use("/", indexRoutes);
app.use("/pools", poolRoutes);
app.use("/users", userRoutes);
app.use("/search", searchRoutes);
app.use("/feed", feedRoutes);
app.use("/pools/:id/comments", commentRoutes);


// UNCOMMENT BELOW CODE FOR CLOUD9 USAGE

// app.listen(process.env.PORT, process.env.IP, function()
// {
//     console.log("PICKEM SERVER IS LISTENING ON PORT " + process.env.PORT + " AND IP ADDRESS " + process.env.IP);
// });


// UNCOMMENT BELOW CODE FOR PROD
app.listen(app.get('port'), function() {
  console.log("Wiseguy is running at localhost:" + app.get('port'));
})