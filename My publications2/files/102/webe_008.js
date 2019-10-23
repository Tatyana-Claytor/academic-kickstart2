/**
 * Webe.Messages.js
 *
 * Define the Message class 
 * 
 */

(function($) {

  /**
   * Class constructor
   * @param {string} text    The message to display to the user
   * @param {Object} options Optionally override the default settings
   */
  var Message = function(text, options) {
    var msg = this,
      settings, elements,
      defaults = {
        autoshow     : true,
        autohide     : false,
        classes      : {
          wrapper : 'messages',
          card : 'ui-message'
        },
        context     : 'body',
        dom         : false,
        displayTime : 3000,
        status      : 'notice' // other options: success, warning, error
      };

    settings = msg.settings = $.extend(defaults, options);

    if (settings.dom && typeof options.status === 'undefined') {
      settings.status = (typeof settings.dom.attr('data-status') === 'undefined' ? settings.status : settings.dom.attr('data-status'));
    }

    elements = msg.elements = {};
    elements.context = $(settings.context);
    elements.wrapper = $(settings.classes.wrapper, elements.context);
    
    msg.text = (settings.dom && !text ? settings.dom.text() : text);
    msg.status = settings.status;
    
    msg.init();

    Webe.messageQueue.push(msg);

    return msg;
  };


  Message.prototype.init = function() {
    var msg = this,
      settings = msg.settings,
      elements = msg.elements;

    // if messages wrapper isn't a child of the context yet, prepend it
    if (elements.context.find('.' + settings.classes.wrapper).length === 0) {
      elements.context.prepend('<div class="' + settings.classes.wrapper + '" />');
    }
    elements.wrapper = elements.context.find('.' + settings.classes.wrapper);

    if (settings.dom) {
      elements.card = settings.dom;
      elements.card.removeClass(function(idx, classname) {
        return (classname.match (/(^|\s)message-\S+/g) || []).join(' ');
      }).addClass('ui-message--' + msg.status).attr('data-status', msg.status);
    } else {
      elements.card = $('<div class="' + settings.classes.card + ' ui-message--' + msg.status + '" data-status="' + msg.status + '"><div class="ui-message-container">' + msg.text + '</div></div>');
    }
    elements.wrapper.append(elements.card);

    if (typeof elements.card.attr('data-autohide') !== 'undefined') {
      settings.autohide = true;
      settings.delayTimer = parseInt(elements.card.attr('data-autohide'), 10);
    }

    if (elements.wrapper.children().not('.is-shown').length > 0) {
      elements.wrapper.addClass('has-messages');
    }

    if (settings.autoshow) {
      setTimeout(function() {
        msg.show();
      }, 0);
    }

    return msg;
  };


  Message.prototype.show = function(options) {
    var msg = this,
      settings = msg.settings,
      elements = msg.elements;

    settings = $.extend(settings, options);

    setTimeout(function() {
      elements.card
        .addClass('is-showing')
        .bind('mouseover', function() {
          clearTimeout(msg.timer);
        })
        .bind('mouseleave', function() {
          if (settings.autohide) {
            msg.timer = setTimeout(function() {
              msg.hide();
            }, settings.displayTime / 2);
          }
        }).bind('click', function() {
          msg.hide();
        });

      if (settings.autohide) {
        msg.timer = setTimeout(function() {
          msg.hide();
        }, settings.displayTime);
      }
    }, 0);

    return msg;
  };


  Message.prototype.hide = function(options) {
    var msg = this,
      settings = msg.settings,
      elements = msg.elements,
      transitionEnd = 'webkitTransitionEnd mozTransitionEnd transitionend';

    settings = $.extend(settings, options);

    Webe.messageQueue[elements.card.index()] = false;

    setTimeout(function() {
      elements.card
        .addClass('is-hiding')
        .one(transitionEnd, function() {
          elements.card
            .addClass('is-shown')
            .removeClass('is-showing')
            .removeClass('is-hiding');
          if (elements.wrapper.children().not('.is-shown').length === 0) {
            elements.wrapper.removeClass('has-messages');
          }
        });
    }, 0);

    return msg;
  };


  Message.prototype.clear = function(options) {
    var msg = this;
    msg.settings = $.extend(msg.settings, options);
    element.card.remove();
  };




  /*
   * Attach to Webe
   */
  Webe.message = function(data, options) {
    var message;

    options = (typeof options === 'undefined' ? {} : options);

    if (data && typeof data !== 'string') {
      message = data.message;
      data.status = (data.status ? 'success' : 'error');
      options = $.extend(data, options);
    } else {
      message = data;
    }

    return new Message(message, options);
  };



  /**
   * @todo Integrate with this with the messaging
   */
  Webe.alert = function(msg) {
    window.alert(msg);
  };



  /**
   * @todo Integrate with this with the messaging
   */
  Webe.confirm = function(msg) {
    return window.confirm(msg);
  };



  /**
   * @todo Integrate with this with the messaging
   */
  Webe.prompt = function(msg, value) {
    return window.prompt(msg, value);
  };






  /**
   * Loop through all messages, showing any un-shown
   * @return {none}
   */
  Webe.flushMessages = function() {
    var queue = Webe.messageQueue,
      delay = 0,
      delayShow = function(msg) {
        setTimeout(function() {
          msg.show();
        }, delay);
        delay += 200;
      };
    for (var idx in queue) {
      if (queue[idx]) {
        delayShow(queue[idx]);
      }
    }
  };


  Webe.messageQueue = [];




  /**
   * Initialize all messages on a page
   */

  $('.messages .ui-message').each(function() {
    Webe.message(null, {
      autoshow: false,
      dom: $(this)
    });
  });
  
  setTimeout(function() {
    Webe.flushMessages();
  }, 200);


})(jQuery);
