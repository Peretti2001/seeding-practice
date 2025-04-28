const app = require('./api/api');

const PORT = 9090;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
