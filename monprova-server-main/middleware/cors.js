const cors = require('cors');

const whiteList = new Set(["https://monprova-9037c.web.app"]); // Add localhost:8000

const corsOptions = {
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  origin: function(origin, callback) {
    if (whiteList.has(origin) || !origin) {  // Allow requests with no origin (like mobile apps or Postman)
      callback(null, true); // Allow the origin
    } else {
      callback(new Error("Blocked by CORS")); // Block the origin
    }
  },
  credentials: true // Allow credentials (cookies, authorization headers, etc.)
};

module.exports = cors(corsOptions);
