// seeding-practice-main/api/model/nc_news.model.js
const db = require("../../db/connection");

exports.queryTopics = () => {
  return db.query("SELECT * FROM topics;").then((res) => res.rows);
};

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `SELECT 
         a.article_id,
         a.author,
         a.title,
         a.body,
         a.topic,
         a.created_at,
         a.votes,
         a.article_img_url,
         COUNT(c.comment_id)::INT AS comment_count
       FROM articles a
       LEFT JOIN comments c
         ON c.article_id = a.article_id
       WHERE a.article_id = $1
       GROUP BY a.article_id;`,
      [article_id],
    )
    .then((res) => res.rows[0]);
};

exports.queryArticles = ({ sort_by, order, topic }) => {
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

  const sort = validSortBy.includes(sort_by) ? sort_by : "created_at";
  const ord = validOrder.includes(order?.toLowerCase())
    ? order.toUpperCase()
    : "DESC";

  const values = [];
  let queryStr = `
    SELECT 
      a.article_id,
      a.author,
      a.title,
      a.topic,
      a.created_at,
      a.votes,
      a.article_img_url,
      COUNT(c.comment_id)::INT AS comment_count
    FROM articles a
    LEFT JOIN comments c
      ON c.article_id = a.article_id`;

  if (topic) {
    values.push(topic);
    queryStr += ` WHERE a.topic = $1`;
  }

  queryStr += `
    GROUP BY a.article_id
    ORDER BY ${sort} ${ord};`;

  return db.query(queryStr, values).then((res) => res.rows);
};

exports.queryCommentsByArticleId = (article_id) => {
  return db
    .query(
      `SELECT comment_id, author, body, created_at, votes
       FROM comments
       WHERE article_id = $1
       ORDER BY created_at DESC;`,
      [article_id],
    )
    .then((res) => res.rows);
};

exports.insertComment = (article_id, username, body) => {
  if (!username || !body) {
    return Promise.reject({ status: 400, msg: "Missing required fields" });
  }
  return db
    .query(
      `INSERT INTO comments (author, article_id, body)
       VALUES ($1, $2, $3)
       RETURNING 
         comment_id,
         author,
         body,
         created_at,
         votes,
         article_id;`,
      [username, article_id, body],
    )
    .then((res) => res.rows[0])
    .catch((err) => {
      if (err.code === "23503") {
        if (err.detail.includes("article_id")) {
          return Promise.reject({ status: 404, msg: "Article not found" });
        }
        if (err.detail.includes("author")) {
          return Promise.reject({ status: 404, msg: "User not found" });
        }
      }
      return Promise.reject(err);
    });
};

exports.patchArticleVotes = (article_id, inc_votes) => {
  return db
    .query(
      `UPDATE articles
       SET votes = votes + $1
       WHERE article_id = $2;`,
      [inc_votes, article_id],
    )
    .then(() => {
      return db
        .query(
          `SELECT 
           a.article_id,
           a.author,
           a.title,
           a.body,
           a.topic,
           a.created_at,
           a.votes,
           a.article_img_url,
           COUNT(c.comment_id)::INT AS comment_count
         FROM articles a
         LEFT JOIN comments c
           ON c.article_id = a.article_id
         WHERE a.article_id = $1
         GROUP BY a.article_id;`,
          [article_id],
        )
        .then((res) => res.rows[0]);
    });
};

exports.removeComment = (comment_id) => {
  return db
    .query(
      `DELETE FROM comments
       WHERE comment_id = $1
       RETURNING *;`,
      [comment_id],
    )
    .then((res) => {
      if (res.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
    });
};

exports.queryUsers = () => {
  return db
    .query("SELECT username, name, avatar_url FROM users;")
    .then((res) => res.rows);
};
