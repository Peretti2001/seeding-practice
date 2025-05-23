const express = require("express");
const {
  getArticles,
  getArticleById,
  postCommentByArticleId,
  patchArticleById,
} = require("../controller/articles.controller");
const { getCommentsByArticleId } = require("../controller/comments.controller");

const articlesRouter = express.Router();

articlesRouter.get("/", getArticles);
articlesRouter.get("/:article_id", getArticleById);
articlesRouter.patch("/:article_id", patchArticleById);
articlesRouter.post("/:article_id/comments", postCommentByArticleId);

articlesRouter.get("/:article_id/comments", getCommentsByArticleId);

module.exports = articlesRouter;
