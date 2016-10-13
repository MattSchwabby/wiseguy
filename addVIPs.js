var mongoose = require("mongoose"),
    User = require("./models/user");
    
var VIPs =
[
    "57ffba12beb17619d9a5ffd0"
];
    
function addVIPs(newUser, VIPs)
{
    VIPs.forEach(function(VIP)
    {
        User.findById(newUser, function(error, foundNewUser)
        {
            if(error)
            {
                console.log("ERROR RETRIEVING A USER WHEN ADDING A VIP TO THEIR FOLLOWING");
                console.log(error);
            }
            else
            {
                User.findById(VIP, function(error, foundVIP)
                {
                    if(error)
                    {
                        console.log("ERROR RETRIEVING VIP WHEN ADDING A FOLLOWER");
                        console.log(error);
                    }
                    else
                    {
                        foundVIP.followers.push(newUser);
                        foundVIP.save();
                        foundNewUser.following.push(VIP);
                        foundNewUser.save();
                        console.log(newUser + " STARTED FOLLOWING " + VIP);
                    }
                });
            }
        });
    });
}

function callAddVIPs(newUser)
{
    addVIPs(newUser, VIPs);
}
    
module.exports = callAddVIPs;