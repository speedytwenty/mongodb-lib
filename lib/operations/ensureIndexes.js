const { keyBy, isEqual } = require('lodash');
const Promise = require('bluebird');

const normalize = (indexes) => {
  if (Array.isArray(indexes)) return indexes;
  return Object.entries(indexes).map(([name, index]) => {
    return { name, ...index };
  });
};


const systemOptionNames = [
  'background',
  'unique',
  'partialFilterExpression',
  'sparse',
  'expireAfterSeconds',
  'storageEngine',
  'weights',
  'default_language',
  'language_override',
  'textIndexVersion',
  '2dsphereIndexVersion',
  'bits',
  'min',
  'max',
  'bucketSize',
];

const filterOptions = (x) => {
  const ret = {};
  systemOptionNames.forEach((on) => {
    if (typeof x[on] !== 'undefined') {
      ret[on] = x[on];
    }
  });
  return ret;
};

const loadExistingIndexes = (collection) => {
  return new Promise((resolve, reject) => {
    return collection.listIndexes().toArray()
      .then((res) => resolve(keyBy(res, 'name')))
      .catch(reject);
  });
};

const createIndex = (collection, index) => {
  return new Promise((resolve, reject) => {
    const { name, keys, options } = index;
    collection.createIndex(keys, { name, ...options })
      .then(resolve)
      .catch(reject);
  });
};

module.exports = (collection, indexes) => {
  return new Promise((resolve, reject) => {
    loadExistingIndexes(collection)
      .then((existingIndexes) => {
        Promise.map(normalize(indexes), (index) => {
          const { name, keys, options = {} } = index;
          if (typeof existingIndexes[name] !== 'undefined') {
            const existing = existingIndexes[name];
            if (isEqual(keys, existing.key) && isEqual(options, filterOptions(existing))) {
              return [name, 'unchanged'];
            }
            return collection.dropIndex(name)
              .then(() => createIndex(collection, index))
              .then(() => [name, 'modified'])
              .catch(reject);
          }
          return createIndex(collection, index)
            .then(() => [name, 'created'])
            .catch(reject);
        })
          .then((results) => {
            const ret = {
              created: [],
              modified: [],
              unchanged: [],
            };
            results.forEach((r) => ret[r[1]].push(r[0]));
            resolve(ret);
          })
          .catch(reject);
      })
      .catch(reject);
  });
};
