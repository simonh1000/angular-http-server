const httpProxy = require('http-proxy');

/**
 * Simple Http Proxy, proxies request where url is contained in config to target from config
 *
 * @param req
 * @param res
 * @param {object} configs - proxyConfig from config file
 * @param {boolean} useHttps - will determine protocol to use
 * @return {boolean} - will return whether request is being proxied
 */
function proxyHandler(req, res, configs, useHttps) {
    if (!configs || configs.length === 0) {
        throw new Error(
            'no proxyConfig present, please configure in you config file'
        );
    }
    let proxyHit = false;
    configs.forEach((config) => {
        if (!config.forward || config.forward.length === 0) {
            throw new Error('forward is missing or empty in your proxyConfig');
        }

        if (!config.target || config.target === '') {
            throw new Error('target is missing or empty in your proxyConfig');
        }

        proxyHit = config.forward.some((url) => req.url.indexOf(url) !== -1);
        if (proxyHit) {
            const protocol = useHttps ? 'https' : 'http';
            console.log(
                `Proxying request ${req.method}, ${req.url} to ${protocol}://${config.target}`
            );
            const proxy = httpProxy.createProxyServer({});
            proxy.web(req, res, {
                target: `${protocol}://${config.target}`,
            });
        }
    });

    return proxyHit;
}

module.exports = proxyHandler;
