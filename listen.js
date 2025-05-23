// listen.js
const express = require("express");
const cors = require("cors");
const apiRouter = require("./api/api"); // your existing Express app/router

const app = express();

// Enable CORS for all origins
app.use(cors());

// Parse incoming JSON bodies
app.use(express.json());

// Mount your API routes under /api
app.use("/api", apiRouter);

// Error handler (catches errors thrown in your controllers)
app.use((err, req, res, next) => {
  console.error(err);
  // If controller threw an error with status & msg, use those
  if (err.status && err.msg) {
    return res.status(err.status).send({ msg: err.msg });
  }
  res.status(500).send({ msg: "Internal server error" });
});

// Start the server
const PORT = process.env.PORT || 9090;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
