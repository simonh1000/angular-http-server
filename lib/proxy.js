const httpProxy = require("http-proxy");

let proxyServer = null;
let rewriteCache = {};


/**
 * Simple Http Proxy, proxies request where url is contained in config to target from config
 *
 * @param req
 * @param res
 * @param {object} configs - proxyConfig from config file
 * @return {boolean} - will return whether request is being proxied
 */
function proxyHandler(req, res, configs) {
    if (!configs || configs.length === 0) {
        throw new Error(
            "no proxy configs present, please configure in your config file"
        );
    }
    let proxyHit = false;
    configs.forEach((config, configId) => {
        if (!proxyHit) {
            if (!config.forward || config.forward.length === 0) {
                throw new Error(
                    "forward is missing or empty in your proxyConfig"
                );
            }

            if (!config.target || config.target === "") {
                throw new Error(
                    "target is missing or empty in your proxyConfig"
                );
            }

            proxyHit = config.forward.some(
                (url) => req.url.indexOf(url) !== -1
            );
            if (proxyHit) {
                const protocol = config.protocol ? config.protocol : "https";

                if (config.pathRewrite) {
                    pathRewrite(config.pathRewrite, configId, req);
                }

                console.log(
                    `Proxying request ${req.method}, ${req.url} to ${protocol}://${config.target}`
                );
                
                if (proxyServer === null) {
                    proxyServer = httpProxy.createProxyServer({});
                }

                proxyServer.web(req, res, {
                    target: `${protocol}://${config.target}`,
                }, (e, req, res) => {
                    console.error(`Proxy error: ${e.code}`);
                    res.writeHead(502);
                    res.end();
                 });
            }
        }
    });
    return proxyHit;
}


function pathRewrite(pathRewriteConfig, configId, req) {
    if (!rewriteCache[configId]) {
        rewriteCache[configId] = Object.entries(pathRewriteConfig).map(([key, value]) => ({
            rule: new RegExp(key),
            value
        }));
    }

    for (let rewrite of rewriteCache[configId]) {
        if (rewrite.rule.test(req.url)) {
            const path = req.url.replace(rewrite.rule, rewrite.value);
            console.log(`Proxy path rewrite from ${req.url} to ${path}`);
            req.url = path;
            break;
        }
    }
}

module.exports = proxyHandler;
