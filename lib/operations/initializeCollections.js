const Promise = require('bluebird');

const normalizeConf = (mixedConf) => {
  if (Array.isArray(mixedConf)) {
    return mixedConf;
  }
  return Object.entries(mixedConf).map(([name, conf]) => {
    return { name, ...conf };
  });
};

module.exports = (db, collectionsConf, opts = {}) => {
  const { concurrency = 0 } = opts;
  return new Promise((resolve, reject) => {
    Promise.map(normalizeConf(collectionsConf), (conf) => {
      const { name } = conf;
      return db.initializeCollection(name, conf)
        .then((collection) => [name, collection])
        .catch(reject);
    }, { concurrency })
      .then((res) => {
        const ret = {};
        res.forEach(([name, col]) => { ret[name] = col; });
        resolve(ret);
      })
      .catch(reject);
  });
};
