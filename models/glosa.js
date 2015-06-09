var neoClient = require('seraph')('http://localhost:7474');


function Glosa () {}

Glosa.all = function (callback) {
  var query = [
      'MATCH (g:Glosa) RETURN g.name as name, g.id as id LIMIT 100;'
  ].join('\n');

  neoClient.query(query, {}, function(err, result) {
    if (err) throw err;
    return callback(result);
  });
}

module.exports = Glosa;
