const express = require("express");
const cors = require("cors");
const apiRouter = require("./api/api");

const app = express();

app.use(cors());
app.use(express.json());

// Mount all API routes under /api
app.use("/api", apiRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  if (err.status && err.msg) {
    return res.status(err.status).send({ msg: err.msg });
  }
  res.status(500).send({ msg: "Internal server error" });
});

const PORT = process.env.PORT || 9090;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
