(() => {
    var e = {
        186: (e, t, n) => {
            "use strict";
            var r = n(985);

            function a() {
            }

            function o() {
            }

            o.resetWarningCache = a, e.exports = function () {
                function e(e, t, n, a, o, i) {
                    if (i !== r) {
                        var c = new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");
                        throw c.name = "Invariant Violation", c
                    }
                }

                function t() {
                    return e
                }

                e.isRequired = e;
                var n = {
                    array: e,
                    bigint: e,
                    bool: e,
                    func: e,
                    number: e,
                    object: e,
                    string: e,
                    symbol: e,
                    any: e,
                    arrayOf: t,
                    element: e,
                    elementType: e,
                    instanceOf: t,
                    node: e,
                    objectOf: t,
                    oneOf: t,
                    oneOfType: t,
                    shape: t,
                    exact: t,
                    checkPropTypes: o,
                    resetWarningCache: a
                };
                return n.PropTypes = n, n
            }
        }, 736: (e, t, n) => {
            e.exports = n(186)()
        }, 985: e => {
            "use strict";
            e.exports = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED"
        }, 141: e => {
            "use strict";

            function t(e) {
                try {
                    return JSON.stringify(e)
                } catch (e) {
                    return '"[Circular]"'
                }
            }

            e.exports = function (e, n, r) {
                var a = r && r.stringify || t;
                if ("object" == typeof e && null !== e) {
                    var o = n.length + 1;
                    if (1 === o) return e;
                    var i = new Array(o);
                    i[0] = a(e);
                    for (var c = 1; c < o; c++) i[c] = a(n[c]);
                    return i.join(" ")
                }
                if ("string" != typeof e) return e;
                var s = n.length;
                if (0 === s) return e;
                for (var l = "", u = 0, d = -1, f = e && e.length || 0, m = 0; m < f;) {
                    if (37 === e.charCodeAt(m) && m + 1 < f) {
                        switch (d = d > -1 ? d : 0, e.charCodeAt(m + 1)) {
                            case 100:
                            case 102:
                                if (u >= s) break;
                                if (null == n[u]) break;
                                d < m && (l += e.slice(d, m)), l += Number(n[u]), d = m + 2, m++;
                                break;
                            case 105:
                                if (u >= s) break;
                                if (null == n[u]) break;
                                d < m && (l += e.slice(d, m)), l += Math.floor(Number(n[u])), d = m + 2, m++;
                                break;
                            case 79:
                            case 111:
                            case 106:
                                if (u >= s) break;
                                if (void 0 === n[u]) break;
                                d < m && (l += e.slice(d, m));
                                var p = typeof n[u];
                                if ("string" === p) {
                                    l += "'" + n[u] + "'", d = m + 2, m++;
                                    break
                                }
                                if ("function" === p) {
                                    l += n[u].name || "<anonymous>", d = m + 2, m++;
                                    break
                                }
                                l += a(n[u]), d = m + 2, m++;
                                break;
                            case 115:
                                if (u >= s) break;
                                d < m && (l += e.slice(d, m)), l += String(n[u]), d = m + 2, m++;
                                break;
                            case 37:
                                d < m && (l += e.slice(d, m)), l += "%", d = m + 2, m++, u--
                        }
                        ++u
                    }
                    ++m
                }
                return -1 === d ? e : (d < f && (l += e.slice(d)), l)
            }
        }, 936: (e, t) => {
            "use strict";
            var n = Symbol.for("react.element"), r = Symbol.for("react.portal"), a = Symbol.for("react.fragment"),
                o = Symbol.for("react.strict_mode"), i = Symbol.for("react.profiler"), c = Symbol.for("react.provider"),
                s = Symbol.for("react.context"), l = Symbol.for("react.server_context"),
                u = Symbol.for("react.forward_ref"), d = Symbol.for("react.suspense"),
                f = Symbol.for("react.suspense_list"), m = Symbol.for("react.memo"), p = Symbol.for("react.lazy");
            Symbol.for("react.offscreen");
            Symbol.for("react.module.reference"), t.ForwardRef = u, t.isMemo = function (e) {
                return function (e) {
                    if ("object" == typeof e && null !== e) {
                        var t = e.$$typeof;
                        switch (t) {
                            case n:
                                switch (e = e.type) {
                                    case a:
                                    case i:
                                    case o:
                                    case d:
                                    case f:
                                        return e;
                                    default:
                                        switch (e = e && e.$$typeof) {
                                            case l:
                                            case s:
                                            case u:
                                            case p:
                                            case m:
                                            case c:
                                                return e;
                                            default:
                                                return t
                                        }
                                }
                            case r:
                                return t
                        }
                    }
                }(e) === m
            }
        }, 276: (e, t, n) => {
            "use strict";
            e.exports = n(936)
        }, 462: (e, t, n) => {
            "use strict";
            var r = n(609), a = Symbol.for("react.element"),
                o = (Symbol.for("react.fragment"), Object.prototype.hasOwnProperty),
                i = r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
                c = {key: !0, ref: !0, __self: !0, __source: !0};
            t.jsx = function (e, t, n) {
                var r, s = {}, l = null, u = null;
                for (r in void 0 !== n && (l = "" + n), void 0 !== t.key && (l = "" + t.key), void 0 !== t.ref && (u = t.ref), t) o.call(t, r) && !c.hasOwnProperty(r) && (s[r] = t[r]);
                if (e && e.defaultProps) for (r in t = e.defaultProps) void 0 === s[r] && (s[r] = t[r]);
                return {$$typeof: a, type: e, key: l, ref: u, props: s, _owner: i.current}
            }
        }, 70: (e, t, n) => {
            "use strict";
            e.exports = n(462)
        }, 609: e => {
            "use strict";
            e.exports = window.React
        }, 500: (e, t) => {
            var n;
            !function () {
                "use strict";
                var r = {}.hasOwnProperty;

                function a() {
                    for (var e = "", t = 0; t < arguments.length; t++) {
                        var n = arguments[t];
                        n && (e = i(e, o(n)))
                    }
                    return e
                }

                function o(e) {
                    if ("string" == typeof e || "number" == typeof e) return e;
                    if ("object" != typeof e) return "";
                    if (Array.isArray(e)) return a.apply(null, e);
                    if (e.toString !== Object.prototype.toString && !e.toString.toString().includes("[native code]")) return e.toString();
                    var t = "";
                    for (var n in e) r.call(e, n) && e[n] && (t = i(t, n));
                    return t
                }

                function i(e, t) {
                    return t ? e ? e + " " + t : e + t : e
                }

                e.exports ? (a.default = a, e.exports = a) : void 0 === (n = function () {
                    return a
                }.apply(t, [])) || (e.exports = n)
            }()
        }, 454: (e, t, n) => {
            "use strict";
            const r = n(141);
            e.exports = d;
            const a = function () {
                function e(e) {
                    return void 0 !== e && e
                }

                try {
                    return "undefined" != typeof globalThis || Object.defineProperty(Object.prototype, "globalThis", {
                        get: function () {
                            return delete Object.prototype.globalThis, this.globalThis = this
                        }, configurable: !0
                    }), globalThis
                } catch (t) {
                    return e(self) || e(window) || e(this) || {}
                }
            }().console || {}, o = {
                mapHttpRequest: v,
                mapHttpResponse: v,
                wrapRequestSerializer: b,
                wrapResponseSerializer: b,
                wrapErrorSerializer: b,
                req: v,
                res: v,
                err: h,
                errWithCause: h
            };

            function i(e, t) {
                return "silent" === e ? 1 / 0 : t.levels.values[e]
            }

            const c = Symbol("pino.logFuncs"), s = Symbol("pino.hierarchy"),
                l = {error: "log", fatal: "error", warn: "error", info: "log", debug: "log", trace: "log"};

            function u(e, t) {
                const n = {logger: t, parent: e[s]};
                t[s] = n
            }

            function d(e) {
                (e = e || {}).browser = e.browser || {};
                const t = e.browser.transmit;
                if (t && "function" != typeof t.send) throw Error("pino: transmit option must have a send function");
                const n = e.browser.write || a;
                e.browser.write && (e.browser.asObject = !0);
                const r = e.serializers || {}, o = function (e, t) {
                    return Array.isArray(e) ? e.filter((function (e) {
                        return "!stdSerializers.err" !== e
                    })) : !0 === e && Object.keys(t)
                }(e.browser.serialize, r);
                let s = e.browser.serialize;
                Array.isArray(e.browser.serialize) && e.browser.serialize.indexOf("!stdSerializers.err") > -1 && (s = !1);
                const h = Object.keys(e.customLevels || {}),
                    v = ["error", "fatal", "warn", "info", "debug", "trace"].concat(h);
                "function" == typeof n && v.forEach((function (e) {
                    n[e] = n
                })), (!1 === e.enabled || e.browser.disabled) && (e.level = "silent");
                const b = e.level || "info", E = Object.create(n);
                E.log || (E.log = y), function (e, t, n) {
                    const r = {};
                    t.forEach((e => {
                        r[e] = n[e] ? n[e] : a[e] || a[l[e] || "log"] || y
                    })), e[c] = r
                }(E, v, n), u({}, E), Object.defineProperty(E, "levelVal", {
                    get: function () {
                        return i(this.level, this)
                    }
                }), Object.defineProperty(E, "level", {
                    get: function () {
                        return this._level
                    }, set: function (e) {
                        if ("silent" !== e && !this.levels.values[e]) throw Error("unknown level " + e);
                        this._level = e, f(this, _, E, "error"), f(this, _, E, "fatal"), f(this, _, E, "warn"), f(this, _, E, "info"), f(this, _, E, "debug"), f(this, _, E, "trace"), h.forEach((e => {
                            f(this, _, E, e)
                        }))
                    }
                });
                const _ = {
                    transmit: t,
                    serialize: o,
                    asObject: e.browser.asObject,
                    formatters: e.browser.formatters,
                    levels: v,
                    timestamp: g(e),
                    messageKey: e.messageKey || "msg",
                    onChild: e.onChild || y
                };

                function w(n, a, i) {
                    if (!a) throw new Error("missing bindings for child Pino");
                    i = i || {}, o && a.serializers && (i.serializers = a.serializers);
                    const c = i.serializers;
                    if (o && c) {
                        var s = Object.assign({}, r, c), l = !0 === e.browser.serialize ? Object.keys(s) : o;
                        delete a.serializers, m([a], l, s, this._stdErrSerialize)
                    }

                    function d(e) {
                        this._childLevel = 1 + (0 | e._childLevel), this.bindings = a, s && (this.serializers = s, this._serialize = l), t && (this._logEvent = p([].concat(e._logEvent.bindings, a)))
                    }

                    d.prototype = this;
                    const f = new d(this);
                    return u(this, f), f.child = function (...e) {
                        return w.call(this, n, ...e)
                    }, f.level = i.level || this.level, n.onChild(f), f
                }

                return E.levels = function (e) {
                    const t = e.customLevels || {};
                    return {
                        values: Object.assign({}, d.levels.values, t),
                        labels: Object.assign({}, d.levels.labels, function (e) {
                            const t = {};
                            return Object.keys(e).forEach((function (n) {
                                t[e[n]] = n
                            })), t
                        }(t))
                    }
                }(e), E.level = b, E.setMaxListeners = E.getMaxListeners = E.emit = E.addListener = E.on = E.prependListener = E.once = E.prependOnceListener = E.removeListener = E.removeAllListeners = E.listeners = E.listenerCount = E.eventNames = E.write = E.flush = y, E.serializers = r, E._serialize = o, E._stdErrSerialize = s, E.child = function (...e) {
                    return w.call(this, _, ...e)
                }, t && (E._logEvent = p()), E
            }

            function f(e, t, n, o) {
                if (Object.defineProperty(e, o, {
                    value: i(e.level, n) > i(o, n) ? y : n[c][o],
                    writable: !0,
                    enumerable: !0,
                    configurable: !0
                }), e[o] === y) {
                    if (!t.transmit) return;
                    const r = i(t.transmit.level || e.level, n);
                    if (i(o, n) < r) return
                }
                e[o] = function (e, t, n, o) {
                    return s = e[c][o], function () {
                        const c = t.timestamp(), l = new Array(arguments.length),
                            u = Object.getPrototypeOf && Object.getPrototypeOf(this) === a ? a : this;
                        for (var d = 0; d < l.length; d++) l[d] = arguments[d];
                        var f = !1;
                        if (t.serialize && (m(l, this._serialize, this.serializers, this._stdErrSerialize), f = !0), t.asObject || t.formatters ? s.call(u, function (e, t, n, a, o) {
                            const {level: i, log: c = (e => e)} = o.formatters || {}, s = n.slice();
                            let l = s[0];
                            const u = {};
                            if (a && (u.time = a), i) {
                                const n = i(t, e.levels.values[t]);
                                Object.assign(u, n)
                            } else u.level = e.levels.values[t];
                            let d = 1 + (0 | e._childLevel);
                            if (d < 1 && (d = 1), null !== l && "object" == typeof l) {
                                for (; d-- && "object" == typeof s[0];) Object.assign(u, s.shift());
                                l = s.length ? r(s.shift(), s) : void 0
                            } else "string" == typeof l && (l = r(s.shift(), s));
                            return void 0 !== l && (u[o.messageKey] = l), c(u)
                        }(this, o, l, c, t)) : s.apply(u, l), t.transmit) {
                            const r = t.transmit.level || e._level, a = i(r, n), s = i(o, n);
                            if (s < a) return;
                            !function (e, t, n, r = !1) {
                                const a = t.send, o = t.ts, i = t.methodLevel, c = t.methodValue, s = t.val,
                                    l = e._logEvent.bindings;
                                r || m(n, e._serialize || Object.keys(e.serializers), e.serializers, void 0 === e._stdErrSerialize || e._stdErrSerialize), e._logEvent.ts = o, e._logEvent.messages = n.filter((function (e) {
                                    return -1 === l.indexOf(e)
                                })), e._logEvent.level.label = i, e._logEvent.level.value = c, a(i, e._logEvent, s), e._logEvent = p(l)
                            }(this, {
                                ts: c,
                                methodLevel: o,
                                methodValue: s,
                                transmitLevel: r,
                                transmitValue: n.levels.values[t.transmit.level || e._level],
                                send: t.transmit.send,
                                val: i(e._level, n)
                            }, l, f)
                        }
                    };
                    var s
                }(e, t, n, o);
                const l = function (e) {
                    const t = [];
                    e.bindings && t.push(e.bindings);
                    let n = e[s];
                    for (; n.parent;) n = n.parent, n.logger.bindings && t.push(n.logger.bindings);
                    return t.reverse()
                }(e);
                0 !== l.length && (e[o] = function (e, t) {
                    return function () {
                        return t.apply(this, [...e, ...arguments])
                    }
                }(l, e[o]))
            }

            function m(e, t, n, r) {
                for (const a in e) if (r && e[a] instanceof Error) e[a] = d.stdSerializers.err(e[a]); else if ("object" == typeof e[a] && !Array.isArray(e[a]) && t) for (const r in e[a]) t.indexOf(r) > -1 && r in n && (e[a][r] = n[r](e[a][r]))
            }

            function p(e) {
                return {ts: 0, messages: [], bindings: e || [], level: {label: "", value: 0}}
            }

            function h(e) {
                const t = {type: e.constructor.name, msg: e.message, stack: e.stack};
                for (const n in e) void 0 === t[n] && (t[n] = e[n]);
                return t
            }

            function g(e) {
                return "function" == typeof e.timestamp ? e.timestamp : !1 === e.timestamp ? E : _
            }

            function v() {
                return {}
            }

            function b(e) {
                return e
            }

            function y() {
            }

            function E() {
                return !1
            }

            function _() {
                return Date.now()
            }

            d.levels = {
                values: {fatal: 60, error: 50, warn: 40, info: 30, debug: 20, trace: 10},
                labels: {10: "trace", 20: "debug", 30: "info", 40: "warn", 50: "error", 60: "fatal"}
            }, d.stdSerializers = o, d.stdTimeFunctions = Object.assign({}, {
                nullTime: E,
                epochTime: _,
                unixTime: function () {
                    return Math.round(Date.now() / 1e3)
                },
                isoTime: function () {
                    return new Date(Date.now()).toISOString()
                }
            }), e.exports.default = d, e.exports.pino = d
        }
    }, t = {};

    function n(r) {
        var a = t[r];
        if (void 0 !== a) return a.exports;
        var o = t[r] = {exports: {}};
        return e[r](o, o.exports, n), o.exports
    }

    n.n = e => {
        var t = e && e.__esModule ? () => e.default : () => e;
        return n.d(t, {a: t}), t
    }, n.d = (e, t) => {
        for (var r in t) n.o(t, r) && !n.o(e, r) && Object.defineProperty(e, r, {enumerable: !0, get: t[r]})
    }, n.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t), (() => {
        "use strict";
        var e = n(609), t = n.n(e);
        const r = window.wp.element;
        let a = {data: ""},
            o = e => "object" == typeof window ? ((e ? e.querySelector("#_goober") : window._goober) || Object.assign((e || document.head).appendChild(document.createElement("style")), {
                innerHTML: " ",
                id: "_goober"
            })).firstChild : e || a, i = /(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,
            c = /\/\*[^]*?\*\/|  +/g, s = /\n+/g, l = (e, t) => {
                let n = "", r = "", a = "";
                for (let o in e) {
                    let i = e[o];
                    "@" == o[0] ? "i" == o[1] ? n = o + " " + i + ";" : r += "f" == o[1] ? l(i, o) : o + "{" + l(i, "k" == o[1] ? "" : t) + "}" : "object" == typeof i ? r += l(i, t ? t.replace(/([^,])+/g, (e => o.replace(/(^:.*)|([^,])+/g, (t => /&/.test(t) ? t.replace(/&/g, e) : e ? e + " " + t : t)))) : o) : null != i && (o = /^--/.test(o) ? o : o.replace(/[A-Z]/g, "-$&").toLowerCase(), a += l.p ? l.p(o, i) : o + ":" + i + ";")
                }
                return n + (t && a ? t + "{" + a + "}" : a) + r
            }, u = {}, d = e => {
                if ("object" == typeof e) {
                    let t = "";
                    for (let n in e) t += n + d(e[n]);
                    return t
                }
                return e
            }, f = (e, t, n, r, a) => {
                let o = d(e), f = u[o] || (u[o] = (e => {
                    let t = 0, n = 11;
                    for (; t < e.length;) n = 101 * n + e.charCodeAt(t++) >>> 0;
                    return "go" + n
                })(o));
                if (!u[f]) {
                    let t = o !== e ? e : (e => {
                        let t, n, r = [{}];
                        for (; t = i.exec(e.replace(c, ""));) t[4] ? r.shift() : t[3] ? (n = t[3].replace(s, " ").trim(), r.unshift(r[0][n] = r[0][n] || {})) : r[0][t[1]] = t[2].replace(s, " ").trim();
                        return r[0]
                    })(e);
                    u[f] = l(a ? {["@keyframes " + f]: t} : t, n ? "" : "." + f)
                }
                let m = n && u.g ? u.g : null;
                return n && (u.g = u[f]), ((e, t, n, r) => {
                    r ? t.data = t.data.replace(r, e) : -1 === t.data.indexOf(e) && (t.data = n ? e + t.data : t.data + e)
                })(u[f], t, r, m), f
            }, m = (e, t, n) => e.reduce(((e, r, a) => {
                let o = t[a];
                if (o && o.call) {
                    let e = o(n), t = e && e.props && e.props.className || /^go/.test(e) && e;
                    o = t ? "." + t : e && "object" == typeof e ? e.props ? "" : l(e, "") : !1 === e ? "" : e
                }
                return e + r + (null == o ? "" : o)
            }), "");

        function p(e) {
            let t = this || {}, n = e.call ? e(t.p) : e;
            return f(n.unshift ? n.raw ? m(n, [].slice.call(arguments, 1), t.p) : n.reduce(((e, n) => Object.assign(e, n && n.call ? n(t.p) : n)), {}) : n, o(t.target), t.g, t.o, t.k)
        }

        p.bind({g: 1});
        let h, g, v, b = p.bind({k: 1});

        function y(e, t) {
            let n = this || {};
            return function () {
                let r = arguments;

                function a(o, i) {
                    let c = Object.assign({}, o), s = c.className || a.className;
                    n.p = Object.assign({theme: g && g()}, c), n.o = / *go\d+/.test(s), c.className = p.apply(n, r) + (s ? " " + s : ""), t && (c.ref = i);
                    let l = e;
                    return e[0] && (l = c.as || e, delete c.as), v && l[0] && v(c), h(l, c)
                }

                return t ? t(a) : a
            }
        }

        var E = (e, t) => (e => "function" == typeof e)(e) ? e(t) : e, _ = (() => {
            let e = 0;
            return () => (++e).toString()
        })(), w = (() => {
            let e;
            return () => {
                if (void 0 === e && typeof window < "u") {
                    let t = matchMedia("(prefers-reduced-motion: reduce)");
                    e = !t || t.matches
                }
                return e
            }
        })(), k = new Map, S = e => {
            if (k.has(e)) return;
            let t = setTimeout((() => {
                k.delete(e), T({type: 4, toastId: e})
            }), 1e3);
            k.set(e, t)
        }, O = (e, t) => {
            switch (t.type) {
                case 0:
                    return {...e, toasts: [t.toast, ...e.toasts].slice(0, 20)};
                case 1:
                    return t.toast.id && (e => {
                        let t = k.get(e);
                        t && clearTimeout(t)
                    })(t.toast.id), {...e, toasts: e.toasts.map((e => e.id === t.toast.id ? {...e, ...t.toast} : e))};
                case 2:
                    let {toast: n} = t;
                    return e.toasts.find((e => e.id === n.id)) ? O(e, {type: 1, toast: n}) : O(e, {type: 0, toast: n});
                case 3:
                    let {toastId: r} = t;
                    return r ? S(r) : e.toasts.forEach((e => {
                        S(e.id)
                    })), {...e, toasts: e.toasts.map((e => e.id === r || void 0 === r ? {...e, visible: !1} : e))};
                case 4:
                    return void 0 === t.toastId ? {...e, toasts: []} : {
                        ...e,
                        toasts: e.toasts.filter((e => e.id !== t.toastId))
                    };
                case 5:
                    return {...e, pausedAt: t.time};
                case 6:
                    let a = t.time - (e.pausedAt || 0);
                    return {
                        ...e,
                        pausedAt: void 0,
                        toasts: e.toasts.map((e => ({...e, pauseDuration: e.pauseDuration + a})))
                    }
            }
        }, C = [], N = {toasts: [], pausedAt: void 0}, T = e => {
            N = O(N, e), C.forEach((e => {
                e(N)
            }))
        }, x = {blank: 4e3, error: 4e3, success: 2e3, loading: 1 / 0, custom: 4e3}, I = e => (t, n) => {
            let r = ((e, t = "blank", n) => ({
                createdAt: Date.now(),
                visible: !0,
                type: t,
                ariaProps: {role: "status", "aria-live": "polite"},
                message: e,
                pauseDuration: 0, ...n,
                id: (null == n ? void 0 : n.id) || _()
            }))(t, e, n);
            return T({type: 2, toast: r}), r.id
        }, P = (e, t) => I("blank")(e, t);
        P.error = I("error"), P.success = I("success"), P.loading = I("loading"), P.custom = I("custom"), P.dismiss = e => {
            T({type: 3, toastId: e})
        }, P.remove = e => T({type: 4, toastId: e}), P.promise = (e, t, n) => {
            let r = P.loading(t.loading, {...n, ...null == n ? void 0 : n.loading});
            return e.then((e => (P.success(E(t.success, e), {id: r, ...n, ...null == n ? void 0 : n.success}), e))).catch((e => {
                P.error(E(t.error, e), {id: r, ...n, ...null == n ? void 0 : n.error})
            })), e
        };
        var A = (e, t) => {
                T({type: 1, toast: {id: e, height: t}})
            }, R = () => {
                T({type: 5, time: Date.now()})
            }, M = b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`, z = b`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`, L = b`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`, j = y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e => e.primary || "#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${M} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${z} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e => e.secondary || "#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${L} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`, D = b`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`, F = y("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e => e.secondary || "#e0e0e0"};
  border-right-color: ${e => e.primary || "#616161"};
  animation: ${D} 1s linear infinite;
`, $ = b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`, U = b`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`, H = y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e => e.primary || "#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${$} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${U} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e => e.secondary || "#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`, V = y("div")`
  position: absolute;
`, B = y("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`, G = b`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`, W = y("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${G} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`, K = ({toast: t}) => {
                let {icon: n, type: r, iconTheme: a} = t;
                return void 0 !== n ? "string" == typeof n ? e.createElement(W, null, n) : n : "blank" === r ? null : e.createElement(B, null, e.createElement(F, {...a}), "loading" !== r && e.createElement(V, null, "error" === r ? e.createElement(j, {...a}) : e.createElement(H, {...a})))
            },
            q = e => `\n0% {transform: translate3d(0,${-200 * e}%,0) scale(.6); opacity:.5;}\n100% {transform: translate3d(0,0,0) scale(1); opacity:1;}\n`,
            Y = e => `\n0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}\n100% {transform: translate3d(0,${-150 * e}%,-1px) scale(.6); opacity:0;}\n`,
            Z = y("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`, Q = y("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`, J = e.memo((({toast: t, position: n, style: r, children: a}) => {
                let o = t.height ? ((e, t) => {
                        let n = e.includes("top") ? 1 : -1, [r, a] = w() ? ["0%{opacity:0;} 100%{opacity:1;}", "0%{opacity:1;} 100%{opacity:0;}"] : [q(n), Y(n)];
                        return {animation: t ? `${b(r)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards` : `${b(a)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}
                    })(t.position || n || "top-center", t.visible) : {opacity: 0}, i = e.createElement(K, {toast: t}),
                    c = e.createElement(Q, {...t.ariaProps}, E(t.message, t));
                return e.createElement(Z, {
                    className: t.className,
                    style: {...o, ...r, ...t.style}
                }, "function" == typeof a ? a({icon: i, message: c}) : e.createElement(e.Fragment, null, i, c))
            }));
        !function (e, t, n, r) {
            l.p = void 0, h = e, g = void 0, v = void 0
        }(e.createElement);
        var X = ({id: t, className: n, style: r, onHeightUpdate: a, children: o}) => {
            let i = e.useCallback((e => {
                if (e) {
                    let n = () => {
                        let n = e.getBoundingClientRect().height;
                        a(t, n)
                    };
                    n(), new MutationObserver(n).observe(e, {subtree: !0, childList: !0, characterData: !0})
                }
            }), [t, a]);
            return e.createElement("div", {ref: i, className: n, style: r}, o)
        }, ee = p`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`, te = ({
                               reverseOrder: t,
                               position: n = "top-center",
                               toastOptions: r,
                               gutter: a,
                               children: o,
                               containerStyle: i,
                               containerClassName: c
                           }) => {
            let {toasts: s, handlers: l} = (t => {
                let {toasts: n, pausedAt: r} = ((t = {}) => {
                    let [n, r] = (0, e.useState)(N);
                    (0, e.useEffect)((() => (C.push(r), () => {
                        let e = C.indexOf(r);
                        e > -1 && C.splice(e, 1)
                    })), [n]);
                    let a = n.toasts.map((e => {
                        var n, r;
                        return {
                            ...t, ...t[e.type], ...e,
                            duration: e.duration || (null == (n = t[e.type]) ? void 0 : n.duration) || (null == t ? void 0 : t.duration) || x[e.type],
                            style: {...t.style, ...null == (r = t[e.type]) ? void 0 : r.style, ...e.style}
                        }
                    }));
                    return {...n, toasts: a}
                })(t);
                (0, e.useEffect)((() => {
                    if (r) return;
                    let e = Date.now(), t = n.map((t => {
                        if (t.duration === 1 / 0) return;
                        let n = (t.duration || 0) + t.pauseDuration - (e - t.createdAt);
                        if (!(n < 0)) return setTimeout((() => P.dismiss(t.id)), n);
                        t.visible && P.dismiss(t.id)
                    }));
                    return () => {
                        t.forEach((e => e && clearTimeout(e)))
                    }
                }), [n, r]);
                let a = (0, e.useCallback)((() => {
                    r && T({type: 6, time: Date.now()})
                }), [r]), o = (0, e.useCallback)(((e, t) => {
                    let {reverseOrder: r = !1, gutter: a = 8, defaultPosition: o} = t || {},
                        i = n.filter((t => (t.position || o) === (e.position || o) && t.height)),
                        c = i.findIndex((t => t.id === e.id)), s = i.filter(((e, t) => t < c && e.visible)).length;
                    return i.filter((e => e.visible)).slice(...r ? [s + 1] : [0, s]).reduce(((e, t) => e + (t.height || 0) + a), 0)
                }), [n]);
                return {toasts: n, handlers: {updateHeight: A, startPause: R, endPause: a, calculateOffset: o}}
            })(r);
            return e.createElement("div", {
                style: {
                    position: "fixed",
                    zIndex: 9999,
                    top: 16,
                    left: 16,
                    right: 16,
                    bottom: 16,
                    pointerEvents: "none", ...i
                }, className: c, onMouseEnter: l.startPause, onMouseLeave: l.endPause
            }, s.map((r => {
                let i = r.position || n, c = ((e, t) => {
                    let n = e.includes("top"), r = n ? {top: 0} : {bottom: 0},
                        a = e.includes("center") ? {justifyContent: "center"} : e.includes("right") ? {justifyContent: "flex-end"} : {};
                    return {
                        left: 0,
                        right: 0,
                        display: "flex",
                        position: "absolute",
                        transition: w() ? void 0 : "all 230ms cubic-bezier(.21,1.02,.73,1)",
                        transform: `translateY(${t * (n ? 1 : -1)}px)`, ...r, ...a
                    }
                })(i, l.calculateOffset(r, {reverseOrder: t, gutter: a, defaultPosition: n}));
                return e.createElement(X, {
                    id: r.id,
                    key: r.id,
                    onHeightUpdate: l.updateHeight,
                    className: r.visible ? ee : "",
                    style: c
                }, "custom" === r.type ? E(r.message, r) : o ? o(r) : e.createElement(J, {toast: r, position: i}))
            })))
        }, ne = P;
        const re = e.forwardRef((function (t, n) {
            return e.createElement("svg", Object.assign({
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 24 24",
                "aria-hidden": "true",
                ref: n
            }, t), e.createElement("path", {
                fill: "none",
                d: "M0 0h24v24H0z"
            }), e.createElement("path", {d: "M12 2a1 1 0 011 1v3a1 1 0 01-2 0V3a1 1 0 011-1zm0 15a1 1 0 011 1v3a1 1 0 01-2 0v-3a1 1 0 011-1zm10-5a1 1 0 01-1 1h-3a1 1 0 010-2h3a1 1 0 011 1zM7 12a1 1 0 01-1 1H3a1 1 0 010-2h3a1 1 0 011 1zm12.071 7.071a1 1 0 01-1.414 0l-2.121-2.121a1 1 0 011.414-1.414l2.121 2.12a1 1 0 010 1.415zM8.464 8.464a1 1 0 01-1.414 0l-2.12-2.12a1 1 0 011.414-1.415l2.12 2.121a1 1 0 010 1.414zM4.93 19.071a1 1 0 010-1.414l2.121-2.121a1 1 0 111.414 1.414l-2.12 2.121a1 1 0 01-1.415 0zM15.536 8.464a1 1 0 010-1.414l2.12-2.121a1 1 0 011.415 1.414L16.95 8.464a1 1 0 01-1.414 0z"}))
        })), ae = window.wp.data, oe = window.wp.i18n;
        var ie = n(500), ce = n.n(ie);
        const se = window.wp.components, le = window.wp.compose, ue = ({
                                                                           href: t,
                                                                           target: n,
                                                                           isSmall: r,
                                                                           className: a,
                                                                           disabled: o,
                                                                           icon: i,
                                                                           iconPosition: c = "left",
                                                                           iconSize: s,
                                                                           showTooltip: l,
                                                                           tooltipPosition: u,
                                                                           shortcut: d,
                                                                           label: f,
                                                                           children: m,
                                                                           text: p,
                                                                           variant: h,
                                                                           describedBy: g,
                                                                           stretch: v = !1,
                                                                           "aria-label": b,
                                                                           onMouseDown: y,
                                                                           onClick: E,
                                                                           ..._
                                                                       }, w) => {
            const k = (0, le.useInstanceId)(ue, "components-button__description"),
                S = ce()("nectar-component", "nectar-component__button", a, {
                    "is-primary": "primary" === h,
                    "is-underlined": "underline" === h,
                    "is-underlined is-underlined--alt": "underline-alt" === h,
                    "is-secondary": "secondary" === h,
                    "is-tertiary": "tertiary" === h,
                    "is-danger": "danger" === h,
                    "is-toolbar-item": "toolbar-item" === h,
                    "is-small": r,
                    stretch: v,
                    "is-link": "link" === h,
                    "has-text": !!i && !!m || !!i && !!p,
                    "has-icon": !!i,
                    "has-dashicon": "string" == typeof i
                }), O = void 0 === t || o ? "button" : "a",
                C = "a" === O ? {href: t, target: n, "aria-disabled": ""} : {
                    type: "button",
                    disabled: o,
                    "aria-disabled": ""
                }, N = e => {
                    e.stopPropagation(), e.preventDefault()
                };
            o && (C["aria-disabled"] = "true");
            const T = !o && (l && f || d || !!f && !m && !1 !== l), x = g ? String(k) : void 0,
                I = (0, e.createElement)(O, {
                    ...C, ..._,
                    className: S,
                    "aria-label": b || f,
                    ref: w,
                    onClick: o ? N : E,
                    onMouseDown: o ? N : y
                }, (0, e.createElement)("span", null, i && "left" === c && (0, e.createElement)(se.Icon, {
                    icon: i,
                    size: s
                }), p && (0, e.createElement)("span", {className: "nectar-component__button__text"}, p), i && "right" === c && (0, e.createElement)(se.Icon, {
                    className: "align-right",
                    icon: i,
                    size: s
                }), (0, e.createElement)("span", {className: "nectar-component__button__text"}, m)));
            return (0, e.createElement)(e.Fragment, null, T ? (0, e.createElement)(se.Tooltip, {
                text: m && g ? g : f,
                shortcut: d,
                placement: u
            }, I) : I, g && (0, e.createElement)(se.VisuallyHidden, null, (0, e.createElement)("span", {id: x}, g)))
        }, de = (0, r.forwardRef)(ue), fe = window.wp.apiFetch;
        var me = n.n(fe);
        const pe = "/nectar/v1", he = "https://api.nectarblocks.com/v1", ge = async (e, t) => await me()({
            path: `${pe}/settings/admin-panel`,
            method: "POST",
            data: {panel: e, data: t}
        }), ve = (0, n(454).pino)({level: "error", enabled: !0}), be = {
            isInitialized: !1,
            status: "idle",
            data: {
                code: {cssCode: "", jsCodeHead: "", jsCodeBody: ""},
                auth: {licenseKey: "", isLicenseActive: !1, token: "", autoUpdate: !1, analytics: !1, bugReports: !0},
                pluginOptions: {shouldHideTitleDefault: !1, shouldDisableNectarGlobalTypography: !1}
            }
        }, ye = {
            initialize: e => ({type: "INITIALIZE", data: e}),
            setStatus: e => ({type: "SET_STATUS", data: e}),
            updateCode: e => ({type: "UPDATE_CODE", data: e}),
            updateAuth: e => (ve.info("UPDATE_AUTH:", e), {type: "UPDATE_AUTH", data: e}),
            updatePluginOptions: e => (ve.info("UPDATE_PLUGIN_OPTIONS:", e), {type: "UPDATE_PLUGIN_OPTIONS", data: e})
        }, Ee = {
            async getOptions() {
                const e = await me()({path: `${pe}/settings/admin-panel`, method: "GET"});
                return ye.initialize({isInitialized: !0, data: e, status: "idle"})
            }
        }, _e = {
            reducer: (e = be, t) => {
                switch (t.type) {
                    case"SET_STATUS":
                        return {...e, status: t.data};
                    case"UPDATE_CODE":
                        return {...e, data: {...e.data, code: t.data}};
                    case"UPDATE_AUTH":
                        return {...e, data: {...e.data, auth: t.data}};
                    case"UPDATE_PLUGIN_OPTIONS":
                        return {...e, data: {...e.data, pluginOptions: t.data}};
                    case"INITIALIZE":
                        return {...e, ...t.data}
                }
                return e
            },
            actions: ye,
            selectors: {getOptions: e => e.data, getStatus: e => e.status, isInitialized: e => e.isInitialized},
            resolvers: Ee
        }, we = (0, ae.createReduxStore)("nectar/admin-panel", _e);
        (0, ae.register)(we);
        const ke = e.forwardRef((function (t, n) {
            return e.createElement("svg", Object.assign({
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 24 24",
                "aria-hidden": "true",
                ref: n
            }, t), e.createElement("path", {
                fill: "none",
                d: "M0 0h24v24H0z"
            }), e.createElement("path", {d: "M8.686 4l2.607-2.607a1 1 0 011.414 0L15.314 4H19a1 1 0 011 1v3.686l2.607 2.607a1 1 0 010 1.414L20 15.314V19a1 1 0 01-1 1h-3.686l-2.607 2.607a1 1 0 01-1.414 0L8.686 20H5a1 1 0 01-1-1v-3.686l-2.607-2.607a1 1 0 010-1.414L4 8.686V5a1 1 0 011-1h3.686zM6 6v3.515L3.515 12 6 14.485V18h3.515L12 20.485 14.485 18H18v-3.515L20.485 12 18 9.515V6h-3.515L12 3.515 9.515 6H6zm6 10a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z"}))
        })), Se = e.forwardRef((function (t, n) {
            return e.createElement("svg", Object.assign({
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 24 24",
                "aria-hidden": "true",
                ref: n
            }, t), e.createElement("path", {
                fill: "none",
                d: "M0 0h24v24H0z"
            }), e.createElement("path", {d: "M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-4.987-3.744A7.966 7.966 0 0012 20a7.97 7.97 0 005.167-1.892A6.979 6.979 0 0012.16 16a6.981 6.981 0 00-5.147 2.256zM5.616 16.82A8.975 8.975 0 0112.16 14a8.972 8.972 0 016.362 2.634 8 8 0 10-12.906.187zM12 13a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z"}))
        })), Oe = e.forwardRef((function (t, n) {
            return e.createElement("svg", Object.assign({
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 24 24",
                "aria-hidden": "true",
                ref: n
            }, t), e.createElement("path", {
                fill: "none",
                d: "M0 0h24v24H0z"
            }), e.createElement("path", {d: "M12 1l9.5 5.5v11L12 23l-9.5-5.5v-11L12 1zm0 2.311L4.5 7.653v8.694l7.5 4.342 7.5-4.342V7.653L12 3.311zM12 16a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z"}))
        })), Ce = e.forwardRef((function (t, n) {
            return e.createElement("svg", Object.assign({
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 24 24",
                "aria-hidden": "true",
                ref: n
            }, t), e.createElement("path", {
                fill: "none",
                d: "M0 0h24v24H0z"
            }), e.createElement("path", {d: "M3 3h18a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zm1 2v14h16V5H4zm8 10h6v2h-6v-2zm-3.333-3L5.838 9.172l1.415-1.415L11.495 12l-4.242 4.243-1.415-1.415L8.667 12z"}))
        })), Ne = e.forwardRef((function (t, n) {
            return e.createElement("svg", Object.assign({
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 24 24",
                "aria-hidden": "true",
                ref: n
            }, t), e.createElement("path", {
                fill: "none",
                d: "M0 0h24v24H0z"
            }), e.createElement("path", {d: "M5.33 3.271a3.5 3.5 0 014.254 4.963l10.709 10.71-1.414 1.414-10.71-10.71a3.502 3.502 0 01-4.962-4.255L5.444 7.63a1.5 1.5 0 102.121-2.121L5.329 3.27zm10.367 1.884l3.182-1.768 1.414 1.414-1.768 3.182-1.768.354-2.12 2.121-1.415-1.414 2.121-2.121.354-1.768zm-6.718 8.132l1.414 1.414-5.303 5.303a1 1 0 01-1.492-1.327l.078-.087 5.303-5.303z"}))
        })), Te = e.forwardRef((function (t, n) {
            return e.createElement("svg", Object.assign({
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 24 24",
                "aria-hidden": "true",
                ref: n
            }, t), e.createElement("path", {
                fill: "none",
                d: "M0 0h24v24H0z"
            }), e.createElement("path", {d: "M20 22H4a1 1 0 01-1-1V3a1 1 0 011-1h16a1 1 0 011 1v18a1 1 0 01-1 1zm-1-2V4H5v16h14zM7 6h4v4H7V6zm0 6h10v2H7v-2zm0 4h10v2H7v-2zm6-9h4v2h-4V7z"}))
        }));
        var xe;

        function Ie() {
            return Ie = Object.assign ? Object.assign.bind() : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                    var n = arguments[t];
                    for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r])
                }
                return e
            }, Ie.apply(null, arguments)
        }

        var Pe;

        function Ae() {
            return Ae = Object.assign ? Object.assign.bind() : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                    var n = arguments[t];
                    for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r])
                }
                return e
            }, Ae.apply(null, arguments)
        }

        const Re = "nectar-admin-panel", Me = {
                "getting-started": {
                    i18n: (0, oe.__)("Getting Started", "nectar-blocks"),
                    icon: (0, e.createElement)(ke, {width: 20})
                },
                authorization: {
                    i18n: (0, oe.__)("Authorization", "nectar-blocks"),
                    icon: (0, e.createElement)(Se, {width: 20})
                },
                "plugin-options": {
                    i18n: (0, oe.__)("Plugin Options", "nectar-blocks"),
                    icon: (0, e.createElement)(Oe, {width: 20})
                },
                "custom-code": {
                    i18n: (0, oe.__)("Custom Code", "nectar-blocks"),
                    icon: (0, e.createElement)(Ce, {width: 20})
                },
                "custom-fonts": {
                    i18n: (0, oe.__)("Custom Fonts", "nectar-blocks"),
                    icon: (0, e.createElement)((function (t) {
                        return e.createElement("svg", Ie({
                            xmlns: "http://www.w3.org/2000/svg",
                            fill: "currentColor",
                            viewBox: "0 0 24 24"
                        }, t), xe || (xe = e.createElement("path", {d: "M5 4h14v4h-1.5C17 6 17 5 15 5h-5v7h3c1 0 2-.5 2-2h1v5h-1c0-1.5-1-2-2-2h-3v4.5c0 2.5 3.5 2.5 3.5 2.5v1H5v-1c2-.5 2-1.5 2-2.5v-10c0-1 0-2-2-2.5z"})))
                    }), {width: 20})
                },
                "import-export": {
                    i18n: (0, oe.__)("Import/Export", "nectar-blocks"),
                    icon: (0, e.createElement)((function (t) {
                        return e.createElement("svg", Ae({
                            xmlns: "http://www.w3.org/2000/svg",
                            fill: "currentColor",
                            viewBox: "0 0 24 24"
                        }, t), Pe || (Pe = e.createElement("path", {d: "M22 4a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1zM4 15h3.416a5.001 5.001 0 0 0 9.168 0H20v4H4zM4 5h16v8h-5a3 3 0 1 1-6 0H4zm12 4h-3V6h-2v3H8l4 4.5z"})))
                    }), {width: 20})
                }
            }, ze = {
                customizer: {
                    i18n: (0, oe.__)("Theme Options", "nectar-blocks"),
                    icon: (0, e.createElement)(Ne, {width: 20}),
                    url: window.nectarblocks_env.THEME_OPTIONS_URL,
                    condition: () => null !== window.nectarblocks_env.NB_THEME_VERSION
                },
                documentation: {
                    i18n: (0, oe.__)("Documentation", "nectar-blocks"),
                    icon: (0, e.createElement)(Te, {width: 20}),
                    url: "https://docs.nectarblocks.com"
                }
            }, Le = ["authorization", "custom-code", "plugin-options"], je = {
                "custom-code": "code",
                authorization: "auth",
                "plugin-options": "pluginOptions",
                "custom-fonts": void 0,
                "getting-started": void 0,
                "import-export": void 0
            }, De = ({currentTab: t}) => {
                const {
                    isInitialized: n,
                    status: r,
                    data: a
                } = (0, ae.useSelect)((e => ({
                    isInitialized: e(we).isInitialized(),
                    status: e(we).getStatus(),
                    data: e(we).getOptions()
                })), []), o = ce()({[`${r}`]: !0, [`${Re}__action-bar__save`]: !0});
                return (0, e.createElement)("div", {className: `${Re}__action-bar`}, (0, e.createElement)("div", {className: `${Re}__action-bar__left`}, (0, e.createElement)("h3", null, Me[t].i18n)), (0, e.createElement)("div", {className: `${Re}__action-bar__right`}, n && Le.includes(t) && (0, e.createElement)(de, {
                    variant: "primary",
                    className: o,
                    type: "submit",
                    onClick: async () => {
                        (0, ae.dispatch)(we).setStatus("busy");
                        const e = je[t];
                        if (void 0 === e) return ve.debug("Unable to determine which panel."), ne.error((0, oe.__)("Failed to save settings.", "nectar-blocks")), void (0, ae.dispatch)(we).setStatus("failed");
                        const n = a[e];
                        "success" === (await ge(e, n)).status ? (ne.success((0, oe.__)("Successfully saved settings for:", "nectar-blocks") + " " + Me[t]), (0, ae.dispatch)(we).setStatus("success")) : (ne.error((0, oe.__)("Failed to save settings for:", "nectar-blocks") + " " + Me[t]), (0, ae.dispatch)(we).setStatus("failed")), setTimeout((() => (0, ae.dispatch)(we).setStatus("idle")), 3e3)
                    }
                }, (0, e.createElement)("span", {className: "idle"}, (0, oe.__)("Save Options", "nectar-blocks")), (0, e.createElement)("span", {className: "fail"}, (0, oe.__)("Error Saving", "nectar-blocks")), (0, e.createElement)("span", {className: "success"}, (0, oe.__)("Options Saved", "nectar-blocks")), (0, e.createElement)("i", null, (0, e.createElement)(re, null)))))
            }, Fe = e.forwardRef((function (t, n) {
                return e.createElement("svg", Object.assign({
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 24 24",
                    "aria-hidden": "true",
                    ref: n
                }, t), e.createElement("path", {
                    fill: "none",
                    d: "M0 0h24v24H0z"
                }), e.createElement("path", {d: "M3.055 13H5.07a7.002 7.002 0 0013.858 0h2.016a9.001 9.001 0 01-17.89 0zm0-2a9.001 9.001 0 0117.89 0H18.93a7.002 7.002 0 00-13.858 0H3.055z"}))
            })), $e = ({
                           title: t,
                           description: n,
                           id: r,
                           children: a
                       }) => (0, e.createElement)("div", {className: "nectar-form__row"}, (0, e.createElement)("label", {htmlFor: r}, (0, e.createElement)("span", {className: "nectar-form__label"}, t), n && (0, e.createElement)("span", {className: "nectar-form__desc"}, n)), (0, e.createElement)("div", null, a)),
            Ue = ({id: t, checked: n = !1, size: a = "regular", onChange: o, className: i, disabled: c, label: s}) => {
                const [l, u] = (0, r.useState)(n), d = "nectar-component__toggle-switch";
                (0, r.useEffect)((() => {
                    u(n)
                }), [n]);
                const f = ce()("nectar-component", d, i, {active: l, [`${d}--size-${a}`]: !0}),
                    m = ce()(`${d}__inner`, {active: l});
                return (0, e.createElement)(e.Fragment, null, (0, e.createElement)("div", {className: f}, (0, e.createElement)("div", {className: m}, (0, e.createElement)("input", {
                    id: t,
                    className: "components-form-toggle__input",
                    type: "checkbox",
                    checked: l,
                    onChange: () => {
                        o?.(!l), u(!l)
                    },
                    disabled: c
                }), (0, e.createElement)("span", {className: `${d}__switch`})), s && (0, e.createElement)("label", {htmlFor: t}, s)))
            }, He = e.forwardRef((function (t, n) {
                return e.createElement("svg", Object.assign({
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 24 24",
                    "aria-hidden": "true",
                    ref: n
                }, t), e.createElement("path", {
                    fill: "none",
                    d: "M0 0h24v24H0z"
                }), e.createElement("path", {d: "M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z"}))
            })), Ve = e.forwardRef((function (t, n) {
                return e.createElement("svg", Object.assign({
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 24 24",
                    "aria-hidden": "true",
                    ref: n
                }, t), e.createElement("path", {
                    fill: "none",
                    d: "M0 0h24v24H0z"
                }), e.createElement("path", {d: "M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"}))
            })), Be = () => ({
                phpVersion: window.nectarblocks_env.PHP_VERSION,
                wordpressVersion: window.nectarblocks_env.WORDPRESS_VERSION,
                pluginVersion: window.nectarblocks_env.NB_PLUGIN_VERSION,
                themeVersion: window.nectarblocks_env.NB_THEME_VERSION,
                iePluginVersion: window.nectarblocks_env.NB_IE_VERSION
            }), Ge = ({
                          title: t,
                          description: n,
                          id: a,
                          placeholder: o,
                          verifiedPurchase: i,
                          keyValue: c,
                          token: s,
                          onChange: l
                      }) => {
                const u = (0, r.useRef)(null), {auth: d} = (0, ae.useSelect)((e => {
                    const {auth: t} = e(we).getOptions();
                    return {auth: t}
                }), []);
                return (0, e.createElement)($e, {
                    id: "purchase_code",
                    title: t,
                    description: n
                }, (0, e.createElement)("div", {className: ce()("nectar-form__text", "nectar-form__text--inline-button", "nectar-form__field")}, (0, e.createElement)("input", {
                    ref: u,
                    type: "text",
                    id: a,
                    placeholder: o,
                    value: c,
                    onChange: e => {
                        l(e.target.value)
                    },
                    size: 36,
                    maxLength: 36
                }), (0, e.createElement)(de, {
                    text: (0, oe.__)("Register", "nectar-blocks"),
                    variant: "primary",
                    disabled: i,
                    onClick: async () => {
                        if ((0, ae.dispatch)(we).setStatus("busy"), !u?.current) return;
                        const e = Be(), t = await (async (e, t) => {
                            const n = await fetch(`${he}/license/register`, {
                                method: "POST",
                                headers: {Accept: "application.json", "Content-Type": "application/json"},
                                body: JSON.stringify({license: e, hostname: window.location.hostname, analytics: t})
                            });
                            return await n.json()
                        })(u.current.value, e);
                        if ("success" === t.status) {
                            (0, ae.dispatch)(we).setStatus("success");
                            const e = {
                                ...d,
                                licenseKey: u.current.value,
                                isLicenseActive: !0,
                                token: t.data.token,
                                autoUpdate: !0
                            };
                            await ge("auth", e), (0, ae.dispatch)(we).updateAuth(e), setTimeout((() => (0, ae.dispatch)(we).setStatus("idle")), 3e3), P.success((0, oe.__)("Successfully activated.", "nectar-blocks"))
                        } else ve.info("Failed authorizing."), (0, ae.dispatch)(we).setStatus("failed"), P.error((0, oe.__)("Unsuccessfully activated.", "nectar-blocks"))
                    }
                }), (0, e.createElement)(de, {
                    text: (0, oe.__)("Deregister", "nectar-blocks"),
                    variant: "secondary",
                    disabled: !i,
                    onClick: async () => {
                        if ((0, ae.dispatch)(we).setStatus("busy"), !u?.current) return;
                        const e = Be(), t = await (async (e, t) => {
                            const n = await fetch(`${he}/license/deregister`, {
                                method: "POST",
                                headers: {Accept: "application.json", "Content-Type": "application/json"},
                                body: JSON.stringify({token: e, hostname: window.location.hostname, analytics: t})
                            });
                            return await n.json()
                        })(s, e);
                        "success" === t.status ? ((0, ae.dispatch)(we).setStatus("success"), P.success((0, oe.__)("Successfully deactivated.", "nectar-blocks"))) : (ve.info("Failed de-authorizing."), (0, ae.dispatch)(we).setStatus("failed"), P.error((0, oe.__)("Unsuccessfully deactivated.", "nectar-blocks")));
                        const n = {...d, licenseKey: "", isLicenseActive: !1, token: "", autoUpdate: !1};
                        await ge("auth", n), (0, ae.dispatch)(we).updateAuth(n), setTimeout((() => (0, ae.dispatch)(we).setStatus("idle")), 3e3)
                    }
                }), (0, e.createElement)("span", {className: "nectar-form__text__license-status"}, i && (0, e.createElement)(He, {
                    "data-tip": (0, oe.__)("Active License", "nectar-blocks"),
                    className: "active"
                }), !i && (0, e.createElement)(Ve, {
                    "data-tip": (0, oe.__)("Invalid License", "nectar-blocks"),
                    className: "inactive"
                }))))
            }, We = () => {
                const {isInitialized: t, auth: n} = (0, ae.useSelect)((e => {
                    const t = e(we).isInitialized(), {auth: n} = e(we).getOptions();
                    return {isInitialized: t, auth: n}
                }), []);
                return t ? (0, e.createElement)(e.Fragment, null, (0, e.createElement)("form", {className: "nectar-form"}, (0, e.createElement)(Ge, {
                    title: (0, oe.__)("Theme License Code", "nectar-blocks"),
                    description: (0, e.createElement)(e.Fragment, null, (0, oe.__)("Enter your Nectarblocks"), " ", " ", (0, e.createElement)("a", {
                        href: "https://app.nectarblocks.com/",
                        target: "_blank",
                        rel: "noreferrer"
                    }, (0, oe.__)("license key", "nectar-blocks")), " ", (0, oe.__)("to enable the full feature set and updates.", "nectar-blocks")),
                    id: "licenseKey",
                    placeholder: "e.g. cd53a515-9d4c-1a6f-b26e-2a83f177387f",
                    verifiedPurchase: n.isLicenseActive,
                    keyValue: n.licenseKey,
                    token: n.token,
                    onChange: e => {
                        (0, ae.dispatch)(we).updateAuth({...n, licenseKey: e})
                    }
                }), (0, e.createElement)($e, {
                    id: "automaticUpdates",
                    title: (0, oe.__)("Enable Updates", "nectar-blocks"),
                    description: (0, oe.__)("Allows WordPress to check for Nectarblocks updates automatically. Updates are checked every 4 hours.", "nectar-blocks")
                }, (0, e.createElement)(Ue, {
                    id: "automaticUpdates", disabled: !n.isLicenseActive, onChange: e => {
                        (0, ae.dispatch)(we).updateAuth({...n, autoUpdate: e})
                    }, checked: !!n.isLicenseActive && n.autoUpdate
                })), (0, e.createElement)($e, {
                    id: "checkForUpdates",
                    title: (0, oe.__)("Check for Updates", "nectar-blocks"),
                    description: (0, oe.__)("Force an immediate check of updates for Nectarblocks.", "nectar-blocks")
                }, (0, e.createElement)(de, {
                    disabled: !n.isLicenseActive,
                    variant: "primary",
                    text: (0, oe.__)("Check for Updates", "nectar-blocks"),
                    onClick: async () => {
                        try {
                            "success" === (await (async () => await me()({
                                path: `${pe}/settings/admin-panel/reset-updater-transients`,
                                method: "GET"
                            }))()).status ? ne.success((0, oe.__)("Successfully checked for updates.", "nectar-blocks")) : ne.error((0, oe.__)("Failed to check for updates.", "nectar-blocks"))
                        } catch (e) {
                            ne.error((0, oe.__)("Error attempting to check for updates.", "nectar-blocks"))
                        }
                    }
                })))) : (0, e.createElement)("div", {className: "nectar-admin-panel__tab"}, (0, e.createElement)(Fe, {className: "nectar-admin-panel__tab__loader"}))
            };
        var Ke = n(736);

        function qe(e) {
            return t => !!t.type && t.type.tabsRole === e
        }

        const Ye = qe("Tab"), Ze = qe("TabList"), Qe = qe("TabPanel");

        function Je(t, n) {
            return e.Children.map(t, (t => null === t ? null : function (e) {
                return Ye(e) || Ze(e) || Qe(e)
            }(t) ? n(t) : t.props && t.props.children && "object" == typeof t.props.children ? (0, e.cloneElement)(t, Object.assign({}, t.props, {children: Je(t.props.children, n)})) : t))
        }

        function Xe(t, n) {
            return e.Children.forEach(t, (e => {
                null !== e && (Ye(e) || Qe(e) ? n(e) : e.props && e.props.children && "object" == typeof e.props.children && (Ze(e) && n(e), Xe(e.props.children, n)))
            }))
        }

        function et(e, t, n) {
            let r, a = 0, o = 0, i = !1;
            const c = [];
            return Xe(e[t], (e => {
                Ze(e) && (e.props && e.props.children && "object" == typeof e.props.children && Xe(e.props.children, (e => c.push(e))), i && (r = new Error("Found multiple 'TabList' components inside 'Tabs'. Only one is allowed.")), i = !0), Ye(e) ? (i && -1 !== c.indexOf(e) || (r = new Error("Found a 'Tab' component outside of the 'TabList' component. 'Tab' components have to be inside the 'TabList' component.")), a++) : Qe(e) && o++
            })), r || a === o || (r = new Error(`There should be an equal number of 'Tab' and 'TabPanel' in \`${n}\`. Received ${a} 'Tab' and ${o} 'TabPanel'.`)), r
        }

        function tt(e) {
            var t, n, r = "";
            if ("string" == typeof e || "number" == typeof e) r += e; else if ("object" == typeof e) if (Array.isArray(e)) {
                var a = e.length;
                for (t = 0; t < a; t++) e[t] && (n = tt(e[t])) && (r && (r += " "), r += n)
            } else for (n in e) e[n] && (r && (r += " "), r += n);
            return r
        }

        const nt = function () {
            for (var e, t, n = 0, r = "", a = arguments.length; n < a; n++) (e = arguments[n]) && (t = tt(e)) && (r && (r += " "), r += t);
            return r
        };

        function rt(e) {
            let t = 0;
            return Xe(e, (e => {
                Ye(e) && t++
            })), t
        }

        const at = ["children", "className", "disabledTabClassName", "domRef", "focus", "forceRenderTabPanel", "onSelect", "selectedIndex", "selectedTabClassName", "selectedTabPanelClassName", "environment", "disableUpDownKeys", "disableLeftRightKeys"];

        function ot(e) {
            return e && "getAttribute" in e
        }

        function it(e) {
            return ot(e) && e.getAttribute("data-rttab")
        }

        function ct(e) {
            return ot(e) && "true" === e.getAttribute("aria-disabled")
        }

        let st;
        const lt = {className: "react-tabs", focus: !1}, ut = {children: et}, dt = n => {
            (0, Ke.checkPropTypes)(ut, n, "prop", "UncontrolledTabs");
            let r = (0, e.useRef)([]), a = (0, e.useRef)([]);
            const o = (0, e.useRef)();

            function i(e, t) {
                if (e < 0 || e >= l()) return;
                const {onSelect: r, selectedIndex: a} = n;
                r(e, a, t)
            }

            function c(e) {
                const t = l();
                for (let n = e + 1; n < t; n++) if (!ct(u(n))) return n;
                for (let t = 0; t < e; t++) if (!ct(u(t))) return t;
                return e
            }

            function s(e) {
                let t = e;
                for (; t--;) if (!ct(u(t))) return t;
                for (t = l(); t-- > e;) if (!ct(u(t))) return t;
                return e
            }

            function l() {
                const {children: e} = n;
                return rt(e)
            }

            function u(e) {
                return r.current[`tabs-${e}`]
            }

            function d(e) {
                let t = e.target;
                do {
                    if (f(t)) {
                        if (ct(t)) return;
                        return void i([].slice.call(t.parentNode.children).filter(it).indexOf(t), e)
                    }
                } while (null != (t = t.parentNode))
            }

            function f(e) {
                if (!it(e)) return !1;
                let t = e.parentElement;
                do {
                    if (t === o.current) return !0;
                    if (t.getAttribute("data-rttabs")) break;
                    t = t.parentElement
                } while (t);
                return !1
            }

            const m = Object.assign({}, lt, n), {className: p, domRef: h} = m, g = function (e, t) {
                if (null == e) return {};
                var n = {};
                for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
                    if (t.includes(r)) continue;
                    n[r] = e[r]
                }
                return n
            }(m, at);
            return t().createElement("div", Object.assign({}, g, {
                className: nt(p),
                onClick: d,
                onKeyDown: function (e) {
                    const {direction: t, disableUpDownKeys: r, disableLeftRightKeys: a} = n;
                    if (f(e.target)) {
                        let {selectedIndex: o} = n, f = !1, m = !1;
                        "Space" !== e.code && 32 !== e.keyCode && "Enter" !== e.code && 13 !== e.keyCode || (f = !0, m = !1, d(e)), (a || 37 !== e.keyCode && "ArrowLeft" !== e.code) && (r || 38 !== e.keyCode && "ArrowUp" !== e.code) ? (a || 39 !== e.keyCode && "ArrowRight" !== e.code) && (r || 40 !== e.keyCode && "ArrowDown" !== e.code) ? 35 === e.keyCode || "End" === e.code ? (o = function () {
                            let e = l();
                            for (; e--;) if (!ct(u(e))) return e;
                            return null
                        }(), f = !0, m = !0) : 36 !== e.keyCode && "Home" !== e.code || (o = function () {
                            const e = l();
                            for (let t = 0; t < e; t++) if (!ct(u(t))) return t;
                            return null
                        }(), f = !0, m = !0) : (o = "rtl" === t ? s(o) : c(o), f = !0, m = !0) : (o = "rtl" === t ? c(o) : s(o), f = !0, m = !0), f && e.preventDefault(), m && i(o, e)
                    }
                },
                ref: e => {
                    o.current = e, h && h(e)
                },
                "data-rttabs": !0
            }), function () {
                let o = 0;
                const {
                    children: i,
                    disabledTabClassName: c,
                    focus: s,
                    forceRenderTabPanel: d,
                    selectedIndex: f,
                    selectedTabClassName: m,
                    selectedTabPanelClassName: p,
                    environment: h
                } = n;
                a.current = a.current || [];
                let g = a.current.length - l();
                const v = (0, e.useId)();
                for (; g++ < 0;) a.current.push(`${v}${a.current.length}`);
                return Je(i, (n => {
                    let i = n;
                    if (Ze(n)) {
                        let o = 0, l = !1;
                        null == st && function (e) {
                            const t = e || ("undefined" != typeof window ? window : void 0);
                            try {
                                st = !(void 0 === t || !t.document || !t.document.activeElement)
                            } catch (e) {
                                st = !1
                            }
                        }(h);
                        const d = h || ("undefined" != typeof window ? window : void 0);
                        st && d && (l = t().Children.toArray(n.props.children).filter(Ye).some(((e, t) => d.document.activeElement === u(t)))), i = (0, e.cloneElement)(n, {
                            children: Je(n.props.children, (t => {
                                const n = `tabs-${o}`, i = f === o, u = {
                                    tabRef: e => {
                                        r.current[n] = e
                                    }, id: a.current[o], selected: i, focus: i && (s || l)
                                };
                                return m && (u.selectedClassName = m), c && (u.disabledClassName = c), o++, (0, e.cloneElement)(t, u)
                            }))
                        })
                    } else if (Qe(n)) {
                        const t = {id: a.current[o], selected: f === o};
                        d && (t.forceRender = d), p && (t.selectedClassName = p), o++, i = (0, e.cloneElement)(n, t)
                    }
                    return i
                }))
            }())
        }, ft = ["children", "defaultFocus", "defaultIndex", "focusTabOnClick", "onSelect"], mt = {
            children: et, onSelect: function (e, t, n, r, a) {
                const o = e[t], i = a || t;
                let c = null;
                return o && "function" != typeof o ? c = new Error(`Invalid ${r} \`${i}\` of type \`${typeof o}\` supplied to \`${n}\`, expected \`function\`.`) : null != e.selectedIndex && null == o && (c = new Error(`The ${r} \`${i}\` is marked as required in \`${n}\`, but its value is \`undefined\` or \`null\`.\n\`onSelect\` is required when \`selectedIndex\` is also set. Not doing so will make the tabs not do anything, as \`selectedIndex\` indicates that you want to handle the selected tab yourself.\nIf you only want to set the inital tab replace \`selectedIndex\` with \`defaultIndex\`.`)), c
            }, selectedIndex: function (e, t, n, r, a) {
                const o = e[t], i = a || t;
                let c = null;
                if (null != o && "number" != typeof o) c = new Error(`Invalid ${r} \`${i}\` of type \`${typeof o}\` supplied to \`${n}\`, expected \`number\`.`); else if (null != e.defaultIndex && null != o) return new Error(`The ${r} \`${i}\` cannot be used together with \`defaultIndex\` in \`${n}\`.\nEither remove \`${i}\` to let \`${n}\` handle the selected tab internally or remove \`defaultIndex\` to handle it yourself.`);
                return c
            }
        }, pt = {
            defaultFocus: !1,
            focusTabOnClick: !0,
            forceRenderTabPanel: !1,
            selectedIndex: null,
            defaultIndex: null,
            environment: null,
            disableUpDownKeys: !1,
            disableLeftRightKeys: !1
        }, ht = n => {
            (0, Ke.checkPropTypes)(mt, n, "prop", "Tabs");
            const r = Object.assign({}, pt, n), {
                children: a,
                defaultFocus: o,
                defaultIndex: i,
                focusTabOnClick: c,
                onSelect: s
            } = r, l = function (e, t) {
                if (null == e) return {};
                var n = {};
                for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
                    if (t.includes(r)) continue;
                    n[r] = e[r]
                }
                return n
            }(r, ft), [u, d] = (0, e.useState)(o), [f] = (0, e.useState)((e => null === e.selectedIndex ? 1 : 0)(l)), [m, p] = (0, e.useState)(1 === f ? i || 0 : null);
            if ((0, e.useEffect)((() => {
                d(!1)
            }), []), 1 === f) {
                const t = rt(a);
                (0, e.useEffect)((() => {
                    if (null != m) {
                        const e = Math.max(0, t - 1);
                        p(Math.min(m, e))
                    }
                }), [t])
            }
            let h = Object.assign({}, n, l);
            return h.focus = u, h.onSelect = (e, t, n) => {
                "function" == typeof s && !1 === s(e, t, n) || (c && d(!0), 1 === f && p(e))
            }, null != m && (h.selectedIndex = m), delete h.defaultFocus, delete h.defaultIndex, delete h.focusTabOnClick, t().createElement(dt, h, a)
        };
        ht.tabsRole = "Tabs";
        const gt = ht, vt = ["children", "className"], bt = {className: "react-tabs__tab-list"}, yt = e => {
            const n = Object.assign({}, bt, e), {children: r, className: a} = n, o = function (e, t) {
                if (null == e) return {};
                var n = {};
                for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
                    if (t.includes(r)) continue;
                    n[r] = e[r]
                }
                return n
            }(n, vt);
            return t().createElement("ul", Object.assign({}, o, {className: nt(a), role: "tablist"}), r)
        };
        yt.tabsRole = "TabList";
        const Et = yt,
            _t = ["children", "className", "disabled", "disabledClassName", "focus", "id", "selected", "selectedClassName", "tabIndex", "tabRef"],
            wt = "react-tabs__tab", kt = {
                className: wt,
                disabledClassName: `${wt}--disabled`,
                focus: !1,
                id: null,
                selected: !1,
                selectedClassName: `${wt}--selected`
            }, St = n => {
                let r = (0, e.useRef)();
                const a = Object.assign({}, kt, n), {
                    children: o,
                    className: i,
                    disabled: c,
                    disabledClassName: s,
                    focus: l,
                    id: u,
                    selected: d,
                    selectedClassName: f,
                    tabIndex: m,
                    tabRef: p
                } = a, h = function (e, t) {
                    if (null == e) return {};
                    var n = {};
                    for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
                        if (t.includes(r)) continue;
                        n[r] = e[r]
                    }
                    return n
                }(a, _t);
                return (0, e.useEffect)((() => {
                    d && l && r.current.focus()
                }), [d, l]), t().createElement("li", Object.assign({}, h, {
                    className: nt(i, {[f]: d, [s]: c}),
                    ref: e => {
                        r.current = e, p && p(e)
                    },
                    role: "tab",
                    id: `tab${u}`,
                    "aria-selected": d ? "true" : "false",
                    "aria-disabled": c ? "true" : "false",
                    "aria-controls": `panel${u}`,
                    tabIndex: m || (d ? "0" : null),
                    "data-rttab": !0
                }), o)
            };
        St.tabsRole = "Tab";
        const Ot = St, Ct = ["children", "className", "forceRender", "id", "selected", "selectedClassName"],
            Nt = "react-tabs__tab-panel", Tt = {className: Nt, forceRender: !1, selectedClassName: `${Nt}--selected`},
            xt = e => {
                const n = Object.assign({}, Tt, e), {
                    children: r,
                    className: a,
                    forceRender: o,
                    id: i,
                    selected: c,
                    selectedClassName: s
                } = n, l = function (e, t) {
                    if (null == e) return {};
                    var n = {};
                    for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
                        if (t.includes(r)) continue;
                        n[r] = e[r]
                    }
                    return n
                }(n, Ct);
                return t().createElement("div", Object.assign({}, l, {
                    className: nt(a, {[s]: c}),
                    role: "tabpanel",
                    id: `panel${i}`,
                    "aria-labelledby": `tab${i}`
                }), o || c ? r : null)
            };
        xt.tabsRole = "TabPanel";
        const It = xt;

        function Pt(e, t, n) {
            return t in e ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : e[t] = n, e
        }

        function At(e, t) {
            var n = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var r = Object.getOwnPropertySymbols(e);
                t && (r = r.filter((function (t) {
                    return Object.getOwnPropertyDescriptor(e, t).enumerable
                }))), n.push.apply(n, r)
            }
            return n
        }

        function Rt(e) {
            for (var t = 1; t < arguments.length; t++) {
                var n = null != arguments[t] ? arguments[t] : {};
                t % 2 ? At(Object(n), !0).forEach((function (t) {
                    Pt(e, t, n[t])
                })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : At(Object(n)).forEach((function (t) {
                    Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t))
                }))
            }
            return e
        }

        function Mt(e, t) {
            (null == t || t > e.length) && (t = e.length);
            for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
            return r
        }

        function zt(e, t, n) {
            return t in e ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : e[t] = n, e
        }

        function Lt(e, t) {
            var n = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var r = Object.getOwnPropertySymbols(e);
                t && (r = r.filter((function (t) {
                    return Object.getOwnPropertyDescriptor(e, t).enumerable
                }))), n.push.apply(n, r)
            }
            return n
        }

        function jt(e) {
            for (var t = 1; t < arguments.length; t++) {
                var n = null != arguments[t] ? arguments[t] : {};
                t % 2 ? Lt(Object(n), !0).forEach((function (t) {
                    zt(e, t, n[t])
                })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Lt(Object(n)).forEach((function (t) {
                    Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t))
                }))
            }
            return e
        }

        function Dt(e) {
            return function t() {
                for (var n = this, r = arguments.length, a = new Array(r), o = 0; o < r; o++) a[o] = arguments[o];
                return a.length >= e.length ? e.apply(this, a) : function () {
                    for (var e = arguments.length, r = new Array(e), o = 0; o < e; o++) r[o] = arguments[o];
                    return t.apply(n, [].concat(a, r))
                }
            }
        }

        function Ft(e) {
            return {}.toString.call(e).includes("Object")
        }

        function $t(e) {
            return "function" == typeof e
        }

        var Ut = Dt((function (e, t) {
            throw new Error(e[t] || e.default)
        }))({
            initialIsRequired: "initial state is required",
            initialType: "initial state should be an object",
            initialContent: "initial state shouldn't be an empty object",
            handlerType: "handler should be an object or a function",
            handlersType: "all handlers should be a functions",
            selectorType: "selector should be a function",
            changeType: "provided value of changes should be an object",
            changeField: 'it seams you want to change a field in the state which is not specified in the "initial" state',
            default: "an unknown error accured in `state-local` package"
        }), Ht = function (e, t) {
            return Ft(t) || Ut("changeType"), Object.keys(t).some((function (t) {
                return n = e, r = t, !Object.prototype.hasOwnProperty.call(n, r);
                var n, r
            })) && Ut("changeField"), t
        }, Vt = function (e) {
            $t(e) || Ut("selectorType")
        }, Bt = function (e) {
            $t(e) || Ft(e) || Ut("handlerType"), Ft(e) && Object.values(e).some((function (e) {
                return !$t(e)
            })) && Ut("handlersType")
        }, Gt = function (e) {
            var t;
            e || Ut("initialIsRequired"), Ft(e) || Ut("initialType"), t = e, Object.keys(t).length || Ut("initialContent")
        };

        function Wt(e, t) {
            return $t(t) ? t(e.current) : t
        }

        function Kt(e, t) {
            return e.current = jt(jt({}, e.current), t), t
        }

        function qt(e, t, n) {
            return $t(t) ? t(e.current) : Object.keys(n).forEach((function (n) {
                var r;
                return null === (r = t[n]) || void 0 === r ? void 0 : r.call(t, e.current[n])
            })), n
        }

        var Yt = {
            create: function (e) {
                var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                Gt(e), Bt(t);
                var n = {current: e}, r = Dt(qt)(n, t), a = Dt(Kt)(n), o = Dt(Ht)(e), i = Dt(Wt)(n);
                return [function () {
                    var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : function (e) {
                        return e
                    };
                    return Vt(e), e(n.current)
                }, function (e) {
                    !function () {
                        for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n];
                        return function (e) {
                            return t.reduceRight((function (e, t) {
                                return t(e)
                            }), e)
                        }
                    }(r, a, o, i)(e)
                }]
            }
        };
        const Zt = Yt;
        var Qt, Jt = {
            configIsRequired: "the configuration object is required",
            configType: "the configuration object should be an object",
            default: "an unknown error accured in `@monaco-editor/loader` package",
            deprecation: "Deprecation warning!\n    You are using deprecated way of configuration.\n\n    Instead of using\n      monaco.config({ urls: { monacoBase: '...' } })\n    use\n      monaco.config({ paths: { vs: '...' } })\n\n    For more please check the link https://github.com/suren-atoyan/monaco-loader#config\n  "
        }, Xt = (Qt = function (e, t) {
            throw new Error(e[t] || e.default)
        }, function e() {
            for (var t = this, n = arguments.length, r = new Array(n), a = 0; a < n; a++) r[a] = arguments[a];
            return r.length >= Qt.length ? Qt.apply(this, r) : function () {
                for (var n = arguments.length, a = new Array(n), o = 0; o < n; o++) a[o] = arguments[o];
                return e.apply(t, [].concat(r, a))
            }
        })(Jt);
        const en = {
            config: function (e) {
                return e || Xt("configIsRequired"), t = e, {}.toString.call(t).includes("Object") || Xt("configType"), e.urls ? (console.warn(Jt.deprecation), {paths: {vs: e.urls.monacoBase}}) : e;
                var t
            }
        }, tn = function e(t, n) {
            return Object.keys(n).forEach((function (r) {
                n[r] instanceof Object && t[r] && Object.assign(n[r], e(t[r], n[r]))
            })), Rt(Rt({}, t), n)
        };
        var nn = {type: "cancelation", msg: "operation is manually canceled"};
        const rn = function (e) {
            var t = !1, n = new Promise((function (n, r) {
                e.then((function (e) {
                    return t ? r(nn) : n(e)
                })), e.catch(r)
            }));
            return n.cancel = function () {
                return t = !0
            }, n
        };
        var an, on = function (e) {
            if (Array.isArray(e)) return e
        }(an = Zt.create({
            config: {paths: {vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs"}},
            isInitialized: !1,
            resolve: null,
            reject: null,
            monaco: null
        })) || function (e, t) {
            if ("undefined" != typeof Symbol && Symbol.iterator in Object(e)) {
                var n = [], _n = !0, r = !1, a = void 0;
                try {
                    for (var o, i = e[Symbol.iterator](); !(_n = (o = i.next()).done) && (n.push(o.value), 2 !== n.length); _n = !0) ;
                } catch (e) {
                    r = !0, a = e
                } finally {
                    try {
                        _n || null == i.return || i.return()
                    } finally {
                        if (r) throw a
                    }
                }
                return n
            }
        }(an) || function (e, t) {
            if (e) {
                if ("string" == typeof e) return Mt(e, 2);
                var n = Object.prototype.toString.call(e).slice(8, -1);
                return "Object" === n && e.constructor && (n = e.constructor.name), "Map" === n || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Mt(e, 2) : void 0
            }
        }(an) || function () {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }(), cn = on[0], sn = on[1];

        function ln(e) {
            return document.body.appendChild(e)
        }

        function un(e) {
            var t, n, r = cn((function (e) {
                    return {config: e.config, reject: e.reject}
                })),
                a = (t = "".concat(r.config.paths.vs, "/loader.js"), n = document.createElement("script"), t && (n.src = t), n);
            return a.onload = function () {
                return e()
            }, a.onerror = r.reject, a
        }

        function dn() {
            var e = cn((function (e) {
                return {config: e.config, resolve: e.resolve, reject: e.reject}
            })), t = window.require;
            t.config(e.config), t(["vs/editor/editor.main"], (function (t) {
                fn(t), e.resolve(t)
            }), (function (t) {
                e.reject(t)
            }))
        }

        function fn(e) {
            cn().monaco || sn({monaco: e})
        }

        var mn = new Promise((function (e, t) {
            return sn({resolve: e, reject: t})
        })), pn = {
            config: function (e) {
                var t = en.config(e), n = t.monaco, r = function (e, t) {
                    if (null == e) return {};
                    var n, r, a = function (e, t) {
                        if (null == e) return {};
                        var n, r, a = {}, o = Object.keys(e);
                        for (r = 0; r < o.length; r++) n = o[r], t.indexOf(n) >= 0 || (a[n] = e[n]);
                        return a
                    }(e, t);
                    if (Object.getOwnPropertySymbols) {
                        var o = Object.getOwnPropertySymbols(e);
                        for (r = 0; r < o.length; r++) n = o[r], t.indexOf(n) >= 0 || Object.prototype.propertyIsEnumerable.call(e, n) && (a[n] = e[n])
                    }
                    return a
                }(t, ["monaco"]);
                sn((function (e) {
                    return {config: tn(e.config, r), monaco: n}
                }))
            }, init: function () {
                var e = cn((function (e) {
                    return {monaco: e.monaco, isInitialized: e.isInitialized, resolve: e.resolve}
                }));
                if (!e.isInitialized) {
                    if (sn({isInitialized: !0}), e.monaco) return e.resolve(e.monaco), rn(mn);
                    if (window.monaco && window.monaco.editor) return fn(window.monaco), e.resolve(window.monaco), rn(mn);
                    !function () {
                        for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n];
                        return function (e) {
                            return t.reduceRight((function (e, t) {
                                return t(e)
                            }), e)
                        }
                    }(ln, un)(dn)
                }
                return rn(mn)
            }, __getMonacoInstance: function () {
                return cn((function (e) {
                    return e.monaco
                }))
            }
        };
        const hn = pn;
        var gn = {display: "flex", position: "relative", textAlign: "initial"}, vn = {width: "100%"},
            bn = {display: "none"}, yn = {
                container: {
                    display: "flex",
                    height: "100%",
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center"
                }
            }, En = function ({children: t}) {
                return e.createElement("div", {style: yn.container}, t)
            }, wn = (0, e.memo)((function ({
                                               width: t,
                                               height: n,
                                               isEditorReady: r,
                                               loading: a,
                                               _ref: o,
                                               className: i,
                                               wrapperProps: c
                                           }) {
                return e.createElement("section", {
                    style: {
                        ...gn,
                        width: t,
                        height: n
                    }, ...c
                }, !r && e.createElement(En, null, a), e.createElement("div", {
                    ref: o,
                    style: {...vn, ...!r && bn},
                    className: i
                }))
            })), kn = function (t) {
                (0, e.useEffect)(t, [])
            }, Sn = function (t, n, r = !0) {
                let a = (0, e.useRef)(!0);
                (0, e.useEffect)(a.current || !r ? () => {
                    a.current = !1
                } : t, n)
            };

        function On() {
        }

        function Cn(e, t, n, r) {
            return function (e, t) {
                return e.editor.getModel(Nn(e, t))
            }(e, r) || function (e, t, n, r) {
                return e.editor.createModel(t, n, r ? Nn(e, r) : void 0)
            }(e, t, n, r)
        }

        function Nn(e, t) {
            return e.Uri.parse(t)
        }

        (0, e.memo)((function ({
                                   original: t,
                                   modified: n,
                                   language: r,
                                   originalLanguage: a,
                                   modifiedLanguage: o,
                                   originalModelPath: i,
                                   modifiedModelPath: c,
                                   keepCurrentOriginalModel: s = !1,
                                   keepCurrentModifiedModel: l = !1,
                                   theme: u = "light",
                                   loading: d = "Loading...",
                                   options: f = {},
                                   height: m = "100%",
                                   width: p = "100%",
                                   className: h,
                                   wrapperProps: g = {},
                                   beforeMount: v = On,
                                   onMount: b = On
                               }) {
            let [y, E] = (0, e.useState)(!1), [_, w] = (0, e.useState)(!0), k = (0, e.useRef)(null),
                S = (0, e.useRef)(null), O = (0, e.useRef)(null), C = (0, e.useRef)(b), N = (0, e.useRef)(v),
                T = (0, e.useRef)(!1);
            kn((() => {
                let e = hn.init();
                return e.then((e => (S.current = e) && w(!1))).catch((e => "cancelation" !== e?.type && console.error("Monaco initialization: error:", e))), () => k.current ? function () {
                    let e = k.current?.getModel();
                    s || e?.original?.dispose(), l || e?.modified?.dispose(), k.current?.dispose()
                }() : e.cancel()
            })), Sn((() => {
                if (k.current && S.current) {
                    let e = k.current.getOriginalEditor(), n = Cn(S.current, t || "", a || r || "text", i || "");
                    n !== e.getModel() && e.setModel(n)
                }
            }), [i], y), Sn((() => {
                if (k.current && S.current) {
                    let e = k.current.getModifiedEditor(), t = Cn(S.current, n || "", o || r || "text", c || "");
                    t !== e.getModel() && e.setModel(t)
                }
            }), [c], y), Sn((() => {
                let e = k.current.getModifiedEditor();
                e.getOption(S.current.editor.EditorOption.readOnly) ? e.setValue(n || "") : n !== e.getValue() && (e.executeEdits("", [{
                    range: e.getModel().getFullModelRange(),
                    text: n || "",
                    forceMoveMarkers: !0
                }]), e.pushUndoStop())
            }), [n], y), Sn((() => {
                k.current?.getModel()?.original.setValue(t || "")
            }), [t], y), Sn((() => {
                let {original: e, modified: t} = k.current.getModel();
                S.current.editor.setModelLanguage(e, a || r || "text"), S.current.editor.setModelLanguage(t, o || r || "text")
            }), [r, a, o], y), Sn((() => {
                S.current?.editor.setTheme(u)
            }), [u], y), Sn((() => {
                k.current?.updateOptions(f)
            }), [f], y);
            let x = (0, e.useCallback)((() => {
                if (!S.current) return;
                N.current(S.current);
                let e = Cn(S.current, t || "", a || r || "text", i || ""),
                    s = Cn(S.current, n || "", o || r || "text", c || "");
                k.current?.setModel({original: e, modified: s})
            }), [r, n, o, t, a, i, c]), I = (0, e.useCallback)((() => {
                !T.current && O.current && (k.current = S.current.editor.createDiffEditor(O.current, {automaticLayout: !0, ...f}), x(), S.current?.editor.setTheme(u), E(!0), T.current = !0)
            }), [f, u, x]);
            return (0, e.useEffect)((() => {
                y && C.current(k.current, S.current)
            }), [y]), (0, e.useEffect)((() => {
                !_ && !y && I()
            }), [_, y, I]), e.createElement(wn, {
                width: p,
                height: m,
                isEditorReady: y,
                loading: d,
                _ref: O,
                className: h,
                wrapperProps: g
            })
        }));
        var Tn = new Map, xn = (0, e.memo)((function ({
                                                          defaultValue: t,
                                                          defaultLanguage: n,
                                                          defaultPath: r,
                                                          value: a,
                                                          language: o,
                                                          path: i,
                                                          theme: c = "light",
                                                          line: s,
                                                          loading: l = "Loading...",
                                                          options: u = {},
                                                          overrideServices: d = {},
                                                          saveViewState: f = !0,
                                                          keepCurrentModel: m = !1,
                                                          width: p = "100%",
                                                          height: h = "100%",
                                                          className: g,
                                                          wrapperProps: v = {},
                                                          beforeMount: b = On,
                                                          onMount: y = On,
                                                          onChange: E,
                                                          onValidate: _ = On
                                                      }) {
            let [w, k] = (0, e.useState)(!1), [S, O] = (0, e.useState)(!0), C = (0, e.useRef)(null),
                N = (0, e.useRef)(null), T = (0, e.useRef)(null), x = (0, e.useRef)(y), I = (0, e.useRef)(b),
                P = (0, e.useRef)(), A = (0, e.useRef)(a), R = function (t) {
                    let n = (0, e.useRef)();
                    return (0, e.useEffect)((() => {
                        n.current = t
                    }), [t]), n.current
                }(i), M = (0, e.useRef)(!1), z = (0, e.useRef)(!1);
            kn((() => {
                let e = hn.init();
                return e.then((e => (C.current = e) && O(!1))).catch((e => "cancelation" !== e?.type && console.error("Monaco initialization: error:", e))), () => N.current ? (P.current?.dispose(), m ? f && Tn.set(i, N.current.saveViewState()) : N.current.getModel()?.dispose(), void N.current.dispose()) : e.cancel()
            })), Sn((() => {
                let e = Cn(C.current, t || a || "", n || o || "", i || r || "");
                e !== N.current?.getModel() && (f && Tn.set(R, N.current?.saveViewState()), N.current?.setModel(e), f && N.current?.restoreViewState(Tn.get(i)))
            }), [i], w), Sn((() => {
                N.current?.updateOptions(u)
            }), [u], w), Sn((() => {
                !N.current || void 0 === a || (N.current.getOption(C.current.editor.EditorOption.readOnly) ? N.current.setValue(a) : a !== N.current.getValue() && (z.current = !0, N.current.executeEdits("", [{
                    range: N.current.getModel().getFullModelRange(),
                    text: a,
                    forceMoveMarkers: !0
                }]), N.current.pushUndoStop(), z.current = !1))
            }), [a], w), Sn((() => {
                let e = N.current?.getModel();
                e && o && C.current?.editor.setModelLanguage(e, o)
            }), [o], w), Sn((() => {
                void 0 !== s && N.current?.revealLine(s)
            }), [s], w), Sn((() => {
                C.current?.editor.setTheme(c)
            }), [c], w);
            let L = (0, e.useCallback)((() => {
                if (T.current && C.current && !M.current) {
                    I.current(C.current);
                    let e = i || r, l = Cn(C.current, a || t || "", n || o || "", e || "");
                    N.current = C.current?.editor.create(T.current, {
                        model: l,
                        automaticLayout: !0, ...u
                    }, d), f && N.current.restoreViewState(Tn.get(e)), C.current.editor.setTheme(c), void 0 !== s && N.current.revealLine(s), k(!0), M.current = !0
                }
            }), [t, n, r, a, o, i, u, d, f, c, s]);
            return (0, e.useEffect)((() => {
                w && x.current(N.current, C.current)
            }), [w]), (0, e.useEffect)((() => {
                !S && !w && L()
            }), [S, w, L]), A.current = a, (0, e.useEffect)((() => {
                w && E && (P.current?.dispose(), P.current = N.current?.onDidChangeModelContent((e => {
                    z.current || E(N.current.getValue(), e)
                })))
            }), [w, E]), (0, e.useEffect)((() => {
                if (w) {
                    let e = C.current.editor.onDidChangeMarkers((e => {
                        let t = N.current.getModel()?.uri;
                        if (t && e.find((e => e.path === t.path))) {
                            let e = C.current.editor.getModelMarkers({resource: t});
                            _?.(e)
                        }
                    }));
                    return () => {
                        e?.dispose()
                    }
                }
                return () => {
                }
            }), [w, _]), e.createElement(wn, {
                width: p,
                height: h,
                isEditorReady: w,
                loading: l,
                _ref: T,
                className: g,
                wrapperProps: v
            })
        }));
        const In = () => {
            const {
                isInitialized: t,
                code: {cssCode: n, jsCodeHead: r, jsCodeBody: a}
            } = (0, ae.useSelect)((e => ({isInitialized: e(we).isInitialized(), code: e(we).getOptions().code})), []);
            return t ? (0, e.createElement)(e.Fragment, null, (0, e.createElement)(gt, {defaultIndex: 0}, (0, e.createElement)(Et, null, (0, e.createElement)(Ot, null, (0, oe.__)("CSS", "nectar-blocks")), (0, e.createElement)(Ot, null, (0, oe.__)("Custom JS/HTML", "nectar-blocks"))), (0, e.createElement)(It, null, (0, e.createElement)(e.Fragment, null, (0, e.createElement)("h3", {className: "nectar-admin-panel__tab__content__title"}, (0, oe.__)("Custom CSS", "nectar-blocks")), (0, e.createElement)(xn, {
                height: "70vh",
                defaultLanguage: "css",
                defaultValue: n,
                theme: "vs-dark",
                className: "css-editor",
                onChange: e => {
                    (0, ae.dispatch)(we).updateCode({cssCode: null != e ? e : "", jsCodeHead: r, jsCodeBody: a})
                }
            }))), (0, e.createElement)(It, null, (0, e.createElement)("h3", {className: "nectar-admin-panel__tab__content__subtitle"}, (0, oe.__)("Custom Code (JS/HTML) in Head", "nectar-blocks")), (0, e.createElement)("p", {className: "nectar-admin-panel__tab__content__description"}, (0, oe.__)("If using JS, ensure to include script tags.", "nectar-blocks")), (0, e.createElement)(xn, {
                height: "40vh",
                defaultLanguage: "html",
                defaultValue: r,
                theme: "vs-dark",
                onChange: e => {
                    (0, ae.dispatch)(we).updateCode({cssCode: n, jsCodeHead: null != e ? e : "", jsCodeBody: a})
                }
            }), (0, e.createElement)("h3", {className: "nectar-admin-panel__tab__content__subtitle"}, (0, oe.__)("Custom Code (JS/HTML) After Body Open", "nectar-blocks")), (0, e.createElement)("p", {className: "nectar-admin-panel__tab__content__description"}, (0, oe.__)("If using JS, ensure to include script tags.", "nectar-blocks")), (0, e.createElement)(xn, {
                height: "40vh",
                defaultLanguage: "html",
                defaultValue: a,
                theme: "vs-dark",
                onChange: e => {
                    (0, ae.dispatch)(we).updateCode({cssCode: n, jsCodeHead: r, jsCodeBody: null != e ? e : ""})
                }
            })))) : (0, e.createElement)("div", {className: "nectar-admin-panel__tab"}, (0, e.createElement)(Fe, {className: "nectar-admin-panel__tab__loader"}))
        }, Pn = async () => {
            try {
                return await me()({path: `${pe}/settings/custom_fonts`})
            } catch (e) {
                ve.warn(e)
            }
            return []
        }, An = {blocksCSS: {}, nectarInlineCSS: ""}, Rn = {
            reducer: (e = An, t) => {
                switch (t.type) {
                    case"SET_BLOCK": {
                        if (t.data.blockId.startsWith("template")) return e;
                        const n = structuredClone(e.blocksCSS);
                        return n[t.data.blockId] = t.data.css, {...e, blocksCSS: n}
                    }
                    case"UPDATE_NECTAR_INLINE_CSS":
                        return (e => {
                            var t;
                            const n = null !== (t = window.nectarblocks_env.EDITOR_DOM) && void 0 !== t ? t : document;
                            let r = n.querySelector("#nectar-front-end-render-inline-css");
                            r || n.parentElement && (r = n.parentElement.querySelector("#nectar-front-end-render-inline-css")), r && e && (ve.debug("Injecting global styles CSS."), r.innerHTML = e)
                        })(t.data.cssString), {...e, nectarInlineCSS: t.data.cssString}
                }
                return e
            },
            actions: {
                setBlockCSS: (e, t) => ({type: "SET_BLOCK", data: {blockId: e, css: t}}),
                updateNectarInlineCSS: function* () {
                    return {type: "UPDATE_NECTAR_INLINE_CSS", data: {cssString: yield{type: "FETCH_NECTAR_INLINE_CSS"}}}
                }
            },
            selectors: {
                getBlockCSS(e, t) {
                    if (t in e.blocksCSS) return e.blocksCSS[t]
                }, getNectarInlineCSS: e => e.nectarInlineCSS
            },
            controls: {FETCH_NECTAR_INLINE_CSS: async () => await (async () => await me()({path: `${pe}/meta/css/get_global_settings_css_rules`}))()}
        }, Mn = (0, ae.createReduxStore)("nectar/editor-css-store", Rn);
        (0, ae.register)(Mn);
        const zn = (0, oe.__)("Unknown Color", "nectar-blocks"), Ln = {
            defaultColors: [],
            initialized: !1,
            coreSolids: [],
            userSolids: [],
            coreGradients: [],
            userGradients: [],
            reassignments: {}
        }, jn = {
            initialize: e => ({type: "INITIALIZE", data: e}),
            updateColors: e => ({type: "UPDATE_COLORS", data: e})
        }, Dn = {
            getColors: e => e, getColorBySlug(e, t, n) {
                if (!e.initialized) return ve.debug("Color store not initialized"), {
                    slug: "nectar-gc-unknown",
                    label: zn,
                    value: "#ffffff"
                };
                let r;
                if ("solid" === n) {
                    if (r = e.coreSolids.find((e => e.slug === t)), void 0 !== r) return r;
                    if (r = e.userSolids.find((e => e.slug === t)), void 0 !== r) return r;
                    if (t in e.reassignments) {
                        const n = e.reassignments[t];
                        if (r = e.coreSolids.find((e => e.slug === n.slug)), void 0 !== r) return r
                    }
                } else {
                    if (r = e.coreGradients.find((e => e.slug === t)), void 0 !== r) return r;
                    if (r = e.userGradients.find((e => e.slug === t)), void 0 !== r) return r;
                    if (t in e.reassignments) {
                        const n = e.reassignments[t];
                        if (r = e.coreGradients.find((e => e.slug === n.slug)), void 0 !== r) return r
                    }
                }
                return void 0 === r && (ve.error({colorSlug: t}, "Unable to find reassigned color slug in color store."), r = {
                    slug: "nectar-gc-unknown",
                    label: zn,
                    value: "#ffffff"
                }), r
            }
        }, Fn = {
            async getColors() {
                const e = await me()({path: `${pe}/settings/colors`});
                return jn.initialize({...e})
            }
        }, $n = e => {
            const t = e.userSolids.filter((e => void 0 === e.reassigned)),
                n = e.userGradients.filter((e => void 0 === e.reassigned)),
                r = {...Un(e.userSolids, "solid"), ...Un(e.userGradients, "gradient")};
            return {
                initialized: !0,
                coreSolids: e.coreSolids,
                coreGradients: e.coreGradients,
                userSolids: t,
                userGradients: n,
                reassignments: r
            }
        }, Un = (e, t) => {
            const n = e.filter((e => void 0 !== e.reassigned)), r = {};
            return n.forEach((e => r[e.slug] = {slug: e.reassigned, type: t})), r
        }, Hn = {
            reducer: (e = Ln, t) => {
                switch (t.type) {
                    case"UPDATE_COLORS": {
                        const n = $n(t.data);
                        return (0, ae.dispatch)(Mn).updateNectarInlineCSS(), {...e, ...n}
                    }
                    case"INITIALIZE": {
                        const n = $n(t.data);
                        return ve.debug("Color store initialized."), {...e, ...n}
                    }
                }
                return e
            }, actions: jn, selectors: Dn, resolvers: Fn
        }, Vn = (0, ae.createReduxStore)("nectar/global-colors", Hn);
        (0, ae.register)(Vn);
        const Bn = {customFonts: []}, Gn = {
            initialize: e => ({type: "INITIALIZE", data: e}),
            updateCustomFonts: e => ({type: "UPDATE_CUSTOM_FONTS", data: e})
        }, Wn = {
            async getCustomFonts() {
                const e = await Pn();
                return Gn.initialize({customFonts: e})
            }
        }, Kn = (0, ae.createReduxStore)("nectar/custom-fonts", {
            reducer: (e = Bn, t) => {
                switch (t.type) {
                    case"UPDATE_CUSTOM_FONTS":
                        return {...e, customFonts: t.data};
                    case"INITIALIZE":
                        return {...e, ...t.data}
                }
                return e
            }, actions: Gn, selectors: {getCustomFonts: e => e.customFonts}, resolvers: Wn
        });
        (0, ae.register)(Kn);
        const qn = {remixIcons: {}, lucideIcons: {}, simpleIcons: {}},
            Yn = {initialize: e => ({type: "INITIALIZE", data: e})}, Zn = {
                async getRemixIcons() {
                    const e = await me()({path: `${pe}/assets/icons/remix`});
                    return Yn.initialize({remixIcons: e})
                }, async getLucideIcons() {
                    const e = await me()({path: `${pe}/assets/icons/lucide`});
                    return Yn.initialize({lucideIcons: e})
                }, async getSimpleIconsIcons() {
                    const e = await me()({path: `${pe}/assets/icons/simple-icons`});
                    return Yn.initialize({simpleIcons: e})
                }
            }, Qn = (0, ae.createReduxStore)("nectar/icons", {
                reducer: (e = qn, t) => "INITIALIZE" === t.type ? {...e, ...t.data} : e,
                actions: Yn,
                selectors: {
                    getRemixIcons: e => e.remixIcons,
                    getLucideIcons: e => e.lucideIcons,
                    getSimpleIconsIcons: e => e.simpleIcons
                },
                resolvers: Zn
            });
        (0, ae.register)(Qn);
        const Jn = {currentDeviceType: "Desktop", isHoverEnabled: !1},
            Xn = (0, ae.createReduxStore)("nectar/responsive", {
                reducer: (e = Jn, t) => {
                    switch (t.type) {
                        case"UPDATE_DEVICE_TYPE":
                            return {...e, currentDeviceType: t.data.currentDeviceType};
                        case"UPDATE_ON_HOVER":
                            return {...e, isHoverEnabled: t.data.isHoverEnabled}
                    }
                    return e
                },
                actions: {
                    setDeviceType: e => ({type: "UPDATE_DEVICE_TYPE", data: {currentDeviceType: e}}),
                    setOnHover: e => ({type: "UPDATE_ON_HOVER", data: {isHoverEnabled: e}})
                },
                selectors: {getDeviceType: e => e.currentDeviceType, getIsOnHover: e => e.isHoverEnabled}
            });
        (0, ae.register)(Xn);
        const er = {isOpened: !1, selectedCategory: "all", searchQuery: "", pageNumber: 0}, tr = {
            reducer: (e = er, t) => {
                switch (t.type) {
                    case"INITIALIZE":
                    case"UPDATE_STATE":
                        return {...e, ...t.data}
                }
                return e
            },
            actions: {
                initialize: e => ({type: "INITIALIZE", data: e}),
                updateState: e => ({type: "UPDATE_STATE", data: e})
            },
            selectors: {getState: e => e}
        }, nr = (0, ae.createReduxStore)("nectar/template-library", tr);
        (0, ae.register)(nr);
        const rr = (e, t) => e.length - 1 === t, ar = (e, t) => rr(e, t) ? t + 1 : t - 1, or = (e, t) => e[ar(e, t)],
            ir = (0, ae.createReduxStore)("nectar-blocks/block-tree-context", {
                reducer: (e = {}, t) => {
                    if ("SET_BLOCK_TREE" === t.type) {
                        const e = {};
                        return t.blockTree.forEach((t => {
                            const {clientId: n, innerBlocks: r, name: a} = t;
                            e[n] = {innerBlocks: r, hasInnerBlocks: r.length > 0, rootBlockClientId: n, parentTree: []};
                            const o = [{clientId: n, name: a}], i = (n, r) => {
                                n.forEach(((a, c) => {
                                    if (!e[a.clientId]) {
                                        const i = {
                                            index: c,
                                            isFirstBlock: 0 === c,
                                            isLastBlock: rr(n, c),
                                            isOnlyBlock: 1 === n.length,
                                            adjacentBlock: or(n, c),
                                            adjacentBlockIndex: ar(n, c),
                                            adjacentBlocks: n || [],
                                            hasInnerBlocks: a.innerBlocks.length > 0,
                                            innerBlocks: a.innerBlocks,
                                            rootBlockClientId: t.clientId,
                                            parentBlock: r,
                                            parentBlockId: r.clientId,
                                            parentTree: JSON.parse(JSON.stringify(o))
                                        };
                                        e[a.clientId] = i
                                    }
                                    o.push({clientId: a.clientId, name: a.name}), i(a.innerBlocks, a), o.pop()
                                }))
                            };
                            i(r, t)
                        })), {...e}
                    }
                    return e
                },
                actions: {setBlockTree: e => ({type: "SET_BLOCK_TREE", blockTree: e})},
                selectors: {getBlockTreeContext: (e, t) => e[t] || {}, getFullBlockTreeContext: e => e}
            });
        (0, ae.register)(ir);
        const cr = window.lodash;
        var sr = n.n(cr);
        const lr = {
            coreTypography: {},
            userTypography: {},
            googleFonts: {items: []},
            googleFontsCSSList: [],
            shouldLoadAllGoogleFonts: !1
        }, ur = {
            initialize: e => ({type: "INITIALIZE", data: e}),
            updateTypography: e => ({type: "UPDATE_TYPOGRAPHY", data: e}),
            updateGoogleFontsCSSList: e => ({type: "UPDATE_GOOGLE_FONTS_CSS_LIST", data: e}),
            updateShouldLoadAllGoogleFonts: e => ({type: "UPDATE_SHOULD_LOAD_ALL_GOOGLE_FONTS", data: e})
        }, dr = {
            getGlobalTypography: e => e, getGoogleFonts: e => e.googleFonts, getGoogleFontsCSSList(e) {
                const t = [...Object.values(e.coreTypography), ...Object.values(e.userTypography)].filter((e => "Google" === e.fontSource)).map((e => ({
                    family: e.fontFamily,
                    weights: "100,300,400,500,600,700,800,900,italic,500italic,600italic,700italic,800italic,900italic"
                }))).filter((e => e));
                return 0 === e.googleFontsCSSList.length ? sr().uniqWith(t, sr().isEqual) || [] : sr().uniqWith([...e.googleFontsCSSList, ...t], sr().isEqual)
            }, getShouldLoadAllGoogleFonts: e => e.shouldLoadAllGoogleFonts
        }, fr = {
            async getGlobalTypography() {
                const e = await me()({path: `${pe}/settings/typography`});
                return ur.initialize({...e})
            }, async getGoogleFonts() {
                const e = await me()({path: `${pe}/settings/typography/google_fonts`});
                return ur.initialize({googleFonts: e})
            }
        }, mr = (0, ae.createReduxStore)("nectar/global-typography", {
            reducer: (e = lr, t) => {
                switch (t.type) {
                    case"UPDATE_TYPOGRAPHY":
                        return (0, ae.dispatch)(Mn).updateNectarInlineCSS(), {...e, ...t.data};
                    case"INITIALIZE":
                        return {...e, ...t.data};
                    case"UPDATE_SHOULD_LOAD_ALL_GOOGLE_FONTS":
                        return {...e, shouldLoadAllGoogleFonts: t.data};
                    case"UPDATE_GOOGLE_FONTS_CSS_LIST":
                        return {
                            ...e,
                            googleFontsCSSList: sr().uniqWith([...e.googleFontsCSSList, t.data], sr().isEqual)
                        }
                }
                return e
            }, actions: ur, selectors: dr, resolvers: fr
        });
        (0, ae.register)(mr);
        const pr = async () => {
                const e = await Pn();
                (0, ae.dispatch)(Kn).updateCustomFonts(e)
            }, hr = () => {
                const [t, n] = (0, r.useState)("");
                return (0, e.createElement)(e.Fragment, null, (0, e.createElement)("h3", null, (0, oe.__)("Add a New Font", "nectar-blocks")), (0, e.createElement)("form", {className: "nectar-form nectar-add-font-form"}, (0, e.createElement)("div", {className: ce()("nectar-form__text", "nectar-form__field")}, (0, e.createElement)("input", {
                    type: "text",
                    placeholder: (0, oe.__)("Enter the name of your font..", "nectar-blocks"),
                    value: t,
                    onChange: e => {
                        n(e.target.value)
                    },
                    size: 36,
                    maxLength: 36
                })), (0, e.createElement)(de, {
                    variant: "primary", onClick: async () => {
                        if (!t) return void ne.error((0, oe.__)("Please enter a font name.", "nectar-blocks"));
                        const e = ((e, t = 10) => {
                            let n = "";
                            for (let e = 0; e < t; e++) n += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".charAt(Math.floor(62 * Math.random()));
                            return `${e}-${n}`
                        })("cf"), r = await (async (e, t) => {
                            try {
                                if ("success" === (await me()({
                                    path: `${pe}/settings/custom_fonts/create_font`,
                                    method: "POST",
                                    data: {slug: e, name: t}
                                })).status) return !0
                            } catch (e) {
                                ve.warn(e)
                            }
                            return !1
                        })(e, t);
                        !1 === r ? ne.error((0, oe.__)("Failed to update custom font.", "nectar-blocks")) : (ne.success((0, oe.__)("Successfully updated custom font.", "nectar-blocks")), n(""), await pr())
                    }
                }, (0, oe.__)("Add Font", "nectar-blocks"))))
            }, gr = e.forwardRef((function (t, n) {
                return e.createElement("svg", Object.assign({
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 24 24",
                    "aria-hidden": "true",
                    ref: n
                }, t), e.createElement("path", {
                    fill: "none",
                    d: "M0 0h24v24H0z"
                }), e.createElement("path", {d: "M5 5v14h14V7.828L16.172 5H5zM4 3h13l3.707 3.707a1 1 0 01.293.707V20a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1zm8 15a3 3 0 110-6 3 3 0 010 6zM6 6h9v4H6V6z"}))
            })), vr = e.forwardRef((function (t, n) {
                return e.createElement("svg", Object.assign({
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 24 24",
                    "aria-hidden": "true",
                    ref: n
                }, t), e.createElement("path", {
                    fill: "none",
                    d: "M0 0h24v24H0z"
                }), e.createElement("path", {d: "M17 6h5v2h-2v13a1 1 0 01-1 1H5a1 1 0 01-1-1V8H2V6h5V3a1 1 0 011-1h8a1 1 0 011 1v3zm1 2H6v12h12V8zm-4.586 6l1.768 1.768-1.414 1.414L12 15.414l-1.768 1.768-1.414-1.414L10.586 14l-1.768-1.768 1.414-1.414L12 12.586l1.768-1.768 1.414 1.414L13.414 14zM9 4v2h6V4H9z"}))
            })),
            br = /^[v^~<>=]*?(\d+)(?:\.([x*]|\d+)(?:\.([x*]|\d+)(?:\.([x*]|\d+))?(?:-([\da-z\-]+(?:\.[\da-z\-]+)*))?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?)?)?$/i,
            yr = e => {
                if ("string" != typeof e) throw new TypeError("Invalid argument expected string");
                const t = e.match(br);
                if (!t) throw new Error(`Invalid argument not valid semver ('${e}' received)`);
                return t.shift(), t
            }, Er = e => "*" === e || "x" === e || "X" === e, _r = e => {
                const t = parseInt(e, 10);
                return isNaN(t) ? e : t
            }, wr = (e, t) => {
                if (Er(e) || Er(t)) return 0;
                const [n, r] = ((e, t) => typeof e != typeof t ? [String(e), String(t)] : [e, t])(_r(e), _r(t));
                return n > r ? 1 : n < r ? -1 : 0
            }, kr = (e, t) => {
                for (let n = 0; n < Math.max(e.length, t.length); n++) {
                    const r = wr(e[n] || "0", t[n] || "0");
                    if (0 !== r) return r
                }
                return 0
            }, Sr = {">": [1], ">=": [0, 1], "=": [0], "<=": [-1, 0], "<": [-1], "!=": [-1, 1]}, Or = Object.keys(Sr),
            Cr = e => {
                if ("string" != typeof e) throw new TypeError("Invalid operator type, expected string but got " + typeof e);
                if (-1 === Or.indexOf(e)) throw new Error(`Invalid operator, expected one of ${Or.join("|")}`)
            }, Nr = t => ((e, t, n) => {
                Cr(n);
                const r = ((e, t) => {
                    const n = yr(e), r = yr(t), a = n.pop(), o = r.pop(), i = kr(n, r);
                    return 0 !== i ? i : a && o ? kr(a.split("."), o.split(".")) : a || o ? a ? -1 : 1 : 0
                })(e, t);
                return Sr[n].includes(r)
            })(window.nectarblocks_env.WORDPRESS_VERSION, "6.8", "<") ? (0, e.createElement)(se.CustomSelectControl, {...t}) : (0, e.createElement)(se.CustomSelectControl, {
                ...t,
                __next40pxDefaultSize: !0
            }), Tr = ({
                          options: t,
                          label: n = "",
                          onSelect: r,
                          value: a,
                          size: o = "default",
                          style: i = "default",
                          locked: c = !1,
                          disabled: s = !1,
                          align: l = "bottom"
                      }) => {
                const u = "nectar-component__custom-select", d = ce()(u, {
                    [`${u}--size-${o}`]: !0,
                    [`${u}--style-${i}`]: !0,
                    [`${u}--locked`]: c,
                    [`${u}--disabled`]: s,
                    [`${u}--align-${l}`]: "bottom" !== l,
                    "no-label": !n
                });
                return (0, e.createElement)("div", {className: d}, (0, e.createElement)(Nr, {
                    __next40pxDefaultSize: !0,
                    label: n,
                    options: t,
                    onChange: ({selectedItem: e}) => {
                        r(e)
                    },
                    value: t.find((e => e.key === a?.key))
                }))
            }, xr = ["", "normal", "italic"].map((e => ({key: e, name: sr().capitalize(e)}))),
            Ir = ({fontStyle: t, onSelect: n}) => {
                const r = xr.find((e => e.key === t));
                return (0, e.createElement)(Tr, {
                    onSelect: e => {
                        null != e && n(e.key)
                    }, value: r, options: xr
                })
            }, Pr = ["100", "200", "300", "400", "500", "600", "700", "800", "900"].map((e => ({key: e, name: e}))),
            Ar = {key: "", name: ""},
            Rr = ({fontWeight: t, onSelect: n, fontSource: r, fontFamily: a, googleFontWeights: o}) => {
                let i, c;
                var s, l;
                return "Google" === r ? (c = o.map((e => ({
                    key: e,
                    name: e,
                    style: {fontWeight: e.replace("italic", ""), fontStyle: e.includes("italic") ? "italic" : "normal"}
                }))), i = null !== (s = c.find((e => e.key === t.toString()))) && void 0 !== s ? s : Ar) : (c = Pr, i = null !== (l = c.find((e => e.key === t))) && void 0 !== l ? l : Ar), (0, e.createElement)(Tr, {
                    onSelect: e => {
                        e && n(e.key)
                    }, disabled: "" === a, value: i, options: c
                })
            }, Mr = e.forwardRef((function (t, n) {
                return e.createElement("svg", Object.assign({
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 24 24",
                    "aria-hidden": "true",
                    ref: n
                }, t), e.createElement("path", {
                    fill: "none",
                    d: "M0 0h24v24H0z"
                }), e.createElement("path", {d: "M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"}))
            })), zr = e.forwardRef((function (t, n) {
                return e.createElement("svg", Object.assign({
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 24 24",
                    "aria-hidden": "true",
                    ref: n
                }, t), e.createElement("path", {
                    fill: "none",
                    d: "M0 0h24v24H0z"
                }), e.createElement("path", {d: "M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"}))
            })), Lr = ({slug: t}) => {
                const n = (0, r.useRef)(null), [a, o] = (0, r.useState)(), [i, c] = (0, r.useState)();
                return (0, e.createElement)("div", {className: "nectar-custom-fonts__content__variation-add"}, (0, e.createElement)("h4", null, (0, oe.__)("Add a Font Variation", "nectar-blocks")), (0, e.createElement)("form", {className: "nectar-form"}, (0, e.createElement)("div", {className: "custom-file-upload"}, (0, e.createElement)("input", {
                    id: "custom-file-upload__input-" + t,
                    name: "file",
                    type: "file",
                    accept: ".ttf, .woff, .woff2",
                    required: !0,
                    onChange: function (e) {
                        const t = e.target;
                        o(t.files[0]), t.files[0] && c(t.files[0].name)
                    },
                    ref: n
                }), (0, e.createElement)("label", {
                    htmlFor: "custom-file-upload__input-" + t,
                    className: "custom-file-upload__label"
                }, (0, e.createElement)("span", null, i ? (0, e.createElement)(e.Fragment, null, (0, e.createElement)(zr, null), (0, e.createElement)("span", null, i)) : (0, e.createElement)(e.Fragment, null, (0, e.createElement)(Mr, null), (0, e.createElement)("span", null, (0, oe.__)("Choose a .ttf, .woff, or .woff2 file", "nectar-blocks")))))), i && (0, e.createElement)(de, {
                    variant: "primary",
                    stretch: !0,
                    onClick: async () => {
                        if (!a) return void P.error((0, oe.__)("Please select a file to import.", "nectar-blocks"));
                        const e = new FormData;
                        e.append("file", a), e.append("slug", t);
                        const r = await (async e => {
                            try {
                                if ("success" === (await me()({
                                    path: `${pe}/settings/custom_fonts/add`,
                                    method: "POST",
                                    body: e
                                })).status) return !0
                            } catch (e) {
                                ve.warn(e)
                            }
                            return !1
                        })(e);
                        !0 === r ? (P.success((0, oe.__)("Successfully custom font.", "nectar-blocks")), n?.current?.value && (n.current.value = ""), c(void 0), o(void 0), window.location.reload()) : P.error((0, oe.__)("Failed to import custom font.", "nectar-blocks"))
                    }
                }, (0, oe.__)("Import", "nectar-blocks"))))
            }, jr = ({font: t, slug: n, index: a, fontFamily: o}) => {
                const [i, c] = (0, r.useState)(t.fontData.weight), [s, l] = (0, r.useState)(t.fontData.fontStyle);
                return (0, e.createElement)("div", {className: "nectar-custom-fonts__meta"}, (0, e.createElement)("p", {
                    className: "nectar-custom-fonts__meta__font",
                    style: {
                        fontFamily: `${o}, apple-system, BlinkMacSystemFont, Cantarell, 'Helvetica Neue', sans-serif`,
                        fontWeight: t.fontData.weight,
                        fontStyle: t.fontData.fontStyle
                    }
                }, t.file_name), (0, e.createElement)("div", {className: "nectar-custom-fonts__meta__actions"}, (0, e.createElement)(Ir, {
                    fontStyle: s,
                    onSelect: l
                }), (0, e.createElement)(Rr, {
                    fontWeight: i,
                    onSelect: c,
                    fontSource: "Uploaded",
                    fontFamily: "Anything",
                    googleFontWeights: []
                }), (0, e.createElement)(de, {
                    variant: "secondary",
                    icon: (0, e.createElement)(gr, {width: 20}),
                    onClick: async () => {
                        if (i === t.fontData.weight && s === t.fontData.fontStyle) return void ne.error((0, oe.__)("No changes were made.", "nectar-blocks"));
                        const e = await (async (e, t, n, r) => {
                            try {
                                if ("success" === (await me()({
                                    path: `${pe}/settings/custom_fonts/update/variation`,
                                    method: "POST",
                                    data: {slug: e, index: t, fontWeight: n, fontStyle: r}
                                })).status) return !0
                            } catch (e) {
                                ve.warn(e)
                            }
                            return !1
                        })(n, a, i, s);
                        !1 === e ? ne.error((0, oe.__)("Failed to update custom font variation.", "nectar-blocks")) : (ne.success((0, oe.__)("Successfully updated custom font variation.", "nectar-blocks")), window.location.reload())
                    },
                    text: (0, oe.__)("Update Font Data", "nectar-blocks")
                }), (0, e.createElement)(de, {
                    icon: (0, e.createElement)(vr, {width: 20}),
                    variant: "secondary",
                    onClick: async () => {
                        const e = await (async (e, t) => {
                            try {
                                if ("success" === (await me()({
                                    path: `${pe}/settings/custom_fonts/delete/variation`,
                                    method: "POST",
                                    data: {slug: e, index: t}
                                })).status) return !0
                            } catch (e) {
                                ve.warn(e)
                            }
                            return !1
                        })(n, a);
                        !1 === e ? ne.error((0, oe.__)("Failed to delete custom font variation", "nectar-blocks")) : (ne.success((0, oe.__)("Successfully deleted custom font variation.", "nectar-blocks")), await pr())
                    },
                    text: (0, oe.__)("Delete", "nectar-blocks")
                })))
            },
            Dr = ({font: t}) => (0, e.createElement)("div", {className: "nectar-custom-fonts__family"}, (0, e.createElement)("div", {className: "nectar-custom-fonts__family__name"}, (0, e.createElement)("span", null, " ", t.name, " "), (0, e.createElement)(de, {
                icon: (0, e.createElement)(vr, {width: 20}),
                variant: "underline",
                onClick: async () => {
                    !1 === await (async e => {
                        try {
                            if ("success" === (await me()({
                                path: `${pe}/settings/custom_fonts/delete`,
                                method: "POST",
                                data: {slug: e}
                            })).status) return !0
                        } catch (e) {
                            ve.warn(e)
                        }
                        return !1
                    })(t.slug) ? ne.error((0, oe.__)("Failed to delete custom font.", "nectar-blocks")) : (ne.success((0, oe.__)("Successfully deleted custom font.", "nectar-blocks")), await pr())
                },
                text: (0, oe.__)("Delete", "nectar-blocks")
            })), (0, e.createElement)("div", {className: "nectar-custom-fonts__content"}, (0, e.createElement)("div", {className: ce()("nectar-custom-fonts__content__list", {"nectar-custom-fonts__content__list--empty": 0 === t.variations.length})}, t.variations.map(((n, r) => (0, e.createElement)(jr, {
                key: r,
                fontFamily: t.name,
                slug: t.slug,
                font: n,
                index: r
            })))), (0, e.createElement)(Lr, {slug: t.slug}))), Fr = () => {
                const t = (0, ae.useSelect)((e => e(Kn) ? e(Kn).getCustomFonts() : []), []);
                return (0, e.createElement)(e.Fragment, null, t.length > 0 && (0, e.createElement)("div", {className: "nectar-custom-fonts__list"}, t.map(((t, n) => (0, e.createElement)(Dr, {
                    key: n,
                    font: t
                })))))
            },
            $r = () => (0, e.createElement)("div", {className: "nectar-custom-fonts"}, (0, e.createElement)(Fr, null), (0, e.createElement)(hr, null)),
            Ur = e.forwardRef((function (t, n) {
                return e.createElement("svg", Object.assign({
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 24 24",
                    "aria-hidden": "true",
                    ref: n
                }, t), e.createElement("path", {
                    fill: "none",
                    d: "M0 0h24v24H0z"
                }), e.createElement("path", {d: "M16.394 12L10 7.737v8.526L16.394 12zm2.982.416L8.777 19.482A.5.5 0 018 19.066V4.934a.5.5 0 01.777-.416l10.599 7.066a.5.5 0 010 .832z"}))
            })), Hr = ({source: t}) => {
                const n = "nectar-component__video-player", [a, o] = (0, r.useState)(!1), i = (0, r.useRef)(null);
                return (0, r.useEffect)((() => {
                    const e = () => {
                        o(!1)
                    };
                    return i.current && i.current.addEventListener("ended", e), () => {
                        i.current && i.current.removeEventListener("ended", e)
                    }
                }), []), (0, e.createElement)("div", {
                    className: n, onClick: () => {
                        i.current && (a ? i.current.pause() : i.current.play(), o(!a))
                    }
                }, (0, e.createElement)("span", {className: ce()(`${n}__play-button`, {[`${n}__play-button--playing`]: a})}, (0, e.createElement)(Ur, {
                    width: 30,
                    height: 30
                })), (0, e.createElement)("video", {
                    ref: i,
                    className: `${n}__video`
                }, (0, e.createElement)("source", {src: t, type: "video/mp4"})))
            },
            Vr = () => (0, e.createElement)(e.Fragment, null, (0, e.createElement)("div", {className: "nectar-admin-panel__header"}, (0, e.createElement)("h1", null, (0, oe.__)("Welcome to the future of WordPress", "nectar-blocks")), (0, e.createElement)("p", null, (0, oe.__)("Nectarblocks elevates the WordPress Gutenberg editor to an exceptionally powerful editor. Explore the key features below to begin your journey.", "nectar-blocks"))), (0, e.createElement)("div", {className: ce()("nectar-admin-panel__grid", "nectar-admin-panel__grid--boxes")}, (0, e.createElement)("div", null, (0, e.createElement)(Hr, {source: "https://demos.nectarblocks.com/assets/docs/videos/nectar-blocks-list-2.mp4"}), (0, e.createElement)("h3", null, (0, oe.__)("Block Collection", "nectar-blocks")), (0, oe.__)("A robust collection of powerful blocks designed to simplify the process of building your website.", "nectar-blocks")), (0, e.createElement)("div", null, (0, e.createElement)(Hr, {source: "https://demos.nectarblocks.com/assets/docs/videos/nectar-blocks-template-lib.mp4"}), (0, e.createElement)("h3", null, (0, oe.__)("The Template Library", "nectar-blocks")), (0, oe.__)("Jump start your Website creation with our professionally designed collection of pre-made templates", "nectar-blocks")), (0, e.createElement)("div", null, (0, e.createElement)(Hr, {source: "https://demos.nectarblocks.com/assets/docs/videos/nectar-blocks-global-settings.mp4"}), (0, e.createElement)("h3", null, (0, oe.__)("Streamlined Global Settings", "nectar-blocks")), (0, oe.__)("Establish reusable color schemes and typography rules that can be effortlessly applied to Nectar blocks across all your pages.", "nectar-blocks")), (0, e.createElement)("div", null, (0, e.createElement)(Hr, {source: "https://demos.nectarblocks.com/assets/docs/videos/nectar-blocks-block-settings.mp4"}), (0, e.createElement)("h3", null, (0, oe.__)("Extensively Customizable Block Settings", "nectar-blocks")), (0, oe.__)("Experience unparalleled control with our extensively customizable block settings. Tailor each element to your unique design requirements.", "nectar-blocks")), (0, e.createElement)("div", null, (0, e.createElement)(Hr, {source: "https://demos.nectarblocks.com/assets/docs/videos/nectar-blocks-responsive.mp4"}), (0, e.createElement)("h3", null, (0, oe.__)("Next-Gen Responsive Editing", "nectar-blocks")), (0, oe.__)("Effortlessly customize block settings for different devices using a single, intuitive control interface. Whether adjusting settings for each device individually or hovering over elements, you can instantly see the changes in an active preview.", "nectar-blocks")), (0, e.createElement)("div", null, (0, e.createElement)(Hr, {source: "https://demos.nectarblocks.com/assets/docs/videos/nectar-blocks-unsplash-images.mp4"}), (0, e.createElement)("h3", null, (0, oe.__)("Integrated Unsplash Images", "nectar-blocks")), (0, oe.__)("Nectarblocks seamlessly integrates with Unsplash to provide you with a vast library of high quality images to choose from.", "nectar-blocks")))),
            Br = e.forwardRef((function (t, n) {
                return e.createElement("svg", Object.assign({
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 24 24",
                    "aria-hidden": "true",
                    ref: n
                }, t), e.createElement("path", {
                    fill: "none",
                    d: "M0 0h24v24H0z"
                }), e.createElement("path", {d: "M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"}))
            })), Gr = e.forwardRef((function (t, n) {
                return e.createElement("svg", Object.assign({
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 24 24",
                    "aria-hidden": "true",
                    ref: n
                }, t), e.createElement("path", {
                    fill: "none",
                    d: "M0 0h24v24H0z"
                }), e.createElement("path", {d: "M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z"}))
            })), Wr = e.forwardRef((function (t, n) {
                return e.createElement("svg", Object.assign({
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 24 24",
                    "aria-hidden": "true",
                    ref: n
                }, t), e.createElement("path", {
                    fill: "none",
                    d: "M0 0h24v24H0z"
                }), e.createElement("path", {d: "M3 19h18v2H3v-2zM13 9h7l-8 8-8-8h7V1h2v8z"}))
            }));

        function Kr() {
            return Kr = Object.assign ? Object.assign.bind() : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                    var n = arguments[t];
                    for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r])
                }
                return e
            }, Kr.apply(null, arguments)
        }

        function qr(e, t) {
            (null == t || t > e.length) && (t = e.length);
            for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
            return r
        }

        function Yr(e, t) {
            if (e) {
                if ("string" == typeof e) return qr(e, t);
                var n = {}.toString.call(e).slice(8, -1);
                return "Object" === n && e.constructor && (n = e.constructor.name), "Map" === n || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? qr(e, t) : void 0
            }
        }

        function Zr(e, t) {
            return function (e) {
                if (Array.isArray(e)) return e
            }(e) || function (e, t) {
                var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
                if (null != n) {
                    var r, a, o, i, c = [], s = !0, l = !1;
                    try {
                        if (o = (n = n.call(e)).next, 0 === t) {
                            if (Object(n) !== n) return;
                            s = !1
                        } else for (; !(s = (r = o.call(n)).done) && (c.push(r.value), c.length !== t); s = !0) ;
                    } catch (e) {
                        l = !0, a = e
                    } finally {
                        try {
                            if (!s && null != n.return && (i = n.return(), Object(i) !== i)) return
                        } finally {
                            if (l) throw a
                        }
                    }
                    return c
                }
            }(e, t) || Yr(e, t) || function () {
                throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
            }()
        }

        const Qr = window.ReactDOM;
        var Jr = n.n(Qr);

        function Xr() {
            return !("undefined" == typeof window || !window.document || !window.document.createElement)
        }

        var ea = {}, ta = [];

        function na(e, t) {
        }

        function ra(e, t) {
        }

        function aa(e, t, n) {
            t || ea[n] || (e(!1, n), ea[n] = !0)
        }

        function oa(e, t) {
            aa(na, e, t)
        }

        function ia(e) {
            return ia = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) {
                return typeof e
            } : function (e) {
                return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
            }, ia(e)
        }

        oa.preMessage = function (e) {
            ta.push(e)
        }, oa.resetWarned = function () {
            ea = {}
        }, oa.noteOnce = function (e, t) {
            aa(ra, e, t)
        };
        var ca = n(276);

        function sa(e, t) {
            "function" == typeof e ? e(t) : "object" === ia(e) && e && "current" in e && (e.current = t)
        }

        function la() {
            for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n];
            var r = t.filter((function (e) {
                return e
            }));
            return r.length <= 1 ? r[0] : function (e) {
                t.forEach((function (t) {
                    sa(t, e)
                }))
            }
        }

        function ua() {
            for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++) n[r] = arguments[r];
            return a = function () {
                return la.apply(void 0, n)
            }, o = n, i = function (e, t) {
                return e.length !== t.length || e.every((function (e, n) {
                    return e !== t[n]
                }))
            }, "value" in (c = e.useRef({})).current && !i(c.current.condition, o) || (c.current.value = a(), c.current.condition = o), c.current.value;
            var a, o, i, c
        }

        function da(e) {
            var t, n, r = (0, ca.isMemo)(e) ? e.type.type : e.type;
            return !!("function" != typeof r || null !== (t = r.prototype) && void 0 !== t && t.render || r.$$typeof === ca.ForwardRef) && !!("function" != typeof e || null !== (n = e.prototype) && void 0 !== n && n.render || e.$$typeof === ca.ForwardRef)
        }

        const fa = e.createContext(null);
        var ma = Xr() ? e.useLayoutEffect : e.useEffect;
        const pa = function (t, n) {
            var r = e.useRef(!0);
            ma((function () {
                return t(r.current)
            }), n), ma((function () {
                return r.current = !1, function () {
                    r.current = !0
                }
            }), [])
        };
        var ha = [];

        function ga(e) {
            var t = function (e, t) {
                if ("object" != ia(e) || !e) return e;
                var n = e[Symbol.toPrimitive];
                if (void 0 !== n) {
                    var r = n.call(e, "string");
                    if ("object" != ia(r)) return r;
                    throw new TypeError("@@toPrimitive must return a primitive value.")
                }
                return String(e)
            }(e);
            return "symbol" == ia(t) ? t : t + ""
        }

        function va(e, t, n) {
            return (t = ga(t)) in e ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : e[t] = n, e
        }

        function ba(e, t) {
            var n = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var r = Object.getOwnPropertySymbols(e);
                t && (r = r.filter((function (t) {
                    return Object.getOwnPropertyDescriptor(e, t).enumerable
                }))), n.push.apply(n, r)
            }
            return n
        }

        function ya(e) {
            for (var t = 1; t < arguments.length; t++) {
                var n = null != arguments[t] ? arguments[t] : {};
                t % 2 ? ba(Object(n), !0).forEach((function (t) {
                    va(e, t, n[t])
                })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ba(Object(n)).forEach((function (t) {
                    Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t))
                }))
            }
            return e
        }

        function Ea(e, t) {
            if (!e) return !1;
            if (e.contains) return e.contains(t);
            for (var n = t; n;) {
                if (n === e) return !0;
                n = n.parentNode
            }
            return !1
        }

        var _a = "data-rc-order", wa = "data-rc-priority", ka = "rc-util-key", Sa = new Map;

        function Oa() {
            var e = (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}).mark;
            return e ? e.startsWith("data-") ? e : "data-".concat(e) : ka
        }

        function Ca(e) {
            return e.attachTo ? e.attachTo : document.querySelector("head") || document.body
        }

        function Na(e) {
            return Array.from((Sa.get(e) || e).children).filter((function (e) {
                return "STYLE" === e.tagName
            }))
        }

        function Ta(e) {
            var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
            if (!Xr()) return null;
            var n = t.csp, r = t.prepend, a = t.priority, o = void 0 === a ? 0 : a, i = function (e) {
                return "queue" === e ? "prependQueue" : e ? "prepend" : "append"
            }(r), c = "prependQueue" === i, s = document.createElement("style");
            s.setAttribute(_a, i), c && o && s.setAttribute(wa, "".concat(o)), null != n && n.nonce && (s.nonce = null == n ? void 0 : n.nonce), s.innerHTML = e;
            var l = Ca(t), u = l.firstChild;
            if (r) {
                if (c) {
                    var d = (t.styles || Na(l)).filter((function (e) {
                        if (!["prepend", "prependQueue"].includes(e.getAttribute(_a))) return !1;
                        var t = Number(e.getAttribute(wa) || 0);
                        return o >= t
                    }));
                    if (d.length) return l.insertBefore(s, d[d.length - 1].nextSibling), s
                }
                l.insertBefore(s, u)
            } else l.appendChild(s);
            return s
        }

        function xa(e) {
            var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, n = Ca(t);
            return (t.styles || Na(n)).find((function (n) {
                return n.getAttribute(Oa(t)) === e
            }))
        }

        function Ia(e) {
            var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, n = xa(e, t);
            n && Ca(t).removeChild(n)
        }

        function Pa(e, t) {
            var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}, r = Ca(n), a = Na(r),
                o = ya(ya({}, n), {}, {styles: a});
            !function (e, t) {
                var n = Sa.get(e);
                if (!n || !Ea(document, n)) {
                    var r = Ta("", t), a = r.parentNode;
                    Sa.set(e, a), e.removeChild(r)
                }
            }(r, o);
            var i, c, s, l = xa(t, o);
            if (l) return null !== (i = o.csp) && void 0 !== i && i.nonce && l.nonce !== (null === (c = o.csp) || void 0 === c ? void 0 : c.nonce) && (l.nonce = null === (s = o.csp) || void 0 === s ? void 0 : s.nonce), l.innerHTML !== e && (l.innerHTML = e), l;
            var u = Ta(e, o);
            return u.setAttribute(Oa(o), t), u
        }

        var Aa = "rc-util-locker-".concat(Date.now()), Ra = 0;

        function Ma(t) {
            var n = !!t, r = Zr(e.useState((function () {
                return Ra += 1, "".concat(Aa, "_").concat(Ra)
            })), 1)[0];
            pa((function () {
                if (n) {
                    var e = (a = document.body, "undefined" != typeof document && a && a instanceof Element ? function (e) {
                            var t = "rc-scrollbar-measure-".concat(Math.random().toString(36).substring(7)),
                                n = document.createElement("div");
                            n.id = t;
                            var r, a, o = n.style;
                            if (o.position = "absolute", o.left = "0", o.top = "0", o.width = "100px", o.height = "100px", o.overflow = "scroll", e) {
                                var i = getComputedStyle(e);
                                o.scrollbarColor = i.scrollbarColor, o.scrollbarWidth = i.scrollbarWidth;
                                var c = getComputedStyle(e, "::-webkit-scrollbar"), s = parseInt(c.width, 10),
                                    l = parseInt(c.height, 10);
                                try {
                                    var u = s ? "width: ".concat(c.width, ";") : "",
                                        d = l ? "height: ".concat(c.height, ";") : "";
                                    Pa("\n#".concat(t, "::-webkit-scrollbar {\n").concat(u, "\n").concat(d, "\n}"), t)
                                } catch (e) {
                                    console.error(e), r = s, a = l
                                }
                            }
                            document.body.appendChild(n);
                            var f = e && r && !isNaN(r) ? r : n.offsetWidth - n.clientWidth,
                                m = e && a && !isNaN(a) ? a : n.offsetHeight - n.clientHeight;
                            return document.body.removeChild(n), Ia(t), {width: f, height: m}
                        }(a) : {width: 0, height: 0}).width,
                        t = document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight) && window.innerWidth > document.body.offsetWidth;
                    Pa("\nhtml body {\n  overflow-y: hidden;\n  ".concat(t ? "width: calc(100% - ".concat(e, "px);") : "", "\n}"), r)
                } else Ia(r);
                var a;
                return function () {
                    Ia(r)
                }
            }), [n, r])
        }

        var za = !1, La = function (e) {
            return !1 !== e && (Xr() && e ? "string" == typeof e ? document.querySelector(e) : "function" == typeof e ? e() : e : null)
        }, ja = e.forwardRef((function (t, n) {
            var r = t.open, a = t.autoLock, o = t.getContainer, i = (t.debug, t.autoDestroy), c = void 0 === i || i,
                s = t.children, l = Zr(e.useState(r), 2), u = l[0], d = l[1], f = u || r;
            e.useEffect((function () {
                (c || r) && d(r)
            }), [r, c]);
            var m = Zr(e.useState((function () {
                return La(o)
            })), 2), p = m[0], h = m[1];
            e.useEffect((function () {
                var e = La(o);
                h(null != e ? e : null)
            }));
            var g = function (t, n) {
                var r = Zr(e.useState((function () {
                        return Xr() ? document.createElement("div") : null
                    })), 1)[0], a = e.useRef(!1), o = e.useContext(fa), i = Zr(e.useState(ha), 2), c = i[0], s = i[1],
                    l = o || (a.current ? void 0 : function (e) {
                        s((function (t) {
                            return [e].concat(function (e) {
                                if (Array.isArray(e)) return qr(e)
                            }(n = t) || function (e) {
                                if ("undefined" != typeof Symbol && null != e[Symbol.iterator] || null != e["@@iterator"]) return Array.from(e)
                            }(n) || Yr(n) || function () {
                                throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
                            }());
                            var n
                        }))
                    });

                function u() {
                    r.parentElement || document.body.appendChild(r), a.current = !0
                }

                function d() {
                    var e;
                    null === (e = r.parentElement) || void 0 === e || e.removeChild(r), a.current = !1
                }

                return pa((function () {
                    return t ? o ? o(u) : u() : d(), d
                }), [t]), pa((function () {
                    c.length && (c.forEach((function (e) {
                        return e()
                    })), s(ha))
                }), [c]), [r, l]
            }(f && !p), v = Zr(g, 2), b = v[0], y = v[1], E = null != p ? p : b;
            Ma(a && r && Xr() && (E === b || E === document.body));
            var _ = null;
            s && da(s) && n && (_ = s.ref);
            var w = ua(_, n);
            if (!f || !Xr() || void 0 === p) return null;
            var k = !1 === E || za, S = s;
            return n && (S = e.cloneElement(s, {ref: w})), e.createElement(fa.Provider, {value: y}, k ? S : (0, Qr.createPortal)(S, E))
        }));
        const Da = ja;
        var Fa = e.createContext({}), $a = 0, Ua = ya({}, e).useId;
        const Ha = Ua ? function (e) {
            var t = Ua();
            return e || t
        } : function (t) {
            var n = Zr(e.useState("ssr-id"), 2), r = n[0], a = n[1];
            return e.useEffect((function () {
                var e = $a;
                $a += 1, a("rc_unique_".concat(e))
            }), []), t || r
        };
        var Va = {
            MAC_ENTER: 3,
            BACKSPACE: 8,
            TAB: 9,
            NUM_CENTER: 12,
            ENTER: 13,
            SHIFT: 16,
            CTRL: 17,
            ALT: 18,
            PAUSE: 19,
            CAPS_LOCK: 20,
            ESC: 27,
            SPACE: 32,
            PAGE_UP: 33,
            PAGE_DOWN: 34,
            END: 35,
            HOME: 36,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            PRINT_SCREEN: 44,
            INSERT: 45,
            DELETE: 46,
            ZERO: 48,
            ONE: 49,
            TWO: 50,
            THREE: 51,
            FOUR: 52,
            FIVE: 53,
            SIX: 54,
            SEVEN: 55,
            EIGHT: 56,
            NINE: 57,
            QUESTION_MARK: 63,
            A: 65,
            B: 66,
            C: 67,
            D: 68,
            E: 69,
            F: 70,
            G: 71,
            H: 72,
            I: 73,
            J: 74,
            K: 75,
            L: 76,
            M: 77,
            N: 78,
            O: 79,
            P: 80,
            Q: 81,
            R: 82,
            S: 83,
            T: 84,
            U: 85,
            V: 86,
            W: 87,
            X: 88,
            Y: 89,
            Z: 90,
            META: 91,
            WIN_KEY_RIGHT: 92,
            CONTEXT_MENU: 93,
            NUM_ZERO: 96,
            NUM_ONE: 97,
            NUM_TWO: 98,
            NUM_THREE: 99,
            NUM_FOUR: 100,
            NUM_FIVE: 101,
            NUM_SIX: 102,
            NUM_SEVEN: 103,
            NUM_EIGHT: 104,
            NUM_NINE: 105,
            NUM_MULTIPLY: 106,
            NUM_PLUS: 107,
            NUM_MINUS: 109,
            NUM_PERIOD: 110,
            NUM_DIVISION: 111,
            F1: 112,
            F2: 113,
            F3: 114,
            F4: 115,
            F5: 116,
            F6: 117,
            F7: 118,
            F8: 119,
            F9: 120,
            F10: 121,
            F11: 122,
            F12: 123,
            NUMLOCK: 144,
            SEMICOLON: 186,
            DASH: 189,
            EQUALS: 187,
            COMMA: 188,
            PERIOD: 190,
            SLASH: 191,
            APOSTROPHE: 192,
            SINGLE_QUOTE: 222,
            OPEN_SQUARE_BRACKET: 219,
            BACKSLASH: 220,
            CLOSE_SQUARE_BRACKET: 221,
            WIN_KEY: 224,
            MAC_FF_META: 224,
            WIN_IME: 229,
            isTextModifyingKeyEvent: function (e) {
                var t = e.keyCode;
                if (e.altKey && !e.ctrlKey || e.metaKey || t >= Va.F1 && t <= Va.F12) return !1;
                switch (t) {
                    case Va.ALT:
                    case Va.CAPS_LOCK:
                    case Va.CONTEXT_MENU:
                    case Va.CTRL:
                    case Va.DOWN:
                    case Va.END:
                    case Va.ESC:
                    case Va.HOME:
                    case Va.INSERT:
                    case Va.LEFT:
                    case Va.MAC_FF_META:
                    case Va.META:
                    case Va.NUMLOCK:
                    case Va.NUM_CENTER:
                    case Va.PAGE_DOWN:
                    case Va.PAGE_UP:
                    case Va.PAUSE:
                    case Va.PRINT_SCREEN:
                    case Va.RIGHT:
                    case Va.SHIFT:
                    case Va.UP:
                    case Va.WIN_KEY:
                    case Va.WIN_KEY_RIGHT:
                        return !1;
                    default:
                        return !0
                }
            },
            isCharacterKey: function (e) {
                if (e >= Va.ZERO && e <= Va.NINE) return !0;
                if (e >= Va.NUM_ZERO && e <= Va.NUM_MULTIPLY) return !0;
                if (e >= Va.A && e <= Va.Z) return !0;
                if (-1 !== window.navigator.userAgent.indexOf("WebKit") && 0 === e) return !0;
                switch (e) {
                    case Va.SPACE:
                    case Va.QUESTION_MARK:
                    case Va.NUM_PLUS:
                    case Va.NUM_MINUS:
                    case Va.NUM_PERIOD:
                    case Va.NUM_DIVISION:
                    case Va.SEMICOLON:
                    case Va.DASH:
                    case Va.EQUALS:
                    case Va.COMMA:
                    case Va.PERIOD:
                    case Va.SLASH:
                    case Va.APOSTROPHE:
                    case Va.SINGLE_QUOTE:
                    case Va.OPEN_SQUARE_BRACKET:
                    case Va.BACKSLASH:
                    case Va.CLOSE_SQUARE_BRACKET:
                        return !0;
                    default:
                        return !1
                }
            }
        };
        const Ba = Va;
        var Ga = "".concat("accept acceptCharset accessKey action allowFullScreen allowTransparency\n    alt async autoComplete autoFocus autoPlay capture cellPadding cellSpacing challenge\n    charSet checked classID className colSpan cols content contentEditable contextMenu\n    controls coords crossOrigin data dateTime default defer dir disabled download draggable\n    encType form formAction formEncType formMethod formNoValidate formTarget frameBorder\n    headers height hidden high href hrefLang htmlFor httpEquiv icon id inputMode integrity\n    is keyParams keyType kind label lang list loop low manifest marginHeight marginWidth max maxLength media\n    mediaGroup method min minLength multiple muted name noValidate nonce open\n    optimum pattern placeholder poster preload radioGroup readOnly rel required\n    reversed role rowSpan rows sandbox scope scoped scrolling seamless selected\n    shape size sizes span spellCheck src srcDoc srcLang srcSet start step style\n    summary tabIndex target title type useMap value width wmode wrap", " ").concat("onCopy onCut onPaste onCompositionEnd onCompositionStart onCompositionUpdate onKeyDown\n    onKeyPress onKeyUp onFocus onBlur onChange onInput onSubmit onClick onContextMenu onDoubleClick\n    onDrag onDragEnd onDragEnter onDragExit onDragLeave onDragOver onDragStart onDrop onMouseDown\n    onMouseEnter onMouseLeave onMouseMove onMouseOut onMouseOver onMouseUp onSelect onTouchCancel\n    onTouchEnd onTouchMove onTouchStart onScroll onWheel onAbort onCanPlay onCanPlayThrough\n    onDurationChange onEmptied onEncrypted onEnded onError onLoadedData onLoadedMetadata\n    onLoadStart onPause onPlay onPlaying onProgress onRateChange onSeeked onSeeking onStalled onSuspend onTimeUpdate onVolumeChange onWaiting onLoad onError").split(/[\s\n]+/);

        function Wa(e, t) {
            return 0 === e.indexOf(t)
        }

        function Ka(e) {
            var t, n = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
            t = !1 === n ? {aria: !0, data: !0, attr: !0} : !0 === n ? {aria: !0} : ya({}, n);
            var r = {};
            return Object.keys(e).forEach((function (n) {
                (t.aria && ("role" === n || Wa(n, "aria-")) || t.data && Wa(n, "data-") || t.attr && Ga.includes(n)) && (r[n] = e[n])
            })), r
        }

        function qa(e, t, n) {
            var r = t;
            return !r && n && (r = "".concat(e, "-").concat(n)), r
        }

        function Ya(e, t) {
            var n = e["page".concat(t ? "Y" : "X", "Offset")], r = "scroll".concat(t ? "Top" : "Left");
            if ("number" != typeof n) {
                var a = e.document;
                "number" != typeof (n = a.documentElement[r]) && (n = a.body[r])
            }
            return n
        }

        var Za = e.createContext({});

        function Qa(e, t) {
            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
        }

        function Ja(e, t) {
            for (var n = 0; n < t.length; n++) {
                var r = t[n];
                r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, ga(r.key), r)
            }
        }

        function Xa(e, t, n) {
            return t && Ja(e.prototype, t), n && Ja(e, n), Object.defineProperty(e, "prototype", {writable: !1}), e
        }

        function eo(e, t) {
            return eo = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (e, t) {
                return e.__proto__ = t, e
            }, eo(e, t)
        }

        function to(e, t) {
            if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function");
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    writable: !0,
                    configurable: !0
                }
            }), Object.defineProperty(e, "prototype", {writable: !1}), t && eo(e, t)
        }

        function no(e) {
            return no = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (e) {
                return e.__proto__ || Object.getPrototypeOf(e)
            }, no(e)
        }

        function ro() {
            try {
                var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], (function () {
                })))
            } catch (e) {
            }
            return (ro = function () {
                return !!e
            })()
        }

        function ao(e) {
            if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return e
        }

        function oo(e) {
            var t = ro();
            return function () {
                var n, r = no(e);
                if (t) {
                    var a = no(this).constructor;
                    n = Reflect.construct(r, arguments, a)
                } else n = r.apply(this, arguments);
                return function (e, t) {
                    if (t && ("object" == ia(t) || "function" == typeof t)) return t;
                    if (void 0 !== t) throw new TypeError("Derived constructors may only return object or undefined");
                    return ao(e)
                }(this, n)
            }
        }

        const io = function (e) {
            to(n, e);
            var t = oo(n);

            function n() {
                return Qa(this, n), t.apply(this, arguments)
            }

            return Xa(n, [{
                key: "render", value: function () {
                    return this.props.children
                }
            }]), n
        }(e.Component);

        function co(t) {
            var n = e.useRef(!1), r = Zr(e.useState(t), 2), a = r[0], o = r[1];
            return e.useEffect((function () {
                return n.current = !1, function () {
                    n.current = !0
                }
            }), []), [a, function (e, t) {
                t && n.current || o(e)
            }]
        }

        var so = "none", lo = "appear", uo = "enter", fo = "leave", mo = "none", po = "prepare", ho = "start",
            go = "active", vo = "end", bo = "prepared";

        function yo(e, t) {
            var n = {};
            return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit".concat(e)] = "webkit".concat(t), n["Moz".concat(e)] = "moz".concat(t), n["ms".concat(e)] = "MS".concat(t), n["O".concat(e)] = "o".concat(t.toLowerCase()), n
        }

        var Eo, _o, wo, ko = (Eo = Xr(), _o = "undefined" != typeof window ? window : {}, wo = {
                animationend: yo("Animation", "AnimationEnd"),
                transitionend: yo("Transition", "TransitionEnd")
            }, Eo && ("AnimationEvent" in _o || delete wo.animationend.animation, "TransitionEvent" in _o || delete wo.transitionend.transition), wo),
            So = {};
        if (Xr()) {
            var Oo = document.createElement("div");
            So = Oo.style
        }
        var Co = {};

        function No(e) {
            if (Co[e]) return Co[e];
            var t = ko[e];
            if (t) for (var n = Object.keys(t), r = n.length, a = 0; a < r; a += 1) {
                var o = n[a];
                if (Object.prototype.hasOwnProperty.call(t, o) && o in So) return Co[e] = t[o], Co[e]
            }
            return ""
        }

        var To = No("animationend"), xo = No("transitionend"), Io = !(!To || !xo), Po = To || "animationend",
            Ao = xo || "transitionend";

        function Ro(e, t) {
            if (!e) return null;
            if ("object" === ia(e)) {
                var n = t.replace(/-\w/g, (function (e) {
                    return e[1].toUpperCase()
                }));
                return e[n]
            }
            return "".concat(e, "-").concat(t)
        }

        const Mo = Xr() ? e.useLayoutEffect : e.useEffect;
        var zo = function (e) {
            return +setTimeout(e, 16)
        }, Lo = function (e) {
            return clearTimeout(e)
        };
        "undefined" != typeof window && "requestAnimationFrame" in window && (zo = function (e) {
            return window.requestAnimationFrame(e)
        }, Lo = function (e) {
            return window.cancelAnimationFrame(e)
        });
        var jo = 0, Do = new Map;

        function Fo(e) {
            Do.delete(e)
        }

        var $o = function (e) {
            var t = jo += 1;
            return function n(r) {
                if (0 === r) Fo(t), e(); else {
                    var a = zo((function () {
                        n(r - 1)
                    }));
                    Do.set(t, a)
                }
            }(arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 1), t
        };
        $o.cancel = function (e) {
            var t = Do.get(e);
            return Fo(e), Lo(t)
        };
        const Uo = $o;
        var Ho = [po, ho, go, vo], Vo = [po, bo], Bo = !1;

        function Go(e) {
            return e === go || e === vo
        }

        const Wo = function (n) {
            var r = n;
            "object" === ia(n) && (r = n.transitionSupport);
            var a = e.forwardRef((function (n, a) {
                var o = n.visible, i = void 0 === o || o, c = n.removeOnLeave, s = void 0 === c || c, l = n.forceRender,
                    u = n.children, d = n.motionName, f = n.leavedClassName, m = n.eventProps, p = function (e, t) {
                        return !(!e.motionName || !r || !1 === t)
                    }(n, e.useContext(Za).motion), h = (0, e.useRef)(), g = (0, e.useRef)(), v = function (t, n, r, a) {
                        var o = a.motionEnter, i = void 0 === o || o, c = a.motionAppear, s = void 0 === c || c,
                            l = a.motionLeave, u = void 0 === l || l, d = a.motionDeadline, f = a.motionLeaveImmediately,
                            m = a.onAppearPrepare, p = a.onEnterPrepare, h = a.onLeavePrepare, g = a.onAppearStart,
                            v = a.onEnterStart, b = a.onLeaveStart, y = a.onAppearActive, E = a.onEnterActive,
                            _ = a.onLeaveActive, w = a.onAppearEnd, k = a.onEnterEnd, S = a.onLeaveEnd,
                            O = a.onVisibleChanged, C = Zr(co(), 2), N = C[0], T = C[1], x = Zr(co(so), 2), I = x[0],
                            P = x[1], A = Zr(co(null), 2), R = A[0], M = A[1], z = (0, e.useRef)(!1),
                            L = (0, e.useRef)(null);

                        function j() {
                            return r()
                        }

                        var D = (0, e.useRef)(!1);

                        function F() {
                            P(so, !0), M(null, !0)
                        }

                        function $(e) {
                            var t = j();
                            if (!e || e.deadline || e.target === t) {
                                var n, r = D.current;
                                I === lo && r ? n = null == w ? void 0 : w(t, e) : I === uo && r ? n = null == k ? void 0 : k(t, e) : I === fo && r && (n = null == S ? void 0 : S(t, e)), I !== so && r && !1 !== n && F()
                            }
                        }

                        var U = Zr(function (t) {
                            var n = (0, e.useRef)(), r = (0, e.useRef)(t);
                            r.current = t;
                            var a = e.useCallback((function (e) {
                                r.current(e)
                            }), []);

                            function o(e) {
                                e && (e.removeEventListener(Ao, a), e.removeEventListener(Po, a))
                            }

                            return e.useEffect((function () {
                                return function () {
                                    o(n.current)
                                }
                            }), []), [function (e) {
                                n.current && n.current !== e && o(n.current), e && e !== n.current && (e.addEventListener(Ao, a), e.addEventListener(Po, a), n.current = e)
                            }, o]
                        }($), 1)[0], H = function (e) {
                            var t, n, r;
                            switch (e) {
                                case lo:
                                    return va(t = {}, po, m), va(t, ho, g), va(t, go, y), t;
                                case uo:
                                    return va(n = {}, po, p), va(n, ho, v), va(n, go, E), n;
                                case fo:
                                    return va(r = {}, po, h), va(r, ho, b), va(r, go, _), r;
                                default:
                                    return {}
                            }
                        }, V = e.useMemo((function () {
                            return H(I)
                        }), [I]), B = Zr(function (t, n, r) {
                            var a = Zr(co(mo), 2), o = a[0], i = a[1], c = function () {
                                var t = e.useRef(null);

                                function n() {
                                    Uo.cancel(t.current)
                                }

                                return e.useEffect((function () {
                                    return function () {
                                        n()
                                    }
                                }), []), [function e(r) {
                                    var a = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 2;
                                    n();
                                    var o = Uo((function () {
                                        a <= 1 ? r({
                                            isCanceled: function () {
                                                return o !== t.current
                                            }
                                        }) : e(r, a - 1)
                                    }));
                                    t.current = o
                                }, n]
                            }(), s = Zr(c, 2), l = s[0], u = s[1], d = n ? Vo : Ho;
                            return Mo((function () {
                                if (o !== mo && o !== vo) {
                                    var e = d.indexOf(o), t = d[e + 1], n = r(o);
                                    n === Bo ? i(t, !0) : t && l((function (e) {
                                        function r() {
                                            e.isCanceled() || i(t, !0)
                                        }

                                        !0 === n ? r() : Promise.resolve(n).then(r)
                                    }))
                                }
                            }), [t, o]), e.useEffect((function () {
                                return function () {
                                    u()
                                }
                            }), []), [function () {
                                i(po, !0)
                            }, o]
                        }(I, !t, (function (e) {
                            if (e === po) {
                                var t = V[po];
                                return t ? t(j()) : Bo
                            }
                            var n;
                            return W in V && M((null === (n = V[W]) || void 0 === n ? void 0 : n.call(V, j(), null)) || null), W === go && (U(j()), d > 0 && (clearTimeout(L.current), L.current = setTimeout((function () {
                                $({deadline: !0})
                            }), d))), W === bo && F(), true
                        })), 2), G = B[0], W = B[1], K = Go(W);
                        D.current = K, Mo((function () {
                            T(n);
                            var e, r = z.current;
                            z.current = !0, !r && n && s && (e = lo), r && n && i && (e = uo), (r && !n && u || !r && f && !n && u) && (e = fo);
                            var a = H(e);
                            e && (t || a[po]) ? (P(e), G()) : P(so)
                        }), [n]), (0, e.useEffect)((function () {
                            (I === lo && !s || I === uo && !i || I === fo && !u) && P(so)
                        }), [s, i, u]), (0, e.useEffect)((function () {
                            return function () {
                                z.current = !1, clearTimeout(L.current)
                            }
                        }), []);
                        var q = e.useRef(!1);
                        (0, e.useEffect)((function () {
                            N && (q.current = !0), void 0 !== N && I === so && ((q.current || N) && (null == O || O(N)), q.current = !0)
                        }), [N, I]);
                        var Y = R;
                        return V[po] && W === ho && (Y = ya({transition: "none"}, Y)), [I, W, Y, null != N ? N : n]
                    }(p, i, (function () {
                        try {
                            return h.current instanceof HTMLElement ? h.current : function (e) {
                                return e instanceof HTMLElement || e instanceof SVGElement
                            }(e = g.current) ? e : e instanceof t().Component ? Jr().findDOMNode(e) : null
                        } catch (e) {
                            return null
                        }
                        var e
                    }), n), b = Zr(v, 4), y = b[0], E = b[1], _ = b[2], w = b[3], k = e.useRef(w);
                w && (k.current = !0);
                var S, O = e.useCallback((function (e) {
                    h.current = e, sa(a, e)
                }), [a]), C = ya(ya({}, m), {}, {visible: i});
                if (u) if (y === so) S = w ? u(ya({}, C), O) : !s && k.current && f ? u(ya(ya({}, C), {}, {className: f}), O) : l || !s && !f ? u(ya(ya({}, C), {}, {style: {display: "none"}}), O) : null; else {
                    var N, T;
                    E === po ? T = "prepare" : Go(E) ? T = "active" : E === ho && (T = "start");
                    var x = Ro(d, "".concat(y, "-").concat(T));
                    S = u(ya(ya({}, C), {}, {
                        className: ce()(Ro(d, y), (N = {}, va(N, x, x && T), va(N, d, "string" == typeof d), N)),
                        style: _
                    }), O)
                } else S = null;
                return e.isValidElement(S) && da(S) && (S.ref || (S = e.cloneElement(S, {ref: O}))), e.createElement(io, {ref: g}, S)
            }));
            return a.displayName = "CSSMotion", a
        }(Io);

        function Ko(e, t) {
            if (null == e) return {};
            var n, r, a = function (e, t) {
                if (null == e) return {};
                var n = {};
                for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
                    if (t.includes(r)) continue;
                    n[r] = e[r]
                }
                return n
            }(e, t);
            if (Object.getOwnPropertySymbols) {
                var o = Object.getOwnPropertySymbols(e);
                for (r = 0; r < o.length; r++) n = o[r], t.includes(n) || {}.propertyIsEnumerable.call(e, n) && (a[n] = e[n])
            }
            return a
        }

        var qo = "add", Yo = "keep", Zo = "remove", Qo = "removed";

        function Jo(e) {
            var t;
            return ya(ya({}, t = e && "object" === ia(e) && "key" in e ? e : {key: e}), {}, {key: String(t.key)})
        }

        function Xo() {
            return (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : []).map(Jo)
        }

        var ei = ["component", "children", "onVisibleChanged", "onAllRemoved"], ti = ["status"],
            ni = ["eventProps", "visible", "children", "motionName", "motionAppear", "motionEnter", "motionLeave", "motionLeaveImmediately", "motionDeadline", "removeOnLeave", "leavedClassName", "onAppearPrepare", "onAppearStart", "onAppearActive", "onAppearEnd", "onEnterStart", "onEnterActive", "onEnterEnd", "onLeaveStart", "onLeaveActive", "onLeaveEnd"];
        !function (t) {
            var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : Wo, r = function (t) {
                to(a, t);
                var r = oo(a);

                function a() {
                    var e;
                    Qa(this, a);
                    for (var t = arguments.length, n = new Array(t), o = 0; o < t; o++) n[o] = arguments[o];
                    return va(ao(e = r.call.apply(r, [this].concat(n))), "state", {keyEntities: []}), va(ao(e), "removeKey", (function (t) {
                        var n = e.state.keyEntities.map((function (e) {
                            return e.key !== t ? e : ya(ya({}, e), {}, {status: Qo})
                        }));
                        return e.setState({keyEntities: n}), n.filter((function (e) {
                            return e.status !== Qo
                        })).length
                    })), e
                }

                return Xa(a, [{
                    key: "render", value: function () {
                        var t = this, r = this.state.keyEntities, a = this.props, o = a.component, i = a.children,
                            c = a.onVisibleChanged, s = a.onAllRemoved, l = Ko(a, ei), u = o || e.Fragment, d = {};
                        return ni.forEach((function (e) {
                            d[e] = l[e], delete l[e]
                        })), delete l.keys, e.createElement(u, l, r.map((function (r, a) {
                            var o = r.status, l = Ko(r, ti), u = o === qo || o === Yo;
                            return e.createElement(n, Kr({}, d, {
                                key: l.key,
                                visible: u,
                                eventProps: l,
                                onVisibleChanged: function (e) {
                                    null == c || c(e, {key: l.key}), e || 0 === t.removeKey(l.key) && s && s()
                                }
                            }), (function (e, t) {
                                return i(ya(ya({}, e), {}, {index: a}), t)
                            }))
                        })))
                    }
                }], [{
                    key: "getDerivedStateFromProps", value: function (e, t) {
                        var n = e.keys, r = t.keyEntities, a = Xo(n), o = function () {
                            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [],
                                t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [], n = [], r = 0,
                                a = t.length, o = Xo(e), i = Xo(t);
                            o.forEach((function (e) {
                                for (var t = !1, o = r; o < a; o += 1) {
                                    var c = i[o];
                                    if (c.key === e.key) {
                                        r < o && (n = n.concat(i.slice(r, o).map((function (e) {
                                            return ya(ya({}, e), {}, {status: qo})
                                        }))), r = o), n.push(ya(ya({}, c), {}, {status: Yo})), r += 1, t = !0;
                                        break
                                    }
                                }
                                t || n.push(ya(ya({}, e), {}, {status: Zo}))
                            })), r < a && (n = n.concat(i.slice(r).map((function (e) {
                                return ya(ya({}, e), {}, {status: qo})
                            }))));
                            var c = {};
                            return n.forEach((function (e) {
                                var t = e.key;
                                c[t] = (c[t] || 0) + 1
                            })), Object.keys(c).filter((function (e) {
                                return c[e] > 1
                            })).forEach((function (e) {
                                (n = n.filter((function (t) {
                                    var n = t.key, r = t.status;
                                    return n !== e || r !== Zo
                                }))).forEach((function (t) {
                                    t.key === e && (t.status = Yo)
                                }))
                            })), n
                        }(r, a);
                        return {
                            keyEntities: o.filter((function (e) {
                                var t = r.find((function (t) {
                                    var n = t.key;
                                    return e.key === n
                                }));
                                return !t || t.status !== Qo || e.status !== Zo
                            }))
                        }
                    }
                }]), a
            }(e.Component);
            va(r, "defaultProps", {component: "div"})
        }(Io);
        const ri = Wo, ai = e.memo((function (e) {
            return e.children
        }), (function (e, t) {
            return !t.shouldUpdate
        }));
        var oi = {width: 0, height: 0, overflow: "hidden", outline: "none"}, ii = {outline: "none"},
            ci = t().forwardRef((function (n, r) {
                var a = n.prefixCls, o = n.className, i = n.style, c = n.title, s = n.ariaId, l = n.footer,
                    u = n.closable, d = n.closeIcon, f = n.onClose, m = n.children, p = n.bodyStyle, h = n.bodyProps,
                    g = n.modalRender, v = n.onMouseDown, b = n.onMouseUp, y = n.holderRef, E = n.visible,
                    _ = n.forceRender, w = n.width, k = n.height, S = n.classNames, O = n.styles,
                    C = ua(y, t().useContext(Fa).panel), N = (0, e.useRef)(), T = (0, e.useRef)();
                t().useImperativeHandle(r, (function () {
                    return {
                        focus: function () {
                            var e;
                            null === (e = N.current) || void 0 === e || e.focus({preventScroll: !0})
                        }, changeActive: function (e) {
                            var t = document.activeElement;
                            e && t === T.current ? N.current.focus({preventScroll: !0}) : e || t !== N.current || T.current.focus({preventScroll: !0})
                        }
                    }
                }));
                var x = {};
                void 0 !== w && (x.width = w), void 0 !== k && (x.height = k);
                var I = l ? t().createElement("div", {
                        className: ce()("".concat(a, "-footer"), null == S ? void 0 : S.footer),
                        style: ya({}, null == O ? void 0 : O.footer)
                    }, l) : null, P = c ? t().createElement("div", {
                        className: ce()("".concat(a, "-header"), null == S ? void 0 : S.header),
                        style: ya({}, null == O ? void 0 : O.header)
                    }, t().createElement("div", {className: "".concat(a, "-title"), id: s}, c)) : null,
                    A = (0, e.useMemo)((function () {
                        return "object" === ia(u) && null !== u ? u : u ? {closeIcon: null != d ? d : t().createElement("span", {className: "".concat(a, "-close-x")})} : {}
                    }), [u, d, a]), R = Ka(A, !0), M = "object" === ia(u) && u.disabled,
                    z = u ? t().createElement("button", Kr({
                        type: "button",
                        onClick: f,
                        "aria-label": "Close"
                    }, R, {className: "".concat(a, "-close"), disabled: M}), A.closeIcon) : null,
                    L = t().createElement("div", {
                        className: ce()("".concat(a, "-content"), null == S ? void 0 : S.content),
                        style: null == O ? void 0 : O.content
                    }, z, P, t().createElement("div", Kr({
                        className: ce()("".concat(a, "-body"), null == S ? void 0 : S.body),
                        style: ya(ya({}, p), null == O ? void 0 : O.body)
                    }, h), m), I);
                return t().createElement("div", {
                    key: "dialog-element",
                    role: "dialog",
                    "aria-labelledby": c ? s : null,
                    "aria-modal": "true",
                    ref: C,
                    style: ya(ya({}, i), x),
                    className: ce()(a, o),
                    onMouseDown: v,
                    onMouseUp: b
                }, t().createElement("div", {
                    ref: N,
                    tabIndex: 0,
                    style: ii
                }, t().createElement(ai, {shouldUpdate: E || _}, g ? g(L) : L)), t().createElement("div", {
                    tabIndex: 0,
                    ref: T,
                    style: oi
                }))
            }));
        const si = ci;
        var li = e.forwardRef((function (t, n) {
            var r = t.prefixCls, a = t.title, o = t.style, i = t.className, c = t.visible, s = t.forceRender,
                l = t.destroyOnClose, u = t.motionName, d = t.ariaId, f = t.onVisibleChanged, m = t.mousePosition,
                p = (0, e.useRef)(), h = Zr(e.useState(), 2), g = h[0], v = h[1], b = {};

            function y() {
                var e = function (e) {
                    var t = e.getBoundingClientRect(), n = {left: t.left, top: t.top}, r = e.ownerDocument,
                        a = r.defaultView || r.parentWindow;
                    return n.left += Ya(a), n.top += Ya(a, !0), n
                }(p.current);
                v(m && (m.x || m.y) ? "".concat(m.x - e.left, "px ").concat(m.y - e.top, "px") : "")
            }

            return g && (b.transformOrigin = g), e.createElement(ri, {
                visible: c,
                onVisibleChanged: f,
                onAppearPrepare: y,
                onEnterPrepare: y,
                forceRender: s,
                motionName: u,
                removeOnLeave: l,
                ref: p
            }, (function (c, s) {
                var l = c.className, u = c.style;
                return e.createElement(si, Kr({}, t, {
                    ref: n,
                    title: a,
                    ariaId: d,
                    prefixCls: r,
                    holderRef: s,
                    style: ya(ya(ya({}, u), o), b),
                    className: ce()(i, l)
                }))
            }))
        }));
        li.displayName = "Content";
        const ui = li, di = function (t) {
            var n = t.prefixCls, r = t.style, a = t.visible, o = t.maskProps, i = t.motionName, c = t.className;
            return e.createElement(ri, {
                key: "mask",
                visible: a,
                motionName: i,
                leavedClassName: "".concat(n, "-mask-hidden")
            }, (function (t, a) {
                var i = t.className, s = t.style;
                return e.createElement("div", Kr({
                    ref: a,
                    style: ya(ya({}, s), r),
                    className: ce()("".concat(n, "-mask"), i, c)
                }, o))
            }))
        }, fi = function (t) {
            var n = t.prefixCls, r = void 0 === n ? "rc-dialog" : n, a = t.zIndex, o = t.visible, i = void 0 !== o && o,
                c = t.keyboard, s = void 0 === c || c, l = t.focusTriggerAfterClose, u = void 0 === l || l,
                d = t.wrapStyle, f = t.wrapClassName, m = t.wrapProps, p = t.onClose, h = t.afterOpenChange,
                g = t.afterClose, v = t.transitionName, b = t.animation, y = t.closable, E = void 0 === y || y,
                _ = t.mask, w = void 0 === _ || _, k = t.maskTransitionName, S = t.maskAnimation, O = t.maskClosable,
                C = void 0 === O || O, N = t.maskStyle, T = t.maskProps, x = t.rootClassName, I = t.classNames,
                P = t.styles, A = (0, e.useRef)(), R = (0, e.useRef)(), M = (0, e.useRef)(), z = Zr(e.useState(i), 2),
                L = z[0], j = z[1], D = Ha();

            function F(e) {
                null == p || p(e)
            }

            var $ = (0, e.useRef)(!1), U = (0, e.useRef)(), H = null;
            C && (H = function (e) {
                $.current ? $.current = !1 : R.current === e.target && F(e)
            }), (0, e.useEffect)((function () {
                i && (j(!0), Ea(R.current, document.activeElement) || (A.current = document.activeElement))
            }), [i]), (0, e.useEffect)((function () {
                return function () {
                    clearTimeout(U.current)
                }
            }), []);
            var V = ya(ya(ya({zIndex: a}, d), null == P ? void 0 : P.wrapper), {}, {display: L ? null : "none"});
            return e.createElement("div", Kr({className: ce()("".concat(r, "-root"), x)}, Ka(t, {data: !0})), e.createElement(di, {
                prefixCls: r,
                visible: w && i,
                motionName: qa(r, k, S),
                style: ya(ya({zIndex: a}, N), null == P ? void 0 : P.mask),
                maskProps: T,
                className: null == I ? void 0 : I.mask
            }), e.createElement("div", Kr({
                tabIndex: -1,
                onKeyDown: function (e) {
                    if (s && e.keyCode === Ba.ESC) return e.stopPropagation(), void F(e);
                    i && e.keyCode === Ba.TAB && M.current.changeActive(!e.shiftKey)
                },
                className: ce()("".concat(r, "-wrap"), f, null == I ? void 0 : I.wrapper),
                ref: R,
                onClick: H,
                style: V
            }, m), e.createElement(ui, Kr({}, t, {
                onMouseDown: function () {
                    clearTimeout(U.current), $.current = !0
                },
                onMouseUp: function () {
                    U.current = setTimeout((function () {
                        $.current = !1
                    }))
                },
                ref: M,
                closable: E,
                ariaId: D,
                prefixCls: r,
                visible: i && L,
                onClose: F,
                onVisibleChanged: function (e) {
                    if (e) Ea(R.current, document.activeElement) || null === (t = M.current) || void 0 === t || t.focus(); else {
                        if (j(!1), w && A.current && u) {
                            try {
                                A.current.focus({preventScroll: !0})
                            } catch (e) {
                            }
                            A.current = null
                        }
                        L && (null == g || g())
                    }
                    var t;
                    null == h || h(e)
                },
                motionName: qa(r, v, b)
            }))))
        };
        var mi = function (t) {
            var n = t.visible, r = t.getContainer, a = t.forceRender, o = t.destroyOnClose, i = void 0 !== o && o,
                c = t.afterClose, s = t.panelRef, l = Zr(e.useState(n), 2), u = l[0], d = l[1],
                f = e.useMemo((function () {
                    return {panel: s}
                }), [s]);
            return e.useEffect((function () {
                n && d(!0)
            }), [n]), a || !i || u ? e.createElement(Fa.Provider, {value: f}, e.createElement(Da, {
                open: n || a || u,
                autoDestroy: !1,
                getContainer: r,
                autoLock: n || u
            }, e.createElement(fi, Kr({}, t, {
                destroyOnClose: i, afterClose: function () {
                    null == c || c(), d(!1)
                }
            })))) : null
        };
        mi.displayName = "Dialog";
        const pi = mi, hi = window.wp.primitives;
        var gi = n(70);
        const vi = (0, gi.jsx)(hi.SVG, {
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 24 24",
                children: (0, gi.jsx)(hi.Path, {d: "M12 4.75a7.25 7.25 0 100 14.5 7.25 7.25 0 000-14.5zM3.25 12a8.75 8.75 0 1117.5 0 8.75 8.75 0 01-17.5 0zM12 8.75a1.5 1.5 0 01.167 2.99c-.465.052-.917.44-.917 1.01V14h1.5v-.845A3 3 0 109 10.25h1.5a1.5 1.5 0 011.5-1.5zM11.25 15v1.5h1.5V15h-1.5z"})
            }), bi = "nectar-row", yi = ({label: t}) => (0, e.createElement)("span", {className: `${bi}__reset-wrap`}, t),
            Ei = ({
                      label: t,
                      children: n,
                      alignment: r = "horizontal",
                      locked: a = !1,
                      tooltip: o,
                      className: i,
                      labelWidth: c,
                      labelAlign: s
                  }) => {
                const l = (0, e.createElement)(yi, {label: t});
                return (0, e.createElement)("div", {
                    className: ce()(bi, i, {
                        [`${bi}--align-${r}`]: !0,
                        [`${bi}--locked`]: a,
                        [`${bi}--label-${c}`]: c,
                        [`${bi}--label-${s}`]: s
                    })
                }, (0, e.createElement)("div", {className: `${bi}__label`}, o ? (0, e.createElement)(se.Tooltip, {text: o}, (0, e.createElement)("div", {className: `${bi}__tooltip-label`}, l, (0, e.createElement)(se.Icon, {icon: vi}))) : l), (0, e.createElement)("div", {className: `${bi}__component`}, n))
            }, _i = async (e, t) => {
                try {
                    const n = await me()({path: `${pe}/import-export/${e}/import`, method: "POST", body: t});
                    if (ve.debug("import", n), "success" === n.status) return !0
                } catch (e) {
                    ve.warn(e)
                }
                return !1
            }, wi = async e => {
                try {
                    const t = await me()({path: `${pe}/import-export/${e}/export`, method: "POST"});
                    if (ve.info("export", t), "success" === t.status) return t
                } catch (e) {
                    ve.warn(e)
                }
                return !1
            }, ki = () => {
                const [t, n] = (0, r.useState)(!0), [a, o] = (0, r.useState)({
                    total_post: 100,
                    imported_count: 0,
                    remaining: 100
                });
                return (0, r.useEffect)((() => {
                    let e;
                    return t && (e = setTimeout((async () => {
                        const e = await (async e => {
                            try {
                                const e = await me()({path: `${pe}/import-export/core/import/status`, method: "GET"});
                                if (ve.debug("import status", e), "success" === e.status) return e.counts
                            } catch (e) {
                                ve.warn(e)
                            }
                            return null
                        })();
                        if (null === e) return console.error("Error getting import status."), void n(!1);
                        0 === e.remaining && n(!1), o(e)
                    }), 3e3)), () => clearTimeout(e)
                }), [a, t]), (0, e.createElement)("progress", {
                    value: a.imported_count,
                    max: a.total_post
                }, Math.round(a.imported_count / a.total_post) + "%")
            }, Si = () => {
                const t = [{
                        key: "lockhart",
                        title: "Lockhart",
                        screenshot: "https://demos.nectarblocks.com/assets/demos/lockhart/demo-screenshot.webp",
                        categories: ["photography", "portfolio"],
                        info: (0, e.createElement)(e.Fragment, null, (0, oe.__)('The title font used in the live demo is "Kyrlon" by Tom Karlsson and can be ', "nectar-blocks"), (0, e.createElement)("a", {
                            href: "https://www.behance.net/gallery/133227745/KRYLON-(free-font)?locale=en_US",
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }, (0, oe.__)("downloaded here.", "nectar-blocks"))),
                        hasWidgets: !1
                    }, {
                        key: "andromeda",
                        title: "Andromeda",
                        screenshot: "https://demos.nectarblocks.com/assets/demos/andromeda/demo-screenshot.webp",
                        categories: ["woocommerce", "business"],
                        hasWidgets: !0
                    }, {
                        key: "nectar-solutions",
                        title: "Nectar Solutions",
                        screenshot: "https://demos.nectarblocks.com/assets/demos/nectar-solutions/demo-screenshot.webp",
                        categories: ["business"],
                        hasWidgets: !1
                    }, {
                        key: "phoenix-falls",
                        title: "Phoenix Falls",
                        screenshot: "https://demos.nectarblocks.com/assets/demos/cafe/demo-screenshot.webp",
                        categories: ["business", "restaurant"],
                        hasWidgets: !1
                    }, {
                        key: "task-horizon",
                        title: "Task Horizon",
                        screenshot: "https://demos.nectarblocks.com/assets/demos/task-horizon/demo-screenshot.webp",
                        categories: ["business", "saas"],
                        hasWidgets: !1
                    }], [n, a] = (0, r.useState)(!1), [o, i] = (0, r.useState)({
                        demo: null,
                        demoContent: !0,
                        themeOptions: null !== window.nectarblocks_env.NB_THEME_VERSION,
                        globalSettings: !0,
                        widgets: !1
                    }), [c, s] = (0, r.useState)("idle"),
                    l = !window.nectarblocks_env.WOOCOMMERCE_ACTIVE && o.demo?.categories.includes("woocommerce");
                return (0, e.createElement)(e.Fragment, null, (0, e.createElement)(pi, {
                    title: `${(0, oe.__)("Import")} ${o.demo?.title}`,
                    animation: "zoom",
                    maskAnimation: "fade",
                    classNames: {wrapper: "center"},
                    closeIcon: (0, e.createElement)(Br, {width: 24}),
                    visible: n,
                    closable: "busy" !== c,
                    maskClosable: "busy" !== c,
                    onClose: () => a(!1)
                }, (0, e.createElement)(e.Fragment, null, (0, e.createElement)("img", {
                    src: o.demo?.screenshot,
                    alt: o.demo?.title
                }), (0, e.createElement)("div", {className: `${Mi}__import_settings`}, (0, e.createElement)(Ei, {label: (0, oe.__)("Demo Content", "nectar-blocks")}, (0, e.createElement)(Ue, {
                    id: "demo_content",
                    onChange: e => {
                        i({...o, demoContent: e})
                    },
                    checked: o.demoContent
                })), (0, e.createElement)(Ei, {label: (0, oe.__)("Theme Options", "nectar-blocks")}, (0, e.createElement)(Ue, {
                    id: "theme_options",
                    onChange: e => {
                        i({...o, themeOptions: e})
                    },
                    checked: o.themeOptions,
                    disabled: null === window.nectarblocks_env.NB_THEME_VERSION
                })), (0, e.createElement)(Ei, {label: (0, oe.__)("Global Settings", "nectar-blocks")}, (0, e.createElement)(Ue, {
                    id: "global_settings",
                    onChange: e => {
                        i({...o, globalSettings: e})
                    },
                    checked: o.globalSettings
                })), (0, e.createElement)(Ei, {label: (0, oe.__)("Widgets", "nectar-blocks")}, (0, e.createElement)(Ue, {
                    id: "widgets",
                    onChange: e => {
                        i({...o, widgets: e})
                    },
                    checked: o.widgets,
                    disabled: !1 === o.demo?.hasWidgets
                })), o.demo?.info && (0, e.createElement)("p", {className: `${Mi}__info`}, o.demo.info), (0, e.createElement)("p", null, (0, oe.__)("The duration of prebuilt website imports can vary. Ensure that your server", "nectar-blocks"), " ", (0, e.createElement)("a", {
                    target: "_blank",
                    rel: "noreferrer",
                    href: "https://docs.nectarblocks.com/demo-importer"
                }, (0, oe.__)("fulfills all necessary requirements", "nectar-blocks")), " ", (0, oe.__)("for a successful import. Once the import process begins,\n                please refrain from refreshing the page until it has completed.", "nectar-blocks")), l && (0, e.createElement)("div", {className: `${Mi}__warning`}, (0, e.createElement)(Ve, {width: 20}), (0, e.createElement)("span", null, (0, oe.__)("Warning: This demo requires", "nectar-blocks"), " ", (0, e.createElement)("a", {
                    target: "_blank",
                    rel: "noreferrer",
                    href: "https://wordpress.org/plugins/woocommerce/"
                }, (0, oe.__)("WooCommerce", "nectar-blocks")), ", ", (0, oe.__)("but the plugin is not currently active in your setup.", "nectar-blocks"))), (0, e.createElement)(de, {
                    variant: "primary",
                    stretch: !0,
                    disabled: "idle" !== c || l,
                    className: ce()({"is-busy": "idle" !== c}),
                    onClick: async () => {
                        if (null === o.demo) return;
                        s("busy");
                        const e = new FormData;
                        e.append("demo", o.demo.key), e.append("options", JSON.stringify({
                            demoContent: o.demoContent,
                            themeOptions: o.themeOptions,
                            globalSettings: o.globalSettings,
                            widgets: o.widgets
                        })), s("active"), !0 === await _i("core", e) ? (P.success((0, oe.__)("Successfully imported demo.", "nectar-blocks")), a(!1)) : P.error((0, oe.__)("Failed to import demo.", "nectar-blocks")), s("idle")
                    }
                }, (0, oe.__)("Import Demo", "nectar-blocks")), "active" === c && (0, e.createElement)(ki, null)))), (0, e.createElement)("section", null, null === window.nectarblocks_env.NB_THEME_VERSION && (0, e.createElement)("div", {className: `${Mi}__warning`}, (0, e.createElement)(Gr, {width: 20}), (0, e.createElement)("span", null, (0, oe.__)("You are not using the included", "nectar-blocks"), " ", (0, e.createElement)("a", {
                    target: "_blank",
                    rel: "noreferrer",
                    href: "https://docs.nectarblocks.com/theme/overview"
                }, (0, oe.__)("Nectarblocks theme", "nectar-blocks")), (0, oe.__)(", which is recommended for demo imports.", "nectar-blocks"))), (0, e.createElement)("div", {className: `${Mi}__demos`}, t.map(((t, n) => (0, e.createElement)("div", {
                    className: `${Mi}__demo`,
                    key: n,
                    onClick: () => {
                        var e;
                        i({...o, demo: t, widgets: null !== (e = t.hasWidgets) && void 0 !== e && e}), a(!0)
                    }
                }, (0, e.createElement)("img", {
                    src: t.screenshot,
                    alt: t.title
                }), (0, e.createElement)("span", {className: `${Mi}__demo__import-icon`}, (0, e.createElement)(Wr, {width: 20})), (0, e.createElement)("div", {
                    className: `${Mi}__demo__meta`,
                    key: n
                }, (0, e.createElement)("h4", null, t.title), (0, e.createElement)("span", null, t.categories.map((e => sr().capitalize(e))).join(", ")))))))))
            };
        var Oi;

        function Ci() {
            return Ci = Object.assign ? Object.assign.bind() : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                    var n = arguments[t];
                    for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r])
                }
                return e
            }, Ci.apply(null, arguments)
        }

        const Ni = function (t) {
            return e.createElement("svg", Ci({
                xmlns: "http://www.w3.org/2000/svg",
                fill: "currentColor",
                viewBox: "0 0 24 24"
            }, t), Oi || (Oi = e.createElement("path", {d: "M21 3H3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1m-9 13a3 3 0 0 1-3-3H4V5h16v8h-5a3 3 0 0 1-3 3m4-5h-3v3h-2v-3H8l4-4.5z"})))
        };
        var Ti;

        function xi() {
            return xi = Object.assign ? Object.assign.bind() : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                    var n = arguments[t];
                    for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r])
                }
                return e
            }, xi.apply(null, arguments)
        }

        const Ii = function (t) {
                return e.createElement("svg", xi({
                    xmlns: "http://www.w3.org/2000/svg",
                    fill: "currentColor",
                    viewBox: "0 0 24 24"
                }, t), Ti || (Ti = e.createElement("path", {d: "M21 3H3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1m-9 13a3 3 0 0 1-3-3H4V5h16v8h-5a3 3 0 0 1-3 3m4-7h-3V6h-2v3H8l4 4.5z"})))
            }, Pi = (e, t) => {
                const n = document.createElement("a"), r = [];
                r.push(JSON.stringify(t));
                const a = window.URL.createObjectURL(new Blob(r, {type: "application/text"}));
                n.href = a, n.download = `nectarblocks_${e}_${Date.now()}.json`, document.body.append(n), n.click(), n.remove(), window.URL.revokeObjectURL(a)
            }, Ai = () => {
                const t = (0, r.useRef)(null), [n, a] = (0, r.useState)();
                return (0, e.createElement)("section", {className: `${Mi}__data-group`}, (0, e.createElement)("div", {className: `${Mi}__data-group__sections`}, (0, e.createElement)("div", null, (0, e.createElement)("h3", null, (0, oe.__)("Export", "nectar-blocks")), (0, e.createElement)("p", null, (0, oe.__)("Export all", "nectar-blocks"), " ", (0, e.createElement)("a", {
                    target: "_blank",
                    href: "https://docs.nectarblocks.com/global-settings/overview",
                    rel: "noreferrer"
                }, (0, oe.__)("Global Settings", "nectar-blocks")), " ", (0, oe.__)("from Nectarblocks.", "nectar-blocks")), (0, e.createElement)("p", null, (0, oe.__)("Global Settings are primarily located in the right-hand side of \n            of the editor when clicking on the Nectarblocks logo, and a few are \n            contained in this options panel.", "nectar-blocks")), (0, e.createElement)("p", null, (0, oe.__)("Your export will include the following data:", "nectar-blocks")), (0, e.createElement)("ol", null, (0, e.createElement)("li", null, (0, oe.__)("Global Colors", "nectar-blocks")), (0, e.createElement)("li", null, (0, oe.__)("Global Typography", "nectar-blocks")), (0, e.createElement)("li", null, (0, oe.__)("Global Custom Code", "nectar-blocks"))), (0, e.createElement)(de, {
                    variant: "primary",
                    icon: Ni,
                    stretch: !0,
                    onClick: async () => {
                        const e = await wi("plugin");
                        !1 !== e ? (Pi("plugin", e.data), P.success((0, oe.__)("Successfully exported plugin settings.", "nectar-blocks"))) : P.error((0, oe.__)("Failed to export plugin settings.", "nectar-blocks"))
                    }
                }, (0, oe.__)("Export", "nectar-blocks"))), (0, e.createElement)("div", null, (0, e.createElement)("h3", null, (0, oe.__)("Import", "nectar-blocks")), (0, e.createElement)("p", null, (0, oe.__)("Import a nectarblocks_plugin.json here to restore a \n            previously exported set of Global Settings.", "nectar-blocks")), (0, e.createElement)("input", {
                    id: "plugin-import-file",
                    name: "file",
                    type: "file",
                    accept: ".json",
                    required: !0,
                    onChange: function (e) {
                        const t = e.target;
                        a(t.files[0])
                    },
                    ref: t
                }), (0, e.createElement)(de, {
                    variant: "primary", stretch: !0, icon: Ii, onClick: async () => {
                        if (!n) return void P.error((0, oe.__)("Please select a file to import.", "nectar-blocks"));
                        const e = new FormData;
                        e.append("file", n), !0 === await _i("plugin", e) ? (P.success((0, oe.__)("Successfully imported plugin settings.", "nectar-blocks")), t?.current?.value && (t.current.value = ""), a(void 0)) : P.error((0, oe.__)("Failed to import plugin settings.", "nectar-blocks"))
                    }
                }, (0, oe.__)("Import", "nectar-blocks")))), (0, e.createElement)("img", {
                    src: "https://themenectar.com/demo-media/nectar-blocks/global-settings-preview.webp",
                    alt: (0, oe.__)("Nectarblocks Settings", "nectar-blocks")
                }))
            }, Ri = () => {
                const t = (0, r.useRef)(null), [n, a] = (0, r.useState)();
                return (0, e.createElement)("section", {className: `${Mi}__data-group`}, (0, e.createElement)("div", {className: `${Mi}__data-group__sections`}, (0, e.createElement)("div", null, (0, e.createElement)("h3", null, (0, oe.__)("Export", "nectar-blocks")), (0, e.createElement)("p", null, (0, oe.__)("Export all", "nectar-blocks"), " ", (0, e.createElement)("a", {
                    target: "_blank",
                    href: "https://docs.nectarblocks.com/category/customizer-options",
                    rel: "noreferrer"
                }, (0, oe.__)("Theme Customizer Settings", "nectar-blocks")), " ", (0, oe.__)("from Nectarblocks.", "nectar-blocks")), (0, e.createElement)("p", null, (0, oe.__)("Theme Customizer settings are available in the \n            WordPress Customizer (Appearance → Customize) and handle all\n            the general styling for the Nectarblocks theme.", "nectar-blocks")), (0, e.createElement)("p", null, (0, oe.__)("Your export will include the following data:", "nectar-blocks")), (0, e.createElement)("ol", null, (0, e.createElement)("li", null, (0, oe.__)("General Settings", "nectar-blocks")), (0, e.createElement)("li", null, (0, oe.__)("Typography Settings", "nectar-blocks")), (0, e.createElement)("li", null, (0, oe.__)("Layout Settings", "nectar-blocks")), (0, e.createElement)("li", null, (0, oe.__)("Post Types Settings", "nectar-blocks")), (0, e.createElement)("li", null, (0, oe.__)("General WordPress Page Settings", "nectar-blocks"))), (0, e.createElement)(de, {
                    variant: "primary",
                    stretch: !0,
                    onClick: async () => {
                        const e = await wi("theme");
                        !1 !== e ? (Pi("theme", e.data), P.success((0, oe.__)("Successfully exported customizer settings.", "nectar-blocks"))) : P.error((0, oe.__)("Failed to export customizer settings.", "nectar-blocks"))
                    }
                }, (0, oe.__)("Export", "nectar-blocks"))), (0, e.createElement)("div", null, (0, e.createElement)("h3", null, (0, oe.__)("Import", "nectar-blocks")), (0, e.createElement)("p", null, (0, oe.__)("Import a nectarblocks_theme.json here to restore a \n            previously exported set of Theme Customizer Settings.", "nectar-blocks")), (0, e.createElement)("input", {
                    id: "theme-import-file",
                    name: "file",
                    type: "file",
                    accept: ".json",
                    required: !0,
                    onChange: function (e) {
                        const t = e.target;
                        a(t.files[0])
                    },
                    ref: t
                }), (0, e.createElement)(de, {
                    variant: "primary", stretch: !0, onClick: async () => {
                        if (!n) return void P.error((0, oe.__)("Please select a file to import.", "nectar-blocks"));
                        const e = new FormData;
                        e.append("file", n), !0 === await _i("theme", e) ? (P.success((0, oe.__)("Successfully imported customizer settings.", "nectar-blocks")), t?.current?.value && (t.current.value = ""), a(void 0)) : P.error((0, oe.__)("Failed to import customizer settings.", "nectar-blocks"))
                    }
                }, (0, oe.__)("Import", "nectar-blocks")))), (0, e.createElement)("img", {
                    src: "https://themenectar.com/demo-media/nectar-blocks/customizer-settings-preview.webp",
                    alt: (0, oe.__)("Nectarblocks Theme Customizer Settings", "nectar-blocks")
                }))
            }, Mi = "nectar-import-export", zi = () => {
                const {isInitialized: t, auth: n} = (0, ae.useSelect)((e => {
                    const t = e(we).isInitialized(), {auth: n} = e(we).getOptions();
                    return {isInitialized: t, auth: n}
                }), []);
                if (!t) return (0, e.createElement)("div", {className: "nectar-admin-panel__tab"}, (0, e.createElement)(Fe, {className: "nectar-admin-panel__tab__loader"}));
                let r;
                return r = window.nectarblocks_env.NB_IE_VERSION ? n.isLicenseActive ? (0, e.createElement)(Si, null) : (0, e.createElement)("div", null, (0, oe.__)("Please authorize Nectarblocks with your license key to access the Demo Importer. That can be done in Authorization tab in the Admin Panel.", "nectar-blocks")) : (0, e.createElement)("div", null, (0, oe.__)("You must install the Nectarblocks Importer/Exporter plugin to access the Demo Importer.", "nectar-blocks")), (0, e.createElement)("div", {className: Mi}, (0, e.createElement)(gt, {defaultIndex: 0}, (0, e.createElement)(Et, null, (0, e.createElement)(Ot, null, (0, oe.__)("Demos", "nectar-blocks")), (0, e.createElement)(Ot, null, (0, oe.__)("Global Settings", "nectar-blocks")), window.nectarblocks_env.NB_THEME_VERSION && (0, e.createElement)(Ot, null, (0, oe.__)("Theme Customizer", "nectar-blocks"))), (0, e.createElement)(It, null, r), (0, e.createElement)(It, null, (0, e.createElement)(Ai, null)), window.nectarblocks_env.NB_THEME_VERSION && (0, e.createElement)(It, null, (0, e.createElement)(Ri, null))))
            }, Li = () => {
                const {isInitialized: t, pluginOptions: n} = (0, ae.useSelect)((e => {
                    const t = e(we).isInitialized(), {pluginOptions: n} = e(we).getOptions();
                    return {isInitialized: t, pluginOptions: n}
                }), []);
                return t ? (0, e.createElement)(e.Fragment, null, (0, e.createElement)("form", {className: "nectar-form"}, (0, e.createElement)($e, {
                    id: "default-hide-title",
                    title: (0, oe.__)("Hide Page Titles", "nectar-blocks"),
                    description: (0, oe.__)("Hide titles by default on all pages.", "nectar-blocks")
                }, (0, e.createElement)(Ue, {
                    id: "default-hide-title", onChange: e => {
                        (0, ae.dispatch)(we).updatePluginOptions({...n, shouldHideTitleDefault: e})
                    }, checked: n.shouldHideTitleDefault
                })), (0, e.createElement)($e, {
                    id: "disable-nectar-global-typography",
                    title: (0, oe.__)("Disable Core Typography Rules", "nectar-blocks"),
                    description: (0, e.createElement)(e.Fragment, null, (0, oe.__)("Disable the core ", "nectar-blocks"), (0, e.createElement)("a", {
                        href: "https://docs.nectarblocks.com/global-settings/typography",
                        target: "_blank",
                        rel: "noopener noreferrer"
                    }, (0, oe.__)("Global Typography", "nectar-blocks")), (0, oe.__)(" rules to allow your theme to control typography, rather than Nectarblocks.", "nectar-blocks"))
                }, (0, e.createElement)(Ue, {
                    id: "disable-nectar-global-typography", onChange: e => {
                        (0, ae.dispatch)(we).updatePluginOptions({...n, shouldDisableNectarGlobalTypography: e})
                    }, checked: n.shouldDisableNectarGlobalTypography
                })))) : (0, e.createElement)("div", {className: "nectar-admin-panel__tab"}, (0, e.createElement)(Fe, {className: "nectar-admin-panel__tab__loader"}))
            }, ji = ({currentTab: t}) => {
                const n = {
                    "getting-started": (0, e.createElement)(Vr, null),
                    authorization: (0, e.createElement)(We, null),
                    "plugin-options": (0, e.createElement)(Li, null),
                    "custom-code": (0, e.createElement)(In, null),
                    "custom-fonts": (0, e.createElement)($r, null),
                    "import-export": (0, e.createElement)(zi, null)
                };
                return (0, e.createElement)("div", {className: `${Re}__content`}, (0, e.createElement)(De, {currentTab: t}), (0, e.createElement)("div", {className: `${Re}__tab__content`}, n[t]))
            }, Di = ({
                         prettyName: t,
                         icon: n,
                         tabName: r,
                         setTab: a,
                         currentTab: o
                     }) => (0, e.createElement)("div", {
                className: ce()(`${Re}__side-bar__tab`, {[`${Re}__side-bar__tab--active`]: r === o}),
                onClick: () => a(r)
            }, (0, e.createElement)("span", null, n), (0, e.createElement)("span", null, t)),
            Fi = ({prettyName: t, icon: n, url: r}) => (0, e.createElement)("a", {
                href: r,
                target: "_blank",
                rel: "noopener noreferrer",
                className: `${Re}__side-bar__tab`
            }, (0, e.createElement)("span", null, n), (0, e.createElement)("span", null, t)), $i = ({
                                                                                                        setTab: t,
                                                                                                        currentTab: n
                                                                                                    }) => (0, e.createElement)("div", {className: `${Re}__side-bar`}, (0, e.createElement)("div", {className: `${Re}__side-bar__inner`}, sr()(Me).keys().map(((r, a) => (0, e.createElement)(Di, {
                key: a,
                prettyName: Me[r].i18n,
                icon: Me[r].icon,
                tabName: r,
                setTab: t,
                currentTab: n
            }))).value(), sr()(ze).keys().map(((t, n) => {
                var r;
                if (null === (r = ze[t].condition?.()) || void 0 === r || r) return (0, e.createElement)(Fi, {
                    key: n,
                    prettyName: ze[t].i18n,
                    icon: ze[t].icon,
                    url: ze[t].url
                })
            })).value()));
        ((e, t) => {
            const n = document.querySelector(e);
            n ? r.createRoot ? (0, r.createRoot)(n).render(t) : (0, r.render)(t, n) : console.warn(`${e} not found to render element`)
        })("#nectar-admin-panel", (0, e.createElement)((() => {
            var t;
            const [n, a] = function (e) {
                const [t, n] = (0, r.useState)((e => {
                    const t = new URLSearchParams(window.location.search), n = {};
                    return e.forEach((e => {
                        const r = t.get(e);
                        null !== r && (n[e] = r)
                    })), n
                })(e));
                return [t, t => {
                    const r = new URLSearchParams(window.location.search);
                    e.forEach((e => {
                        const n = t[e];
                        void 0 !== n ? r.set(e, n) : r.delete(e)
                    }));
                    const a = `${window.location.pathname}?${r.toString()}${window.location.hash}`;
                    window.history.replaceState(null, "", a), n(t)
                }]
            }(["tab"]), o = null !== (t = n.tab) && void 0 !== t ? t : "getting-started";
            return (0, e.createElement)(e.Fragment, null, (0, e.createElement)(te, {
                position: "bottom-center",
                toastOptions: {style: {background: "#000", padding: "16px", color: "#fff"}, duration: 4e3}
            }), (0, e.createElement)("div", {className: `${Re}__container`}, (0, e.createElement)($i, {
                currentTab: o,
                setTab: e => a({tab: e})
            }), (0, e.createElement)(ji, {currentTab: o})))
        }), null))
    })()
})();