#!/usr/bin/env node
var http = require("http");
var fs = require("fs");

function sendFile(fname) {}

var server = http.createServer(function (req, res) {
    var possibleFilename = req.url.slice(1) || "dummy";

    fs.stat(possibleFilename, function (err, stats) {

        var fileBuffer;

        if (!err && stats.isFile()) {
            console.log("Sending file: %s", possibleFilename);
            fileBuffer = fs.readFileSync(possibleFilename);
            res.writeHead(200, { 'Content-Type': 'text/css' });
        }
        else {
            console.log("Route %s, replacing with index.html", possibleFilename);
            fileBuffer = fs.readFileSync("index.html");
            res.writeHead(200, { 'Content-Type': 'text/html' });
        }

        res.write(fileBuffer);
        res.end();
    });
});
server.listen(8000, function () { return console.log("Listening"); });
