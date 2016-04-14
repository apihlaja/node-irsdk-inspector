var io = require('socket.io-client');
var socket = io();
var JSONEditor = require('jsoneditor');

var Constants = require('../Constants');


var data = {}; // irsdk data objects

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
    // by default, jsoneditor collapses all when json is updated
    viewers[index].expandAll();
  });
}


// subsribe data updates
Object.keys(Constants.update).forEach(function (type) {
  socket.on(Constants.update[type], function (sample) {
    data[type] = sample;
    updateViewers();
  });
});

// manual data updates..
document.getElementById('refresh-data').addEventListener('click', function() {
  socket.emit(Constants.request.init);
});

socket.on('connect', function () {
  // request data update on connect
  socket.emit(Constants.request.init);
});
