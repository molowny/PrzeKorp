var fs = require('fs');

function getQuery(name) {
  return fs.readFileSync('queries/' + name, 'utf8');
}

var pg = require('pg');
var seraph = require('seraph');

var pgClient = new pg.Client('postgres://olownia@localhost/korpus');
var neoClient = seraph('http://localhost:7474');

neoClient.query(getQuery('clear.cypher'), function () {
  console.log('Clearing neo4j db ...');

  pgClient.connect(function (err) {
    if (err) throw err;

    // pgClient.query(getQuery('glosy.sql'), function(err, result) {
    //   if (err) throw err;
    //   result.rows.forEach(function (row) {
    //     neoClient.query(getQuery('create_glosa.cypher'), row, function(err, results) {
    //       if (err) throw err;
    //       console.log('Glosa: #' + row.id);
    //     });
    //   });
    // });

    // ['NMNS-INTON', 'NMNS_BODY', 'NMNS_HEAD', 'NMNS_EYE_GAZE', 'NMNS-BODY', 'NMNS_EYE_BROWS', 'NMNS_FACE', 'NMNS_INTON', 'NMNS_EYEGAZE', 'NMNS_NOSE'].forEach(function (type) {
    //   neoClient.query(getQuery('create_nmns.cypher'), { type: type }, function(err, results) {
    //     if (err) throw err;
    //     console.log('Nmns: #' + type);
    //   });
    // });

    pgClient.query(getQuery('movies.sql'), function(err, result) {
      if (err) throw err;

      result.rows.forEach(function (movie) {

        pgClient.query({ text: getQuery('tags.sql'), values: [movie.id] }, function(err, result) {
          if (err) throw err;

          var tags = [];

          result.rows.forEach(function (tag) {
            if (['glosa', 'glosa_druga_reka'].indexOf(tag.tier) != -1) {
              tags.push(tag);
              // console.log(tag.timecode_start, tag.timecode_end, tag.tier);

              neoClient.query(getQuery('create_tag_with_glosa.cypher'), tag, function(err, results) {
                if (err) throw err;

                console.log('Tag: #' + tag.id, tag.tier, tag.type_id);
              });
            }

            // select tiers.name from tiers where name ilike 'nmns%'  group by tiers.name
            if (['NMNS-INTON', 'NMNS_BODY', 'NMNS_HEAD', 'NMNS_EYE_GAZE', 'NMNS-BODY', 'NMNS_EYE_BROWS', 'NMNS_FACE', 'NMNS_INTON', 'NMNS_EYEGAZE', 'NMNS_NOSE'].indexOf(tag.tier) != -1) {
              tags.push(tag);
              // console.log(tag.timecode_start, tag.timecode_end, tag.tier);

              neoClient.query(getQuery('create_tag_with_nmns.cypher'), tag, function(err, results) {
                if (err) throw err;

                console.log('Tag: #' + tag.id, tag.tier);
              });
            }

            // tags.push(tag);
            // console.log(tag.timecode_start, tag.timecode_end, tag.tier);
          });

          // tags.forEach(function (tag) {
          //   console.log(tag.timecode_start, tag.timecode_end, tag.tier);

          //   neoClient.query(getQuery('create_tag.cypher'), tag, function(err, results) {
          //     if (err) throw err;

          //     console.log('Tag: #' + tag.id);
          //   });
          // });

          pgClient.end();
        });
      });
    });



    // pgClient.query(tagsQuery, function(err, result) {
    //   if (err) throw err;

    //   result.rows.forEach(function (row) {
    //     // neoClient.query('CREATE (:Tag {id: {id}, from: {timecode_start}, to: {timecode_end}});', row, function(err, results) {
    //     //   if (err) throw err;
    //     //   console.log('Tag: #' + row.id);
    //     // });
    //   });

    //   // result.rows.forEach(function (row) {
    //   //   neoClient.query('MATCH (glosa:Glosa {id: {types_id} }) MATCH (movie:Movie {id: {movies_id}})  MATCH (tag:Tag {id: {id}}) MATCH (prev_tag:Tag {id: {tag_before_id}}) MERGE (glosa)-[:IS_IN]->(movie) MERGE (tag)-[:SHOWS]->(glosa) MERGE (prev_tag)-[:IS_BEFORE]->(tag) MERGE (tag)-[:IS_AFTER]->(prev_tag);', row, function(err, results) {
    //   //     if (err) throw err;
    //   //     console.log('Relations created: #' + row.id);
    //   //     pgClient.end();
    //   //   });
    //   // });
    // });

  });
});
