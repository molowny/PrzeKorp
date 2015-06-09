var neoClient = require('seraph')('http://localhost:7474');

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
