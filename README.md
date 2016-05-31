# frontendlogger

frontendlogger is a JavaScript library for sending logs of front events and errors to a server.

This library sends logs to the server only when it catches a warning or a critical event. 
Logs sent to the server are composed of the last events logs.

It integrates easily with an ELK (Elasticsearch-Logstash-Kibana) stack.

## Installing

The simplest way to install frontendlogger is to use npm:

```
npm install frontendlogger
```

or bower:

```
bower install frontendlogger
```

After that, you have to include it with a script tag in your HTML file:

```html
<script src="path_to_bower_components/frontendlogger/frontendlogger.js"></script>
```

## Configuration

### setServerUrl (default: "http://10.10.10.10:8080")

To use this library, you have to set the URL of the server to which you want to send your application logs. 
To do that, simply use the setServerUrl command; for example:

```javascript
frontendlogger.setServerUrl("http://localhost:8080");
```

### setUser (default: {})

You can also add current user information with the setUser command, for example:

```javascript
frontendlogger.setUser(user);
```

### setMaxLengthLog (default: 30)

You can also change the default length of the stack trace with the setMaxLengthLog command, for example:

```javascript
frontendlogger.setMaxLengthLog(100);
```

### addEvent

You can also add your custom event with the addEvent command, for example:

```javascript
var event = {
  message = "This is a critical event!",
  eventLevel = 2, // 0 for debug events, 1 for warning events, 2 for critical events
  eventType = "myCriticalEvent"
};
frontendlogger.addEvent(event);
```

frontendlogger adds automagically the current user page URL, a datetime string and the user (if defined) to your custom event.

### Logstash configuration

If you want to send your application logs to Logstash, you have to use the [input http plugin](https://www.elastic.co/guide/en/logstash/current/plugins-inputs-http.html).

An example of Logstash configuration is the following one:

```
input {
  http {
    response_headers => {
      "Access-Control-Allow-Origin" => "*"
      "Access-Control-Allow-Headers" => "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
      "Access-Control-Allow-Methods" => "*"
      "Access-Control-Allow-Credentials" => "*"
    }
    host => "10.10.10.10"
    port => 8080
  }
}
filter {
    if [logType] == "frontendlogger" {
      useragent {
          source => "userAgentUA"
          target => "UA"
      }
    }
}
output {
  elasticsearch {}
}
```

With this configuration, Logstash creates an HTTP server that will listen on 10.10.10.10:8080 with some custom response headers.
Logstash allows you to parse the userAgent string to get information about the user browser and OS (you can find this data in the output UA object).
Finally, Logstash sends logs to Elasticsearch and you can visualize this data in the Kibana platform.
