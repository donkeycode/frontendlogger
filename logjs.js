;(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.logjs = factory()
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
    var maxLenghtLog = 30;
    var serverUrl = "http://10.10.10.10:8080";
    var eventsLevels = [
      {
        "label": "debug",
        "level": 0
      },
      {
        "label": "warning",
        "level": 1
      },
      {
        "label": "critical",
        "level": 2
      }
    ];

    function arrayToString(arr){
      var str = "";
      arr.forEach(function(el){
        if(str !== "") {
          str += " => ";
        }
        str += el;
      });
      return str;
    }

    function sendStackTrace(){
      var logging = {
        "logType": "logjs",
        "lastEvent": events[0],
        "userAgentUA": events[0].userAgent,
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
      if (eventsSummary.length > lenghtMaxLog) {
        eventsSummary.pop();
      }
      
      eventsSummary.push(stringifyEvent(e));
    }

    function pushEvent(logEvent) {
      if (events.length > maxLenghtLog) {
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
        "userAgent": navigator.userAgent,
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
        userAgent: window.navigator.userAgent,
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
      this.user = currentUser;
    };

    var setServerUrl = function setServerUrl(url){
      this.serverUrl = url;
    };

    var setMaxLengthLog = function setMaxLengthLog(size){
      this.setMaxLengthLog = size;
    };

    var addEvent = function addExternalEvent(e){
      var logging = {
        "userAgent": navigator.userAgent,
        "url": window.location.href,
        "date": Date.now(),
        "user": user
      };

      if (e.eventType){
        logging.eventType = e.eventType;
      }
      if (e.eventLevel){
        logging.eventLevel = this.eventsLevels[e.eventLevel].level;
      }
      if (e.message){
        logging.message = e.message;
      }

      pushEvent(logging);
    };

    return {
      setUser: setUser,
      addEvent: addEvent,
      setServerUrl: setServerUrl,
      setMaxLengthLog: setMaxLengthLog
    };
  }));
