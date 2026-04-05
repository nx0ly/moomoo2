function _____WB$wombat$assign$function_____(name) {
  return self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name) || self[name];
}
if (!self.__WB_pmw) {
  self.__WB_pmw = function (obj) {
    this.__WB_source = obj;
    return this;
  };
}
{
  let window = _____WB$wombat$assign$function_____("window");
  let self = _____WB$wombat$assign$function_____("self");
  let document = _____WB$wombat$assign$function_____("document");
  let location = _____WB$wombat$assign$function_____("location");
  let top = _____WB$wombat$assign$function_____("top");
  let parent = _____WB$wombat$assign$function_____("parent");
  let frames = _____WB$wombat$assign$function_____("frames");
  let opens = _____WB$wombat$assign$function_____("opens");
  (function (t) {
    var e = {};
    function n(r) {
      if (e[r]) {
        return e[r].exports;
      }
      var i = e[r] = {
        i: r,
        l: false,
        exports: {}
      };
      t[r].call(i.exports, i, i.exports, n);
      i.l = true;
      return i.exports;
    }
    n.m = t;
    n.c = e;
    n.d = function (t, e, r) {
      if (!n.o(t, e)) {
        Object.defineProperty(t, e, {
          enumerable: true,
          get: r
        });
      }
    };
    n.r = function (t) {
      if (typeof Symbol != "undefined" && Symbol.toStringTag) {
        Object.defineProperty(t, Symbol.toStringTag, {
          value: "Module"
        });
      }
      Object.defineProperty(t, "__esModule", {
        value: true
      });
    };
    n.t = function (t, e) {
      if (e & 1) {
        t = n(t);
      }
      if (e & 8) {
        return t;
      }
      if (e & 4 && typeof t == "object" && t && t.__esModule) {
        return t;
      }
      var r = Object.create(null);
      n.r(r);
      Object.defineProperty(r, "default", {
        enumerable: true,
        value: t
      });
      if (e & 2 && typeof t != "string") {
        for (var i in t) {
          n.d(r, i, function (e) {
            return t[e];
          }.bind(null, i));
        }
      }
      return r;
    };
    n.n = function (t) {
      var e = t && t.__esModule ? function () {
        return t.default;
      } : function () {
        return t;
      };
      n.d(e, "a", e);
      return e;
    };
    n.o = function (t, e) {
      return Object.prototype.hasOwnProperty.call(t, e);
    };
    n.p = "";
    n(n.s = 21);
  })([function (t, e, n) {
    var r = e.global = n(24);
    var i = e.hasBuffer = r && !!r.isBuffer;
    var a = e.hasArrayBuffer = typeof ArrayBuffer != "undefined";
    var o = e.isArray = n(1);
    e.isArrayBuffer = a ? function (t) {
      return t instanceof ArrayBuffer || p(t);
    } : y;
    var s = e.isBuffer = i ? r.isBuffer : y;
    var l = e.isView = a ? ArrayBuffer.isView || v("ArrayBuffer", "buffer") : y;
    e.alloc = d;
    e.concat = function (t, n) {
      if (!n) {
        n = 0;
        Array.prototype.forEach.call(t, function (t) {
          n += t.length;
        });
      }
      var r = this !== e && this || t[0];
      var i = d.call(r, n);
      var a = 0;
      Array.prototype.forEach.call(t, function (t) {
        a += f.copy.call(t, i, a);
      });
      return i;
    };
    e.from = function (t) {
      if (typeof t == "string") {
        return function (t) {
          var e = t.length * 3;
          var n = d.call(this, e);
          var r = f.write.call(n, t);
          if (e !== r) {
            n = f.slice.call(n, 0, r);
          }
          return n;
        }.call(this, t);
      } else {
        return m(this).from(t);
      }
    };
    var c = e.Array = n(26);
    var h = e.Buffer = n(27);
    var u = e.Uint8Array = n(28);
    var f = e.prototype = n(6);
    function d(t) {
      return m(this).alloc(t);
    }
    var p = v("ArrayBuffer");
    function m(t) {
      if (s(t)) {
        return h;
      } else if (l(t)) {
        return u;
      } else if (o(t)) {
        return c;
      } else if (i) {
        return h;
      } else if (a) {
        return u;
      } else {
        return c;
      }
    }
    function y() {
      return false;
    }
    function v(t, e) {
      t = "[object " + t + "]";
      return function (n) {
        return n != null && {}.toString.call(e ? n[e] : n) === t;
      };
    }
  }, function (t, e) {
    var n = {}.toString;
    t.exports = Array.isArray || function (t) {
      return n.call(t) == "[object Array]";
    };
  }, function (t, e, n) {
    var r = n(1);
    e.createCodec = s;
    e.install = function (t) {
      for (var e in t) {
        a.prototype[e] = o(a.prototype[e], t[e]);
      }
    };
    e.filter = function (t) {
      if (r(t)) {
        return function (t) {
          t = t.slice();
          return function (n) {
            return t.reduce(e, n);
          };
          function e(t, e) {
            return e(t);
          }
        }(t);
      } else {
        return t;
      }
    };
    var i = n(0);
    function a(t) {
      if (!(this instanceof a)) {
        return new a(t);
      }
      this.options = t;
      this.init();
    }
    function o(t, e) {
      if (t && e) {
        return function () {
          t.apply(this, arguments);
          return e.apply(this, arguments);
        };
      } else {
        return t || e;
      }
    }
    function s(t) {
      return new a(t);
    }
    a.prototype.init = function () {
      var t = this.options;
      if (t && t.uint8array) {
        this.bufferish = i.Uint8Array;
      }
      return this;
    };
    e.preset = s({
      preset: true
    });
  }, function (t, e, n) {
    var r = n(4).ExtBuffer;
    var i = n(30);
    var a = n(31);
    var o = n(2);
    function s() {
      var t = this.options;
      this.encode = function (t) {
        var e = a.getWriteType(t);
        return function (t, n) {
          var r = e[typeof n];
          if (!r) {
            throw new Error("Unsupported type \"" + typeof n + "\": " + n);
          }
          r(t, n);
        };
      }(t);
      if (t && t.preset) {
        i.setExtPackers(this);
      }
      return this;
    }
    o.install({
      addExtPacker: function (t, e, n) {
        n = o.filter(n);
        var i = e.name;
        if (i && i !== "Object") {
          (this.extPackers ||= {})[i] = a;
        } else {
          (this.extEncoderList ||= []).unshift([e, a]);
        }
        function a(e) {
          if (n) {
            e = n(e);
          }
          return new r(e, t);
        }
      },
      getExtPacker: function (t) {
        var e = this.extPackers ||= {};
        var n = t.constructor;
        var r = n && n.name && e[n.name];
        if (r) {
          return r;
        }
        var i = this.extEncoderList ||= [];
        for (var a = i.length, o = 0; o < a; o++) {
          var s = i[o];
          if (n === s[0]) {
            return s[1];
          }
        }
      },
      init: s
    });
    e.preset = s.call(o.preset);
  }, function (t, e, n) {
    e.ExtBuffer = function t(e, n) {
      if (!(this instanceof t)) {
        return new t(e, n);
      }
      this.buffer = r.from(e);
      this.type = n;
    };
    var r = n(0);
  }, function (t, e) {
    e.read = function (t, e, n, r, i) {
      var a;
      var o;
      var s = i * 8 - r - 1;
      var l = (1 << s) - 1;
      var c = l >> 1;
      var h = -7;
      var u = n ? i - 1 : 0;
      var f = n ? -1 : 1;
      var d = t[e + u];
      u += f;
      a = d & (1 << -h) - 1;
      d >>= -h;
      h += s;
      for (; h > 0; h -= 8) {
        a = a * 256 + t[e + u];
        u += f;
      }
      o = a & (1 << -h) - 1;
      a >>= -h;
      h += r;
      for (; h > 0; h -= 8) {
        o = o * 256 + t[e + u];
        u += f;
      }
      if (a === 0) {
        a = 1 - c;
      } else {
        if (a === l) {
          if (o) {
            return NaN;
          } else {
            return (d ? -1 : 1) * Infinity;
          }
        }
        o += Math.pow(2, r);
        a -= c;
      }
      return (d ? -1 : 1) * o * Math.pow(2, a - r);
    };
    e.write = function (t, e, n, r, i, a) {
      var o;
      var s;
      var l;
      var c = a * 8 - i - 1;
      var h = (1 << c) - 1;
      var u = h >> 1;
      var f = i === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var d = r ? 0 : a - 1;
      var p = r ? 1 : -1;
      var m = e < 0 || e === 0 && 1 / e < 0 ? 1 : 0;
      e = Math.abs(e);
      if (isNaN(e) || e === Infinity) {
        s = isNaN(e) ? 1 : 0;
        o = h;
      } else {
        o = Math.floor(Math.log(e) / Math.LN2);
        if (e * (l = Math.pow(2, -o)) < 1) {
          o--;
          l *= 2;
        }
        if ((e += o + u >= 1 ? f / l : f * Math.pow(2, 1 - u)) * l >= 2) {
          o++;
          l /= 2;
        }
        if (o + u >= h) {
          s = 0;
          o = h;
        } else if (o + u >= 1) {
          s = (e * l - 1) * Math.pow(2, i);
          o += u;
        } else {
          s = e * Math.pow(2, u - 1) * Math.pow(2, i);
          o = 0;
        }
      }
      for (; i >= 8; i -= 8) {
        t[n + d] = s & 255;
        d += p;
        s /= 256;
      }
      o = o << i | s;
      c += i;
      for (; c > 0; c -= 8) {
        t[n + d] = o & 255;
        d += p;
        o /= 256;
      }
      t[n + d - p] |= m * 128;
    };
  }, function (t, e, n) {
    var r = n(29);
    e.copy = l;
    e.slice = c;
    e.toString = function (t, e, n) {
      return (!o && i.isBuffer(this) ? this.toString : r.toString).apply(this, arguments);
    };
    e.write = function (t) {
      return function () {
        return (this[t] || r[t]).apply(this, arguments);
      };
    }("write");
    var i = n(0);
    var a = i.global;
    var o = i.hasBuffer && "TYPED_ARRAY_SUPPORT" in a;
    var s = o && !a.TYPED_ARRAY_SUPPORT;
    function l(t, e, n, a) {
      var o = i.isBuffer(this);
      var l = i.isBuffer(t);
      if (o && l) {
        return this.copy(t, e, n, a);
      }
      if (s || o || l || !i.isView(this) || !i.isView(t)) {
        return r.copy.call(this, t, e, n, a);
      }
      var h = n || a != null ? c.call(this, n, a) : this;
      t.set(h, e);
      return h.length;
    }
    function c(t, e) {
      var n = this.slice || !s && this.subarray;
      if (n) {
        return n.call(this, t, e);
      }
      var r = i.alloc.call(this, e - t);
      l.call(this, r, 0, t, e);
      return r;
    }
  }, function (t, e, n) {
    (function (t) {
      (function (e) {
        var n;
        var r = "undefined";
        var i = r !== typeof t && t;
        var a = r !== typeof Uint8Array && Uint8Array;
        var o = r !== typeof ArrayBuffer && ArrayBuffer;
        var s = [0, 0, 0, 0, 0, 0, 0, 0];
        var l = Array.isArray || function (t) {
          return !!t && Object.prototype.toString.call(t) == "[object Array]";
        };
        var c = 4294967296;
        var h = 16777216;
        function u(t, l, u) {
          var S = l ? 0 : 4;
          var k = l ? 4 : 0;
          var M = l ? 0 : 3;
          var E = l ? 1 : 2;
          var I = l ? 2 : 1;
          var C = l ? 3 : 0;
          var A = l ? g : w;
          var T = l ? x : b;
          var P = _.prototype;
          var O = "is" + t;
          var B = "_" + O;
          P.buffer = undefined;
          P.offset = 0;
          P[B] = true;
          P.toNumber = R;
          P.toString = function (t) {
            var e = this.buffer;
            var n = this.offset;
            var r = D(e, n + S);
            var i = D(e, n + k);
            var a = "";
            var o = !u && r & -2147483648;
            if (o) {
              r = ~r;
              i = c - i;
            }
            t = t || 10;
            while (true) {
              var s = r % t * c + i;
              r = Math.floor(r / t);
              i = Math.floor(s / t);
              a = (s % t).toString(t) + a;
              if (!r && !i) {
                break;
              }
            }
            if (o) {
              a = "-" + a;
            }
            return a;
          };
          P.toJSON = R;
          P.toArray = f;
          if (i) {
            P.toBuffer = d;
          }
          if (a) {
            P.toArrayBuffer = p;
          }
          _[O] = function (t) {
            return !!t && !!t[B];
          };
          e[t] = _;
          return _;
          function _(t, e, i, l) {
            if (this instanceof _) {
              return function (t, e, i, l, h) {
                if (a && o) {
                  if (e instanceof o) {
                    e = new a(e);
                  }
                  if (l instanceof o) {
                    l = new a(l);
                  }
                }
                if (e || i || l || n) {
                  if (!m(e, i)) {
                    h = i;
                    l = e;
                    i = 0;
                    e = new (n || Array)(8);
                  }
                  t.buffer = e;
                  t.offset = i |= 0;
                  if (r !== typeof l) {
                    if (typeof l == "string") {
                      (function (t, e, n, r) {
                        var i = 0;
                        var a = n.length;
                        var o = 0;
                        var s = 0;
                        if (n[0] === "-") {
                          i++;
                        }
                        var l = i;
                        while (i < a) {
                          var h = parseInt(n[i++], r);
                          if (!(h >= 0)) {
                            break;
                          }
                          s = s * r + h;
                          o = o * r + Math.floor(s / c);
                          s %= c;
                        }
                        if (l) {
                          o = ~o;
                          if (s) {
                            s = c - s;
                          } else {
                            o++;
                          }
                        }
                        L(t, e + S, o);
                        L(t, e + k, s);
                      })(e, i, l, h || 10);
                    } else if (m(l, h)) {
                      y(e, i, l, h);
                    } else if (typeof h == "number") {
                      L(e, i + S, l);
                      L(e, i + k, h);
                    } else if (l > 0) {
                      A(e, i, l);
                    } else if (l < 0) {
                      T(e, i, l);
                    } else {
                      y(e, i, s, 0);
                    }
                  }
                } else {
                  t.buffer = v(s, 0);
                }
              }(this, t, e, i, l);
            } else {
              return new _(t, e, i, l);
            }
          }
          function R() {
            var t = this.buffer;
            var e = this.offset;
            var n = D(t, e + S);
            var r = D(t, e + k);
            if (!u) {
              n |= 0;
            }
            if (n) {
              return n * c + r;
            } else {
              return r;
            }
          }
          function L(t, e, n) {
            t[e + C] = n & 255;
            n >>= 8;
            t[e + I] = n & 255;
            n >>= 8;
            t[e + E] = n & 255;
            n >>= 8;
            t[e + M] = n & 255;
          }
          function D(t, e) {
            return t[e + M] * h + (t[e + E] << 16) + (t[e + I] << 8) + t[e + C];
          }
        }
        function f(t) {
          var e = this.buffer;
          var r = this.offset;
          n = null;
          if (t !== false && r === 0 && e.length === 8 && l(e)) {
            return e;
          } else {
            return v(e, r);
          }
        }
        function d(e) {
          var r = this.buffer;
          var a = this.offset;
          n = i;
          if (e !== false && a === 0 && r.length === 8 && t.isBuffer(r)) {
            return r;
          }
          var o = new i(8);
          y(o, 0, r, a);
          return o;
        }
        function p(t) {
          var e = this.buffer;
          var r = this.offset;
          var i = e.buffer;
          n = a;
          if (t !== false && r === 0 && i instanceof o && i.byteLength === 8) {
            return i;
          }
          var s = new a(8);
          y(s, 0, e, r);
          return s.buffer;
        }
        function m(t, e) {
          var n = t && t.length;
          e |= 0;
          return n && e + 8 <= n && typeof t[e] != "string";
        }
        function y(t, e, n, r) {
          e |= 0;
          r |= 0;
          for (var i = 0; i < 8; i++) {
            t[e++] = n[r++] & 255;
          }
        }
        function v(t, e) {
          return Array.prototype.slice.call(t, e, e + 8);
        }
        function g(t, e, n) {
          for (var r = e + 8; r > e;) {
            t[--r] = n & 255;
            n /= 256;
          }
        }
        function x(t, e, n) {
          var r = e + 8;
          for (n++; r > e;) {
            t[--r] = -n & 255 ^ 255;
            n /= 256;
          }
        }
        function w(t, e, n) {
          for (var r = e + 8; e < r;) {
            t[e++] = n & 255;
            n /= 256;
          }
        }
        function b(t, e, n) {
          var r = e + 8;
          for (n++; e < r;) {
            t[e++] = -n & 255 ^ 255;
            n /= 256;
          }
        }
        u("Uint64BE", true, true);
        u("Int64BE", true, false);
        u("Uint64LE", false, true);
        u("Int64LE", false, false);
      })(typeof e == "object" && typeof e.nodeName != "string" ? e : this || {});
    }).call(this, n(12).Buffer);
  }, function (t, e, n) {
    var r = n(4).ExtBuffer;
    var i = n(33);
    var a = n(18).readUint8;
    var o = n(34);
    var s = n(2);
    function l() {
      var t = this.options;
      this.decode = function (t) {
        var e = o.getReadToken(t);
        return function (t) {
          var n = a(t);
          var r = e[n];
          if (!r) {
            throw new Error("Invalid type: " + (n ? "0x" + n.toString(16) : n));
          }
          return r(t);
        };
      }(t);
      if (t && t.preset) {
        i.setExtUnpackers(this);
      }
      return this;
    }
    s.install({
      addExtUnpacker: function (t, e) {
        (this.extUnpackers ||= [])[t] = s.filter(e);
      },
      getExtUnpacker: function (t) {
        return (this.extUnpackers ||= [])[t] || function (e) {
          return new r(e, t);
        };
      },
      init: l
    });
    e.preset = l.call(s.preset);
  }, function (t, e) {
    t.exports.randInt = function (t, e) {
      return Math.floor(Math.random() * (e - t + 1)) + t;
    };
    t.exports.randFloat = function (t, e) {
      return Math.random() * (e - t) + t;
    };
    t.exports.getDistance = function (t, e, n, r) {
      return Math.sqrt((n -= t) * n + (r -= e) * r);
    };
    t.exports.getDirection = function (t, e, n, r) {
      return Math.atan2(e - r, t - n);
    };
    t.exports.getAngleDist = function (t, e) {
      var n = Math.abs(e - t) % (Math.PI * 2);
      if (n > Math.PI) {
        return Math.PI * 2 - n;
      } else {
        return n;
      }
    };
    t.exports.getRectCorner = function (t, e, n, r) {
      r[0] = t.x + (e * Math.cos(t.dir) - n * Math.sin(t.dir));
      r[1] = t.y + (e * Math.sin(t.dir) + n * Math.cos(t.dir));
    };
    var n = [];
    t.exports.lineInRect = function (e, r, i, a, o, s) {
      n.length = 0;
      var l = false;
      if (!(l = t.exports.getCollisionsOnLine(e, r, i, a, o.topRight[0], o.topRight[1], o.bottomRight[0], o.bottomRight[1], s ? n : null)) || !!s) {
        l = t.exports.getCollisionsOnLine(e, r, i, a, o.topLeft[0], o.topLeft[1], o.topRight[0], o.topRight[1], s ? n : null);
      }
      if (!l || !!s) {
        l = t.exports.getCollisionsOnLine(e, r, i, a, o.topLeft[0], o.topLeft[1], o.bottomLeft[0], o.bottomLeft[1], s ? n : null);
      }
      if (!l || !!s) {
        l = t.exports.getCollisionsOnLine(e, r, i, a, o.bottomLeft[0], o.bottomLeft[1], o.bottomRight[0], o.bottomRight[1], s ? n : null);
      }
      if (s) {
        return n;
      } else {
        return l;
      }
    };
    t.exports.getCollisionsOnLine = function (t, e, n, r, i, a, o, s, l) {
      var c;
      var h;
      var u = (s - a) * (n - t) - (o - i) * (r - e);
      return u != 0 && (h = ((n - t) * (e - a) - (r - e) * (t - i)) / u, (c = ((o - i) * (e - a) - (s - a) * (t - i)) / u) >= 0 && c <= 1 && h >= 0 && h <= 1 && (!l || l.push(t + c * (n - t), e + c * (r - e))));
    };
    t.exports.lerp = function (t, e, n) {
      return t + (e - t) * n;
    };
    t.exports.orderByScore = function (t, e) {
      return e.score - t.score;
    };
    t.exports.orderByRarity = function (t, e) {
      return e.rarity - t.rarity;
    };
    t.exports.truncateText = function (t, e) {
      if (t.length > e) {
        return t.substring(0, e) + "...";
      } else {
        return t;
      }
    };
    t.exports.randomString = function (t) {
      var e = "";
      var n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var r = 0; r < 5; r++) {
        e += n.charAt(Math.floor(Math.random() * n.length));
      }
      return e;
    };
    t.exports.formatNumCash = function (t) {
      return parseFloat(Math.round(t * 100) / 100).toFixed(2);
    };
    t.exports.fixTo = function (t, e) {
      return parseFloat(t.toFixed(e));
    };
    t.exports.isNumber = function (t) {
      return typeof t == "number" && !isNaN(t) && isFinite(t);
    };
    t.exports.isString = function (t) {
      return t && typeof t == "string";
    };
  }, function (t, e, n) {
    e.encode = function (t, e) {
      var n = new r(e);
      n.write(t);
      return n.read();
    };
    var r = n(11).EncodeBuffer;
  }, function (t, e, n) {
    e.EncodeBuffer = i;
    var r = n(3).preset;
    function i(t) {
      if (!(this instanceof i)) {
        return new i(t);
      }
      if (t && (this.options = t, t.codec)) {
        var e = this.codec = t.codec;
        if (e.bufferish) {
          this.bufferish = e.bufferish;
        }
      }
    }
    n(15).FlexEncoder.mixin(i.prototype);
    i.prototype.codec = r;
    i.prototype.write = function (t) {
      this.codec.encode(this, t);
    };
  }, function (t, e, n) {
    "use strict";

    (function (t) {
      /*!
       * The buffer module from node.js, for the browser.
       *
       * @author   Feross Aboukhadijeh <http://feross.org>
       * @license  MIT
       */
      var r = n(25);
      var i = n(5);
      var a = n(1);
      function o() {
        if (l.TYPED_ARRAY_SUPPORT) {
          return 2147483647;
        } else {
          return 1073741823;
        }
      }
      function s(t, e) {
        if (o() < e) {
          throw new RangeError("Invalid typed array length");
        }
        if (l.TYPED_ARRAY_SUPPORT) {
          (t = new Uint8Array(e)).__proto__ = l.prototype;
        } else {
          if (t === null) {
            t = new l(e);
          }
          t.length = e;
        }
        return t;
      }
      function l(t, e, n) {
        if (!l.TYPED_ARRAY_SUPPORT && !(this instanceof l)) {
          return new l(t, e, n);
        }
        if (typeof t == "number") {
          if (typeof e == "string") {
            throw new Error("If encoding is specified then the first argument must be a string");
          }
          return u(this, t);
        }
        return c(this, t, e, n);
      }
      function c(t, e, n, r) {
        if (typeof e == "number") {
          throw new TypeError("\"value\" argument must not be a number");
        }
        if (typeof ArrayBuffer != "undefined" && e instanceof ArrayBuffer) {
          return function (t, e, n, r) {
            e.byteLength;
            if (n < 0 || e.byteLength < n) {
              throw new RangeError("'offset' is out of bounds");
            }
            if (e.byteLength < n + (r || 0)) {
              throw new RangeError("'length' is out of bounds");
            }
            e = n === undefined && r === undefined ? new Uint8Array(e) : r === undefined ? new Uint8Array(e, n) : new Uint8Array(e, n, r);
            if (l.TYPED_ARRAY_SUPPORT) {
              (t = e).__proto__ = l.prototype;
            } else {
              t = f(t, e);
            }
            return t;
          }(t, e, n, r);
        } else if (typeof e == "string") {
          return function (t, e, n) {
            if (typeof n != "string" || n === "") {
              n = "utf8";
            }
            if (!l.isEncoding(n)) {
              throw new TypeError("\"encoding\" must be a valid string encoding");
            }
            var r = p(e, n) | 0;
            var i = (t = s(t, r)).write(e, n);
            if (i !== r) {
              t = t.slice(0, i);
            }
            return t;
          }(t, e, n);
        } else {
          return function (t, e) {
            if (l.isBuffer(e)) {
              var n = d(e.length) | 0;
              if ((t = s(t, n)).length === 0) {
                return t;
              } else {
                e.copy(t, 0, 0, n);
                return t;
              }
            }
            if (e) {
              if (typeof ArrayBuffer != "undefined" && e.buffer instanceof ArrayBuffer || "length" in e) {
                if (typeof e.length != "number" || function (t) {
                  return t != t;
                }(e.length)) {
                  return s(t, 0);
                } else {
                  return f(t, e);
                }
              }
              if (e.type === "Buffer" && a(e.data)) {
                return f(t, e.data);
              }
            }
            throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
          }(t, e);
        }
      }
      function h(t) {
        if (typeof t != "number") {
          throw new TypeError("\"size\" argument must be a number");
        }
        if (t < 0) {
          throw new RangeError("\"size\" argument must not be negative");
        }
      }
      function u(t, e) {
        h(e);
        t = s(t, e < 0 ? 0 : d(e) | 0);
        if (!l.TYPED_ARRAY_SUPPORT) {
          for (var n = 0; n < e; ++n) {
            t[n] = 0;
          }
        }
        return t;
      }
      function f(t, e) {
        var n = e.length < 0 ? 0 : d(e.length) | 0;
        t = s(t, n);
        for (var r = 0; r < n; r += 1) {
          t[r] = e[r] & 255;
        }
        return t;
      }
      function d(t) {
        if (t >= o()) {
          throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + o().toString(16) + " bytes");
        }
        return t | 0;
      }
      function p(t, e) {
        if (l.isBuffer(t)) {
          return t.length;
        }
        if (typeof ArrayBuffer != "undefined" && typeof ArrayBuffer.isView == "function" && (ArrayBuffer.isView(t) || t instanceof ArrayBuffer)) {
          return t.byteLength;
        }
        if (typeof t != "string") {
          t = "" + t;
        }
        var n = t.length;
        if (n === 0) {
          return 0;
        }
        var r = false;
        while (true) {
          switch (e) {
            case "ascii":
            case "latin1":
            case "binary":
              return n;
            case "utf8":
            case "utf-8":
            case undefined:
              return Y(t).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return n * 2;
            case "hex":
              return n >>> 1;
            case "base64":
              return W(t).length;
            default:
              if (r) {
                return Y(t).length;
              }
              e = ("" + e).toLowerCase();
              r = true;
          }
        }
      }
      function m(t, e, n) {
        var r = t[e];
        t[e] = t[n];
        t[n] = r;
      }
      function y(t, e, n, r, i) {
        if (t.length === 0) {
          return -1;
        }
        if (typeof n == "string") {
          r = n;
          n = 0;
        } else if (n > 2147483647) {
          n = 2147483647;
        } else if (n < -2147483648) {
          n = -2147483648;
        }
        n = +n;
        if (isNaN(n)) {
          n = i ? 0 : t.length - 1;
        }
        if (n < 0) {
          n = t.length + n;
        }
        if (n >= t.length) {
          if (i) {
            return -1;
          }
          n = t.length - 1;
        } else if (n < 0) {
          if (!i) {
            return -1;
          }
          n = 0;
        }
        if (typeof e == "string") {
          e = l.from(e, r);
        }
        if (l.isBuffer(e)) {
          if (e.length === 0) {
            return -1;
          } else {
            return v(t, e, n, r, i);
          }
        }
        if (typeof e == "number") {
          e &= 255;
          if (l.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf == "function") {
            if (i) {
              return Uint8Array.prototype.indexOf.call(t, e, n);
            } else {
              return Uint8Array.prototype.lastIndexOf.call(t, e, n);
            }
          } else {
            return v(t, [e], n, r, i);
          }
        }
        throw new TypeError("val must be string, number or Buffer");
      }
      function v(t, e, n, r, i) {
        var a;
        var o = 1;
        var s = t.length;
        var l = e.length;
        if (r !== undefined && ((r = String(r).toLowerCase()) === "ucs2" || r === "ucs-2" || r === "utf16le" || r === "utf-16le")) {
          if (t.length < 2 || e.length < 2) {
            return -1;
          }
          o = 2;
          s /= 2;
          l /= 2;
          n /= 2;
        }
        function c(t, e) {
          if (o === 1) {
            return t[e];
          } else {
            return t.readUInt16BE(e * o);
          }
        }
        if (i) {
          var h = -1;
          for (a = n; a < s; a++) {
            if (c(t, a) === c(e, h === -1 ? 0 : a - h)) {
              if (h === -1) {
                h = a;
              }
              if (a - h + 1 === l) {
                return h * o;
              }
            } else {
              if (h !== -1) {
                a -= a - h;
              }
              h = -1;
            }
          }
        } else {
          if (n + l > s) {
            n = s - l;
          }
          a = n;
          for (; a >= 0; a--) {
            var u = true;
            for (var f = 0; f < l; f++) {
              if (c(t, a + f) !== c(e, f)) {
                u = false;
                break;
              }
            }
            if (u) {
              return a;
            }
          }
        }
        return -1;
      }
      function g(t, e, n, r) {
        n = Number(n) || 0;
        var i = t.length - n;
        if (r) {
          if ((r = Number(r)) > i) {
            r = i;
          }
        } else {
          r = i;
        }
        var a = e.length;
        if (a % 2 != 0) {
          throw new TypeError("Invalid hex string");
        }
        if (r > a / 2) {
          r = a / 2;
        }
        for (var o = 0; o < r; ++o) {
          var s = parseInt(e.substr(o * 2, 2), 16);
          if (isNaN(s)) {
            return o;
          }
          t[n + o] = s;
        }
        return o;
      }
      function x(t, e, n, r) {
        return N(Y(e, t.length - n), t, n, r);
      }
      function w(t, e, n, r) {
        return N(function (t) {
          var e = [];
          for (var n = 0; n < t.length; ++n) {
            e.push(t.charCodeAt(n) & 255);
          }
          return e;
        }(e), t, n, r);
      }
      function b(t, e, n, r) {
        return w(t, e, n, r);
      }
      function S(t, e, n, r) {
        return N(W(e), t, n, r);
      }
      function k(t, e, n, r) {
        return N(function (t, e) {
          var n;
          var r;
          var i;
          var a = [];
          for (var o = 0; o < t.length && !((e -= 2) < 0); ++o) {
            r = (n = t.charCodeAt(o)) >> 8;
            i = n % 256;
            a.push(i);
            a.push(r);
          }
          return a;
        }(e, t.length - n), t, n, r);
      }
      function M(t, e, n) {
        if (e === 0 && n === t.length) {
          return r.fromByteArray(t);
        } else {
          return r.fromByteArray(t.slice(e, n));
        }
      }
      function E(t, e, n) {
        n = Math.min(t.length, n);
        var r = [];
        for (var i = e; i < n;) {
          var a;
          var o;
          var s;
          var l;
          var c = t[i];
          var h = null;
          var u = c > 239 ? 4 : c > 223 ? 3 : c > 191 ? 2 : 1;
          if (i + u <= n) {
            switch (u) {
              case 1:
                if (c < 128) {
                  h = c;
                }
                break;
              case 2:
                if (((a = t[i + 1]) & 192) == 128 && (l = (c & 31) << 6 | a & 63) > 127) {
                  h = l;
                }
                break;
              case 3:
                a = t[i + 1];
                o = t[i + 2];
                if ((a & 192) == 128 && (o & 192) == 128 && (l = (c & 15) << 12 | (a & 63) << 6 | o & 63) > 2047 && (l < 55296 || l > 57343)) {
                  h = l;
                }
                break;
              case 4:
                a = t[i + 1];
                o = t[i + 2];
                s = t[i + 3];
                if ((a & 192) == 128 && (o & 192) == 128 && (s & 192) == 128 && (l = (c & 15) << 18 | (a & 63) << 12 | (o & 63) << 6 | s & 63) > 65535 && l < 1114112) {
                  h = l;
                }
            }
          }
          if (h === null) {
            h = 65533;
            u = 1;
          } else if (h > 65535) {
            h -= 65536;
            r.push(h >>> 10 & 1023 | 55296);
            h = h & 1023 | 56320;
          }
          r.push(h);
          i += u;
        }
        return function (t) {
          var e = t.length;
          if (e <= I) {
            return String.fromCharCode.apply(String, t);
          }
          var n = "";
          for (var r = 0; r < e;) {
            n += String.fromCharCode.apply(String, t.slice(r, r += I));
          }
          return n;
        }(r);
      }
      e.Buffer = l;
      e.SlowBuffer = function (t) {
        if (+t != t) {
          t = 0;
        }
        return l.alloc(+t);
      };
      e.INSPECT_MAX_BYTES = 50;
      l.TYPED_ARRAY_SUPPORT = t.TYPED_ARRAY_SUPPORT !== undefined ? t.TYPED_ARRAY_SUPPORT : function () {
        try {
          var t = new Uint8Array(1);
          t.__proto__ = {
            __proto__: Uint8Array.prototype,
            foo: function () {
              return 42;
            }
          };
          return t.foo() === 42 && typeof t.subarray == "function" && t.subarray(1, 1).byteLength === 0;
        } catch (t) {
          return false;
        }
      }();
      e.kMaxLength = o();
      l.poolSize = 8192;
      l._augment = function (t) {
        t.__proto__ = l.prototype;
        return t;
      };
      l.from = function (t, e, n) {
        return c(null, t, e, n);
      };
      if (l.TYPED_ARRAY_SUPPORT) {
        l.prototype.__proto__ = Uint8Array.prototype;
        l.__proto__ = Uint8Array;
        if (typeof Symbol != "undefined" && Symbol.species && l[Symbol.species] === l) {
          Object.defineProperty(l, Symbol.species, {
            value: null,
            configurable: true
          });
        }
      }
      l.alloc = function (t, e, n) {
        return function (t, e, n, r) {
          h(e);
          if (e <= 0) {
            return s(t, e);
          } else if (n !== undefined) {
            if (typeof r == "string") {
              return s(t, e).fill(n, r);
            } else {
              return s(t, e).fill(n);
            }
          } else {
            return s(t, e);
          }
        }(null, t, e, n);
      };
      l.allocUnsafe = function (t) {
        return u(null, t);
      };
      l.allocUnsafeSlow = function (t) {
        return u(null, t);
      };
      l.isBuffer = function (t) {
        return t != null && !!t._isBuffer;
      };
      l.compare = function (t, e) {
        if (!l.isBuffer(t) || !l.isBuffer(e)) {
          throw new TypeError("Arguments must be Buffers");
        }
        if (t === e) {
          return 0;
        }
        var n = t.length;
        var r = e.length;
        for (var i = 0, a = Math.min(n, r); i < a; ++i) {
          if (t[i] !== e[i]) {
            n = t[i];
            r = e[i];
            break;
          }
        }
        if (n < r) {
          return -1;
        } else if (r < n) {
          return 1;
        } else {
          return 0;
        }
      };
      l.isEncoding = function (t) {
        switch (String(t).toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "latin1":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return true;
          default:
            return false;
        }
      };
      l.concat = function (t, e) {
        if (!a(t)) {
          throw new TypeError("\"list\" argument must be an Array of Buffers");
        }
        if (t.length === 0) {
          return l.alloc(0);
        }
        var n;
        if (e === undefined) {
          e = 0;
          n = 0;
          for (; n < t.length; ++n) {
            e += t[n].length;
          }
        }
        var r = l.allocUnsafe(e);
        var i = 0;
        for (n = 0; n < t.length; ++n) {
          var o = t[n];
          if (!l.isBuffer(o)) {
            throw new TypeError("\"list\" argument must be an Array of Buffers");
          }
          o.copy(r, i);
          i += o.length;
        }
        return r;
      };
      l.byteLength = p;
      l.prototype._isBuffer = true;
      l.prototype.swap16 = function () {
        var t = this.length;
        if (t % 2 != 0) {
          throw new RangeError("Buffer size must be a multiple of 16-bits");
        }
        for (var e = 0; e < t; e += 2) {
          m(this, e, e + 1);
        }
        return this;
      };
      l.prototype.swap32 = function () {
        var t = this.length;
        if (t % 4 != 0) {
          throw new RangeError("Buffer size must be a multiple of 32-bits");
        }
        for (var e = 0; e < t; e += 4) {
          m(this, e, e + 3);
          m(this, e + 1, e + 2);
        }
        return this;
      };
      l.prototype.swap64 = function () {
        var t = this.length;
        if (t % 8 != 0) {
          throw new RangeError("Buffer size must be a multiple of 64-bits");
        }
        for (var e = 0; e < t; e += 8) {
          m(this, e, e + 7);
          m(this, e + 1, e + 6);
          m(this, e + 2, e + 5);
          m(this, e + 3, e + 4);
        }
        return this;
      };
      l.prototype.toString = function () {
        var t = this.length | 0;
        if (t === 0) {
          return "";
        } else if (arguments.length === 0) {
          return E(this, 0, t);
        } else {
          return function (t, e, n) {
            var r = false;
            if (e === undefined || e < 0) {
              e = 0;
            }
            if (e > this.length) {
              return "";
            }
            if (n === undefined || n > this.length) {
              n = this.length;
            }
            if (n <= 0) {
              return "";
            }
            if ((n >>>= 0) <= (e >>>= 0)) {
              return "";
            }
            for (t ||= "utf8";;) {
              switch (t) {
                case "hex":
                  return T(this, e, n);
                case "utf8":
                case "utf-8":
                  return E(this, e, n);
                case "ascii":
                  return C(this, e, n);
                case "latin1":
                case "binary":
                  return A(this, e, n);
                case "base64":
                  return M(this, e, n);
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                  return P(this, e, n);
                default:
                  if (r) {
                    throw new TypeError("Unknown encoding: " + t);
                  }
                  t = (t + "").toLowerCase();
                  r = true;
              }
            }
          }.apply(this, arguments);
        }
      };
      l.prototype.equals = function (t) {
        if (!l.isBuffer(t)) {
          throw new TypeError("Argument must be a Buffer");
        }
        return this === t || l.compare(this, t) === 0;
      };
      l.prototype.inspect = function () {
        var t = "";
        var n = e.INSPECT_MAX_BYTES;
        if (this.length > 0) {
          t = this.toString("hex", 0, n).match(/.{2}/g).join(" ");
          if (this.length > n) {
            t += " ... ";
          }
        }
        return "<Buffer " + t + ">";
      };
      l.prototype.compare = function (t, e, n, r, i) {
        if (!l.isBuffer(t)) {
          throw new TypeError("Argument must be a Buffer");
        }
        if (e === undefined) {
          e = 0;
        }
        if (n === undefined) {
          n = t ? t.length : 0;
        }
        if (r === undefined) {
          r = 0;
        }
        if (i === undefined) {
          i = this.length;
        }
        if (e < 0 || n > t.length || r < 0 || i > this.length) {
          throw new RangeError("out of range index");
        }
        if (r >= i && e >= n) {
          return 0;
        }
        if (r >= i) {
          return -1;
        }
        if (e >= n) {
          return 1;
        }
        e >>>= 0;
        n >>>= 0;
        r >>>= 0;
        i >>>= 0;
        if (this === t) {
          return 0;
        }
        var a = i - r;
        var o = n - e;
        for (var s = Math.min(a, o), c = this.slice(r, i), h = t.slice(e, n), u = 0; u < s; ++u) {
          if (c[u] !== h[u]) {
            a = c[u];
            o = h[u];
            break;
          }
        }
        if (a < o) {
          return -1;
        } else if (o < a) {
          return 1;
        } else {
          return 0;
        }
      };
      l.prototype.includes = function (t, e, n) {
        return this.indexOf(t, e, n) !== -1;
      };
      l.prototype.indexOf = function (t, e, n) {
        return y(this, t, e, n, true);
      };
      l.prototype.lastIndexOf = function (t, e, n) {
        return y(this, t, e, n, false);
      };
      l.prototype.write = function (t, e, n, r) {
        if (e === undefined) {
          r = "utf8";
          n = this.length;
          e = 0;
        } else if (n === undefined && typeof e == "string") {
          r = e;
          n = this.length;
          e = 0;
        } else {
          if (!isFinite(e)) {
            throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
          }
          e |= 0;
          if (isFinite(n)) {
            n |= 0;
            if (r === undefined) {
              r = "utf8";
            }
          } else {
            r = n;
            n = undefined;
          }
        }
        var i = this.length - e;
        if (n === undefined || n > i) {
          n = i;
        }
        if (t.length > 0 && (n < 0 || e < 0) || e > this.length) {
          throw new RangeError("Attempt to write outside buffer bounds");
        }
        r ||= "utf8";
        var a = false;
        while (true) {
          switch (r) {
            case "hex":
              return g(this, t, e, n);
            case "utf8":
            case "utf-8":
              return x(this, t, e, n);
            case "ascii":
              return w(this, t, e, n);
            case "latin1":
            case "binary":
              return b(this, t, e, n);
            case "base64":
              return S(this, t, e, n);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return k(this, t, e, n);
            default:
              if (a) {
                throw new TypeError("Unknown encoding: " + r);
              }
              r = ("" + r).toLowerCase();
              a = true;
          }
        }
      };
      l.prototype.toJSON = function () {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      var I = 4096;
      function C(t, e, n) {
        var r = "";
        n = Math.min(t.length, n);
        for (var i = e; i < n; ++i) {
          r += String.fromCharCode(t[i] & 127);
        }
        return r;
      }
      function A(t, e, n) {
        var r = "";
        n = Math.min(t.length, n);
        for (var i = e; i < n; ++i) {
          r += String.fromCharCode(t[i]);
        }
        return r;
      }
      function T(t, e, n) {
        var r = t.length;
        if (!e || e < 0) {
          e = 0;
        }
        if (!n || n < 0 || n > r) {
          n = r;
        }
        var i = "";
        for (var a = e; a < n; ++a) {
          i += H(t[a]);
        }
        return i;
      }
      function P(t, e, n) {
        for (var r = t.slice(e, n), i = "", a = 0; a < r.length; a += 2) {
          i += String.fromCharCode(r[a] + r[a + 1] * 256);
        }
        return i;
      }
      function O(t, e, n) {
        if (t % 1 != 0 || t < 0) {
          throw new RangeError("offset is not uint");
        }
        if (t + e > n) {
          throw new RangeError("Trying to access beyond buffer length");
        }
      }
      function B(t, e, n, r, i, a) {
        if (!l.isBuffer(t)) {
          throw new TypeError("\"buffer\" argument must be a Buffer instance");
        }
        if (e > i || e < a) {
          throw new RangeError("\"value\" argument is out of bounds");
        }
        if (n + r > t.length) {
          throw new RangeError("Index out of range");
        }
      }
      function _(t, e, n, r) {
        if (e < 0) {
          e = 65535 + e + 1;
        }
        for (var i = 0, a = Math.min(t.length - n, 2); i < a; ++i) {
          t[n + i] = (e & 255 << (r ? i : 1 - i) * 8) >>> (r ? i : 1 - i) * 8;
        }
      }
      function R(t, e, n, r) {
        if (e < 0) {
          e = 4294967295 + e + 1;
        }
        for (var i = 0, a = Math.min(t.length - n, 4); i < a; ++i) {
          t[n + i] = e >>> (r ? i : 3 - i) * 8 & 255;
        }
      }
      function L(t, e, n, r, i, a) {
        if (n + r > t.length) {
          throw new RangeError("Index out of range");
        }
        if (n < 0) {
          throw new RangeError("Index out of range");
        }
      }
      function D(t, e, n, r, a) {
        if (!a) {
          L(t, 0, n, 4);
        }
        i.write(t, e, n, r, 23, 4);
        return n + 4;
      }
      function U(t, e, n, r, a) {
        if (!a) {
          L(t, 0, n, 8);
        }
        i.write(t, e, n, r, 52, 8);
        return n + 8;
      }
      l.prototype.slice = function (t, e) {
        var n;
        var r = this.length;
        t = ~~t;
        e = e === undefined ? r : ~~e;
        if (t < 0) {
          if ((t += r) < 0) {
            t = 0;
          }
        } else if (t > r) {
          t = r;
        }
        if (e < 0) {
          if ((e += r) < 0) {
            e = 0;
          }
        } else if (e > r) {
          e = r;
        }
        if (e < t) {
          e = t;
        }
        if (l.TYPED_ARRAY_SUPPORT) {
          (n = this.subarray(t, e)).__proto__ = l.prototype;
        } else {
          var i = e - t;
          n = new l(i, undefined);
          for (var a = 0; a < i; ++a) {
            n[a] = this[a + t];
          }
        }
        return n;
      };
      l.prototype.readUIntLE = function (t, e, n) {
        t |= 0;
        e |= 0;
        if (!n) {
          O(t, e, this.length);
        }
        var r = this[t];
        for (var i = 1, a = 0; ++a < e && (i *= 256);) {
          r += this[t + a] * i;
        }
        return r;
      };
      l.prototype.readUIntBE = function (t, e, n) {
        t |= 0;
        e |= 0;
        if (!n) {
          O(t, e, this.length);
        }
        var r = this[t + --e];
        for (var i = 1; e > 0 && (i *= 256);) {
          r += this[t + --e] * i;
        }
        return r;
      };
      l.prototype.readUInt8 = function (t, e) {
        if (!e) {
          O(t, 1, this.length);
        }
        return this[t];
      };
      l.prototype.readUInt16LE = function (t, e) {
        if (!e) {
          O(t, 2, this.length);
        }
        return this[t] | this[t + 1] << 8;
      };
      l.prototype.readUInt16BE = function (t, e) {
        if (!e) {
          O(t, 2, this.length);
        }
        return this[t] << 8 | this[t + 1];
      };
      l.prototype.readUInt32LE = function (t, e) {
        if (!e) {
          O(t, 4, this.length);
        }
        return (this[t] | this[t + 1] << 8 | this[t + 2] << 16) + this[t + 3] * 16777216;
      };
      l.prototype.readUInt32BE = function (t, e) {
        if (!e) {
          O(t, 4, this.length);
        }
        return this[t] * 16777216 + (this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3]);
      };
      l.prototype.readIntLE = function (t, e, n) {
        t |= 0;
        e |= 0;
        if (!n) {
          O(t, e, this.length);
        }
        var r = this[t];
        for (var i = 1, a = 0; ++a < e && (i *= 256);) {
          r += this[t + a] * i;
        }
        if (r >= (i *= 128)) {
          r -= Math.pow(2, e * 8);
        }
        return r;
      };
      l.prototype.readIntBE = function (t, e, n) {
        t |= 0;
        e |= 0;
        if (!n) {
          O(t, e, this.length);
        }
        for (var r = e, i = 1, a = this[t + --r]; r > 0 && (i *= 256);) {
          a += this[t + --r] * i;
        }
        if (a >= (i *= 128)) {
          a -= Math.pow(2, e * 8);
        }
        return a;
      };
      l.prototype.readInt8 = function (t, e) {
        if (!e) {
          O(t, 1, this.length);
        }
        if (this[t] & 128) {
          return (255 - this[t] + 1) * -1;
        } else {
          return this[t];
        }
      };
      l.prototype.readInt16LE = function (t, e) {
        if (!e) {
          O(t, 2, this.length);
        }
        var n = this[t] | this[t + 1] << 8;
        if (n & 32768) {
          return n | -65536;
        } else {
          return n;
        }
      };
      l.prototype.readInt16BE = function (t, e) {
        if (!e) {
          O(t, 2, this.length);
        }
        var n = this[t + 1] | this[t] << 8;
        if (n & 32768) {
          return n | -65536;
        } else {
          return n;
        }
      };
      l.prototype.readInt32LE = function (t, e) {
        if (!e) {
          O(t, 4, this.length);
        }
        return this[t] | this[t + 1] << 8 | this[t + 2] << 16 | this[t + 3] << 24;
      };
      l.prototype.readInt32BE = function (t, e) {
        if (!e) {
          O(t, 4, this.length);
        }
        return this[t] << 24 | this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3];
      };
      l.prototype.readFloatLE = function (t, e) {
        if (!e) {
          O(t, 4, this.length);
        }
        return i.read(this, t, true, 23, 4);
      };
      l.prototype.readFloatBE = function (t, e) {
        if (!e) {
          O(t, 4, this.length);
        }
        return i.read(this, t, false, 23, 4);
      };
      l.prototype.readDoubleLE = function (t, e) {
        if (!e) {
          O(t, 8, this.length);
        }
        return i.read(this, t, true, 52, 8);
      };
      l.prototype.readDoubleBE = function (t, e) {
        if (!e) {
          O(t, 8, this.length);
        }
        return i.read(this, t, false, 52, 8);
      };
      l.prototype.writeUIntLE = function (t, e, n, r) {
        t = +t;
        e |= 0;
        n |= 0;
        if (!r) {
          B(this, t, e, n, Math.pow(2, n * 8) - 1, 0);
        }
        var i = 1;
        var a = 0;
        for (this[e] = t & 255; ++a < n && (i *= 256);) {
          this[e + a] = t / i & 255;
        }
        return e + n;
      };
      l.prototype.writeUIntBE = function (t, e, n, r) {
        t = +t;
        e |= 0;
        n |= 0;
        if (!r) {
          B(this, t, e, n, Math.pow(2, n * 8) - 1, 0);
        }
        var i = n - 1;
        var a = 1;
        for (this[e + i] = t & 255; --i >= 0 && (a *= 256);) {
          this[e + i] = t / a & 255;
        }
        return e + n;
      };
      l.prototype.writeUInt8 = function (t, e, n) {
        t = +t;
        e |= 0;
        if (!n) {
          B(this, t, e, 1, 255, 0);
        }
        if (!l.TYPED_ARRAY_SUPPORT) {
          t = Math.floor(t);
        }
        this[e] = t & 255;
        return e + 1;
      };
      l.prototype.writeUInt16LE = function (t, e, n) {
        t = +t;
        e |= 0;
        if (!n) {
          B(this, t, e, 2, 65535, 0);
        }
        if (l.TYPED_ARRAY_SUPPORT) {
          this[e] = t & 255;
          this[e + 1] = t >>> 8;
        } else {
          _(this, t, e, true);
        }
        return e + 2;
      };
      l.prototype.writeUInt16BE = function (t, e, n) {
        t = +t;
        e |= 0;
        if (!n) {
          B(this, t, e, 2, 65535, 0);
        }
        if (l.TYPED_ARRAY_SUPPORT) {
          this[e] = t >>> 8;
          this[e + 1] = t & 255;
        } else {
          _(this, t, e, false);
        }
        return e + 2;
      };
      l.prototype.writeUInt32LE = function (t, e, n) {
        t = +t;
        e |= 0;
        if (!n) {
          B(this, t, e, 4, 4294967295, 0);
        }
        if (l.TYPED_ARRAY_SUPPORT) {
          this[e + 3] = t >>> 24;
          this[e + 2] = t >>> 16;
          this[e + 1] = t >>> 8;
          this[e] = t & 255;
        } else {
          R(this, t, e, true);
        }
        return e + 4;
      };
      l.prototype.writeUInt32BE = function (t, e, n) {
        t = +t;
        e |= 0;
        if (!n) {
          B(this, t, e, 4, 4294967295, 0);
        }
        if (l.TYPED_ARRAY_SUPPORT) {
          this[e] = t >>> 24;
          this[e + 1] = t >>> 16;
          this[e + 2] = t >>> 8;
          this[e + 3] = t & 255;
        } else {
          R(this, t, e, false);
        }
        return e + 4;
      };
      l.prototype.writeIntLE = function (t, e, n, r) {
        t = +t;
        e |= 0;
        if (!r) {
          var i = Math.pow(2, n * 8 - 1);
          B(this, t, e, n, i - 1, -i);
        }
        var a = 0;
        var o = 1;
        var s = 0;
        for (this[e] = t & 255; ++a < n && (o *= 256);) {
          if (t < 0 && s === 0 && this[e + a - 1] !== 0) {
            s = 1;
          }
          this[e + a] = (t / o >> 0) - s & 255;
        }
        return e + n;
      };
      l.prototype.writeIntBE = function (t, e, n, r) {
        t = +t;
        e |= 0;
        if (!r) {
          var i = Math.pow(2, n * 8 - 1);
          B(this, t, e, n, i - 1, -i);
        }
        var a = n - 1;
        var o = 1;
        var s = 0;
        for (this[e + a] = t & 255; --a >= 0 && (o *= 256);) {
          if (t < 0 && s === 0 && this[e + a + 1] !== 0) {
            s = 1;
          }
          this[e + a] = (t / o >> 0) - s & 255;
        }
        return e + n;
      };
      l.prototype.writeInt8 = function (t, e, n) {
        t = +t;
        e |= 0;
        if (!n) {
          B(this, t, e, 1, 127, -128);
        }
        if (!l.TYPED_ARRAY_SUPPORT) {
          t = Math.floor(t);
        }
        if (t < 0) {
          t = 255 + t + 1;
        }
        this[e] = t & 255;
        return e + 1;
      };
      l.prototype.writeInt16LE = function (t, e, n) {
        t = +t;
        e |= 0;
        if (!n) {
          B(this, t, e, 2, 32767, -32768);
        }
        if (l.TYPED_ARRAY_SUPPORT) {
          this[e] = t & 255;
          this[e + 1] = t >>> 8;
        } else {
          _(this, t, e, true);
        }
        return e + 2;
      };
      l.prototype.writeInt16BE = function (t, e, n) {
        t = +t;
        e |= 0;
        if (!n) {
          B(this, t, e, 2, 32767, -32768);
        }
        if (l.TYPED_ARRAY_SUPPORT) {
          this[e] = t >>> 8;
          this[e + 1] = t & 255;
        } else {
          _(this, t, e, false);
        }
        return e + 2;
      };
      l.prototype.writeInt32LE = function (t, e, n) {
        t = +t;
        e |= 0;
        if (!n) {
          B(this, t, e, 4, 2147483647, -2147483648);
        }
        if (l.TYPED_ARRAY_SUPPORT) {
          this[e] = t & 255;
          this[e + 1] = t >>> 8;
          this[e + 2] = t >>> 16;
          this[e + 3] = t >>> 24;
        } else {
          R(this, t, e, true);
        }
        return e + 4;
      };
      l.prototype.writeInt32BE = function (t, e, n) {
        t = +t;
        e |= 0;
        if (!n) {
          B(this, t, e, 4, 2147483647, -2147483648);
        }
        if (t < 0) {
          t = 4294967295 + t + 1;
        }
        if (l.TYPED_ARRAY_SUPPORT) {
          this[e] = t >>> 24;
          this[e + 1] = t >>> 16;
          this[e + 2] = t >>> 8;
          this[e + 3] = t & 255;
        } else {
          R(this, t, e, false);
        }
        return e + 4;
      };
      l.prototype.writeFloatLE = function (t, e, n) {
        return D(this, t, e, true, n);
      };
      l.prototype.writeFloatBE = function (t, e, n) {
        return D(this, t, e, false, n);
      };
      l.prototype.writeDoubleLE = function (t, e, n) {
        return U(this, t, e, true, n);
      };
      l.prototype.writeDoubleBE = function (t, e, n) {
        return U(this, t, e, false, n);
      };
      l.prototype.copy = function (t, e, n, r) {
        n ||= 0;
        if (!r && r !== 0) {
          r = this.length;
        }
        if (e >= t.length) {
          e = t.length;
        }
        e ||= 0;
        if (r > 0 && r < n) {
          r = n;
        }
        if (r === n) {
          return 0;
        }
        if (t.length === 0 || this.length === 0) {
          return 0;
        }
        if (e < 0) {
          throw new RangeError("targetStart out of bounds");
        }
        if (n < 0 || n >= this.length) {
          throw new RangeError("sourceStart out of bounds");
        }
        if (r < 0) {
          throw new RangeError("sourceEnd out of bounds");
        }
        if (r > this.length) {
          r = this.length;
        }
        if (t.length - e < r - n) {
          r = t.length - e + n;
        }
        var i;
        var a = r - n;
        if (this === t && n < e && e < r) {
          for (i = a - 1; i >= 0; --i) {
            t[i + e] = this[i + n];
          }
        } else if (a < 1000 || !l.TYPED_ARRAY_SUPPORT) {
          for (i = 0; i < a; ++i) {
            t[i + e] = this[i + n];
          }
        } else {
          Uint8Array.prototype.set.call(t, this.subarray(n, n + a), e);
        }
        return a;
      };
      l.prototype.fill = function (t, e, n, r) {
        if (typeof t == "string") {
          if (typeof e == "string") {
            r = e;
            e = 0;
            n = this.length;
          } else if (typeof n == "string") {
            r = n;
            n = this.length;
          }
          if (t.length === 1) {
            var i = t.charCodeAt(0);
            if (i < 256) {
              t = i;
            }
          }
          if (r !== undefined && typeof r != "string") {
            throw new TypeError("encoding must be a string");
          }
          if (typeof r == "string" && !l.isEncoding(r)) {
            throw new TypeError("Unknown encoding: " + r);
          }
        } else if (typeof t == "number") {
          t &= 255;
        }
        if (e < 0 || this.length < e || this.length < n) {
          throw new RangeError("Out of range index");
        }
        if (n <= e) {
          return this;
        }
        var a;
        e >>>= 0;
        n = n === undefined ? this.length : n >>> 0;
        t ||= 0;
        if (typeof t == "number") {
          for (a = e; a < n; ++a) {
            this[a] = t;
          }
        } else {
          var o = l.isBuffer(t) ? t : Y(new l(t, r).toString());
          var s = o.length;
          for (a = 0; a < n - e; ++a) {
            this[a + e] = o[a % s];
          }
        }
        return this;
      };
      var j = /[^+\/0-9A-Za-z-_]/g;
      function H(t) {
        if (t < 16) {
          return "0" + t.toString(16);
        } else {
          return t.toString(16);
        }
      }
      function Y(t, e) {
        var n;
        e = e || Infinity;
        for (var r = t.length, i = null, a = [], o = 0; o < r; ++o) {
          if ((n = t.charCodeAt(o)) > 55295 && n < 57344) {
            if (!i) {
              if (n > 56319) {
                if ((e -= 3) > -1) {
                  a.push(239, 191, 189);
                }
                continue;
              }
              if (o + 1 === r) {
                if ((e -= 3) > -1) {
                  a.push(239, 191, 189);
                }
                continue;
              }
              i = n;
              continue;
            }
            if (n < 56320) {
              if ((e -= 3) > -1) {
                a.push(239, 191, 189);
              }
              i = n;
              continue;
            }
            n = 65536 + (i - 55296 << 10 | n - 56320);
          } else if (i && (e -= 3) > -1) {
            a.push(239, 191, 189);
          }
          i = null;
          if (n < 128) {
            if ((e -= 1) < 0) {
              break;
            }
            a.push(n);
          } else if (n < 2048) {
            if ((e -= 2) < 0) {
              break;
            }
            a.push(n >> 6 | 192, n & 63 | 128);
          } else if (n < 65536) {
            if ((e -= 3) < 0) {
              break;
            }
            a.push(n >> 12 | 224, n >> 6 & 63 | 128, n & 63 | 128);
          } else {
            if (!(n < 1114112)) {
              throw new Error("Invalid code point");
            }
            if ((e -= 4) < 0) {
              break;
            }
            a.push(n >> 18 | 240, n >> 12 & 63 | 128, n >> 6 & 63 | 128, n & 63 | 128);
          }
        }
        return a;
      }
      function W(t) {
        return r.toByteArray(function (t) {
          if ((t = function (t) {
            if (t.trim) {
              return t.trim();
            } else {
              return t.replace(/^\s+|\s+$/g, "");
            }
          }(t).replace(j, "")).length < 2) {
            return "";
          }
          while (t.length % 4 != 0) {
            t += "=";
          }
          return t;
        }(t));
      }
      function N(t, e, n, r) {
        for (var i = 0; i < r && !(i + n >= e.length) && !(i >= t.length); ++i) {
          e[i + n] = t[i];
        }
        return i;
      }
    }).call(this, n(13));
  }, function (t, e) {
    var n;
    n = function () {
      return this;
    }();
    try {
      n = n || Function("return this")() || (0, eval)("this");
    } catch (t) {
      if (typeof window == "object") {
        n = window;
      }
    }
    t.exports = n;
  }, function (t, e) {
    var n = e.uint8 = new Array(256);
    for (var r = 0; r <= 255; r++) {
      n[r] = i(r);
    }
    function i(t) {
      return function (e) {
        var n = e.reserve(1);
        e.buffer[n] = t;
      };
    }
  }, function (t, e, n) {
    e.FlexDecoder = a;
    e.FlexEncoder = o;
    var r = n(0);
    var i = "BUFFER_SHORTAGE";
    function a() {
      if (!(this instanceof a)) {
        return new a();
      }
    }
    function o() {
      if (!(this instanceof o)) {
        return new o();
      }
    }
    function s() {
      throw new Error("method not implemented: write()");
    }
    function l() {
      throw new Error("method not implemented: fetch()");
    }
    function c() {
      if (this.buffers && this.buffers.length) {
        this.flush();
        return this.pull();
      } else {
        return this.fetch();
      }
    }
    function h(t) {
      (this.buffers ||= []).push(t);
    }
    function u() {
      return (this.buffers ||= []).shift();
    }
    function f(t) {
      return function (e) {
        for (var n in t) {
          e[n] = t[n];
        }
        return e;
      };
    }
    a.mixin = f({
      bufferish: r,
      write: function (t) {
        var e = this.offset ? r.prototype.slice.call(this.buffer, this.offset) : this.buffer;
        this.buffer = e ? t ? this.bufferish.concat([e, t]) : e : t;
        this.offset = 0;
      },
      fetch: l,
      flush: function () {
        while (this.offset < this.buffer.length) {
          var t;
          var e = this.offset;
          try {
            t = this.fetch();
          } catch (t) {
            if (t && t.message != i) {
              throw t;
            }
            this.offset = e;
            break;
          }
          this.push(t);
        }
      },
      push: h,
      pull: u,
      read: c,
      reserve: function (t) {
        var e = this.offset;
        var n = e + t;
        if (n > this.buffer.length) {
          throw new Error(i);
        }
        this.offset = n;
        return e;
      },
      offset: 0
    });
    a.mixin(a.prototype);
    o.mixin = f({
      bufferish: r,
      write: s,
      fetch: function () {
        var t = this.start;
        if (t < this.offset) {
          var e = this.start = this.offset;
          return r.prototype.slice.call(this.buffer, t, e);
        }
      },
      flush: function () {
        while (this.start < this.offset) {
          var t = this.fetch();
          if (t) {
            this.push(t);
          }
        }
      },
      push: h,
      pull: function () {
        var t = this.buffers ||= [];
        var e = t.length > 1 ? this.bufferish.concat(t) : t[0];
        t.length = 0;
        return e;
      },
      read: c,
      reserve: function (t) {
        var e = t | 0;
        if (this.buffer) {
          var n = this.buffer.length;
          var r = this.offset | 0;
          var i = r + e;
          if (i < n) {
            this.offset = i;
            return r;
          }
          this.flush();
          t = Math.max(t, Math.min(n * 2, this.maxBufferSize));
        }
        t = Math.max(t, this.minBufferSize);
        this.buffer = this.bufferish.alloc(t);
        this.start = 0;
        this.offset = e;
        return 0;
      },
      send: function (t) {
        var e = t.length;
        if (e > this.minBufferSize) {
          this.flush();
          this.push(t);
        } else {
          var n = this.reserve(e);
          r.prototype.copy.call(t, this.buffer, n);
        }
      },
      maxBufferSize: 65536,
      minBufferSize: 2048,
      offset: 0,
      start: 0
    });
    o.mixin(o.prototype);
  }, function (t, e, n) {
    e.decode = function (t, e) {
      var n = new r(e);
      n.write(t);
      return n.read();
    };
    var r = n(17).DecodeBuffer;
  }, function (t, e, n) {
    e.DecodeBuffer = i;
    var r = n(8).preset;
    function i(t) {
      if (!(this instanceof i)) {
        return new i(t);
      }
      if (t && (this.options = t, t.codec)) {
        var e = this.codec = t.codec;
        if (e.bufferish) {
          this.bufferish = e.bufferish;
        }
      }
    }
    n(15).FlexDecoder.mixin(i.prototype);
    i.prototype.codec = r;
    i.prototype.fetch = function () {
      return this.codec.decode(this);
    };
  }, function (t, e, n) {
    var r = n(5);
    var i = n(7);
    var a = i.Uint64BE;
    var o = i.Int64BE;
    e.getReadFormat = function (t) {
      var e = s.hasArrayBuffer && t && t.binarraybuffer;
      var n = t && t.int64;
      return {
        map: c && t && t.usemap ? f : u,
        array: d,
        str: p,
        bin: e ? y : m,
        ext: v,
        uint8: g,
        uint16: w,
        uint32: S,
        uint64: M(8, n ? C : E),
        int8: x,
        int16: b,
        int32: k,
        int64: M(8, n ? A : I),
        float32: M(4, T),
        float64: M(8, P)
      };
    };
    e.readUint8 = g;
    var s = n(0);
    var l = n(6);
    var c = typeof Map != "undefined";
    var h = true;
    function u(t, e) {
      var n;
      var r = {};
      var i = new Array(e);
      var a = new Array(e);
      var o = t.codec.decode;
      for (n = 0; n < e; n++) {
        i[n] = o(t);
        a[n] = o(t);
      }
      for (n = 0; n < e; n++) {
        r[i[n]] = a[n];
      }
      return r;
    }
    function f(t, e) {
      var n;
      var r = new Map();
      var i = new Array(e);
      var a = new Array(e);
      var o = t.codec.decode;
      for (n = 0; n < e; n++) {
        i[n] = o(t);
        a[n] = o(t);
      }
      for (n = 0; n < e; n++) {
        r.set(i[n], a[n]);
      }
      return r;
    }
    function d(t, e) {
      var n = new Array(e);
      var r = t.codec.decode;
      for (var i = 0; i < e; i++) {
        n[i] = r(t);
      }
      return n;
    }
    function p(t, e) {
      var n = t.reserve(e);
      var r = n + e;
      return l.toString.call(t.buffer, "utf-8", n, r);
    }
    function m(t, e) {
      var n = t.reserve(e);
      var r = n + e;
      var i = l.slice.call(t.buffer, n, r);
      return s.from(i);
    }
    function y(t, e) {
      var n = t.reserve(e);
      var r = n + e;
      var i = l.slice.call(t.buffer, n, r);
      return s.Uint8Array.from(i).buffer;
    }
    function v(t, e) {
      var n = t.reserve(e + 1);
      var r = t.buffer[n++];
      var i = n + e;
      var a = t.codec.getExtUnpacker(r);
      if (!a) {
        throw new Error("Invalid ext type: " + (r ? "0x" + r.toString(16) : r));
      }
      return a(l.slice.call(t.buffer, n, i));
    }
    function g(t) {
      var e = t.reserve(1);
      return t.buffer[e];
    }
    function x(t) {
      var e = t.reserve(1);
      var n = t.buffer[e];
      if (n & 128) {
        return n - 256;
      } else {
        return n;
      }
    }
    function w(t) {
      var e = t.reserve(2);
      var n = t.buffer;
      return n[e++] << 8 | n[e];
    }
    function b(t) {
      var e = t.reserve(2);
      var n = t.buffer;
      var r = n[e++] << 8 | n[e];
      if (r & 32768) {
        return r - 65536;
      } else {
        return r;
      }
    }
    function S(t) {
      var e = t.reserve(4);
      var n = t.buffer;
      return n[e++] * 16777216 + (n[e++] << 16) + (n[e++] << 8) + n[e];
    }
    function k(t) {
      var e = t.reserve(4);
      var n = t.buffer;
      return n[e++] << 24 | n[e++] << 16 | n[e++] << 8 | n[e];
    }
    function M(t, e) {
      return function (n) {
        var r = n.reserve(t);
        return e.call(n.buffer, r, h);
      };
    }
    function E(t) {
      return new a(this, t).toNumber();
    }
    function I(t) {
      return new o(this, t).toNumber();
    }
    function C(t) {
      return new a(this, t);
    }
    function A(t) {
      return new o(this, t);
    }
    function T(t) {
      return r.read(this, t, false, 23, 4);
    }
    function P(t) {
      return r.read(this, t, false, 52, 8);
    }
  }, function (t, e, n) {
    (function (e) {
      t.exports = e;
      var n = "listeners";
      var r = {
        on: function (t, e) {
          o(this, t).push(e);
          return this;
        },
        once: function (t, e) {
          var n = this;
          r.originalListener = e;
          o(n, t).push(r);
          return n;
          function r() {
            a.call(n, t, r);
            e.apply(this, arguments);
          }
        },
        off: a,
        emit: function (t, e) {
          var n = this;
          var r = o(n, t, true);
          if (!r) {
            return false;
          }
          var i = arguments.length;
          if (i === 1) {
            r.forEach(function (t) {
              t.call(n);
            });
          } else if (i === 2) {
            r.forEach(function (t) {
              t.call(n, e);
            });
          } else {
            var a = Array.prototype.slice.call(arguments, 1);
            r.forEach(function (t) {
              t.apply(n, a);
            });
          }
          return !!r.length;
        }
      };
      function i(t) {
        for (var e in r) {
          t[e] = r[e];
        }
        return t;
      }
      function a(t, e) {
        var r;
        if (arguments.length) {
          if (e) {
            if (r = o(this, t, true)) {
              if (!(r = r.filter(function (t) {
                return t !== e && t.originalListener !== e;
              })).length) {
                return a.call(this, t);
              }
              this[n][t] = r;
            }
          } else if ((r = this[n]) && (delete r[t], !Object.keys(r).length)) {
            return a.call(this);
          }
        } else {
          delete this[n];
        }
        return this;
      }
      function o(t, e, r) {
        if (!r || t[n]) {
          var i = t[n] ||= {};
          return i[e] ||= [];
        }
      }
      i(e.prototype);
      e.mixin = i;
    })(
    /**
     * event-lite.js - Light-weight EventEmitter (less than 1KB when gzipped)
     *
     * @copyright Yusuke Kawasaki
     * @license MIT
     * @constructor
     * @see https://github.com/kawanet/event-lite
     * @see http://kawanet.github.io/event-lite/EventLite.html
     * @example
     * var EventLite = require("event-lite");
     *
     * function MyClass() {...}             // your class
     *
     * EventLite.mixin(MyClass.prototype);  // import event methods
     *
     * var obj = new MyClass();
     * obj.on("foo", function() {...});     // add event listener
     * obj.once("bar", function() {...});   // add one-time event listener
     * obj.emit("foo");                     // dispatch event
     * obj.emit("bar");                     // dispatch another event
     * obj.off("foo");                      // remove event listener
     */
    function t() {
      if (!(this instanceof t)) {
        return new t();
      }
    });
  }, function (t, e) {
    var n = {
      utf8: {
        stringToBytes: function (t) {
          return n.bin.stringToBytes(unescape(encodeURIComponent(t)));
        },
        bytesToString: function (t) {
          return decodeURIComponent(escape(n.bin.bytesToString(t)));
        }
      },
      bin: {
        stringToBytes: function (t) {
          var e = [];
          for (var n = 0; n < t.length; n++) {
            e.push(t.charCodeAt(n) & 255);
          }
          return e;
        },
        bytesToString: function (t) {
          var e = [];
          for (var n = 0; n < t.length; n++) {
            e.push(String.fromCharCode(t[n]));
          }
          return e.join("");
        }
      }
    };
    t.exports = n;
  }, function (t, e, n) {
    "use strict";

    var r = n(9);
    var i = n(22);
    var a = n(23);
    var o = new (n(39))("foes.io", 8080, i.maxPlayers, i.playerSpread, false);
    var s = null;
    var l = false;
    function c(t) {
      var e = Array.prototype.slice.call(arguments, 1);
      var n = a.encode([t, e]);
      s.send(n);
    }
    function h() {
      return s && l;
    }
    Math.lerpAngle = function (t, e, n) {
      var r = Math.abs(e - t);
      var i = Math.PI * 2;
      if (r > Math.PI) {
        if (t > e) {
          e += i;
        } else {
          t += i;
        }
      }
      var a = e + (t - e) * n;
      if (a >= 0 && a <= i) {
        return a;
      } else {
        return a % i;
      }
    };
    Number.prototype.round = function (t) {
      return +this.toFixed(t);
    };
    CanvasRenderingContext2D.prototype.roundRect = function (t, e, n, r, i) {
      if (n < i * 2) {
        i = n / 2;
      }
      if (r < i * 2) {
        i = r / 2;
      }
      if (i < 0) {
        i = 0;
      }
      this.beginPath();
      this.moveTo(t + i, e);
      this.arcTo(t + n, e, t + n, e + r, i);
      this.arcTo(t + n, e + r, t, e + r, i);
      this.arcTo(t, e + r, t, e, i);
      this.arcTo(t, e, t + n, e, i);
      this.closePath();
      return this;
    };
    var u;
    var f;
    var d;
    var p;
    var m;
    var y;
    var v;
    var g;
    var x = document.getElementById("mainCanvas");
    var w = x.getContext("2d");
    var b = n(50).obj;
    var S = n(51);
    var k = n(52).obj;
    var M = n(53).data;
    var E = n(54).data;
    var I = n(55).data;
    var C = n(56).data;
    var A = n(57).list;
    var T = n(58).obj;
    var P = n(59).obj;
    var O = n(60).TextManager;
    var B = n(61).obj;
    var _ = n(62).obj;
    var R = n(63).obj;
    var L = n(64).obj;
    var D = n(65).obj;
    var U = new (0, n(66).obj)(A, r, i);
    var j = n(67).obj;
    new (0, n(68).obj)(r);
    var H = null;
    var Y = 1;
    var W = 0;
    var N = 0;
    var F = 0;
    var X = 0;
    var V = 1;
    var q = 1;
    var K = 0;
    var z = 0;
    var G = 0;
    var Z = 0;
    var $ = 0;
    var J = 0;
    var Q = {
      id: -1,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0
    };
    var tt = {
      id: -1,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0
    };
    var et = 0;
    var nt = 0;
    var rt = 0;
    var it = true;
    var at = 0;
    var ot = "#454545";
    var st = "#ff5b5b";
    var lt = {};
    var ct = [];
    var ht = [];
    var ut = [];
    var ft = (It("foes_nativeResolution") == "true" || It("foes_nativeResolution") == undefined && Rt()) && window.devicePixelRatio || 1;
    var dt = new P(ct, k, M, I, r, i);
    var pt = new O();
    var mt = [];
    var yt = new _(i, r, B, mt, M);
    var vt = [];
    var gt = new L(i, r, vt, R);
    var xt = "webkitSpeechRecognition" in window;
    var wt = false;
    var bt = "";
    function St(t) {
      if (g && f && f.alive) {
        voiceDisplay.style.display = t ? "block" : "none";
        if (t && !wt) {
          wt = true;
          bt = "";
          g.start();
        } else {
          g.stop();
        }
      }
    }
    if (xt) {
      (g = new webkitSpeechRecognition()).continuous = true;
      g.interimResults = false;
      g.lang = "en-US";
      g.onresult = function (t) {
        if (f && f.alive && (bt = r.truncateText(t.results[0][0].transcript, i.chatMax)).length && h()) {
          c("4", bt);
        }
      };
      g.onend = function () {
        wt = false;
      };
      g.onerror = function (t) {
        St(false);
      };
    }
    var kt = true;
    window.onload = function () {
      Wn();
    };
    window.onblur = function () {
      kt = false;
    };
    window.onfocus = function () {
      kt = true;
      Ct = {};
      if (h()) {
        c("rk");
      }
    };
    var Mt = typeof Storage != "undefined";
    function Et(t, e) {
      if (Mt !== false) {
        localStorage.setItem(t, e.toString());
      }
    }
    function It(t) {
      return Mt !== false && localStorage.getItem(t) || null;
    }
    var Ct = {};
    function At(t, e) {
      if (f && f.alive && h() && (e && !Ct[t] || !e && Ct[t])) {
        Ct[t] = e;
        if (!function (t, e) {
          return !!xt && t == 86 && (St(e), true);
        }(t, e) && !function (t, e) {
          return !!e && t == 81 && (Ft(1), true);
        }(t, e) && !function (t, e) {
          if ((p = S.keys.indexOf(t)) >= 0) {
            c("2", p, e);
          }
        }(t, e) && !!S.moveKeys[t]) {
          (function () {
            var t = 0;
            var e = 0;
            for (var n in S.moveKeys) {
              if (Ct[n] == 1) {
                t += S.moveKeys[n].d[0];
                e += S.moveKeys[n].d[1];
              }
            }
            if (t == 0 && e == 0) {
              Tt(undefined);
            } else {
              Tt(Math.atan2(e, t));
            }
          })();
        }
      }
    }
    function Tt(t) {
      c("0", t);
    }
    window.addEventListener("keydown", function (t) {
      At(t.which || t.keyCode || 0, 1);
      _t(false);
    });
    window.addEventListener("keyup", function (t) {
      At(t.which || t.keyCode || 0, 0);
      _t(false);
    });
    n(69).attach(document.body);
    var Pt;
    var Ot = 50;
    var Bt = 60;
    function _t(t) {
      Pt = t;
      weaponDisplay.style.pointerEvents = t ? "all" : "none";
      ammoDisplay.style.pointerEvents = t ? "all" : "none";
    }
    function Rt() {
      return localStorage.usingCordova == "true" || window.cordova != undefined;
    }
    function Lt() {
      At(70, 1);
      setTimeout(function () {
        At(70, 0);
      }, 50);
    }
    function Dt(t) {
      t.preventDefault();
      t.stopPropagation();
      _t(true);
      for (var e = 0; e < t.changedTouches.length; e++) {
        var n = t.changedTouches[e];
        if (n.identifier == Q.id) {
          Q.id = -1;
          if (f.vehicle) {
            Ut();
          } else {
            Tt(undefined);
          }
        } else if (n.identifier == tt.id) {
          tt.id = -1;
          if (f.vehicle) {
            Ut();
          } else {
            Wt(0);
          }
        }
      }
    }
    function Ut() {
      var t = 0;
      var e = 0;
      if (Q.id != -1) {
        e = (Q.currentY - Q.startY) / Bt;
      }
      if (tt.id != -1) {
        t = (tt.currentX - tt.startX) / Bt;
      }
      t *= Math.cos(Math.PI / 4);
      e *= Math.sin(Math.PI / 4);
      Tt(t == 0 && e == 0 ? undefined : Math.atan2(e, t));
    }
    _t(false);
    window.setUsingTouch = _t;
    document.addEventListener("touchstart", function (t) {
      _t(true);
    }, true);
    x.addEventListener("touchmove", function (t) {
      t.preventDefault();
      t.stopPropagation();
      _t(true);
      var e = Ot;
      for (var n = 0; n < t.changedTouches.length; n++) {
        var r = t.changedTouches[n];
        if (r.identifier == Q.id) {
          Q.currentX = r.pageX;
          Q.currentY = r.pageY;
          if (f.vehicle) {
            Ut();
          } else {
            var i = Q.currentX - Q.startX;
            var a = Q.currentY - Q.startY;
            var o = Math.atan2(a, i);
            var s = Math.sqrt(Math.pow(i, 2) + Math.pow(a, 2));
            Tt(o);
            var l = s > e;
            At(S.keys[0], l ? 1 : 0);
          }
        } else if (r.identifier == tt.id) {
          tt.currentX = r.pageX;
          tt.currentY = r.pageY;
          if (f.vehicle) {
            Ut();
          } else {
            i = tt.currentX - tt.startX;
            a = tt.currentY - tt.startY;
            $ = i / Bt * kn / 2 + kn / 2;
            J = a / Bt * kn / 2 + Mn / 2;
            Wt((s = Math.sqrt(Math.pow(i, 2) + Math.pow(a, 2))) > e ? 1 : 0);
          }
        }
      }
    }, false);
    x.addEventListener("touchstart", function (t) {
      t.preventDefault();
      t.stopPropagation();
      _t(true);
      for (var e = 0; e < t.changedTouches.length; e++) {
        var n = t.changedTouches[e];
        if (Math.sqrt(Math.pow(n.pageX - kn / 2, 2) + Math.pow(n.pageY - Mn / 2, 2)) < 60) {
          Lt();
        } else if (n.pageX < document.body.scrollWidth / 2 && Q.id == -1) {
          Q.id = n.identifier;
          Q.startX = Q.currentX = n.pageX;
          Q.startY = Q.currentY = n.pageY;
        } else if (n.pageX > document.body.scrollWidth / 2 && tt.id == -1) {
          tt.id = n.identifier;
          tt.startX = tt.currentX = n.pageX;
          tt.startY = tt.currentY = n.pageY;
        }
      }
    }, false);
    x.addEventListener("touchend", Dt, false);
    x.addEventListener("touchcancel", Dt, false);
    x.addEventListener("touchleave", Dt, false);
    var jt = false;
    var Ht = 0;
    var Yt = 0;
    function Wt(t) {
      if (f && h() && Ht != t) {
        Ht = t;
        if (t) {
          c("1", r.fixTo(et, 2), 1);
        } else {
          c("1", null, 0);
        }
      }
    }
    function Nt(t) {
      if (f && f.alive) {
        (t = window.event || t).preventDefault();
        Ft(Math.max(-1, Math.min(1, t.wheelDelta || -t.detail)));
      }
    }
    function Ft(t) {
      if ((Yt += t) >= f.weapons.length) {
        Yt = 0;
      } else if (Yt < 0) {
        Yt = f.weapons.length - 1;
      }
      jt = true;
    }
    window.addEventListener("mousemove", function (t) {
      t.preventDefault();
      t.stopPropagation();
      $ = t.clientX;
      J = t.clientY;
      if (mn) {
        hoverDisplay.style.left = $ + 20 + "px";
        hoverDisplay.style.top = J + "px";
      }
    }, false);
    x.addEventListener("mousedown", function () {
      Wt(1);
    }, false);
    x.addEventListener("mouseup", function (t) {
      t.preventDefault();
      Wt(0);
    }, false);
    if (x.addEventListener) {
      x.addEventListener("mousewheel", Nt, false);
      x.addEventListener("DOMMouseScroll", Nt, false);
    } else {
      x.attachEvent("onmousewheel", Nt);
    }
    var Xt = new D(i, r);
    function Vt(t, e, n) {
      p = dt.findBySid(e);
      if (d) {
        Xt.playAt(Xt.IDList[t], p.x, p.y, n || 1.3);
      }
    }
    function qt(t) {
      if (t == undefined) {
        t = !Xt.active;
      }
      Xt.active = t;
      Xt.toggleMute("menu", !t);
      soundSetting.innerHTML = t ? "<i class='material-icons' style='color:#fff;font-size:45px'>&#xE050;</i>" : "<i class='material-icons' style='color:#fff;font-size:45px'>&#xE04F;</i>";
      Et("foes_mus", t ? 1 : 0);
    }
    var Kt = [{
      name: "showBlood",
      display: "Show Blood",
      val: true
    }, {
      name: "showLeaves",
      display: "Show Leaves",
      val: true
    }, {
      name: "showParticles",
      display: "Show Particles",
      val: true
    }, {
      name: "showChat",
      display: "Show Chat",
      val: true
    }, {
      name: "showUI",
      display: "Show UI",
      val: true
    }, {
      name: "nativeResolution",
      display: "Use native resolution (needs reload)",
      val: Rt(),
      onChange: function (t) {
        location.reload();
      }
    }];
    function zt(t) {
      return (t ? "âœ”" : "âœ–") + " ";
    }
    if (Rt()) {
      Kt.push({
        name: "aimAssist",
        display: "Aim assist (only on mobile)",
        val: Rt()
      });
    }
    var Gt = true;
    function Zt(t, e, n, a, o, s, l) {
      ct.length = 0;
      (function () {
        for (var t = ht.length - 1; t >= 0; t--) {
          if (!ht[t].local || !!Gt) {
            ht.splice(t, 1);
          }
        }
      })();
      Gt = false;
      Ct = {};
      Ht = 0;
      Yt = 0;
      ce = 0;
      ke = 0;
      if (!(f = null)) {
        f = dt.addPlayer(0, t);
      }
      if (it) {
        it = false;
        (function () {
          var t = i.mapScale * 2 / i.areaCount;
          var e = -i.mapScale;
          var n = -i.mapScale;
          for (var a = 0; a < i.areaCount; ++a) {
            for (var o = 0; o < i.areaCount; ++o) {
              for (var s = 0; s < i.rockCount + 1; ++s) {
                var l = r.randInt(e, e + t);
                var c = r.randInt(n, n + t);
                if (an(l, c, A[5].scale)) {
                  nn(new T(), l, c, r.randFloat(-Math.PI, Math.PI), r.randInt(4, 6));
                }
              }
              n += t;
            }
            n = -i.mapScale;
            e += t;
          }
        })();
      }
      f.init(e, n, a);
      rn(n, a);
      le(f.weaponIndex, f.scrollIndex);
      se(f.effects);
      oe();
      fe(0);
      ae(f.stamina);
      f.alive = l;
      W = o;
      N = s;
      F = 0;
      X = 0;
      V = 1;
      q = 1;
      Y = 1;
      K = 0;
      Jt(null, 0, 0);
      if (Kt[4].val) {
        uiContainer.style.display = "block";
        sharedUI.style.display = "block";
      }
      spectateText.style.display = "block";
      playAgainButton.style.display = "none";
      gameOverMessage.style.display = "none";
      Tn();
      Me();
      Xt.stop("menu");
      Xt.play("ambient", 0.2, true);
      if (l) {
        Xt.play("horn", 0.1);
      } else {
        cn();
      }
    }
    function $t(t) {
      darkener.style.display = "block";
      playAgainButton.style.display = "inline-block";
      spectateText.style.display = "none";
      deathMessage.style.display = "none";
      gameOverMessage.style.display = "block";
      gameOverMessage.innerHTML = t ? "VICTORY" : "GAME OVER";
      ln = 0;
      setTimeout(function () {
        (function () {
          var t = ++Xn > 1;
          var e = Date.now() - Nn > Fn;
          if (t && e) {
            console.log("Showing");
            if (window.admob) {
              window.admob.requestInterstitialAd();
            }
          }
        })();
      }, 1000);
    }
    function Jt(t, e, n) {
      if (t != null) {
        V = Y;
        q = t;
        K = 0;
      }
      if (e != null && e != undefined) {
        borderTimer.innerHTML = e > 0 ? "00:" + (e >= 10 ? e : "0" + e) : "00:00";
      }
      if (n != undefined) {
        z = n;
      }
    }
    function Qt(t) {
      playerCount.innerHTML = t + " Alive";
    }
    function te(t) {
      var e;
      e = t ? t == i.roundTimer ? "waiting for players" : "match starting in :" + Math.ceil(t / 1000) : "match in progress";
      roundTimerMenu.innerHTML = e;
      roundTimerDisplay.innerHTML = e;
      roundTimerDisplay.style.display = t ? "block" : "none";
    }
    function ee(t, e) {
      var n = dt.findBySid(t);
      if (n) {
        n.health = e;
        if (e <= 0) {
          n.visible = false;
        }
      }
    }
    staminaHolder.width = 400;
    staminaHolder.height = 25;
    var ne = staminaHolder.getContext("2d");
    var re = 0;
    var ie = 0;
    function ae(t) {
      if (f) {
        f.stamina = t;
        var e = !M[f.weaponIndex].melee || t >= M[f.weaponIndex].dmg * i.dmgToStam ? "#fff" : st;
        if (re != t || ie != e) {
          ie = e;
          re = t;
          ne.fillStyle = e;
          ne.clearRect(0, 0, 400, 25);
          ne.fillRect(0, 0, t / f.maxStamina * 400, 25);
        }
      }
    }
    function oe(t, e) {
      if (f) {
        f.ammos[t] = e;
        ammoDisplay.innerHTML = e + " Ammo";
      }
    }
    function se(t, e) {
      var n = "";
      if (f) {
        if (e) {
          f.effectTimers[e] = I[e].duration || 0;
        }
        if (t) {
          f.effects = t;
        }
        for (var r = 0; r < f.effects.length; ++r) {
          if (p = f.effects[r]) {
            n += "<div class='effectIconG'><div id='pTimer" + p + "' class='pTimer'>" + f.effectTimers[p] + "s</div><img src='./images/sprites/effects/effect_" + p + ".png' class='effectIcon'/></div>";
          }
        }
      }
      effectsList.innerHTML = n;
    }
    function le(t, e, n) {
      if (f) {
        p = M[t];
        f.weapons = n || f.weapons;
        f.weaponIndex = t;
        f.scrollIndex = e;
        ammoDisplay.style.display = p.ammo ? "block" : "none";
        if (!p.melee) {
          oe(f.scrollIndex, f.ammos[f.scrollIndex]);
        }
        var r = "";
        for (var i = 0; i < f.weapons.length; ++i) {
          (p = M[f.weapons[i]]).iconScale;
          r += "<img class='weaponItem" + (f.scrollIndex == i ? " activeWpn" : "") + "' src='.././images/sprites/weapons/icons/weapon_" + f.weapons[i] + ".png'/>";
        }
        weaponDisplay.innerHTML = r;
        ae(f.stamina);
      }
    }
    var ce = 0;
    var he = ["ENEMY KILLED", "DOUBLE KILL", "TRIPLE KILL", "QUAD KILL", "PENTA KILL", "ULTRA KILL", "MEGA KILL", "OCTA KILL", "SUPER KILL", "DECA KILL", "SLAUGHTER", "GODLIKE"];
    function ue(t, e) {
      Xt.play("kill", 2);
      if (f) {
        if (e) {
          (function (t, e) {
            if (kt && f && f.alive) {
              pt.animateDiv(killText, t, 100, 1000);
              if (e) {
                pt.animateDiv(killInfo, e, 50, 1000);
              }
            }
          })(he[Math.min(ce, he.length - 1)], ce + 1 + " Kills");
          Ne(Math.PI / 2, 3);
          ce++;
        }
        if (f.sid == t) {
          f.alive = false;
        }
      }
    }
    function fe(t) {
      killCount.innerHTML = t + (t == 1 ? " Kill" : " Kills");
    }
    var de;
    var pe = ["#fff", st, "#8ecc51"];
    function me(t, e, n, i) {
      if (kt && f && f.alive) {
        pt.showText(t, e, 60, 0.18, 500, r.isString(n) ? n : Math.abs(n), pe[i || 0]);
      }
    }
    function ye(t, e) {
      if (Kt[3].val && (p = dt.findBySid(t))) {
        p.chatCooldown = i.chatDuration;
        p.chatMsg = e;
        (function (t, e, n) {
          if (de && Xt.active) {
            var a = r.getDistance(Xt.xListen, Xt.yListen, e, n);
            if (a <= i.voiceDistance) {
              speechSynthesis.cancel();
              de.text = t;
              de.volume = Math.min(1, (i.voiceDistance - a) / i.voiceDistance) * 0.2;
              speechSynthesis.speak(de);
            }
          }
        })(e, p.x, p.y);
      }
    }
    function ve(t) {
      return (f != t || t.vehicle ? t.dir : et) - (t.animType && !t.vehicle && t.dirPlus || 0);
    }
    function ge(t, e, n, r) {
      w.save();
      w.setTransform(1, 0, 0, 1, 0, 0);
      w.scale(ft, ft);
      var i = n - t;
      var a = r - e;
      var o = Math.sqrt(Math.pow(i, 2) + Math.pow(a, 2));
      var s = Ot;
      var l = Bt;
      var c = o > s;
      if (f.vehicle) {
        var h = l * Math.cos(Math.PI / 4);
        w.lineWidth = 14;
        w.lineCap = "round";
        w.beginPath();
        if (t < kn / 2) {
          w.moveTo(t, e - h);
          w.lineTo(t, e + h);
        } else {
          w.moveTo(t - h, e);
          w.lineTo(t + h, e);
        }
        w.strokeStyle = "rgba(255, 255, 255, 0.3)";
        w.stroke();
        w.beginPath();
        if (t < kn / 2) {
          var u = Math.min(Math.abs(a), h) * Math.sign(a);
          w.arc(t, e + u, 12, 0, Math.PI * 2, false);
        } else {
          u = Math.min(Math.abs(i), h) * Math.sign(i);
          w.arc(t + u, e, 12, 0, Math.PI * 2, false);
        }
        w.closePath();
        w.fillStyle = "white";
        w.fill();
      } else {
        w.beginPath();
        w.arc(t, e, l, 0, Math.PI * 2, false);
        w.closePath();
        w.fillStyle = c ? "rgba(255, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.2)";
        w.fill();
        w.beginPath();
        w.arc(t, e, s, 0, Math.PI * 2, false);
        w.closePath();
        w.fillStyle = c ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)";
        w.fill();
        var d = i;
        var p = a;
        var m = Math.sqrt(Math.pow(d, 2) + Math.pow(p, 2));
        var y = m > l ? m / l : 1;
        d /= y;
        p /= y;
        w.beginPath();
        w.arc(t + d, e + p, l * 0.5, 0, Math.PI * 2, false);
        w.closePath();
        w.fillStyle = "white";
        w.fill();
      }
      w.restore();
    }
    function xe(t, e, n) {
      w.beginPath();
      w.arc(t, e, n, 0, Math.PI * 2, false);
      w.closePath();
      w.fill();
    }
    if ("speechSynthesis" in window) {
      (de = new SpeechSynthesisUtterance()).pitch = 1.1;
      speechSynthesis.onvoiceschanged = function () {
        de.voice = window.speechSynthesis.getVoices()[6];
      };
    }
    var we = {};
    minimap.width = minimap.height = 160;
    var be = minimap.getContext("2d");
    be.fillStyle = st;
    be.lineWidth = 3;
    var Se;
    var ke = 0;
    function Me() {
      if (f) {
        be.clearRect(0, 0, minimap.width, minimap.height);
        for (var t = 0; t < U.objects.length; ++t) {
          p = U.objects[t];
          var e = we[p.type];
          if (!e) {
            e = Ee(".././images/sprites/map/" + p.type + ".png");
            we[p.type] = e;
          }
          if (e.isLoaded) {
            var n = p.w / (i.mapScale * 2) * minimap.width;
            var r = p.h / (i.mapScale * 2) * minimap.height;
            be.drawImage(e, (p.x + i.mapScale) / (i.mapScale * 2) * minimap.width - n, (p.y + i.mapScale) / (i.mapScale * 2) * minimap.height - r, n * 2, r * 2);
          }
        }
        be.beginPath();
        be.arc((f.x + i.mapScale) / (i.mapScale * 2) * minimap.width, (f.y + i.mapScale) / (i.mapScale * 2) * minimap.height, 3.5, 0, Math.PI * 2, false);
        be.closePath();
        be.fill();
        if (Y < 1) {
          var a = (W * (1 - i.mapShrinks[z]) + i.mapScale) / (i.mapScale * 2) * minimap.width;
          var o = (N * (1 - i.mapShrinks[z]) + i.mapScale) / (i.mapScale * 2) * minimap.height;
          if (i.mapShrinks[z]) {
            be.strokeStyle = "#fff";
            var s = minimap.width / 2 * i.mapShrinks[z];
            be.beginPath();
            be.rect(a - s, o - s, s * 2, s * 2);
            be.closePath();
            be.stroke();
          }
          a = (F + i.mapScale) / (i.mapScale * 2) * minimap.width;
          o = (X + i.mapScale) / (i.mapScale * 2) * minimap.height;
          be.strokeStyle = st;
          s = minimap.width / 2 * Y;
          be.beginPath();
          be.rect(a - s, o - s, s * 2, s * 2);
          be.closePath();
          be.stroke();
        }
      }
    }
    function Ee(t) {
      var e = new Image();
      e.onload = function () {
        this.isLoaded = true;
        this.onload = null;
      };
      e.src = t;
      return e;
    }
    var Ie = {};
    var Ce = {};
    var Ae = {};
    var Te = {};
    function Pe(t, e, n) {
      (e = e || w).rotate(ve(t));
      if (!t.vehicle) {
        if (!(Oe = Ae[0])) {
          Oe = Ee(".././images/sprites/player/shoe_0.png");
          Ae[0] = Oe;
        }
        if (Oe.isLoaded) {
          e.save();
          e.rotate(t.animType && t.dirPlus || 0);
          e.drawImage(Oe, 4 + t.stepOffset - i.footScale, -i.footOffset - i.footScale, i.footScale * 2, i.footScale * 2);
          e.drawImage(Oe, 4 - t.stepOffset - i.footScale, i.footOffset - i.footScale, i.footScale * 2, i.footScale * 2);
          e.restore();
        }
      }
      var r = t.vehicle ? 0 : t.weaponIndex;
      e.save();
      if (!t.animType) {
        e.translate(-t.dirPlus * 2.7, 0);
      }
      if (!n && !!M[r].melee && !M[r].renderAtop) {
        _e(r);
      }
      if (!(Oe = Ie[M[r].stance + "_" + t.shirtIndex])) {
        Oe = Ee(".././images/sprites/player/arms_" + t.shirtIndex + "_" + M[r].stance + ".png");
        Ie[M[r].stance + "_" + t.shirtIndex] = Oe;
      }
      if (Oe.isLoaded) {
        e.drawImage(Oe, i.armOffset - i.armScale, -i.armScale, i.armScale * 2, i.armScale * 2);
      }
      if (!n && (!M[r].melee || !!M[r].renderAtop)) {
        _e(r);
      }
      e.restore();
      if (t.animType && !t.vehicle) {
        e.rotate(i.headTilt * (t.dirPlus || 0));
      }
      if (t.backpackIndex > 0) {
        if (!(Oe = Te[t.backpackIndex])) {
          Oe = Ee(".././images/sprites/backpacks/pack_" + (t.backpackIndex - 1) + ".png");
          Te[t.backpackIndex] = Oe;
        }
        if (Oe.isLoaded) {
          e.drawImage(Oe, -i.backScale - i.backOffset, -i.backScale, i.backScale * 2, i.backScale * 2);
        }
      }
      Se ||= Ee(".././images/sprites/player/head_1.png");
      if (Se.isLoaded) {
        e.drawImage(Se, -t.scale, -t.scale, t.scale * 2, t.scale * 2);
      }
      if (!(Oe = Ce[t.hatIndex])) {
        Oe = Ee(".././images/sprites/hats/hat_" + t.hatIndex + ".png");
        Ce[t.hatIndex] = Oe;
      }
      if (Oe.isLoaded) {
        e.drawImage(Oe, -t.scale + (E[t.hatIndex].xOff || 0), -t.scale, t.scale * 2, t.scale * 2);
      }
    }
    var Oe;
    var Be = {};
    function _e(t, e) {
      p = M[t];
      if (!(Oe = Be[t])) {
        Oe = Ee(".././images/sprites/weapons/weapon_" + t + ".png");
        Be[t] = Oe;
      }
      if (Oe.isLoaded) {
        w.save();
        if (!e) {
          w.translate(p.xOff, p.yOff);
        }
        if (!p.melee) {
          w.rotate(-Math.PI / 2);
        }
        w.drawImage(Oe, -Oe.width * p.scale, -Oe.height * p.scale, Oe.width * p.scale * 2, Oe.height * p.scale * 2);
        w.restore();
      }
    }
    function Re(t, e, n, r) {
      return t + (r = r || n) >= 0 && t - r <= Dn && e + n >= 0 && e - n <= Un;
    }
    var Le = {};
    function De(t, e, n, r, i) {
      for (var a = 0; a < r.length; ++a) {
        if (!(p = r[a]).layer && t == 0 || t == p.layer) {
          if (p.update) {
            p.update(m);
          }
          if (p.recycle) {
            p.recycle(e, n);
          }
          je(p, e, n, i);
        }
      }
    }
    function Ue(t) {
      if (p = Qe(t)) {
        p.wiggleCounter = 500;
      }
    }
    function je(t, e, n, r) {
      if (t.active && Re(t.x - e, t.y - n, t.scale, t.scale)) {
        if (t.skipRender) {
          t.skipRender = false;
        } else {
          w.save();
          if (t.alpha != undefined) {
            w.globalAlpha = t.alpha;
          }
          w.translate(t.x + (t.xWiggle || 0) - e, t.y + (t.yWiggle || 0) - n);
          w.rotate(t.dir);
          if (t.isWeapon) {
            _e(t.typeIndex, true);
          } else {
            var i = p.scale * (p.wMlt || 1);
            if (t.src) {
              if (!(Oe = Le[t.src])) {
                Oe = Ee(".././images/sprites/" + t.src + ".png");
                Le[t.src] = Oe;
              }
              if (Oe.isLoaded) {
                var a = +(t.rPad || 0);
                w.drawImage(Oe, -(t.getWidth ? t.getWidth() : t.scale) - a - (t.xOff || 0), -i - a, (t.getWidth ? t.getWidth() : t.scale) * 2 + a * 2, i * 2 + a * 2);
              }
            } else {
              w.fillRect(-p.scale, -i, p.scale * 2, i * 2);
            }
          }
          w.restore();
        }
      } else if (r) {
        t.active = false;
      }
    }
    var He = 0;
    var Ye = 0;
    var We = 0;
    function Ne(t, e) {
      Ye += e * Math.cos(t);
      We += e * Math.sin(t);
    }
    function Fe(t, e, n, r, i, a, o) {
      if (kt) {
        (p = yt.add(t, e, n, r, a - i, null)).sid = o;
        p.rangeMinus = i;
        p.deathCallback = o ? Xe : Ve;
      }
    }
    function Xe(t) {
      Ke(6, t.x, t.y, 0);
    }
    function Ve(t) {}
    function qe(t, e) {
      for (var n = 0; n < mt.length; ++n) {
        if (mt[n].sid == t) {
          mt[n].maxRange = e - mt[n].rangeMinus;
          mt[n].sid = 0;
          mt[n].deathCallback = Ve;
        }
      }
    }
    function Ke(t, e, n, r) {
      if (kt && Kt[2].val) {
        gt.add(t, e, n, r, Kt);
      }
    }
    function ze(t, e) {
      var n = dt.addPlayer(0, t);
      n.init({
        name: e[0]
      }, e[1], e[2]);
      n.maxHealth = e[3];
      n.health = e[4];
      n.shirtIndex = e[5];
      n.hatIndex = e[6];
      n.level = e[7];
      n.visible = false;
    }
    function Ge(t) {
      dt.removePlayer(dt.findBySid(t));
    }
    function Ze(t, e, n) {
      if (f) {
        f.interact = e;
      }
      dt.updatePlayers(t);
    }
    var $e = [{
      type: 1,
      angle: i.hitArc,
      playSound: true,
      ratio: 0.1
    }, {
      type: 0,
      angle: i.hitArc,
      playSound: true,
      ratio: 0.02
    }, {
      type: 1,
      angle: Math.PI * 0.6,
      index: 1
    }, {
      type: 0,
      angle: i.hitArc,
      playSound: true,
      ratio: 0.04
    }];
    function Je(t, e, n) {
      if (p = dt.findBySid(t)) {
        var r = $e[n];
        var i = M[p.weaponIndex];
        if (r.playSound && i.sound) {
          Xt.playAt(i.sound, p.x, p.y, 0.4);
        }
        p.startAnimation(e, r.type, r.angle, r.ratio, r.index);
      }
    }
    function Qe(t) {
      for (var e = 0; e < ht.length; ++e) {
        if (ht[e].sid == t) {
          return ht[e];
        }
      }
      return null;
    }
    function tn(t) {
      if (p = Qe(t)) {
        p.active = false;
      }
    }
    function en(t, e) {
      if (f) {
        if (e) {
          for (var n = 0; n < e.length;) {
            if (p = Qe(e[n])) {
              p.dt = 0;
              p.x1 = p.x;
              p.y1 = p.y;
              p.x2 = e[n + 1];
              p.y2 = e[n + 2];
              p.d1 = p.dir;
              p.d2 = e[n + 3];
              p.interpolate = true;
            }
            n += 4;
          }
        }
        if (t) {
          for (n = 0; n < t.length;) {
            if (A[t[n]].dynamic) {
              nn(Qe(t[n + 1]) || new T(r, i), t[n + 2], t[n + 3], t[n + 4], t[n], t[n + 5], t[n + 1]);
              n += 6;
            } else {
              nn(new T(r, i), t[n + 1], t[n + 2], t[n + 3], t[n]);
              n += 4;
            }
          }
        }
      }
    }
    function nn(t, e, n, r, i, a, o) {
      t.init(e, n, r.round(2), i);
      t.src = A[t.index].src + (A[t.index].chngMap ? "_" + at : "");
      t.layer = A[t.index].layer;
      t.local = A[t.index].local;
      t.isWeapon = A[t.index].isWeapon;
      t.isPickup = A[t.index].isPickup;
      t.scale = A[t.index].scale;
      t.width = A[t.index].width;
      t.rPad = A[t.index].rPad;
      t.typeIndex = a || 0;
      t.interpolate = false;
      if (o !== undefined) {
        t.sid = o;
      }
      if (ht.indexOf(t) < 0) {
        ht.push(t);
      }
    }
    function rn(t, e) {
      if (!ut.length) {
        for (var n = 0; n < i.recycleObjects; ++n) {
          ut.push(new j(r, i));
        }
      }
      var a = -i.maxScreenWidth / 2;
      var o = i.maxScreenWidth / ut.length;
      for (n = 0; n < ut.length; ++n) {
        ut[n].init(t + a + r.randInt(0, o), r.randInt(-i.maxScreenHeight / 2, i.maxScreenHeight / 2), 30, r.randInt(0, 1));
        a += o;
      }
    }
    function an(t, e, n) {
      for (var r = 0; r < U.objects.length; ++r) {
        if (t + n >= (p = U.objects[r]).x - p.w && t - n <= p.x + p.w && e + n >= p.y - p.h && e - n <= p.y + p.h) {
          return false;
        }
      }
      return true;
    }
    nn(new T(), -850, -400, 0, 0);
    nn(new T(), -800, 250, 1, 1);
    nn(new T(), 1000, 100, 1, 3);
    nn(new T(), -1050, -50, 1, 3);
    nn(new T(), 660, -310, 0.5, 0);
    nn(new T(), 0, 380, 1, 0);
    nn(new T(), -280, 340, 1, 4);
    nn(new T(), 350, -520, 1, 4);
    nn(new T(), -380, -540, 0.2, 4);
    nn(new T(), -600, -280, 1, 5);
    nn(new T(), -580, 0, 1, 4);
    nn(new T(), 800, 220, 1, 4);
    nn(new T(), 250, -300, 1, 6);
    nn(new T(), 200, 300, 1, 8);
    nn(new T(), 900, -100, 1, 8);
    nn(new T(), 900, 400, 1.35, 16);
    nn(new T(), 0, -550, -Math.PI / 1.8, 16);
    nn(new T(), -450, 400, 1, 18);
    rn(0);
    var on = ["st", "nd", "rd", "th"];
    var sn = 9999;
    var ln = 9999;
    function cn(t, e, n) {
      Xt.stop("menu");
      uiContainer.style.display = "none";
      spectateContainer.style.display = "block";
      if (e) {
        sharedUI.style.display = "block";
        Tn();
      } else {
        try {
          factorem.refreshAds([1], true);
        } catch (t) {}
        rankCount.innerHTML = t ? "#" + t : "";
        tokenCount.innerHTML = n ? "+" + n + " tokens" : "No reward";
        if (t) {
          matchOverText.innerHTML = "You finished " + t + on[Math.min(t - 1, on.length - 1)];
        }
        if (t > 2) {
          (function (t) {
            deathMessage.innerHTML = "YOU DIED";
            deathMessage.style.display = t ? "block" : "none";
            deathMessage.style.fontSize = "0px";
            sn = t ? 0 : 9999;
            setTimeout(function () {
              deathMessage.style.display = "none";
            }, i.deathFadeout);
          })(t);
        }
      }
    }
    var hn = 0;
    var un = [function () {
      return "<div class='infoHeader'>Customize</div><div class='menuSelector' onclick='showSelectScreen(0, this)'>Headgear</div><div class='menuSelector' onclick='showSelectScreen(1, this)'>Clothing</div>";
    }, function () {
      var t = "<div class='infoHeader'>Servers</div><div class='infoText'>";
      var e = 0;
      for (var n in o.servers) {
        for (var r = o.servers[n], i = 0, a = 0; a < r.length; a++) {
          for (var s = 0; s < r[a].games.length; s++) {
            i += r[a].games[s].playerCount;
          }
        }
        e += i;
        var l = n.startsWith("vultr:") ? n.slice(6) : n;
        var c = o.regionInfo[l].name;
        t += "<b>" + (c + " - " + i + " players") + "</b>";
        for (a = 0; a < r.length; a++) {
          var h = r[a];
          for (s = 0; s < h.games.length; s++) {
            var u = h.games[s];
            var f = o.server && o.server.region == h.region && o.server.index == h.index && o.gameIndex == s;
            var d = h.region + ":" + h.index + ":" + s;
            var p = c + " " + (h.index + 1) + " - " + u.playerCount + " players";
            t += "<div class='" + (f ? "selectedMenuSelector" : "subMenuSelector") + "' onclick='switchServer(\"" + d + "\")'>" + (f ? "&#x25B6; " : "") + p + "</div>";
          }
        }
        t += "<br/>";
      }
      return (t += "<b>" + e + " total players</b>") + "</div>";
    }, function () {
      if (u) {
        return "<div class='infoHeader'>Account</div><div class='accItem'>If you leave a game in progress your stats won't be saved</div><div class='accItem'><b>Name </b> " + u.name + "</div><div class='accItem'><b>Level </b> " + u.level + "</div><div class='accItem'><b>Tokens </b> " + u.tokens + "</div><div class='accItem'><b>Most Kills </b> " + u.maxKills + "</div><div class='accItem'><b>Kills </b> " + u.kills + "</div><div class='accItem'><b>Deaths </b> " + u.deaths + "</div><div class='accItem'><b>KDR </b> " + (u.kills / u.deaths).round(2) + "</div><div class='accItem'><b>Games </b> " + u.games + "</div><div class='accItem'><b>Wins </b> " + u.wins + "</div><div class='menuButton accButton' style='margin-top:10px' onclick='logoutAcc()'>Logout</div>";
      } else {
        return "<div class='infoHeader'>Login</div><div id='accResp' style='display:none'></div><input type='text' id='accName' class='accInput' maxlength='" + i.maxNameLength + "' placeholder='Username' value='" + (It("foes_username") || "") + "' ontouchend='touchPrompt(event, \"Enter username:\")'></input><input type='text' id='accEmail' class='accInput' maxlength='" + i.maxEmailLength + "'placeholder='Email' ontouchend='touchPrompt(event, \"Enter email:\")'></input><input type='password' id='accPass' class='accInput' maxlength='" + i.maxPassLength + "'placeholder='Password' ontouchend='touchPrompt(event, \"Enter password:\")'></input><div class='menuButton accButton' style='margin-bottom:10px' onclick='loginAcc()'>Login</div><div class='menuButton accButton' onclick='registerAcc()'>Register</div>";
      }
    }, function () {
      var t = "<div class='infoHeader'>How to Play</div><div class='infoText'>The last player alive wins</br>";
      for (var e = Pt ? pn.touch : pn.desktop, n = 0; n < e.length; n++) {
        var r = e[n];
        t += "<b>" + r[0] + "</b> " + r[1] + "</br>";
      }
      return (t += "<span id='createContainerMobile'>Created by <a href='https://web.archive.org/web/20220626093841/https://yendis.ch/'>Yendis</a></span>") + "</div>";
    }, function () {
      var t = "<div class='infoHeader'>Settings</div>";
      for (var e = 0; e < Kt.length; ++e) {
        t += "<div class='menuSelector' id='settingButton" + e + "' onclick='toggleSetting(" + e + ")'>" + zt(Kt[e].val) + Kt[e].display + "</div>";
      }
      return t;
    }];
    function fn(t, e) {
      hn = t;
      infoCard.innerHTML = "<div class='menuButton infoBack' onclick='hideInfoScreen()'>Back</div>" + un[t]();
      if (!e) {
        infoCardParent.classList.toggle("submenuShowing", true);
        buttonCardParent.classList.toggle("submenuShowing", true);
      }
    }
    function dn(t) {
      var e = [];
      for (var n = 0; n < t.length; ++n) {
        e.push({
          index: n,
          rarity: t[n].rarity
        });
      }
      e.sort(r.orderByRarity);
      return e;
    }
    var pn = {
      desktop: [["Movement:", "W,A,S,D"], ["Sprint:", "Shift"], ["Aim:", "Mouse"], ["Interact:", "F"], ["Attack:", "Left Mouse or E"], ["Toggle Weapon:", "Scroll or Q"], ["Drop Weapon:", "C"], ["Voice to Text Chat:", "V"]],
      touch: [["Movement:", "Left control"], ["Sprint:", "Drag left control to edge"], ["Aim:", "Right control"], ["Attack:", "Drag right control to edge"], ["Interact:", "Touch center of screen"], ["Toggle Weapon:", "Touch weapon box in bottom left"], ["Drop Weapon:", "Touch ammo display in bottom right"]]
    };
    var mn = false;
    function yn(t, e) {
      if (t != undefined) {
        mn = true;
        hoverDisplay.innerHTML = vn(t, e);
        hoverDisplay.style.display = "block";
      } else {
        mn = false;
        hoverDisplay.style.display = "none";
      }
    }
    function vn(t, e, n) {
      var r = "";
      if (t == 1) {
        p = C[e];
        r = "player/arms_" + e + "_0";
      } else {
        p = E[e];
        r = "hats/hat_" + e;
      }
      var a = i.rarityCols[p.rarity];
      if (n && a == "#ffffff") {
        a = "#000000";
      }
      var o = "<img class='hoverImg' src='./images/sprites/" + r + ".png'/><div class='hoverInfo'>";
      o += "<div class='hoverTitle' style='color:" + a + "'>" + p.name;
      return (o += "<div class='" + (n ? "hoverDescDark" : "hoverDescLight") + "'>" + i.rarityNames[p.rarity] + "</div>") + "</div></div>";
    }
    var gn;
    var xn;
    var wn = ["Ranged", "Melee", "Item"];
    function bn(t) {
      xn = t;
      Et("foes_shirt", t);
      yn();
    }
    function Sn(t) {
      gn = t;
      Et("foes_hat", t);
      yn();
    }
    var kn;
    var Mn;
    var En;
    var In = ["twitter_sh"];
    var Cn = {};
    function An(t) {
      uiContainer.style.display = "none";
      sharedUI.style.display = "none";
      deathMessage.style.display = "none";
      spectateContainer.style.display = "none";
      mainMenuContainer.style.display = t ? "block" : "none";
      roundTimerMenu.style.display = t ? "block" : "none";
      createContainer.style.display = t ? "block" : "none";
      shareContainer.style.display = t ? "block" : "none";
      shareLink.style.display = Rt() && t ? "block" : "none";
      linksContainer.style.display = t ? "block" : "none";
      settingsContainer.style.display = t ? "block" : "none";
      if (t) {
        Tn();
        Xt.stop("ambient");
        Xt.play("menu", 0.1, true);
      }
      On();
    }
    function Tn(t, e) {
      loadingContainer.style.display = t ? "block" : "none";
      if (t) {
        An();
        loadingText.innerHTML = t;
        loadingSubtext.innerHTML = e;
        loadingSubtext.style.display = e ? "block" : "none";
      }
      On();
    }
    function Pn(t) {
      reloadButton.style.display = t ? "block" : "none";
    }
    function On() {
      darkener.style.display = mainMenuContainer.style.display != "block" && loadingContainer.style.display != "block" ? "none" : "block";
    }
    function Bn(t) {
      if (u && t) {
        u.setData(t);
      }
      if (hn == 2) {
        fn(2);
      }
    }
    function _n(t) {
      try {
        accResp.innerHTML = t;
        accResp.style.display = "block";
      } catch (t) {}
    }
    function Rn(t, e) {
      if (h()) {
        if (t >= 0) {
          _n("Please Wait...");
        }
        c("a", t, e);
      }
    }
    function Ln(t, e, n, r, i) {
      if (t) {
        _n(t);
      } else {
        u = new b(e, n);
        Et("foes_username", n);
        Bn(r);
        if (i) {
          Et("foes_token", i);
        }
      }
    }
    var Dn = i.maxScreenWidth;
    var Un = i.maxScreenHeight;
    function jn() {
      kn = Math.round(window.innerWidth);
      Mn = Math.round(window.innerHeight);
      var t = Math.max(kn / Dn, Mn / Un) * ft;
      x.width = kn * ft;
      x.height = Mn * ft;
      x.style.width = kn + "px";
      x.style.height = Mn + "px";
      w.setTransform(t, 0, 0, t, (kn * ft - Dn * t) / 2, (Mn * ft - Un * t) / 2);
      En = (Mn + kn) / (Dn + Un);
      document.getElementById("mainMenuContainer").style.transform = "perspective(1px) translate(-50%, -50%) scale(" + En * i.cZoom + ")";
    }
    function Hn() {
      y = Date.now();
      m = y - v;
      v = y;
      if (l) {
        (function (t) {
          if (sn < 110) {
            sn += t * 0.1;
            var e = Math.min(Math.round(sn), 110);
            deathMessage.style.fontSize = e + "px";
            deathMessage.style.lineHeight = e * 1.3 + "px";
          }
          if (f) {
            for (var n = 0; n < f.effects.length; ++n) {
              if (f.effects[n] && f.effectTimers[f.effects[n]]) {
                f.effectTimers[f.effects[n]] -= t / 1000;
                document.getElementById("pTimer" + f.effects[n]).innerHTML = Math.max(0, Math.ceil(f.effectTimers[f.effects[n]])) + "s";
              }
            }
          }
          if (ln < 180) {
            ln += t * 0.15;
            gameOverMessage.style.fontSize = Math.min(Math.round(ln), 180) + "px";
          }
          (function (t) {
            if (kt && (He -= t) <= 0) {
              He = r.randInt(1000, 4000);
              if (Kt[1].val && gt.getCount("screen") < i.screenParticles) {
                gt.add(r.randInt(3, 4), r.randInt(G - Dn / 2, G + Dn / 2), Z - Un / 2, Math.PI / 2 * r.randFloat(0.7, 0.85));
              }
            }
          })(t);
          n = 0;
          for (; n < ct.length; ++n) {
            if ((d = ct[n]) && d.visible) {
              d.oldX = d.x;
              d.oldY = d.y;
              if (d.forcePos) {
                d.x = d.x2;
                d.x1 = d.x2;
                d.y = d.y2;
                d.y1 = d.y2;
                d.dir = d.d2;
                d.d1 = d.d2;
                d.dt = 0;
                d.stopAnimation();
              } else {
                d.dt += t;
                var a = Math.min(1.5, d.dt / (i.serverTickrate * 1.2));
                d.x = d.x1 + (d.x2 - d.x1) * a;
                d.y = d.y1 + (d.y2 - d.y1) * a;
                d.dir = Math.lerpAngle(d.d2, d.d1, Math.min(1, a)) || 0;
                d.animate(t);
              }
            }
          }
          if ((ke -= 1) <= 0) {
            ke = 25;
            Me();
          }
          w.globalAlpha = 1;
          w.fillStyle = i.mapColors[at];
          w.fillRect(0, 0, Dn, Un);
          et = Math.atan2(J - Mn / 2, $ - kn / 2) || 0;
          if (It("foes_aimAssist") == "true" && Rt() && f && f.alive && !f.vehicle) {
            var o = window.as || localStorage.as || Math.PI * 0.125;
            var s = undefined;
            var h = undefined;
            for (n = 0; n < ct.length; ++n) {
              if ((d = ct[n]) != f && d.visible && d.alive) {
                var m = Math.sqrt(Math.pow(d.y - f.y, 2) + Math.pow(d.x - f.x, 2));
                var v = Math.atan2(d.y - f.y, d.x - f.x);
                if (Math.abs(r.getAngleDist(et, v)) < o && (s == undefined || m < s)) {
                  s = m;
                  h = v;
                }
              }
            }
            if (h != undefined) {
              et = h;
            }
          }
          if (f && f.alive && y - nt >= (Ht ? i.sendRateDown : i.sendRate)) {
            nt = y;
            if (jt) {
              jt = false;
              c("3", Yt);
            }
            c("1", r.fixTo(et, 2));
          }
          var g = (rt = r.getDistance(kn / 2, Mn / 2, $, J)) * i.mouseSen * Math.cos(et);
          var x = rt * i.mouseSen * Math.sin(et);
          if (f && f.x != undefined) {
            G = f.x + g;
          }
          if (f && f.y != undefined) {
            Z = f.y + x;
          }
          var b = G - Dn / 2 - Ye;
          var S = Z - Un / 2 - We;
          Ye &&= 0;
          We &&= 0;
          Xt.xListen = G;
          Xt.yListen = Z;
          De(0, b, S, ut);
          if (Re(-b - (i.mapScale + 3000), -S - (i.mapScale + 3000), 200)) {
            if (!(p = lt[1])) {
              p = Ee(".././images/shrine/pep.png");
              lt[1] = p;
            }
            if (p.isLoaded) {
              w.drawImage(p, -b - 200 - (i.mapScale + 3000), -S - 200 - (i.mapScale + 3000), 400, 400);
            }
          }
          De(-1, b, S, ht);
          De(-1, b, S, vt, true);
          De(0, b, S, ht);
          De(1, b, S, ht);
          w.fillStyle = "rgba(0,0,0,0.08)";
          n = 0;
          for (; n < ct.length; ++n) {
            if ((d = ct[n]).visible && d.alive) {
              w.save();
              w.translate(d.x - b, d.y - S);
              w.rotate(ve(d));
              xe(9, 0, d.scale * 1.3);
              w.restore();
            }
          }
          De(0, b, S, mt);
          n = 0;
          for (; n < ct.length; ++n) {
            if ((d = ct[n]).visible && d.alive && (w.save(), w.translate(d.x - b, d.y - S), Pe(d), w.restore(), !d.vehicle && (d.stepCounter -= Math.min(r.getDistance(d.oldX, d.oldY, d.x, d.y), i.stepCounter * 1.5), d.stepOffset = (d.stepCounter / i.stepCounter - 0.5) * i.stepAnim * d.stepAnimDir, d.stepCounter <= 0))) {
              d.stepIndex = 0;
              d.stepAnimDir *= -1;
              for (var k = 0; k < U.objects.length; ++k) {
                p = U.objects[k];
                if (d.x >= p.x - p.w && d.x <= p.x + p.w && d.y >= p.y - p.h && d.y <= p.y + p.h) {
                  d.stepIndex = p.stepIndex;
                  p.stepIndex;
                  break;
                }
              }
              d.stepCounter += i.stepCounter;
              Xt.playAt("step_" + (d.stepIndex + r.randInt(0, 1)), d.x, d.y, 0.065);
            }
          }
          De(0, b, S, vt, true);
          De(2, b, S, ht);
          De(1, b, S, vt, true);
          if (Y > q) {
            if ((Y = V + (K += t) / 200 * (q - V)) <= q) {
              Y = q;
            }
            F = W * (1 - Y);
            X = N * (1 - Y);
          }
          var E = i.mapScale * Math.max(0, Y);
          if (f) {
            w.fillStyle = "#d90000";
            w.globalAlpha = 0.18;
            if (b <= F - E) {
              w.fillRect(0, 0, F - b - E, Un);
            }
            if (F + E - b <= Dn) {
              w.fillRect(F + E - b, 0, Dn - E + b - F, Un);
            }
            if (S <= X - E) {
              var I = Math.max(F - b - E, 0);
              var C = Math.min(E * 2, F + E - b);
              w.fillRect(I, 0, C, X - S - E);
            }
            if (X + E - S <= Un) {
              I = Math.max(F - b - E, 0);
              C = Math.min(E * 2, F + E - b);
              w.fillRect(I, X + E - S, C, Un - E + S - X);
            }
          }
          w.strokeStyle = ot;
          w.globalAlpha = 1;
          w.textBaseline = "middle";
          w.lineWidth = 10;
          w.lineJoin = "round";
          n = 0;
          for (; n < ct.length; ++n) {
            d = ct[n];
            if (Kt[4].val && l && d.showStats && d.visible && d.alive) {
              w.font = "30px GameFont";
              w.textAlign = "center";
              w.fillStyle = "#fff";
              var T = d.name;
              w.strokeText(T, d.x - b, d.y - S - d.scale - i.nameY);
              w.fillText(T, d.x - b, d.y - S - d.scale - i.nameY);
              if (d.level || d == f && u) {
                C = w.measureText(T).width / 2 + 15;
                w.font = "50px GameFont";
                w.textAlign = "left";
                w.strokeText(d.level || u.level, d.x - b + C, d.y - S - d.scale - i.nameY);
                w.fillText(d.level || u.level, d.x - b + C, d.y - S - d.scale - i.nameY);
              }
              w.fillStyle = ot;
              w.roundRect(d.x - b - i.hpWid - i.hpPad, d.y - S + d.scale - i.hpHei + i.nameY - i.hpPad, i.hpWid * 2 + i.hpPad * 2, i.hpHei * 2 + i.hpPad * 2, 6);
              w.fill();
              w.fillStyle = d == f ? "#8ecc51" : "#cc5151";
              w.fillRect(d.x - b - i.hpWid, d.y - S + d.scale - i.hpHei + i.nameY, i.hpWid * 2 * (d.health / d.maxHealth), i.hpHei * 2);
            }
          }
          w.strokeStyle = ot;
          if (f && f.alive) {
            pt.update(t, w, b, S);
          }
          var P = undefined;
          if (f && f.alive && Kt[4].val && (f.interact && f.interact.isWeapon || infoDisplay.style.display != "none" && (infoDisplay.style.display = "none"), f.interact)) {
            p = null;
            n = 0;
            for (; n < ht.length; ++n) {
              if (ht[n].sid == f.interact) {
                p = ht[n];
                break;
              }
            }
            if (p && p.active && (P = p, w.font = "30px GameFont", w.fillStyle = "#fff", T = Pt ? "" : "press F", w.strokeText(T, p.x - b, p.y - S + p.getScale() + 30), w.fillText(T, p.x - b, p.y - S + p.getScale() + 30), p.isWeapon || p.isPickup)) {
              if (infoDisplay.style.display != "block") {
                infoDisplay.style.display = "block";
              }
              var O = p.typeIndex + "" + p.isWeapon;
              if (O != H) {
                H = O;
                infoDisplay.innerHTML = p.isWeapon ? function (t) {
                  var e = "<span style='color:" + i.rarityCols[t.rarity] + "'>" + t.name + "</span>";
                  return (e += "<div class='infoDSub'>" + wn[t.melee ? 1 : t.use ? 2 : 0] + "</div>") + "<div class='infoDSub'>" + (t.desc || Math.round(1000 / Math.max(i.serverTickrate, Math.min(1000, t.reload)) * t.dmg) + (t.bCount ? " x" + t.bCount : "") + " DPS") + "</div>";
                }(M[p.typeIndex]) : function (t) {
                  return "<span style='color:" + i.rarityCols[0] + "'>" + t.name + "</span><div class='infoDSub'>" + t.desc + "</div>";
                }(A[p.index]);
              }
            }
          }
          interactButton.style.display = Pt && (P || f && f.vehicle) ? "block" : "none";
          if (f && f.vehicle) {
            interactButton.innerText = "exit vehicle";
          } else if (P != undefined) {
            if (P.isWeapon) {
              interactButton.innerText = "pickup weapon";
            } else if (P.isPickup) {
              interactButton.innerText = "pickup item";
            } else if (P.src.startsWith("vehicles/")) {
              interactButton.innerText = "enter vehicle";
            } else if (P.src.startsWith("crates/")) {
              interactButton.innerText = "pickup crate";
            } else {
              console.warn("Unkown interaction type.", P);
              interactButton.innerText = "interact";
            }
          }
          n = 0;
          for (; n < ct.length; ++n) {
            d = ct[n];
            if (l && d.visible && d.alive && d.chatCooldown > 0) {
              d.chatCooldown -= t;
              w.font = "35px GameFont";
              w.textAlign = "left";
              C = w.measureText(d.chatMsg).width;
              I = d.x + d.scale + i.chatOffset - b;
              var B = d.y - S;
              w.fillStyle = "rgba(0,0,0,0.2)";
              w.fillRect(I, B - 17.5 - i.chatPad, C + i.chatPad * 2, 35 + i.chatPad * 2);
              w.fillStyle = "#fff";
              w.fillText(d.chatMsg, I + i.chatPad, B);
            }
          }
          if (f && f.alive) {
            if (Q.id !== -1) {
              ge(Q.startX, Q.startY, Q.currentX, Q.currentY);
            }
            if (tt.id !== -1) {
              ge(tt.startX, tt.startY, tt.currentX, tt.currentY);
            }
          }
        })(m);
      }
      requestAnimFrame(Hn);
    }
    window.addEventListener("resize", jn);
    jn();
    var Yn = 0;
    function Wn() {
      if (++Yn >= 2) {
        An(true);
      }
    }
    var Nn = 0;
    var Fn = 120000;
    var Xn = 0;
    var Vn = [];
    console.verbose = function () {};
    for (var qn in console) {
      (function (t) {
        var e = console[t];
        console[t] = function () {
          Vn.push({
            fn: t,
            args: Array.prototype.slice.call(arguments)
          });
          e.apply(this, arguments);
        };
      })(qn);
    }
    function Kn(t) {
      var e = "";
      e += t ? "Please keep waiting or contact us on <a href='https://web.archive.org/web/20220626093841/https://discord.gg/2UYUS3f'>Discord</a> or " : "Please contact us on <a href='https://web.archive.org/web/20220626093841/https://discord.gg/2UYUS3f'>Discord</a> or ";
      e += "<a href='https://web.archive.org/web/20220626093841/https://www.reddit.com/r/foesIO/'>Reddit</a> for support.<br/>";
      e += "Make sure to copy the data below and include it in your error report:<br/>";
      e += "<textarea id='loadingError' editable readonly onclick='this.focus();this.select()'>";
      e += "### User agent data ###\n";
      for (var n in navigator) {
        if (typeof navigator[n] != "function") {
          e += n + ": " + navigator[n] + "\n";
        }
      }
      e += "\n";
      e += "### Local storage ###\n";
      for (var r = 0; r < localStorage.length; r++) {
        e += (n = localStorage.key(r)) + ": " + localStorage.getItem(n) + "\n";
      }
      for (var n in localStorage) {
        if (typeof localStorage[n] != "function") {
          e += n + ": " + navigator[n] + "\n";
        }
      }
      e += "\n";
      e += "### Log ###\n";
      return (e += function () {
        var t = "";
        for (var e = 0; e < Vn.length; e++) {
          for (var n = Vn[e], r = "", i = 0; i < n.args.length; i++) {
            var a = n.args[i];
            r += typeof a == "string" || typeof a == "number" ? a : JSON.stringify(a);
            if (i != n.args.length - 1) {
              r += " â€¢ ";
            }
          }
          t += n.fn + ": " + (r || "<no message>") + "\n";
        }
        return t;
      }()) + "</textarea>";
    }
    window.fetchLog = function () {
      return Vn;
    };
    setTimeout(function () {
      if (!zn) {
        Tn("Still loading...?", Kn());
        Pn(true);
      }
    }, 30000);
    var zn = false;
    (function () {
      zn = true;
      (function () {
        for (var t = 0; t < Kt.length; ++t) {
          var e = It("foes_" + Kt[t].name);
          Kt[t].val = e != undefined ? e == "true" : Kt[t].val;
        }
      })();
      if (window.admob != undefined) {
        window.admob.setOptions({
          publisherId: "ca-app-pub-4505182558467475~9149480998",
          interstitialAdId: "ca-app-pub-4505182558467475/5013304175"
        });
      }
      window.admob;
      if (Rt()) {
        document.getElementById("downloadButtonContainer").classList.add("cordova");
        document.getElementById("mobileDownloadButtonContainer").classList.add("cordova");
        document.getElementById("versionLink").style.display = "none";
        document.getElementById("adParent").style.display = "none";
        document.getElementById("inGameAd").style.display = "none";
      }
      (function () {
        for (var t = 0; t < 4; ++t) {
          Le["/bullets/bullet_" + t] = Ee(".././images/sprites/bullets/bullet_" + t + ".png");
        }
      })();
      fn(3, true);
      Xt.play("menu", 0.1, true);
      var t = It("foes_mus");
      if (t == null) {
        t = 1;
      }
      qt(t == 1 ? 1 : 0);
      (function () {
        for (var t = 0; t < In.length; ++t) {
          Cn[In[t]] = It("foes_" + In[t]);
        }
      })();
      bn(It("foes_shirt") || 0);
      Sn(It("foes_hat") || 0);
      nameInput.value = It("foes_name") || "";
      o.start(function (t, e, n) {
        shareLinkText.innerText = location.href.split("//")[1];
        (function (t, e) {
          if (!s) {
            var n = {
              enter: Zt,
              a: Ln,
              ua: Bn,
              0: Ze,
              1: ze,
              2: Ge,
              3: Jt,
              4: ee,
              5: ae,
              6: ue,
              7: $t,
              8: te,
              9: en,
              20: tn,
              10: Qt,
              11: Je,
              12: le,
              13: oe,
              14: me,
              15: cn,
              16: Ne,
              17: Fe,
              18: qe,
              19: Ke,
              21: fe,
              22: se,
              23: Ue,
              s: Vt,
              c: ye
            };
            var r = location.protocol == "https:" ? "wss:" : "ws:";
            try {
              var i = false;
              var o = r + t;
              console.verbose("Connecting to address", o);
              (s = new WebSocket(o)).binaryType = "arraybuffer";
              s.onmessage = function (t) {
                var e = new Uint8Array(t.data);
                var r = a.decode(e);
                var i = r[0];
                e = r[1];
                n[i].apply(undefined, e);
              };
              s.onopen = function () {
                e();
              };
              s.onclose = function () {
                if (!i) {
                  console.error("Disconnected", arguments);
                  e("Disconnected");
                }
              };
              s.onerror = function (t) {
                if (s.readyState != WebSocket.OPEN) {
                  i = true;
                  console.error("Socket error", arguments);
                  e("Socket error", Kn());
                }
              };
            } catch (t) {
              console.log("error caught", t);
            }
          }
        })("//" + t + ":8443/?gameIndex=" + n, function (t, e) {
          if (t) {
            l = false;
            Tn(t, e);
            Pn(true);
          } else {
            l = true;
            Wn();
            (function () {
              var t = It("foes_token");
              if (t) {
                Rn(1, [null, null, t]);
              }
            })();
          }
        });
      });
      window.requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (t) {
        window.setTimeout(t, 1000 / 60);
      };
      Hn();
    })();
    window.enterGame = function () {
      if (h()) {
        Et("foes_name", nameInput.value);
        Tn("Loading...");
        c("enter", {
          name: nameInput.value,
          custom: [xn, gn]
        });
      }
    };
    window.shareGame = function (t) {
      Et("foes_" + In[0], 1);
      Cn[In[0]] = 1;
      window.open("https://web.archive.org/web/20220626093841/https://www.youtube.com/channel/UCo-hjA9tDF5Sdfnp6eQD0XA?sub_confirmation=1");
    };
    window.toggleSetting = function (t) {
      Kt[t].val = !Kt[t].val;
      document.getElementById("settingButton" + t).innerHTML = zt(Kt[t].val) + Kt[t].display;
      Et("foes_" + Kt[t].name, Kt[t].val);
      if (Kt[t].onChange != undefined) {
        Kt[t].onChange(Kt[t].val);
      }
    };
    window.showLeaderboard = function () {
      window.open("https://web.archive.org/web/20220626093841/http://foes.wiki/accounts/leaderboard.html", "_blank");
    };
    window.showInfoScreen = fn;
    window.hideInfoScreen = function () {
      infoCardParent.classList.toggle("submenuShowing", false);
      buttonCardParent.classList.toggle("submenuShowing", false);
    };
    window.showSelectScreen = function (t, e) {
      var n = "<div class='menuButton accButton' onclick='showInfoScreen(0)'>Back</div><div class='infoHeader'>" + e.innerHTML + "</div>";
      if (t == 0) {
        for (var r = dn(E), a = 0; a < r.length; ++a) {
          var o = r[a].index;
          if (!E[o].unlock || !!Cn[E[o].unlock]) {
            n += Pt ? "<div class='menuSelector' onclick='showInfoScreen(0);selectHat(" + o + ")'>" + vn(0, o, true) + "</div>" : "<div class='menuSelector' onmouseover='hoverObj(0," + o + ")' onmouseout='hoverObj()' style='color:" + (E[o].rarity ? i.rarityCols[E[o].rarity] : "#353535") + "' onclick='showInfoScreen(0);selectHat(" + o + ")'>" + E[o].name + "</div>";
          }
        }
      } else if (t == 1) {
        r = dn(C);
        a = 0;
        for (; a < r.length; ++a) {
          o = r[a].index;
          if (!C[o].unlock || !!Cn[C[o].unlock]) {
            n += Pt ? "<div class='menuSelector' onclick='showInfoScreen(0);selectShirt(" + o + ")'>" + vn(1, o, true) + "</div>" : "<div class='menuSelector' onmouseover='hoverObj(1," + o + ")' onmouseout='hoverObj()' style='color:" + (C[o].rarity ? i.rarityCols[C[o].rarity] : "#353535") + "' onclick='showInfoScreen(0);selectShirt(" + o + ")'>" + C[o].name + "</div>";
          }
        }
      }
      infoCard.innerHTML = n;
    };
    window.selectHat = Sn;
    window.selectShirt = bn;
    window.toggleMenu = An;
    window.switchServer = function (t) {
      if (t.startsWith("vultr:")) {
        t = t.slice(6);
      }
      o.switchServer(...t.split(":"));
    };
    window.toggleSound = qt;
    window.hoverObj = yn;
    window.registerAcc = function () {
      Rn(0, [accName.value, accEmail.value, accPass.value]);
    };
    window.loginAcc = function () {
      Rn(1, [accName.value, accPass.value, null]);
    };
    window.logoutAcc = function () {
      Rn(-1);
      if (Mt === false) {
        localStorage.removeItem("foes_token");
      }
      u = null;
      Bn();
    };
    window.incrementWeapon = Ft;
    window.dropWeapon = function () {
      At(67, 1);
      setTimeout(function () {
        At(67, 0);
      }, 50);
    };
    window.touchPrompt = function (t, e) {
      t.preventDefault();
      var n = prompt(e, t.target.value);
      if (t.target.maxLength != -1) {
        n = n.slice(0, t.target.maxLength);
      }
      t.target.value = n;
    };
    window.triggerInteract = Lt;
    window.addEventListener("keydown", function (t) {
      if (t.keyCode == 84) {
        cn(3, false, 10);
      }
    });
  }, function (t, e) {
    t.exports.openPorts = 10;
    t.exports.serverTickrate = 100;
    t.exports.visionBuffer = 160;
    t.exports.maxPlayers = 30;
    t.exports.playerSpread = 3;
    t.exports.hardMaxPlayers = 40;
    t.exports.sendRate = 10;
    t.exports.sendRateDown = 1000 / 30;
    t.exports.mouseSen = 0.2;
    t.exports.moveKeys = ["up", "down", "left", "right"];
    t.exports.cZoom = 1.65;
    t.exports.maxScreenWidth = t.exports.cZoom * 1408;
    t.exports.maxScreenHeight = t.exports.cZoom * 792;
    t.exports.hearDistance = t.exports.maxScreenWidth / 2;
    t.exports.voiceDistance = t.exports.maxScreenWidth / 2;
    t.exports.stepCounter = 220;
    t.exports.maxSteps = 2;
    t.exports.volumeMult = 3;
    t.exports.rarityCols = ["#ffffff", "#71ad53", "#5f9ad2", "#c037cd", "#f0d52e", "#f1484d"];
    t.exports.rarityNames = ["common", "uncommon", "rare", "epic", "legendary", "exotic"];
    t.exports.hpPad = 5;
    t.exports.hpWid = 50;
    t.exports.hpHei = 4;
    t.exports.deathFadeout = 3000;
    t.exports.startStamina = 1000;
    t.exports.startHealth = 1000;
    t.exports.borderDmg = 200;
    t.exports.killStreakTimer = 5000;
    t.exports.minVelocityDmg = 100;
    t.exports.roundTimer = 25000;
    t.exports.dmgToStam = 0.3;
    t.exports.staminaRegen = 45;
    t.exports.staminaDelay = 500;
    t.exports.sprintCost = 15;
    t.exports.noStamMlt = 0.5;
    t.exports.playerSpeed = 0.0033;
    t.exports.sprintSpeed = 1.45;
    t.exports.dashCost = 200;
    t.exports.dashCountdown = 400;
    t.exports.dashSpeedRed = 0.993;
    t.exports.dashSpeed = 0.0065;
    t.exports.wiggleCount = 10;
    t.exports.headTilt = 0.85;
    t.exports.hitArc = Math.PI * 0.95;
    t.exports.stepAnim = 22;
    t.exports.bOffset = 1.2;
    t.exports.bulletSpeed = 4.5;
    t.exports.bulletLayer = 1;
    t.exports.bulletScale = 85;
    t.exports.rangeMlt = 1.2;
    t.exports.shieldAngle = Math.PI / 3;
    t.exports.weaponSwapTime = 150;
    t.exports.backScale = 45;
    t.exports.backOffset = 10;
    t.exports.tokenRewards = [30, 10, 5];
    t.exports.tokenPerKill = 10;
    t.exports.xpPerKill = 100;
    t.exports.roundXP = 1500;
    t.exports.chatMax = 20;
    t.exports.chatCooldown = 2000;
    t.exports.chatDuration = 2000;
    t.exports.chatPad = 8;
    t.exports.chatOffset = 15;
    t.exports.interactRange = 50;
    t.exports.maxNameLength = 16;
    t.exports.maxPassLength = 30;
    t.exports.maxEmailLength = 40;
    t.exports.nameY = 30;
    t.exports.playerScale = 45;
    t.exports.armScale = 52;
    t.exports.armOffset = 40;
    t.exports.footOffset = 20;
    t.exports.footScale = 35;
    t.exports.buildingTileScale = 165;
    t.exports.screenParticles = 3;
    t.exports.recycleObjects = 12;
    t.exports.mapColors = ["#768F5A", "#fff"];
    t.exports.borderPad = 10;
    t.exports.spawnPad = 100;
    t.exports.mapScale = 12000;
    t.exports.treeCount = 7;
    t.exports.rockCount = 1;
    t.exports.bushCount = 1;
    t.exports.flowerCount = 2;
    t.exports.areaCount = 10;
    t.exports.gridSize = 48;
    t.exports.gridCol = Math.ceil(e.mapScale / (e.maxScreenWidth / 2));
    t.exports.mapShrinkTimer = 20000;
    t.exports.mapShrinks = [0.9, 0.7, 0.5, 0.3, 0.09];
    t.exports.mapShrinkSpeed = 0.000012;
  }, function (t, e, n) {
    e.encode = n(10).encode;
    e.decode = n(16).decode;
    e.Encoder = n(35).Encoder;
    e.Decoder = n(36).Decoder;
    e.createCodec = n(37).createCodec;
    e.codec = n(38).codec;
  }, function (t, e, n) {
    (function (e) {
      function n(t) {
        return t && t.isBuffer && t;
      }
      t.exports = n(e !== undefined && e) || n(this.Buffer) || n(typeof window != "undefined" && window.Buffer) || this.Buffer;
    }).call(this, n(12).Buffer);
  }, function (t, e, n) {
    "use strict";

    e.byteLength = function (t) {
      var e = c(t);
      var n = e[0];
      var r = e[1];
      return (n + r) * 3 / 4 - r;
    };
    e.toByteArray = function (t) {
      var e;
      var n;
      var r = c(t);
      var o = r[0];
      var s = r[1];
      var l = new a((o + s) * 3 / 4 - s);
      var h = 0;
      var u = s > 0 ? o - 4 : o;
      for (n = 0; n < u; n += 4) {
        e = i[t.charCodeAt(n)] << 18 | i[t.charCodeAt(n + 1)] << 12 | i[t.charCodeAt(n + 2)] << 6 | i[t.charCodeAt(n + 3)];
        l[h++] = e >> 16 & 255;
        l[h++] = e >> 8 & 255;
        l[h++] = e & 255;
      }
      if (s === 2) {
        e = i[t.charCodeAt(n)] << 2 | i[t.charCodeAt(n + 1)] >> 4;
        l[h++] = e & 255;
      }
      if (s === 1) {
        e = i[t.charCodeAt(n)] << 10 | i[t.charCodeAt(n + 1)] << 4 | i[t.charCodeAt(n + 2)] >> 2;
        l[h++] = e >> 8 & 255;
        l[h++] = e & 255;
      }
      return l;
    };
    e.fromByteArray = function (t) {
      var e;
      var n = t.length;
      var i = n % 3;
      var a = [];
      for (var o = 0, s = n - i; o < s; o += 16383) {
        a.push(u(t, o, o + 16383 > s ? s : o + 16383));
      }
      if (i === 1) {
        e = t[n - 1];
        a.push(r[e >> 2] + r[e << 4 & 63] + "==");
      } else if (i === 2) {
        e = (t[n - 2] << 8) + t[n - 1];
        a.push(r[e >> 10] + r[e >> 4 & 63] + r[e << 2 & 63] + "=");
      }
      return a.join("");
    };
    var r = [];
    var i = [];
    var a = typeof Uint8Array != "undefined" ? Uint8Array : Array;
    var o = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (var s = 0, l = o.length; s < l; ++s) {
      r[s] = o[s];
      i[o.charCodeAt(s)] = s;
    }
    function c(t) {
      var e = t.length;
      if (e % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4");
      }
      var n = t.indexOf("=");
      if (n === -1) {
        n = e;
      }
      return [n, n === e ? 0 : 4 - n % 4];
    }
    function h(t) {
      return r[t >> 18 & 63] + r[t >> 12 & 63] + r[t >> 6 & 63] + r[t & 63];
    }
    function u(t, e, n) {
      var r;
      var i = [];
      for (var a = e; a < n; a += 3) {
        r = (t[a] << 16 & 16711680) + (t[a + 1] << 8 & 65280) + (t[a + 2] & 255);
        i.push(h(r));
      }
      return i.join("");
    }
    i["-".charCodeAt(0)] = 62;
    i["_".charCodeAt(0)] = 63;
  }, function (t, e, n) {
    var r = n(0);
    function i(t) {
      return new Array(t);
    }
    (e = t.exports = i(0)).alloc = i;
    e.concat = r.concat;
    e.from = function (t) {
      if (!r.isBuffer(t) && r.isView(t)) {
        t = r.Uint8Array.from(t);
      } else if (r.isArrayBuffer(t)) {
        t = new Uint8Array(t);
      } else {
        if (typeof t == "string") {
          return r.from.call(e, t);
        }
        if (typeof t == "number") {
          throw new TypeError("\"value\" argument must not be a number");
        }
      }
      return Array.prototype.slice.call(t);
    };
  }, function (t, e, n) {
    var r = n(0);
    var i = r.global;
    function a(t) {
      return new i(t);
    }
    (e = t.exports = r.hasBuffer ? a(0) : []).alloc = r.hasBuffer && i.alloc || a;
    e.concat = r.concat;
    e.from = function (t) {
      if (!r.isBuffer(t) && r.isView(t)) {
        t = r.Uint8Array.from(t);
      } else if (r.isArrayBuffer(t)) {
        t = new Uint8Array(t);
      } else {
        if (typeof t == "string") {
          return r.from.call(e, t);
        }
        if (typeof t == "number") {
          throw new TypeError("\"value\" argument must not be a number");
        }
      }
      if (i.from && i.from.length !== 1) {
        return i.from(t);
      } else {
        return new i(t);
      }
    };
  }, function (t, e, n) {
    var r = n(0);
    function i(t) {
      return new Uint8Array(t);
    }
    (e = t.exports = r.hasArrayBuffer ? i(0) : []).alloc = i;
    e.concat = r.concat;
    e.from = function (t) {
      if (r.isView(t)) {
        var n = t.byteOffset;
        var i = t.byteLength;
        if ((t = t.buffer).byteLength !== i) {
          if (t.slice) {
            t = t.slice(n, n + i);
          } else if ((t = new Uint8Array(t)).byteLength !== i) {
            t = Array.prototype.slice.call(t, n, n + i);
          }
        }
      } else {
        if (typeof t == "string") {
          return r.from.call(e, t);
        }
        if (typeof t == "number") {
          throw new TypeError("\"value\" argument must not be a number");
        }
      }
      return new Uint8Array(t);
    };
  }, function (t, e) {
    e.copy = function (t, e, n, r) {
      var i;
      n ||= 0;
      if (!r && r !== 0) {
        r = this.length;
      }
      e ||= 0;
      var a = r - n;
      if (t === this && n < e && e < r) {
        for (i = a - 1; i >= 0; i--) {
          t[i + e] = this[i + n];
        }
      } else {
        for (i = 0; i < a; i++) {
          t[i + e] = this[i + n];
        }
      }
      return a;
    };
    e.toString = function (t, e, n) {
      var r = e | 0;
      n ||= this.length;
      for (var i = "", a = 0; r < n;) {
        if ((a = this[r++]) < 128) {
          i += String.fromCharCode(a);
        } else {
          if ((a & 224) == 192) {
            a = (a & 31) << 6 | this[r++] & 63;
          } else if ((a & 240) == 224) {
            a = (a & 15) << 12 | (this[r++] & 63) << 6 | this[r++] & 63;
          } else if ((a & 248) == 240) {
            a = (a & 7) << 18 | (this[r++] & 63) << 12 | (this[r++] & 63) << 6 | this[r++] & 63;
          }
          if (a >= 65536) {
            a -= 65536;
            i += String.fromCharCode(55296 + (a >>> 10), 56320 + (a & 1023));
          } else {
            i += String.fromCharCode(a);
          }
        }
      }
      return i;
    };
    e.write = function (t, e) {
      var n = e || (e |= 0);
      for (var r = t.length, i = 0, a = 0; a < r;) {
        if ((i = t.charCodeAt(a++)) < 128) {
          this[n++] = i;
        } else if (i < 2048) {
          this[n++] = i >>> 6 | 192;
          this[n++] = i & 63 | 128;
        } else if (i < 55296 || i > 57343) {
          this[n++] = i >>> 12 | 224;
          this[n++] = i >>> 6 & 63 | 128;
          this[n++] = i & 63 | 128;
        } else {
          i = 65536 + (i - 55296 << 10 | t.charCodeAt(a++) - 56320);
          this[n++] = i >>> 18 | 240;
          this[n++] = i >>> 12 & 63 | 128;
          this[n++] = i >>> 6 & 63 | 128;
          this[n++] = i & 63 | 128;
        }
      }
      return n - e;
    };
  }, function (t, e, n) {
    e.setExtPackers = function (t) {
      t.addExtPacker(14, Error, [u, l]);
      t.addExtPacker(1, EvalError, [u, l]);
      t.addExtPacker(2, RangeError, [u, l]);
      t.addExtPacker(3, ReferenceError, [u, l]);
      t.addExtPacker(4, SyntaxError, [u, l]);
      t.addExtPacker(5, TypeError, [u, l]);
      t.addExtPacker(6, URIError, [u, l]);
      t.addExtPacker(10, RegExp, [h, l]);
      t.addExtPacker(11, Boolean, [c, l]);
      t.addExtPacker(12, String, [c, l]);
      t.addExtPacker(13, Date, [Number, l]);
      t.addExtPacker(15, Number, [c, l]);
      if (typeof Uint8Array != "undefined") {
        t.addExtPacker(17, Int8Array, o);
        t.addExtPacker(18, Uint8Array, o);
        t.addExtPacker(19, Int16Array, o);
        t.addExtPacker(20, Uint16Array, o);
        t.addExtPacker(21, Int32Array, o);
        t.addExtPacker(22, Uint32Array, o);
        t.addExtPacker(23, Float32Array, o);
        if (typeof Float64Array != "undefined") {
          t.addExtPacker(24, Float64Array, o);
        }
        if (typeof Uint8ClampedArray != "undefined") {
          t.addExtPacker(25, Uint8ClampedArray, o);
        }
        t.addExtPacker(26, ArrayBuffer, o);
        t.addExtPacker(29, DataView, o);
      }
      if (i.hasBuffer) {
        t.addExtPacker(27, a, i.from);
      }
    };
    var r;
    var i = n(0);
    var a = i.global;
    var o = i.Uint8Array.from;
    var s = {
      name: 1,
      message: 1,
      stack: 1,
      columnNumber: 1,
      fileName: 1,
      lineNumber: 1
    };
    function l(t) {
      r ||= n(10).encode;
      return r(t);
    }
    function c(t) {
      return t.valueOf();
    }
    function h(t) {
      (t = RegExp.prototype.toString.call(t).split("/")).shift();
      var e = [t.pop()];
      e.unshift(t.join("/"));
      return e;
    }
    function u(t) {
      var e = {};
      for (var n in s) {
        e[n] = t[n];
      }
      return e;
    }
  }, function (t, e, n) {
    var r = n(1);
    var i = n(7);
    var a = i.Uint64BE;
    var o = i.Int64BE;
    var s = n(0);
    var l = n(6);
    var c = n(32);
    var h = n(14).uint8;
    var u = n(4).ExtBuffer;
    var f = typeof Uint8Array != "undefined";
    var d = typeof Map != "undefined";
    var p = [];
    p[1] = 212;
    p[2] = 213;
    p[4] = 214;
    p[8] = 215;
    p[16] = 216;
    e.getWriteType = function (t) {
      var e = c.getWriteToken(t);
      var n = t && t.useraw;
      var i = f && t && t.binarraybuffer;
      var m = i ? s.isArrayBuffer : s.isBuffer;
      var y = i ? function (t, e) {
        w(t, new Uint8Array(e));
      } : w;
      var v = d && t && t.usemap ? function (t, n) {
        if (!(n instanceof Map)) {
          return b(t, n);
        }
        var r = n.size;
        e[r < 16 ? 128 + r : r <= 65535 ? 222 : 223](t, r);
        var i = t.codec.encode;
        n.forEach(function (e, n, r) {
          i(t, n);
          i(t, e);
        });
      } : b;
      return {
        boolean: function (t, n) {
          e[n ? 195 : 194](t, n);
        },
        function: x,
        number: function (t, n) {
          var r = n | 0;
          if (n === r) {
            e[r >= -32 && r <= 127 ? r & 255 : r >= 0 ? r <= 255 ? 204 : r <= 65535 ? 205 : 206 : r >= -128 ? 208 : r >= -32768 ? 209 : 210](t, r);
          } else {
            e[203](t, n);
          }
        },
        object: n ? function (t, n) {
          if (m(n)) {
            return function (t, n) {
              var r = n.length;
              e[r < 32 ? 160 + r : r <= 65535 ? 218 : 219](t, r);
              t.send(n);
            }(t, n);
          }
          g(t, n);
        } : g,
        string: function (t) {
          return function (n, r) {
            var i = r.length;
            var a = 5 + i * 3;
            n.offset = n.reserve(a);
            var o = n.buffer;
            var s = t(i);
            var c = n.offset + s;
            i = l.write.call(o, r, c);
            var h = t(i);
            if (s !== h) {
              var u = c + h - s;
              var f = c + i;
              l.copy.call(o, o, u, c, f);
            }
            e[h === 1 ? 160 + i : h <= 3 ? 215 + h : 219](n, i);
            n.offset += i;
          };
        }(n ? function (t) {
          if (t < 32) {
            return 1;
          } else if (t <= 65535) {
            return 3;
          } else {
            return 5;
          }
        } : function (t) {
          if (t < 32) {
            return 1;
          } else if (t <= 255) {
            return 2;
          } else if (t <= 65535) {
            return 3;
          } else {
            return 5;
          }
        }),
        symbol: x,
        undefined: x
      };
      function g(t, n) {
        if (n === null) {
          return x(t, n);
        }
        if (m(n)) {
          return y(t, n);
        }
        if (r(n)) {
          return function (t, n) {
            var r = n.length;
            e[r < 16 ? 144 + r : r <= 65535 ? 220 : 221](t, r);
            var i = t.codec.encode;
            for (var a = 0; a < r; a++) {
              i(t, n[a]);
            }
          }(t, n);
        }
        if (a.isUint64BE(n)) {
          return function (t, n) {
            e[207](t, n.toArray());
          }(t, n);
        }
        if (o.isInt64BE(n)) {
          return function (t, n) {
            e[211](t, n.toArray());
          }(t, n);
        }
        var i = t.codec.getExtPacker(n);
        if (i) {
          n = i(n);
        }
        if (n instanceof u) {
          return function (t, n) {
            var r = n.buffer;
            var i = r.length;
            var a = p[i] || (i < 255 ? 199 : i <= 65535 ? 200 : 201);
            e[a](t, i);
            h[n.type](t);
            t.send(r);
          }(t, n);
        }
        v(t, n);
      }
      function x(t, n) {
        e[192](t, n);
      }
      function w(t, n) {
        var r = n.length;
        e[r < 255 ? 196 : r <= 65535 ? 197 : 198](t, r);
        t.send(n);
      }
      function b(t, n) {
        var r = Object.keys(n);
        var i = r.length;
        e[i < 16 ? 128 + i : i <= 65535 ? 222 : 223](t, i);
        var a = t.codec.encode;
        r.forEach(function (e) {
          a(t, e);
          a(t, n[e]);
        });
      }
    };
  }, function (t, e, n) {
    var r = n(5);
    var i = n(7);
    var a = i.Uint64BE;
    var o = i.Int64BE;
    var s = n(14).uint8;
    var l = n(0);
    var c = l.global;
    var h = l.hasBuffer && "TYPED_ARRAY_SUPPORT" in c && !c.TYPED_ARRAY_SUPPORT;
    var u = l.hasBuffer && c.prototype || {};
    function f() {
      var t = s.slice();
      t[196] = d(196);
      t[197] = p(197);
      t[198] = m(198);
      t[199] = d(199);
      t[200] = p(200);
      t[201] = m(201);
      t[202] = y(202, 4, u.writeFloatBE || x, true);
      t[203] = y(203, 8, u.writeDoubleBE || w, true);
      t[204] = d(204);
      t[205] = p(205);
      t[206] = m(206);
      t[207] = y(207, 8, v);
      t[208] = d(208);
      t[209] = p(209);
      t[210] = m(210);
      t[211] = y(211, 8, g);
      t[217] = d(217);
      t[218] = p(218);
      t[219] = m(219);
      t[220] = p(220);
      t[221] = m(221);
      t[222] = p(222);
      t[223] = m(223);
      return t;
    }
    function d(t) {
      return function (e, n) {
        var r = e.reserve(2);
        var i = e.buffer;
        i[r++] = t;
        i[r] = n;
      };
    }
    function p(t) {
      return function (e, n) {
        var r = e.reserve(3);
        var i = e.buffer;
        i[r++] = t;
        i[r++] = n >>> 8;
        i[r] = n;
      };
    }
    function m(t) {
      return function (e, n) {
        var r = e.reserve(5);
        var i = e.buffer;
        i[r++] = t;
        i[r++] = n >>> 24;
        i[r++] = n >>> 16;
        i[r++] = n >>> 8;
        i[r] = n;
      };
    }
    function y(t, e, n, r) {
      return function (i, a) {
        var o = i.reserve(e + 1);
        i.buffer[o++] = t;
        n.call(i.buffer, a, o, r);
      };
    }
    function v(t, e) {
      new a(this, e, t);
    }
    function g(t, e) {
      new o(this, e, t);
    }
    function x(t, e) {
      r.write(this, t, e, false, 23, 4);
    }
    function w(t, e) {
      r.write(this, t, e, false, 52, 8);
    }
    e.getWriteToken = function (t) {
      if (t && t.uint8array) {
        return function () {
          var t = f();
          t[202] = y(202, 4, x);
          t[203] = y(203, 8, w);
          return t;
        }();
      } else if (h || l.hasBuffer && t && t.safe) {
        return function () {
          var t = s.slice();
          t[196] = y(196, 1, c.prototype.writeUInt8);
          t[197] = y(197, 2, c.prototype.writeUInt16BE);
          t[198] = y(198, 4, c.prototype.writeUInt32BE);
          t[199] = y(199, 1, c.prototype.writeUInt8);
          t[200] = y(200, 2, c.prototype.writeUInt16BE);
          t[201] = y(201, 4, c.prototype.writeUInt32BE);
          t[202] = y(202, 4, c.prototype.writeFloatBE);
          t[203] = y(203, 8, c.prototype.writeDoubleBE);
          t[204] = y(204, 1, c.prototype.writeUInt8);
          t[205] = y(205, 2, c.prototype.writeUInt16BE);
          t[206] = y(206, 4, c.prototype.writeUInt32BE);
          t[207] = y(207, 8, v);
          t[208] = y(208, 1, c.prototype.writeInt8);
          t[209] = y(209, 2, c.prototype.writeInt16BE);
          t[210] = y(210, 4, c.prototype.writeInt32BE);
          t[211] = y(211, 8, g);
          t[217] = y(217, 1, c.prototype.writeUInt8);
          t[218] = y(218, 2, c.prototype.writeUInt16BE);
          t[219] = y(219, 4, c.prototype.writeUInt32BE);
          t[220] = y(220, 2, c.prototype.writeUInt16BE);
          t[221] = y(221, 4, c.prototype.writeUInt32BE);
          t[222] = y(222, 2, c.prototype.writeUInt16BE);
          t[223] = y(223, 4, c.prototype.writeUInt32BE);
          return t;
        }();
      } else {
        return f();
      }
    };
  }, function (t, e, n) {
    e.setExtUnpackers = function (t) {
      t.addExtUnpacker(14, [s, c(Error)]);
      t.addExtUnpacker(1, [s, c(EvalError)]);
      t.addExtUnpacker(2, [s, c(RangeError)]);
      t.addExtUnpacker(3, [s, c(ReferenceError)]);
      t.addExtUnpacker(4, [s, c(SyntaxError)]);
      t.addExtUnpacker(5, [s, c(TypeError)]);
      t.addExtUnpacker(6, [s, c(URIError)]);
      t.addExtUnpacker(10, [s, l]);
      t.addExtUnpacker(11, [s, h(Boolean)]);
      t.addExtUnpacker(12, [s, h(String)]);
      t.addExtUnpacker(13, [s, h(Date)]);
      t.addExtUnpacker(15, [s, h(Number)]);
      if (typeof Uint8Array != "undefined") {
        t.addExtUnpacker(17, h(Int8Array));
        t.addExtUnpacker(18, h(Uint8Array));
        t.addExtUnpacker(19, [u, h(Int16Array)]);
        t.addExtUnpacker(20, [u, h(Uint16Array)]);
        t.addExtUnpacker(21, [u, h(Int32Array)]);
        t.addExtUnpacker(22, [u, h(Uint32Array)]);
        t.addExtUnpacker(23, [u, h(Float32Array)]);
        if (typeof Float64Array != "undefined") {
          t.addExtUnpacker(24, [u, h(Float64Array)]);
        }
        if (typeof Uint8ClampedArray != "undefined") {
          t.addExtUnpacker(25, h(Uint8ClampedArray));
        }
        t.addExtUnpacker(26, u);
        t.addExtUnpacker(29, [u, h(DataView)]);
      }
      if (i.hasBuffer) {
        t.addExtUnpacker(27, h(a));
      }
    };
    var r;
    var i = n(0);
    var a = i.global;
    var o = {
      name: 1,
      message: 1,
      stack: 1,
      columnNumber: 1,
      fileName: 1,
      lineNumber: 1
    };
    function s(t) {
      r ||= n(16).decode;
      return r(t);
    }
    function l(t) {
      return RegExp.apply(null, t);
    }
    function c(t) {
      return function (e) {
        var n = new t();
        for (var r in o) {
          n[r] = e[r];
        }
        return n;
      };
    }
    function h(t) {
      return function (e) {
        return new t(e);
      };
    }
    function u(t) {
      return new Uint8Array(t).buffer;
    }
  }, function (t, e, n) {
    var r = n(18);
    function i(t) {
      var e;
      var n = new Array(256);
      for (e = 0; e <= 127; e++) {
        n[e] = a(e);
      }
      for (e = 128; e <= 143; e++) {
        n[e] = s(e - 128, t.map);
      }
      for (e = 144; e <= 159; e++) {
        n[e] = s(e - 144, t.array);
      }
      for (e = 160; e <= 191; e++) {
        n[e] = s(e - 160, t.str);
      }
      n[192] = a(null);
      n[193] = null;
      n[194] = a(false);
      n[195] = a(true);
      n[196] = o(t.uint8, t.bin);
      n[197] = o(t.uint16, t.bin);
      n[198] = o(t.uint32, t.bin);
      n[199] = o(t.uint8, t.ext);
      n[200] = o(t.uint16, t.ext);
      n[201] = o(t.uint32, t.ext);
      n[202] = t.float32;
      n[203] = t.float64;
      n[204] = t.uint8;
      n[205] = t.uint16;
      n[206] = t.uint32;
      n[207] = t.uint64;
      n[208] = t.int8;
      n[209] = t.int16;
      n[210] = t.int32;
      n[211] = t.int64;
      n[212] = s(1, t.ext);
      n[213] = s(2, t.ext);
      n[214] = s(4, t.ext);
      n[215] = s(8, t.ext);
      n[216] = s(16, t.ext);
      n[217] = o(t.uint8, t.str);
      n[218] = o(t.uint16, t.str);
      n[219] = o(t.uint32, t.str);
      n[220] = o(t.uint16, t.array);
      n[221] = o(t.uint32, t.array);
      n[222] = o(t.uint16, t.map);
      n[223] = o(t.uint32, t.map);
      e = 224;
      for (; e <= 255; e++) {
        n[e] = a(e - 256);
      }
      return n;
    }
    function a(t) {
      return function () {
        return t;
      };
    }
    function o(t, e) {
      return function (n) {
        var r = t(n);
        return e(n, r);
      };
    }
    function s(t, e) {
      return function (n) {
        return e(n, t);
      };
    }
    e.getReadToken = function (t) {
      var e = r.getReadFormat(t);
      if (t && t.useraw) {
        return function (t) {
          var e;
          var n = i(t).slice();
          n[217] = n[196];
          n[218] = n[197];
          n[219] = n[198];
          e = 160;
          for (; e <= 191; e++) {
            n[e] = s(e - 160, t.bin);
          }
          return n;
        }(e);
      } else {
        return i(e);
      }
    };
  }, function (t, e, n) {
    e.Encoder = a;
    var r = n(19);
    var i = n(11).EncodeBuffer;
    function a(t) {
      if (!(this instanceof a)) {
        return new a(t);
      }
      i.call(this, t);
    }
    a.prototype = new i();
    r.mixin(a.prototype);
    a.prototype.encode = function (t) {
      this.write(t);
      this.emit("data", this.read());
    };
    a.prototype.end = function (t) {
      if (arguments.length) {
        this.encode(t);
      }
      this.flush();
      this.emit("end");
    };
  }, function (t, e, n) {
    e.Decoder = a;
    var r = n(19);
    var i = n(17).DecodeBuffer;
    function a(t) {
      if (!(this instanceof a)) {
        return new a(t);
      }
      i.call(this, t);
    }
    a.prototype = new i();
    r.mixin(a.prototype);
    a.prototype.decode = function (t) {
      if (arguments.length) {
        this.write(t);
      }
      this.flush();
    };
    a.prototype.push = function (t) {
      this.emit("data", t);
    };
    a.prototype.end = function (t) {
      this.decode(t);
      this.emit("end");
    };
  }, function (t, e, n) {
    n(8);
    n(3);
    e.createCodec = n(2).createCodec;
  }, function (t, e, n) {
    n(8);
    n(3);
    e.codec = {
      preset: n(2).preset
    };
  }, function (t, e, n) {
    var r = n(40);
    var i = n(47);
    function a(t, e, n, r, i) {
      if (location.hostname == "localhost") {
        window.location.hostname = "127.0.0.1";
      }
      this.debugLog = false;
      this.baseUrl = t;
      this.lobbySize = n;
      this.devPort = e;
      this.lobbySpread = r;
      this.rawIPs = !!i;
      this.server = undefined;
      this.gameIndex = undefined;
      this.callback = undefined;
      this.errorCallback = undefined;
      this.processServers(vultr.servers);
    }
    a.prototype.regionInfo = {
      0: {
        name: "Local",
        latitude: 0,
        longitude: 0
      },
      1: {
        name: "New Jersey",
        latitude: 40.1393329,
        longitude: -75.8521818
      },
      2: {
        name: "Chicago",
        latitude: 41.8339037,
        longitude: -87.872238
      },
      3: {
        name: "Dallas",
        latitude: 32.8208751,
        longitude: -96.8714229
      },
      4: {
        name: "Seattle",
        latitude: 47.6149942,
        longitude: -122.4759879
      },
      5: {
        name: "Los Angeles",
        latitude: 34.0207504,
        longitude: -118.691914
      },
      6: {
        name: "Atlanta",
        latitude: 33.7676334,
        longitude: -84.5610332
      },
      7: {
        name: "Amsterdam",
        latitude: 52.3745287,
        longitude: 4.7581878
      },
      8: {
        name: "London",
        latitude: 51.5283063,
        longitude: -0.382486
      },
      9: {
        name: "Frankfurt",
        latitude: 50.1211273,
        longitude: 8.496137
      },
      12: {
        name: "Silicon Valley",
        latitude: 37.4024714,
        longitude: -122.3219752
      },
      19: {
        name: "Sydney",
        latitude: -33.8479715,
        longitude: 150.651084
      },
      24: {
        name: "Paris",
        latitude: 48.8588376,
        longitude: 2.2773454
      },
      25: {
        name: "Tokyo",
        latitude: 35.6732615,
        longitude: 139.569959
      },
      39: {
        name: "Miami",
        latitude: 25.7823071,
        longitude: -80.3012156
      },
      40: {
        name: "Singapore",
        latitude: 1.3147268,
        longitude: 103.7065876
      }
    };
    a.prototype.start = function (t, e) {
      this.callback = t;
      this.errorCallback = e;
      var n = this.parseServerQuery();
      if (n) {
        this.log("Found server in query.");
        this.password = n[3];
        this.connect(n[0], n[1], n[2]);
      } else {
        this.log("Pinging servers...");
        this.pingServers();
      }
    };
    a.prototype.parseServerQuery = function () {
      var t = r.parse(location.href, true);
      var e = t.query.server;
      if (typeof e == "string") {
        if (e.startsWith("vultr:")) {
          e = e.slice(6);
        }
        var n = e.split(":");
        if (n.length == 3) {
          return [parseInt(n[0]), parseInt(n[1]), parseInt(n[2]), t.query.password];
        }
        this.errorCallback("Invalid number of server parameters in " + e);
      }
    };
    a.prototype.findServer = function (t, e) {
      var n = this.servers[t];
      if (Array.isArray(n)) {
        for (var r = 0; r < n.length; r++) {
          var i = n[r];
          if (i.index == e) {
            return i;
          }
        }
        console.warn("Could not find server in region " + t + " with index " + e + ".");
      } else {
        this.errorCallback("No server list for region " + t);
      }
    };
    a.prototype.pingServers = function () {
      var t = this;
      var e = [];
      for (var n in this.servers) {
        if (this.servers.hasOwnProperty(n)) {
          var r = this.servers[n];
          var i = r[Math.floor(Math.random() * r.length)];
          if (i != undefined) {
            (function (r, i) {
              var a = new XMLHttpRequest();
              a.onreadystatechange = function (r) {
                var a = r.target;
                if (a.readyState == 4) {
                  if (a.status == 200) {
                    for (var o = 0; o < e.length; o++) {
                      e[o].abort();
                    }
                    t.log("Connecting to region", i.region);
                    var s = t.seekServer(i.region);
                    t.connect(s[0], s[1], s[2]);
                  } else {
                    console.warn("Error pinging " + i.ip + " in region " + n);
                  }
                }
              };
              var o = "//" + t.serverAddress(i.ip, true) + ":" + t.serverPort(i) + "/ping";
              a.open("GET", o, true);
              a.send(null);
              t.log("Pinging", o);
              e.push(a);
            })(0, i);
          } else {
            console.log("No target server for region " + n);
          }
        }
      }
    };
    a.prototype.seekServer = function (t, e, n) {
      if (n == undefined) {
        n = "random";
      }
      if (e == undefined) {
        e = false;
      }
      const r = ["random"];
      var i = this.lobbySize;
      var a = this.lobbySpread;
      var o = this.servers[t].flatMap(function (t) {
        var e = 0;
        return t.games.map(function (n) {
          var r = e++;
          return {
            region: t.region,
            index: t.index * t.games.length + r,
            gameIndex: r,
            gameCount: t.games.length,
            playerCount: n.playerCount,
            isPrivate: n.isPrivate
          };
        });
      }).filter(function (t) {
        return !t.isPrivate;
      }).filter(function (t) {
        return !e || t.playerCount == 0 && t.gameIndex >= t.gameCount / 2;
      }).filter(function (t) {
        return n == "random" || r[t.index % r.length].key == n;
      }).sort(function (t, e) {
        return e.playerCount - t.playerCount;
      }).filter(function (t) {
        return t.playerCount < i;
      });
      if (e) {
        o.reverse();
      }
      if (o.length != 0) {
        var s = Math.min(a, o.length);
        var l = Math.floor(Math.random() * s);
        var c = o[l = Math.min(l, o.length - 1)];
        var h = c.region;
        l = Math.floor(c.index / c.gameCount);
        var u = c.index % c.gameCount;
        this.log("Found server.");
        return [h, l, u];
      }
      this.errorCallback("No open servers.");
    };
    a.prototype.connect = function (t, e, n) {
      if (!this.connected) {
        var r = this.findServer(t, e);
        if (r != undefined) {
          this.log("Connecting to server", r, "with game index", n);
          if (r.games[n].playerCount >= this.lobbySize) {
            this.errorCallback("Server is already full.");
          } else {
            window.history.replaceState(document.title, document.title, this.generateHref(t, e, n, this.password));
            this.server = r;
            this.gameIndex = n;
            this.log("Calling callback with address", this.serverAddress(r.ip), "on port", this.serverPort(r), "with game index", n);
            this.callback(this.serverAddress(r.ip), this.serverPort(r), n);
          }
        } else {
          this.errorCallback("Failed to find server for region " + t + " and index " + e);
        }
      }
    };
    a.prototype.switchServer = function (t, e, n, r) {
      this.switchingServers = true;
      window.location.href = this.generateHref(t, e, n, r);
    };
    a.prototype.generateHref = function (t, e, n, r) {
      var i = "/?server=" + t + ":" + e + ":" + n;
      if (r) {
        i += "&password=" + encodeURIComponent(r);
      }
      return i;
    };
    a.prototype.serverAddress = function (t, e) {
      if (t == "127.0.0.1" || t == "7f000001" || t == "903d62ef5d1c2fecdcaeb5e7dd485eff") {
        return window.location.hostname;
      } else if (this.rawIPs) {
        if (e) {
          return "ip_" + this.hashIP(t) + "." + this.baseUrl;
        } else {
          return t;
        }
      } else {
        return "ip_" + t + "." + this.baseUrl;
      }
    };
    a.prototype.serverPort = function (t) {
      if (t.region == 0) {
        return this.devPort;
      } else if (location.protocol.startsWith("https")) {
        return 443;
      } else {
        return 80;
      }
    };
    a.prototype.processServers = function (t) {
      var e = {};
      for (var n = 0; n < t.length; n++) {
        var r = t[n];
        var i = e[r.region];
        if (i == undefined) {
          i = [];
          e[r.region] = i;
        }
        i.push(r);
      }
      for (var a in e) {
        e[a] = e[a].sort(function (t, e) {
          return t.index - e.index;
        });
      }
      this.servers = e;
    };
    a.prototype.ipToHex = function (t) {
      return t.split(".").map(t => ("00" + parseInt(t).toString(16)).substr(-2)).join("").toLowerCase();
    };
    a.prototype.hashIP = function (t) {
      return i(this.ipToHex(t));
    };
    a.prototype.log = function () {
      if (this.debugLog) {
        return console.log.apply(undefined, arguments);
      } else if (console.verbose) {
        return console.verbose.apply(undefined, arguments);
      } else {
        return undefined;
      }
    };
    window.testVultrClient = function () {
      var t = 1;
      function e(e, n) {
        if ((e = `${e}`) == (n = `${n}`)) {
          console.log(`Assert ${t} passed.`);
        } else {
          console.warn(`Assert ${t} failed. Expected ${n}, got ${e}.`);
        }
        t++;
      }
      var n = new a("test.io", -1, 5, 1, false);
      n.errorCallback = function (t) {};
      n.processServers(function (t) {
        var e = [];
        for (var n in t) {
          for (var r = t[n], i = 0; i < r.length; i++) {
            e.push({
              ip: n + ":" + i,
              scheme: "testing",
              region: n,
              index: i,
              games: r[i].map(t => ({
                playerCount: t,
                isPrivate: false
              }))
            });
          }
        }
        return e;
      }({
        1: [[0, 0, 0, 0], [0, 0, 0, 0]],
        2: [[5, 1, 0, 0], [0, 0, 0, 0]],
        3: [[5, 0, 1, 5], [0, 0, 0, 0]],
        4: [[5, 1, 1, 5], [1, 0, 0, 0]],
        5: [[5, 1, 1, 5], [1, 0, 4, 0]],
        6: [[5, 5, 5, 5], [2, 3, 1, 4]],
        7: [[5, 5, 5, 5], [5, 5, 5, 5]]
      }));
      e(n.seekServer(1, false), [1, 0, 0]);
      e(n.seekServer(1, true), [1, 1, 3]);
      e(n.seekServer(2, false), [2, 0, 1]);
      e(n.seekServer(2, true), [2, 1, 3]);
      e(n.seekServer(3, false), [3, 0, 2]);
      e(n.seekServer(3, true), [3, 1, 3]);
      e(n.seekServer(4, false), [4, 0, 1]);
      e(n.seekServer(4, true), [4, 1, 3]);
      e(n.seekServer(5, false), [5, 1, 2]);
      e(n.seekServer(5, true), [5, 1, 3]);
      e(n.seekServer(6, false), [6, 1, 3]);
      e(n.seekServer(6, true), undefined);
      e(n.seekServer(7, false), undefined);
      e(n.seekServer(7, true), undefined);
      console.log("Tests passed.");
    };
    function o(t, e) {
      return t.concat(e);
    }
    Array.prototype.flatMap = function (t) {
      return function (t, e) {
        return e.map(t).reduce(o, []);
      }(t, this);
    };
    t.exports = a;
  }, function (t, e, n) {
    "use strict";

    var r = n(41);
    var i = n(43);
    function a() {
      this.protocol = null;
      this.slashes = null;
      this.auth = null;
      this.host = null;
      this.port = null;
      this.hostname = null;
      this.hash = null;
      this.search = null;
      this.query = null;
      this.pathname = null;
      this.path = null;
      this.href = null;
    }
    e.parse = x;
    e.resolve = function (t, e) {
      return x(t, false, true).resolve(e);
    };
    e.resolveObject = function (t, e) {
      if (t) {
        return x(t, false, true).resolveObject(e);
      } else {
        return e;
      }
    };
    e.format = function (t) {
      if (i.isString(t)) {
        t = x(t);
      }
      if (t instanceof a) {
        return t.format();
      } else {
        return a.prototype.format.call(t);
      }
    };
    e.Url = a;
    var o = /^([a-z0-9.+-]+:)/i;
    var s = /:[0-9]*$/;
    var l = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/;
    var c = ["{", "}", "|", "\\", "^", "`"].concat(["<", ">", "\"", "`", " ", "\r", "\n", "\t"]);
    var h = ["'"].concat(c);
    var u = ["%", "/", "?", ";", "#"].concat(h);
    var f = ["/", "?", "#"];
    var d = /^[+a-z0-9A-Z_-]{0,63}$/;
    var p = /^([+a-z0-9A-Z_-]{0,63})(.*)$/;
    var m = {
      javascript: true,
      "javascript:": true
    };
    var y = {
      javascript: true,
      "javascript:": true
    };
    var v = {
      http: true,
      https: true,
      ftp: true,
      gopher: true,
      file: true,
      "http:": true,
      "https:": true,
      "ftp:": true,
      "gopher:": true,
      "file:": true
    };
    var g = n(44);
    function x(t, e, n) {
      if (t && i.isObject(t) && t instanceof a) {
        return t;
      }
      var r = new a();
      r.parse(t, e, n);
      return r;
    }
    a.prototype.parse = function (t, e, n) {
      if (!i.isString(t)) {
        throw new TypeError("Parameter 'url' must be a string, not " + typeof t);
      }
      var a = t.indexOf("?");
      var s = a !== -1 && a < t.indexOf("#") ? "?" : "#";
      var c = t.split(s);
      c[0] = c[0].replace(/\\/g, "/");
      var x = t = c.join(s);
      x = x.trim();
      if (!n && t.split("#").length === 1) {
        var w = l.exec(x);
        if (w) {
          this.path = x;
          this.href = x;
          this.pathname = w[1];
          if (w[2]) {
            this.search = w[2];
            this.query = e ? g.parse(this.search.substr(1)) : this.search.substr(1);
          } else if (e) {
            this.search = "";
            this.query = {};
          }
          return this;
        }
      }
      var b = o.exec(x);
      if (b) {
        var S = (b = b[0]).toLowerCase();
        this.protocol = S;
        x = x.substr(b.length);
      }
      if (n || b || x.match(/^\/\/[^@\/]+@[^@\/]+/)) {
        var k = x.substr(0, 2) === "//";
        if (!!k && (!b || !y[b])) {
          x = x.substr(2);
          this.slashes = true;
        }
      }
      if (!y[b] && (k || b && !v[b])) {
        var M;
        var E;
        var I = -1;
        for (var C = 0; C < f.length; C++) {
          if ((A = x.indexOf(f[C])) !== -1 && (I === -1 || A < I)) {
            I = A;
          }
        }
        if ((E = I === -1 ? x.lastIndexOf("@") : x.lastIndexOf("@", I)) !== -1) {
          M = x.slice(0, E);
          x = x.slice(E + 1);
          this.auth = decodeURIComponent(M);
        }
        I = -1;
        C = 0;
        for (; C < u.length; C++) {
          var A;
          if ((A = x.indexOf(u[C])) !== -1 && (I === -1 || A < I)) {
            I = A;
          }
        }
        if (I === -1) {
          I = x.length;
        }
        this.host = x.slice(0, I);
        x = x.slice(I);
        this.parseHost();
        this.hostname = this.hostname || "";
        var T = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
        if (!T) {
          var P = this.hostname.split(/\./);
          C = 0;
          for (var O = P.length; C < O; C++) {
            var B = P[C];
            if (B && !B.match(d)) {
              var _ = "";
              for (var R = 0, L = B.length; R < L; R++) {
                if (B.charCodeAt(R) > 127) {
                  _ += "x";
                } else {
                  _ += B[R];
                }
              }
              if (!_.match(d)) {
                var D = P.slice(0, C);
                var U = P.slice(C + 1);
                var j = B.match(p);
                if (j) {
                  D.push(j[1]);
                  U.unshift(j[2]);
                }
                if (U.length) {
                  x = "/" + U.join(".") + x;
                }
                this.hostname = D.join(".");
                break;
              }
            }
          }
        }
        if (this.hostname.length > 255) {
          this.hostname = "";
        } else {
          this.hostname = this.hostname.toLowerCase();
        }
        if (!T) {
          this.hostname = r.toASCII(this.hostname);
        }
        var H = this.port ? ":" + this.port : "";
        var Y = this.hostname || "";
        this.host = Y + H;
        this.href += this.host;
        if (T) {
          this.hostname = this.hostname.substr(1, this.hostname.length - 2);
          if (x[0] !== "/") {
            x = "/" + x;
          }
        }
      }
      if (!m[S]) {
        C = 0;
        O = h.length;
        for (; C < O; C++) {
          var W = h[C];
          if (x.indexOf(W) !== -1) {
            var N = encodeURIComponent(W);
            if (N === W) {
              N = escape(W);
            }
            x = x.split(W).join(N);
          }
        }
      }
      var F = x.indexOf("#");
      if (F !== -1) {
        this.hash = x.substr(F);
        x = x.slice(0, F);
      }
      var X = x.indexOf("?");
      if (X !== -1) {
        this.search = x.substr(X);
        this.query = x.substr(X + 1);
        if (e) {
          this.query = g.parse(this.query);
        }
        x = x.slice(0, X);
      } else if (e) {
        this.search = "";
        this.query = {};
      }
      if (x) {
        this.pathname = x;
      }
      if (v[S] && this.hostname && !this.pathname) {
        this.pathname = "/";
      }
      if (this.pathname || this.search) {
        H = this.pathname || "";
        var V = this.search || "";
        this.path = H + V;
      }
      this.href = this.format();
      return this;
    };
    a.prototype.format = function () {
      var t = this.auth || "";
      if (t) {
        t = (t = encodeURIComponent(t)).replace(/%3A/i, ":");
        t += "@";
      }
      var e = this.protocol || "";
      var n = this.pathname || "";
      var r = this.hash || "";
      var a = false;
      var o = "";
      if (this.host) {
        a = t + this.host;
      } else if (this.hostname) {
        a = t + (this.hostname.indexOf(":") === -1 ? this.hostname : "[" + this.hostname + "]");
        if (this.port) {
          a += ":" + this.port;
        }
      }
      if (this.query && i.isObject(this.query) && Object.keys(this.query).length) {
        o = g.stringify(this.query);
      }
      var s = this.search || o && "?" + o || "";
      if (e && e.substr(-1) !== ":") {
        e += ":";
      }
      if (this.slashes || (!e || v[e]) && a !== false) {
        a = "//" + (a || "");
        if (n && n.charAt(0) !== "/") {
          n = "/" + n;
        }
      } else {
        a ||= "";
      }
      if (r && r.charAt(0) !== "#") {
        r = "#" + r;
      }
      if (s && s.charAt(0) !== "?") {
        s = "?" + s;
      }
      return e + a + (n = n.replace(/[?#]/g, function (t) {
        return encodeURIComponent(t);
      })) + (s = s.replace("#", "%23")) + r;
    };
    a.prototype.resolve = function (t) {
      return this.resolveObject(x(t, false, true)).format();
    };
    a.prototype.resolveObject = function (t) {
      if (i.isString(t)) {
        var e = new a();
        e.parse(t, false, true);
        t = e;
      }
      var n = new a();
      for (var r = Object.keys(this), o = 0; o < r.length; o++) {
        var s = r[o];
        n[s] = this[s];
      }
      n.hash = t.hash;
      if (t.href === "") {
        n.href = n.format();
        return n;
      }
      if (t.slashes && !t.protocol) {
        for (var l = Object.keys(t), c = 0; c < l.length; c++) {
          var h = l[c];
          if (h !== "protocol") {
            n[h] = t[h];
          }
        }
        if (v[n.protocol] && n.hostname && !n.pathname) {
          n.path = n.pathname = "/";
        }
        n.href = n.format();
        return n;
      }
      if (t.protocol && t.protocol !== n.protocol) {
        if (!v[t.protocol]) {
          for (var u = Object.keys(t), f = 0; f < u.length; f++) {
            var d = u[f];
            n[d] = t[d];
          }
          n.href = n.format();
          return n;
        }
        n.protocol = t.protocol;
        if (t.host || y[t.protocol]) {
          n.pathname = t.pathname;
        } else {
          for (var p = (t.pathname || "").split("/"); p.length && !(t.host = p.shift()););
          t.host ||= "";
          t.hostname ||= "";
          if (p[0] !== "") {
            p.unshift("");
          }
          if (p.length < 2) {
            p.unshift("");
          }
          n.pathname = p.join("/");
        }
        n.search = t.search;
        n.query = t.query;
        n.host = t.host || "";
        n.auth = t.auth;
        n.hostname = t.hostname || t.host;
        n.port = t.port;
        if (n.pathname || n.search) {
          var m = n.pathname || "";
          var g = n.search || "";
          n.path = m + g;
        }
        n.slashes = n.slashes || t.slashes;
        n.href = n.format();
        return n;
      }
      var x = n.pathname && n.pathname.charAt(0) === "/";
      var w = t.host || t.pathname && t.pathname.charAt(0) === "/";
      var b = w || x || n.host && t.pathname;
      var S = b;
      var k = n.pathname && n.pathname.split("/") || [];
      p = t.pathname && t.pathname.split("/") || [];
      var M = n.protocol && !v[n.protocol];
      if (M) {
        n.hostname = "";
        n.port = null;
        if (n.host) {
          if (k[0] === "") {
            k[0] = n.host;
          } else {
            k.unshift(n.host);
          }
        }
        n.host = "";
        if (t.protocol) {
          t.hostname = null;
          t.port = null;
          if (t.host) {
            if (p[0] === "") {
              p[0] = t.host;
            } else {
              p.unshift(t.host);
            }
          }
          t.host = null;
        }
        b = b && (p[0] === "" || k[0] === "");
      }
      if (w) {
        n.host = t.host || t.host === "" ? t.host : n.host;
        n.hostname = t.hostname || t.hostname === "" ? t.hostname : n.hostname;
        n.search = t.search;
        n.query = t.query;
        k = p;
      } else if (p.length) {
        k ||= [];
        k.pop();
        k = k.concat(p);
        n.search = t.search;
        n.query = t.query;
      } else if (!i.isNullOrUndefined(t.search)) {
        if (M) {
          n.hostname = n.host = k.shift();
          if (T = !!n.host && !!(n.host.indexOf("@") > 0) && n.host.split("@")) {
            n.auth = T.shift();
            n.host = n.hostname = T.shift();
          }
        }
        n.search = t.search;
        n.query = t.query;
        if (!i.isNull(n.pathname) || !i.isNull(n.search)) {
          n.path = (n.pathname ? n.pathname : "") + (n.search ? n.search : "");
        }
        n.href = n.format();
        return n;
      }
      if (!k.length) {
        n.pathname = null;
        if (n.search) {
          n.path = "/" + n.search;
        } else {
          n.path = null;
        }
        n.href = n.format();
        return n;
      }
      var E = k.slice(-1)[0];
      var I = (n.host || t.host || k.length > 1) && (E === "." || E === "..") || E === "";
      var C = 0;
      for (var A = k.length; A >= 0; A--) {
        if ((E = k[A]) === ".") {
          k.splice(A, 1);
        } else if (E === "..") {
          k.splice(A, 1);
          C++;
        } else if (C) {
          k.splice(A, 1);
          C--;
        }
      }
      if (!b && !S) {
        for (; C--; C) {
          k.unshift("..");
        }
      }
      if (!!b && k[0] !== "" && (!k[0] || k[0].charAt(0) !== "/")) {
        k.unshift("");
      }
      if (I && k.join("/").substr(-1) !== "/") {
        k.push("");
      }
      var T;
      var P = k[0] === "" || k[0] && k[0].charAt(0) === "/";
      if (M) {
        n.hostname = n.host = P ? "" : k.length ? k.shift() : "";
        if (T = !!n.host && !!(n.host.indexOf("@") > 0) && n.host.split("@")) {
          n.auth = T.shift();
          n.host = n.hostname = T.shift();
        }
      }
      if ((b = b || n.host && k.length) && !P) {
        k.unshift("");
      }
      if (k.length) {
        n.pathname = k.join("/");
      } else {
        n.pathname = null;
        n.path = null;
      }
      if (!i.isNull(n.pathname) || !i.isNull(n.search)) {
        n.path = (n.pathname ? n.pathname : "") + (n.search ? n.search : "");
      }
      n.auth = t.auth || n.auth;
      n.slashes = n.slashes || t.slashes;
      n.href = n.format();
      return n;
    };
    a.prototype.parseHost = function () {
      var t = this.host;
      var e = s.exec(t);
      if (e) {
        if ((e = e[0]) !== ":") {
          this.port = e.substr(1);
        }
        t = t.substr(0, t.length - e.length);
      }
      if (t) {
        this.hostname = t;
      }
    };
  }, function (t, e, n) {
    (function (t, r) {
      var i; /*! https://mths.be/punycode v1.4.1 by @mathias */
      (function (a) {
        if (typeof e == "object" && e) {
          e.nodeType;
        }
        if (typeof t == "object" && t) {
          t.nodeType;
        }
        var o = typeof r == "object" && r;
        if (o.global !== o && o.window !== o) {
          o.self;
        }
        var s;
        var l = 2147483647;
        var c = 36;
        var h = 1;
        var u = 26;
        var f = 38;
        var d = 700;
        var p = 72;
        var m = 128;
        var y = "-";
        var v = /^xn--/;
        var g = /[^\x20-\x7E]/;
        var x = /[\x2E\u3002\uFF0E\uFF61]/g;
        var w = {
          overflow: "Overflow: input needs wider integers to process",
          "not-basic": "Illegal input >= 0x80 (not a basic code point)",
          "invalid-input": "Invalid input"
        };
        var b = c - h;
        var S = Math.floor;
        var k = String.fromCharCode;
        function M(t) {
          throw new RangeError(w[t]);
        }
        function E(t, e) {
          for (var n = t.length, r = []; n--;) {
            r[n] = e(t[n]);
          }
          return r;
        }
        function I(t, e) {
          var n = t.split("@");
          var r = "";
          if (n.length > 1) {
            r = n[0] + "@";
            t = n[1];
          }
          return r + E((t = t.replace(x, ".")).split("."), e).join(".");
        }
        function C(t) {
          for (var e, n, r = [], i = 0, a = t.length; i < a;) {
            if ((e = t.charCodeAt(i++)) >= 55296 && e <= 56319 && i < a) {
              if (((n = t.charCodeAt(i++)) & 64512) == 56320) {
                r.push(((e & 1023) << 10) + (n & 1023) + 65536);
              } else {
                r.push(e);
                i--;
              }
            } else {
              r.push(e);
            }
          }
          return r;
        }
        function A(t) {
          return E(t, function (t) {
            var e = "";
            if (t > 65535) {
              e += k((t -= 65536) >>> 10 & 1023 | 55296);
              t = t & 1023 | 56320;
            }
            return e + k(t);
          }).join("");
        }
        function T(t) {
          if (t - 48 < 10) {
            return t - 22;
          } else if (t - 65 < 26) {
            return t - 65;
          } else if (t - 97 < 26) {
            return t - 97;
          } else {
            return c;
          }
        }
        function P(t, e) {
          return t + 22 + (t < 26) * 75 - ((e != 0) << 5);
        }
        function O(t, e, n) {
          var r = 0;
          t = n ? S(t / d) : t >> 1;
          t += S(t / e);
          for (; t > b * u >> 1; r += c) {
            t = S(t / b);
          }
          return S(r + (b + 1) * t / (t + f));
        }
        function B(t) {
          var e;
          var n;
          var r;
          var i;
          var a;
          var o;
          var s;
          var f;
          var d;
          var v;
          var g = [];
          var x = t.length;
          var w = 0;
          var b = m;
          var k = p;
          if ((n = t.lastIndexOf(y)) < 0) {
            n = 0;
          }
          r = 0;
          for (; r < n; ++r) {
            if (t.charCodeAt(r) >= 128) {
              M("not-basic");
            }
            g.push(t.charCodeAt(r));
          }
          for (i = n > 0 ? n + 1 : 0; i < x;) {
            a = w;
            o = 1;
            s = c;
            for (; i >= x && M("invalid-input"), ((f = T(t.charCodeAt(i++))) >= c || f > S((l - w) / o)) && M("overflow"), w += f * o, !(f < (d = s <= k ? h : s >= k + u ? u : s - k)); s += c) {
              if (o > S(l / (v = c - d))) {
                M("overflow");
              }
              o *= v;
            }
            k = O(w - a, e = g.length + 1, a == 0);
            if (S(w / e) > l - b) {
              M("overflow");
            }
            b += S(w / e);
            w %= e;
            g.splice(w++, 0, b);
          }
          return A(g);
        }
        function _(t) {
          var e;
          var n;
          var r;
          var i;
          var a;
          var o;
          var s;
          var f;
          var d;
          var v;
          var g;
          var x;
          var w;
          var b;
          var E;
          var I = [];
          x = (t = C(t)).length;
          e = m;
          n = 0;
          a = p;
          o = 0;
          for (; o < x; ++o) {
            if ((g = t[o]) < 128) {
              I.push(k(g));
            }
          }
          r = i = I.length;
          if (i) {
            I.push(y);
          }
          while (r < x) {
            s = l;
            o = 0;
            for (; o < x; ++o) {
              if ((g = t[o]) >= e && g < s) {
                s = g;
              }
            }
            if (s - e > S((l - n) / (w = r + 1))) {
              M("overflow");
            }
            n += (s - e) * w;
            e = s;
            o = 0;
            for (; o < x; ++o) {
              if ((g = t[o]) < e && ++n > l) {
                M("overflow");
              }
              if (g == e) {
                f = n;
                d = c;
                for (; !(f < (v = d <= a ? h : d >= a + u ? u : d - a)); d += c) {
                  E = f - v;
                  b = c - v;
                  I.push(k(P(v + E % b, 0)));
                  f = S(E / b);
                }
                I.push(k(P(f, 0)));
                a = O(n, w, r == i);
                n = 0;
                ++r;
              }
            }
            ++n;
            ++e;
          }
          return I.join("");
        }
        s = {
          version: "1.4.1",
          ucs2: {
            decode: C,
            encode: A
          },
          decode: B,
          encode: _,
          toASCII: function (t) {
            return I(t, function (t) {
              if (g.test(t)) {
                return "xn--" + _(t);
              } else {
                return t;
              }
            });
          },
          toUnicode: function (t) {
            return I(t, function (t) {
              if (v.test(t)) {
                return B(t.slice(4).toLowerCase());
              } else {
                return t;
              }
            });
          }
        };
        if ((i = function () {
          return s;
        }.call(e, n, e, t)) !== undefined) {
          t.exports = i;
        }
      })();
    }).call(this, n(42)(t), n(13));
  }, function (t, e) {
    t.exports = function (t) {
      if (!t.webpackPolyfill) {
        t.deprecate = function () {};
        t.paths = [];
        t.children ||= [];
        Object.defineProperty(t, "loaded", {
          enumerable: true,
          get: function () {
            return t.l;
          }
        });
        Object.defineProperty(t, "id", {
          enumerable: true,
          get: function () {
            return t.i;
          }
        });
        t.webpackPolyfill = 1;
      }
      return t;
    };
  }, function (t, e, n) {
    "use strict";

    t.exports = {
      isString: function (t) {
        return typeof t == "string";
      },
      isObject: function (t) {
        return typeof t == "object" && t !== null;
      },
      isNull: function (t) {
        return t === null;
      },
      isNullOrUndefined: function (t) {
        return t == null;
      }
    };
  }, function (t, e, n) {
    "use strict";

    e.decode = e.parse = n(45);
    e.encode = e.stringify = n(46);
  }, function (t, e, n) {
    "use strict";

    function r(t, e) {
      return Object.prototype.hasOwnProperty.call(t, e);
    }
    t.exports = function (t, e, n, a) {
      e = e || "&";
      n = n || "=";
      var o = {};
      if (typeof t != "string" || t.length === 0) {
        return o;
      }
      var s = /\+/g;
      t = t.split(e);
      var l = 1000;
      if (a && typeof a.maxKeys == "number") {
        l = a.maxKeys;
      }
      var c = t.length;
      if (l > 0 && c > l) {
        c = l;
      }
      for (var h = 0; h < c; ++h) {
        var u;
        var f;
        var d;
        var p;
        var m = t[h].replace(s, "%20");
        var y = m.indexOf(n);
        if (y >= 0) {
          u = m.substr(0, y);
          f = m.substr(y + 1);
        } else {
          u = m;
          f = "";
        }
        d = decodeURIComponent(u);
        p = decodeURIComponent(f);
        if (r(o, d)) {
          if (i(o[d])) {
            o[d].push(p);
          } else {
            o[d] = [o[d], p];
          }
        } else {
          o[d] = p;
        }
      }
      return o;
    };
    var i = Array.isArray || function (t) {
      return Object.prototype.toString.call(t) === "[object Array]";
    };
  }, function (t, e, n) {
    "use strict";

    function r(t) {
      switch (typeof t) {
        case "string":
          return t;
        case "boolean":
          if (t) {
            return "true";
          } else {
            return "false";
          }
        case "number":
          if (isFinite(t)) {
            return t;
          } else {
            return "";
          }
        default:
          return "";
      }
    }
    t.exports = function (t, e, n, s) {
      e = e || "&";
      n = n || "=";
      if (t === null) {
        t = undefined;
      }
      if (typeof t == "object") {
        return a(o(t), function (o) {
          var s = encodeURIComponent(r(o)) + n;
          if (i(t[o])) {
            return a(t[o], function (t) {
              return s + encodeURIComponent(r(t));
            }).join(e);
          } else {
            return s + encodeURIComponent(r(t[o]));
          }
        }).join(e);
      } else if (s) {
        return encodeURIComponent(r(s)) + n + encodeURIComponent(r(t));
      } else {
        return "";
      }
    };
    var i = Array.isArray || function (t) {
      return Object.prototype.toString.call(t) === "[object Array]";
    };
    function a(t, e) {
      if (t.map) {
        return t.map(e);
      }
      var n = [];
      for (var r = 0; r < t.length; r++) {
        n.push(e(t[r], r));
      }
      return n;
    }
    var o = Object.keys || function (t) {
      var e = [];
      for (var n in t) {
        if (Object.prototype.hasOwnProperty.call(t, n)) {
          e.push(n);
        }
      }
      return e;
    };
  }, function (t, e, n) {
    (function () {
      var e = n(48);
      var r = n(20).utf8;
      var i = n(49);
      var a = n(20).bin;
      function o(t, n) {
        if (t.constructor == String) {
          t = n && n.encoding === "binary" ? a.stringToBytes(t) : r.stringToBytes(t);
        } else if (i(t)) {
          t = Array.prototype.slice.call(t, 0);
        } else if (!Array.isArray(t)) {
          t = t.toString();
        }
        for (var s = e.bytesToWords(t), l = t.length * 8, c = 1732584193, h = -271733879, u = -1732584194, f = 271733878, d = 0; d < s.length; d++) {
          s[d] = (s[d] << 8 | s[d] >>> 24) & 16711935 | (s[d] << 24 | s[d] >>> 8) & -16711936;
        }
        s[l >>> 5] |= 128 << l % 32;
        s[14 + (l + 64 >>> 9 << 4)] = l;
        var p = o._ff;
        var m = o._gg;
        var y = o._hh;
        var v = o._ii;
        for (d = 0; d < s.length; d += 16) {
          var g = c;
          var x = h;
          var w = u;
          var b = f;
          h = v(h = v(h = v(h = v(h = y(h = y(h = y(h = y(h = m(h = m(h = m(h = m(h = p(h = p(h = p(h = p(h, u = p(u, f = p(f, c = p(c, h, u, f, s[d + 0], 7, -680876936), h, u, s[d + 1], 12, -389564586), c, h, s[d + 2], 17, 606105819), f, c, s[d + 3], 22, -1044525330), u = p(u, f = p(f, c = p(c, h, u, f, s[d + 4], 7, -176418897), h, u, s[d + 5], 12, 1200080426), c, h, s[d + 6], 17, -1473231341), f, c, s[d + 7], 22, -45705983), u = p(u, f = p(f, c = p(c, h, u, f, s[d + 8], 7, 1770035416), h, u, s[d + 9], 12, -1958414417), c, h, s[d + 10], 17, -42063), f, c, s[d + 11], 22, -1990404162), u = p(u, f = p(f, c = p(c, h, u, f, s[d + 12], 7, 1804603682), h, u, s[d + 13], 12, -40341101), c, h, s[d + 14], 17, -1502002290), f, c, s[d + 15], 22, 1236535329), u = m(u, f = m(f, c = m(c, h, u, f, s[d + 1], 5, -165796510), h, u, s[d + 6], 9, -1069501632), c, h, s[d + 11], 14, 643717713), f, c, s[d + 0], 20, -373897302), u = m(u, f = m(f, c = m(c, h, u, f, s[d + 5], 5, -701558691), h, u, s[d + 10], 9, 38016083), c, h, s[d + 15], 14, -660478335), f, c, s[d + 4], 20, -405537848), u = m(u, f = m(f, c = m(c, h, u, f, s[d + 9], 5, 568446438), h, u, s[d + 14], 9, -1019803690), c, h, s[d + 3], 14, -187363961), f, c, s[d + 8], 20, 1163531501), u = m(u, f = m(f, c = m(c, h, u, f, s[d + 13], 5, -1444681467), h, u, s[d + 2], 9, -51403784), c, h, s[d + 7], 14, 1735328473), f, c, s[d + 12], 20, -1926607734), u = y(u, f = y(f, c = y(c, h, u, f, s[d + 5], 4, -378558), h, u, s[d + 8], 11, -2022574463), c, h, s[d + 11], 16, 1839030562), f, c, s[d + 14], 23, -35309556), u = y(u, f = y(f, c = y(c, h, u, f, s[d + 1], 4, -1530992060), h, u, s[d + 4], 11, 1272893353), c, h, s[d + 7], 16, -155497632), f, c, s[d + 10], 23, -1094730640), u = y(u, f = y(f, c = y(c, h, u, f, s[d + 13], 4, 681279174), h, u, s[d + 0], 11, -358537222), c, h, s[d + 3], 16, -722521979), f, c, s[d + 6], 23, 76029189), u = y(u, f = y(f, c = y(c, h, u, f, s[d + 9], 4, -640364487), h, u, s[d + 12], 11, -421815835), c, h, s[d + 15], 16, 530742520), f, c, s[d + 2], 23, -995338651), u = v(u, f = v(f, c = v(c, h, u, f, s[d + 0], 6, -198630844), h, u, s[d + 7], 10, 1126891415), c, h, s[d + 14], 15, -1416354905), f, c, s[d + 5], 21, -57434055), u = v(u, f = v(f, c = v(c, h, u, f, s[d + 12], 6, 1700485571), h, u, s[d + 3], 10, -1894986606), c, h, s[d + 10], 15, -1051523), f, c, s[d + 1], 21, -2054922799), u = v(u, f = v(f, c = v(c, h, u, f, s[d + 8], 6, 1873313359), h, u, s[d + 15], 10, -30611744), c, h, s[d + 6], 15, -1560198380), f, c, s[d + 13], 21, 1309151649), u = v(u, f = v(f, c = v(c, h, u, f, s[d + 4], 6, -145523070), h, u, s[d + 11], 10, -1120210379), c, h, s[d + 2], 15, 718787259), f, c, s[d + 9], 21, -343485551);
          c = c + g >>> 0;
          h = h + x >>> 0;
          u = u + w >>> 0;
          f = f + b >>> 0;
        }
        return e.endian([c, h, u, f]);
      }
      o._ff = function (t, e, n, r, i, a, o) {
        var s = t + (e & n | ~e & r) + (i >>> 0) + o;
        return (s << a | s >>> 32 - a) + e;
      };
      o._gg = function (t, e, n, r, i, a, o) {
        var s = t + (e & r | n & ~r) + (i >>> 0) + o;
        return (s << a | s >>> 32 - a) + e;
      };
      o._hh = function (t, e, n, r, i, a, o) {
        var s = t + (e ^ n ^ r) + (i >>> 0) + o;
        return (s << a | s >>> 32 - a) + e;
      };
      o._ii = function (t, e, n, r, i, a, o) {
        var s = t + (n ^ (e | ~r)) + (i >>> 0) + o;
        return (s << a | s >>> 32 - a) + e;
      };
      o._blocksize = 16;
      o._digestsize = 16;
      t.exports = function (t, n) {
        if (t === undefined || t === null) {
          throw new Error("Illegal argument " + t);
        }
        var r = e.wordsToBytes(o(t, n));
        if (n && n.asBytes) {
          return r;
        } else if (n && n.asString) {
          return a.bytesToString(r);
        } else {
          return e.bytesToHex(r);
        }
      };
    })();
  }, function (t, e) {
    (function () {
      var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var n = {
        rotl: function (t, e) {
          return t << e | t >>> 32 - e;
        },
        rotr: function (t, e) {
          return t << 32 - e | t >>> e;
        },
        endian: function (t) {
          if (t.constructor == Number) {
            return n.rotl(t, 8) & 16711935 | n.rotl(t, 24) & -16711936;
          }
          for (var e = 0; e < t.length; e++) {
            t[e] = n.endian(t[e]);
          }
          return t;
        },
        randomBytes: function (t) {
          var e = [];
          for (; t > 0; t--) {
            e.push(Math.floor(Math.random() * 256));
          }
          return e;
        },
        bytesToWords: function (t) {
          var e = [];
          for (var n = 0, r = 0; n < t.length; n++, r += 8) {
            e[r >>> 5] |= t[n] << 24 - r % 32;
          }
          return e;
        },
        wordsToBytes: function (t) {
          var e = [];
          for (var n = 0; n < t.length * 32; n += 8) {
            e.push(t[n >>> 5] >>> 24 - n % 32 & 255);
          }
          return e;
        },
        bytesToHex: function (t) {
          var e = [];
          for (var n = 0; n < t.length; n++) {
            e.push((t[n] >>> 4).toString(16));
            e.push((t[n] & 15).toString(16));
          }
          return e.join("");
        },
        hexToBytes: function (t) {
          var e = [];
          for (var n = 0; n < t.length; n += 2) {
            e.push(parseInt(t.substr(n, 2), 16));
          }
          return e;
        },
        bytesToBase64: function (t) {
          var n = [];
          for (var r = 0; r < t.length; r += 3) {
            var i = t[r] << 16 | t[r + 1] << 8 | t[r + 2];
            for (var a = 0; a < 4; a++) {
              if (r * 8 + a * 6 <= t.length * 8) {
                n.push(e.charAt(i >>> (3 - a) * 6 & 63));
              } else {
                n.push("=");
              }
            }
          }
          return n.join("");
        },
        base64ToBytes: function (t) {
          t = t.replace(/[^A-Z0-9+\/]/gi, "");
          var n = [];
          for (var r = 0, i = 0; r < t.length; i = ++r % 4) {
            if (i != 0) {
              n.push((e.indexOf(t.charAt(r - 1)) & Math.pow(2, i * -2 + 8) - 1) << i * 2 | e.indexOf(t.charAt(r)) >>> 6 - i * 2);
            }
          }
          return n;
        }
      };
      t.exports = n;
    })();
  }, function (t, e) {
    function n(t) {
      return !!t.constructor && typeof t.constructor.isBuffer == "function" && t.constructor.isBuffer(t);
    }
    /*!
     * Determine if an object is a Buffer
     *
     * @author   Feross Aboukhadijeh <https://feross.org>
     * @license  MIT
     */
    t.exports = function (t) {
      return t != null && (n(t) || function (t) {
        return typeof t.readFloatLE == "function" && typeof t.slice == "function" && n(t.slice(0, 0));
      }(t) || !!t._isBuffer);
    };
  }, function (t, e) {
    t.exports.obj = function (t, e, n) {
      n = n || {};
      this.id = t;
      this.name = e;
      this.kills = n.player_kills || 0;
      this.maxKills = n.player_max_kills || 0;
      this.deaths = n.player_deaths || 0;
      this.wins = n.player_wins || 0;
      this.games = n.player_games_played || 0;
      this.tokens = n.player_tokens || 0;
      this.xp = n.player_xp || 0;
      this.getLevel = function () {
        return Math.floor(Math.max(1, Math.sqrt(this.xp) * 0.08));
      };
      this.level = this.getLevel();
      this.getData = function () {
        return [this.id, this.kills, this.wins, this.games, this.maxKills, this.deaths, this.tokens, this.xp];
      };
      this.setData = function (t) {
        this.id = t[0];
        this.kills = t[1];
        this.wins = t[2];
        this.games = t[3];
        this.maxKills = t[4];
        this.deaths = t[5];
        this.tokens = t[6];
        this.xp = t[7];
        this.level = this.getLevel();
      };
    };
  }, function (t, e) {
    t.exports.moveKeys = {
      87: {
        i: "up",
        d: [0, -1]
      },
      38: {
        i: "up",
        d: [0, -1]
      },
      83: {
        i: "down",
        d: [0, 1]
      },
      40: {
        i: "down",
        d: [0, 1]
      },
      65: {
        i: "left",
        d: [-1, 0]
      },
      37: {
        i: "left",
        d: [-1, 0]
      },
      68: {
        i: "right",
        d: [1, 0]
      },
      39: {
        i: "right",
        d: [1, 0]
      }
    };
    t.exports.keys = [16, 69, 70, 67, 32];
    t.exports.actions = [function (t, e, n) {
      t.sprint = n;
    }, function (t, e, n) {
      if (n) {
        t.mouseDown = 1;
        t.tryAttack = true;
      } else {
        t.mouseDown = 0;
      }
    }, function (t, e, n) {
      if (n) {
        if (t.vehicle) {
          t.vehicle.resetVehicle();
          var r = t.vehicle.dir;
          var i = t.vehicle.getWidth() + t.scale;
          t.x += i * Math.cos(r);
          t.y += i * Math.sin(r);
          t.vehicle = null;
        } else if (t.interact && t.interact.active && t.interact.interact) {
          var a = t.interact.interact(t, e);
          if (a > 0) {
            t.interact.active = false;
            e.disableObject(t.interact.sid);
          }
          if (a >= 0) {
            e.sendSound(t, 0, 0.7);
          }
        }
      }
      t.interact = null;
    }, function (t, e, n) {
      if (n) {
        e.dropWeapon(t);
      }
    }, function (t, e, n) {
      if (t) {
        t.alive;
      }
    }];
  }, function (t, e) {
    t.exports.obj = function (t, e, n, r, i) {
      this.account = null;
      this.id = t;
      this.sentTo = [];
      this.loadedObjects = [];
      this.isPlayer = true;
      this.lastSpectate = 0;
      this.projCounter = 0;
      this.mass = 0.1;
      this.init = function (t, n, r) {
        this.effects = [];
        this.effectTimers = {};
        this.effectDoers = {};
        this.stunned = false;
        this.name = t.name;
        this.spectating = null;
        this.spectateIndex = 0;
        this.vehicle = null;
        this.active = true;
        this.alive = true;
        this.didShowStats = 1;
        this.showStats = 1;
        this.stepCounter = e.stepCounter;
        this.maxStamina = e.startStamina;
        this.stamina = this.maxStamina;
        this.staminaRegen = e.staminaRegen;
        this.staminaDelay = 0;
        this.maxHealth = e.startHealth;
        this.health = this.maxHealth;
        this.kills = 0;
        this.deaths = 0;
        this.x = n;
        this.y = r;
        this.oldX = n;
        this.oldY = r;
        this.dir = 0;
        this.stepOffset = 0;
        this.stepAnimDir = 1;
        this.backpackIndex = 0;
        this.interact = null;
        this.movDir = null;
        this.mouseDown = 0;
        this.xVel = 0;
        this.yVel = 0;
        this.scale = e.playerScale;
        this.spdMlt = 1;
        this.sprint = false;
        this.dashCountdown = 0;
        this.dashSpd = 0;
        this.dashDir = null;
        this.chatCooldown = 0;
        this.loadedObjects.length = 0;
        this.sentTo.length = 0;
        this.sentTo.push(this.id);
        this.secCounter = 1000;
        this.ammos = [0, 0, 0];
        this.weapons = [0, 0];
        this.weaponRefs = [];
        this.weaponIndex = 0;
        this.scrollIndex = 0;
        this.reload = 0;
        this.reloads = {};
        this.swapTimer = 0;
        if (t.custom) {
          this.shirtIndex = t.custom[0];
          this.hatIndex = t.custom[1];
        }
        if (i) {
          i.applyCollider(this);
        }
      };
      this.getScale = function () {
        return this.scale;
      };
      this.getWidth = function () {
        return this.scale;
      };
      this.pushData = function (t) {
        t.push(this.sid, Math.round(this.x), Math.round(this.y), this.dir.round(2), this.weaponIndex, this.showStats, this.vehicle ? 1 : 0, this.backpackIndex);
      };
      this.getBigData = function () {
        return [this.name, Math.round(this.x), Math.round(this.y), Math.ceil(this.maxHealth), Math.ceil(this.health), this.shirtIndex, this.hatIndex, this.account ? this.account.level : 0];
      };
      this.update = function (t, n, a, o, s, l) {
        if (this.alive) {
          if (this.chatCooldown > 0) {
            this.chatCooldown -= t;
            if (this.chatCooldown <= 0) {
              this.chatCooldown = 0;
            }
          }
          this.didShowStats = this.showStats;
          this.showStats = 1;
          this.interact = null;
          this.oldX = this.x;
          this.oldY = this.y;
          if (this.reload > 0) {
            this.reload -= t;
            if (this.reload <= 0) {
              this.reload = 0;
              r.tryUse(this);
            }
          }
          if (this.vehicle) {
            if (!this.stunned) {
              var c = 0;
              var h = -Math.sin(this.movDir) / Math.sin(Math.PI / 4);
              var u = Math.cos(this.movDir) / Math.cos(Math.PI / 4);
              if (h < 0) {
                h *= 0.65;
              }
              if ((c = this.vehicle.speed * t * h) < 0 && this.vehicle.vel > 0 || c > 0 && this.vehicle.vel < 0) {
                this.vehicle.vel = 0;
              }
              this.vehicle.vel += c;
              this.vehicle.dir += this.vehicle.vel * 0.0021 * u * t;
              this.vehicle.dir %= Math.PI * 2;
              if (c) {
                this.vehicle.xVel += c * Math.cos(this.vehicle.dir - Math.PI / 2);
                this.vehicle.yVel += c * Math.sin(this.vehicle.dir - Math.PI / 2);
              }
            }
            this.dir = this.vehicle.dir - Math.PI / 2;
            this.x = this.vehicle.x - this.vehicle.sitOffset * Math.cos(this.dir);
            this.y = this.vehicle.y - this.vehicle.sitOffset * Math.sin(this.dir);
            this.xVel = 0;
            this.yVel = 0;
            this.sprint = false;
            this.tryAttack = false;
            this.mouseDown = false;
          }
          if (this.alive) {
            if (this.dashCountdown) {
              if (this.movDir != null) {
                this.dashDir = this.movDir;
              }
              this.dashCountdown -= t;
              if (this.dashCountdown <= 0) {
                this.dashDir = null;
                this.dashCountdown = 0;
              }
            } else if (this.sprint && this.movDir !== null && this.stamina > 0) {
              r.changeStamina(this, -e.sprintCost);
            } else {
              if (this.movDir !== null) {
                this.sprint = false;
              }
              if (this.staminaDelay > 0) {
                this.staminaDelay -= t;
                if (this.staminaDelay < 0) {
                  this.staminaDelay = 0;
                }
              } else {
                r.changeStamina(this, this.staminaRegen);
              }
            }
            if (!this.vehicle) {
              var f = r.getSpeedMult(this) * this.spdMlt;
              c = this.dashCountdown ? this.dashSpd : e.playerSpeed;
              this.spdMlt = 1;
              var d = 0;
              var p = 0;
              if (this.dashDir != null) {
                d = Math.cos(this.dashDir);
                p = Math.sin(this.dashDir);
              } else {
                d = this.movDir != null ? Math.cos(this.movDir) : 0;
                p = this.movDir != null ? Math.sin(this.movDir) : 0;
              }
              var m = Math.sqrt(d * d + p * p);
              if (m != 0) {
                d /= m;
                p /= m;
              }
              if (d) {
                this.xVel += d * f * c * t;
              }
              if (p) {
                this.yVel += p * f * c * t;
              }
              if (this.xVel) {
                this.x += this.xVel * t;
                this.xVel *= Math.pow(0.99, t);
              }
              if (this.yVel) {
                this.y += this.yVel * t;
                this.yVel *= Math.pow(0.99, t);
              }
              if (this.swapTimer) {
                this.swapTimer -= t;
                if (this.swapTimer <= 0) {
                  this.swapTimer = 0;
                }
                this.tryAttack = this.mouseDown;
              }
              if (!this.swapTimer) {
                r.tryAttack(this, n);
              }
            }
            i.updateCollider(this);
            this.secCounter -= t;
            if (this.secCounter <= 0) {
              this.secCounter = 1000 - this.secCounter;
              for (var y = this.effects.length - 1; y >= 0; --y) {
                if (this.effectTimers[this.effects[y]]) {
                  this.effectTimers[this.effects[y]] -= 1;
                  if (this.effectTimers[this.effects[y]] <= 0) {
                    r.removeEffect(this, this.effects[y]);
                  }
                }
              }
              var v = e.mapScale * s;
              if (this.x - this.scale <= a - v || this.x + this.scale >= a + v || this.y - this.scale <= o - v || this.y + this.scale >= o + v) {
                r.changeHealth(this, null, -e.borderDmg, 0, true);
              }
            }
          }
        }
      };
      this.dash = function () {
        if (!this.vehicle && this.movDir !== null && this.stamina > 0 && this.dashCountdown <= 0) {
          var t = Math.min(1, this.stamina / e.dashCost);
          this.dashCountdown = e.dashCountdown * t;
          this.dashSpd = e.dashSpeed * t;
          r.changeStamina(this, -e.dashCost);
        }
      };
      this.animate = function (t) {
        if (this.animTime) {
          this.animTime -= t;
          if (this.animTime <= 0) {
            this.animTime = this.dirPlus = this.animRatio = this.animIndex = 0;
          } else if (this.animIndex) {
            this.animRatio -= t / (this.animSpeed * (1 - this.hitReturn));
            this.dirPlus = n.lerp(0, this.targetAngle, Math.max(0, this.animRatio));
          } else {
            this.animRatio += t / (this.animSpeed * this.hitReturn);
            this.dirPlus = n.lerp(0, this.targetAngle, Math.min(1, this.animRatio));
            if (this.animRatio >= 1) {
              this.animRatio = this.animIndex = 1;
            }
          }
        }
      };
      this.startAnimation = function (t, e, n, r, i) {
        this.animType = e;
        this.animTime = this.animSpeed = t;
        this.animRatio = this.animIndex = i || 0;
        this.targetAngle = n;
        this.hitReturn = r || 0;
      };
      this.stopAnimation = function () {
        this.animTime = this.dirPlus = 0;
      };
      this.doCollisions = function (t) {
        for (var e = 0; e < t.length; ++e) {
          for (var n = 0; n < t[e].length; ++n) {
            this.resolveCollision(t[e][n]);
          }
        }
      };
      this.resolveCollision = function (t) {
        if (i.checkCollision(this, t, true) && (t.isPlayer || !t.interact || t.driver || (this.interact = t), t.cover && (this.didShowStats && (this.didShowStats = 0, r.sendSound(this, 2, 3.5, true), t.wiggleCount = 0), t.wiggleCount--, t.wiggleCount <= 0 && (t.wiggleCount = e.wiggleCount, r.sendWiggle(t)), this.spdMlt = 0.5, this.showStats = 0), !t.isPlayer && t.moved)) {
          var a = n.getDistance(0, 0, t.xVel, t.yVel);
          var o = n.getDirection(this.x, this.y, t.x, t.y);
          this.xVel += a * Math.cos(o);
          this.yVel += a * Math.sin(o);
          if ((a *= t.mass / this.mass * 10) >= e.minVelocityDmg) {
            r.changeHealth(this, t.driver ? r.findBySid(t.driver) : null, -a, t.dir);
          }
        }
      };
      this.followSpectating = function () {
        if (this.spectating) {
          this.x = this.spectating.x;
          this.y = this.spectating.y;
        }
      };
      this.canSee = function (t, n) {
        if (!t) {
          return false;
        }
        n = n || t.scale;
        var r = Math.abs(t.x - this.x) - (t.getWidth ? t.getWidth(true) : n) - e.maxScreenWidth * e.mouseSen - e.visionBuffer;
        var i = Math.abs(t.y - this.y) - n - e.maxScreenHeight * e.mouseSen - e.visionBuffer;
        return r <= e.maxScreenWidth / 2 && i <= e.maxScreenHeight / 2;
      };
    };
  }, function (t, e) {
    t.exports.data = [{
      name: "Fists",
      sound: "whoosh_0",
      dontSpawn: true,
      melee: true,
      dmg: 150,
      reload: 500,
      spdMlt: 1,
      xOff: 0,
      yOff: 0,
      range: 30,
      scale: 0.3,
      stance: 0
    }, {
      name: "Hunting Rifle",
      sound: "sniper_0",
      type: 1,
      rarity: 2,
      dmg: 800,
      reload: 700,
      bSpd: 1.3,
      ammo: 8,
      spdMlt: 1,
      xOff: 61,
      yOff: 10,
      lOff: 100,
      sOff: 70,
      range: 1300,
      scale: 0.3,
      shell: 2,
      stance: 2
    }, {
      name: "Steel Axe",
      sound: "whoosh_0",
      type: 0,
      rarity: 0,
      melee: true,
      dmg: 600,
      reload: 600,
      spdMlt: 1,
      xOff: 42,
      yOff: 20,
      range: 60,
      scale: 0.3,
      stance: 0
    }, {
      name: "Steel Hammer",
      sound: "whoosh_0",
      type: 0,
      rarity: 1,
      melee: true,
      dmg: 900,
      reload: 1100,
      spdMlt: 0.8,
      xOff: 38,
      yOff: 20,
      range: 60,
      scale: 0.3,
      stance: 0
    }, {
      name: "Steel Sword",
      sound: "whoosh_0",
      type: 0,
      rarity: 0,
      melee: true,
      dmg: 600,
      reload: 600,
      spdMlt: 1,
      xOff: 38,
      yOff: 47,
      range: 100,
      scale: 0.3,
      stance: 0
    }, {
      name: "Shotgun",
      sound: "shotgun_0",
      type: 0,
      rarity: 0,
      dmg: 240,
      reload: 700,
      bCount: 3,
      spread: 0.15,
      bSpd: 1,
      ammo: 10,
      spdMlt: 1,
      xOff: 61,
      yOff: 14,
      lOff: 90,
      sOff: 55,
      range: 1000,
      scale: 0.3,
      shell: 1,
      stance: 2
    }, {
      name: "Submachine Gun",
      sound: "smg_0",
      type: 0,
      rarity: 0,
      dmg: 200,
      reload: 200,
      ammo: 30,
      spread: 0.08,
      spdMlt: 1,
      xOff: 61,
      yOff: 14,
      lOff: 100,
      sOff: 70,
      range: 1100,
      scale: 0.3,
      stance: 2
    }, {
      name: "Pistol",
      sound: "fire_1",
      type: 0,
      rarity: 0,
      dmg: 300,
      reload: 400,
      bSpd: 1,
      ammo: 20,
      spdMlt: 1.05,
      xOff: 72,
      yOff: 0,
      lOff: 80,
      sOff: 35,
      range: 1000,
      scale: 0.3,
      stance: 1
    }, {
      name: "Crossbow",
      sound: "arrow_1",
      type: 0,
      rarity: 1,
      dmg: 960,
      reload: 1000,
      bIndx: 1,
      bScl: 0.55,
      bSpd: 0.55,
      ammo: 4,
      spdMlt: 1,
      xOff: 50,
      yOff: 14,
      lOff: 80,
      range: 1100,
      scale: 0.3,
      shell: -1,
      stance: 2
    }, {
      name: "Wooden Shield",
      sound: "whoosh_0",
      type: 0,
      rarity: 0,
      shield: 0.1,
      melee: true,
      renderAtop: true,
      dmg: 250,
      reload: 500,
      spdMlt: 0.75,
      xOff: 50,
      yOff: 0,
      range: 30,
      scale: 0.3,
      stance: 3
    }, {
      name: "Knuckles",
      sound: "whoosh_0",
      type: 0,
      rarity: 0,
      melee: true,
      renderAtop: true,
      dmg: 350,
      reload: 300,
      spdMlt: 1,
      xOff: 40,
      yOff: 0,
      range: 30,
      scale: 0.21,
      stance: 0
    }, {
      name: "Assault Rifle",
      sound: "smg_0",
      type: 1,
      rarity: 3,
      dmg: 300,
      reload: 200,
      ammo: 20,
      spread: 0.05,
      spdMlt: 0.96,
      xOff: 61,
      yOff: 17,
      lOff: 105,
      sOff: 70,
      range: 1100,
      scale: 0.3,
      stance: 2
    }, {
      name: "LMG",
      sound: "fire_1",
      type: 1,
      rarity: 3,
      dmg: 160,
      reload: 90,
      ammo: 40,
      spread: 0.1,
      spdMlt: 0.85,
      xOff: 61,
      yOff: 17,
      lOff: 120,
      sOff: 100,
      range: 1000,
      scale: 0.3,
      stance: 2
    }, {
      name: "Stun Gun",
      sound: "stun_1",
      type: 0,
      rarity: 2,
      dmg: 100,
      effect: 1,
      desc: "Applies stun",
      reload: 500,
      bIndx: 3,
      bSpd: 0.75,
      ammo: 2,
      spdMlt: 1,
      xOff: 72,
      yOff: 0,
      lOff: 80,
      sOff: 0,
      range: 900,
      scale: 0.3,
      stance: 1,
      shell: -1
    }, {
      name: "Based Stick",
      sound: "whoosh_0",
      dontSpawn: true,
      rarity: 5,
      melee: true,
      dmg: 500,
      reload: 600,
      spdMlt: 1,
      xOff: 38,
      yOff: 25,
      range: 100,
      scale: 0.3,
      stance: 0
    }, {
      name: "Silenced Pistol",
      sound: "silent_2",
      type: 1,
      rarity: 2,
      dmg: 400,
      reload: 500,
      bSpd: 1.2,
      ammo: 15,
      spdMlt: 1.05,
      xOff: 78,
      yOff: 0,
      lOff: 80,
      sOff: 40,
      range: 1000,
      scale: 0.3,
      stance: 1
    }, {
      name: "Acid Bolter",
      sound: "plasma_1",
      dontSpawn: true,
      rarity: 4,
      dmg: 400,
      reload: 200,
      ammo: 10,
      bIndx: 4,
      bSpd: 0.7,
      spdMlt: 0.9,
      xOff: 61,
      yOff: 17,
      lOff: 120,
      sOff: 60,
      range: 900,
      scale: 0.3,
      stance: 2,
      shell: -1
    }, {
      name: "Baseball Bat",
      sound: "whoosh_0",
      type: 0,
      rarity: 1,
      melee: true,
      dmg: 480,
      reload: 500,
      spdMlt: 1,
      xOff: 38,
      yOff: 40,
      range: 100,
      scale: 0.3,
      stance: 0
    }, {
      name: "Combat Syringe",
      type: 0,
      sound: "needle",
      desc: "Restores health",
      rarity: 1,
      dontSpawn: true,
      renderAtop: true,
      reload: 800,
      use: function (t, e) {
        return t.health < t.maxHealth && (e.removeEffect(t, 1), e.changeHealth(t, null, 700), true);
      },
      spdMlt: 0.6,
      xOff: 50,
      yOff: 0,
      scale: 0.3,
      stance: 1
    }, {
      name: "Bolt Action Sniper",
      sound: "sniper_0",
      type: 2,
      rarity: 4,
      dmg: 990,
      reload: 1200,
      bSpd: 1.35,
      ammo: 4,
      spdMlt: 0.9,
      xOff: 70,
      yOff: 15,
      lOff: 100,
      sOff: 70,
      range: 1500,
      scale: 0.3,
      shell: 2,
      stance: 2
    }, {
      name: "Revolver",
      sound: "sniper_0",
      type: 2,
      rarity: 4,
      dmg: 600,
      reload: 500,
      bSpd: 1.1,
      ammo: 6,
      spdMlt: 1,
      xOff: 68,
      yOff: 0,
      lOff: 80,
      sOff: 35,
      range: 1500,
      scale: 0.3,
      stance: 1
    }, {
      name: "Pump Action Shotgun",
      sound: "shotgun_0",
      type: 2,
      rarity: 3,
      dmg: 260,
      reload: 700,
      bCount: 4,
      spread: 0.16,
      bSpd: 1,
      ammo: 5,
      spdMlt: 1,
      xOff: 61,
      yOff: 14,
      lOff: 90,
      sOff: 55,
      range: 1000,
      scale: 0.3,
      shell: 1,
      stance: 2
    }];
  }, function (t, e) {
    t.exports.data = [{
      name: "Bommel Hat",
      rarity: 0
    }, {
      name: "Winter Cap",
      rarity: 0
    }, {
      name: "Cowboy Hat",
      rarity: 0
    }, {
      name: "Ranger Hat",
      rarity: 0
    }, {
      name: "Spec Ops Hat",
      rarity: 1
    }, {
      name: "Forester Cap",
      rarity: 1
    }, {
      name: "Operative Hat",
      rarity: 1
    }, {
      name: "Cloth Cap",
      rarity: 1
    }, {
      name: "Gentleman Hat",
      rarity: 3
    }, {
      name: "Pilot Helmet",
      rarity: 3
    }, {
      name: "Gas Mask",
      rarity: 4,
      xOff: 16
    }, {
      name: "Protective Mask",
      rarity: 3
    }, {
      name: "Military Beret",
      rarity: 3,
      xOff: -6
    }, {
      name: "Military Cap",
      rarity: 3
    }, {
      name: "Ushanka",
      rarity: 4
    }, {
      name: "Vetaran Helmet",
      rarity: 4
    }, {
      name: "Soldier Helmet",
      rarity: 4
    }, {
      name: "Ghillie Hood",
      rarity: 4
    }, {
      name: "Tera Helmet",
      rarity: 5
    }, {
      name: "Overlord Helmet",
      rarity: 5
    }, {
      name: "Voltage Helmet",
      rarity: 5
    }, {
      name: "Astro Helmet",
      unlock: "twitter_sh",
      rarity: 5
    }, {
      name: "Magneto Helmet",
      rarity: 5,
      xOff: 0
    }, {
      name: "Demon Helmet",
      rarity: 5,
      xOff: -3
    }, {
      name: "Crusher Helm",
      rarity: 4,
      xOff: 1
    }, {
      name: "Knight Helm",
      rarity: 4,
      xOff: 0
    }, {
      name: "Crusader Helm",
      rarity: 4
    }, {
      name: "Albino Helm",
      rarity: 3
    }, {
      name: "Barbarian Helm",
      rarity: 3
    }, {
      name: "Raider Helm",
      rarity: 3
    }, {
      name: "Commander Hat",
      rarity: 4
    }, {
      name: "Yuland Helm",
      rarity: 3
    }, {
      name: "Dragonslayer Helm",
      rarity: 3
    }, {
      name: "Welding Mask",
      rarity: 3
    }, {
      name: "Red Biker Helmet",
      rarity: 2
    }, {
      name: "Blue Biker Helmet",
      rarity: 2
    }, {
      name: "Brown Bike Helmet",
      rarity: 3
    }, {
      name: "Grey Bike Helmet",
      rarity: 3
    }, {
      name: "Police Hat",
      rarity: 4
    }, {
      name: "Captains Hat",
      rarity: 4
    }, {
      name: "Demolisher Helm",
      rarity: 4
    }, {
      name: "Love Band",
      rarity: 2
    }, {
      name: "Charm Hat",
      rarity: 4
    }, {
      name: "Spooky Hat",
      rarity: 5
    }];
  }, function (t, e) {
    t.exports.data = [{}, {
      name: "Stun",
      text: "STUN",
      duration: 3,
      stun: 1
    }, {
      name: "Poison",
      text: "Poisoned",
      duration: 5,
      dmgPs: 100
    }];
  }, function (t, e) {
    t.exports.data = [{
      name: "Cloth Shirt",
      rarity: 0
    }, {
      name: "Navy Shirt",
      rarity: 0
    }, {
      name: "Crew Shirt",
      rarity: 0
    }, {
      name: "Forester Shirt",
      rarity: 1
    }, {
      name: "Woodlands Camo",
      rarity: 2
    }, {
      name: "Arctic Camo",
      rarity: 2
    }, {
      name: "Spec Ops Gear",
      rarity: 3
    }, {
      name: "Paladin Armor",
      rarity: 5
    }, {
      name: "Voltage Armor",
      rarity: 5
    }, {
      name: "Tera Armor",
      rarity: 5
    }, {
      name: "Ghillie Suit",
      rarity: 4
    }, {
      name: "Astro Suit",
      unlock: "twitter_sh",
      rarity: 5
    }, {
      name: "Soldier Vest",
      rarity: 4
    }];
  }, function (t, e) {
    t.exports.list = [{
      src: "tree/tree_0",
      layer: 2,
      scale: 200,
      colMlt: 0.5
    }, {
      src: "tree/tree_1",
      layer: 2,
      scale: 190,
      colMlt: 0.5
    }, {
      src: "tree/tree_2",
      layer: 2,
      scale: 160,
      colMlt: 0.5
    }, {
      src: "tree/tree_3",
      layer: 2,
      scale: 200,
      colMlt: 0.5
    }, {
      src: "stone/stone_1",
      layer: 0,
      scale: 64,
      local: true
    }, {
      src: "stone/stone_2",
      layer: 0,
      scale: 40,
      local: true
    }, {
      src: "stone/stone_3",
      layer: 0,
      scale: 32,
      local: true
    }, {
      src: "flower/flower_0",
      layer: 0,
      scale: 28,
      noCol: true
    }, {
      src: "flower/flower_1",
      layer: 0,
      scale: 30,
      noCol: true
    }, {
      src: "crates/crate_0",
      layer: 0,
      scale: 60,
      noCol: true
    }, {
      src: "crates/crate_1",
      layer: 0,
      scale: 58,
      noCol: true,
      dynamic: true,
      interact: function (t, e) {
        if (e.roundTimer > 0 || !e.getWeapon(t.weaponIndex).ammo) {
          return -1;
        } else {
          e.changeAmmo(t, Math.ceil(e.getWeapon(t.weaponIndex).ammo * 0.4));
          return 1;
        }
      }
    }, {
      src: "crates/crate_3",
      layer: 0,
      scale: 60
    }, {
      src: "flower/flower_2",
      layer: 0,
      scale: 35,
      noCol: true
    }, {
      src: "bush/bush_0",
      dynamic: true,
      noCol: true,
      layer: 2,
      scale: 95,
      colMlt: 0.05,
      cover: true
    }, {
      src: "buildings/wall_1_0",
      colType: "rect",
      colPad: 5,
      layer: 2,
      scale: 188,
      width: 28
    }, {
      src: "roads/road_1",
      rPad: 1,
      layer: -1,
      scale: 330,
      allowObj: true,
      noCol: true
    }, {
      src: "vehicles/vehicle_3_0",
      layer: 1,
      colType: "rect",
      mass: 7.5,
      speed: 0.0012,
      colPad: -30,
      scale: 200,
      width: 122,
      sitOffset: 30,
      dynamic: true,
      vehicle: true,
      interact: function (t, e) {
        if (!t.interact.driver) {
          t.interact.driver = t.sid;
          t.vehicle = t.interact;
        }
      }
    }, {
      src: "buildings/floor_0",
      noCol: true,
      allowObj: true,
      layer: -1,
      scale: 430
    }, {
      src: "stone/stone_4",
      layer: 2,
      scale: 110,
      colMlt: 0.8
    }, {
      src: "camp/fire_0",
      layer: 0,
      scale: 90,
      colMlt: 0.8
    }, {
      src: "buildings/wall_0_0",
      colType: "rect",
      colPad: 7,
      layer: 2,
      scale: 165,
      width: 25
    }, {
      src: "buildings/floor_1",
      noCol: true,
      allowObj: true,
      layer: -1,
      scale: 460
    }, {
      src: "vehicles/vehicle_1_0",
      colType: "rect",
      layer: 2,
      colPad: -35,
      scale: 290,
      width: 140
    }, {
      src: "roads/road_0",
      rPad: 1,
      layer: -1,
      scale: 330,
      allowObj: true,
      noCol: true
    }, {
      src: "roads/road_2",
      rPad: 1,
      layer: -1,
      scale: 330,
      allowObj: true,
      noCol: true
    }, {
      src: "buildings/wall_2",
      colType: "rect",
      colPad: -20,
      layer: 0,
      scale: 231.00000000000003,
      width: 49.50000000000001
    }, {
      src: "crates/barrel_0",
      layer: 2,
      scale: 60
    }, {
      src: "crates/crate_4",
      colType: "rect",
      layer: 0,
      scale: 75,
      width: 50
    }, {
      src: "vehicles/vehicle_2_0",
      colType: "rect",
      layer: 2,
      colPad: -35,
      scale: 270,
      width: 162
    }, {
      src: "vehicles/vehicle_4_0",
      layer: 1,
      colType: "rect",
      mass: 3,
      speed: 0.0013,
      colPad: -30,
      scale: 140,
      width: 74,
      sitOffset: 0,
      dynamic: true,
      vehicle: true,
      interact: function (t, e) {
        if (!t.interact.driver) {
          t.interact.driver = t.sid;
          t.vehicle = t.interact;
        }
      }
    }, {
      src: "airport/pad_0",
      layer: -1,
      scale: 330,
      allowObj: true,
      noCol: true
    }, {
      src: "airport/road_0",
      rPad: 1,
      layer: -1,
      scale: 330,
      allowObj: true,
      noCol: true
    }, {
      src: "airport/road_1",
      rPad: 1,
      layer: -1,
      scale: 330,
      allowObj: true,
      noCol: true
    }, {
      src: "backpacks/pack_0",
      name: "Lvl 1 Backpack",
      desc: "Carry more items",
      layer: 0,
      scale: 50,
      noCol: true,
      isPickup: true,
      dynamic: true,
      interact: function (t, e) {
        if (t.backpackIndex) {
          return -1;
        } else {
          e.addPack(t, 1, 3);
          return 1;
        }
      }
    }, {
      src: "weapons/weapon_1",
      layer: 0,
      scale: 50,
      noCol: true,
      isWeapon: true,
      dynamic: true,
      interact: function (t, e) {
        e.getWeapon(t.interact.typeIndex);
        var n = t.scrollIndex;
        e.dropWeapon(t, t.interact.x, t.interact.y);
        e.changeAmmo(t, t.interact.typeValue, true, n);
        e.addWeapon(t, n, t.interact.typeIndex);
        t.weaponRefs[n] = t.interact;
        return 1;
      }
    }];
  }, function (t, e) {
    t.exports.obj = function (t, e) {
      this.init = function (t, e, n, r, i) {
        this.index = r;
        this.x = t;
        this.initX = t;
        this.xVel = 0;
        this.y = e;
        this.initY = e;
        this.yVel = 0;
        this.vel = 0;
        this.xWiggle = 0;
        this.yWiggle = 0;
        this.wiggleCount = 0;
        this.wiggleSpeed = 0.015;
        this.wiggleVal = 0;
        this.dir = n.round(2);
        this.initDir = this.dir;
        this.gridLocations = [];
        this.active = true;
        this.moved = false;
        this.local = i;
      };
      this.resetVehicle = function () {
        this.driver = null;
        this.vel = 0;
      };
      this.update = function (t) {
        if (this.active) {
          this.moved = false;
          this.impact = 0;
          if (this.xVel) {
            this.moved = true;
            this.x += this.xVel * t;
            this.xVel *= Math.pow(0.9985, t);
            if (this.xVel >= -0.01 && this.xVel <= 0.01) {
              this.xVel = 0;
            }
          }
          if (this.yVel) {
            this.moved = true;
            this.y += this.yVel * t;
            this.yVel *= Math.pow(0.9985, t);
            if (this.yVel >= -0.01 && this.yVel <= 0.01) {
              this.yVel = 0;
            }
          }
          if (this.vel) {
            this.vel *= Math.pow(0.9985, t);
            if (this.vel >= -0.01 && this.vel <= 0.01) {
              this.vel = 0;
            }
          }
          if (this.interpolate) {
            this.dt += t;
            var n = Math.min(1.5, this.dt / (e.serverTickrate * 1.2));
            this.x = this.x1 + (this.x2 - this.x1) * n;
            this.y = this.y1 + (this.y2 - this.y1) * n;
            this.dir = Math.lerpAngle(this.d2, this.d1, Math.min(1, n)) || 0;
          }
          if (this.wiggleCounter) {
            this.wiggleVal += this.wiggleSpeed * t;
            if (this.wiggleVal >= 1) {
              this.wiggleSpeed *= -1;
              this.wiggleVal = 1;
            } else if (this.wiggleVal <= -1) {
              this.wiggleSpeed *= -1;
              this.wiggleVal = -1;
            }
            this.xWiggle = this.wiggleVal * 1.5;
            this.wiggleCounter -= t;
            if (this.wiggleCounter <= 0) {
              this.wiggleCounter = 0;
            }
          }
        }
      };
      this.getColMlt = function (t) {
        if (t) {
          return 1;
        } else {
          return this.colMlt || 1;
        }
      };
      this.getColPad = function (t) {
        if (t) {
          return 0;
        } else {
          return this.colPad || 0;
        }
      };
      this.getScale = function (t) {
        return this.scale * this.getColMlt(t) + this.getColPad(t);
      };
      this.getWidth = function (t) {
        return (this.width || this.scale) * this.getColMlt(t) + this.getColPad(t);
      };
      this.pushData = function (t) {
        if (this.dynamic) {
          t.push(this.index, this.sid, Math.round(this.x), Math.round(this.y), this.dir, this.typeIndex);
        } else {
          t.push(this.index, Math.round(this.x), Math.round(this.y), this.dir);
        }
      };
    };
  }, function (t, e) {
    t.exports.obj = function (t, e, n, r, i, a, o, s, l) {
      var c;
      var h;
      this.aliveCount = 0;
      this.roundTimer = a.roundTimer;
      this.projectileManager = {};
      this.checkName = function (t) {
        var e = "unknown";
        if (i.isString(t) && t.length <= a.maxNameLength && (t = t.replace(/<|>/g, "").replace(/[^\x00-\x7F]/g, "")).replace(/\s/g, "").length > 0) {
          e = t;
        }
        return e;
      };
      this.updateAccount = function (t, e) {
        if (t.account) {
          t.account.kills += t.kills;
          if (t.kills > t.account.maxKills) {
            t.account.maxKills = t.kills;
          }
          t.account.deaths += t.deaths;
          t.account.wins += e == 1 ? 1 : 0;
          t.account.games++;
          t.account.xp += Math.round(a.roundXP / e + t.kills * a.xpPerKill);
          t.account.level = t.account.getLevel();
          var n = Math.round(1 / e * (t.kills * a.tokenPerKill));
          t.account.tokens += n;
          var r = t.account.getData();
          l(t.id, "ua", r);
          accounts.call(2, r);
          return n;
        }
        return 0;
      };
      this.addPlayer = function (n, r) {
        var o = new e(n, a, i, this, s);
        o.sid = r || this.generateSID();
        t.push(o);
        return o;
      };
      this.removePlayer = function (e) {
        if (e) {
          this.updateSpectators(e);
          if (e.vehicle) {
            e.vehicle.resetVehicle();
          }
          var n = t.indexOf(e);
          if (n >= 0) {
            t.splice(n, 1);
          }
          for (var r = 0; r < t.length; ++r) {
            if ((n = t[r].sentTo.indexOf(e.id)) >= 0) {
              t[r].sentTo.splice(n, 1);
            }
          }
          this.updatePlayerCount();
        }
      };
      this.clearPlayers = function () {
        for (var e = 0; e < t.length; ++e) {
          if (t[e].alive) {
            var n = this.updateAccount(t[e], 1);
            this.showEndScreen(t[e], this.aliveCount, n);
          }
          l(t[e].id, "7", t[e].alive);
          t[e].active = false;
          t[e].alive = false;
          t[e].spectating = null;
        }
        this.aliveCount = 0;
      };
      this.updatePlayerCount = function () {
        var e = 0;
        for (var n = 0; n < t.length; ++n) {
          if (t[n].alive) {
            e++;
          }
        }
        this.aliveCount = e;
        n = 0;
        for (; n < t.length; ++n) {
          if (t[n].active && l) {
            l(t[n].id, "10", this.aliveCount);
          }
        }
        if (this.aliveCount <= 1 && o) {
          o();
        }
      };
      this.hidePlayers = function () {
        for (var e = 0; e < t.length; ++e) {
          t[e].forcePos = !t[e].visible;
          t[e].visible = false;
        }
      };
      this.removeEffect = function (t, e) {
        var n = t.effects.indexOf(e);
        if (n >= 0) {
          t.effects.splice(n, 1);
          t.effectTimers[e] = 0;
          t.effectDoers[e] = 0;
          if (r[e].stun) {
            t.stunned = 0;
          }
          l(t.id, "22", t.effects);
        }
      };
      this.addEffect = function (t, e, n) {
        if (!(this.roundTimer > 0)) {
          if (t.effects.indexOf(n) < 0) {
            t.effects.push(n);
          }
          if (e) {
            t.effectDoers[n] = e;
          }
          t.effectTimers[n] = r[n].duration;
          t.stunned = r[n].stun;
          if (r[n].text) {
            l(t.id, "14", Math.round(t.x), Math.round(t.y), r[n].text, 1);
            if (e) {
              l(e.id, "14", Math.round(t.x), Math.round(t.y), r[n].text);
            }
          }
          l(t.id, "22", t.effects, n);
        }
      };
      this.getSpeedMult = function (t) {
        return (t.sprint && t.movDir !== null && !t.dashCountdown ? a.sprintSpeed : 1) * (n[t.weaponIndex].spdMlt || 1) * (t.stunned ? 0.3 : 1);
      };
      this.addPack = function (t, e, n) {
        t.backpackIndex = e;
        if (t.weapons.length < n) {
          for (var r = 0; r < n - t.weapons.length; ++r) {
            t.weapons.push(0);
          }
          l(t.id, "12", t.weaponIndex, t.scrollIndex, t.weapons);
        }
      };
      this.getWeapon = function (t) {
        return n[t];
      };
      this.addWeapon = function (t, e, n) {
        t.weapons[e] = n;
        if (t.scrollIndex == e) {
          this.swapWeapon(t, n);
        }
        l(t.id, "12", t.weaponIndex, t.scrollIndex, t.weapons);
      };
      this.dropWeapon = function (t, e, n) {
        var r = t.weaponRefs[t.scrollIndex];
        if (r) {
          this.moveObject(r, e != undefined ? e : t.x, n != undefined ? n : t.y);
          r.typeValue = t.ammos[t.scrollIndex];
          r.active = true;
          this.removeWeapon(t, t.scrollIndex);
        }
      };
      this.removeWeapon = function (t, e) {
        t.weapons[e] = 0;
        t.ammos[e] = 0;
        t.weaponRefs[e] = 0;
        if (t.scrollIndex == e) {
          t.weaponIndex = 0;
        }
        l(t.id, "12", t.weaponIndex, e, t.weapons);
      };
      this.swapWeapon = function (t, e) {
        if (t.weaponIndex || e) {
          t.swapTimer = a.weaponSwapTime;
          if (!t.vehicle) {
            this.sendAnimation(t, a.weaponSwapTime, 2);
          }
        }
        t.weaponIndex = e;
        t.reload = 0;
      };
      this.getAmmo = function (t) {
        return n[t].ammo || 0;
      };
      this.changeAmmo = function (t, e, n, r) {
        r = r != undefined ? r : t.scrollIndex;
        if (!(this.roundTimer > 0) || !(e < 0)) {
          if (n) {
            t.ammos[r] = e;
          } else {
            t.ammos[r] += e;
          }
          if (t.ammos[r] <= 0) {
            t.ammos[r] = 0;
          }
          l(t.id, "13", r, t.ammos[r]);
          if (!n && e > 0) {
            l(t.id, "14", Math.round(t.x), Math.round(t.y), "+" + e, 0);
          }
        }
      };
      this.disableObject = function (e) {
        var n;
        for (var r = 0; r < t.length; ++r) {
          if ((n = t[r].loadedObjects.indexOf(e)) >= 0) {
            if (t[r].active) {
              l(t[r].id, "20", e);
            }
            t[r].loadedObjects.splice(n, 1);
          }
        }
      };
      this.moveObject = function (t, e, n) {
        if (t) {
          t.x = Math.round(e);
          t.y = Math.round(n);
          s.udateObjectGrid(t);
          this.disableObject(t.sid);
        }
      };
      this.screenShake = function (t, e, n) {
        l(t.id, "16", e != undefined ? e.round(1) : 0, n);
      };
      this.changeHealth = function (t, e, r, o, s) {
        var c = r < 0;
        var h = !(r > 0) || !(this.health >= this.maxHealth);
        if (this.roundTimer > 0) {
          r = 0;
        }
        if (r <= 0) {
          this.screenShake(t, o, 8);
        }
        if (r < 0 && !s && n[t.weaponIndex].shield && i.getAngleDist(t.dir + Math.PI, o) <= a.shieldAngle) {
          var u = r * n[t.weaponIndex].shield;
          var f = t.stamina + (r - u);
          this.changeStamina(t, r - u);
          r = f <= 0 ? f : 0;
          r += u;
        }
        t.health += r;
        if (t.health <= 0) {
          r -= t.health;
          t.health = 0;
          this.killPlayer(t, e);
        } else if (t.health > t.maxHealth) {
          r -= t.health - t.maxHealth;
          t.health = t.maxHealth;
        }
        for (var d = 0; d < t.sentTo.length; ++d) {
          if (r) {
            l(t.sentTo[d], "4", t.sid, Math.ceil(t.health));
          }
        }
        if (c) {
          this.sendSound(t, 1, 0.3, true);
          this.sendParticle(t, 5);
        }
        if (h && (c || r > 0)) {
          var p = Math.round(t.x + i.randInt(-40, 40));
          var m = Math.round(t.y + i.randInt(0, 25));
          if (e) {
            l(e.id, "14", p, m, Math.round(r), 0);
          }
          l(t.id, "14", p, m, Math.round(r), c ? 1 : 2);
        }
      };
      this.changeStamina = function (t, e) {
        if (e < 0) {
          t.staminaDelay = a.staminaDelay;
        }
        if ((!(e > 0) || t.stamina != t.maxStamina) && (!(e < 0) || t.stamina != 0)) {
          t.stamina += e;
          if (t.stamina <= 0) {
            t.stamina = 0;
          } else if (t.stamina >= t.maxStamina) {
            t.stamina = t.maxStamina;
          }
          l(t.id, "5", Math.floor(t.stamina));
        }
      };
      this.tryUse = function (t) {
        if ((h = n[t.weaponIndex]).use && h.use(t, this)) {
          this.removeWeapon(t, t.scrollIndex);
        }
      };
      this.tryAttack = function (e, r) {
        h = n[e.weaponIndex];
        if (!e.stunned && e.tryAttack && !e.reload && (!e.reloads[e.weaponIndex] || r - e.reloads[e.weaponIndex] >= h.reload)) {
          if (h.use) {
            this.sendAnimation(e, h.reload, 3);
            e.reload = h.reload;
            e.reloads[e.weaponIndex] = r;
          } else if (h.melee) {
            var o = e.stamina >= h.dmg * a.dmgToStam ? 1 : a.noStamMlt;
            this.changeStamina(e, -h.dmg * a.dmgToStam);
            this.sendAnimation(e, h.reload, 0);
            e.reload = h.reload;
            e.reloads[e.weaponIndex] = r;
            for (var s = 0; s < t.length; ++s) {
              if ((c = t[s]).alive && e != c && i.getDistance(c.x, c.y, e.x, e.y) < c.scale + e.scale + h.range) {
                var l = i.getDirection(c.x, c.y, e.x, e.y);
                if (i.getAngleDist(l, e.dir) <= a.hitArc * 0.82) {
                  this.changeHealth(c, e, -h.dmg * o, l);
                }
              }
            }
          } else if (e.ammos[e.scrollIndex] >= 1) {
            this.sendAnimation(e, h.reload, 1);
            this.changeAmmo(e, -1);
            e.reload = h.reload;
            e.reloads[e.weaponIndex] = r;
            this.screenShake(e, e.dir + Math.PI, 8);
            var u = n[e.weaponIndex];
            var f = e.oldX + (u.lOff || 0) * a.bOffset * Math.cos(e.dir) + u.yOff * Math.cos(e.dir + Math.PI / 2);
            var d = e.oldY + (u.lOff || 0) * a.bOffset * Math.sin(e.dir) + u.yOff * Math.sin(e.dir + Math.PI / 2);
            var p = (e.dir + Math.PI / 2 + i.randFloat(-0.02, 0.02)).round(2);
            if (u.shell != -1) {
              var m = Math.round(f - (u.sOff || 0) * Math.cos(e.dir));
              var y = Math.round(d - (u.sOff || 0) * Math.sin(e.dir));
              this.sendParticle(e, u.shell || 0, m, y, p);
            }
            for (s = 0; s < (u.bCount || 1); ++s) {
              this.projectileManager.add(e.weaponIndex, f, d, e.dir + (u.spread ? i.randFloat(-u.spread, u.spread) : 0), Math.round(u.range * a.rangeMlt), e);
            }
          }
        }
        e.tryAttack = e.mouseDown;
      };
      this.sendParticle = function (e, n, r, i, a) {
        for (var o = 0; o < t.length; ++o) {
          if (t[o].canSee(e)) {
            l(t[o].id, "19", n, Math.round(r || e.x), Math.round(i || e.y), a || 0);
          }
        }
      };
      this.sendAnimation = function (e, n, r) {
        for (var i = 0; i < t.length; ++i) {
          if (t[i].active && t[i].canSee(e)) {
            l(t[i].id, "11", e.sid, n, r);
          }
        }
      };
      this.sendChat = function (e, n) {
        for (var r = 0; r < t.length; ++r) {
          if (t[r].active && t[r].canSee(e)) {
            l(t[r].id, "c", e.sid, n);
          }
        }
      };
      this.sendWiggle = function (e) {
        for (var n = 0; n < t.length; ++n) {
          if (t[n].active && t[n].canSee(e)) {
            l(t[n].id, "23", e.sid);
          }
        }
      };
      this.sendSound = function (e, n, r, i) {
        if (i) {
          for (var a = 0; a < t.length; ++a) {
            if (t[a].active && t[a].canSee(e)) {
              l(t[a].id, "s", n, e.sid, r || 0);
            }
          }
        } else {
          l(e.id, "s", n, e.sid, r || 0);
        }
      };
      this.killPlayer = function (e, n) {
        if (n) {
          n.kills++;
          l(n.id, "21", n.kills);
        }
        if (e.vehicle) {
          e.vehicle.resetVehicle();
        }
        this.dropWeapon(e);
        e.deaths++;
        e.alive = false;
        e.spectating = n || this.getSpectate(e);
        this.updateSpectators(e, n);
        for (var r = 0; r < t.length; ++r) {
          if (t[r].active) {
            l(t[r].id, "6", e.sid, n == t[r] && this.aliveCount > 2 ? 1 : 0);
          }
        }
        var i = this.aliveCount;
        var a = this.updateAccount(e, this.aliveCount);
        this.updatePlayerCount();
        this.showEndScreen(e, i, a);
      };
      this.showEndScreen = function (t, e, n) {
        l(t.id, "15", e, 0, n);
      };
      this.updateSpectators = function (e, n) {
        for (var r = 0; r < t.length; ++r) {
          if (t[r].active && t[r].spectating == e && t[r] != e) {
            t[r].spectating = n || this.getSpectate(t[r]);
          }
        }
      };
      this.getSpectate = function (e) {
        e.spectateIndex++;
        if (e.spectateIndex >= t.length) {
          e.spectateIndex = 0;
        }
        for (var n = 0; !t[e.spectateIndex].alive && n <= t.length;) {
          n++;
          e.spectateIndex++;
          if (e.spectateIndex >= t.length) {
            e.spectateIndex = 0;
          }
        }
        if (t[e.spectateIndex].alive) {
          return t[e.spectateIndex];
        } else {
          return null;
        }
      };
      this.updatePlayers = function (t) {
        this.hidePlayers();
        if (t) {
          Date.now();
          for (var e = 0; e < t.length;) {
            if (c = this.findBySid(t[e])) {
              c.x1 = c.x;
              c.y1 = c.y;
              c.x2 = t[e + 1];
              c.y2 = t[e + 2];
              c.movDir = i.getDirection(c.x1, c.y1, c.x2, c.y2);
              c.d1 = c.dir || 0;
              c.d2 = t[e + 3];
              c.weaponIndex = t[e + 4];
              c.showStats = t[e + 5];
              c.vehicle = t[e + 6];
              c.backpackIndex = t[e + 7];
              c.dt = 0;
              c.visible = true;
            }
            e += 8;
          }
        }
      };
      this.findBySid = function (e) {
        for (var n = 0; n < t.length; ++n) {
          if (t[n].sid == e) {
            return t[n];
          }
        }
        return null;
      };
      this.generateSID = function () {
        var e = 0;
        for (var n = true; n;) {
          n = false;
          e++;
          for (var r = 0; r < t.length; ++r) {
            if (t[r].sid == e) {
              n = true;
              break;
            }
          }
        }
        return e;
      };
    };
  }, function (t, e) {
    t.exports.AnimText = function () {
      this.init = function (t, e, n, r, i, a, o) {
        this.x = t;
        this.y = e;
        this.color = o;
        this.scale = n;
        this.startScale = this.scale;
        this.maxScale = n * 2;
        this.scaleSpeed = 0.95;
        this.speed = r;
        this.life = i;
        this.text = a;
      };
      this.update = function (t) {
        if (this.life) {
          this.life -= t;
          this.y -= this.speed * t;
          this.scale += this.scaleSpeed * t;
          if (this.scale >= this.maxScale) {
            this.scale = this.maxScale;
            this.scaleSpeed *= -1;
          } else if (this.scale <= this.startScale) {
            this.scale = this.startScale;
            this.scaleSpeed = 0;
          }
          if (this.life <= 0) {
            this.life = 0;
          }
        }
      };
      this.render = function (t, e, n) {
        t.fillStyle = this.color;
        t.font = this.scale + "px GameFont";
        if (this.skipOffset) {
          t.strokeText(this.text, this.x, this.y);
          t.fillText(this.text, this.x, this.y);
        } else {
          t.strokeText(this.text, this.x - e, this.y - n);
          t.fillText(this.text, this.x - e, this.y - n);
        }
      };
    };
    t.exports.TextManager = function () {
      var e;
      this.texts = [];
      this.divs = [];
      this.update = function (t, n, r, i) {
        n.textBaseline = "middle";
        n.textAlign = "center";
        n.globalAlpha = 1;
        for (var a = 0; a < this.texts.length; ++a) {
          if (this.texts[a].life) {
            this.texts[a].update(t);
            this.texts[a].render(n, r, i);
          }
        }
        for (a = this.divs.length - 1; a >= 0; --a) {
          (e = this.divs[a]).scale += e.scalePlus * t;
          if (e.scale >= e.maxScale) {
            e.scale = e.maxScale;
            e.scalePlus *= -1;
          } else if (e.scale <= e.minScale) {
            e.scale = e.minScale;
          }
          e.style.fontSize = e.scale + "px";
          e.life -= t;
          if (e.life <= 0) {
            e.style.display = "none";
            this.divs.splice(a, 1);
          }
        }
      };
      this.animateDiv = function (t, e, n, r) {
        if (this.divs.indexOf(t) < 0) {
          this.divs.push(t);
        }
        t.style.display = "block";
        t.style.fontSize = n + "px";
        t.scalePlus = 0.4;
        t.scale = n;
        t.minScale = n;
        t.maxScale = n * 1.4;
        t.innerHTML = e;
        t.life = r;
      };
      this.showText = function (e, n, r, i, a, o, s, l, c) {
        var h;
        for (var u = 0; u < this.texts.length; ++u) {
          if (!this.texts[u].life) {
            h = this.texts[u];
            break;
          }
        }
        if (!h) {
          h = new t.exports.AnimText();
          this.texts.push(h);
        }
        h.init(e, n, r, i, a, o, s);
        h.type = c || "default";
        h.skipOffset = l;
      };
      this.hideByType = function (t) {
        for (var e = 0; e < this.texts.length; ++e) {
          if (this.texts[e].type == t) {
            this.texts[e].life = 0;
          }
        }
      };
    };
  }, function (t, e) {
    t.exports.obj = function (t, e, n, r, i) {
      var a;
      var o;
      var s = [];
      this.sentTo = [];
      this.init = function (t, e, n, r, a, o, s, l) {
        this.index = t;
        this.x = e;
        this.startX = e;
        this.y = n;
        this.startY = n;
        this.dir = r;
        this.speed = a;
        this.dmg = o;
        this.wMlt = 0.625;
        this.maxRange = s;
        this.range = 0;
        this.owner = l;
        if (i) {
          this.sentTo.length = 0;
        }
        this.skipMov = true;
        this.skipRender = true;
        this.active = true;
        this.deathCallback = null;
      };
      this.update = function (l, c) {
        if (this.active) {
          o = this.speed * l;
          var h = this.skipMov;
          if (this.skipMov) {
            this.skipMov = false;
          } else {
            this.x += o * Math.cos(this.dir);
            this.y += o * Math.sin(this.dir);
            this.range += o;
            if (this.range >= this.maxRange) {
              this.range -= this.maxRange;
              this.x -= this.range * Math.cos(this.dir);
              this.y -= this.range * Math.sin(this.dir);
              o = 0;
              if (this.deathCallback) {
                this.deathCallback(this);
              }
              this.active = false;
            }
          }
          if (i) {
            var u = h ? this.owner.x : this.x;
            var f = h ? this.owner.y : this.y;
            var d = this.x + o * Math.cos(this.dir);
            var p = this.y + o * Math.sin(this.dir);
            s.length = 0;
            for (var m = 0; m < c.length; ++m) {
              if ((a = c[m]).alive && a != this.owner && e.lineInRect(u, f, d, p, a)) {
                s.push(a);
              }
            }
            for (var y = r.getGridArrays(u, f, e.getDistance(u, f, d, p)), v = 0; v < y.length; ++v) {
              for (var g = 0; g < y[v].length; ++g) {
                if ((a = y[v][g]).layer >= t.bulletLayer && !a.cover && s.indexOf(a) < 0 && e.lineInRect(u, f, d, p, a)) {
                  s.push(a);
                }
              }
            }
            if (s.length > 0) {
              var x = null;
              var w = null;
              var b = null;
              for (m = 0; m < s.length; ++m) {
                for (var S = e.lineInRect(u, f, d, p, s[m], true), k = 0; k < S.length; k += 2) {
                  b = e.getDistance(this.startX, this.startY, S[k], S[k + 1]);
                  if (w == null || b < w) {
                    w = b;
                    x = s[m];
                  }
                }
              }
              x ||= s[0];
              if (x.isPlayer) {
                if (this.dmg) {
                  n.changeHealth(x, this.owner, -this.dmg, this.dir);
                } else {
                  i(x.id, "16", this.dir.round(1), 8);
                }
                if (this.effect) {
                  n.addEffect(x, this.owner, this.effect);
                }
              }
              this.active = false;
              this.maxRange = w;
              if (!h) {
                for (m = 0; m < c.length; ++m) {
                  if (this.sentTo.indexOf(c[m].id) >= 0) {
                    i(c[m].id, "18", this.sid, this.maxRange);
                  }
                }
              }
            }
            for (m = 0; m < c.length; ++m) {
              a = c[m];
              if (this.sentTo.indexOf(a.id) < 0 && a.canSee(this, o)) {
                this.sentTo.push(a.id);
                i(a.id, "17", this.index, Math.round(this.x), Math.round(this.y), this.dir.round(2), Math.floor(this.range), Math.floor(this.maxRange), this.active ? this.sid : 0);
              }
            }
          }
        }
      };
    };
  }, function (t, e) {
    t.exports.obj = function (t, e, n, r, i, a, o, s) {
      this.add = function (l, c, h, u, f, d) {
        var p = null;
        for (var m = 0; m < r.length; ++m) {
          if (!r[m].active) {
            p = r[m];
            break;
          }
        }
        if (!p) {
          (p = new n(t, e, o, a, s)).sid = r.length + 1;
          r.push(p);
        }
        p.init(l, c, h, u, t.bulletSpeed * (i[l].bSpd || 1), i[l].dmg, f, d);
        p.src = "/bullets/bullet_" + (i[l].bIndx || 0);
        p.scale = t.bulletScale * (i[l].bScl || 1);
        p.effect = i[l].effect;
        return p;
      };
    };
  }, function (t, e) {
    t.exports.obj = function (t, e) {
      this.init = function (t, e, n, r, i, a, o, s, l) {
        this.index = t;
        this.scale = a;
        this.x = e;
        this.y = n;
        this.vel = r;
        this.dir = i;
        this.rot = i;
        this.spin = o;
        this.life = s;
        this.fade = l;
        this.alpha = 1;
        this.active = true;
      };
      this.update = function (t) {
        if (this.active) {
          this.x += this.vel * t * Math.cos(this.rot);
          this.y += this.vel * t * Math.sin(this.rot);
          if (this.scaleSpd) {
            var e = this.scaleSpd * t;
            this.scale += e;
            this.x += e / 2 * Math.cos(this.rot);
            this.y += e / 2 * Math.sin(this.rot);
          }
          this.dir += this.spin * t;
          if (this.life > 0) {
            this.life -= t;
            if (this.fade && this.life <= this.fade) {
              this.alpha = Math.max(0, this.life / this.fade);
            }
            if (this.life <= 0) {
              this.active = false;
            }
          }
        }
      };
    };
  }, function (t, e, n) {
    var r = n(9);
    t.exports.data = [{
      src: "/particles/particle_0",
      life: [500, 600],
      vels: [0.15, 0.2],
      dirs: [-0.15, 0.15],
      scale: 15,
      spins: [0.005, 0.009]
    }, {
      src: "/particles/particle_1",
      life: [500, 600],
      vels: [0.15, 0.2],
      dirs: [-0.15, 0.15],
      scale: 15,
      spins: [0.005, 0.009]
    }, {
      src: "/particles/particle_2",
      life: [500, 600],
      vels: [0.15, 0.2],
      dirs: [-0.15, 0.15],
      scale: 15,
      spins: [0.005, 0.009]
    }, {
      src: "/particles/particle_3",
      layer: 1,
      nameType: "screen",
      vels: [0.1, 0.2],
      scale: 44,
      spins: [0.001, 0.002]
    }, {
      src: "/particles/particle_4",
      layer: 1,
      nameType: "screen",
      vels: [0.1, 0.2],
      scale: 44,
      spins: [0.001, 0.002]
    }, {
      src: "/particles/particle_6",
      setting: 0,
      layer: -1,
      life: [5000, 6000],
      fade: 500,
      dirs: [0, Math.PI],
      scales: [60, 70]
    }, {
      src: "/particles/particle_7",
      layer: -1,
      life: [2000, 2100],
      fade: 500,
      dirs: [0, Math.PI],
      scales: [28, 35]
    }, {
      srcs: ["/particles/particle_8", "/particles/particle_9"],
      layer: 0,
      scaleSpd: [0.15, 0.2],
      life: [100, 100],
      fade: 50,
      scales: [35, 40]
    }];
    e.fetchRand = function (t) {
      if (t) {
        return r.randFloat(t[0], t[1]);
      } else {
        return 0;
      }
    };
    e.obj = function (t, n, r, i) {
      var a;
      var o;
      this.add = function (s, l, c, h, u) {
        a = null;
        if ((o = e.data[s]).setting == undefined || u[o.setting].val) {
          for (var f = 0; f < r.length; ++f) {
            if (!r[f].active) {
              a = r[f];
              break;
            }
          }
          if (!a) {
            a = new i(t, n);
            r.push(a);
          }
          o = e.data[s];
          a.init(s, l, c, e.fetchRand(o.vels), h + e.fetchRand(o.dirs), e.fetchRand(o.scales) || o.scale, e.fetchRand(o.spins), e.fetchRand(o.life), o.fade || 0);
          a.scaleSpd = e.fetchRand(o.scaleSpd) || 0;
          a.layer = o.layer || 0;
          a.nameType = o.nameType || "default";
          a.composite = o.composite || null;
          a.src = o.src || o.srcs[n.randInt(0, o.srcs.length - 1)];
        }
      };
      this.getCount = function (t) {
        var e = 0;
        for (var n = 0; n < r.length; ++n) {
          if (r[n].active && r[n].nameType == t) {
            e++;
          }
        }
        return e;
      };
    };
  }, function (t, e) {
    t.exports.obj = function (t, e) {
      var n;
      this.xListen = 0;
      this.yListen = 0;
      this.sounds = [];
      this.IDList = ["equip_2", "hit_0", "bush"];
      this.active = true;
      this.play = function (e, r, i) {
        if (r && this.active) {
          if (!(n = this.sounds[e])) {
            n = new Howl({
              src: ".././sound/" + e + ".mp3"
            });
            this.sounds[e] = n;
          }
          if (!i || !n.isPlaying) {
            n.isPlaying = true;
            n.play();
            n.volume((r || 1) * t.volumeMult);
            n.loop(i);
          }
        }
      };
      this.playAt = function (n, r, i, a) {
        a &&= Math.min(1, a);
        var o = e.getDistance(this.xListen, this.yListen, r, i);
        if (o <= t.hearDistance) {
          var s = Math.min(1, (t.hearDistance - o) / t.hearDistance);
          this.play(n, s * (a || 1));
        }
      };
      this.toggleMute = function (t, e) {
        if (n = this.sounds[t]) {
          n.mute(e);
        }
      };
      this.stop = function (t) {
        if (n = this.sounds[t]) {
          n.stop();
          n.isPlaying = false;
        }
      };
    };
  }, function (t, e) {
    t.exports.obj = function (t, e, n) {
      var r = t[21].scale;
      this.indexes = [23, 15, 24];
      this.rScale = t[this.indexes[1]].scale;
      this.airPortX = 6000;
      this.airPortY = -7000;
      this.crossY = 0;
      var i = this.rScale * 2;
      this.crossX = -Math.ceil(3000 / i) * i;
      this.baseX = 3000;
      this.baseY = 4500;
      this.objects = [];
      this.roads = [];
      this.gameObjects = [{
        i: 16,
        r: Math.PI / 2,
        x: this.baseX - 450,
        y: this.baseY + 500
      }, {
        i: 16,
        r: -Math.PI / 2,
        x: this.baseX + 400,
        y: this.baseY - 500
      }, {
        i: 22,
        x: this.baseX + 520,
        y: this.baseY + 370
      }, {
        i: 22,
        x: this.baseX + 150,
        y: this.baseY + 370
      }, {
        i: 28,
        x: this.baseX - 500,
        y: this.baseY
      }];
      this.objects.push({
        type: "road",
        noVehicle: true,
        roadTiles: [32, 31],
        weaponTypes: [0, 1, 2],
        stepIndex: 2,
        itemCount: 3,
        weaponCount: 6,
        wt: 1,
        ht: 10,
        x: this.airPortX + this.rScale * 2 + 100,
        y: this.airPortY
      });
      this.objects.push({
        type: "road",
        noVehicle: true,
        roadTiles: [30, 30],
        weaponTypes: [0, 1],
        stepIndex: 2,
        itemCount: 1,
        weaponCount: 0,
        wt: 1,
        ht: 1,
        x: this.airPortX,
        y: this.airPortY
      });
      this.objects.push({
        type: "house",
        baseIndex: 17,
        walls: [1, 1, 1, 1],
        clutter: [26, 26, 26],
        weaponTypes: [1, 2],
        wi: 25,
        packCount: 3,
        stepIndex: 4,
        itemCount: 4,
        weaponCount: 6,
        wt: 2,
        ht: 2,
        x: this.baseX,
        y: this.baseY
      });
      this.addHouse = function (t, e, n, r) {
        this.objects.push({
          type: "house",
          baseIndex: 21,
          walls: n || [1, 1, 1, 1],
          weaponTypes: [0, 1],
          wi: r,
          packCount: 1,
          stepIndex: 2,
          itemCount: 1,
          weaponCount: 2,
          wt: 1,
          ht: 1,
          x: t,
          y: e
        });
      };
      var a = Math.ceil(n.mapScale / this.rScale);
      this.objects.push({
        type: "road",
        roadTiles: [15, 24, 23],
        weaponTypes: [0],
        stepIndex: 2,
        itemCount: 11,
        weaponCount: 8,
        wt: a,
        ht: 1,
        x: 0,
        y: this.crossY
      }, {
        type: "road",
        roadTiles: [15, 24, 23],
        weaponTypes: [0],
        stepIndex: 2,
        itemCount: 11,
        weaponCount: 8,
        wt: 1,
        ht: a,
        x: this.crossX,
        y: 0
      });
      var o = this.rScale + 80;
      this.addHouse(this.airPortX - 135, this.airPortY + 900);
      this.addHouse(n.mapScale - 1500, n.mapScale - 1000);
      this.addHouse(1000 - n.mapScale, n.mapScale - 1000);
      this.addHouse(n.mapScale - 800, this.crossY - o - r);
      this.addHouse(n.mapScale - 800, this.crossY + o + r);
      this.addHouse(this.crossX + o + r, this.crossY - o - r);
      this.addHouse(this.crossX + 2100, this.crossY - o - r);
      this.addHouse(this.crossX + o + r, this.crossY - 2200);
      this.addHouse(this.crossX - o - r, this.crossY - o - r);
      this.addHouse(this.crossX - 2200, this.crossY - o - r);
      this.addHouse(this.crossX - o - r, this.crossY + o + r);
      this.addHouse(this.crossX - o - r, this.crossY + 2200);
      this.addHouse(this.crossX + o + r, this.crossY + o + r);
      this.addHouse(this.crossX - o - r, -n.mapScale + r + 500);
      for (var s = 0; s < this.objects.length; ++s) {
        var l = t[this.objects[s].baseIndex || this.objects[s].roadTiles[0]].scale;
        this.objects[s].w = l * this.objects[s].wt;
        this.objects[s].h = l * this.objects[s].ht;
      }
    };
  }, function (t, e) {
    t.exports.obj = function (t, e) {
      this.init = function (t, e, n, r) {
        this.x = t;
        this.y = e;
        this.scale = n;
        this.src = "ground/ground_" + r;
        this.active = true;
      };
      this.recycle = function (t, n) {
        if (this.x - t < 0) {
          this.x += e.maxScreenWidth;
        } else if (this.x - t > e.maxScreenWidth) {
          this.x -= e.maxScreenWidth;
        }
        if (this.y - n < 0) {
          this.y += e.maxScreenHeight;
        } else if (this.y - n > e.maxScreenHeight) {
          this.y -= e.maxScreenHeight;
        }
      };
    };
  }, function (t, e) {
    t.exports.obj = function (t) {
      this.getTweet = function () {
        return "Check out this new .io Battle Royale game https://foes.io";
      };
    };
  }, function (t, e, n) {
    var r;
    (function () {
      "use strict";

      /**
      	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
      	 *
      	 * @codingstandard ftlabs-jsv2
      	 * @copyright The Financial Times Limited [All Rights Reserved]
      	 * @license MIT License (see LICENSE.txt)
      	 */
      function i(t, e) {
        var n;
        e = e || {};
        this.trackingClick = false;
        this.trackingClickStart = 0;
        this.targetElement = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.lastTouchIdentifier = 0;
        this.touchBoundary = e.touchBoundary || 10;
        this.layer = t;
        this.tapDelay = e.tapDelay || 200;
        this.tapTimeout = e.tapTimeout || 700;
        if (!i.notNeeded(t)) {
          var r = ["onMouse", "onClick", "onTouchStart", "onTouchMove", "onTouchEnd", "onTouchCancel"];
          for (var a = 0, s = r.length; a < s; a++) {
            this[r[a]] = l(this[r[a]], this);
          }
          if (o) {
            t.addEventListener("mouseover", this.onMouse, true);
            t.addEventListener("mousedown", this.onMouse, true);
            t.addEventListener("mouseup", this.onMouse, true);
          }
          t.addEventListener("click", this.onClick, true);
          t.addEventListener("touchstart", this.onTouchStart, false);
          t.addEventListener("touchmove", this.onTouchMove, false);
          t.addEventListener("touchend", this.onTouchEnd, false);
          t.addEventListener("touchcancel", this.onTouchCancel, false);
          if (!Event.prototype.stopImmediatePropagation) {
            t.removeEventListener = function (e, n, r) {
              var i = Node.prototype.removeEventListener;
              if (e === "click") {
                i.call(t, e, n.hijacked || n, r);
              } else {
                i.call(t, e, n, r);
              }
            };
            t.addEventListener = function (e, n, r) {
              var i = Node.prototype.addEventListener;
              if (e === "click") {
                i.call(t, e, n.hijacked ||= function (t) {
                  if (!t.propagationStopped) {
                    n(t);
                  }
                }, r);
              } else {
                i.call(t, e, n, r);
              }
            };
          }
          if (typeof t.onclick == "function") {
            n = t.onclick;
            t.addEventListener("click", function (t) {
              n(t);
            }, false);
            t.onclick = null;
          }
        }
        function l(t, e) {
          return function () {
            return t.apply(e, arguments);
          };
        }
      }
      var a = navigator.userAgent.indexOf("Windows Phone") >= 0;
      var o = navigator.userAgent.indexOf("Android") > 0 && !a;
      var s = /iP(ad|hone|od)/.test(navigator.userAgent) && !a;
      var l = s && /OS 4_\d(_\d)?/.test(navigator.userAgent);
      var c = s && /OS [6-7]_\d/.test(navigator.userAgent);
      var h = navigator.userAgent.indexOf("BB10") > 0;
      i.prototype.needsClick = function (t) {
        switch (t.nodeName.toLowerCase()) {
          case "button":
          case "select":
          case "textarea":
            if (t.disabled) {
              return true;
            }
            break;
          case "input":
            if (s && t.type === "file" || t.disabled) {
              return true;
            }
            break;
          case "label":
          case "iframe":
          case "video":
            return true;
        }
        return /\bneedsclick\b/.test(t.className);
      };
      i.prototype.needsFocus = function (t) {
        switch (t.nodeName.toLowerCase()) {
          case "textarea":
            return true;
          case "select":
            return !o;
          case "input":
            switch (t.type) {
              case "button":
              case "checkbox":
              case "file":
              case "image":
              case "radio":
              case "submit":
                return false;
            }
            return !t.disabled && !t.readOnly;
          default:
            return /\bneedsfocus\b/.test(t.className);
        }
      };
      i.prototype.sendClick = function (t, e) {
        var n;
        var r;
        if (document.activeElement && document.activeElement !== t) {
          document.activeElement.blur();
        }
        r = e.changedTouches[0];
        (n = document.createEvent("MouseEvents")).initMouseEvent(this.determineEventType(t), true, true, window, 1, r.screenX, r.screenY, r.clientX, r.clientY, false, false, false, false, 0, null);
        n.forwardedTouchEvent = true;
        t.dispatchEvent(n);
      };
      i.prototype.determineEventType = function (t) {
        if (o && t.tagName.toLowerCase() === "select") {
          return "mousedown";
        } else {
          return "click";
        }
      };
      i.prototype.focus = function (t) {
        var e;
        if (s && t.setSelectionRange && t.type.indexOf("date") !== 0 && t.type !== "time" && t.type !== "month") {
          e = t.value.length;
          t.setSelectionRange(e, e);
        } else {
          t.focus();
        }
      };
      i.prototype.updateScrollParent = function (t) {
        var e;
        var n;
        if (!(e = t.fastClickScrollParent) || !e.contains(t)) {
          n = t;
          do {
            if (n.scrollHeight > n.offsetHeight) {
              e = n;
              t.fastClickScrollParent = n;
              break;
            }
            n = n.parentElement;
          } while (n);
        }
        if (e) {
          e.fastClickLastScrollTop = e.scrollTop;
        }
      };
      i.prototype.getTargetElementFromEventTarget = function (t) {
        if (t.nodeType === Node.TEXT_NODE) {
          return t.parentNode;
        } else {
          return t;
        }
      };
      i.prototype.onTouchStart = function (t) {
        var e;
        var n;
        var r;
        if (t.targetTouches.length > 1) {
          return true;
        }
        e = this.getTargetElementFromEventTarget(t.target);
        n = t.targetTouches[0];
        if (s) {
          if ((r = window.getSelection()).rangeCount && !r.isCollapsed) {
            return true;
          }
          if (!l) {
            if (n.identifier && n.identifier === this.lastTouchIdentifier) {
              t.preventDefault();
              return false;
            }
            this.lastTouchIdentifier = n.identifier;
            this.updateScrollParent(e);
          }
        }
        this.trackingClick = true;
        this.trackingClickStart = t.timeStamp;
        this.targetElement = e;
        this.touchStartX = n.pageX;
        this.touchStartY = n.pageY;
        if (t.timeStamp - this.lastClickTime < this.tapDelay) {
          t.preventDefault();
        }
        return true;
      };
      i.prototype.touchHasMoved = function (t) {
        var e = t.changedTouches[0];
        var n = this.touchBoundary;
        return Math.abs(e.pageX - this.touchStartX) > n || Math.abs(e.pageY - this.touchStartY) > n;
      };
      i.prototype.onTouchMove = function (t) {
        return !this.trackingClick || ((this.targetElement !== this.getTargetElementFromEventTarget(t.target) || this.touchHasMoved(t)) && (this.trackingClick = false, this.targetElement = null), true);
      };
      i.prototype.findControl = function (t) {
        if (t.control !== undefined) {
          return t.control;
        } else if (t.htmlFor) {
          return document.getElementById(t.htmlFor);
        } else {
          return t.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea");
        }
      };
      i.prototype.onTouchEnd = function (t) {
        var e;
        var n;
        var r;
        var i;
        var a;
        var h = this.targetElement;
        if (!this.trackingClick) {
          return true;
        }
        if (t.timeStamp - this.lastClickTime < this.tapDelay) {
          this.cancelNextClick = true;
          return true;
        }
        if (t.timeStamp - this.trackingClickStart > this.tapTimeout) {
          return true;
        }
        this.cancelNextClick = false;
        this.lastClickTime = t.timeStamp;
        n = this.trackingClickStart;
        this.trackingClick = false;
        this.trackingClickStart = 0;
        if (c) {
          a = t.changedTouches[0];
          (h = document.elementFromPoint(a.pageX - window.pageXOffset, a.pageY - window.pageYOffset) || h).fastClickScrollParent = this.targetElement.fastClickScrollParent;
        }
        if ((r = h.tagName.toLowerCase()) === "label") {
          if (e = this.findControl(h)) {
            this.focus(h);
            if (o) {
              return false;
            }
            h = e;
          }
        } else if (this.needsFocus(h)) {
          if (t.timeStamp - n > 100 || s && window.top !== window && r === "input") {
            this.targetElement = null;
            return false;
          } else {
            this.focus(h);
            this.sendClick(h, t);
            if (!s || r !== "select") {
              this.targetElement = null;
              t.preventDefault();
            }
            return false;
          }
        }
        return !!s && !l && !!(i = h.fastClickScrollParent) && i.fastClickLastScrollTop !== i.scrollTop || (this.needsClick(h) || (t.preventDefault(), this.sendClick(h, t)), false);
      };
      i.prototype.onTouchCancel = function () {
        this.trackingClick = false;
        this.targetElement = null;
      };
      i.prototype.onMouse = function (t) {
        return !this.targetElement || !!t.forwardedTouchEvent || !t.cancelable || !!this.needsClick(this.targetElement) && !this.cancelNextClick || !(t.stopImmediatePropagation ? t.stopImmediatePropagation() : t.propagationStopped = true, t.stopPropagation(), t.preventDefault(), 1);
      };
      i.prototype.onClick = function (t) {
        var e;
        if (this.trackingClick) {
          this.targetElement = null;
          this.trackingClick = false;
          return true;
        } else {
          return t.target.type === "submit" && t.detail === 0 || ((e = this.onMouse(t)) || (this.targetElement = null), e);
        }
      };
      i.prototype.destroy = function () {
        var t = this.layer;
        if (o) {
          t.removeEventListener("mouseover", this.onMouse, true);
          t.removeEventListener("mousedown", this.onMouse, true);
          t.removeEventListener("mouseup", this.onMouse, true);
        }
        t.removeEventListener("click", this.onClick, true);
        t.removeEventListener("touchstart", this.onTouchStart, false);
        t.removeEventListener("touchmove", this.onTouchMove, false);
        t.removeEventListener("touchend", this.onTouchEnd, false);
        t.removeEventListener("touchcancel", this.onTouchCancel, false);
      };
      i.notNeeded = function (t) {
        var e;
        var n;
        var r;
        if (window.ontouchstart === undefined) {
          return true;
        }
        if (n = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1]) {
          if (!o) {
            return true;
          }
          if (e = document.querySelector("meta[name=viewport]")) {
            if (e.content.indexOf("user-scalable=no") !== -1) {
              return true;
            }
            if (n > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
              return true;
            }
          }
        }
        if (h && (r = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/))[1] >= 10 && r[2] >= 3 && (e = document.querySelector("meta[name=viewport]"))) {
          if (e.content.indexOf("user-scalable=no") !== -1) {
            return true;
          }
          if (document.documentElement.scrollWidth <= window.outerWidth) {
            return true;
          }
        }
        return t.style.msTouchAction === "none" || t.style.touchAction === "manipulation" || !!(+(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1] >= 27) && !!(e = document.querySelector("meta[name=viewport]")) && (e.content.indexOf("user-scalable=no") !== -1 || !!(document.documentElement.scrollWidth <= window.outerWidth)) || t.style.touchAction === "none" || t.style.touchAction === "manipulation";
      };
      i.attach = function (t, e) {
        return new i(t, e);
      };
      if ((r = function () {
        return i;
      }.call(e, n, e, t)) !== undefined) {
        t.exports = r;
      }
    })();
  }]);
}

/*
     FILE ARCHIVED ON 09:38:41 Jun 26, 2022 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 22:24:07 Apr 03, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 0.387
  exclusion.robots: 0.014
  exclusion.robots.policy: 0.006
  esindex: 0.007
  cdx.remote: 15.744
  LoadShardBlock: 75.232 (3)
  PetaboxLoader3.datanode: 98.014 (5)
  PetaboxLoader3.resolve: 101.796 (3)
  load_resource: 148.461 (2)
*/