const { expect } = require("chai");
const proxyHandler = require("./proxy");
const httpMock = require("node-mocks-http");

describe("proxyHandler", () => {
    it("should not proxy request to target when url from forward is not present", () => {
        const config = [
            {
                forward: ["sample", "proxy-this"],
                target: "www.github.com",
            },
        ];
        const req = httpMock.createRequest({
            method: "GET",
            url: "https://localhost:4200/proxyTest",
            pipe: () => {},
        });

        expect(proxyHandler(req, {}, config, false)).to.equal(false);
    });

    it("should proxy request to target when url from forward is present", () => {
        const config = [
            {
                forward: ["sample", "proxy-this"],
                target: "www.github.com",
            },
        ];
        const req = httpMock.createRequest({
            method: "GET",
            url: "https://localhost:4200/proxyTest/proxy-this",
            pipe: () => {},
        });

        expect(proxyHandler(req, {}, config, false)).to.equal(true);
    });

    it("should throw error when no config present", () => {
        config = [];
        const req = httpMock.createRequest({
            method: "GET",
            url: "https://localhost:4200/proxyTest/proxy-this",
            pipe: () => {},
        });

        expect(() => proxyHandler(req, {}, null, false)).to.throw(
            "no proxyConfig present, please configure in your config file"
        );
    });

    it("should throw error when forward is missing", () => {
        const config = [
            {
                forward: [],
                target: "www.github.com",
            },
        ];
        const req = httpMock.createRequest({
            method: "GET",
            url: "https://localhost:4200/proxyTest/proxy-this",
            pipe: () => {},
        });

        expect(() => proxyHandler(req, {}, config, false)).to.throw(
            "forward is missing or empty in your proxyConfig"
        );
    });
    it("should throw error when target is missing", () => {
        const config = [
            {
                forward: ["sample", "proxy-this"],
                target: "",
            },
        ];
        const req = httpMock.createRequest({
            method: "GET",
            url: "https://localhost:4200/proxyTest/proxy-this",
            pipe: () => {},
        });

        expect(() => proxyHandler(req, {}, config, false)).to.throw(
            "target is missing or empty in your proxyConfig"
        );
    });
});
