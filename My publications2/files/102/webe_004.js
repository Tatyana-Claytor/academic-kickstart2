(function($) {

  /**
   * Webe.RadioSwitch() creates a fancy switch to represent multiple radio inputs
   *
   *
   * Expected HTML:
      <div class="radio-switch">
        <input type="radio" name="[shared name]" value="[unique value]" id="[unique id]" /> <label for="[id attribute of associated radio input]">[unique label]</label> <br>
        <input type="radio" name="[shared name]" value="[unique value]" id="[unique id]" /> <label for="[id attribute of associated radio input]">[unique label]</label>
      </div>
   
   * @param {jQuery} $widget   The wrapping jQuery object to be converted to
   *                           a switch
   * @param {Object} overrides Any settings you want to override.
   */
  var RadioSwitch = function($widget, overrides) {
    var that = this,
      $inputs = $('input[type="radio"]', $widget),
      $rswitch = $('<div class="ui-switch"></div>'),
      settings,
      defaults = {
        required: true,
        isDisabled: false,
        initial: {
          selection: $inputs.filter(':checked').val()
        },
        classes: {
          checked : 'is-checked',
          original: 'ui-original',
          radio   : 'ui-radio'
        }
      };

    // extend the defaults with the overrides
    that.settings = $.extend(defaults, overrides);

    if (typeof that.settings.initial.selection === 'undefined' && that.settings.required) {
      that.settings.initial.selection = $inputs.first().val();
      $inputs.first().prop('checked', true);
    }

    that._value = that.settings.initial.selection;

    // make sure we've got radio inputs
    if ($inputs.length <= 1) {
      window.console.log('You must include at least two (2) radio inputs Webe.RadioSwitch to work.');
      return false;
    }

    $widget.wrapInner('<div class="' + that.settings.classes.original + '" />');
    $rswitch
      .attr('data-count', $inputs.length)
      .on('click.radioSwitch', '.' + that.settings.classes.radio, function(e, updateRealInputs) {
        if (!that.settings.isDisabled) {
          updateRealInputs = (typeof updateRealInputs === 'undefined') ? true : updateRealInputs;

          if (!$(this).hasClass(that.settings.classes.checked)) {
            that._value = $(this).attr('data-value');
            $('.' + that.settings.classes.checked, $rswitch).removeClass(that.settings.classes.checked);
            $(this).addClass(that.settings.classes.checked);

            if (updateRealInputs) {
              $inputs.filter('[value="' + that._value + '"]').prop('checked', true);
            }

            $widget.trigger('change.webe');
          }
        }
      });

    $inputs.each(function() {
      var $label = $('label[for="' + $(this).attr('id') + '"]', $widget),
        text;
      if ($label.length <= 0) {
        text = 'undefined';
        window.console.warn('Webe.RadioSwitch(): each input[type=\"radio\"] must have a <label /> whose for attribute matches the input\'s id attribute.');
      } else {
        text = $label.text();
      }
      $rswitch.append('<span class="' + that.settings.classes.radio + ($(this).val() === that.settings.initial.selection ? ' ' + that.settings.classes.checked : '') + '" data-value="' + $(this).attr('value') + '">' + text + '</span>');
    }).bind('change.radioSwitch', function() {
      $('.' + that.settings.classes.radio + '[data-value="' + $(this).val() + '"]', $rswitch).trigger('click', false);
    });

    $widget.prepend($rswitch);

    that.widget = $widget;
    that.rswitch = $rswitch;
    that.inputs = $inputs;

    that.widget.data('webeRadioSwitch', that);
  };


  RadioSwitch.prototype.getValue = function() {
    return this._value;
  };


  RadioSwitch.prototype.setValue = function(value) {
    var that = this,
      $radio = $('.' + that.settings.classes.radio + '[data-value="' + value + '"]', that.rswitch);
    if ($radio.length > 0) {
      $radio.trigger('click.radioSwitch');
    } else {
      window.console.warn('Webe.RadioSwitch(): that value [' + value + '] does not exist as an option.');
    }
  };


  RadioSwitch.prototype.disable = function() {
    var that = this;
    that.settings.isDisabled = true;

    that.widget.addClass('is-disabled');
    that.inputs.attr('disabled', true);
  };



  RadioSwitch.prototype.enable = function() {
    var that = this;
    that.settings.isDisabled = false;

    that.widget.removeClass('is-disabled');
    that.inputs.removeAttr('disabled');
  };




  Webe.RadioSwitch = RadioSwitch;

})(jQuery);