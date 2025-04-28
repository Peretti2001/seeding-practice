const devData = require('../data/development-data/index.js');
const seed = require('./seed.js');
const db = require('../connection.js');
const data = require('../data/development-data');


seed(devData)
  .then(() => {
    console.log('Seeding complete');
    return db.end(); 
  })
  .catch((err) => {
    console.error('Seeding failed', err);
  });
