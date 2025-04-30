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

  exports.selectCommentsByArticleId = (article_id) => {
   
    if (isNaN(article_id)) {
      return Promise.reject({ status: 400, msg: "bad request" });
    }
  
    return db
      .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
      .then(({ rows }) => {
        if (rows.length === 0) {
          return Promise.reject({ status: 404, msg: "Article not found" });
        }
        return db.query(
          `
          SELECT
            comment_id,
            votes,
            created_at,
            author,
            body,
            article_id
          FROM comments
          WHERE article_id = $1
          ORDER BY created_at DESC;
          `,
          [article_id]
        );
      })
      .then(({ rows }) => {
        return rows; 
      });
  };
  
