(function($) {

  Webe.Date = function(timestamp) {
    this.timestamp = timestamp;
    this.date = new Date(timestamp);

    return this;
  };


  Webe.Date.prototype.format = function(format) {
    var date = this.date,
      year = date.getFullYear(),
      str = '',

      lpad = function(n,w) {
        var n_ = Math.abs(n);
        var zeros = Math.max(0, w - Math.floor(n_).toString().length );
        var zeroString = Math.pow(10,zeros).toString().substr(1);
        if (n < 0) {
          zeroString = '-' + zeroString;
        }
        return zeroString+n;
      },

      dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      dayLong = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

      monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      monthLong = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30],


      replacements = {
        // day
        d: function() { return lpad(date.getDate(), 2); },
        D: function() { return dayShort[date.getDay()]; },
        j: function() { return date.getDate(); },
        l: function() { return dayLong[date.getDay()]; },
        w: function() { return date.getDay(); },

        // month
        F: function() { return monthLong[date.getMonth()]; },
        m: function() { return lpad(date.getMonth() + 1, 2); },
        M: function() { return monthShort[date.getMonth()]; },
        n: function() { return date.getMonth() + 1; },
        t: function() { return monthDays[date.getMonth()]; },

        // year
        L: function() { return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 1 : 0); },
        Y: function() { return date.getFullYear(); },

        // time
        a: function() { return (date.getHours() < 12 ? 'a' : 'p') + 'm'; },
        A: function() { return (date.getHours() < 12 ? 'A' : 'P') + 'M'; },
        g: function() { return (date.getHours() % 12 === 0 ? 12 : date.getHours() % 12); },
        G: function() { return date.getHours(); },
        h: function() { return lpad((date.getHours() % 12 === 0 ? 12 : date.getHours() % 12), 2); },
        H: function() { return lpad(date.getHours(), 2); },
        i: function() { return lpad(date.getMinutes(), 2); },
        s: function() { return lpad(date.getSeconds(), 2); }
      };

    if (replacements['L']()) {
      monthDays[1] = 29;
    }

    for (var i=0, l=format.length; i<l; i++) {
      var character = format.charAt(i);
      if (typeof replacements[character] !== 'undefined') {
        str += replacements[character]();
      } else {
        str += character;
      }
    }

    return str;
  };


  Webe.dateFormat = function(format, timestamp) {
    var d = new Webe.Date(timestamp);
    return d.format(format);
  };

})(jQuery);