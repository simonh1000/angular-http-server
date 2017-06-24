#!/usr/bin/env node

var fs = require("fs");
var argv = require('minimist')(process.argv.slice(2));

var server;

if (argv.ssl || argv.https) {
    var pem = require('pem');
    var https = require('https');
    pem.createCertificate({ days: 1, selfSigned: true }, function(err, keys) {
        var options = {
            key: keys.serviceKey,
            cert: keys.certificate,
            rejectUnauthorized: false
        };
        server = https.createServer(options, requestListener);
        start();
    });
} else {
    var http = require("http");
    server = http.createServer(requestListener);
    start();
}

function requestListener(req, res) {
    // console.log(req.url);
    var url = req.url.split('?')[0]
    var possibleFilename = url.slice(1) || "dummy";

    if (argv.cors) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Request-Method', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
        res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }
    }

    fs.stat(possibleFilename, function(err, stats) {

        var fileBuffer;

        if (!err && stats.isFile()) {

            var fileExtension = possibleFilename.split('.');
            // we need last part of array in case of e.g. xxxx.min.css
            fileExtension = fileExtension[fileExtension.length - 1];

            console.log("Sending file: %s", possibleFilename);
            fileBuffer = fs.readFileSync(possibleFilename);
            res.writeHead(200, { 'Content-Type': toMimeType(fileExtension) });
        } else {
            console.log("Route %s, replacing with index.html", possibleFilename);
            fileBuffer = fs.readFileSync("index.html");
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

function toMimeType(ext) {
    switch (ext) {
        case "js":
            return "application/javascript";
        case "png":
            return "image/png";
        default:
            return 'text/' + ext;
    }
}

function start() {
    server.listen(getPort(), function() {
        return console.log("Listening on " + getPort());
    });
}