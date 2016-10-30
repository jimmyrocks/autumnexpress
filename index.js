var https = require('https');
var csv = require('csv');

var spreadsheetLink = 'https://docs.google.com/spreadsheets/d/1Mpc5wgmHXegFi_pb4_VJX0RtiNIQ9ImFL1troHJ9mb4/pub?output=csv';
var regexp = new RegExp(/lat:\s([\d-]{1,4}\.\d{1,6})\slong:\s([\d-]{1,4}\.\d{1,6})\sspeed:\s([\d-]{1,4}\.\d{1,6})\s(.+?)\s(.+?)\s(.+?)\s.+$/gi);

var req = https.get(spreadsheetLink, function (res) {
  var data = '';
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    data += chunk;
  });

  res.on('end', function () {
    csv.parse(data, function (e, d) {
      var coords = d.filter(function (row) {
        return row && row[1] && row[1].substr(0, 4) === 'lat:';
      });
      console.log(coords.map(function (c) {
        return c[1].replace(regexp, '$1,$2,$5,$4').split(',');
      }));
    });
  });
});
