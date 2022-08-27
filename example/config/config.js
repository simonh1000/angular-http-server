module.exports = {
    proxy: [
        {
            forward: ["resources-test"],
            target: "localhost:8001",
            protocol: "http",
        },
    ],
};
