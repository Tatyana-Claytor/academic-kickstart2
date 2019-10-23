/**************************************************
 * File: webe.modal.js
 *
 * This script defines a Modal object that is attached
 * to Webe. It accepts a variety of parameters (either via
 * override when the function is called in JavaScript, or
 * through data- attributes in the HTML). The attributes
 * (corresponding to data- attributes) are:
 *
 *   ajaxpath: If set, requests the page at the specified path
 *     and either appends to or replaces the modal content.
 *   cache: Defaults to true. Keeps the contents of the modal
 *     the same on subsequent opens.
 *   replace: Defaults to true. Replaces the contents
 *     of the modal instead of appending new content.
 *   trigger: Defaults to any <a> anchored to the modal.
 *
 * Events:
 * The modal fires several events during its lifecycle, all
 * events are fired on the modal element itself. List of
 * events fired:
 * 
 * - preModal: before the modal opens, include trigger element
 * - postModalOpen: after the modal opens
 * - postModalAjax: after the modal gets a successfull ajax return.
 * - postModalError: after a failed ajax call
 * - postModalClose: after the modal has been closed out
 *
 * The modal also listens on certain events.
 *
 * - openModal: opens the modal
 * - closeModal: closes the modal
 */

(function() {

  var Modal = function($modal, overrides) {
    var that = this,
      settings = {
        trigger     : 'a[href="#' + $modal.attr('id') + '"], [data-modal-id="' + $modal.attr('id') + '"]',
        screenClass : 'modal-screen',
        ajaxpath    : false,
        ajaxdata    : {},
        ajaxsuccess : false,
        ajaxerror   : false,
        cache       : true,
        replace     : true,
        screenClickClose : true,
        addCloseButton   : true
      };

    if (typeof $modal.attr('data-ajaxpath') !== 'undefined') {
      settings.ajaxpath = $modal.attr('data-ajaxpath');
    }
    if (typeof $modal.attr('data-cache') !== 'undefined' && $modal.attr('data-cache') === 0) {
      settings.cache = false;
    }
    if (typeof $modal.attr('data-replace') !== 'undefined' && $modal.attr('data-replace') === 0) {
      settings.replace = false;
    }
    if (typeof $modal.attr('data-trigger') !== 'undefined') {
      settings.trigger = $modal.attr('data-trigger');
      if (settings.trigger === 'none' || settings.trigger === 'false') {
        settings.trigger = false;
      }
    }
    if (typeof $modal.attr('data-close-button') !== 'undefined') {
      settings.addCloseButton = true;
      if (settings.addCloseButton === 'none' || settings.addCloseButton === 'false') {
        settings.addCloseButton = false;
      }
    }

    this.settings = $.extend(settings, overrides);
    this.element = $modal;

    $modal.addClass('hide');
    if (settings.addCloseButton && $('.modal-close', $modal).length <= 0) {
      $('.inner', $modal).append('<a href="#close" class="modal-close"><i class="icon-x"></i><span>close</span></a>');
    }

    if (settings.trigger) {
      $('body').on('click', settings.trigger, function(e) {
        e.preventDefault();
        $modal.trigger('openModal', $(this));
      });
    }

    $modal.on('openModal', function(e, $trigger) {
      that.open($trigger);
    }).on('closeModal', function() {
      that.close();
    }).on('click', 'a[href="#close"]', function(e) {
      e.preventDefault();
      $modal.trigger('closeModal');
    });

    return that;
  };




  /**
   * Open the modal window
   * @return None
   */
  Modal.prototype.open = function($trigger) {
    var that = this,
        overridable = ['ajaxpath','cache','replace'],
        overrides = {};

    if (typeof $trigger !== 'undefined') {
      for (var idx in overridable) {
        if ($trigger.length) {
          var value = $trigger.attr('data-' + overridable[idx]);
          if (typeof value !== 'undefined' && value) {
            overrides[overridable[idx]] = value;
          }
        }
      }
    }

    that.element.trigger('preModal', {trigger: $trigger});
    that.show(overrides);

    return that;
  };



  /**
   * Close the modal window
   * @return None
   */
  Modal.prototype.close = function() {
    var that = this;
    that.hide();

    return that;
  };




  /**
   * Show the modal window
   * @return None
   */
  Modal.prototype.show = function(overrides) {
    var that = this,
      $modal = that.element,
      $modalscreen = $('.' + that.settings.screenClass, $modal),
      settings = {};

    overrides = (overrides !== undefined) ? overrides:{};

    $.extend(settings, this.settings, overrides);

    $modal.removeClass('hide');

    if (!$modalscreen.length) {
      $modal.prepend($('<div class="' + that.settings.screenClass + '" />'));
      $modalscreen = $('.' + that.settings.screenClass, $modal);
      $modalscreen.unbind('click').bind('click', function() {
        if (settings.screenClickClose) {
          $modal.trigger('closeModal');
        }
      });
    }

    if (settings.ajaxpath) {
      if (!settings.cache) {
        $modal.addClass('loading');
        if (!settings.replace) {
          $modal.children('inner').html('');
        }
      }
      Webe.ajax({
        url: settings.ajaxpath,
        type: 'post',
        data: settings.ajaxdata,
        success: function(data){
          $modal.removeClass('loading');
          if (settings.replace) {
            $modal.children('.inner').html(data);
          } else {
            $modal.children('.inner').append(data);
          }
          if (typeof settings.ajaxsuccess === 'function') {
            settings.ajaxsuccess(data, $modal);
          }
          $modal.trigger('postModalAjax', {data: data});
        },
        error: function(xhr) {
          that.hide();
          if (typeof settings.ajaxerror === 'function') {
            settings.ajaxerror();
          }
          $modal.trigger('postModalError');
        }
      });
      if (settings.cache) {
        settings.ajaxpath = false;
      }
    }

    setTimeout(function() {
      $modal.addClass('show');
      $modal.trigger('postModalOpen');
    }, 60);

    return that;
  };




  /**
   * Hide the modal window
   * @return None
   */
  Modal.prototype.hide = function() {
    var that = this,
      $modal = that.element,
      $modalscreen = $('.' + that.settings.screenClass, $modal);

    $modal.add($modalscreen).removeClass('show');
    if (typeof Modernizr !== 'undefined' && (typeof Modernizr.csstransitions === 'undefined' || Modernizr.csstransitions === true)) {
      $modal.one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function() {
        $(this).addClass('hide');
      });
    } else {
      setTimeout(function(){
        $modal.addClass('hide');
      },200);
    }

    $modal.trigger('postModalClose');

    return that;
  };



  // attach to Webe
  Webe.Modal = Modal;
  Webe.modal = Modal;



  $('.modal').each(function() {
    new Webe.modal($(this));
  });

})(jQuery);