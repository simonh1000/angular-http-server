# Angular-HTTP-Server

A very simple dev server designed for Single Page App developers in that it supports page refreshes of any route. It returns a file if it exists, or 'index.html' otherwise (i.e. when the url requested is actually a SPA route). Other dev http-servers (correctly) give a 404 when you try to refresh your browser for a page that is a route on a client side app.

Originally designed for my Angular work, it should work with any Single Page App framework that uses a router to change the URL (React, Vue JS, Elm,...).

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

Feedback via: https://github.com/simonh1000/angular-http-server

## HTTPS Rationale

If you're using `angular-http-server` in production, you wouldn't use a self-signed SSL certificate, so
do not use `--https` or `--ssl` flags for production. Instead, run `angular-http-server` in http mode
and forward traffic to it from an SSL-enabled reverse-proxy server (for instance, you can set one
up with [NGINX](https://www.nginx.com/resources/admin-guide/reverse-proxy/))

If you're only using `angular-http-server` for development or testing, a self-signed SSL certificate
is fine. For example, end-to-end tests with [Protractor](http://www.protractortest.org/) require the
Angular application to be actively served, which can be done using a background `angular-http-server`.
If your end-to-end testing suite requires your application be served over HTTPS, the self-signed
certificate generated when you pass the `--https`/`--ssl` flag will work fine to provide that.
