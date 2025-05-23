const db = require("../../db/connection");

exports.getUsers = (req, res, next) => {
  db.query("SELECT * FROM users;")
    .then(({ rows }) => {
      res.status(200).send({ users: rows });
    })
    .catch(next);
};
