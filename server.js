"use strict";
// create an API server
const Restify = require("restify");
const server = Restify.createServer({
  name: "ManualMate",
});
const PORT = process.env.PORT || 3000;
const tmdb = require("./tmdb");
server.use(Restify.jsonp());

// Tokens
const config = require("./config");

// FBeamer
const FBeamer = require("./fbeamer");
const f = new FBeamer(config.FB);

// Register the webhooks
server.get("/", (req, res, next) => {
  f.registerHook(req, res);
  return next();
});

// Receive all incoming messages
server.post(
  "/",
  (req, res, next) => f.verifySignature(req, res, next),
  Restify.bodyParser(),
  (req, res, next) => {
    f.incoming(req, res, (msg) => {
      // Process messages
      const { message, sender } = msg;

      if (message && message.nlp.entities) {
        tmdb(message.nlp.entities)
          .then((response) => {
            f.txt(sender, response.txt);
            if (response.img) {
              f.img(sender, response.img);
            }
          })
          .catch((error) => {
            console.log(error);
            f.txt(sender, "My servers are acting up. Do check back later...");
          });
        // If a text message is received
      }
    });
    res.send(200);
    return next();
  }
);

// Subscribe
f.subscribe();

server.listen(PORT, () => console.log(`ManualMate running on port ${PORT}`));
