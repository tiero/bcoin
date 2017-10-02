/*!
 * lowlevelup.js - LevelUP module for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assert = require('assert');
var Lock = require('../utils/lock');
var co = require('../utils/co');

var LOW = Buffer.from([0x00]);
var HIGH = Buffer.from([0xff]);

var VERSION_ERROR = void 0;

/**
 * Extremely low-level version of levelup.
 *
 * This avoids pulling in extra deps and
 * lowers memory usage.
 *
 * @alias module:db.LowlevelUp
 * @constructor
 * @param {Function} backend - Database backend.
 * @param {String} location - File location.
 * @param {Object?} options - Leveldown options.
 */

function LowlevelUp(backend, location, options) {
  if (!(this instanceof LowlevelUp)) return new LowlevelUp(backend, location, options);

  assert(typeof backend === 'function', 'Backend is required.');
  assert(typeof location === 'string', 'Filename is required.');

  this.options = new LLUOptions(options);
  this.backend = backend;
  this.location = location;
  this.locker = new Lock();

  this.loading = false;
  this.closing = false;
  this.loaded = false;

  this.db = null;
  this.binding = null;

  this.init();
}

/**
 * Initialize the database.
 * @method
 * @private
 */

LowlevelUp.prototype.init = function init() {
  var Backend = this.backend;
  var db = new Backend(this.location);
  var binding = db;

  // Stay as close to the metal as possible.
  // We want to make calls to C++ directly.
  while (db.db) {
    // Not a database.
    if (typeof db.db.put !== 'function') break;

    // Recursive.
    if (db.db === db) break;

    // Go deeper.
    db = db.db;
    binding = db;
  }

  // A lower-level binding.
  if (db.binding) binding = db.binding;

  this.db = db;
  this.binding = binding;
};

/**
 * Open the database.
 * @method
 * @returns {Promise}
 */

LowlevelUp.prototype.open = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var unlock;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return this.locker.lock();

          case 2:
            unlock = _context.sent;
            _context.prev = 3;
            _context.next = 6;
            return this._open();

          case 6:
            return _context.abrupt('return', _context.sent);

          case 7:
            _context.prev = 7;

            unlock();
            return _context.finish(7);

          case 10:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[3,, 7, 10]]);
  }));

  function open() {
    return _ref.apply(this, arguments);
  }

  return open;
}();

/**
 * Open the database (without a lock).
 * @method
 * @private
 * @returns {Promise}
 */

LowlevelUp.prototype._open = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!this.loaded) {
              _context2.next = 2;
              break;
            }

            throw new Error('Database is already open.');

          case 2:

            assert(!this.loading);
            assert(!this.closing);

            this.loading = true;

            _context2.prev = 5;
            _context2.next = 8;
            return this.load();

          case 8:
            _context2.next = 14;
            break;

          case 10:
            _context2.prev = 10;
            _context2.t0 = _context2['catch'](5);

            this.loading = false;
            throw _context2.t0;

          case 14:

            this.loading = false;
            this.loaded = true;

          case 16:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[5, 10]]);
  }));

  function _open() {
    return _ref2.apply(this, arguments);
  }

  return _open;
}();

/**
 * Close the database.
 * @method
 * @returns {Promise}
 */

LowlevelUp.prototype.close = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
    var unlock;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return this.locker.lock();

          case 2:
            unlock = _context3.sent;
            _context3.prev = 3;
            _context3.next = 6;
            return this._close();

          case 6:
            return _context3.abrupt('return', _context3.sent);

          case 7:
            _context3.prev = 7;

            unlock();
            return _context3.finish(7);

          case 10:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this, [[3,, 7, 10]]);
  }));

  function close() {
    return _ref3.apply(this, arguments);
  }

  return close;
}();

/**
 * Close the database (without a lock).
 * @method
 * @private
 * @returns {Promise}
 */

