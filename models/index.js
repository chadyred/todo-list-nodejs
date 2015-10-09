var settings = require('../config/settings');
var orm = require('orm');

var connection = null;

function setup(db, cb) {
  require('./priorite')(orm, db);
  require('./task')(orm, db);

  return cb(null, db);
}

module.exports = function (cb) {
  if (connection) return cb(null, connection);

  orm.connect(settings.database, function (err, db) {
    if (err) return cb(err);

    connection = db;
    db.settings.set('instance.returnAllErrors', true);

    //NE SURTOUT PAS METTRE DE CACHE SINON LES INSTANCE INVERSE RESTE MÊME SI ON MODIFIE LA PROPRIETAIRE
    db.settings.set('instance.cache', false);
    setup(db, cb);
  });
};