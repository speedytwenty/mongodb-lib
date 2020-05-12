const { isEqual } = require('lodash');

const Index = {};

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
  'collation',
];

// Compare a defined index with an existing indexes' information.
Index.compareIndexes = (optionSpec, existingSpec) => {
  if (!isEqual(optionSpec.keys, existingSpec.key)) return false;
  const { options = {} } = optionSpec;
  for (let i = 0; i < systemOptionNames.length; i++) {
    const k = systemOptionNames[i];
    if (!isEqual(options[k], existingSpec[k])) return false;
  }
  return true;
};

Index.systemOptionNames = systemOptionNames;

module.exports = Index;
