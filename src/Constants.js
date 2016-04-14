var constantina = require('constantina');

module.exports = constantina({
  'request': ['init'],
  'update': ['Telemetry', 'TelemetryDescription', 'SessionInfo']
});
