# Routes
name            url                 verb            description
=================================================================
INDEX           /pools              GET             Show all pick em games for this user for all time
NEW             /pools/new          GET             Display form for user to create new pool for this week
CREATE          /pools              POST            Add a new pool to the db
Show            /pools/:id          GET             Show info about one pool

# DB Schemas
=================================================================
//POOL
var poolSchema = new mongoose.Schema({
    name: String,
    week: Number,
    games: [
        {
            week: Number,
            home: String,
            away: String,
            homeScore: Number,
            awayScore: Number,
            winPick: String,
            spread: Number,
            toWin: Number
        }
    ]
});

var Pool = mongoose.model("Pool", poolSchema);

//USER - email, name
var userSchema = new mongoose.Schema({
    email: String,
    name: String,
    pools: 
    [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pool"
        }    
    ]
});