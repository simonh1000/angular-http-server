# Single Page App dev-server

A simple dev-server designed for Single Page App (SPA) developers. **`angular-http-server` is not, and makes no claims to be, a production server.**

It returns a file if it exists (ex. your-icon.png, index.html), routes all other requests to index.html (rather than giving a 404 error) so that you SPA's routing can take over. The only time it will error out is if it can't locate the index.html file.

Originally designed for my Angular work, this dev-server will work with any Single Page App (SPA) framework that uses URL routing (React, Vue, Elm, ...).

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

Open in a default browser automatically by using `--open` alias `-o`

```sh
angular-http-server --open
```

HTTPS can be enabled (using a generated self-signed certificate) with `--https` or `--ssl`

```sh
angular-http-server --https
```

You may manually specify the paths to your self-signed certificate using the `--key` and `--cert` flags

```sh
angular-http-server --https --key ./secret/key.pem --cert ./secret/cert.pem
```

[CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) can be enabled with the --cors flag

```sh
angular-http-server --cors
```

Specify a path to serve from

```sh
angular-http-server --path example
```

Specify the base href of the application

```sh
angular-http-server --baseHref myapp
```

Specify the rootFile of the application

```sh
angular-http-server --rootFile myindex.html
```

Specify the host of the application. It's used when open is true to redirect browser to navigate for the host. Example: http://mydomain.local:8080

```sh
angular-http-server --open --host mydomain.local
```

Disable logging

```sh
angular-http-server --silent
```

All options can be specified by a config file, optionally read via `--config` flag.
CLI options take precedence over any options read from the config file.

```sh
angular-http-server --config configs/angular-http-server.config.js
```

Feedback via: https://github.com/simonh1000/angular-http-server

## Config File

The config file can either export an object of parameters, or a function that will be passed in the parsed `argv` from minimalist.

Simple example:

```js
module.exports = {
    p: 8081,
    cors: true,
    silent: true,
};
```

Complicated example:

```js
module.exports = (argv) => {
    const config = {
        cors: true,
    };

    if (argv.p === 443) {
        config.ssl = true;
    }

    return config;
};
```

## Http proxy

The server contains a simple http proxy.
The proxy must be configured in the config file.

### Configuring proxy

#### Basic proxy config
To configure the proxy add a proxy object to your config file.
The proxy should be an array of configs with two required properties: a `forward` property which must be a string array listing url parts which should trigger the proxy, and a `target` property which should define the target to proxy to.
The config can also contain an optional `protocol` option, when this is absent the server will default to https.

#### Additional proxy options

For more advanced configurations you can add properties from the [node-http-proxy](https://github.com/http-party/node-http-proxy#options) options. For example a `secure: false` option to disable ssl verification.

#### Example

```js
module.exports = {
    proxy: [
        {
            // Basic config
            forward: ["api/example-api", "api-proxy/example"],
            target: "localhost:5000",
            protocol: "http",
        },
        {
            // Advanced config
            forward: ["api/example-api-2", "api-proxy-2/example"],
            target: "localhost:6000",
            secure: false,
            auth: "admin:secretPW",
            proxyTimeout: 8000,
        },
    ],
};
```

## Self-Signed HTTPS Use

#### Production

The `--https` or `--ssl` flags are intended for **development and/or testing purposes only**. Self-signed certificates do not properly verify the identity of the web app and they will cause an end-users web browser to display an error. This can be accomplished by using the self-signed certificate generated when you pass the `--https`/`--ssl` flag. An example of when you should use this feature is with end-to-end testing suites such as [Protractor](http://www.protractortest.org/) or other suites which require the SPA application to be served over https.

## Changelog

-   1.12.0 - adds host support (thanks jpwerka)
-   1.11.0 - adds proxy support (thanks AVierwind)
-   1.10.0 - adds --rootPath (thanks Aakash)
-   1.9.0 - adds --baseHref (thanks bertbaron)
-   1.8.0 - rewrite of path resolution (thanks dpraul)
-   1.7.0 - add option to include own ssl certificate (thanks dpraul)
-   1.6.0 - add --config option (thanks dpraul)
-   1.5.0 - add --open option (thanks tluanga34)
-   1.4.0 - add --path option (thanks nick-bogdanov)

## Contributing

Contributions are welcome, but do create an issue first to discuss.

Use prettier for formatting

## Testing

Run unit tests with

```sh
$ npm run test
```

Testing - try:

```sh
node angular-http-server.js --path example --ssl -p 9000
```