LowlevelUp.prototype._close = function () {
  var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (this.loaded) {
              _context4.next = 2;
              break;
            }

            throw new Error('Database is already closed.');

          case 2:

            assert(!this.loading);
            assert(!this.closing);

            this.loaded = false;
            this.closing = true;

            _context4.prev = 6;
            _context4.next = 9;
            return this.unload();

          case 9:
            _context4.next = 16;
            break;

          case 11:
            _context4.prev = 11;
            _context4.t0 = _context4['catch'](6);

            this.loaded = true;
            this.closing = false;
            throw _context4.t0;

          case 16:

            this.closing = false;

          case 17:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this, [[6, 11]]);
  }));

  function _close() {
    return _ref4.apply(this, arguments);
  }

  return _close;
}();

/**
 * Open the database.
 * @private
 * @returns {Promise}
 */

LowlevelUp.prototype.load = function load() {
  var _this = this;

  return new _promise2.default(function (resolve, reject) {
    _this.binding.open(_this.options, co.wrap(resolve, reject));
  });
};

/**
 * Close the database.
 * @private
 * @returns {Promise}
 */

LowlevelUp.prototype.unload = function unload() {
  var _this2 = this;

  return new _promise2.default(function (resolve, reject) {
    _this2.binding.close(co.wrap(resolve, reject));
  });
};

/**
 * Destroy the database.
 * @returns {Promise}
 */

LowlevelUp.prototype.destroy = function destroy() {
  var _this3 = this;

  return new _promise2.default(function (resolve, reject) {
    if (_this3.loaded || _this3.closing) {
      reject(new Error('Cannot destroy open database.'));
      return;
    }

    if (!_this3.backend.destroy) {
      reject(new Error('Cannot destroy (method not available).'));
      return;
    }

    _this3.backend.destroy(_this3.location, co.wrap(resolve, reject));
  });
};

/**
 * Repair the database.
 * @returns {Promise}
 */

LowlevelUp.prototype.repair = function repair() {
  var _this4 = this;

  return new _promise2.default(function (resolve, reject) {
    if (_this4.loaded || _this4.closing) {
      reject(new Error('Cannot repair open database.'));
      return;
    }

    if (!_this4.backend.repair) {
      reject(new Error('Cannot repair (method not available).'));
      return;
    }

    _this4.backend.repair(_this4.location, co.wrap(resolve, reject));
  });
};

/**
 * Backup the database.
 * @param {String} path
 * @returns {Promise}
 */

LowlevelUp.prototype.backup = function backup(path) {
  var _this5 = this;

  if (!this.binding.backup) return this.clone(path);

  return new _promise2.default(function (resolve, reject) {
    if (!_this5.loaded) {
      reject(new Error('Database is closed.'));
      return;
    }
    _this5.binding.backup(path, co.wrap(resolve, reject));
  });
};

/**
 * Retrieve a record from the database.
 * @param {String|Buffer} key
 * @returns {Promise} - Returns Buffer.
 */

