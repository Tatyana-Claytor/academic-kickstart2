/**
 * Webe // ImageLoader
 *
 * Lazy loads a reasonably sized image based on width of container and
 * available resolutions (as specced by Image library and in WebeData)
 * 
 * 
 * Markup:
 *
 * <div data-jsload data-asset="[path to asset]" data-alt="[alternate text]">
 *   <noscript><img src="[path to asset]?w=[default]" alt="[alternate text]"></noscript>
 * </div>
 * 
 */

(function($){

  var ImageLoader = function(elements) {
    this.images = [];
    if (typeof elements !== 'undefined') {
      this.list = elements;
    } else {
      this.list = $('[data-jsload]');
    }

    this.defaultRes = 1000;
    this.resolutions = (WebeData.ImageResolutions ? WebeData.ImageResolutions : [1500, 1000, 500]);
    this.endpoint = (typeof WebeData.AssetEndpoint !== 'undefined') ? WebeData.AssetEndpoint[0]:false;

    this.init();
  };

  
  ImageLoader.prototype.init = function() {
    var that = this,
      w = $(window),
      resizetimer, scrolltimer;

    // for each, generate an image and push onto the images array
    that.list.each(function() {
      that.process($(this));
    });
    that.list = {};

    // assess each resize (with a timeout to decrease processing)
    w.bind('resize.webe-image-loader', function() {
      clearTimeout(resizetimer);
      resizetimer = setTimeout(function() {
        that.assess();
      }, 100);
    }).bind('scroll.webe-image-loader', function() {
      clearTimeout(scrolltimer);
      scrolltimer = setTimeout(function() {
        that.scroll();
      }, 100);
    });

    // initial image assessment
    that.assess();
    that.scroll();
  };


  ImageLoader.prototype.process = function(element) {
    var that = this,
      image = {};

    image.el = element;
    image.asset = element.attr('data-asset');
    image.remote = element.attr('data-remote-asset');
    image.delay = (typeof element.attr('data-delay') !== 'undefined' ? true : false);
    image.scrollLoad = (typeof element.attr('data-scroll-load') !== 'undefined' ? true : false);
    image.alt = (typeof element.attr('data-alt') !== 'undefined' ? element.attr('data-alt') : '');

    if (typeof element.attr('data-resolutions') !== 'undefined') {
      image.resolutions = element.attr('data-resolutions').split(',');
      for (var i in image.resolutions) {
        image.resolutions[i] = parseInt(image.resolutions[i], 10);
        if (isNaN(image.resolutions[i])) {
          window.console.log('An instance of ImageLoader is configured with an invalid resolution set (NaN).');
          delete image.resolutions;
          break;
        }
      }
    }

    image.el.attr('data-jsload-state', 'waiting');

    image.el.bind('reassess', function() {
      that.assess(image);
    });

    if (typeof image.asset !== 'undefined') {
      image.el.find('noscript').remove();
      that.images.push(image);
    } else {
      window.console.warn('ImageLoader is missing a data-asset attribute.');
    }

    return image;
  };


  ImageLoader.prototype.add = function(images) {
    var that = this;
    if (images.length > 0) {
      images.each(function() {
        var image = that.process($(this));
        that.assess(image);
      });
    }
  };


  ImageLoader.prototype.assess = function(image) {
    var that = this,
      images = (typeof image === 'undefined' ? that.images : [image]);

    for (var i in images) {
      var width = that.ceilingWidth(images[i].el.width(), images[i].resolutions),
        currentWidth = images[i].width;
      
      images[i].width = width;

      // if not delayed and not same width as current, replace
      if (!images[i].delay && width != currentWidth) {
        images[i].el.attr('data-jsload-state', 'assessing');
        images[i].el.removeClass('replaced').addClass('assessing');
        that.replace(images[i]);
      }

      // if based on scrollLoad, store offsets
      if (images[i].scrollLoad) {
        images[i].offsetTop = images[i].el.offset().top;
        images[i].offsetBottom = images[i].offsetTop + images[i].el.outerHeight();
      }
    }
  };


  ImageLoader.prototype.scroll = function() {
    var that = this,
      w = $(window),
      images = that.images,

      scrollTop = w.scrollTop(),
      scrollBottom = scrollTop + w.height();

    for (var i in images) {
      if (images[i].scrollLoad) {
        if (images[i].offsetTop < scrollBottom && images[i].offsetBottom > scrollTop) {
          images[i].delay = false;
          images[i].scrollLoad = false;
          that.replace(images[i]);
        }
      }
    }
  };


  ImageLoader.prototype.ceilingWidth = function(width, resolutions) {
    var that = this,
      res = 100000,
      hasRes = false;
    if (typeof resolutions === 'undefined') {
      resolutions = that.resolutions;
    }
    for (var k in resolutions) {
      if (width < resolutions[k] && resolutions[k] < res) {
        res = resolutions[k];
        hasRes = true;
      }
    }
    if (!hasRes) {
      res = (typeof resolutions[0] !== 'undefined' ? resolutions[0] : that.defaultRes);
    }
    return res;
  };


  ImageLoader.prototype.replace = function(image) {
    var img = new Image();

    $(img).one('load.imageloader error.imageloader', function(e) {
      image.el.find('img').remove();
      image.el.append(img);
      image.el.removeClass('assessing').addClass('replaced').removeAttr('style');
      image.el.attr('data-jsload-state', 'replaced');
      image.el.trigger('replace.webe-jsload', img);
    });
    img.src = this.url(image);
    img.alt = image.alt;
  };


  ImageLoader.prototype.url = function(image) {
    if (this.endpoint && image.resolutions) {
      var extention = image.remote.match(/\.([a-zA-Z]+)$/)[0],
          filename  = image.remote.substr(0, image.remote.length - extention.length),
          size      = (image.width) ? "x" + image.width:"",
          remote    = (image.resolutions.length !== 1) ?  filename + size + ".jpg":image.remote;

      return this.endpoint + remote;
    }
    return image.asset + "?w=" + image.width;
  };


  Webe.ImageLoader = ImageLoader;


})(jQuery);


jQuery(document).ready(function($) {
  
  Webe.imageLoader = new Webe.ImageLoader();

});