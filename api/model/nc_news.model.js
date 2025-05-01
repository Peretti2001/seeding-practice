//this is quere ill add the query

const db = require('../../db/connection');

exports.queryTopics = () => {
  return db
    .query('SELECT slug, description FROM topics;')
    .then(({ rows }) => rows);
};

exports.selectArticleById = (article_id) => {
    if (isNaN(article_id)) return Promise.reject({ status: 400, msg: 'bad request' });
    return db
      .query(
        `SELECT
           a.author,
           a.title,
           a.article_id,
           a.body,
           a.topic,
           a.created_at,
           a.votes,
           a.article_img_url,
           COUNT(c.comment_id)::INT AS comment_count
         FROM articles a
         LEFT JOIN comments c ON c.article_id = a.article_id
         WHERE a.article_id = $1
         GROUP BY a.article_id;`,
        [article_id]
      )
      .then(({ rows }) => {
        if (rows.length === 0) throw { status: 404, msg: 'Article not found' };
        return rows[0];
      });
  };
  

exports.queryArticles = (sort_by = 'created_at', order = 'DESC', topic) => {
    const validSorts = ['article_id','title','topic','author','created_at','votes','comment_count'];
    const validOrders = ['ASC','DESC'];
    if (!validSorts.includes(sort_by)) return Promise.reject({ status: 400, msg: 'invalid sort_by' });
    const ord = order.toUpperCase();
    if (!validOrders.includes(ord)) return Promise.reject({ status: 400, msg: 'invalid order' });
    if (!topic) {
      return db.query(
        `SELECT
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
         GROUP BY a.article_id
         ORDER BY ${sort_by} ${ord};`
      ).then(({ rows }) => rows);
    }
    return db.query('SELECT * FROM topics WHERE slug = $1;', [topic])
      .then(({ rows }) => {
        if (rows.length === 0) throw { status: 404, msg: 'Topic not found' };
        return db.query(
          `SELECT
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
           WHERE a.topic = $1
           GROUP BY a.article_id
           ORDER BY ${sort_by} ${ord};`,
          [topic]
        );
      })
      .then(({ rows }) => rows);
  };
  
  

exports.selectCommentsByArticleId = (article_id) => {
  if (isNaN(article_id)) {
    return Promise.reject({ status: 400, msg: 'bad request' });
  }
  return db
    .query('SELECT * FROM articles WHERE article_id = $1;', [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) throw { status: 404, msg: 'Article not found' };
      return db.query(
        `SELECT
           comment_id,
           votes,
           created_at,
           author,
           body,
           article_id
         FROM comments
         WHERE article_id = $1
         ORDER BY created_at DESC;`,
        [article_id]
      );
    })
    .then(({ rows }) => rows);
};

exports.insertComment = (article_id, username, body) => {
  if (!username || !body) {
    return Promise.reject({ status: 400, msg: 'Missing required fields' });
  }
  if (isNaN(article_id)) {
    return Promise.reject({ status: 400, msg: 'bad request' });
  }
  const checkArticle = db.query('SELECT * FROM articles WHERE article_id = $1;', [article_id]);
  const checkUser = db.query('SELECT * FROM users WHERE username = $1;', [username]);
  return Promise.all([checkArticle, checkUser])
    .then(([artRes, usrRes]) => {
      if (artRes.rows.length === 0) throw { status: 404, msg: 'Article not found' };
      if (usrRes.rows.length === 0) throw { status: 404, msg: 'User not found' };
      return db.query(
        `INSERT INTO comments (author, article_id, body)
         VALUES ($1, $2, $3)
         RETURNING *;`,
        [username, article_id, body]
      );
    })
    .then(({ rows }) => rows[0]);
};

exports.updateArticleVotes = (article_id, inc_votes) => {
  if (inc_votes === undefined) {
    return Promise.reject({ status: 400, msg: 'Missing required field: inc_votes' });
  }
  if (typeof inc_votes !== 'number' || isNaN(inc_votes)) {
    return Promise.reject({ status: 400, msg: 'inc_votes must be a number' });
  }
  if (isNaN(article_id)) {
    return Promise.reject({ status: 400, msg: 'bad request' });
  }
  return db
    .query(
      `UPDATE articles
       SET votes = votes + $1
       WHERE article_id = $2
       RETURNING *;`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) throw { status: 404, msg: 'Article not found' };
      return rows[0];
    });
};

exports.removeCommentById = (comment_id) => {
  if (isNaN(comment_id)) {
    return Promise.reject({ status: 400, msg: 'bad request' });
  }
  return db
    .query(
      `DELETE FROM comments
       WHERE comment_id = $1
       RETURNING *;`,
      [comment_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) throw { status: 404, msg: 'Comment not found' };
    });
};

exports.queryUsers = () => {
  return db
    .query('SELECT username, name, avatar_url FROM users;')
    .then(({ rows }) => rows);
};
