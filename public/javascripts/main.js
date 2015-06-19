var app = angular.module('korpus', ['angucomplete-alt']);

app.filter('percentage', function ($filter) {
  return function (input, decimals) {
    return $filter('number')(input * 100, decimals) + '%';
  };
});

app.directive('timeline', function ($parse, $timeout) {
  return {
    restrict: 'E',
    replace: true,
    scope: { data: '=', glosa: '=' },
    template: '<div class="timeline"><video height="180" preload="none" controls></video><div class="chart"></div></div>',

    link: function (scope, element, attrs) {
      if (!element.find('video').attr('src')) {
        var videoSrc = '/video/' + scope.data.movie + '?from=' + scope.data.from + '&to=' + scope.data.to;
        var posterSrc = '/video/poster/' + scope.data.movie + '?from=' + scope.data.from + '&to=' + scope.data.to;
        element.find('video').attr('poster', posterSrc);
        element.find('video').attr('src', videoSrc);
      }

      var $details = $('<div class="details"></div>');
      element.append($details);
      $details.html(scope.data.movie + ': <strong>' + scope.data.from + '</strong> - <strong>' + scope.data.to + '</strong>');

      var $chart = element.find('.chart');

      $timeout(function () {
        var items = scope.data.items.map(function (node) {
          return {
            id: node.id,
            current: node.glosa.glosaId === scope.glosa ? true : false,
            glosa: node.glosa.name !== undefined ? node.glosa.name : node.value,
            start: node.tag.timecode_start,
            end: node.tag.timecode_end,
            type: node.glosa.type !== undefined ? 'nmns' : node.hand
          };
        });

        // console.log(items);

        var types = ['primary', 'secondary', 'nmns'];

        var timeBegin = _.min(items, 'start').start;
        var timeEnd = _.max(items, 'end').end;

        var miniItemHeight = 10;
        var width = $chart.width();
        var height = $chart.height();
        var miniHeight = types.length * (miniItemHeight + 5);
        var mainHeight = height - miniHeight;

        var x = d3.scale.linear()
            .domain([timeBegin, timeEnd])
            .range([0, width]);

        var xSelected = d3.scale.linear()
            .range([0, width]);

        var y = d3.scale.linear()
            .domain([0, types.length])
            .range([0, mainHeight]);

        var yMini = d3.scale.linear()
            .domain([0, types.length])
            .range([0, miniHeight]);

        var xAxis = d3.svg.axis()
            .orient('top')
            .scale(x);

        var brush = d3.svg.brush()
            .x(x)
            .on('brush', display);

        var chart = d3.select($chart[0])
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'timeline-chart');

        chart.append('defs').append('clipPath')
          .attr('id', 'clip')
          .append('rect')
          .attr('width', width)
          .attr('height', mainHeight);

        // var xAxisGroup = chart.append('g')
        //     .attr('transform', 'translate(0,' + height + ')')
        //     .call(xAxis);

        var main = chart.append('g')
            .attr("transform", "translate(" + 0 + "," + 0 + ")")
            .attr('width', width)
            .attr('height', miniHeight)
            .attr('class', 'main');

        var itemRects = main.append('g')
            .attr('clip-path', 'url(#clip)');

        var mini = chart.append('g')
            // .attr("transform", "translate(" + 50 + "," + (0) + ")")
            .attr("transform", "translate(" + 0 + "," + mainHeight + ")")
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'mini');

        // mini.append("g").selectAll(".typeText")
        //   .data(types)
        //   .enter().append("text")
        //   .text(function(d) {return d;})
        //   .attr("x", 0)
        //   .attr("y", function(d, i) {return y(i + .5);})
        //   .attr("dy", ".5ex")
        //   .attr("text-anchor", "end")
        //   .attr("class", "typeText");

        mini.append('g').selectAll('items')
          .data(items)
          .enter().append('rect')
          .attr('class', function (d) {return 'item item-' + (d.current === true ? 'current' : d.type);})
          .attr('x', function (d) { return x(d.start); })
          .attr('y', function (d) { return yMini(types.indexOf(d.type) + .5) - 5;})
          .attr('width', function(d) {return x(d.end) - x(d.start);})
          .attr('height', miniItemHeight)
          .attr('stroke', 'white');

        // mini.append('g').selectAll('.labels')
        //   .data(items)
        //   .enter().append('text')
        //   .text(function (d) { return d.glosa.substr(0, 1); }) // label
        //   .attr('x', function (d) { return x(d.start); })
        //   .attr('y', function (d) { return y(types.indexOf(d.type) + .5); })
        //   .attr('dy', '.5ex')
        //   .attr('fill', 'white');

        mini.append('g')
          .attr('class', 'x brush')
          .call(brush)
          .selectAll('rect')
          .attr('y', 1)
          .attr('height', miniHeight - 1);

        display();

        function display () {
          var rects;
          var labels;
          var minExtent = brush.extent()[0];
          var maxExtent = brush.extent()[1];

          var visItems = items.filter(function (d) {
            return d.start < maxExtent && d.end > minExtent;
          });

          mini.select('.brush')
            .attr('fill-opacity', '.7')
            .attr('fill', '#0d5fa6')
            .attr('stroke-width', '2')
            .attr('stroke', 'white')
            .call(brush.extent([minExtent, maxExtent]));

          xSelected.domain([minExtent, maxExtent]);

          rects = itemRects.selectAll('rect')
            .data(visItems, function (d) { return d.id; })
            // .data(visItems)
            .attr('x', function (d) {return xSelected(d.start);})
            .attr('width', function (d) {return xSelected(d.end) - xSelected(d.start);});

          rects.enter().append('rect')
            .attr('class', function (d) {return 'item item-' + d.type;})
            .attr('x', function (d) {return xSelected(d.start);})
            .attr('y', function (d) {return y(types.indexOf(d.type));})
            .attr("width", function (d) {return xSelected(d.end) - xSelected(d.start);})
            .attr("height", function (d) {return .8 * y(1);})
            // .attr('fill', '#38424d')
            .attr('stroke', 'white');

          rects.exit().remove();

          labels = itemRects.selectAll('text')
            .data(visItems, function (d) { return d.id; })
            .attr('x', function (d) {return xSelected(Math.max(d.start, minExtent)) + 15;});

          labels.enter().append('text')
            .text(function (d) {return d.glosa;})
            .attr('x', function (d) {return xSelected(Math.max(d.start, minExtent));})
            .attr('y', function (d) {return y(types.indexOf(d.type) + .5);})
            // .attr('text-anchor', 'start')
            .attr('fill', 'white');
            // .on('mouseover', function (d) { console.log(d, this, 'over') })
            // .on('mouseout', function () { console.log('out') });

          labels.exit().remove();
        }

        // d3.select(window).on('resize', resize);

        // function resize () {
        //   // http://stackoverflow.com/questions/9400615/whats-the-best-way-to-make-a-d3-js-visualisation-layout-responsive
        // }
      }, 100);
    }
  };
});

