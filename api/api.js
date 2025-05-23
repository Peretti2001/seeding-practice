const express = require("express");
const articlesRouter = require("./routes/articles.router"); // Make sure this file exists!
const topicsRouter = require("./routes/topics.router"); // If you have topics
const usersRouter = require("./routes/users.router"); // If you have users
const commentsRouter = require("./routes/comments.router"); // If you have comments

const apiRouter = express.Router();

// Add all your route handlers
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/topics", topicsRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/comments", commentsRouter);

// API Home endpoint (optional)
apiRouter.get("/", (req, res) => {
  res.status(200).send({ msg: "Welcome to the NC News API!" });
});

// Fallback 404 for undefined routes
apiRouter.all("*", (req, res) => {
  res.status(404).send({ msg: "404: Not Found" });
});

module.exports = apiRouter;