LowlevelUp.prototype.get = function get(key) {
  var _this6 = this;

  return new _promise2.default(function (resolve, reject) {
    if (!_this6.loaded) {
      reject(new Error('Database is closed.'));
      return;
    }
    _this6.binding.get(key, function (err, result) {
      if (err) {
        if (isNotFound(err)) {
          resolve(null);
          return;
        }
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

/**
 * Store a record in the database.
 * @param {String|Buffer} key
 * @param {Buffer} value
 * @returns {Promise}
 */

LowlevelUp.prototype.put = function put(key, value) {
  var _this7 = this;

  if (!value) value = LOW;

  return new _promise2.default(function (resolve, reject) {
    if (!_this7.loaded) {
      reject(new Error('Database is closed.'));
      return;
    }
    _this7.binding.put(key, value, co.wrap(resolve, reject));
  });
};

/**
 * Remove a record from the database.
 * @param {String|Buffer} key
 * @returns {Promise}
 */

LowlevelUp.prototype.del = function del(key) {
  var _this8 = this;

  return new _promise2.default(function (resolve, reject) {
    if (!_this8.loaded) {
      reject(new Error('Database is closed.'));
      return;
    }
    _this8.binding.del(key, co.wrap(resolve, reject));
  });
};

/**
 * Create an atomic batch.
 * @param {Array?} ops
 * @returns {Batch}
 */

LowlevelUp.prototype.batch = function batch(ops) {
  var _this9 = this;

  if (!ops) {
    if (!this.loaded) throw new Error('Database is closed.');
    return new Batch(this);
  }

  return new _promise2.default(function (resolve, reject) {
    if (!_this9.loaded) {
      reject(new Error('Database is closed.'));
      return;
    }
    _this9.binding.batch(ops, co.wrap(resolve, reject));
  });
};

/**
 * Create an iterator.
 * @param {Object} options
 * @returns {Iterator}
 */

LowlevelUp.prototype.iterator = function iterator(options) {
  if (!this.loaded) throw new Error('Database is closed.');

  return new Iterator(this, options);
};

/**
 * Get a database property.
 * @param {String} name - Property name.
 * @returns {String}
 */

LowlevelUp.prototype.getProperty = function getProperty(name) {
  if (!this.loaded) throw new Error('Database is closed.');

  if (!this.binding.getProperty) return '';

  return this.binding.getProperty(name);
};

/**
 * Calculate approximate database size.
 * @param {String|Buffer} start - Start key.
 * @param {String|Buffer} end - End key.
 * @returns {Promise} - Returns Number.
 */

LowlevelUp.prototype.approximateSize = function approximateSize(start, end) {
  var _this10 = this;

  return new _promise2.default(function (resolve, reject) {
    if (!_this10.loaded) {
      reject(new Error('Database is closed.'));
      return;
    }

    if (!_this10.binding.approximateSize) {
      reject(new Error('Cannot get size.'));
      return;
    }

    _this10.binding.approximateSize(start, end, co.wrap(resolve, reject));
  });
};

/**
 * Compact range of keys.
 * @param {String|Buffer|null} start - Start key.
 * @param {String|Buffer|null} end - End key.
 * @returns {Promise}
 */

LowlevelUp.prototype.compactRange = function compactRange(start, end) {
  var _this11 = this;

  if (!start) start = LOW;

  if (!end) end = HIGH;

  return new _promise2.default(function (resolve, reject) {
    if (!_this11.loaded) {
      reject(new Error('Database is closed.'));
      return;
    }

    if (!_this11.binding.compactRange) {
      resolve();
      return;
    }

    _this11.binding.compactRange(start, end, co.wrap(resolve, reject));
  });
};

/**
 * Test whether a key exists.
 * @method
 * @param {String} key
 * @returns {Promise} - Returns Boolean.
 */

LowlevelUp.prototype.has = function () {
  var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(key) {
    var value;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return this.get(key);

          case 2:
            value = _context5.sent;
            return _context5.abrupt('return', value != null);

          case 4:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  function has(_x) {
    return _ref5.apply(this, arguments);
  }

  return has;
}();

/**
 * Collect all keys from iterator options.
 * @method
 * @param {Object} options - Iterator options.
 * @returns {Promise} - Returns Array.
 */

LowlevelUp.prototype.range = function () {
  var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(options) {
    var items, parse, iter, item;
    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            items = [];
            parse = options.parse;
            iter = this.iterator({
              gte: options.gte,
              lte: options.lte,
              keys: true,
              values: true
            });

          case 3:
            _context6.next = 5;
            return iter.next();

          case 5:
            item = _context6.sent;

            if (item) {
              _context6.next = 8;
              break;
            }

            return _context6.abrupt('break', 21);

          case 8:
            if (!parse) {
              _context6.next = 18;
              break;
            }

            _context6.prev = 9;

            item = parse(item.key, item.value);
            _context6.next = 18;
            break;

          case 13:
            _context6.prev = 13;
            _context6.t0 = _context6['catch'](9);
            _context6.next = 17;
            return iter.end();

          case 17:
            throw _context6.t0;

          case 18:

            if (item) items.push(item);

          case 19:
            _context6.next = 3;
            break;

          case 21:
            return _context6.abrupt('return', items);

          case 22:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this, [[9, 13]]);
  }));

  function range(_x2) {
    return _ref6.apply(this, arguments);
  }

  return range;
}();

/**
 * Collect all keys from iterator options.
 * @method
 * @param {Object} options - Iterator options.
 * @returns {Promise} - Returns Array.
 */

LowlevelUp.prototype.keys = function () {
  var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(options) {
    var items, parse, iter, item, key;
    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            items = [];
            parse = options.parse;
            iter = this.iterator({
              gte: options.gte,
              lte: options.lte,
              keys: true,
              values: false
            });

          case 3:
            _context7.next = 5;
            return iter.next();

          case 5:
            item = _context7.sent;

            if (item) {
              _context7.next = 8;
              break;
            }

            return _context7.abrupt('break', 22);

          case 8:
            key = item.key;

            if (!parse) {
              _context7.next = 19;
              break;
            }

            _context7.prev = 10;

            key = parse(key);
            _context7.next = 19;
            break;

          case 14:
            _context7.prev = 14;
            _context7.t0 = _context7['catch'](10);
            _context7.next = 18;
            return iter.end();

          case 18:
            throw _context7.t0;

          case 19:

            if (key) items.push(key);

          case 20:
            _context7.next = 3;
            break;

          case 22:
            return _context7.abrupt('return', items);

          case 23:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, this, [[10, 14]]);
  }));

  function keys(_x3) {
    return _ref7.apply(this, arguments);
  }

  return keys;
}();

/**
 * Collect all keys from iterator options.
 * @method
 * @param {Object} options - Iterator options.
 * @returns {Promise} - Returns Array.
 */

LowlevelUp.prototype.values = function () {
  var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(options) {
    var items, parse, iter, item, value;
    return _regenerator2.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            items = [];
            parse = options.parse;
            iter = this.iterator({
              gte: options.gte,
              lte: options.lte,
              keys: false,
              values: true
            });

          case 3:
            _context8.next = 5;
            return iter.next();

          case 5:
            item = _context8.sent;

            if (item) {
              _context8.next = 8;
              break;
            }

            return _context8.abrupt('break', 22);

          case 8:
            value = item.value;

            if (!parse) {
              _context8.next = 19;
              break;
            }

            _context8.prev = 10;

            value = parse(value);
            _context8.next = 19;
            break;

          case 14:
            _context8.prev = 14;
            _context8.t0 = _context8['catch'](10);
            _context8.next = 18;
            return iter.end();

          case 18:
            throw _context8.t0;

          case 19:

            if (value) items.push(value);

          case 20:
            _context8.next = 3;
            break;

          case 22:
            return _context8.abrupt('return', items);

          case 23:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, this, [[10, 14]]);
  }));

  function values(_x4) {
    return _ref8.apply(this, arguments);
  }

  return values;
}();

