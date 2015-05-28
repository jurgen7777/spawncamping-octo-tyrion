var MongoClient = require('mongodb').MongoClient,
  assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/school';
var items_to_delete = [];
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");

  db.collection("students").find({}).toArray(function(err, result) {
    assert.equal(null, err);
    for (var i = 0; i < result.length; i++) {

      var res = result[i];
      var min_score = Infinity;

      for (var j = 0; j < res["scores"].length; j++) {
        var score = res["scores"][j];
        if (score.type !== 'homework') continue;
        min_score = Math.min(min_score, score.score);
      }

      if (min_score != Infinity) {
        items_to_delete.push({
          "_id": res["_id"],
          "score": min_score
        });
      }

    }
    delete_min_score(db, items_to_delete);

  });


});


function delete_min_score(db, arr) {

  if (arr.length < 1) {
    db.close();
    console.log("Done");
    return;
  }

  var next = arr.splice(0, 1)[0];
  var score = next["score"];


  db.collection("students").update({
    "_id": next["_id"]
  }, {
    $pull: {
      scores: {
        type: "homework",
        score: next["score"]
      }
    }
  }, function(err, result) {
    if (err) throw err;
    delete_min_score(db, arr);
  });
}
