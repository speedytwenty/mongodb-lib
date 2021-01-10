const { ensureIndexes } = require('./collection');

// Ensure a collection exists
const ensureCollection = (db, collectionName, collectionOptions = {}) => new Promise((resolve, reject) => {
  db.listCollections({ name: collectionName }, { nameOnly: true }).toArray()
    .then((collections) => {
      if (!collections.length) {
        db.createCollection(collectionName, collectionOptions)
          .then((collection) => resolve(collection))
          .catch(reject);
      } else {
        resolve(db.collection(collectionName));
      }
    })
    .catch(reject);
});

const initializeCollection = (db, collectionName, collectionOptions, indexes, dropIndexes) => ensureCollection(db, collectionName, collectionOptions)
  .then(async (collection) => {
    await ensureIndexes(collection, indexes, dropIndexes);
    return collection;
  });


// Drop a collection if it exists
const dropCollection = (db, collectionName, options) => new Promise((resolve, reject) => db.listCollections({ name: collectionName })
  .next((err, col) => {
    if (err) reject(err);
    else if (col) {
      db.dropCollection(collectionName, options)
        .then(() => resolve())
        .catch(reject);
    } else resolve();
  }));

module.exports = {
  initializeCollection,
  ensureCollection,
  dropCollection,
};
