//this is quere ill add the query

const db = require('../../db/connection');

exports.queryTopics = () => {
  return db.query(`SELECT * FROM topics`).then((res) => {
    return res.rows;
  });
};

exports.selectArticleById = (article_id)=>{
    return db.query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
   .then((result)=>{
    return result.rows[0]
   })
}

exports.queryArticles = () => {
    return db.query(`
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
      LEFT JOIN comments
        ON comments.article_id = articles.article_id
      GROUP BY articles.article_id
      ORDER BY articles.created_at DESC;
    `)
    .then((result) => {
      return result.rows;
    });
  };

  exports.insertComment = (article_id, username, body) => {
    if (!username || !body) {
      return Promise.reject({ status: 400, msg: 'Missing required fields' });
    }
    if (isNaN(article_id)) {
      return Promise.reject({ status: 400, msg: 'bad request' });
    }
  
    const checkArticle = db.query(`SELECT * FROM articles WHERE article_id = $1`, [article_id]);
    const checkUser = db.query(`SELECT * FROM users WHERE username = $1`, [username]);
  
    return Promise.all([checkArticle, checkUser])
      .then(([articleResult, userResult]) => {
        if (articleResult.rows.length === 0) {
          throw { status: 404, msg: 'Article not found' };
        }
        if (userResult.rows.length === 0) {
          throw { status: 404, msg: 'User not found' };
        }
  
        return db.query(
          `INSERT INTO comments (author, article_id, body)
           VALUES ($1, $2, $3)
           RETURNING *;`,
          [username, article_id, body]
        );
      })
      .then(({ rows }) => {
        return rows[0];
      });
  };
  