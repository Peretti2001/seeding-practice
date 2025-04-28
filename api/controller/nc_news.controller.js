//this is where i would get the functions from the model

const { queryTopics } = require("../model/nc_news.model")

exports.getTopics = (req, res, next)=>{
    return queryTopics()
    .then((topics) => {
      if (!topics) {
        return res.status(404).send({ msg: "404: Not Found" });
      }
      res.status(200).send({ topics: topics });
    })
    .catch((err) => {
        console.log("error in getTopics", err)
      next(err);
    })
}