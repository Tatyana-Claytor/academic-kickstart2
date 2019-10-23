(function($) {

  var Share = function () {
    svg4everybody();
    this.component = $('.component-share');
    this.init();
  };


  /**
   * Iniitalize our share
   * @return {void}
   */
  Share.prototype.init = function () {
    var links = this.component.find("[data-service] > a"),
        share = this;
    links.click(function (e) {
      if (typeof share.component.attr('data-disabled') !== 'undefined') {
        e.preventDefault();
        Webe.alert('Stop! You’re editing this story. To share, toggle to view.');
      } else {
        share.dispatch($(this), e);
      }
    });
  };


  Share.prototype.dispatch = function ($el, event) {
    var share    = this,
        service  = $el.closest("[data-service]").attr('data-service');

    if (typeof ga === 'function') {
      ga('send', {
        hitType: 'social',
        socialNetwork: service,
        socialAction: 'share',
        socialTarget: window.location.href
      });
    }

    if ($el.attr('href').match(/^https?:\/\/.*/)) {
      event.preventDefault();
      window.open($el.attr('href'), "Share", "width=800, height=600");
    }
  }

  $(document).ready(function () {
    new Share();
  });

})(jQuery);