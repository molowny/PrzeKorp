var fs = require('fs');

function getQuery(name) {
  return fs.readFileSync('queries/' + name, 'utf8');
}

var pg = require('pg');
var pgClient = new pg.Client('postgres://olownia@localhost/korpus');
var neoClient = require('seraph')('http://localhost:7474');

neoClient.query(getQuery('merge_tags.cypher'), function () {
  console.log('merged');
});