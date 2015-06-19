var fs = require('fs');

function getQuery(name) {
  return fs.readFileSync(__dirname + '/queries/' + name, 'utf8');
}

var pg = require('pg');
var pgClient = new pg.Client('postgres://olownia@localhost/korpus');
// var pgClient = new pg.Client('postgres://korpus:korpus123@localhost/korpus');
var neoClient = require('seraph')('http://localhost:7474');

// neoClient.query(getQuery('merge_tags.cypher'), function () {
//   console.log('merged');
// });

pgClient.connect(function (err) {
  if (err) throw err;

  pgClient.query(getQuery('movies.sql'), function(err, result) {
    if (err) throw err;

    var txn = neoClient.batch();

    result.rows.forEach(function (movie) {
      txn.query(getQuery('merge_tags.cypher'), movie, function(err, results) {
        if (err) throw err;
        console.log('merged: ' + movie.name);
      });
    });

    txn.commit(function (err, results) {
      pgClient.end();
    });
  });
});
