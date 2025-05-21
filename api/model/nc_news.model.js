const db = require("../../db/connection");

exports.queryTopics = () => {
  return db.query(`SELECT * FROM topics;`).then((res) => res.rows);
};

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `SELECT
         articles.*,
         COUNT(comments.comment_id)::INT AS comment_count
       FROM articles
       LEFT JOIN comments ON comments.article_id = articles.article_id
       WHERE articles.article_id = $1
       GROUP BY articles.article_id;`,
      [article_id],
    )
    .then((res) => res.rows[0]);
};

exports.queryArticles = ({ sort_by = "created_at", order = "desc", topic }) => {
  const validSorts = [
    "article_id",
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
    "comment_count",
  ];
  const validOrders = ["asc", "desc"];
  if (!validSorts.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "invalid sort_by" });
  }
  if (!validOrders.includes(order.toLowerCase())) {
    return Promise.reject({ status: 400, msg: "invalid order" });
  }
  const values = [];
  let topicFilter = "";
  if (topic) {
    topicFilter = `WHERE articles.topic = $1`;
    values.push(topic);
  }
  const checkTopic = topic
    ? db.query(`SELECT * FROM topics WHERE slug = $1;`, [topic]).then((res) => {
        if (res.rows.length === 0) {
          return Promise.reject({ status: 404, msg: "Topic not found" });
        }
      })
    : Promise.resolve();

  const queryStr = `
    SELECT
      articles.article_id,
      articles.title,
      articles.topic,
      articles.author,
      articles.created_at,
      articles.votes,
      articles.article_img_url,
      COUNT(comments.comment_id)::INT AS comment_count
    FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id
    ${topicFilter}
    GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order.toUpperCase()};
  `;

  return checkTopic.then(() =>
    db.query(queryStr, values).then((res) => res.rows),
  );
};

exports.queryCommentsByArticleId = (article_id) => {
  return db
    .query(
      `SELECT comment_id, votes, created_at, author, body, article_id
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
    .then(([artRes, userRes]) => {
      if (artRes.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      if (userRes.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "User not found" });
      }
      return db.query(
        `INSERT INTO comments (author, article_id, body)
         VALUES ($1, $2, $3)
         RETURNING *;`,
        [username, article_id, body],
      );
    })
    .then((res) => res.rows[0]);
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
       RETURNING *;`,
      [inc_votes, article_id],
    )
    .then((res) => {
      if (res.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return this.selectArticleById(article_id);
    });
};

exports.removeComment = (comment_id) => {
  if (isNaN(comment_id)) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *;`, [
      comment_id,
    ])
    .then((res) => {
      if (res.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
    });
};

exports.queryUsers = () => {
  return db
    .query(`SELECT username, name, avatar_url FROM users;`)
    .then((res) => res.rows);
};
