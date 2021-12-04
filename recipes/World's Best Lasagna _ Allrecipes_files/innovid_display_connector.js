"use strict";

// version 5
(function () {
  if (typeof window.IVD === "undefined") {
    window.IVD = {};
    IVD.mode = window.herolens ? "Herolens" : (window.location.href.indexOf("file:") == 0 || window.location.hostname == "localhost" ? "Local" : "Innovid");
    populateIVD();
  } else {
    populateIVD();
    Object.defineProperty(window, 'IVD', {
      writable: false
    });
  } ////////////// Define Self Service Interface


  function getMeta(metaName) {
    const metas = document.getElementsByTagName('meta');
    for (var i = 0; i < metas.length; i++) {
      if (metas[i].getAttribute('name') === metaName) {
        return metas[i].getAttribute('content');
      }
    }
    return '';
  }


  function populateIVD() {
    console.log(">>> Innovid Display Connector: Version 5");

    if (IVD.mode == "Innovid" || IVD.mode == "Local") {
      var allData = {};

      var props = [];
      if (window.location.href.indexOf('?') > -1) {
        props = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
      }
      if (window.name) {
        props = props.concat(window.name.split('&'));
      }
      if (props && props.length) {
        for (var i = 0; i < props.length; i++) {
          var prop = props[i].split('=');
          allData[decodeURIComponent(decodeURIComponent(prop[0]))] = decodeURIComponent(prop[1]);
        }
      }

      IVD.feed = {};
      IVD.ctx = {};
      IVD.extra = {};

      for (var key in allData) {
        if (allData.hasOwnProperty(key)) {
          if (key.substring(0, 7) == "inv_fd_") {
            IVD.feed[key.substring(7)] = allData[key];
          } else if (key.substring(0, 8) == "inv_ctx_") {
            IVD.ctx[key.substring(8)] = allData[key];
          } else {
            IVD.extra[key] = allData[key];
          }
        }
      }


      if (IVD.mode == "Local" && window.ivd_mock_feed) IVD.feed = window.ivd_mock_feed;

      // replace feed values with size-specific values,  if needed
      var width_height = (getMeta('ad.size')).match(/\d+/g);
      if (width_height) {
        var ivcAdSize = width_height.join("_");



        for (var property in IVD.feed) {
          if (IVD.feed.hasOwnProperty(property)) {
            var adSizeApendix = "___" + ivcAdSize;
            //var perSizeExists = new RegExp(adSizeApendix+"$").test(property);
            var perSizeExists = new RegExp(adSizeApendix).test(property);
            if (perSizeExists) {
              IVD.feed[property.split("___")[0]] = IVD.feed[property];
            }
          }
        }

        for (var property in IVD.feed) {
          if (IVD.feed.hasOwnProperty(property)) {
            var propertyForSizes = property.split("___");
            if (propertyForSizes[1]) {
              var sizes = propertyForSizes[1].split("_");
              if (sizes[0] && sizes[1] && !isNaN(sizes[0]) && !isNaN(sizes[1])) {
                delete IVD.feed[property];
              }
            }
          }
        }
      }


      /*console.log(">>> IVD.feed: " + JSON.stringify(IVD.feed));
      console.log(">>> IVD.ctx: " + JSON.stringify(IVD.ctx));
      console.log(">>> IVD.extra: " + JSON.stringify(IVD.extra));*/


    }

    IVD.clickthru = function (label, url) {
      //if (label.substring(0, 3) == "ct_") label = label.substring(3);
      console.log(">>> Innovid Clickthru: " + label + (url ? " | " + url : ""));

      switch (IVD.mode) {
        case "Innovid":
          var postmsgobj = {
            type: "open-url",
            label: label,
            url: url,
            target: "innovid"
          };
          window.parent.postMessage(JSON.stringify(postmsgobj), '*');
          break;

        case "Herolens":
          window.herolens.creativeAPI.clickthru(label, url);
          break;

        case "Local":
          if (url) window.open(url);
          break;
      }
    };

    IVD.engage = function (label, value) {
      console.log(">>> Innovid Engage: " + label + (value ? "    value:" + value : ""));

      switch (IVD.mode) {
        case "Innovid":
          var postmsgobj = {
            type: "user-interaction-event",
            label: label,
            value: value,
            target: "innovid"
          };
          window.parent.postMessage(JSON.stringify(postmsgobj), '*');
          break;

        case "Herolens":
          window.herolens.creativeAPI.engage(label, value);
          break;

        case "Local":
          break;
      }
    };

    IVD.report = function (label, value) {
      console.log(">>> Innovid Report: " + label + (value ? "    value:" + value : ""));

      switch (IVD.mode) {
        case "Innovid":
          var postmsgobj = {
            type: "custom-creative-event",
            label: label,
            value: value,
            target: "innovid"
          };
          window.parent.postMessage(JSON.stringify(postmsgobj), '*');
          break;

        case "Herolens":
          window.herolens.creativeAPI.report(label, value);
          break;

        case "Local":
          break;
      }
    };

    IVD.enableInteractions = function () {
      console.log(">>> Innovid Enable Interactions");

      switch (IVD.mode) {
        case "Innovid":
          var postmsgobj = {
            type: "enable-user-interaction-events",
            target: "innovid"
          }; //var postmsgobj = { type: "disable-wrapper-main-clickthru", target: "innovid" };

          window.parent.postMessage(JSON.stringify(postmsgobj), '*');
          break;

        case "Herolens":
          break;

        case "Local":
          break;
      }
    };
  }
})();