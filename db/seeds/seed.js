const db = require("../connection");
const format = require("pg-format");
const {
  convertTimestampToDate,
  createArticleRef,
} = require("./utils");

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db
    
    .query(`DROP TABLE IF EXISTS comments;`)
    .then(() => db.query(`DROP TABLE IF EXISTS articles;`))
    .then(() => db.query(`DROP TABLE IF EXISTS users;`))
    .then(() => db.query(`DROP TABLE IF EXISTS topics;`))

    .then(() => {
      return db.query(`
        CREATE TABLE topics (
          slug VARCHAR PRIMARY KEY,
          description VARCHAR(1000) NOT NULL,
          img_url VARCHAR(1000)
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE users (
          username VARCHAR PRIMARY KEY,
          name VARCHAR NOT NULL,
          avatar_url VARCHAR(1000)
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE articles (
          article_id SERIAL PRIMARY KEY,
          title VARCHAR NOT NULL,
          topic VARCHAR REFERENCES topics(slug) NOT NULL,
          author VARCHAR REFERENCES users(username) NOT NULL,
          body TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          votes INT DEFAULT 0,
          article_img_url VARCHAR(1000)
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE comments (
          comment_id SERIAL PRIMARY KEY,
          article_id INT REFERENCES articles(article_id) ON DELETE CASCADE NOT NULL,
          body TEXT NOT NULL,
          votes INT DEFAULT 0,
          author VARCHAR REFERENCES users(username) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    })

    .then(() => {
      const formattedTopics = topicData.map(({ slug, description, img_url }) => {
        return [slug, description, img_url];
      });
      const insertTopicsQuery = format(
        `INSERT INTO topics (slug, description, img_url) VALUES %L RETURNING *;`,
        formattedTopics
      );
      return db.query(insertTopicsQuery);
    })

  
    .then(() => {
      const formattedUsers = userData.map(({ username, name, avatar_url }) => {
        return [username, name, avatar_url];
      });
      const insertUsersQuery = format(
        `INSERT INTO users (username, name, avatar_url) VALUES %L RETURNING *;`,
        formattedUsers
      );
      return db.query(insertUsersQuery);
    })

  
    .then(() => {
      const formattedArticles = articleData.map((article) => {
        const {
          title,
          topic,
          author,
          body,
          votes = 0,
          article_img_url
        } = article;
        const { created_at } = convertTimestampToDate(article);
        return [
          title,
          topic,
          author,
          body,
          created_at,
          votes,
          article_img_url
        ];
      });
      const insertArticlesQuery = format(
        `INSERT INTO articles
          (title, topic, author, body, created_at, votes, article_img_url)
         VALUES %L RETURNING *;`,
        formattedArticles
      );
      return db.query(insertArticlesQuery);
    })

  
    .then(({ rows: insertedArticles }) => {
      const articleRef = createArticleRef(insertedArticles);
      const formattedComments = commentData.map(
        ({ article_title, body, votes = 0, author, created_at }) => {
          const article_id = articleRef[article_title];
          if (!article_id) {
            throw new Error(`Could not find article_id for article title: ${article_title}`);
          }
          return [body, votes, author, article_id, new Date(created_at)];
        }
      );
      const insertCommentsQuery = format(
        `INSERT INTO comments
          (body, votes, author, article_id, created_at)
         VALUES %L RETURNING *;`,
        formattedComments
      );
      return db.query(insertCommentsQuery);
    });
};

module.exports = seed;