
module.exports = (db, colName, options = {}) => {
  return new Promise((resolve, reject) => {
    db.createCollection(colName, options)
      .then(() => {
        resolve(db.collection(colName));
      })
      .catch(reject);
  });
};
