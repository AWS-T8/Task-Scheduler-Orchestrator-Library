const rateLimit = require("express-rate-limit");

exports.createRateLimiter = rateLimit({
  windowMs: 4 * 1000, // 4 sec window
  max: 1, // start blocking after 1 request
  message:
    "Too many users created from this IP, permitted only 5 req/",
});

exports.getRateLimitter = rateLimit({
  windowMs: 1 * 1000, // 1 sec hour window
  max: 1, // start blocking after 1 requests
  message: "Too many requests from this IP, permitted only 1 req/sec",
});
