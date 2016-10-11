var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost/pickem';

// var indexUsers = function(db, callback)
// {
//   db.collection('users').createIndex(
//       { "name": "text", "username": "text" },
//       null,
//       function(err, results)
//       {
//          console.log(results);
//          callback();
//       }
//   );
// };
var indexUsers = function(){
    MongoClient.connect(url, function(err, db)
    {
        if(err)
        {
            
        }
        else
        {
        db.collection('users').createIndex(
          { "name": "text", "username": "text" });
    //   assert.equal(null, err);
    //   indexUsers(db, function() {
          db.close();
    //   });
    }
    });
}

indexUsers();

module.exports = indexUsers;