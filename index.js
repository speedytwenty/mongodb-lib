const nativeConnect = require('mongodb');
const connectAsync = require('./lib/operations/connect');
const connectAndInitialize = require('./lib/operations/connectAndInitialize');

nativeConnect.Db = require('./lib/db');
nativeConnect.Collection = require('./lib/collection');

const connect = (conf, options = {}) => {
  return new Promise((resolve, reject) => {
    const { initialize = false } = options;
    let op = connectAsync;
    if (conf.collections && initialize) {
      op = connectAndInitialize;
    }
    op(conf)
      .then((res) => resolve(res))
      .catch(reject);
  });
};

Object.entries(nativeConnect).forEach(([n, v]) => {
  if (['Db', 'Collection'].indexOf(n) > -1) return;
  connect[n] = v;
  connectAsync[n] = v;
});

connect.connectSync = nativeConnect;
connect.connectAsync = connectAsync;
connect.connectAndInitialize = connectAndInitialize;

module.exports = connect;
