// listen.js
const app = require("./api/api");
const PORT = process.env.PORT || 9090;
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
