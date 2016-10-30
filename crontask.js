var CronJob = require('cron').CronJob;

var exec = require('child_process').exec;
var path = require('path');
var tick = 0;

var job = new CronJob({
  cronTime: '30 * * * * *',
  onTick: function () {
    tick += 1;
    console.log('tick #' + tick);
    exec('/bin/bash ' + path.join(__dirname, 'checkAndUpload.sh'));
  },
  start: false,
  timeZone: 'America/New_York'
});
job.start();
