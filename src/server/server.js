console.log('Starting...');

var path = require('path');
var childProcess = require("child_process");
var compression = require('compression');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var IrSdk = require('node-irsdk');

var Constants = require('../Constants');
var config = require('../../config.json');

IrSdk.init({
  telemetryUpdateInterval: 1000,
  sessionInfoUpdateInterval: 2000,
  sessionInfoParser: require('./telemetry/parseSessionInfo')
});

var store = {};

var iracing = IrSdk.getInstance();

iracing.on('TelemetryDescription', function (data) {
  store.TelemetryDescription = data;
});

iracing.on('Telemetry', function (data) {
  store.Telemetry = data;
});

iracing.on('SessionInfo', function (data) {
  store.SessionInfo = data;
});

app.use(compression());
app.use(require('less-middleware')(__dirname+'/../../src/browser/style', {
  dest: __dirname+'/../../public',
  debug: true
}));
app.use('/', express.static('public'));

server.listen(config.http.port);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// serve jsoneditor icons
app.get('/img/jsoneditor-icons.svg', function (req, res) {
  res.sendFile(path.join(__dirname,
    '../../node_modules/jsoneditor/dist/img/jsoneditor-icons.svg'));
});

io.on('connection', function (socket) {
  socket.on(Constants.request.init, function () {
    socket.emit(Constants.data.all, store);
  });
});

var url = 'http://localhost:'+config.http.port;

console.log('Ready: ' + url + "\n");

if ( config.launchBrowser ) {
  console.log('browser launching: waiting for sim...');
  // wait for sessionInfo to be available
  var waitForSessionInfoId = setInterval(function (){
    if ( store.SessionInfo ) {
      console.log('opening browser...');
      clearInterval(waitForSessionInfoId);
      childProcess.exec('start ' + url);
    }
  }, 1000);
}
