(function($) {

  /**
   * Webe.Select() creates a fancy select object
   *
   * There is a single callback function you can hook into by passing
   * them via the overrides parameter:
   *   change(value, text) - when the value of the select changes,
   *     value and text are the currently selected value and text
   *
   * Expected HTML:

      <div class="ui-select">
        <select>
          <option value=""></option>
          <option value="" selected="selected"></option>
        </select>
      </div>
   
   * @param {jQuery} $widget   The jQuery object to be converted to
   *                           a fancy select
   * @param {Object} overrides Any settings you want to override.
   */
  


  /**
   * The future:
   */
  // var Select = function(element) {};
  // Select.prototype = new Webe.Form.Element();

  // Select.prototype.style = function () {
  // };


  var Select = function($widget, overrides) {
    var that = this,
      settings, $select, $text,
      defaults = {
        selectors : {
          text : '.value'
        },
        ui: '<span class="ui-element"><span class="value"></span><span class="icon-caron"></span></span>'
        // change : function(value, text) {}
      };

    // extend the defaults with the overrides
    that.settings = settings = $.extend(defaults, overrides);

    that.isDisabled = false;

    // make sure we've got a widget
    if (typeof $widget === 'undefined') {
      window.console.log('You must define an input element for Webe.Select to work.');
      return false;
    }

    // prep the jQuery objects
    $widget.append(settings.ui);
    $select = $('select', $widget);
    $text = $(settings.selectors.text, $widget);

    that.elements = {
      widget : $widget,
      select : $select,
      text   : $text
    };
    
    $widget.addClass('ui-select-styled');

    if (typeof $widget.attr('data-value') !== 'undefined' && $widget.attr('data-value').length > 0) {
      that.value = $widget.attr('data-value');
      $('option[value="' + that.value + '"]', $select).attr('selected', 'selected');
    } else {
      that.value = $select.val();
    }
    that.text = $('option:selected', $select).text();

    $select.removeAttr('data-value');

    settings.initial = {
      value: that.value,
      text: that.text
    };

    $widget.attr('data-value', that.value);
    $text.text(that.text);

    // bind input
    $select.bind('change.webeselect', function() {
      that.value = $select.val();
      that.text = $('option[value="' + that.value + '"]', $select).text();

      $widget.attr('data-value', that.value);
      $text.text(that.text);

      if (typeof settings.change === 'function') {
        settings.change(that.getValue(), that.getText());
      }
    });
  };




  /**
   * Return the current value
   * @return {Mixed} The current value of the selected option
   */
  Select.prototype.getValue = function() {
    return this.value;
  };




  /**
   * Return the current text
   * @return {Mixed} The current text of the selected option
   */
  Select.prototype.getText = function() {
    return this.text;
  };




  /**
   * Given a value, update the selected option (including its UI)
   * @param {Mixed} value Any valid value
   */
  Select.prototype.setValue = function(value) {
    var that = this;
    that.elements.select.val(value).trigger('change.webeselect');
  };




  /**
   * Change the initial state
   * @param  {mixed} value The value to set as initial
   * @return {none}
   */
  Select.prototype.setInitial = function(value) {
    var that = this,
      settings = that.settings;
    if (typeof value !== 'undefined') {
      settings.initial.value = value;
      settings.initial.text  = $('option[value="' + value + '"]', that.elements.select).text();
    } else {
      settings.initial.value = that.value;
      settings.initial.text  = that.text;
    }
  };




  /**
   * Return the Select to its initial state
   * @return {none}
   */
  Select.prototype.reset = function() {
    var that = this,
      settings = that.settings,
      elements = that.elements;
    that.setValue(settings.initial.value);
  };




  /*
   * Attach the Select object to Webe to be
   *   instantiated by other scripts
   */
  Webe.Select = Select;


  $('select[data-auto]').each(function() {
    Webe.Select($(this).closest('.ui-select'));
  });


})(jQuery);