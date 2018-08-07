#!/usr/bin/env node

var fs = require("fs");
var argv = require('minimist')(process.argv.slice(2));
var mime = require('mime');
var path = require("path");
var pem = require('pem');
var https = require('https');
var http = require("http");
var opn = require('opn');



var server;

const NO_PATH_FILE_ERROR_MESSAGE = "Error: index.html could not be found in the specified path ";
const NO_ROOT_FILE_ERROR_MESSAGE = "Error: Could not find index.html within the working directory.";

// As a part of the startup - check to make sure we can access index.html
returnDistFile(true);

// Start with with/without https
if (argv.ssl || argv.https) {
    pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
        var options = {
            key: keys.serviceKey,
            cert: keys.certificate,
            rejectUnauthorized: false
        };
				server = https.createServer(options, requestListener);
				checkPort(getPort());
    });
} else {
		server = http.createServer(requestListener);
		checkPort(getPort());
}


function start(port) {
	server.listen(port, function () {
		if (argv.open == true || argv.o) {
			opn(((argv.ssl) ? 'https' : 'http') + "://localhost:" + port);
		}
		return console.log("Listening on " + port);
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

    var safeFileName = path.normalize(possibleFilename).replace(/^(\.\.[\/\\])+/, '');
    // Insert "." to ensure file is read relatively (Security)
    var safeFullFileName = path.join(".", safeFileName);

    fs.stat(safeFullFileName, function (err, stats) {
        var fileBuffer;
        if (!err && stats.isFile()) {
            fileBuffer = fs.readFileSync(safeFullFileName);
            let ct = mime.lookup(safeFullFileName);
            log(`Sending ${safeFullFileName} with Content-Type ${ct}`);
            res.writeHead(200, { 'Content-Type': ct });

        } else {
            log("Route %s, replacing with index.html", safeFullFileName);
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

function checkPort(port) {
	isPortTaken(port, function (response) {
		if (response == true) {
			console.log("Port " + port + "is busy. Incremeting port");
			checkPort(++port);
		} else {
			start(port);
		}
	});
}

function isPortTaken(port, fn) {
	var net = require('net')
	var tester = net.createServer()
		.once('error', function (err) {
			if (err.code != 'EADDRINUSE') return fn(err)
			fn(true)
		})
		.once('listening', function () {
			tester.once('close', function () {
					fn(false)
				})
				.close()
		})
		.listen(port)
}

function returnDistFile(displayFileMessages = false) {
    var distPath;
    var argvPath = argv.path;

    if (argvPath) {
        try {
            if (displayFileMessages) {
                log("Path specified: %s", argvPath);
            }
            distPath = path.join(argvPath, 'index.html');
            if (displayFileMessages) {
                log("Using %s", distPath);
            }
            return fs.readFileSync(distPath);
        } catch (e) {
            console.warn(NO_PATH_FILE_ERROR_MESSAGE + "%s", argvPath);
            process.exit(1);
        }
    } else {
        if (displayFileMessages) {
            log("Info: Path not specified using the working directory.");
        }
        distPath = "index.html";
        try {
            return fs.readFileSync(distPath);
        } catch (e) {
            console.warn(NO_ROOT_FILE_ERROR_MESSAGE);
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

function log() {
    if (!argv.silent) {
        console.log.apply(console, arguments);
    }
}