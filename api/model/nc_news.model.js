//this is quere ill add the query

const db = require('../../db/connection');

exports.queryTopics = () => {
  return db.query(`SELECT * FROM topics`).then((res) => {
    return res.rows;
  });
};
