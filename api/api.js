// seeding-practice-main/api/api.js
const express = require("express");
const cors = require("cors");
const endpoints = require("../endpoints.json");
const {
  getTopics,
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchArticleById,
  deleteCommentById,
  getUsers,
} = require("./controller/nc_news.controller");

const app = express();

app.use(cors());
app.use(express.json());

// Documentation endpoint
app.get("/api", (req, res) => {
  res.status(200).send({ endpoints });
});

// Topics
app.get("/api/topics", getTopics);

// Articles
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getArticles);

// Comments
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postCommentByArticleId);

// Votes
app.patch("/api/articles/:article_id", patchArticleById);

// Delete Comment
app.delete("/api/comments/:comment_id", deleteCommentById);

// Users
app.get("/api/users", getUsers);

// 404 for any other /api/* routes, using RegExp to avoid path-to-regexp errors
app.use(/^\/api\/.*$/, (req, res) => {
  res.status(404).send({ msg: "404: Not Found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (err.status && err.msg) {
    return res.status(err.status).send({ msg: err.msg });
  }
  res.status(500).send({ msg: "Internal server error" });
});

module.exports = app;
