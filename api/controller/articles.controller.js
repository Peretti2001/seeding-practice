const db = require("../../db/connection");

exports.getArticles = (req, res, next) => {
  const { sort_by = "created_at", order = "desc", topic } = req.query;

  const validSortBy = [
    "article_id",
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
    "article_img_url",
    "comment_count",
  ];
  const validOrder = ["asc", "desc"];

  if (!validSortBy.includes(sort_by)) {
    return res.status(400).send({ msg: "invalid sort_by" });
  }
  if (!validOrder.includes(order.toLowerCase())) {
    return res.status(400).send({ msg: "invalid order" });
  }

  let queryStr = `
      SELECT articles.*, 
        COUNT(comments.comment_id)::INT AS comment_count 
      FROM articles
      LEFT JOIN comments ON comments.article_id = articles.article_id
    `;
  const queryParams = [];

  if (topic) {
    queryStr += ` WHERE articles.topic = $1`;
    queryParams.push(topic);
  }

  queryStr += `
      GROUP BY articles.article_id
      ORDER BY ${sort_by} ${order.toUpperCase()}
    `;

  db.query(queryStr, queryParams)
    .then(({ rows }) => {
      if (topic && rows.length === 0) {
        return db
          .query("SELECT * FROM topics WHERE slug = $1;", [topic])
          .then(({ rows: topicRows }) => {
            if (topicRows.length === 0) {
              return res.status(404).send({ msg: "Topic not found" });
            } else {
              res.status(200).send({ articles: [] });
            }
          });
      } else {
        const articles = rows.map(({ body, ...rest }) => rest);
        res.status(200).send({ articles });
      }
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  if (isNaN(article_id)) {
    return res.status(400).send({ msg: "bad request" });
  }
  db.query(
    `
    SELECT articles.*, 
      COUNT(comments.comment_id)::INT AS comment_count 
    FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id
    `,
    [article_id],
  )
    .then(({ rows }) => {
      if (rows.length === 0) {
        res.status(404).send({ msg: "Article not found" });
      } else {
        res.status(200).send({ article: rows[0] });
      }
    })
    .catch(next);
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  if (isNaN(article_id)) {
    return res.status(400).send({ msg: "bad request" });
  }
  if (inc_votes === undefined) {
    return res.status(400).send({ msg: "Missing required field: inc_votes" });
  }
  if (typeof inc_votes !== "number") {
    return res.status(400).send({ msg: "inc_votes must be a number" });
  }

  db.query(
    "UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;",
    [inc_votes, article_id],
  )
    .then(({ rows }) => {
      if (rows.length === 0) {
        res.status(404).send({ msg: "Article not found" });
      } else {
        res.status(200).send({ article: rows[0] });
      }
    })
    .catch(next);
};

exports.postCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  if (isNaN(article_id)) {
    return res.status(400).send({ msg: "bad request" });
  }
  if (!username || !body) {
    return res.status(400).send({ msg: "Missing required fields" });
  }

  // Check article exists
  db.query("SELECT * FROM articles WHERE article_id = $1;", [article_id])
    .then(({ rows: articles }) => {
      if (articles.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      // Check user exists
      return db.query("SELECT * FROM users WHERE username = $1;", [username]);
    })
    .then(({ rows: users }) => {
      if (users.length === 0) {
        return Promise.reject({ status: 404, msg: "User not found" });
      }
      // Insert comment
      return db.query(
        `
        INSERT INTO comments (author, article_id, body)
        VALUES ($1, $2, $3)
        RETURNING *;
      `,
        [username, article_id, body],
      );
    })
    .then(({ rows }) => {
      res.status(201).send({ comment: rows[0] });
    })
    .catch(next);
};
