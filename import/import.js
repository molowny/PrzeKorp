var fs = require('fs');

function getQuery(name) {
  return fs.readFileSync('queries/' + name, 'utf8');
}

var pg = require('pg');
var pgClient = new pg.Client('postgres://korpus@127.0.0.1/korpus');
var neoClient = require('seraph')('http://localhost:7474');

function normalizeTime(time) {
  return parseInt(time.replace(/:/g, ''));
}

neoClient.query(getQuery('clear.cypher'), function () {
  console.log('Clearing neo4j db ...');

  pgClient.connect(function (err) {
    if (err) throw err;

    pgClient.query(getQuery('glosy.sql'), function(err, result) {
      if (err) throw err;
      result.rows.forEach(function (row) {
        neoClient.query(getQuery('create_glosa.cypher'), row, function(err, results) {
          if (err) throw err;
          console.log('Glosa: #' + row.id);
        });
      });
    });

    ['NMNS-INTON', 'NMNS_BODY', 'NMNS_HEAD', 'NMNS_EYE_GAZE', 'NMNS-BODY', 'NMNS_EYE_BROWS', 'NMNS_FACE', 'NMNS_INTON', 'NMNS_EYEGAZE', 'NMNS_NOSE'].forEach(function (type) {
      neoClient.query(getQuery('create_nmns.cypher'), { type: type }, function(err, results) {
        if (err) throw err;
        console.log('Nmns: #' + type);
      });
    });

    pgClient.query(getQuery('movies.sql'), function(err, result) {
      if (err) throw err;

      result.rows.forEach(function (movie) {
        pgClient.query({ text: getQuery('tags.sql'), values: [movie.id] }, function(err, result) {
          if (err) throw err;

          var tags = [];

          result.rows.forEach(function (tag) {
            tag.movie = movie.name;

            if (['glosa', 'glosa_druga_reka'].indexOf(tag.tier) != -1) {
              tag.hand = tag.tier == 'glosa' ? 'primary' : 'secondary';

              neoClient.query(getQuery('create_tag_with_glosa.cypher'), tag, function(err, results) {
                if (err) throw err;

                console.log('Tag: #' + tag.id, tag.tier, tag.type_id);
              });
            }

            // select tiers.name from tiers where name ilike 'nmns%'  group by tiers.name
            if (['NMNS-INTON', 'NMNS_BODY', 'NMNS_HEAD', 'NMNS_EYE_GAZE', 'NMNS-BODY', 'NMNS_EYE_BROWS', 'NMNS_FACE', 'NMNS_INTON', 'NMNS_EYEGAZE', 'NMNS_NOSE'].indexOf(tag.tier) != -1) {
              tag.hand = 'primary'; // todo

              neoClient.query(getQuery('create_tag_with_nmns.cypher'), tag, function(err, results) {
                if (err) throw err;

                console.log('Tag: #' + tag.id, tag.tier);
              });
            }
          });
        });

        // pgClient.end();
      });
    });
  });
});
