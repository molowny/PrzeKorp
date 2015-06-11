var fs = require('fs');

function getQuery(name) {
  return fs.readFileSync(__dirname + '/queries/' + name, 'utf8');
}

var pg = require('pg');
// var pgClient = new pg.Client('postgres://korpus:korpus123@localhost/korpus');
var pgClient = new pg.Client('postgres://olownia@localhost/korpus');
var neoClient = require('seraph')('http://localhost:7474');

neoClient.query(getQuery('clear.cypher'), function () {
  console.log('Clearing neo4j db ...');

  pgClient.connect(function (err) {
    if (err) throw err;

    pgClient.query(getQuery('glosy.sql'), function(err, result) {
      if (err) throw err;

      var txnGlosa = neoClient.batch();

      result.rows.forEach(function (row) {
        txnGlosa.query(getQuery('create_glosa.cypher'), row, function(err, results) {
          if (err) throw err;
          // console.log('Glosa: #' + row.id);
        });
      });

      txnGlosa.commit(function (err, results) {
        if (err) throw err;
        console.log('Glos: ' + results.length);

        var txnNmns = neoClient.batch();

        ['NMNS-INTON', 'NMNS_BODY', 'NMNS_HEAD', 'NMNS_EYE_GAZE', 'NMNS-BODY', 'NMNS_EYE_BROWS', 'NMNS_FACE', 'NMNS_INTON', 'NMNS_EYEGAZE', 'NMNS_NOSE'].forEach(function (type) {
          txnNmns.query(getQuery('create_nmns.cypher'), { type: type }, function(err, results) {
            if (err) throw err;
            // console.log('Nmns: #' + type);
          });
        });

        txnNmns.commit(function (err, results) {
          if (err) throw err;
          console.log('NMNS: ' + results.length);

          pgClient.query(getQuery('tags.sql'), function(err, result) {
            if (err) throw err;

            console.log('Tags in postgres: ' + result.rows.length);

            var txnTag = neoClient.batch();

            result.rows.forEach(function (tag) {
              if (['glosa', 'glosa_druga_reka'].indexOf(tag.tier) != -1) {
                tag.hand = tag.tier == 'glosa' ? 'primary' : 'secondary';

                txnTag.query(getQuery('create_tag_with_glosa.cypher'), tag, function(err, results) {
                  if (err) throw err;

                  // console.log('Tag: #' + tag.id, tag.tier, tag.type_id);
                });
              }

              // select tiers.name from tiers where name ilike 'nmns%'  group by tiers.name
              if (['NMNS-INTON', 'NMNS_BODY', 'NMNS_HEAD', 'NMNS_EYE_GAZE', 'NMNS-BODY', 'NMNS_EYE_BROWS', 'NMNS_FACE', 'NMNS_INTON', 'NMNS_EYEGAZE', 'NMNS_NOSE'].indexOf(tag.tier) != -1) {
                tag.hand = 'primary'; // todo

                txnTag.query(getQuery('create_tag_with_nmns.cypher'), tag, function(err, results) {
                  if (err) throw err;

                  // console.log('Tag: #' + tag.id, tag.tier);
                });
              }
            });

            txnTag.commit(function (err, results) {
              if (err) throw err;
              console.log('Loaded tags: ' + results.length);
              pgClient.end();
            });
          });

          // pgClient.query(getQuery('movies.sql'), function(err, result) {
          //   if (err) throw err;

          //   result.rows.forEach(function (movie) {
          //   });
          //   // pgClient.end();
          // });
        });
      });
    });
  });
});
