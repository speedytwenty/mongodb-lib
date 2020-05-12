jest.mock('mongodb');
const MongoCollection = require('mongodb').Collection;
const Collection = require('../collection');


describe('listIndexesByName()', () => {
  const { listIndexesByName } = Collection;

  let mockMongoCollection;
  beforeEach(() => {
    mockMongoCollection = new MongoCollection();
  });
  test('should throw error on invalid collection', async () => {
    expect(() => listIndexesByName()).toThrow();
    expect(() => listIndexesByName('str')).toThrow();
  });
  test('should list indexes asynchronously', async () => {
    mockMongoCollection.listIndexes = jest.fn().mockImplementation(() => Promise.resolve([{
      name: '_id_',
    }, {
      name: 'test1',
      xyz: true,
    }]));
    expect(await listIndexesByName(mockMongoCollection)).toEqual({
      _id_: {
        name: '_id_',
      },
      test1: {
        name: 'test1',
        xyz: true,
      },
    });
  });

  test('instance.listIndexesByName() should call static method', async () => {
    const mongoCollection = new MongoCollection();
    const indexes = [{ name: 'x' }];
    mongoCollection.listIndexes = jest.fn().mockImplementation(() => Promise.resolve(indexes));
    const options = { x: 1 };
    const collection = new Collection(mongoCollection);
    const result = await collection.listIndexesByName(options);
    expect(mongoCollection.listIndexes).toHaveBeenCalledWith(options);
    expect(result).toEqual({ x: { name: 'x' } });
  });
});

describe('createIndex()', () => {
  const mongoCollection = new MongoCollection();
  mongoCollection.createIndex = jest.fn().mockImplementation(() => true);
  afterEach(() => mongoCollection.createIndex.mockReset());
  const { createIndex } = Collection;

  test('creates indexes', async () => {
    const name = 'testA';
    const keys = { k: 1 };
    const options = { x: 1 };
    const result = await createIndex(mongoCollection, { keys, name, options });
    expect(result).toBeTruthy();
    expect(mongoCollection.createIndex).toHaveBeenCalledWith(keys, { ...options, name });
  });
});

describe('dropIndex()', () => {
  const { dropIndex } = Collection;

  test('should drop index', async () => {
    const mongoCollection = new MongoCollection();
    mongoCollection.dropIndex = jest.fn().mockImplementation(() => true);
    const name = 'xyz';
    const options = { x: 1 };
    const result = await dropIndex(mongoCollection, name, options);
    expect(result).toBeTruthy();
    expect(mongoCollection.dropIndex).toHaveBeenCalledWith(name, options);
  });
});

describe('ensureIndexes()', () => {
  afterEach(() => {
    Collection.listIndexesByName.mockRestore();
    Collection.ensureIndex.mockRestore();
  });
  test('should ensure indexes', async () => {
    Collection.listIndexesByName = jest.fn().mockImplementation(() => Promise.resolve(['z']));
    Collection.ensureIndex = jest.fn().mockImplementation(() => Promise.resolve(true));
    const indexes = {
      x: { keys: { x: 1 } },
      y: { keys: { y: 1 } },
    };
    const mongoCollection = new MongoCollection();
    const result = await Collection.ensureIndexes(mongoCollection, indexes);
    expect(result).toBeTruthy();
    expect(Collection.listIndexesByName).toHaveBeenCalledWith(mongoCollection);
    expect(Collection.ensureIndex).toHaveBeenNthCalledWith(1, mongoCollection, { name: 'x', ...indexes.x }, ['z']);
    expect(Collection.ensureIndex).toHaveBeenNthCalledWith(2, mongoCollection, { name: 'y', ...indexes.y }, ['z']);
  });
});
