;(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.frontendlogger = factory()
}(this, function () { 'use strict';

    var events = [];
    var eventsSummary = [];

    var originalErrorHandler = window.onerror;
    if ( ! originalErrorHandler ) {
      originalErrorHandler = function mockHandler() {
        return( true );
      };
    }

    // Default values
    var user = {};
    var maxLengthLog = 30;
    var serverUrl = "http://10.10.10.10:8080";
    var eventsLevels = [
      {
        "label": "debug",
        "level": 0
      },
      {
        "label": "info",
        "level": 1
      },
      {
        "label": "notice",
        "level": 2
      },
      {
        "label": "warning",
        "level": 3
      },
      {
        "label": "error",
        "level": 4
      },
      {
        "label": "critical",
        "level": 5
      },
      {
        "label": "alert",
        "level": 6
      },
      {
        "label": "emergency",
        "level": 7
      }
    ];

    function arrayToString(arr){
      arr.reverse();
      var str = "";
      arr.forEach(function(el){
        if(str !== "") {
          str += " <= ";
        }
        str += el;
      });
      return str;
    }

    function sendStackTrace(){
      var logging = {
        "logType": "frontendlogger",
        "lastEvent": events[0],
        "userAgentUA": navigator.userAgent,
        "eventsSummary": arrayToString(eventsSummary)
      };
      logging.events = events;
      var xhttp = new XMLHttpRequest();
      xhttp.open("POST", serverUrl);
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.send(JSON.stringify(logging));
    }

    function stringifyElement(element){
      var className = "";
      var elementId = "";
      if (element.className) {
        element.className.split(" ").forEach(function(classElement){
          className += "." + classElement;
        });
      }
      if (element.id) {
        elementId = "#" + element.id;
      }

      return element.tagName.toLowerCase() + elementId + className;
    }

    function stringifyEvent(e){
      if (e.eventType === "click" && e.element) {
        return "Click on " + e.element;
      }
      if (e.eventType === "angularDebug") {
        return "Angular debug: " + e.message;
      }
      if (e.eventType === "globalError") {
        return "Global error: " + e.errorMessage;
      }
      return "";
    }

    function addEventSummary(e){
      if (eventsSummary.length > maxLengthLog) {
        eventsSummary.pop();
      }

      eventsSummary.push(stringifyEvent(e));
    }

    function pushEvent(logEvent) {
      if (events.length > maxLengthLog) {
        events.pop();
      }
      events.unshift(logEvent);

      addEventSummary(logEvent);

      if(logEvent.eventLevel > 0) {
        sendStackTrace();
      }
    }

    function getBaseStack(e, eventLevel){

      var originalEvent = {};

      for (var prop in e) {
        if (typeof e[prop] !== 'function' && typeof e[prop] !== 'object') {
          originalEvent[prop] = e[prop];
        }
      }

      return {
        "eventType": e.type,
        "originalEvent": originalEvent,
        "eventLevel": eventsLevels[eventLevel].level,
        "url": window.location.href,
        "date": Date.now(),
        "user": user
      };
    }

    document.addEventListener('click', function(e){
      var logEvent = getBaseStack(e, 0);
      logEvent.element =  stringifyElement(e.target);
      logEvent.elementText = e.innerText || "";

      pushEvent(logEvent);
    });

    document.addEventListener('keypress', function(e){
      var logEvent = getBaseStack(e, 0);
      logEvent.pressedKey = e.key || String.fromCharCode(e.keyCode);
      logEvent.element = stringifyElement(e.srcElement);

      pushEvent(logEvent);
    });

    window.onerror = function handleGlobalError(message, source, lineno, colno, error){
      var logError = {
        url: window.location.href,
        errorMessage: message,
        eventType: "globalError",
        fileName: source,
        lineNumber: lineno,
        columnNumber: colno,
        date: Date.now(),
        user: user
      };

      logError.eventLevel = 2;

      if (error && error.stack) {
        logError.errorObjMessage = error.message;
        logError.errorStack = error.stack;
      }

      pushEvent(logError);
    };

    var setUser = function setUser(currentUser){
      user = currentUser;
    };

    var setServerUrl = function setServerUrl(url){
      serverUrl = url;
    };

    var setMaxLengthLog = function setMaxLengthLog(size){
      maxLengthLog = size;
    };

    function addExternalEvent(e){
      var logging = {
        "url": window.location.href,
        "date": Date.now(),
        "user": user
      };

      if (e.eventType){
        logging.eventType = e.eventType;
      }
      if (e.message){
        logging.message = e.message;
      }

      logging.eventLevel = eventsLevels[e.eventLevel].level;

      pushEvent(logging);
    }

    var debug = function debug(e){
      e.eventLevel = 0;
      addExternalEvent(e);
    };

    var info = function info(e){
      e.eventLevel = 1;
      addExternalEvent(e);
    };

    var notice = function notice(e){
      e.eventLevel = 2;
      addExternalEvent(e);
    };

    var warning = function warning(e){
      e.eventLevel = 3;
      addExternalEvent(e);
    };

    var error = function error(e){
      e.eventLevel = 4;
      addExternalEvent(e);
    };

    var critical = function critical(e){
      e.eventLevel = 5;
      addExternalEvent(e);
    };

    var alert = function alert(e){
      e.eventLevel = 6;
      addExternalEvent(e);
    };

    var emergency = function emergency(e){
      e.eventLevel = 7;
      addExternalEvent(e);
    };

    return {
      setUser: setUser,
      debug: debug,
      info: info,
      notice: notice,
      warning: warning,
      error: error,
      critical: critical,
      alert: alert,
      emergency: emergency,
      setServerUrl: setServerUrl,
      setMaxLengthLog: setMaxLengthLog
    };
  }));
