(function($){


  var Ajax = function(options){
    if (typeof options == 'object') {
      var config = {
        success: function(){

        },
        error: function(){

        },
        passthrough: true,
        message: {}
      };

      $.extend(config, options);

      // Configure the passthrough options
      if (config.passthrough) {
        options.success = function(collection){
          collection = (!(collection instanceof Array) ? [collection] : collection);

          for (var i in collection) {
            var data = collection[i];

            if (data.status === undefined) {
              // === No status was returned, add a console warning and pass through to the callback
              window.console.warn('No status message returned, Webe.ajax expects a standard status signal');
              config.success(data);

            } else if (data.status >= 1) {
              if (data.message !== undefined) {
                config.message.status = 'success';
                if (typeof data.displayTime !== 'undefined') {
                  if (data.displayTime > 0) {
                    config.message.autohide = true;
                    config.message.displayTime = data.displayTime;
                  } else {
                    config.message.autohide = false;
                    config.message.displayTime = 0;
                  }
                }
                Webe.message(data.message, config.message);
              }

              if (data.payload === undefined) {
                window.console.warn('Webe.ajax expects a data.payload object on success, no such object found.');
              }

              data = (data.payload === undefined) ? {}:data.payload;
              // === A successful status was returned, pass through to the callback
              config.success(data);
            
            } else {
              // a failed status message was returned, call the error method
              options.error(data);
            }
          }
        };

        // xhr, errorType, exeption
        options.error = function(xhr, errorType, exeption){
          var message = (xhr.message === undefined) ? "An unknown error occurred. Our developers have been notified to fix it.":xhr.message;
          config.message.status = 'error';
          Webe.message(message, config.message);
          config.error(xhr, errorType, exeption);
        };
      }

      $.ajax(options);

    } else {
      window.console.warn('You must provide a valid options object to Webe.ajax');
    }
  };


  Webe.ajax = function(options){
    return new Ajax(options);
  };


})(jQuery);