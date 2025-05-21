const {
  queryTopics,
  selectArticleById,
  queryArticles,
  insertComment,
  patchArticleVotes,
  removeComment,
  queryUsers,
} = require("../model/nc_news.model");

exports.getTopics = (req, res, next) => {
  queryTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      if (!article) return res.status(404).send({ msg: "404: Not Found" });
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  queryArticles(req.query)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.postCommentByArticleId = (req, res, next) => {
  console.log("🔥 POST /comments body:", req.body);
  const { article_id } = req.params;
  const { username, body } = req.body;
  insertComment(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  patchArticleVotes(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  removeComment(comment_id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
};

exports.getUsers = (req, res, next) => {
  queryUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};
