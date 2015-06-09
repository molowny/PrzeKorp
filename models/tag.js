var _ = require('lodash');

var neoClient = require('seraph')({ server: 'http://localhost:7474', user: 'neo4j', pass: 'neo4j' });

function Tag () {}

function normalizeTime(time) {
  var parts = time.split(':');
  var seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  return seconds + parseInt(parts[3]) * 0.01;
}

// CREATE INDEX ON :Glosa(id)

Tag.all = function (glosaId, nmns, distance, callback) {
  var query = [
      'MATCH path=(g)<-[s:SHOWS]-(t:Tag)-[r:NEXT*..' + distance + ']-(t2:Tag)-[s2:SHOWS]->(g2)',
      'WHERE g.id = {glosaId}',
      // 'WHERE t2.id = 465867',
      'RETURN g, g2, s, s2, collect(distinct t.movie) as movie, nodes(path) as path;'
  ].join('\n');

  neoClient.query(query, { glosaId: glosaId, nmns: nmns }, function(err, results) {
    if (err) throw err;

    results = results.map(function (result) {
      result.movie = result.movie[0];
      result.g = result.g.name;

      var glosa = result.path.shift();
      var tag = result.path.shift();

      tag.raw_timecode_start = tag.timecode_start;
      tag.raw_timecode_end = tag.timecode_end;
      tag.timecode_start = normalizeTime(tag.timecode_start);
      tag.timecode_end = normalizeTime(tag.timecode_end);

      result.fromGlosa = {
        glosa: glosa,
        tag: tag,
        hand: result.s.properties.hand
      };

      var glosa = result.path.pop();
      var tag = result.path.pop();

      tag.raw_timecode_start = tag.timecode_start;
      tag.raw_timecode_end = tag.timecode_end;
      tag.timecode_start = normalizeTime(tag.timecode_start);
      tag.timecode_end = normalizeTime(tag.timecode_end);

      result.toGlosa = {
        glosa: glosa,
        tag: tag,
        hand: result.s2.properties.hand
      };

      return result;
    });

    var tags = [];

    // console.log(results);

    _.forEach(results, function (tag) {
      tags.push(tag.fromGlosa);
      tags.push(tag.toGlosa);
    });

    tags = _.uniq(tags, function (tag) {
      return tag.tag.id;
    });

    tags = _.sortBy(tags, function (tag) {
      return tag.tag.timecode_start;
    });

    tags = _.groupBy(tags, function (tag) {
      return tag.tag.movie;
    });

    var result = [];

    _.forEach(tags, function (movieTags, movie) {
      var breakDuration = 10;
      var start = 0, items = [];

      _.forEach(movieTags, function (tag, i) {
        if ((tag.tag.timecode_start - start > breakDuration || i + 1 == movieTags.length) && items.length > 0) {
          result.push({
            movie: movie,
            from: _.min(items, function (t) { return t.tag.timecode_start; }).tag.raw_timecode_start,
            to: _.max(items, function (t) { return t.tag.timecode_end; }).tag.raw_timecode_end,
            items: items
          });

          items = [tag];
        } else {
          items.push(tag);
          start = tag.tag.timecode_start;
        }


      });
    });

    return callback(result);
  });
}

module.exports = Tag;
