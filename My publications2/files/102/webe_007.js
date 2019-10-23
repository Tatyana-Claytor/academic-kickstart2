(function($){

  /**
   * Form element class, we block the constructor in order to
   * sub-create our objects
   * @param {object} element DOM element
   */
  var Element = function(element, options) {
    var el = this.factory(element, options).init();
    return el;
  };




  /**
   * Factory pattern, produce a sub-type object or a self 
   * @param  {DOM} element  DOM element (not jQuery)
   * @return {object}       Element object
   */
  Element.prototype.factory = function (element, options) {
    this.element = element;
    if (typeof Webe.Form.Elements[this.getType()] === 'function') {
      i = new Webe.Form.Elements[this.getType()](element, options);
      i.element = this.element;
      return i;
    }
    return this;
  };




  /**
   * Initialize the element
   * @return {none}
   */
  Element.prototype.init = function () {
    this.initialValue = this.getValue();
    this.eventRegistry = {};
    this.bindEvents();
    this.style();
  };




  /**
   * Use to style the element on initialization
   * @return {none}
   */
  Element.prototype.style = function() {
  };



  /**
   * Get the initial value of the element
   * @return {Mixed}  value of the current element
   */
  Element.prototype.getValue = function () {
    return $(this.element).val();
  };




  /**
   * Set the value of the element
   * @param {Mixed} value a value to set
   * @return {self}
   */
  Element.prototype.setValue = function (value) {
    $(this.element).val(value);
    return this;
  };




  /**
   * Reset the value of an element to original state
   * @return {self}
   */
  Element.prototype.reset = function () {
    this.setValue(this.initialValue);
    return this;
  };




  /**
   * Validate this form element
   * @return {mixed} true or an array of error messages
   */
  Element.prototype.validate = function () {
    return true;
  };




  /**
   * Tests if this element is at its original state
   * @return {Boolean} true = has been changed
   */
  Element.prototype.isChanged = function () {
    return this.getValue() != this.initialValue;
  };




  /**
   * Registers event handlers for element changes
   * @return {self}
   */
  Element.prototype.changed = function (callback) {
    if (typeof this.eventRegistry['changed'] === 'undefined') {
      this.eventRegistry['changed'] = [];
    }
    this.eventRegistry['changed'].push(callback);
  };




  /**
   * Fire the event all all the change registry
   * @param  {event} e  Event object
   * @return {void}
   */
  Element.prototype.fire = function (eType, e) {
    if (typeof this.eventRegistry[eType] !== 'undefined') {
      for (var i in this.eventRegistry[eType]) {
        this.eventRegistry[eType][i](e, this);
      }
    }
  };




  /**
   * Bind this element to change events
   * @return {void}
   */
  Element.prototype.bindEvents = function () {
    var that = this;

    $(this.element).keyup(function(e){
      that.fire('changed', e);
    });
  };




  /**
   * Gets the type of object in use
   * @return {Object}  The type of object in use
   */
  Element.prototype.getType = function() {
    var that    = this,
        element = $(that.element),
        types   = Webe.Form.ElementTypes;

    if (typeof this.type === 'undefined') {
      for (var type in types) {
        if (element.is(types[type])) {
          that.type = type;
          break;
        }
      }
    }

    return this.type;
  };




  /**
   * Initialize the objects
   */
  Webe.Form.Element = Element;
  Webe.Form.Elements = {};

})(jQuery);