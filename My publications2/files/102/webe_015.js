/**
 * Validate.js: jQuery plugin by Justin Schroeder for easy form validation.
 *
 * DOM should be constructed such that each form element has an html wrapper.
 * You can manually validate fields and assign errors with:
 *
 * $('form').WebEditionValidate('addMessage', $element, "This field doesn't validate");
 *
 * The plugin does not stop form submission, it merely validates. To check
 * for errors, and stop submission, listen for submission and use:
 *
 * $('form').WebEditionValidate('hasErrors');
 *
 * To display any errors, use:
 *
 * $('form').WebEditionValidate('displayAllMessages');
 *
 * Note: This also clears the error que, so running method 'hasErrors'
 * after calling 'displayAllMessages' will return false.
 *
 * Note: 'displayAllMessages' will also remove any errors that have been
 * fixed since the last time the validation was run, leaving only current
 * errors on the form.
 *
 */

(function($) {

  $.fn.WebEditionValidate = function(action){

    var actions = {

      init: function(options){
        return this.each(function(){
          var $form = $(this),
              settings = {
                elementWrapperSelector: ".form-element",
                errorClass: "error",
                errorMessageClass: "error-message",
                highlightColor: "#B80707",
                highlightDuration: 1000,
                slideDuration: 200,
                labelReplace: {}
              };

          $.extend(settings,options);
          $form.data('WebEditionValidate',settings);

        });
      },


      addMessage: function(elem, message){
        return this.each(function(){
          var $form          = $(this),
              settings       = $form.data('WebEditionValidate'),
              messages       = $form.data('messages') || {},
              $element       = $(elem),
              idx            = 0,
              messageElement = $("<div class='" + settings.errorMessageClass + "'>" + message + "</div>");

          // count the size of our message queue
          for (var x in messages) {
            idx++;
          }

          if ($element.siblings("." + settings.errorMessageClass).filter(":contains('" + message + "')").length)
            messageElement = $element.siblings("." + settings.errorMessageClass).filter(":contains('" + message + "')");

          messages[idx] = {element:$element, message:message, messageElement: messageElement };
          
          $form.data('messages',messages);
        });
      },


      displayMessage: function(messageObject){
        return this.each(function(){
          var $form     = $(this),
              $element  = $(messageObject.element),
              settings  = $form.data('WebEditionValidate'),
              $parentWrapper  = $element.closest(settings.elementWrapperSelector);
              add       = $element.siblings("." + settings.errorMessageClass).filter(":contains('" + messageObject.message + "')").length;

          //only add messages if its a new message
          if(!add){
            $payError = messageObject.messageElement;
            $payError.insertAfter($element).slideDown(settings.slideDuration);
            $parentWrapper.addClass(settings.errorClass);
            $parentWrapper.addClass(settings.errorClass);
          }

        });
      },


      displayAllMessages: function(){
        return this.each(function(){
          var $form = $(this),
              messages = $form.data('messages');

          for (var idx in messages){
            $form.WebEditionValidate('displayMessage', messages[idx]);
          }

          // remove fixed messages
          $form.WebEditionValidate('removeMessages');
          $form.data("messages",{});
        });
      },


      removeMessages: function(){
        return this.each(function(){
          var $form = $(this),
              messages = $form.data('messages'),
              settings = $form.data('WebEditionValidate'),
              $visibleMessages = $("." + settings.errorMessageClass, $form),
              $currentMessages = $([]);

          for (var idx in messages){
            $currentMessages = $currentMessages.add(messages[idx].messageElement);
          }

          $visibleMessages.each(function(){
            if ($currentMessages.index($(this)) == -1) {
              $(this).closest(settings.elementWrapperSelector).removeClass(settings.errorClass);
              $(this).slideUp(settings.slideDuration,function() {
                $(this).remove();
              });
            }
          });

        });
      },


      hasErrors: function(){
        var $form = $(this),
            messages = $form.data('messages'),
            cnt = 0;
        for (var x in messages) {
          cnt++;
        }
        if (cnt) {
          return cnt;
        } else {
          return false;
        }
      }

    };

    if(actions[action]) return actions[action].apply(this, Array.prototype.slice.call(arguments, 1));
    else if(typeof action === 'object' || !action) return actions.init.apply(this, arguments);
    else $.error(action + ' is an undefined action of validate.js');

  };


  // from php.js, used only beautify labels
  function ucwords(str){
    return (str + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function ($1) {
      return $1.toUpperCase();
    });
  }

})(jQuery);
