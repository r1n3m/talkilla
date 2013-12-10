/*global app*/
/**
 * Talkilla Backbone views.
 */
(function(app, Backbone, _) {
  "use strict";

  /**
   * View required option error.
   * @param {String} msg Error message
   */
  app.views.ViewOptionError = function ViewOptionError(msg) {
    Error.call(this);
    this.message = msg;
    this.name = 'ViewOptionError';
  };
  app.views.ViewOptionError.prototype = Object.create(Error.prototype);

  /**
   * Base Talkilla view.
   */
  app.views.BaseView = Backbone.View.extend({
    /**
     * Checks that an options object owns properties passed as arguments.
     * @param  {Object}   options   Options object
     * @param  {[]String}           Property names as remaining arguments
     * @return {Object}             Checked options object
     * @throws {ViewOptionError} If object doesn't own an expected property
     */
    checkOptions: function(options) {
      options = options || {};
      [].slice.call(arguments, 1).forEach(function(prop) {
        if (!options.hasOwnProperty(prop))
          throw new app.views.ViewOptionError("required option: " + prop);
      });
      return options;
    }
  });

  /**
   * Base notification view.
   */
  app.views.NotificationView = app.views.BaseView.extend({
    template: _.template([
      '<div class="alert alert-<%= type %>">',
      '  <a class="close" data-dismiss="alert">&times;</a>',
      '  <%= message %>',
      '</div>'
    ].join('')),

    clear: function() {
      this.undelegateEvents();
      this.remove();
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });
})(app, Backbone, _);
