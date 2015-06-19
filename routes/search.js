var express = require('express');
var router = express.Router();

var Nmns = require('../models/nmns');
var Glosa = require('../models/glosa');
var Tag = require('../models/tag');

router.get('/concordance', function(req, res, next) {
  Nmns.all(function (nmns) {
    res.render('search/concordance', {
      nmnsList: nmns
    });
  });
});

router.get('/collocation', function(req, res, next) {
  Nmns.all(function (nmns) {
    res.render('search/collocation', {
      nmnsList: nmns
    });
  });
});

router.get('/attendance', function(req, res, next) {
  Glosa.count(function (count) {
    res.render('search/attendance', {
      glosaCount: count
    });
  });
});

module.exports = router;
