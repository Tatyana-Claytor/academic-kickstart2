/**
 * Primary library for WebEdition
 */
(function() {

  var Webe = function() {
    return Webe.fn.init();
  };

  Webe.fn = Webe.prototype = {
    init: function() {
      this.data = {};
      return this;
    },
    Webe: '0.1.0'
  };

  if(!window.Webe) {
    window.Webe = Webe;
  }
  if(!window.Webe) {
    window.Webe = new Webe();
  }

  Webe.utils = {};

  window.WebeData = {};

})();