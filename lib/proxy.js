const httpProxy = require("http-proxy");

var proxyServer = null;

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
    configs.forEach((config) => {
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
                // Clone the proxy config in order to make changes without affecting the original config object
                const proxyConfig = { ...config };
                
                const protocol = config.protocol ? config.protocol : "https";
                proxyConfig.target = `${protocol}://${proxyConfig.target}`;                
                console.log(
                    `Proxying request ${req.method}, ${req.url} to ${proxyConfig.target}`
                );

                // Remove "forward" property since we've already handled the forwarding logic
                delete proxyConfig["forward"];
                
                if (proxyServer === null) {
                    proxyServer = httpProxy.createProxyServer(proxyConfig);
                }

                proxyServer.web(req, res, (e, req, res) => {
                    console.error(`Proxy error: ${e.code}`);
                    res.writeHead(502);
                    res.end();
                });
            }
        }
    });
    return proxyHit;
}

module.exports = proxyHandler;
