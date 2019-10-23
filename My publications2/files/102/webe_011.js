/**
 * Webe.Form.js
 *
 * Webe allows the registration and encapsulation of forms via the Form and 
 * Form.Element objects. Form objects can be used to validate forms, listen for
 * events, and style challenging elements. To create a new form object simply 
 * instantiate it by passing a wrapper element (often the form dom element) and
 * a list of options (optional).
 *
 * new Webe.Form($('form'));
 *
 * Note: Only a single dom element can be instantiated at a
 * time, it is _not_ a jquery plugin
 */

(function($){

  var ElementTypes = {
    Text:           "input[type='text']",
    File:           "input[type='file']",
    Submit:         "input[type='submit']",
    Textarea:       "textarea",
    Select:         "select",
    Hidden:         "input[type='hidden']",
    Button:         "button",
    TextEditor:     "[data-texteditor]",
    DatePicker:     "input[type='datepicker']",
    RadioSwitch:    "input[type='radioswitch']",
    ImageUploader:  "input[type='imageuploader']",
    Search:         "input[type='search']",
    Tel:            "input[type='tel']",
    Url:            "input[type='url']",
    Email:          "input[type='email']",
    Password:       "input[type='password']",
    DateTime:       "input[type='datetime']",
    Date:           "input[type='date']",
    Month:          "input[type='month']",
    Week:           "input[type='week']",
    Time:           "input[type='time']",
    DatetimeLocal:  "input[type='datetime-local']",
    Zone:           "input[type='zone']",
    Number:         "input[type='number']",
    Range:          "input[type='range']",
    Color:          "input[type='color']",
    Checkbox:       "input[type='checkbox']",
    Radio:          "input[type='radio']",
    Submission:     "input[type='submission']",
    Image:          "input[type='image']",
    Reset:          "input[type='reset']"
  };


  var Form = function(wrapper, options) {
    var config  = {
          selectSelector:   '.styled-select',
          elementWrapper:   '.form-element',
          uploadSelector:   '.styled-upload',
          focusedClass:     'is-focused',
          errorClass:       'has-error'
        };
    
    // Only allow a single DOM element
    if (wrapper instanceof jQuery) {
      this.wrapper = wrapper.first();
    } else {
      this.wrapper = $(wrapper);
    }

    $.extend(config, options);

    // store in the instance
    this.elements = {};
    this.config = config;
    this.init();
    this.wrapper.data('Webe.Form', this);
  };


  Form.prototype.init = function() {
    var that = this,
        wrapper = this.wrapper,
        selectors = _.reduce(Webe.Form.ElementTypes, function (selectors, selector){
          return selectors += (selectors) ? ', ' + selector:selector;
        }, ''),
        elements = $(selectors);
    elements.each(function(){
      that.addElement(this);
    });

    this.styleUploads();
    this.validation();
  };


  Form.prototype.addElement = function(element) {
    var that  = this,
        types = Webe.Form.ElementTypes;

    if (element instanceof jQuery) {
      element.each(function(){
        that.addElement(this, type);
      });
    } else {
      var instance = new Form.Element(element);
          type = instance.getType();

      if (typeof this.elements[type] === 'undefined') {
        this.elements[type] = [];
      }
      this.elements[type].push(instance);
    }
  };


  Form.prototype.validation = function() {
    var that       = this,
        parent     = that.wrapper,
        elements   = $('*[data-validation]', parent),
        forms      = (parent.is('form')) ? parent:parent.find('form'),
        config     = that.config;

    if (forms.length) {
      forms.submit(function(e){
        that.validate($(this), e);
      });
    }
  };


  Form.prototype.validate = function(wrapper, e) {
      var config   = this.config,
          elements = $('*[data-validation]', wrapper);

      wrapper.WebEditionValidate();
      
      // loop through all fields that have validation requirements in this form
      elements.each(function(){
        var element = $(this),
            rules = $.parseJSON(element.attr('data-validation'));
   
        // there could be multiple validation rules, run through them all
        for (var rule in rules) {
          // find the proper validation rule
          var response = element.WebEditionRules(rule, rules[rule]);
          if(response !== true) wrapper.WebEditionValidate('addMessage', element, response);
        }
      });


      if (wrapper.WebEditionValidate('hasErrors')) {
        if (typeof e !== undefined) {
          e.preventDefault();
          wrapper.WebEditionValidate('displayAllMessages');
        }
      }
  };


  Form.prototype.styleSelects = function() {
    var parent   = this.wrapper,
        config    = this.config,
        wrappers = $(config.selectSelector, parent).closest(config.elementWrapper);

    // add a class to the wrapper for each element
    wrappers.addClass('styled-select-container');

    // adds a class to the parent on 
    parent.on('focus blur', config.selectSelector, function(e){
      var selectWrapper   = $(e.target).closest(config.selectSelector);

      if (e.type == 'focusin') {
        selectWrapper.addClass(config.focusedClass);
      } else {
        selectWrapper.removeClass(config.focusedClass);
      }
    });

    $(config.selectSelector + " select").blur(function(e){
      $(e.target).closest(config.selectSelector).trigger('blur');
    });
  };


  Form.prototype.styleUploads = function() {
    var parent   =  this.wrapper,
        config    = this.config,
        uploads  = $(config.uploadSelector, parent);

    uploads.find('input').addClass('styled').after("<input type='text' class='fake-upload' placeholder='Click to select file'>");
    uploads.find('input').change(function(){
      var value = $(this).val().replace('C:\\fakepath\\', '');
      uploads.find('.fake-upload').val(value);
    });
  };



  Form.prototype.styleDatePickers = function() {
    var elements = $("input[data-ui='datepicker']", this.wrapper);

    // go through each of the elements and create a new datepicker with options
    elements.each(function(){
      var element = $(this),
          options = (element.attr('data-options') === undefined) ? {}:$.parseJSON(element.attr('data-options'));
      
      // Apply the jQuery UI to any input elements with data-ui='datepicker'
      elements.datepicker(options);
    });
    
  };


  Webe.Form = Form;
  Webe.Form.ElementTypes = ElementTypes;

  $(document).ready(function() {
    $('form').each(function(){
      new Webe.Form($(this));
    });
  });

})(jQuery);