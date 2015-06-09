var neoClient = require('seraph')({ server: 'http://localhost:7474', user: 'neo4j', pass: 'neo4j' });

function Nmns () {}

Nmns.all = function (callback) {
  var query = [
      'MATCH (n:Nmns) RETURN n;'
  ].join('\n');

  neoClient.query(query, {}, function(err, result) {
    if (err) throw err;
    return callback(result);
  });
}

module.exports = Nmns;
