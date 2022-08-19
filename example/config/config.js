module.exports = {
    proxy: [
        {
            forward: ["todos"],
            target: "jsonplaceholder.typicode.com/todos/1",
            protocol: "https",
        },
    ],
};
