const { keyBy } = require('lodash');
const MongoCollection = require('mongodb').Collection;

const { compareIndex } = require('./indexing');

/**
 * Validate collection paremeter input.
 *
 * @function
 * @param {MongoCollection} collection The object/variable to validate.
 * @param {Boolean} required Wether the collection variable is required. If
 *  true an error will be thrown if collection is undefined. Defaults to true.
 * @returns {MongoCollection} An instance of a valid MongoCollection.
 */
const validateCollection = (collection, required = true) => {
  if (required && collection === undefined) {
    throw new TypeError('Missing collection parameter');
  }
  //  if (!(collection instanceof MongoCollection)) {
  //    console.log(collection);
  //    throw new TypeError(`Invalid collection parameter. Received ${typeof collection}.`);
  //  }
  return collection;
};

function Collection(mongoCollection) {
  this.mongoCollection = validateCollection(mongoCollection);
}

/**
 * List raw indexes as an object keyed by index names.
 *
 * @function
 * @param {MongoCollection} collection An instance of a mongodb collection.
 * @returns {Object} Object keyed by index names.
 */
Collection.listIndexesByName = (collection, options) => {
  validateCollection(collection);
  return Promise.resolve(collection.listIndexes(options))
    .then((results) => keyBy(results, 'name'));
};
/* eslint-disable-next-line func-names */
Collection.prototype.listIndexesByName = function (options = {}) {
  return Collection.listIndexesByName(
    this.mongoCollection,
    options,
  );
};

/**
 * Create an index on a collection.
 *
 * @function
 * @param {MongoCollection} collection An instance of a mongodb collection.
 * @param {Object} spec
 * @returns
 */
Collection.createIndex = (collection, { name, options, keys }) => {
  validateCollection(collection);
  return collection.createIndex(keys, { ...options, name });
};
/* eslint-disable-next-line func-names */
Collection.prototype.createIndex = function (params) {
  return Collection.createIndex(this.mongoCollection, params);
};

/**
 * Safely drop an index on a collection.
 *
 * @function
 * @param {MongoCollection} collection An instance of a mongodb collection.
 * @param {String} name The name of the index to drop.
 * @param {Object} options
 */
Collection.dropIndex = (collection, name, options) => {
  validateCollection(collection);
  return collection.dropIndex(name, options);
};
/* eslint-disable-next-line func-names */
Collection.prototype.dropIndex = function (name, options) {
  return Collection.dropIndex(this.mongoCollection, name, options);
};

Collection.ensureIndex = async (collection, index, preloadedExistingIndexes) => {
  const { name } = index;
  validateCollection(collection);
  const existingIndexes = preloadedExistingIndexes || await Collection.listIndexesByName(collection);
  if (existingIndexes[name] !== undefined) {
    if (!compareIndex(index, existingIndexes[name])) {
      await Collection.dropIndex(collection, name);
    } else return true;
  }
  return Collection.createIndex(collection, index);
};

Collection.ensureIndexes = async (collection, indexes) => {
  if (typeof indexes !== 'undefined' && indexes) {
    const entries = Object.entries(indexes);
    if (entries.length) {
      const promises = [];
      return Collection.listIndexesByName(collection)
        .then((existingIndexes) => {
          entries.forEach(([name, { keys, options }]) => {
            promises.push(
              Collection.ensureIndex(collection, { name, keys, options }, existingIndexes),
            );
          });
          return Promise.all(promises).then(() => true);
        });
    }
  }
  return false;
};
/* eslint-disable-next-line func-names */
Collection.prototype.ensureIndexes = function (indexes) {
  return Collection.ensureIndexes(this.mongoCollection, indexes);
};

module.exports = Collection;
