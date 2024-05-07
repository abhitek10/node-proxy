const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');


const app = express()
const port = 5001;

//To serve static files such as images, CSS files, and JavaScript files, use the express.static built-in middleware function in Express.
app.use(express.static('src'))

//Define a route to serve the HTML file
app.get('/', (req, res) => {
    // Send the HTML file as the response
    res.sendFile('src/index.html', { root: __dirname });
});

//options for proxy server
const options = {
    target: 'https://jsonplaceholder.typicode.com',
    changeOrigin: true,
    //Rewrite target's url path. Object-keys will be used as RegExp to match paths.
    pathRewrite: { '^/old/api': '/new/api' },
    //Re-target option.target for specific requests.
    router: {
        // Use `host` and/or `path` to match requests. First match will be used.
        // The order of the configuration matters.
        'integration.localhost:3000': 'http://127.0.0.1:8001',  // host only
        'staging.localhost:3000': 'http://127.0.0.1:8002',  // host only
        'localhost:3000/api': 'http://127.0.0.1:8003',  // host + path
        '/rest': 'http://127.0.0.1:8004'   // path only
    },
    on: {
        proxyReq: function onProxyReq(proxyReq, req, res) {
            //function, subscribe to http-proxy's proxyReq event.
            // add custom header to request
            proxyReq.setHeader('x-added', 'foobar');
            // or log the req
        },
        proxyRes: function onProxyRes(proxyRes, req, res) {
            //function, subscribe to http-proxy's proxyRes event.
            proxyRes.headers['x-added'] = 'foobar'; // add new header to response
            delete proxyRes.headers['x-removed']; // remove header from response
        },
        error: function onError(err, req, res, target) {
            //function, subscribe to http-proxy's error event for custom error handling.
            res.writeHead(500, {
                'Content-Type': 'text/plain',
            });
            res.end('Something went wrong. And we are reporting a custom error message.');
        }
    }
}
app.use('/api', createProxyMiddleware(options));


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})