/**
 * Dump database (for debugging).
 * @method
 * @returns {Promise} - Returns Object.
 */

LowlevelUp.prototype.dump = function () {
  var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
    var records, items, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, item, key, value;

    return _regenerator2.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            records = (0, _create2.default)(null);
            _context9.next = 3;
            return this.range({
              gte: LOW,
              lte: HIGH
            });

          case 3:
            items = _context9.sent;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context9.prev = 7;


            for (_iterator = (0, _getIterator3.default)(items); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              item = _step.value;
              key = item.key.toString('hex');
              value = item.value.toString('hex');

              records[key] = value;
            }

            _context9.next = 15;
            break;

          case 11:
            _context9.prev = 11;
            _context9.t0 = _context9['catch'](7);
            _didIteratorError = true;
            _iteratorError = _context9.t0;

          case 15:
            _context9.prev = 15;
            _context9.prev = 16;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 18:
            _context9.prev = 18;

            if (!_didIteratorError) {
              _context9.next = 21;
              break;
            }

            throw _iteratorError;

          case 21:
            return _context9.finish(18);

          case 22:
            return _context9.finish(15);

          case 23:
            return _context9.abrupt('return', records);

          case 24:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, this, [[7, 11, 15, 23], [16,, 18, 22]]);
  }));

  function dump() {
    return _ref9.apply(this, arguments);
  }

  return dump;
}();

