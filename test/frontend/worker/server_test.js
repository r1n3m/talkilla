/* global Server */
/* global describe, beforeEach, afterEach, sinon, it, expect, server */

describe("Server", function() {
  var sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    sandbox.stub(window, "WebSocket").returns({send: sinon.spy()});
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe("#signin", function() {
    it("should send a signin request to the server", function() {
      var server = new Server(), callback = function() {};
      sandbox.stub(server.http, "post");

      server.signin("fake assertion", callback);

      sinon.assert.calledOnce(server.http.post);
      sinon.assert.calledWithExactly(server.http.post, "/signin",
                                     {assertion: "fake assertion"},
                                     callback);
    });
  });

  describe("#signout", function() {

    it("should send a signout request to the server", function() {
      var server = new Server(), callback = function() {};
      sandbox.stub(server.http, "post");

      server.signout("foo", callback);

      sinon.assert.calledOnce(server.http.post);
      sinon.assert.calledWithExactly(server.http.post, "/signout",
                                     {nick: "foo"},
                                     callback);
    });

  });

  describe("#connect", function() {

    it("should request a stream", function() {
      var server = new Server();
      sandbox.stub(server.http, "post");
      server.connect("foo");

      sinon.assert.calledOnce(server.http.post);
      sinon.assert.calledWith(server.http.post, "/stream", {nick: "foo"});
    });

    it("should trigger a connected event", function(done) {
      var server = new Server();
      sandbox.stub(server.http, "post", function(method, nick, callback) {
        sandbox.stub(server, "_longPolling");
        callback(null, "[]");
      });
      server.on("connected", function() {
        done();
      });

      server.connect("foo");
    });

    it("should trigger an error event if the request failed", function(done) {
      var server = new Server();
      sandbox.stub(server.http, "post", function(method, nick, callback) {
        callback("error", "fake response");
      });
      server.on("error", function() {
        done();
      });

      server.connect("foo");
    });

    it("should call #_longPolling", function(done) {
      var server = new Server();
      sandbox.stub(server, "_longPolling");
      sandbox.stub(server.http, "post", function(method, nick, callback) {
        callback(null, "[]");
        sinon.assert.calledOnce(server._longPolling);
        sinon.assert.calledWithExactly(server._longPolling, "foo", []);
        done();
      });

      server.connect("foo");
    });

  });

  describe("#autoconnect", function() {

    it("should request a stream", function() {
      var server = new Server();
      sandbox.stub(server.http, "post");
      server.autoconnect("foo");

      sinon.assert.calledOnce(server.http.post);
      sinon.assert.calledWith(server.http.post, "/stream", {nick: "foo"});
    });

    it("should trigger a connected event", function(done) {
      var server = new Server();
      sandbox.stub(server.http, "post", function(method, nick, callback) {
        sandbox.stub(server, "_longPolling");
        callback(null, "[]");
      });
      server.on("connected", function() {
        done();
      });

      server.autoconnect("foo");
    });

    it("should trigger an error event if the request failed", function(done) {
      var server = new Server();
      sandbox.stub(server.http, "post", function(method, nick, callback) {
        callback("error", "fake response");
      });
      server.on("disconnected", function() {
        done();
      });

      server.autoconnect("foo");
    });

    it("should call #_longPolling", function(done) {
      var server = new Server();
      sandbox.stub(server, "_longPolling");
      sandbox.stub(server.http, "post", function(method, nick, callback) {
        callback(null, "[]");
        sinon.assert.calledOnce(server._longPolling);
        sinon.assert.calledWithExactly(server._longPolling, "foo", []);
        done();
      });

      server.autoconnect("foo");
    });

  });

  describe("#_longPolling", function() {

    it("should request a stream", function() {
      var server = new Server();
      sandbox.stub(server.http, "post");
      server._longPolling("foo", []);

      sinon.assert.calledOnce(server.http.post);
      sinon.assert.calledWith(server.http.post, "/stream", {nick: "foo"});
    });

    it("should trigger a stream:error event if the request failed",
      function(done) {
        var server = new Server();
        sandbox.stub(server.http, "post", function(method, data, callback) {
          callback("error", "some error");
        });
        server.on("stream:error", function(error) {
          expect(error).to.equal("some error");
          done();
        });
        server._longPolling("foo", []);
      });

    it("should trigger a message event for each event", function(done) {
      var nbCall = 1;
      var server = new Server();
      var events = [
        {first:  "event 1"},
        {second: "event 2"},
        {third:  "event 3"}
      ];
      sandbox.stub(server.http, "post");
      server.on("message", function(type, event) {
        if (nbCall === 1) {
          expect(type).to.equal("first");
          expect(event).to.equal("event 1");
        }

        if (nbCall === 2){
          expect(type).to.equal("second");
          expect(event).to.equal("event 2");
        }

        if (nbCall === 3) {
          expect(type).to.equal("third");
          expect(event).to.equal("event 3");
          done();
        }

        nbCall += 1;
      });

      server._longPolling("foo", events);
    });

    it("should trigger a custom message event", function(done) {
      var server = new Server();
      var events = [{"sometype":  "event"}];

      sandbox.stub(server.http, "post");
      server.on("message:sometype", function(event) {
        expect(event).to.equal("event");
        done();
      });

      server._longPolling("foo", events);
    });

    it("should call #_longPolling again", function(done) {
      var server = new Server();

      sandbox.stub(server.http, "post", function(method, data, callback) {
        sandbox.stub(server, "_longPolling");
        callback(null, "[]");
        sinon.assert.calledOnce(server._longPolling);
        sinon.assert.calledWithExactly(server._longPolling, "foo", []);
        done();
      });

      server._longPolling("foo", []);
    });

  });

  describe("#callOffer", function() {

    it("should send an offer to a peer", function() {
      var offerData = "fake offer payload";
      var callback = function() {};
      sandbox.stub(server.http, "post");
      server.callOffer(offerData, callback);

      sinon.assert.calledOnce(server.http.post);
      sinon.assert.calledWithExactly(
        server.http.post, "/calloffer", offerData, callback);
    });

  });

  describe("#callAnswer", function() {

    it("should accept a call from peer", function() {
      var answerData = "fake answer payload";
      var callback = function() {};
      sandbox.stub(server.http, "post");
      server.callAccepted(answerData, callback);

      sinon.assert.calledOnce(server.http.post);
      sinon.assert.calledWithExactly(
        server.http.post, "/callaccepted", answerData, callback);
    });

  });

  describe("#callHangup", function() {

    it("should hangup the call", function() {
      var hangupData = "fake hangup payload";
      var callback = function() {};
      sandbox.stub(server.http, "post");
      server.callHangup(hangupData, callback);

      sinon.assert.calledOnce(server.http.post);
      sinon.assert.calledWithExactly(
        server.http.post, "/callhangup", hangupData, callback);
    });

  });

  describe("#presenceRequest", function() {

    it("should send a presence request", function() {
      var callback = function() {};
      sandbox.stub(server.http, "get");

      server.presenceRequest(callback);

      sinon.assert.calledOnce(server.http.get);
      sinon.assert.calledWith(server.http.get, "/presencerequest", null);
    });

  });

  describe.skip("websocket's events", function() {

    it("should trigger a 'connected' event when it opens", function() {
      var server = new Server();
      var callback = sinon.spy();

      server.on("connected", callback);
      server.connect("foo");
      server._ws.onopen();

      sinon.assert.calledOnce(callback);
    });

    it("should trigger a message event when it receives one", function() {
      var server = new Server();
      var callback = sinon.spy();
      var event = {data: JSON.stringify({thisis: {an: "event"}})};

      server.on("message", callback);
      server.connect("foo");
      server._ws.onmessage(event);

      sinon.assert.calledOnce(callback);
      sinon.assert.calledWithExactly(callback, "thisis", {an: "event"});
    });

    it("should trigger a custom event when it receives a message", function() {
      var server = new Server();
      var callback = sinon.spy();
      var event = {data: JSON.stringify({custom: {an: "event"}})};

      server.on("message:custom", callback);
      server.connect("foo");
      server._ws.onmessage(event);

      sinon.assert.calledOnce(callback);
      sinon.assert.calledWithExactly(callback, {an: "event"});
    });

    it("should trigger an error event when having an error", function() {
      var server = new Server();
      var callback = sinon.spy();

      server.on("error", callback);
      server.connect("foo");
      server._ws.onerror("an error");

      sinon.assert.calledOnce(callback);
      sinon.assert.calledWithExactly(callback, "an error");
    });

    it("should trigger a disconnected event when it closes", function() {
      var server = new Server();
      var callback = sinon.spy();

      server.on("disconnected", callback);
      server.connect("foo");
      server._ws.onclose();

      sinon.assert.calledOnce(callback);
    });
  });

  describe.skip("#send", function() {
    it("should send serialized data throught the websocket", function() {
      var server = new Server();

      server.connect("foo");
      server.send({some: "data"});

      sinon.assert.calledOnce(server._ws.send);
      sinon.assert.calledWithExactly(server._ws.send,
                                     JSON.stringify({some: "data"}));
    });
  });
});

