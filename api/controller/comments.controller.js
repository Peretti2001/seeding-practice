const db = require("../../db/connection");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  db.query(
    "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;",
    [article_id],
  )
    .then(({ rows }) => {
      res.status(200).send({ comments: rows });
    })
    .catch(next);
};

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  if (isNaN(comment_id)) {
    return res.status(400).send({ msg: "bad request" });
  }
  db.query("DELETE FROM comments WHERE comment_id = $1 RETURNING *;", [
    comment_id,
  ])
    .then(({ rows }) => {
      if (rows.length === 0) {
        res.status(404).send({ msg: "Comment not found" });
      } else {
        res.status(204).send();
      }
    })
    .catch(next);
};
