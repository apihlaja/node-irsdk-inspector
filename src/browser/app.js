var io = require('socket.io-client');
var socket = io();
var JSONEditor = require('jsoneditor');

var Constants = require('../Constants');


var data = {};

var viewers = [];

for ( var i = 0; i < 3; ++i ) {
  var viewerEl = document.getElementById('json-viewer-' + i);
  viewers.push(new JSONEditor(viewerEl, {mode: 'view'}));
}

var viewerOrder = ['SessionInfo', 'Telemetry', 'TelemetryDescription'];

function updateViewers() {
  viewerOrder.forEach(function (viewName, index) {
    viewers[index].set(data[viewName]);
    viewers[index].setName(viewName);
    viewers[index].expandAll();
  });
}


// subsribe data updates
socket.on(Constants.data.all, function (sample) {
  data = sample;
  updateViewers();
  // request data again if something missing
  if ( !data.SessionInfo || !data.Telemetry || !data.TelemetryDescription ) {
    setTimeout(function () {
      socket.emit(Constants.request.init);
    }, 2000);
  }
});

// manual data updates..
document.getElementById('refresh-data').addEventListener('click', function() {
  socket.emit(Constants.request.init);
});

  // request data update on connect
socket.on('connect', function () {
  socket.emit(Constants.request.init);
});
