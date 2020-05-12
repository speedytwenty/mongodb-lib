const { compareIndexes } = require('../indexing');

const mockOptionSpec = () => ({
  keys: { x: 1 },
  options: {
    background: 'background',
  },
});

const mockIndexSpec = (optionSpec) => ({
  ...optionSpec.options,
  key: optionSpec.keys,
});

describe('compareindexes()', () => {
  test('correctly compares two matching indexes', () => {
    const optionSpec = mockOptionSpec();
    const indexSpec = mockIndexSpec(optionSpec);
    expect(compareIndexes(optionSpec, indexSpec)).toBeTruthy();
  });
  test('correctly compares two unmatching indexes', () => {
    const optionSpec1 = mockOptionSpec();
    const indexSpec1 = mockIndexSpec(optionSpec1);
    expect(compareIndexes(optionSpec1, indexSpec1)).toBeTruthy();
    optionSpec1.options.background = 'changed';
    expect(compareIndexes(optionSpec1, indexSpec1)).toBeFalsy();
    const optionSpec2 = mockOptionSpec();
    const indexSpec2 = mockIndexSpec(optionSpec2);
    expect(compareIndexes(optionSpec2, indexSpec2)).toBeTruthy();
    indexSpec2.background = 'changed';
    expect(compareIndexes(optionSpec2, indexSpec2)).toBeFalsy();
  });
});
