//this is where i would get the functions from the model

const { queryTopics, selectArticleById, queryArticles, selectCommentsByArticleId } = require("../model/nc_news.model")

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

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  selectCommentsByArticleId(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};
