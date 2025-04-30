//this is where i would get the functions from the model

const { queryTopics, selectArticleById, queryArticles, insertComment, updateArticleVotes } = require("../model/nc_news.model")

exports.getTopics = (req, res, next)=>{
    return queryTopics()
    .then((topics) => {
      if (!topics) {
        return res.status(404).send({ msg: "404: Not Found" });
      }
      res.status(200).send({ topics: topics });
    })
    .catch((err) => {
      next(err);
    })
}

exports.getArticleById = (req, res, next)=>{
const { article_id } = req.params;
selectArticleById(article_id)
    .then((article) => {
      if (!article) {
        return res.status(404).send({ msg: "404: Not Found" });
      }

      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
}

exports.getArticles = (req, res, next)=>{
  return queryArticles()
  .then((articles) => {
    if (!articles) {
      return res.status(404).send({ msg: "404: Not Found" });
    }
    res.status(200).send({ articles: articles });
  })
  .catch((err) => {
    next(err);
  })
}

exports.postCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  insertComment(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      console.log("🔥 POST /comments error:", err);
      next(err);
    });
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  updateArticleVotes(article_id, inc_votes)
    .then((updatedArticle) => {
      res.status(200).send({ article: updatedArticle });
    })
    .catch((err) => {
      next(err);
    });
};
