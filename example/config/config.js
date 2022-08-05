module.exports = {
    proxyConfig: [
        {
            forward: ['beach.jpg', 'api-proxy/example'],
            target: 'www.google.nl',
        },
        {
            forward: ['api/example-api-2', 'image.svg'],
            target: 'www.github.com',
        },
    ],
};
