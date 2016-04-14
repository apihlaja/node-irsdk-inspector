var yaml = require('js-yaml');

// custom parser for session info, 
// see https://github.com/apihlaja/node-irsdk/issues/2
module.exports = function (sessionInfoStr) {
  var fixedYamlStr = sessionInfoStr.replace(/TeamName: ([^\n]+)/g, function (match,p1) {
    
    if ( (p1[0] === '"' && p1[p1.length-1] ===  '"' ) ||
         (p1[0] === "'" && p1[p1.length-1] ===  "'" ) ) //eslint-disable-line
    {
      return match; // skip if quoted already
    } else {
      // 2nd replace is unnecessary atm but its here just in case
      return "TeamName: '" + p1.replace(/'/g, "''") + "'";
    }
  });
  return yaml.safeLoad(fixedYamlStr);
};