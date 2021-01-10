const Promise = require('bluebird');

module.exports = (collection, data, options = {}) => {
  return new Promise((resolve, reject) => {
    const { concurrency = 0 } = options;
    collection.countDocuments()
      .then((num) => {
        Promise.map(data, (doc) => {
          const { _id } = doc;
          if (num && !_id) return null;
          if (_id) {
            return collection.updateOne({ _id }, { $setOnInsert: doc }, { upsert: true });
          }
          return collection.insertOne(doc);
        }, { concurrency })
          .then(resolve)
          .catch(reject);
      });
  });
};
