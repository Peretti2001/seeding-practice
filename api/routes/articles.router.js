const express = require("express");
const { getArticles } = require("../controller/nc_news.controller");

const articlesRouter = express.Router();

articlesRouter.get("/", getArticles);

module.exports = articlesRouter;
