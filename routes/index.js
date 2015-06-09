var express = require('express');
var router = express.Router();

var Nmns = require('../models/nmns');
var Glosa = require('../models/glosa');
var Tag = require('../models/tag');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/search/concordance');
});

module.exports = router;
