(function($, _){

  /**
   * Create a basic filtering system to perform backend filters
   * using input from a given input form
   */
  var ListBuilder = function ($el, options) {
    this.wrapper = $el;
    this.settings = $.extend({
      controls: _.template('<div class="listbuilder-controls"></div>'),
      list: _.template('<table class="listbuilder-list"></table>'),
      item: _.template('\
        <tr class="listbuilder-item{{ data.classes }}" data-key="{{ data.key }}">\
          <td>\
            <input type="{{ data.editable ? "text":"hidden" }}" name="{{ data.name }}[{{ data.key }}]" value="{{ data.value }}">\
            {% if (!data.editable) { %}\
            <span class="listitem-label">{{ data.value }}</span>\
            {% } %}\
          </td>\
          {% for (var subset in data.subsets){ %}\
          <td class="td-subset">\
            <input type="checkbox" data-subset="{{ subset }}" name="{{ subset }}[{{ data.key }}]" {{ data.subsets[subset] ? " checked":"" }}>\
          </td>\
          {% } %}\
          <td class="td-remove">\
            <a href="#delete-item" class="listitem-delete"><i class="icon icon-x"></i></a>\
          </td>\
        </tr>'
      ),
      inputField: _.template('<input type="text" class="listbuilder-input" placeholder="{{ data.placeholder }}">'),
      submitButton: _.template('<a href="#add-item" class="button"><i class="icon icon-plus"></i> Add</a>'),
    }, options);
    this.init();
  };


  /**
   * Initialize the watch system
   */
  ListBuilder.prototype.init = function () {
    this.name       = this.wrapper.attr('data-name');
    this.editable   = this.wrapper.attr('data-editable');
    this.subsets    = JSON.parse(this.wrapper.attr('data-subsets'));
    this.subValues  = JSON.parse(this.wrapper.attr('data-subvalues'));
    this.createList().createControls().watch();
  };


  /**
   * Watch the wrapper for events
   * @return {this}
   */
  ListBuilder.prototype.watch = function () {
    var listbuilder = this;
    this.inputField.bind('keypress', function (e) {
      if (e.which == 13) {
        e.preventDefault();
        listbuilder.addFromInputField();
      }
    });
    this.submitButton.bind('click', function (e) {
      e.preventDefault();
      listbuilder.addFromInputField();
    });
    this.wrapper.on('click', '.listitem-delete', function (e){
      e.preventDefault();
      listbuilder.removeListItem($(this).closest('tr').attr('data-key'));
    });
    this.wrapper.on('change', '[data-subset]', function (e) {
      listbuilder.updateSubValues();
    });
    return this;
  };


  /**
   * Initialize the actual list
   * @return {this}
   */
  ListBuilder.prototype.createList = function () {
    var config        = this.settings;
    this.list         = [];
    this.listElement  = $(config.list());
    this.headers      = this.getHeaders();
    this.wrapper.append(this.listElement);
    this.addListItems(JSON.parse(this.wrapper.attr('data-values')));
    return this;
  };


  /**
   * Add headers to a the list
   */
  ListBuilder.prototype.getHeaders = function () {
    var headers = this.getHeaderNames(),
        $headers = $('<tr></tr>');
    for (var idx in headers) {
      $headers.append('<th>' + headers[idx] + '</th>');
    }
    return $headers;
  };


  /**
   * Add headers to the list
   */
  ListBuilder.prototype.getHeaderNames = function () {
    var headers = [this.name.charAt(0).toUpperCase() + this.name.slice(1)];
    for (var subset in this.subsets) {
      headers.push(this.subsets[subset]);
    }
    // push empty remove
    headers.push('');
    return headers;
  };


  /**
   * Initialize controls on the list
   * @return {this}
   */
  ListBuilder.prototype.createControls = function () {
    var listbuilder   = this,
        config        = this.settings,
        placeholder   = this.wrapper.attr('data-placeholder') || "New Item";
    this.submitButton = $(config.submitButton());
    this.inputField   = $(config.inputField({placeholder: placeholder}));
    this.controls     = $(config.controls());
    this.controls
      .append(this.inputField)
      .append(this.submitButton)
      .appendTo(this.wrapper);
    return this;
  };


  /**
   * Add a new value from the input field
   */
  ListBuilder.prototype.addFromInputField = function () {
    var value = this.inputField.val().trim();
    if (value) {
      this.addListItem(value).inputField.val("");
    }
    return this;
  };


  /**
   * Add a series of list items
   * @param {array} items
   */
  ListBuilder.prototype.addListItems = function (items) {
    for (var key in items) {
      this.addListItem(items[key], key, false);
    }
    this.render();
    return this;
  };


  /**
   * Add an item to the list
   * @param {string} value  key of the item
   * @param {string} key    key or null
   */
  ListBuilder.prototype.addListItem = function(value, key, render) {
    render = (typeof render === 'undefined' ? true : render);
    if (typeof key === "undefined") {
      key = this.list.length + 1;
    }
    this.list.push({'key': key, 'value': value});
    if (render) {
      this.render();
    }
    return this;
  };


  /**
   * Remove a list item
   * @param  {key} key   key of the list item as found in the dom
   * @return {string}
   */
  ListBuilder.prototype.removeListItem = function(key) {
    var list = [];
    for (var idx in this.list) {
      if (this.list[idx].key != key) {
        list.push(this.list[idx]);
      }
    }
    this.list = list;
    return this.render();
  };


  /**
   * Rebuild the all the subkey values
   * @return {this}
   */
  ListBuilder.prototype.updateSubValues = function () {
    var subValues = {};
    for (var subset in this.subsets) {
      subValues[subset] = {};
      this.wrapper.find("[data-subset='" + subset + "']").each(function(){
        var key = $(this).closest('tr').attr('data-key');
        subValues[subset][key] = $(this).is(':checked');
      });
    }
    this.subValues = subValues;
    return this;
  };


  /**
   * Gets values of any subsets that are available
   * @param  {string} key key of at list item
   * @return {object}
   */
  ListBuilder.prototype.getSubsetValuesByKey = function (key) {
    var subsetValues = {};
    for (var subsetKey in this.subsets) {
      subsetValues[subsetKey] = (typeof this.subValues[subsetKey] !== "undefined") ? this.subValues[subsetKey][key]:false;
    }
    return subsetValues;
  };


  /**
   * Rerender the list
   * @return {this}
   */
  ListBuilder.prototype.render = function() {
    var builder   = this,
        config    = this.settings;
        items     = this.list;

    this.listElement.html("").append($('<thead />').append(this.headers));
    for (var key in items) {
      this.listElement.append(config.item({
        key: items[key].key,
        name: this.name,
        value: items[key].value,
        subsets: this.getSubsetValuesByKey(items[key].key),
        editable: this.editable,
        classes: (this.editable ? ' is-editable':'')
      }));
    }

    return this;
  };


  Webe.ListBuilder = ListBuilder;

  /*
   * Auto instantiate the list builder
   */
  $(document).ready(function() {
    $('[data-ui="listbuilder"]:not([data-auto="false"])').each(function() {
      var listbuilder = new Webe.ListBuilder($(this));
      $(this).data('listbuilder', listbuilder);
    });
  });

})(jQuery, _);