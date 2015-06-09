var express = require('express');
var router = express.Router();

var Nmns = require('../models/nmns');
var Glosa = require('../models/glosa');
var Tag = require('../models/tag');

router.get('/concordance.json', function(req, res, next) {
  Tag.all(parseInt(req.query.glosaId), null, parseInt(req.query.distance), function (tags) {
    res.json(tags);
  });
});

module.exports = router;
