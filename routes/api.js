var express = require('express');
var router = express.Router();

var Nmns = require('../models/nmns');
var Glosa = require('../models/glosa');
var Tag = require('../models/tag');

router.get('/concordance.json', function(req, res, next) {
  Tag.concordance(parseInt(req.query.glosaId), null, parseInt(req.query.distance), function (concordances) {
    res.json(concordances);
  });
});

router.get('/collocation.json', function(req, res, next) {
  Tag.collocation(parseInt(req.query.glosaId), null, parseInt(req.query.distance), function (collocations) {
    res.json(collocations);
  });
});

router.get('/attendance.json', function(req, res, next) {
  Glosa.attendance(parseInt(req.query.min), parseInt(req.query.max), function (attendances) {
    res.json(attendances);
  });
});

router.get('/glosa-autocomplete.json', function(req, res, next) {
  Glosa.autocomplete(req.query.s, function (results) {
    res.json({results: results});
  });
});

module.exports = router;
