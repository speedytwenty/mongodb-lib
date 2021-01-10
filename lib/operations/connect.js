const { MongoClient } = require('mongodb');

module.exports = (conf) => {
  return new Promise((resolve, reject) => {
    const {
      url,
      name,
      options,
      collections,
    } = conf;
    MongoClient.connect(url, options, (err, client) => {
      if (err) reject(err);
      else {
        const db = client.db(name);
        const cols = {};
        if (collections) {
          Object.keys(collections).forEach((k) => { cols[k] = db.collection(k); });
        }
        resolve({ client, db, collections: cols });
      }
    });
  });
};
