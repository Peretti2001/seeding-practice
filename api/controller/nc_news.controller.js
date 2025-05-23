// seeding-practice-main/api/controller/nc_news.controller.js
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
  if (Object.keys(req.query).length > 0) {
    return res.status(404).send({ msg: "404: Not Found" });
  }
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
        return res.status(400).send({ msg: "bad request" });
      }
      next(err);
    });
};

// GET /api/articles
exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic } = req.query;
  const validSortBy = [
    "article_id",
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
    "comment_count",
  ];
  const validOrder = ["asc", "desc"];

  if (sort_by && !validSortBy.includes(sort_by)) {
    return res.status(400).send({ msg: "invalid sort_by" });
  }
  if (order && !validOrder.includes(order.toLowerCase())) {
    return res.status(400).send({ msg: "invalid order" });
  }

  const sendArticles = () =>
    queryArticles({ sort_by, order, topic }).then((articles) =>
      res.status(200).send({ articles }),
    );

  if (topic) {
    return queryTopics()
      .then((topics) => {
        if (!topics.find((t) => t.slug === topic)) {
          return res.status(404).send({ msg: "Topic not found" });
        }
        return sendArticles();
      })
      .catch(next);
  }
  return sendArticles();
};

// GET /api/articles/:article_id/comments
exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  queryCommentsByArticleId(article_id)
    .then((comments) => res.status(200).send({ comments }))
    .catch((err) => {
      if (err.code === "22P02") {
        return res.status(400).send({ msg: "bad request" });
      }
      next(err);
    });
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
      if (err.code === "22P02") {
        return res.status(400).send({ msg: "bad request" });
      }
      next(err);
    });
};

// PATCH /api/articles/:article_id
exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  if (inc_votes === undefined) {
    return res.status(400).send({ msg: "Missing required field: inc_votes" });
  }
  if (typeof inc_votes !== "number") {
    return res.status(400).send({ msg: "inc_votes must be a number" });
  }
  patchArticleVotes(article_id, inc_votes)
    .then((article) => {
      if (!article) {
        return res.status(404).send({ msg: "Article not found" });
      }
      res.status(200).send({ article });
    })
    .catch((err) => {
      if (err.code === "22P02") {
        return res.status(400).send({ msg: "bad request" });
      }
      next(err);
    });
};

// DELETE /api/comments/:comment_id
exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  if (isNaN(Number(comment_id))) {
    return res.status(400).send({ msg: "bad request" });
  }
  removeComment(comment_id)
    .then(() => res.sendStatus(204))
    .catch((err) => {
      if (err.status && err.msg) {
        return res.status(err.status).send({ msg: err.msg });
      }
      next(err);
    });
};

// GET /api/users
exports.getUsers = (req, res, next) => {
  if (Object.keys(req.query).length > 0) {
    return res.status(404).send({ msg: "404: Not Found" });
  }
  queryUsers()
    .then((users) => res.status(200).send({ users }))
    .catch(next);
};
