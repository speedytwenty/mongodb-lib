const doDropIndexes = (col, indexNames) => {
  return new Promise((resolve, reject) => {
    col.indexExists(indexNames)
      .then((existing) => {
        const promises = [];
        if (existing) {
          existing.forEach((indexName) => {
            promises.push(col.dropIndex(indexName));
          });
        }
        Promise.all(promises).then((res) => resolve(res));
      })
      .catch(reject);
  });
};

module.exports = async (db, colName, colConf = {}) => {
  return new Promise((resolve, reject) => {
    const {
      indexes,
      dropIndexes,
      data,
      options = {},
    } = colConf;

    db.ensureCollection(colName, options)
      .then((col) => {
        const promises = [];
        if (indexes) {
          promises.push(col.ensureIndexes(indexes).catch(reject));
        }
        if (dropIndexes) {
          promises.push(doDropIndexes(col, dropIndexes));
        }
        if (data) {
          console.log(data);
          promises.push(col.initializeData(data));
        }
        Promise.all(promises)
          .then(() => resolve(col))
          .catch(reject);
      })
      .catch(reject);
  });
};