/**
 * Write and assert a version number for the database.
 * @method
 * @param {Number} version
 * @returns {Promise}
 */

LowlevelUp.prototype.checkVersion = function () {
  var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(key, version) {
    var data;
    return _regenerator2.default.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return this.get(key);

          case 2:
            data = _context10.sent;

            if (data) {
              _context10.next = 9;
              break;
            }

            data = Buffer.allocUnsafe(4);
            data.writeUInt32LE(version, 0, true);
            _context10.next = 8;
            return this.put(key, data);

          case 8:
            return _context10.abrupt('return');

          case 9:

            data = data.readUInt32LE(0, true);

            if (!(data !== version)) {
              _context10.next = 12;
              break;
            }

            throw new Error(VERSION_ERROR);

          case 12:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, this);
  }));

  function checkVersion(_x5, _x6) {
    return _ref10.apply(this, arguments);
  }

  return checkVersion;
}();

/**
 * Clone the database.
 * @method
 * @param {String} path
 * @returns {Promise}
 */

LowlevelUp.prototype.clone = function () {
  var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(path) {
    var options, hwm, tmp, batch, total, iter, item;
    return _regenerator2.default.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            if (this.loaded) {
              _context11.next = 2;
              break;
            }

            throw new Error('Database is closed.');

          case 2:
            options = new LLUOptions(this.options);
            hwm = 256 << 20;


            options.createIfMissing = true;
            options.errorIfExists = true;

            tmp = new LowlevelUp(this.backend, path, options);
            _context11.next = 9;
            return tmp.open();

          case 9:
            batch = tmp.batch();
            total = 0;
            iter = this.iterator({
              keys: true,
              values: true
            });

          case 12:
            _context11.next = 14;
            return iter.next();

          case 14:
            item = _context11.sent;

            if (item) {
              _context11.next = 17;
              break;
            }

            return _context11.abrupt('break', 36);

          case 17:

            batch.put(item.key, item.value);
            total += item.value.length;

            if (!(total >= hwm)) {
              _context11.next = 34;
              break;
            }

            total = 0;
            _context11.prev = 21;
            _context11.next = 24;
            return batch.write();

          case 24:
            _context11.next = 33;
            break;

          case 26:
            _context11.prev = 26;
            _context11.t0 = _context11['catch'](21);
            _context11.next = 30;
            return iter.end();

          case 30:
            _context11.next = 32;
            return tmp.close();

          case 32:
            throw _context11.t0;

          case 33:
            batch = tmp.batch();

          case 34:
            _context11.next = 12;
            break;

          case 36:
            _context11.prev = 36;
            _context11.next = 39;
            return batch.write();

          case 39:
            _context11.prev = 39;
            _context11.next = 42;
            return tmp.close();

          case 42:
            return _context11.finish(39);

          case 43:
          case 'end':
            return _context11.stop();
        }
      }
    }, _callee11, this, [[21, 26], [36,, 39, 43]]);
  }));

  function clone(_x7) {
    return _ref11.apply(this, arguments);
  }

  return clone;
}();

/**
 * Batch
 * @constructor
 * @ignore
 * @param {LowlevelUp} db
 */

function Batch(db) {
  this.batch = db.binding.batch();
}

/**
 * Write a value to the batch.
 * @param {String|Buffer} key
 * @param {Buffer} value
 */

Batch.prototype.put = function put(key, value) {
  if (!value) value = LOW;

  this.batch.put(key, value);

  return this;
};

/**
 * Delete a value from the batch.
 * @param {String|Buffer} key
 */

Batch.prototype.del = function del(key) {
  this.batch.del(key);
  return this;
};

/**
 * Write batch to database.
 * @returns {Promise}
 */

