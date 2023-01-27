#!/usr/bin/env node

var fs = require("fs");
var path = require("path");
var mime = require("mime");
var pem = require("pem");
var https = require("https");
var http = require("http");
var opn = require("opn");

var argv = require("minimist")(process.argv.slice(2));
const getFilePathFromUrl = require('./get-file-path-from-url');
const proxyHandler = require("./proxy");

// Pre-process arguments
const useHttps = argv.ssl || argv.https;
const basePath = argv.path ? path.resolve(argv.path) : process.cwd();
const baseHref = argv.baseHref ? argv.baseHref : '';
const rootFile = argv.rootFile ? argv.rootFile : 'index.html';
const port = getPort(argv.p);

const NO_PATH_FILE_ERROR_MESSAGE =
    `Error: rootFile ${rootFile} could not be found in the specified path `;

// if using config file, load that first
if (argv.config) {
    let configPath;
    if (path.isAbsolute(argv.config)) {
        configPath = argv.config;
    } else {
        configPath = path.join(process.cwd(), argv.config);
    }
    const getConfig = require(configPath);
    let config;
    if (typeof getConfig === "function") {
        config = getConfig(argv);
    } else {
        config = getConfig;
    }
    // supplement argv with config, but CLI args take precedence
    argv = Object.assign(config, argv);
}

// As a part of the startup - check to make sure we can accessrootFile 
returnDistFile(true);

// Start with/without https
let server;
if (useHttps) {
    const startSSLCallback = (err, keys) => {
        if (err) {
            throw err;
        }

        const options = {
            key: keys.serviceKey,
            cert: keys.certificate,
            rejectUnauthorized: false
        };
        server = https.createServer(options, requestListener);
        start();
    };

    if (argv.key && argv.cert) {
        const serviceKey = fs.readFileSync(argv.key);
        const certificate = fs.readFileSync(argv.cert);
        startSSLCallback(null, { serviceKey, certificate });
    } else {
        pem.createCertificate({ days: 1, selfSigned: true }, startSSLCallback);
    }
} else {
    server = http.createServer(requestListener);
    start();
}

function start() {
    server.listen(port, function () {
        if (argv.open == true || argv.o) {
            opn((useHttps ? "https" : "http") + "://localhost:" + port);
        }
        return console.log("Listening on " + port);
    });
}

// HELPERS

function requestListener(req, res) {
    // When we hit the proxy, return
    if (argv.proxy && proxyHandler(req, res, argv.proxy)) {
        return;
    }
    // Add CORS header if option chosen
    if (argv.cors) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Request-Method", "*");
        res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
        res.setHeader(
            "Access-Control-Allow-Headers",
            "authorization, content-type"
        );
        // When the request is for CORS OPTIONS (rather than a page) return just the headers
        if (req.method === "OPTIONS") {
            res.writeHead(200);
            res.end();
            return;
        }
    }

    const safeFullFileName = getFilePathFromUrl(req.url, basePath, { baseHref });

    // get file content
    let fileContent = getFileContent(req, safeFullFileName);
    // check file content
    if (fileContent && fileContent.content) {
        log(`Sending ${safeFullFileName} with Content-Type ${fileContent.type} and Content-Encoding ${fileContent.encoding || 'none'}`);
    }
    else {
        fileContent = getFileContent(req, path.join(basePath, rootFile));
        log(`Route %s, replacing with rootFile ${rootFile}`, safeFullFileName);
    }
    let headers = {};
    if (fileContent.type) headers["Content-Type"] = fileContent.type;
    if (fileContent.encoding) headers["Content-Encoding"] = fileContent.encoding;
    res.writeHead(200, headers);
    res.write(fileContent.content);
    res.end();

}

function getPort(portNo) {
    if (portNo) {
        var portNum = parseInt(portNo);
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

    try {
        if (displayFileMessages) {
            log("Serving from path: %s", basePath);
        }
        distPath = path.join(basePath, rootFile);
        if (displayFileMessages) {
            log("Using default file: %s", distPath);
        }
        return fs.readFileSync(distPath);
    } catch (e) {
        console.warn(NO_PATH_FILE_ERROR_MESSAGE + "%s", basePath);
        process.exit(1);
    }
}

function getFileContent(req, filePath) {

    let fileContent = null;
    let contentType = null;
    let contentEncoding = null;

    if (filePath) {
        // check accept-encoding header
        const isGZipped = argv.gzipstatic && req && req.headers && (req.headers['accept-encoding'] || '').split(',').findIndex(e => e.trim() === 'gzip') > -1;
        const filePathGZ = filePath + (isGZipped ? '.gz' : '');

        // if encoding has gzip, check {filePath}.gz file
        if (isGZipped) {
            try {
                let fileStats = fs.statSync(filePathGZ);
                if (fileStats && fileStats.isFile()) {
                    fileContent = fs.readFileSync(filePathGZ);
                    contentEncoding = "gzip";
                }
            }
            catch (error) { }
        }
        // if encoding has not gzip or {filePath}.gz file not exists, check {filePath}
        if (!isGZipped || !fileContent) {
            try {
                let fileStats = fs.statSync(filePath);
                if (fileStats && fileStats.isFile()) {
                    fileContent = fs.readFileSync(filePath);
                }
            }
            catch (error) { }
        }

        // set content type
        contentType = mime.lookup(filePath);
    }

    return {
        content: fileContent,
        type: contentType,
        encoding: contentEncoding
    }


}

function log() {
    if (!argv.silent) {
        console.log.apply(console, arguments);
    }
}
