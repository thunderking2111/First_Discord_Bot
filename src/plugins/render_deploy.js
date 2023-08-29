const axios = require('axios').default;
const { embadedMsg } = require('../messaging.js');
const http = require('http');

const RENDER_HTTP_PORT = process.env.PORT || 10000;
const RENDER_PUBLIC_URL = process.env.PUBLIC_URL;

function keepAwake() {
  axios.create({ timeout: 10*1000 })
    .get(RENDER_PUBLIC_URL)
    .catch((error) => {
      if (error.code !== 'ECONNABORTED') {
        console.log(error);
        embadedMsg({ type: 'error', options: { description: error }});
      }
    });
}

function startServer() {
  const server = http.createServer((req, res) => {
    res.writeHead(200, {
      'Content-type': 'text/plain'
    });
    res.write('Hey');
    res.end();
  });

  server.listen(RENDER_HTTP_PORT, () => {
    const address = server.address();
    const logMessage = `Server is listening at ${address.address}:${address.port}`;
    console.log(logMessage);
    embadedMsg({ type: 'log', options: {
      description: logMessage,
    }});
  });
}

function setup() {
  startServer();
  keepAwake();
  setInterval(keepAwake, 1000*10*60);
}

module.exports = { setup };