Batch.prototype.write = function write() {
  var _this12 = this;

  return new _promise2.default(function (resolve, reject) {
    _this12.batch.write(co.wrap(resolve, reject));
  });
};

/**
 * Clear the batch.
 */

Batch.prototype.clear = function clear() {
  this.batch.clear();
  return this;
};

/**
 * Iterator
 * @constructor
 * @ignore
 * @param {LowlevelUp} db
 * @param {Object} options
 */

function Iterator(db, options) {
  options = new IteratorOptions(options);
  options.keyAsBuffer = db.options.bufferKeys;

  this.iter = db.db.iterator(options);
}

/**
 * Seek to the next key.
 * @returns {Promise}
 */

Iterator.prototype.next = function next() {
  var _this13 = this;

  return new _promise2.default(function (resolve, reject) {
    _this13.iter.next(function (err, key, value) {
      if (err) {
        _this13.iter.end(function () {
          return reject(err);
        });
        return;
      }

      if (key === undefined && value === undefined) {
        _this13.iter.end(co.wrap(resolve, reject));
        return;
      }

      resolve(new IteratorItem(key, value));
    });
  });
};

/**
 * Seek to an arbitrary key.
 * @param {String|Buffer} key
 */

Iterator.prototype.seek = function seek(key) {
  this.iter.seek(key);
};

/**
 * End the iterator.
 * @returns {Promise}
 */

Iterator.prototype.end = function end() {
  var _this14 = this;

  return new _promise2.default(function (resolve, reject) {
    _this14.iter.end(co.wrap(resolve, reject));
  });
};

/**
 * Iterator Item
 * @ignore
 * @constructor
 * @param {String|Buffer} key
 * @param {String|Buffer} value
 * @property {String|Buffer} key
 * @property {String|Buffer} value
 */

function IteratorItem(key, value) {
  this.key = key;
  this.value = value;
}

/**
 * LowlevelUp Options
 * @constructor
 * @ignore
 * @param {Object} options
 */

function LLUOptions(options) {
  this.createIfMissing = true;
  this.errorIfExists = false;
  this.compression = true;
  this.cacheSize = 8 << 20;
  this.writeBufferSize = 4 << 20;
  this.maxOpenFiles = 64;
  this.maxFileSize = 2 << 20;
  this.paranoidChecks = false;
  this.memory = false;
  this.sync = false;
  this.mapSize = 256 * (1024 << 20);
  this.writeMap = false;
  this.noSubdir = true;
  this.bufferKeys = true;

  if (options) this.fromOptions(options);
}

/**
 * Inject properties from options.
 * @private
 * @param {Object} options
 * @returns {LLUOptions}
 */

LLUOptions.prototype.fromOptions = function fromOptions(options) {
  assert(options, 'Options are required.');

  if (options.createIfMissing != null) {
    assert(typeof options.createIfMissing === 'boolean', '`createIfMissing` must be a boolean.');
    this.createIfMissing = options.createIfMissing;
  }

  if (options.errorIfExists != null) {
    assert(typeof options.errorIfExists === 'boolean', '`errorIfExists` must be a boolean.');
    this.errorIfExists = options.errorIfExists;
  }

  if (options.compression != null) {
    assert(typeof options.compression === 'boolean', '`compression` must be a boolean.');
    this.compression = options.compression;
  }

  if (options.cacheSize != null) {
    assert(typeof options.cacheSize === 'number', '`cacheSize` must be a number.');
    assert(options.cacheSize >= 0);
    this.cacheSize = Math.floor(options.cacheSize / 2);
    this.writeBufferSize = Math.floor(options.cacheSize / 4);
  }

  if (options.maxFiles != null) {
    assert(typeof options.maxFiles === 'number', '`maxFiles` must be a number.');
    assert(options.maxFiles >= 0);
    this.maxOpenFiles = options.maxFiles;
  }

  if (options.maxFileSize != null) {
    assert(typeof options.maxFileSize === 'number', '`maxFileSize` must be a number.');
    assert(options.maxFileSize >= 0);
    this.maxFileSize = options.maxFileSize;
  }

  if (options.paranoidChecks != null) {
    assert(typeof options.paranoidChecks === 'boolean', '`paranoidChecks` must be a boolean.');
    this.paranoidChecks = options.paranoidChecks;
  }

  if (options.memory != null) {
    assert(typeof options.memory === 'boolean', '`memory` must be a boolean.');
    this.memory = options.memory;
  }

  if (options.sync != null) {
    assert(typeof options.sync === 'boolean', '`sync` must be a boolean.');
    this.sync = options.sync;
  }

  if (options.mapSize != null) {
    assert(typeof options.mapSize === 'number', '`mapSize` must be a number.');
    assert(options.mapSize >= 0);
    this.mapSize = options.mapSize;
  }

  if (options.writeMap != null) {
    assert(typeof options.writeMap === 'boolean', '`writeMap` must be a boolean.');
    this.writeMap = options.writeMap;
  }

  if (options.noSubdir != null) {
    assert(typeof options.noSubdir === 'boolean', '`noSubdir` must be a boolean.');
    this.noSubdir = options.noSubdir;
  }

  if (options.bufferKeys != null) {
    assert(typeof options.bufferKeys === 'boolean', '`bufferKeys` must be a boolean.');
    this.bufferKeys = options.bufferKeys;
  }

  return this;
};

