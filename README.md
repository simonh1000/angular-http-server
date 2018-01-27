# Angular-HTTP-Server

A very simple application server designed for Single Page App (SPA) developers.

It returns a file to the browser if it exists (ex. your-icon.png, index.html) and if can't find a file that matches a given URL it re-directs you to index.html rather than giving a 404 error. The only time it will error out is if it can't locate the index.html file.

Originally designed for my Angular work, this server will work with any Single Page App (SPA) framework that uses a router to change the URL (React, Vue JS, Elm,...).

## To use:

```sh
npm install -g angular-http-server
cd /path/to/site
angular-http-server
```

And browse to `localhost:8080`.

## Options

Specify a port using `-p <port number>`

```sh
angular-http-server -p 9000
```

HTTPS can be enabled (using a generated self-signed certificate) with `--https` or `--ssl`

```sh
angular-http-server --https
```

[CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) can be enabled with the --cors flag

```sh
angular-http-server --cors
```

Specify a path to serve from
```sh
angular-http-server.js --path example
```

Feedback via: https://github.com/simonh1000/angular-http-server

## Self-Signed HTTPS Use

#### Production

**`angular-http-server` is not, and makes no claims to be, a production server.** The `--https` or `--ssl` flagsare intended for development and/or testing purposes only. Self-signed certificates do not properly verify the identity of the web app and they will cause an end-users web browser to display an error.

Within a production env use `angular-http-server` in http mode and forward traffic to it from an SSL-enabled reverse-proxy server (ie. [NGINX](https://www.nginx.com/resources/admin-guide/reverse-proxy/)).

#### Development
Only use `angular-http-server` with a self-signed certificate for development and/or testing. This can be accomplished by using the self-signed certificate generated when you pass the `--https`/`--ssl` flag. An example of when you should use this feature is with end-to-end testing suites such as [Protractor](http://www.protractortest.org/). or other suites which require the SPA application to be actively served.

## Changelog

1.4.0 - add --path option

## Dev notes
Test latest version, e.g.
```sh
node angular-http-server.js --path example --ssl -p 9000
```
