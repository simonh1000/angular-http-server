# Angular-HTTP-Server

Should work with any Single Page App framework that use a router to change the URL.

## Rationale

Very simple server that returns a file if it exists, or 'index.html' otherwise (i.e. when the url requested is actually a SPA route).

Other simple http-servers (correctly) give a 404 when you try to refresh your browser for a page that is a route on a client side app.

## To use:

```sh
npm install -g angular-http-server
cd /path/to/site
angular-http-server
```

## Options

Specify a port using `-p <port number>`

```sh
angular-http-server -p 8080
```

And browse to `localhost:8080`.


HTTPS can be enabled (using a generated self-signed certificate) with `--https` or `--ssl`
```sh
angular-http-server --https
```


Feedback via: https://github.com/simonh1000/angular-http-server

## To develop

http://justjs.com/posts/npm-link-developing-your-own-npm-modules-without-tears
