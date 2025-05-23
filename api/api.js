const express = require("express");
const cors = require("cors");

const topicsRouter = require("./routes/topics.router");
const articlesRouter = require("./routes/articles.router");
const usersRouter = require("./routes/users.router");
const commentsRouter = require("./routes/comments.router");

const endpointsJson = require("../endpoints.json");

const app = express();

app.use(cors());
app.use(express.json());

// Routers
app.get("/api", (req, res) => {
  res.status(200).send({ endpoints: endpointsJson });
});

app.use("/api/topics", topicsRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/users", usersRouter);
app.use("/api/comments", commentsRouter);

// 404 for invalid routes
app.all("*", (req, res) => {
  res.status(404).send({ msg: "404: Not Found" });
});

// Error handling
app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    return res.status(err.status).send({ msg: err.msg });
  }
  res.status(500).send({ msg: "Internal server error" });
});

module.exports = app;
