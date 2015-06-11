var express = require('express');
var router = express.Router();

var Nmns = require('../models/nmns');
var Glosa = require('../models/glosa');
var Tag = require('../models/tag');

router.get('/concordance', function(req, res, next) {
  Nmns.all(function (nmns) {
    Glosa.all(function (glosa) {
      res.render('search/concordance', {
        nmnsList: nmns,
        glosaList: glosa
      });
    });
  });
});

router.get('/collocation', function(req, res, next) {
  Nmns.all(function (nmns) {
    Glosa.all(function (glosa) {
      res.render('search/collocation', {
        nmnsList: nmns,
        glosaList: glosa
      });
    });
  });
});

router.get('/attendance', function(req, res, next) {
  Nmns.all(function (nmns) {
    Glosa.all(function (glosa) {
      res.render('search/attendance', {
        nmnsList: nmns,
        glosaList: glosa
      });
    });
  });
});

module.exports = router;
