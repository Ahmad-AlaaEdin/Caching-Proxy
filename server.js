const http = require('http')
const {program} = require('commander')

program
  .option("--port <number>", "Port to run the proxy server", parseInt)
  .option("--origin <url>", "Origin server URL")
  .option("--clear-cache", "Clear the cache")
  .action((options) => {
    

    if (!options.port || !options.origin) {
      console.error("Error: Both --port and --origin options are required.");
      process.exit(1);
    };


    server = http.createServer((req, res) => {})



    server.listen(options.port, () => {})


})
    
program.parse(process.argv)