#!/usr/bin/env node

var fs = require("fs");
var argv = require('minimist')(process.argv.slice(2));
var mime = require('mime');
var path = require("path");
var pem = require('pem');
var https = require('https');
var http = require("http");

var server;

// Start with with/without https
if (argv.ssl || argv.https) {
    pem.createCertificate({ days: 1, selfSigned: true }, function(err, keys) {
        var options = {
            key: keys.serviceKey,
            cert: keys.certificate,
            rejectUnauthorized: false
        };
        server = https.createServer(options, requestListener);
    });
} else {
    server = http.createServer(requestListener);
}

server.listen(getPort(), function () {
    return console.log("Listening on " + getPort());
});


// HELPERS


function requestListener(req, res) {
    // Add CORS header if option chosen
    if (argv.cors) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Request-Method', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
        res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
        // When the request is for CORS OPTIONS (rather than a page) return just the headers
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }
    }

    // Request is for a page instead
    // Only interested in the part before any query params
    var url = req.url.split('?')[0]
    // Attaches path prefix with --path option
    var possibleFilename = resolveUrl(url.slice(1)) || "dummy";

    fs.stat(possibleFilename, function(err, stats) {
        var fileBuffer;
        if (!err && stats.isFile()) {
            fileBuffer = fs.readFileSync(possibleFilename);
            let ct = mime.lookup(possibleFilename);
            console.log(`Sending ${possibleFilename} with Content-Type ${ct}`);
            res.writeHead(200, { 'Content-Type': ct });

        } else {
            console.log("Route %s, replacing with index.html", possibleFilename);
            fileBuffer = returnDistFile();
            res.writeHead(200, { 'Content-Type': 'text/html' });
        }

        res.write(fileBuffer);
        res.end();
    });
}

function getPort() {
    if (argv.p) {
        var portNum = parseInt(argv.p);
        if (!isNaN(portNum)) {
            return portNum;
        } else {
            throw new Exception("Provided port number is not a number!");
        }
    } else {
        return 8080;
    }
}

function returnDistFile() {
    var distPath;
    var argvPath = argv.path;

    if (argvPath && fs.existsSync(argvPath)) {
        distPath = path.join(argvPath, 'index.html');
    } else if (argvPath && !fs.existsSync(argvPath)) {
        console.log("Can't find %s, using current dir instead", argvPath);
        distPath = "index.html";
    }

    return fs.readFileSync(distPath);
}

function resolveUrl(filename) {
    if (filename && argv.path) {
        return path.join(argv.path, filename);
    } else {
        return filename;
    }
}
