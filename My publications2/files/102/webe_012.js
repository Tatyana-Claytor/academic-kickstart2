(function($) {

  /**
   * Webe.DatePicker() creates a datepicker object
   *
   * There are three callback functions you can hook into by passing
   * them via the overrides paramter:
   *   blur() - when the datepicker loses focus
   *   focus() - when the datepicker gains focus
   *   change(timestamp) - when the value of the datepicker changes,
   *     timestamp is the current (PHP timestamp)
   *
   * Expected HTML:

      <div class="input-pubdate">
        <span class="icon icon-calendar"></span>
        <span class="pubdate" data-timestamp="">[default text here]</span>
      </div>

   
   * @param {jQuery} $widget   The jQuery object to be converted to
   *                           a datepicker
   * @param {Object} overrides Any settings you want to override.
   */
  var DatePicker = function($widget, overrides) {
    var that = this,
      settings, $input, $text,
      defaults = {
        emptyText : "No date set",
        format    : 'F j, Y',
        initial: {
          timestamp : $widget.attr('data-timestamp')
        },
        name: false,
        selectors : {
          text : '.value'
        },
        validation: false
        // blur : function() {}
        // change : function() {}
        // focus : function() {}
      };

    // pick up defaults from data attributes
    defaults.emptyText = (typeof $widget.attr('data-emptyText') !== 'undefined' ? $widget.attr('data-emptyText') : defaults.emptyText);
    defaults.format = (typeof $widget.attr('data-format') !== 'undefined' ? $widget.attr('data-format') : defaults.format);

    // extend the defaults with the overrides
    that.settings = settings = $.extend(defaults, overrides);

    that.isDisabled = false;

    // make sure we've got a widget
    if (typeof $widget === 'undefined') {
      window.console.log('You must define an input element for Webe.DatePicker to work.');
      return false;
    }

    if (typeof $widget.attr('data-name') !== 'undefined') {
      settings.name = $widget.attr('data-name');
    }
    if (typeof $widget.attr('data-validation') !== 'undefined') {
      settings.validation = $widget.attr('data-validation');
      $widget.removeAttr('data-validation');
    }

    // if we have a timestamp, initialize with that
    if (typeof settings.initial.timestamp !== 'undefined' && settings.initial.timestamp > 0) {
      that.timestamp = settings.initial.timestamp * 1000;
      that.text = Webe.dateFormat(that.settings.format, that.timestamp);

    // otherwise, initialize with empty text
    } else {
      that.timestamp = null;
      that.text = settings.emptyText;
    }

    // prep the jQuery objects
    $input = $('input.ui-datepicker-input', $widget);
    if ($input.length <= 0) {
      $input = $('<input type="text" class="ui-datepicker-input is-hidden"' + (settings.name ? ' name="' + settings.name + '"' : '') + (settings.validation ? ' data-validation=\'' + settings.validation + '\'' : '') + ' />');
      $widget.append($input);
    }
    $text = $(settings.selectors.text, $widget);

    that.elements = {
      widget : $widget,
      input  : $input,
      text   : $text
    };

    // store the initial HTML (used if/when destroyed)
    settings.initial.text = $text.text();

    // set up the UI
    $input.val(that.timestamp);
    $text.text(that.text);

    // instantiate a jQuery datepicker on the (hidden) input
    if (typeof $.datepicker !== 'undefined') {
      that.hasJQueryUI = true;
      $input.datepicker({
        changeMonth : true,
        changeYear  : true,
        dateFormat  : '@',
        defaultDate : 'now'
      });
    } else {
      that.hasJQueryUI = false;
      that.disable();
      window.console.warn('Could not find jQuery UI datepicker.');
    }

    // clicking on the UI focuses on the input
    $widget.bind('click.webedatepicker', function() {
      if (!that.isDisabled) {
        $widget.addClass('is-focus');
        $input.focus();
      }
    });

    // bind various events (with callbacks) on the <input /> itself
    $input
      .bind('focus.webedatepicker', function() {
        if (typeof settings.focus === 'function') {
          settings.focus();
        }
      })
      .bind('blur.webedatepicker', function() {
        if (!that.isDisabled) {
          $widget.removeClass('is-focus');
        }

        if (typeof settings.blur === 'function') {
          settings.blur();
        }
      })
      .bind('change.webedatepicker', function() {
        // update the UI when the input value changes
        that.timestamp = Math.floor($input.val());
        that.text = (that.timestamp ? Webe.dateFormat(that.settings.format, that.timestamp) : settings.emptyText);
        
        $text.text(that.text);
        if (typeof settings.change === 'function') {
          settings.change(that.getTimestamp());
        }
      });
  };




  /**
   * Return the Unix timestamp (floor the microseconds) or a formatted String.
   * @param  {Mixed} format Either true (to use stored format) or a String 
   *                        format (similar to PHP's Date() formatting)
   * @return {Mixed} Unix timestamp or formatted String
   */
  DatePicker.prototype.getTimestamp = function(format) {
    var that = this;
    if (format) {
      if (typeof format === 'boolean') {
        format = that.settings.format;
      }
      if (typeof that.timestamp !== 'undefined' && that.timestamp) {
        return Webe.dateFormat(format, that.timestamp);
      } else {
        return that.settings.emptyText;
      }
    } else {
      return Math.floor(that.timestamp / 1000);
    }
  };




  /**
   * Given a Unix timestamp, update the DatePicker (including its UI)
   * @param {integer} timestamp Unix timestamp (as stored by PHP)
   */
  DatePicker.prototype.setTimestamp = function(timestamp) {
    var input = this.elements.input;
    timestamp = (timestamp ? timestamp * 1000 : false);
    if (timestamp) {
      input.val(timestamp);
    } else {
      input.datepicker('setDate', null);
    }
    input.trigger('change.webedatepicker');
  };




  /**
   * Update the initial values for the DatePicker (or set them to 
   * the current values leaving $1 empty)
   * @param {Integer} timestamp The Unix timestamp
   * @param {String}  text      The initial text
   */
  DatePicker.prototype.setInitial = function(timestamp, text) {
    var that = this,
      settings = that.settings;

    if (typeof timestamp !== 'undefined') {
      settings.initial.timestamp = timestamp;
      if (typeof text !== 'undefined') {
        settings.initial.text = text;
      } else {
        settings.initial.text = Webe.dateFormat(settings.format, timestamp * 1000);
      }
    } else {
      settings.initial.timestamp = that.getTimestamp();
      settings.initial.text = that.elements.text.text();
    }
  };




  /**
   * Disable the DatePicker (don't allow interaction)
   * @return {none}
   */
  DatePicker.prototype.disable = function() {
    var that = this;

    that.elements.widget.addClass('is-disabled');
    that.elements.input.prop('disabled', true);

    that.isDisabled = true;
  };




  /**
   * Enable the DatePicker (re-allow interaction)
   * @return {none}
   */
  DatePicker.prototype.enable = function() {
    var that = this;

    if (that.hasJQueryUI) {
      that.elements.widget.removeClass('is-disabled');
      that.elements.input.prop('disabled', false);

      that.isDisabled = false;
    }
  };




  /**
   * Return the DatePicker to its initial state
   * @return {none}
   */
  DatePicker.prototype.reset = function() {
    var that = this,
      settings = that.settings;
    that.setTimestamp(settings.initial.timestamp);
  };




  /**
   * Remove any values from the DatePicker
   * @return {none}
   */
  DatePicker.prototype.clear = function() {
    var that = this;
    that.setTimestamp(null);
  };




  /**
   * Remove and destroy the DatePicker
   * @param  {Function} callback Potential callback hook
   * @return {none}
   */
  DatePicker.prototype.destroy = function(callback) {
    var that = this,
      $widget = that.elements.widget,
      $input = that.elements.input,
      $text = that.elements.text;

    $widget.unbind('click.webedatepicker');
    $input
      .unbind('focus.webedatepicker')
      .unbind('blur.webedatepicker')
      .unbind('change.webedatepicker')
      .datepicker('destroy')
      .remove();
    $text.text(that.settings.initial.text);

    if (typeof callback === 'function') {
      callback();
    }
  };




  /*
   * Attach the DatePicker object to Webe to be
   *   instantiated by other scripts
   */
  Webe.DatePicker = DatePicker;


  /*
   * Attach the DatePicker object to Webe to be
   *   instantiated by other scripts
   */
  $(document).ready(function() {
    $('[data-ui="datepicker"]:not([data-auto="false"])').each(function() {
      var datepicker = new Webe.DatePicker($(this));
      $(this).data('datepicker', datepicker);
    });
  });


})(jQuery);