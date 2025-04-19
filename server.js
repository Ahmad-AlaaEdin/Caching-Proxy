const http = require("http");
const axios = require("axios");
const { program } = require("commander");
const Cache = require("./cache"); // Ensure `cache.js` exports a class

program
  .option("--port <number>", "Port to run the proxy server", parseInt)
  .option("--origin <url>", "Origin server URL")
  .option("--clear-cache", "Clear the cache")
  .action(async (options) => {
    if (!options.port || !options.origin) {
      console.error("Error: Both --port and --origin options are required.");
      process.exit(1);
    }

    const redis = new Cache();

    if (options.clearCache) {
      console.log("Clearing cache...");
      await redis.flushall(); // Assuming `flushall` is an async method
      process.exit(0);
    }

    const server = http.createServer(async (req, res) => {
      const key = `${req.method}:${req.url}`;
      console.log(`Request: ${key}`);

      try {
        const cachedResponse = await redis.get(key);
        if (cachedResponse) {
          res.setHeader("X-Cache", "HIT");
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(cachedResponse);
          return; // Prevent further execution
        }

        const url = new URL(options.origin, req.url).toString();
console.log(`Fetching: ${url}`);

        const proxyReq = await axios({
          method: req.method,
          url,
          headers: { ...req.headers }, // Forward headers
          data: req.method !== "GET" ? req.body : undefined, // Support POST, PUT, etc.
          responseType: "text",
        });

        res.setHeader("X-Cache", "MISS");
        res.writeHead(proxyReq.status, proxyReq.headers);
        res.end(proxyReq.data);

        await redis.set(key, proxyReq.data); // Cache the response
      } catch (err) {
        console.error("Proxy error:", err.message);
        res.writeHead(500);
        res.end("Internal Server Error");
      }
    });

    server.listen(options.port, () => {
      console.log(
        `Proxy server running on http://localhost:${options.port}, proxying to ${options.origin}`
      );
    });
  });

program.parse(process.argv);
