#!/usr/bin/env node

var fs = require("fs");
var argv = require('minimist')(process.argv.slice(2));
var mime = require('mime');
var path = require("path");
var pem = require('pem');
var https = require('https');
var http = require("http");

var server;

const NO_PATH_FILE_ERROR_MESSAGE = "Error: index.html could not be found in the specified path ";
const NO_ROOT_FILE_ERROR_MESSAGE = "Error: Could not find index.html within the working directory.";

//As a part of the startup - check to make sure we can access index.html
returnDistFile(true);

// Start with with/without https
if (argv.ssl || argv.https) {
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
    server = http.createServer(requestListener);
    start();
}

function start() {
    server.listen(getPort(), function () {
        return console.log("Listening on " + getPort());
    });
}


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

function returnDistFile(displayFileMessages = false) {
    var distPath;
    var argvPath = argv.path;

    if (argvPath) {
        try {
          if (displayFileMessages) {
            console.log("Path specified: %s", argvPath);
          }
          distPath = path.join(argvPath, 'index.html');
          if (displayFileMessages) {
            console.log("Using %s", distPath);
          }
          return fs.readFileSync(distPath);
        } catch (e) {
          console.log(NO_PATH_FILE_ERROR_MESSAGE + "%s", argvPath);
          process.exit(1);
        }
    } else {
        if (displayFileMessages) {
          console.log("Info: Path not specified using the working directory.");
        }
        distPath = "index.html";
        try {
          return fs.readFileSync(distPath);
        } catch (e) {
          console.log(NO_ROOT_FILE_ERROR_MESSAGE);
          process.exit(1);
        }
    }
}

function resolveUrl(filename) {
    // basic santizing to prevent attempts to read files outside of directory set
    if (filename.includes("..")) {
        return null;
    }
    if (filename && argv.path) {
        return path.join(argv.path, filename);
    } else {
        return filename;
    }
}