app.service('SearchApi', function ($http, $q) {
  return {
    concordance: function (query) {
      var deferred = $q.defer();

      $http.get('/api/concordance.json', { params: query })
        .success(function (concordances) {
          deferred.resolve(concordances);
        })
        .error(function (msg) {
          deferred.reject(msg);
        });

      return deferred.promise;
    },

    collocation: function (query) {
      var deferred = $q.defer();

      $http.get('/api/collocation.json', { params: query, cache: true })
        .success(function (collocations) {
          deferred.resolve(collocations);
        })
        .error(function (msg) {
          deferred.reject(msg);
        });

      return deferred.promise;
    },

    attendance: function (query) {
      var deferred = $q.defer();

      $http.get('/api/attendance.json', { params: query, cache: true })
        .success(function (attendances) {
          deferred.resolve(attendances);
        })
        .error(function (msg) {
          deferred.reject(msg);
        });

      return deferred.promise;
    },

    glosa: function (id) {
      var deferred = $q.defer();

      $http.get('/api/glosa.json', { params: { id: id }, cache: true })
        .success(function (glosa) {
          deferred.resolve(glosa);
        })
        .error(function (msg) {
          deferred.reject(msg);
        });

      return deferred.promise;
    }
  };
});

app.controller('concordance', function ($scope, SearchApi) {
  $scope.query = { glosaId: null, distance: 5, hand: 'primary' };
  $scope.concordances = [];

  $scope.$watchCollection('autocomplete', function () {
    if ($scope.autocomplete) {
      $scope.query.glosaId = $scope.autocomplete.originalObject.id;
    }
  });

  $scope.$watchCollection('query', function () {
    if ($scope.query.glosaId) {
      SearchApi.concordance($scope.query).then(function (concordances) {
        $scope.concordances = concordances;
      });
    }
  });
});

app.controller('collocation', function ($scope, SearchApi) {
  $scope.query = { glosaId: null, distance: 3 };
  $scope.collocations = [];

  $scope.$watchCollection('autocomplete', function () {
    if ($scope.autocomplete) {
      $scope.query.glosaId = $scope.autocomplete.originalObject.id;
    }
  });

  $scope.$watchCollection('query', function () {
    if ($scope.query.glosaId) {
      SearchApi.collocation($scope.query).then(function (collocations) {
        $scope.collocations = collocations;
      });
    }
  });

  $scope.show = function (collocation) {
    SearchApi.glosa(collocation.id).then(function (glosa) {
      collocation.videoSrc = '/video/' + glosa.t.movie + '?from=' + glosa.t.timecode_start + '&to=' + glosa.t.timecode_end;
    });
  }
});

app.controller('attendance', function ($scope, SearchApi) {
  $scope.query = { min: 30, max: null };
  $scope.attendances = [];

  $scope.$watchCollection('query', function () {
    if ($scope.query.min) {
      SearchApi.attendance($scope.query).then(function (attendances) {
        $scope.attendances = attendances;
      });
    }
  });

  $scope.show = function (attendance) {
    SearchApi.glosa(attendance.id).then(function (glosa) {
      attendance.videoSrc = '/video/' + glosa.t.movie + '?from=' + glosa.t.timecode_start + '&to=' + glosa.t.timecode_end;
    });
  }
});
