# Angular-HTTP-Server

## Rationale

Very simple server that returns a file if it exists, or 'index.html' otherwise (i.e. when the url requested is actually a SPA route).

Other simple http-servers (correctly) give a 404 when you try to refresh your browser for a page that is a route on a client side app

## To use:

```
cd /path/to/site
angular-http-server
```

And browse to `localhost:8080`.

Feedback via: https://github.com/simonh1000/angular-http-server
