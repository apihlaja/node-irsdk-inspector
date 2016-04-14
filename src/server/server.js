console.log('Starting...');

var path = require('path');
var compression = require('compression');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var sass = require('node-sass-middleware');
var IrSdk = require('node-irsdk');

var Constants = require('../Constants');
var config = require('../../config.json');

IrSdk.init({
  telemetryUpdateInterval: 1000,
  sessionInfoUpdateInterval: 2000,
  sessionInfoParser: require('./telemetry/parseSessionInfo')
});

var telemetry, telemetryDescription, sessionInfo;

var iracing = IrSdk.getInstance();

iracing.on('TelemetryDescription', function (data) {
  telemetryDescription = data;
});

iracing.on('Telemetry', function (data) {
  telemetry = data;
});

iracing.on('SessionInfo', function (data) {
  sessionInfo = data;
});

app.use(compression());
app.use(sass({
  src: 'src/browser/style',
  dest: 'public'
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
    socket.emit(Constants.update.Telemetry, telemetry);
    socket.emit(Constants.update.TelemetryDescription, telemetryDescription);
    socket.emit(Constants.update.SessionInfo, sessionInfo);
  });
});

console.log('Ready: http://localhost:'+config.http.port, '\n');