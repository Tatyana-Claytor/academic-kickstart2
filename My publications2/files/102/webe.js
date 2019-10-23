(function() {

  // attach variables to the data object
  _.templateSettings.variable = "data";

  // use {{ data.variable_name }} for escaping HTML
  _.templateSettings.escape = /\{\{(.+?)\}\}/g;

  // use {% arbitrary_JS %} to evaluate JS code
  _.templateSettings.evaluate = /\{\%(.+?)\%\}/g;

  // use {= data.variable_name =} for interpolation
  _.templateSettings.interpolate = /\{\=(.+?)\=\}/g;

})();