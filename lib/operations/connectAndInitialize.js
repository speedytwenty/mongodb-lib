const Promise = require('bluebird');
const connect = require('./connect');

const doDropCollections = (db, colNames) => {
  return new Promise((resolve, reject) => {
    db.listCollections({ name: { $in: colNames } }, { nameOnly: true }).toArray()
      .then((existing) => {
        Promise.map(existing, (colName) => {
          return db.dropCollection(colName).catch(reject);
        })
          .then((res) => resolve(res))
          .catch(reject);
      })
      .catch(reject);
  });
};

module.exports = (conf) => {
  return new Promise((resolve, reject) => {
    const {
      url,
      name,
      options = {},
      collections,
      dropCollections = [],
    } = conf;
    return connect({ url, name, options })
      .catch(reject)
      .then(({ client, db }) => {
        const rejectAndClose = (e) => {
          client.close();
          reject(e);
        };
        return db.initializeCollections(collections)
          .then((cols) => {
            if (dropCollections) {
              return doDropCollections(db, dropCollections)
                .then(() => resolve({ client, db, collections: cols }))
                .catch(rejectAndClose);
            }
            return resolve({ client, db, collections: cols });
          })
          .catch(rejectAndClose);
      })
      .catch(reject);
  });
};
