var https = require('https');
var csv = require('csv');
var fs = require('fs');
var path = require('path');

var spreadsheetLink = 'https://docs.google.com/spreadsheets/d/1Mpc5wgmHXegFi_pb4_VJX0RtiNIQ9ImFL1troHJ9mb4/pub?output=csv';
var regexp = new RegExp(/lat:\s([\d-]{1,4}\.\d{1,6})\slong:\s([\d-]{1,4}\.\d{1,6})\sspeed:\s([\d-]{1,4}\.\d{1,6})\s(.+?)\s(.+?)\s(.+?)\s.+$/gi);

var applyTemplate = function (lon, lat, props) {
  return {
    'type': 'Feature',
    'properties': props,
    'geometry': {
      'type': 'Point',
      'coordinates': [parseFloat(lat, 10), parseFloat(lon, 10)]
    }
  };
};

var writeFile = function (path, data) {
  fs.writeFile(path, data, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log('file written');
  });
};

var req = https.get(spreadsheetLink, function (res) {
  var data = '';
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    data += chunk;
  });

  res.on('end', function () {
    csv.parse(data, function (e, d) {
      console.log('prefilter', d);
      var coords = d.filter(function (row) {
        return row && row[1] && row[1].substr(0, 4) === 'lat:';
      });
      var innerGeojson = coords.map(function (c) {
        var point = c[1].replace(regexp, '$1,$2,$5,$4').split(',');
        return applyTemplate(point[0], point[1], {
          'time': point[2],
          'data': point[3]
        });
      });
      var geojson = {
        'type': 'FeatureCollection',
        'features': innerGeojson
      };
      writeFile(path.join(__dirname, 'path.json'), JSON.stringify(geojson, null, 2));
    });
  });
});
