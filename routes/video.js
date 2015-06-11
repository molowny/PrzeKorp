var express = require('express');
var router = express.Router();


var childProcess = require('child_process');
var fs = require('fs');
var path = require('path');

router.get('/:file', function(req, res, next) {
  // tmp
  req.params.file = 'K06BF01-13';

  var convertTo = 'mp4';
  var fileName = req.params.file + '.mov';
  var file = path.join('./video',  fileName);
  var from = (req.query.from + '0').replace(/:(?![\s\S]*:)/, '.');
  var to = (req.query.to + '0').replace(/:(?![\s\S]*:)/, '.');
  var outputFileName = from + '-' + to + '-' + fileName.replace('mov', convertTo);
  var outputFile = path.join('./video/cuts', outputFileName);

  res.setHeader('Content-Disposition', 'inline; filename=' + outputFileName);
  res.setHeader('Content-Type', 'video/' + convertTo);

  fs.exists(outputFile, function (exists) {
    // if (exists) {
    if (false) {
      var stat = fs.statSync(outputFile);
      res.setHeader('Content-Length', stat.size);

      var cut = fs.createReadStream(outputFile);
      cut.pipe(res);
    } else {
      var args = ['-i', file, '-ss', from, '-to', to, '-c:v', 'copy', '-c:a', 'copy', '-y', outputFile];
      var ffmpeg = childProcess.spawn('ffmpeg', args, null);

      ffmpeg.stderr.on('data', function (data) {
        console.log(data.toString());
      });

      ffmpeg.stdout.on('end', function (data) {
        var stat = fs.statSync(outputFile);
        res.setHeader('Content-Length', stat.size);

        var cut = fs.createReadStream(outputFile);
        cut.pipe(res);
      });
    }
  });
});

router.get('/poster/:file', function(req, res, next) {
  // tmp
  req.params.file = 'K06BF01-13';

  var convertTo = 'jpg';
  var fileName = req.params.file + '.mov';
  var file = path.join('./video',  fileName);
  var from = (req.query.from + '0').replace(/:(?![\s\S]*:)/, '.');
  var to = (req.query.to + '0').replace(/:(?![\s\S]*:)/, '.');
  var outputFileName = from + '-' + to + '-' + fileName.replace('mov', convertTo);
  var outputFile = path.join('./video/cuts', outputFileName);

  res.setHeader('Content-Disposition', 'inline; filename=' + outputFileName);
  res.setHeader('Content-Type', 'image/' + convertTo);

  fs.exists(outputFile, function (exists) {
    if (exists) {
      var cut = fs.createReadStream(outputFile);
      cut.pipe(res);
    } else {
      var args = ['-ss', from, '-i', file, '-t', '1', '-s', '640x360', '-y', outputFile];
      var ffmpeg = childProcess.spawn('ffmpeg', args, null);

      ffmpeg.stderr.on('data', function (data) {
        // console.log(data.toString());
      });

      ffmpeg.stdout.on('end', function (data) {
        var cut = fs.createReadStream(outputFile);
        cut.pipe(res);
      });
    }
  });
});

module.exports = router;
