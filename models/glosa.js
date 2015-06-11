var neoClient = require('seraph')('http://localhost:7474');


function Glosa () {}

Glosa.all = function (callback) {
  var query = [
      'MATCH (g:Glosa) RETURN g.name as name, g.id as id;'
  ].join('\n');

  neoClient.query(query, {}, function(err, result) {
    if (err) throw err;
    return callback(result);
  });
}

Glosa.autocomplete = function (query, callback) {
  var query = [
      "MATCH (g:Glosa) WHERE g.name =~ '(?i).*" + query + ".*' RETURN g.name as name, g.id as id;"
  ].join('\n');

  neoClient.query(query, {query: query}, function(err, result) {
    if (err) throw err;
    return callback(result);
  });
}

Glosa.attendance = function (min, max, callback) {
  if (isNaN(min)) {
    min = 1;
  }

  var query = [
      'MATCH (g:Glosa)<-[r:SHOWS]-(t:Tag)',
      'WITH g, count(r) as count',
      isNaN(max) ? 'WHERE count >= {min}' : 'WHERE count >= {min} AND count <= {max}',
      'RETURN g, count ORDER BY count DESC;'
  ].join('\n');

  neoClient.query(query, { min: min, max: max }, function(err, results) {
    if (err) throw err;

    results = results.map(function (result) {
      return result;
    });

    return callback(results);
  });
}

module.exports = Glosa;