/**
 * Iterator Options
 * @constructor
 * @ignore
 * @param {Object} options
 */

function IteratorOptions(options) {
  this.gte = null;
  this.lte = null;
  this.keys = true;
  this.values = false;
  this.fillCache = false;
  this.keyAsBuffer = true;
  this.valueAsBuffer = true;
  this.reverse = false;
  this.highWaterMark = 16 * 1024;

  // Note: do not add this property.
  // this.limit = null;

  if (options) this.fromOptions(options);
}

/**
 * Inject properties from options.
 * @private
 * @param {Object} options
 * @returns {IteratorOptions}
 */

IteratorOptions.prototype.fromOptions = function fromOptions(options) {
  assert(options, 'Options are required.');

  if (options.gte != null) {
    assert(Buffer.isBuffer(options.gte) || typeof options.gte === 'string');
    this.gte = options.gte;
  }

  if (options.lte != null) {
    assert(Buffer.isBuffer(options.lte) || typeof options.lte === 'string');
    this.lte = options.lte;
  }

  if (options.keys != null) {
    assert(typeof options.keys === 'boolean');
    this.keys = options.keys;
  }

  if (options.values != null) {
    assert(typeof options.values === 'boolean');
    this.values = options.values;
  }

  if (options.fillCache != null) {
    assert(typeof options.fillCache === 'boolean');
    this.fillCache = options.fillCache;
  }

  if (options.keyAsBuffer != null) {
    assert(typeof options.keyAsBuffer === 'boolean');
    this.keyAsBuffer = options.keyAsBuffer;
  }

  if (options.valueAsBuffer != null) {
    assert(typeof options.valueAsBuffer === 'boolean');
    this.valueAsBuffer = options.valueAsBuffer;
  }

  if (options.reverse != null) {
    assert(typeof options.reverse === 'boolean');
    this.reverse = options.reverse;
  }

  if (options.limit != null) {
    assert(typeof options.limit === 'number');
    assert(options.limit >= 0);
    this.limit = options.limit;
  }

  if (!this.keys && !this.values) throw new Error('Keys and/or values must be chosen.');

  return this;
};

/*
 * Helpers
 */

function isNotFound(err) {
  if (!err) return false;

  return err.notFound || err.type === 'NotFoundError' || /not\s*found/i.test(err.message);
}

VERSION_ERROR = 'Warning:' + ' Your database does not match the current database version.' + ' This is likely because the database layout or serialization' + ' format has changed drastically. If you want to dump your' + ' data, downgrade to your previous version first. If you do' + ' not think you should be seeing this error, post an issue on' + ' the repo.';

/*
 * Expose
 */

module.exports = LowlevelUp;