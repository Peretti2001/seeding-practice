const db = require("../../db/connection");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.createArticleRef = (articleRows) => {
  const articleRef = {};
  articleRows.forEach(({ title, article_id }) => {
    articleRef[title] = article_id;
  });
  return articleRef;
};

exports.formatComments = (comments, articleRef) => {
  return comments.map(({ created_by, belongs_to, created_at, ...rest }) => {
    return [
      rest.body,
      rest.votes || 0,
      created_by,
      articleRef[belongs_to],
      new Date(created_at)
    ];
  });
};




