// api/api.js
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

app.get("/api", (req, res) => {
  res.status(200).send({ endpoints });
});
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postCommentByArticleId);
app.patch("/api/articles/:article_id", patchArticleById);
app.delete("/api/comments/:comment_id", deleteCommentById);
app.get("/api/users", getUsers);

// catch-all fallback – use a RegExp to avoid path-to-regexp parsing errors
app.all(/.*/, (req, res) => {
  res.status(404).send({ msg: "404: Not Found" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") return res.status(400).send({ msg: "bad request" });
  if (err.status && err.msg)
    return res.status(err.status).send({ msg: err.msg });
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ msg: "Internal server error" });
});

module.exports = app;
