/**
 * Rules.js
 *
 *
 * 
 * 
 */

(function($){

  /**
   * Get validation messages
   * @param {String} rule the rule name
   */
  $.fn.WebEditionValidationMessage = function(rule){
    
    var $element = $(this);

    if (WebeData.messages[rule][$element.attr('name')] !== undefined) {
      return WebeData.messages[rule][$element.attr('name')];
    } else {
      return "Please double check this value";
    }
    
  };


  /**
   * Web Edition Validation Rules. Use this to perform form validation on the front end, new rules should be
   * added as new switch cases.
   * @param {String} rule   The rule name
   * @param {Object} params Parameters for the given rule, often just a string, but could be an object
   */
  $.fn.WebEditionRules = function(rule, params){
    
    var $element = $(this);
    // switch on the rules
    switch (rule) {

      // Matches validation rule:
      case "matches":
        var $form = $element.closest('form'),
          $compare;

        if (typeof $form !== 'undefined' && $form.length) {
          $compare = $form.find('[name="' + params + '"]');
        } else {
          $compare = $('[name="' + params + '"]');
        }

        if ($compare.val() == $element.val()) {
          return true;
        } else {
          return $element.WebEditionValidationMessage(rule);
        }
        break;



      // Valid validation rule:
      case "valid":
        // Check for valid email:
        if (params == 'email') {
          var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (!$element.val() || re.test($element.val())) {
            return true;
          }
          return $element.WebEditionValidationMessage(rule);

        // Check for valid integer
        } else if (params == 'integer') {
          var value = Number($element.val());
          return (Math.floor(value) == value) ? true:$element.WebEditionValidationMessage(rule);
        
        // Check for a valid date
        } else if (params == 'date') {
          return (Date.parse($element.val()) !== undefined) ? true:$element.WebEditionValidationMessage(rule);

        // Check for a valid Googla UA code
        } else if (params == 'uacode') {
          var pattern = new RegExp("(UA|YT|MO)-\\d+-\\d+", "i");
          if (!$element.val() || pattern.test($element.val())) {
            return true;
          }
          return $element.WebEditionValidationMessage(rule);

        // Check for a valid URL
        } else if (params == 'url') {
          var pattern = new RegExp("^https?://")
          if (!$element.val() || pattern.test($element.val())) {
            return true;
          }
          return $element.WebEditionValidationMessage(rule);
        }

        break;



      // Required validation rule:
      case "required":
        if ($element.val() != "") {
          return true;
        } else {
          return $element.WebEditionValidationMessage(rule);
        }
        break;



      // Check the strength:
      case "strength":
        if ($element.val().length > params) {
          return true;
        } else {
          return $element.WebEditionValidationMessage(rule);
        }
        break;



      // Check valid file types:
      case "filetypes":
        if ($element.val().length == 0) {
          return true;
        } else if ($element.val()) {
          var pattern = new RegExp("\\.(" + params.join('|') + ")$", "i"),
              filename = $element.val();

          if (pattern.test(filename)) {
            return true;
          }
        }
        return $element.WebEditionValidationMessage(rule);

      default:
        return true;
    }

  };

})(jQuery);