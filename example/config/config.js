module.exports = {
    proxy: [
        {
            forward: ['beach.jpg', 'api-proxy/example'],
            target: 'www.google.nl',
        },
        {
            forward: ['api/example-api-2', 'image.svg'],
            target: 'www.github.com',
            protocol: 'http'
        },
    ],
};
