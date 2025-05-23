// api/controller/nc_news.controller.js

const {
  queryTopics,
  selectArticleById,
  queryArticles,
  queryCommentsByArticleId,
  insertComment,
  patchArticleVotes,
  removeComment,
  queryUsers,
} = require("../model/nc_news.model");

// GET /api/topics
exports.getTopics = (req, res, next) => {
  queryTopics()
    .then((topics) => res.status(200).send({ topics }))
    .catch(next);
};

// GET /api/articles/:article_id
exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      if (!article) {
        return res.status(404).send({ msg: "Article not found" });
      }
      res.status(200).send({ article });
    })
    .catch((err) => {
      if (err.code === "22P02") {
        // invalid integer
        return res.status(400).send({ msg: "bad request" });
      }
      next(err);
    });
};

// GET /api/articles
exports.getArticles = (req, res, next) => {
  queryArticles(req.query)
    .then((articles) => res.status(200).send({ articles }))
    .catch(next);
};

// GET /api/articles/:article_id/comments
exports.getCommentsByArticleId = (req, res, next) => {
  queryCommentsByArticleId(req.params.article_id)
    .then((comments) => res.status(200).send({ comments }))
    .catch(next);
};

// POST /api/articles/:article_id/comments
exports.postCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  insertComment(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      if (err.status && err.msg) {
        return res.status(err.status).send({ msg: err.msg });
      }
      next(err);
    });
};

// PATCH /api/articles/:article_id
exports.patchArticleById = (req, res, next) => {
  patchArticleVotes(req.params.article_id, req.body.inc_votes)
    .then((updated) => res.status(200).send({ article: updated }))
    .catch(next);
};

// DELETE /api/comments/:comment_id
exports.deleteCommentById = (req, res, next) => {
  removeComment(req.params.comment_id)
    .then(() => res.sendStatus(204))
    .catch(next);
};

// GET /api/users
exports.getUsers = (req, res, next) => {
  queryUsers()
    .then((users) => res.status(200).send({ users }))
    .catch(next);
};
