var express = require('express');
var router = express.Router();

var Nmns = require('../models/nmns');
var Glosa = require('../models/glosa');
var Tag = require('../models/tag');

router.get('/', function(req, res, next) {
  res.render('help/index', {});
});

module.exports = router;
