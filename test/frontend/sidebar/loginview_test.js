/*global app, chai, sinon */
"use strict";

var expect = chai.expect;

describe("LoginView", function() {
  var sandbox;

  beforeEach(function() {
    // BrowserId "mock"
    window.navigator.id = {
      watch: sinon.spy(),
      request: sinon.spy(),
      logout: sinon.spy()
    };

    sandbox = sinon.sandbox.create();
    $('body').append([
      '<div id="login">',
      '  <p></p>',
      '  <form id="signout" class="hide"></form>',
      '</div>',
    ].join(''));
  });

  afterEach(function() {
    sandbox.restore();
    $('#login').remove();
  });

  describe("#initialize", function() {
    beforeEach(function() {
      sandbox.stub(app.views.LoginView.prototype, "render");
    });

    it("should render the view when the user changes", function() {
      var loginView = new app.views.LoginView({
        user: new app.models.CurrentUser(),
        spaLoginURL: "http://talkilla/",
        appStatus: new app.models.AppStatus()
      });

      loginView.render.reset();

      loginView.user.trigger("change");

      sinon.assert.calledOnce(loginView.render);
    });

    it("should render the view when the user is cleared", function() {
      var loginView = new app.views.LoginView({
        user: new app.models.CurrentUser(),
        spaLoginURL: "http://talkilla/",
        appStatus: new app.models.AppStatus()
      });

      loginView.render.reset();

      loginView.user.clear();

      sinon.assert.calledOnce(loginView.render);
    });

    it("should render the view when the worker is initialized", function() {
      var loginView = new app.views.LoginView({
        user: new app.models.CurrentUser(),
        spaLoginURL: "http://talkilla/",
        appStatus: new app.models.AppStatus()
      });

      loginView.render.reset();

      loginView.appStatus.set("workerInitialized", true);

      sinon.assert.calledOnce(loginView.render);
    });
  });

  describe("#render", function() {
    var loginView, user, appStatus;

    beforeEach(function() {
      appStatus = new app.models.AppStatus();
      user = new app.models.CurrentUser();
      loginView = new app.views.LoginView({
        user: user,
        spaLoginURL: "http://talkilla/",
        appStatus: appStatus
      });
    });

    it("should hide signin and signout where the worker is not initialized",
      function() {
        loginView.render();

        expect(loginView.$('#signin').length).to.equal(0);
        expect(loginView.$('#signout').is(':visible')).to.equal(false);
      });

    it("should display signin and hide signout when there is not a username",
      function() {
        appStatus.set("workerInitialized", true);
        loginView.render();

        expect(loginView.$('#signin').length).to.equal(1);
        expect(loginView.$('#signin').is(':visible')).to.equal(true);
        expect(loginView.$('#signout').is(':visible')).to.equal(false);
      });

    it("should hide signin and display signout when there is not a username",
      function() {
        appStatus.set("workerInitialized", true);
        user.set("username", "james");
        loginView.render();

        expect(loginView.$('#signin').is(':visible')).to.equal(false);
        expect(loginView.$('#signout').is(':visible')).to.equal(true);
      });
  });

  describe("signing in and out", function() {
    var loginView;
    var clickEvent = {preventDefault: function() {}};

    beforeEach(function() {
      window.sidebarApp = {
        login: sandbox.spy(),
        logout: sandbox.spy()
      };
      loginView = new app.views.LoginView({
        user: new app.models.CurrentUser(),
        spaLoginURL: "http://talkilla/",
        appStatus: new app.models.AppStatus()
      });
    });

    afterEach(function() {
      window.sidebarApp = undefined;
    });

    describe("#signout", function() {

      it("should call sign out on the user model", function() {
        sandbox.stub(loginView.user, "signout");

        loginView.signout(clickEvent);

        sinon.assert.calledOnce(loginView.user.signout);
      });

    });
  });
});
