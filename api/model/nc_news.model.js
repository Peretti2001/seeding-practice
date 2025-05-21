// api/model/nc_news.model.js
const db = require("../../db/connection");

exports.queryTopics = () => {
  return db
    .query(`SELECT slug, description FROM topics;`)
    .then(({ rows }) => rows);
};

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `SELECT
         a.article_id,
         a.title,
         a.body,
         a.topic,
         a.author,
         a.created_at,
         a.votes,
         a.article_img_url,
         COUNT(c.comment_id)::INT AS comment_count
       FROM articles a
       LEFT JOIN comments c ON c.article_id = a.article_id
       WHERE a.article_id = $1
       GROUP BY a.article_id;`,
      [article_id],
    )
    .then(({ rows }) => rows[0]);
};

exports.queryArticles = ({ sort_by, order, topic } = {}) => {
  // valid columns and orders
  const validSort = [
    "article_id",
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
    "comment_count",
  ];
  const validOrder = ["asc", "desc"];

  const sort = sort_by || "created_at";
  const ord = (order || "desc").toLowerCase();

  if (!validSort.includes(sort)) {
    return Promise.reject({ status: 400, msg: "invalid sort_by" });
  }
  if (!validOrder.includes(ord)) {
    return Promise.reject({ status: 400, msg: "invalid order" });
  }

  let queryStr = `
    SELECT
      a.article_id,
      a.title,
      a.topic,
      a.author,
      a.created_at,
      a.votes,
      a.article_img_url,
      COUNT(c.comment_id)::INT AS comment_count
    FROM articles a
    LEFT JOIN comments c ON c.article_id = a.article_id
  `;
  const queryVals = [];

  if (topic) {
    queryVals.push(topic);
    queryStr += `WHERE a.topic = $1 `;
  }

  queryStr += `
    GROUP BY a.article_id
    ORDER BY ${sort} ${ord.toUpperCase()};
  `;

  // If filtering by topic, ensure it exists first
  if (topic) {
    return db
      .query(`SELECT slug FROM topics WHERE slug = $1;`, [topic])
      .then(({ rows }) => {
        if (rows.length === 0)
          return Promise.reject({ status: 404, msg: "Topic not found" });
        return db.query(queryStr, queryVals).then(({ rows }) => rows);
      });
  }

  // no topic filter
  return db.query(queryStr, queryVals).then(({ rows }) => rows);
};

exports.insertComment = (article_id, username, body) => {
  if (!username || !body) {
    return Promise.reject({ status: 400, msg: "Missing required fields" });
  }
  if (isNaN(article_id)) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }

  const checkArticle = db.query(
    `SELECT * FROM articles WHERE article_id = $1;`,
    [article_id],
  );
  const checkUser = db.query(`SELECT * FROM users WHERE username = $1;`, [
    username,
  ]);

  return Promise.all([checkArticle, checkUser])
    .then(([{ rows: aRows }, { rows: uRows }]) => {
      if (aRows.length === 0)
        return Promise.reject({ status: 404, msg: "Article not found" });
      if (uRows.length === 0)
        return Promise.reject({ status: 404, msg: "User not found" });

      return db.query(
        `INSERT INTO comments (author, article_id, body)
         VALUES ($1, $2, $3)
         RETURNING comment_id, author, article_id, body, votes, created_at;`,
        [username, article_id, body],
      );
    })
    .then(({ rows }) => rows[0]);
};

exports.patchArticleVotes = (article_id, inc_votes) => {
  if (inc_votes === undefined) {
    return Promise.reject({
      status: 400,
      msg: "Missing required field: inc_votes",
    });
  }
  if (typeof inc_votes !== "number") {
    return Promise.reject({ status: 400, msg: "inc_votes must be a number" });
  }
  if (isNaN(article_id)) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }

  return db
    .query(
      `UPDATE articles
         SET votes = votes + $1
       WHERE article_id = $2
       RETURNING article_id, title, topic, author, body, created_at, votes, article_img_url;`,
      [inc_votes, article_id],
    )
    .then(({ rows }) => {
      if (rows.length === 0)
        return Promise.reject({ status: 404, msg: "Article not found" });
      return rows[0];
    });
};

exports.removeComment = (comment_id) => {
  if (isNaN(comment_id)) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }
  return db
    .query(
      `DELETE FROM comments
       WHERE comment_id = $1
       RETURNING *;`,
      [comment_id],
    )
    .then(({ rows }) => {
      if (rows.length === 0)
        return Promise.reject({ status: 404, msg: "Comment not found" });
    });
};

exports.queryUsers = () => {
  return db
    .query(`SELECT username, name, avatar_url FROM users;`)
    .then(({ rows }) => rows);
};
