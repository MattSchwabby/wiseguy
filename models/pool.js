var mongoose = require("mongoose");

//Pool schema
var poolSchema = new mongoose.Schema({
    name: String,
    author:
    {
      id:
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String,
      name: String
    },
    games:
    [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Scores"
        }    
    ],
    picks:
    [
        {
            gameID: Number,
            winner: String,
            spread: Number,
            toWin: Number
        }    
    ],
   comments:
   [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
},
{
    timestamps: true
});

module.exports = mongoose.model("Pool", poolSchema);