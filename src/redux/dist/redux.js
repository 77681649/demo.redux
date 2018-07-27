(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === "object" && typeof module === "object")
    module.exports = factory();
  else if (typeof define === "function" && define.amd) define([], factory);
  else if (typeof exports === "object") exports["redux"] = factory();
  else root["redux"] = factory();
})(typeof window === "undefined" ? global : window, function() {
  return /******/ (function(modules) {
    // webpackBootstrap
    /******/ // The module cache
    /******/ var installedModules = {}; // The require function
    /******/
    /******/ /******/ function __webpack_require__(moduleId) {
      /******/
      /******/ // Check if module is in cache
      /******/ if (installedModules[moduleId]) {
        /******/ return installedModules[moduleId].exports;
        /******/
      } // Create a new module (and put it into the cache)
      /******/ /******/ var module = (installedModules[moduleId] = {
        /******/ i: moduleId,
        /******/ l: false,
        /******/ exports: {}
        /******/
      }); // Execute the module function
      /******/
      /******/ /******/ modules[moduleId].call(
        module.exports,
        module,
        module.exports,
        __webpack_require__
      ); // Flag the module as loaded
      /******/
      /******/ /******/ module.l = true; // Return the exports of the module
      /******/
      /******/ /******/ return module.exports;
      /******/
    } // expose the modules object (__webpack_modules__)
    /******/
    /******/
    /******/ /******/ __webpack_require__.m = modules; // expose the module cache
    /******/
    /******/ /******/ __webpack_require__.c = installedModules; // define getter function for harmony exports
    /******/
    /******/ /******/ __webpack_require__.d = function(exports, name, getter) {
      /******/ if (!__webpack_require__.o(exports, name)) {
        /******/ Object.defineProperty(exports, name, {
          enumerable: true,
          get: getter
        });
        /******/
      }
      /******/
    }; // define __esModule on exports
    /******/
    /******/ /******/ __webpack_require__.r = function(exports) {
      /******/ if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        /******/ Object.defineProperty(exports, Symbol.toStringTag, {
          value: "Module"
        });
        /******/
      }
      /******/ Object.defineProperty(exports, "__esModule", { value: true });
      /******/
    }; // create a fake namespace object // mode & 1: value is a module id, require it // mode & 2: merge all properties of value into the ns // mode & 4: return value when already ns object // mode & 8|1: behave like require
    /******/
    /******/ /******/ /******/ /******/ /******/ /******/ __webpack_require__.t = function(
      value,
      mode
    ) {
      /******/ if (mode & 1) value = __webpack_require__(value);
      /******/ if (mode & 8) return value;
      /******/ if (
        mode & 4 &&
        typeof value === "object" &&
        value &&
        value.__esModule
      )
        return value;
      /******/ var ns = Object.create(null);
      /******/ __webpack_require__.r(ns);
      /******/ Object.defineProperty(ns, "default", {
        enumerable: true,
        value: value
      });
      /******/ if (mode & 2 && typeof value != "string")
        for (var key in value)
          __webpack_require__.d(
            ns,
            key,
            function(key) {
              return value[key];
            }.bind(null, key)
          );
      /******/ return ns;
      /******/
    }; // getDefaultExport function for compatibility with non-harmony modules
    /******/
    /******/ /******/ __webpack_require__.n = function(module) {
      /******/ var getter =
        module && module.__esModule
          ? /******/ function getDefault() {
              return module["default"];
            }
          : /******/ function getModuleExports() {
              return module;
            };
      /******/ __webpack_require__.d(getter, "a", getter);
      /******/ return getter;
      /******/
    }; // Object.prototype.hasOwnProperty.call
    /******/
    /******/ /******/ __webpack_require__.o = function(object, property) {
      return Object.prototype.hasOwnProperty.call(object, property);
    }; // __webpack_public_path__
    /******/
    /******/ /******/ __webpack_require__.p = ""; // Load entry module and return exports
    /******/
    /******/
    /******/ /******/ return __webpack_require__(
      (__webpack_require__.s = "./src/index.js")
    );
    /******/
  })(
    /************************************************************************/
    /******/ {
      /***/ "../../../../../../../../usr/local/lib/node_modules/webpack/buildin/global.js":
        /*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            '\n\nvar _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };\n\nvar g;\n\n// This works in non-strict mode\ng = function () {\n\treturn this;\n}();\n\ntry {\n\t// This works if eval is allowed (see CSP)\n\tg = g || Function("return this")() || (1, eval)("this");\n} catch (e) {\n\t// This works if the window reference is available\n\tif ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object") g = window;\n}\n\n// g can still be undefined, but nothing to do about it...\n// We return undefined, instead of nothing here, so it\'s\n// easier to handle this case. if(!global) { ...}\n\nmodule.exports = g;\n\n//# sourceURL=webpack://redux/(webpack)/buildin/global.js?'
          );

          /***/
        },

      /***/ "../../../../../../../../usr/local/lib/node_modules/webpack/buildin/module.js":
        /*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            '\n\nmodule.exports = function (module) {\n\tif (!module.webpackPolyfill) {\n\t\tmodule.deprecate = function () {};\n\t\tmodule.paths = [];\n\t\t// module.parent = undefined by default\n\t\tif (!module.children) module.children = [];\n\t\tObject.defineProperty(module, "loaded", {\n\t\t\tenumerable: true,\n\t\t\tget: function get() {\n\t\t\t\treturn module.l;\n\t\t\t}\n\t\t});\n\t\tObject.defineProperty(module, "id", {\n\t\t\tenumerable: true,\n\t\t\tget: function get() {\n\t\t\t\treturn module.i;\n\t\t\t}\n\t\t});\n\t\tmodule.webpackPolyfill = 1;\n\t}\n\treturn module;\n};\n\n//# sourceURL=webpack://redux/(webpack)/buildin/module.js?'
          );

          /***/
        },

      /***/ "./node_modules/lodash/_Symbol.js":
        /*!****************************************!*\
  !*** ./node_modules/lodash/_Symbol.js ***!
  \****************************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            '\n\nvar root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");\n\n/** Built-in value references. */\nvar _Symbol = root.Symbol;\n\nmodule.exports = _Symbol;\n\n//# sourceURL=webpack://redux/./node_modules/lodash/_Symbol.js?'
          );

          /***/
        },

      /***/ "./node_modules/lodash/_baseGetTag.js":
        /*!********************************************!*\
  !*** ./node_modules/lodash/_baseGetTag.js ***!
  \********************************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            '\n\nvar _Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"),\n    getRawTag = __webpack_require__(/*! ./_getRawTag */ "./node_modules/lodash/_getRawTag.js"),\n    objectToString = __webpack_require__(/*! ./_objectToString */ "./node_modules/lodash/_objectToString.js");\n\n/** `Object#toString` result references. */\nvar nullTag = \'[object Null]\',\n    undefinedTag = \'[object Undefined]\';\n\n/** Built-in value references. */\nvar symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;\n\n/**\n * The base implementation of `getTag` without fallbacks for buggy environments.\n *\n * @private\n * @param {*} value The value to query.\n * @returns {string} Returns the `toStringTag`.\n */\nfunction baseGetTag(value) {\n    if (value == null) {\n        return value === undefined ? undefinedTag : nullTag;\n    }\n    return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);\n}\n\nmodule.exports = baseGetTag;\n\n//# sourceURL=webpack://redux/./node_modules/lodash/_baseGetTag.js?'
          );

          /***/
        },

      /***/ "./node_modules/lodash/_freeGlobal.js":
        /*!********************************************!*\
  !*** ./node_modules/lodash/_freeGlobal.js ***!
  \********************************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            '/* WEBPACK VAR INJECTION */(function(global) {\n\nvar _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };\n\n/** Detect free variable `global` from Node.js. */\nvar freeGlobal = (typeof global === \'undefined\' ? \'undefined\' : _typeof(global)) == \'object\' && global && global.Object === Object && global;\n\nmodule.exports = freeGlobal;\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../../../../../../../usr/local/lib/node_modules/webpack/buildin/global.js */ "../../../../../../../../usr/local/lib/node_modules/webpack/buildin/global.js")))\n\n//# sourceURL=webpack://redux/./node_modules/lodash/_freeGlobal.js?'
          );

          /***/
        },

      /***/ "./node_modules/lodash/_getPrototype.js":
        /*!**********************************************!*\
  !*** ./node_modules/lodash/_getPrototype.js ***!
  \**********************************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            '\n\nvar overArg = __webpack_require__(/*! ./_overArg */ "./node_modules/lodash/_overArg.js");\n\n/** Built-in value references. */\nvar getPrototype = overArg(Object.getPrototypeOf, Object);\n\nmodule.exports = getPrototype;\n\n//# sourceURL=webpack://redux/./node_modules/lodash/_getPrototype.js?'
          );

          /***/
        },

      /***/ "./node_modules/lodash/_getRawTag.js":
        /*!*******************************************!*\
  !*** ./node_modules/lodash/_getRawTag.js ***!
  \*******************************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            '\n\nvar _Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js");\n\n/** Used for built-in method references. */\nvar objectProto = Object.prototype;\n\n/** Used to check objects for own properties. */\nvar hasOwnProperty = objectProto.hasOwnProperty;\n\n/**\n * Used to resolve the\n * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)\n * of values.\n */\nvar nativeObjectToString = objectProto.toString;\n\n/** Built-in value references. */\nvar symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;\n\n/**\n * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.\n *\n * @private\n * @param {*} value The value to query.\n * @returns {string} Returns the raw `toStringTag`.\n */\nfunction getRawTag(value) {\n  var isOwn = hasOwnProperty.call(value, symToStringTag),\n      tag = value[symToStringTag];\n\n  try {\n    value[symToStringTag] = undefined;\n    var unmasked = true;\n  } catch (e) {}\n\n  var result = nativeObjectToString.call(value);\n  if (unmasked) {\n    if (isOwn) {\n      value[symToStringTag] = tag;\n    } else {\n      delete value[symToStringTag];\n    }\n  }\n  return result;\n}\n\nmodule.exports = getRawTag;\n\n//# sourceURL=webpack://redux/./node_modules/lodash/_getRawTag.js?'
          );

          /***/
        },

      /***/ "./node_modules/lodash/_objectToString.js":
        /*!************************************************!*\
  !*** ./node_modules/lodash/_objectToString.js ***!
  \************************************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            "\n\n/** Used for built-in method references. */\nvar objectProto = Object.prototype;\n\n/**\n * Used to resolve the\n * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)\n * of values.\n */\nvar nativeObjectToString = objectProto.toString;\n\n/**\n * Converts `value` to a string using `Object.prototype.toString`.\n *\n * @private\n * @param {*} value The value to convert.\n * @returns {string} Returns the converted string.\n */\nfunction objectToString(value) {\n  return nativeObjectToString.call(value);\n}\n\nmodule.exports = objectToString;\n\n//# sourceURL=webpack://redux/./node_modules/lodash/_objectToString.js?"
          );

          /***/
        },

      /***/ "./node_modules/lodash/_overArg.js":
        /*!*****************************************!*\
  !*** ./node_modules/lodash/_overArg.js ***!
  \*****************************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            "\n\n/**\n * Creates a unary function that invokes `func` with its argument transformed.\n *\n * @private\n * @param {Function} func The function to wrap.\n * @param {Function} transform The argument transform.\n * @returns {Function} Returns the new function.\n */\nfunction overArg(func, transform) {\n  return function (arg) {\n    return func(transform(arg));\n  };\n}\n\nmodule.exports = overArg;\n\n//# sourceURL=webpack://redux/./node_modules/lodash/_overArg.js?"
          );

          /***/
        },

      /***/ "./node_modules/lodash/_root.js":
        /*!**************************************!*\
  !*** ./node_modules/lodash/_root.js ***!
  \**************************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            '\n\nvar _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };\n\nvar freeGlobal = __webpack_require__(/*! ./_freeGlobal */ "./node_modules/lodash/_freeGlobal.js");\n\n/** Detect free variable `self`. */\nvar freeSelf = (typeof self === \'undefined\' ? \'undefined\' : _typeof(self)) == \'object\' && self && self.Object === Object && self;\n\n/** Used as a reference to the global object. */\nvar root = freeGlobal || freeSelf || Function(\'return this\')();\n\nmodule.exports = root;\n\n//# sourceURL=webpack://redux/./node_modules/lodash/_root.js?'
          );

          /***/
        },

      /***/ "./node_modules/lodash/isObjectLike.js":
        /*!*********************************************!*\
  !*** ./node_modules/lodash/isObjectLike.js ***!
  \*********************************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            '\n\nvar _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };\n\n/**\n * Checks if `value` is object-like. A value is object-like if it\'s not `null`\n * and has a `typeof` result of "object".\n *\n * @static\n * @memberOf _\n * @since 4.0.0\n * @category Lang\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is object-like, else `false`.\n * @example\n *\n * _.isObjectLike({});\n * // => true\n *\n * _.isObjectLike([1, 2, 3]);\n * // => true\n *\n * _.isObjectLike(_.noop);\n * // => false\n *\n * _.isObjectLike(null);\n * // => false\n */\nfunction isObjectLike(value) {\n  return value != null && (typeof value === \'undefined\' ? \'undefined\' : _typeof(value)) == \'object\';\n}\n\nmodule.exports = isObjectLike;\n\n//# sourceURL=webpack://redux/./node_modules/lodash/isObjectLike.js?'
          );

          /***/
        },

      /***/ "./node_modules/lodash/isPlainObject.js":
        /*!**********************************************!*\
  !*** ./node_modules/lodash/isPlainObject.js ***!
  \**********************************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            "\n\nvar baseGetTag = __webpack_require__(/*! ./_baseGetTag */ \"./node_modules/lodash/_baseGetTag.js\"),\n    getPrototype = __webpack_require__(/*! ./_getPrototype */ \"./node_modules/lodash/_getPrototype.js\"),\n    isObjectLike = __webpack_require__(/*! ./isObjectLike */ \"./node_modules/lodash/isObjectLike.js\");\n\n/** `Object#toString` result references. */\nvar objectTag = '[object Object]';\n\n/** Used for built-in method references. */\nvar funcProto = Function.prototype,\n    objectProto = Object.prototype;\n\n/** Used to resolve the decompiled source of functions. */\nvar funcToString = funcProto.toString;\n\n/** Used to check objects for own properties. */\nvar hasOwnProperty = objectProto.hasOwnProperty;\n\n/** Used to infer the `Object` constructor. */\nvar objectCtorString = funcToString.call(Object);\n\n/**\n * Checks if `value` is a plain object, that is, an object created by the\n * `Object` constructor or one with a `[[Prototype]]` of `null`.\n *\n * @static\n * @memberOf _\n * @since 0.8.0\n * @category Lang\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.\n * @example\n *\n * function Foo() {\n *   this.a = 1;\n * }\n *\n * _.isPlainObject(new Foo);\n * // => false\n *\n * _.isPlainObject([1, 2, 3]);\n * // => false\n *\n * _.isPlainObject({ 'x': 0, 'y': 0 });\n * // => true\n *\n * _.isPlainObject(Object.create(null));\n * // => true\n */\nfunction isPlainObject(value) {\n  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {\n    return false;\n  }\n  var proto = getPrototype(value);\n  if (proto === null) {\n    return true;\n  }\n  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;\n  return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;\n}\n\nmodule.exports = isPlainObject;\n\n//# sourceURL=webpack://redux/./node_modules/lodash/isPlainObject.js?"
          );

          /***/
        },

      /***/ "./node_modules/symbol-observable/es/index.js":
        /*!****************************************************!*\
  !*** ./node_modules/symbol-observable/es/index.js ***!
  \****************************************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            '/* WEBPACK VAR INJECTION */(function(global, module) {\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\n\nvar _ponyfill = __webpack_require__(/*! ./ponyfill.js */ "./node_modules/symbol-observable/es/ponyfill.js");\n\nvar _ponyfill2 = _interopRequireDefault(_ponyfill);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nvar root; /* global window */\n\n\nif (typeof self !== \'undefined\') {\n  root = self;\n} else if (typeof window !== \'undefined\') {\n  root = window;\n} else if (typeof global !== \'undefined\') {\n  root = global;\n} else if (true) {\n  root = module;\n} else {}\n\nvar result = (0, _ponyfill2.default)(root);\nexports.default = result;\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../../../../../../../../usr/local/lib/node_modules/webpack/buildin/global.js */ "../../../../../../../../usr/local/lib/node_modules/webpack/buildin/global.js"), __webpack_require__(/*! ./../../../../../../../../../../../usr/local/lib/node_modules/webpack/buildin/module.js */ "../../../../../../../../usr/local/lib/node_modules/webpack/buildin/module.js")(module)))\n\n//# sourceURL=webpack://redux/./node_modules/symbol-observable/es/index.js?'
          );

          /***/
        },

      /***/ "./node_modules/symbol-observable/es/ponyfill.js":
        /*!*******************************************************!*\
  !*** ./node_modules/symbol-observable/es/ponyfill.js ***!
  \*******************************************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            "\n\nObject.defineProperty(exports, \"__esModule\", {\n\tvalue: true\n});\nexports.default = symbolObservablePonyfill;\nfunction symbolObservablePonyfill(root) {\n\tvar result;\n\tvar _Symbol = root.Symbol;\n\n\tif (typeof _Symbol === 'function') {\n\t\tif (_Symbol.observable) {\n\t\t\tresult = _Symbol.observable;\n\t\t} else {\n\t\t\tresult = _Symbol('observable');\n\t\t\t_Symbol.observable = result;\n\t\t}\n\t} else {\n\t\tresult = '@@observable';\n\t}\n\n\treturn result;\n};\n\n//# sourceURL=webpack://redux/./node_modules/symbol-observable/es/ponyfill.js?"
          );

          /***/
        },

      /***/ "./src/applyMiddleware.js":
        /*!********************************!*\
  !*** ./src/applyMiddleware.js ***!
  \********************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            '\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\n\nvar _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };\n\nexports.default = applyMiddleware;\n\nvar _compose = __webpack_require__(/*! ./compose */ "./src/compose.js");\n\nvar _compose2 = _interopRequireDefault(_compose);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }\n\n/**\n * Creates a store enhancer that applies middleware to the dispatch method\n * of the Redux store. This is handy for a variety of tasks, such as expressing\n * asynchronous actions in a concise manner, or logging every action payload.\n *\n * See `redux-thunk` package as an example of the Redux middleware.\n *\n * Because middleware is potentially asynchronous, this should be the first\n * store enhancer in the composition chain.\n *\n * Note that each middleware will be given the `dispatch` and `getState` functions\n * as named arguments.\n *\n * @param {...Function} middlewares The middleware chain to be applied.\n * @returns {Function} A store enhancer applying the middleware.\n */\nfunction applyMiddleware() {\n  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {\n    middlewares[_key] = arguments[_key];\n  }\n\n  return function (createStore) {\n    return function (reducer, preloadedState, enhancer) {\n      var store = createStore(reducer, preloadedState, enhancer);\n      var _dispatch = store.dispatch;\n      var chain = [];\n\n      var middlewareAPI = {\n        getState: store.getState,\n        dispatch: function dispatch(action) {\n          return _dispatch(action);\n        }\n      };\n      chain = middlewares.map(function (middleware) {\n        return middleware(middlewareAPI);\n      });\n      _dispatch = _compose2.default.apply(undefined, _toConsumableArray(chain))(store.dispatch);\n\n      return _extends({}, store, {\n        dispatch: _dispatch\n      });\n    };\n  };\n}\n\n//# sourceURL=webpack://redux/./src/applyMiddleware.js?'
          );

          /***/
        },

      /***/ "./src/bindActionCreators.js":
        /*!***********************************!*\
  !*** ./src/bindActionCreators.js ***!
  \***********************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            "\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _typeof = typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; };\n\nexports.default = bindActionCreators;\nfunction bindActionCreator(actionCreator, dispatch) {\n  return function () {\n    return dispatch(actionCreator.apply(undefined, arguments));\n  };\n}\n\n/**\n * Turns an object whose values are action creators, into an object with the\n * same keys, but with every function wrapped into a `dispatch` call so they\n * may be invoked directly. This is just a convenience method, as you can call\n * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.\n *\n * For convenience, you can also pass a single function as the first argument,\n * and get a function in return.\n *\n * @param {Function|Object} actionCreators An object whose values are action\n * creator functions. One handy way to obtain it is to use ES6 `import * as`\n * syntax. You may also pass a single function.\n *\n * @param {Function} dispatch The `dispatch` function available on your Redux\n * store.\n *\n * @returns {Function|Object} The object mimicking the original object, but with\n * every action creator wrapped into the `dispatch` call. If you passed a\n * function as `actionCreators`, the return value will also be a single\n * function.\n */\nfunction bindActionCreators(actionCreators, dispatch) {\n  if (typeof actionCreators === 'function') {\n    return bindActionCreator(actionCreators, dispatch);\n  }\n\n  if ((typeof actionCreators === 'undefined' ? 'undefined' : _typeof(actionCreators)) !== 'object' || actionCreators === null) {\n    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators === 'undefined' ? 'undefined' : _typeof(actionCreators)) + '. ' + 'Did you write \"import ActionCreators from\" instead of \"import * as ActionCreators from\"?');\n  }\n\n  var keys = Object.keys(actionCreators);\n  var boundActionCreators = {};\n  for (var i = 0; i < keys.length; i++) {\n    var key = keys[i];\n    var actionCreator = actionCreators[key];\n    if (typeof actionCreator === 'function') {\n      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);\n    }\n  }\n  return boundActionCreators;\n}\n\n//# sourceURL=webpack://redux/./src/bindActionCreators.js?"
          );

          /***/
        },

      /***/ "./src/combineReducers.js":
        /*!********************************!*\
  !*** ./src/combineReducers.js ***!
  \********************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            "\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = combineReducers;\n\nvar _createStore = __webpack_require__(/*! ./createStore */ \"./src/createStore.js\");\n\nvar _isPlainObject = __webpack_require__(/*! lodash/isPlainObject */ \"./node_modules/lodash/isPlainObject.js\");\n\nvar _isPlainObject2 = _interopRequireDefault(_isPlainObject);\n\nvar _warning = __webpack_require__(/*! ./utils/warning */ \"./src/utils/warning.js\");\n\nvar _warning2 = _interopRequireDefault(_warning);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction getUndefinedStateErrorMessage(key, action) {\n  var actionType = action && action.type;\n  var actionName = actionType && '\"' + actionType.toString() + '\"' || 'an action';\n\n  return 'Given action ' + actionName + ', reducer \"' + key + '\" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state.';\n}\n\nfunction getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {\n  var reducerKeys = Object.keys(reducers);\n  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';\n\n  if (reducerKeys.length === 0) {\n    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';\n  }\n\n  if (!(0, _isPlainObject2.default)(inputState)) {\n    return 'The ' + argumentName + ' has unexpected type of \"' + {}.toString.call(inputState).match(/\\s([a-z|A-Z]+)/)[1] + '\". Expected argument to be an object with the following ' + ('keys: \"' + reducerKeys.join('\", \"') + '\"');\n  }\n\n  var unexpectedKeys = Object.keys(inputState).filter(function (key) {\n    return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];\n  });\n\n  unexpectedKeys.forEach(function (key) {\n    unexpectedKeyCache[key] = true;\n  });\n\n  if (unexpectedKeys.length > 0) {\n    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('\"' + unexpectedKeys.join('\", \"') + '\" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('\"' + reducerKeys.join('\", \"') + '\". Unexpected keys will be ignored.');\n  }\n}\n\nfunction assertReducerSanity(reducers) {\n  Object.keys(reducers).forEach(function (key) {\n    var reducer = reducers[key];\n    var initialState = reducer(undefined, { type: _createStore.ActionTypes.INIT });\n\n    if (typeof initialState === 'undefined') {\n      throw new Error('Reducer \"' + key + '\" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');\n    }\n\n    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');\n    if (typeof reducer(undefined, { type: type }) === 'undefined') {\n      throw new Error('Reducer \"' + key + '\" returned undefined when probed with a random type. ' + ('Don\\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in \"redux/*\" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');\n    }\n  });\n}\n\n/**\n * Turns an object whose values are different reducer functions, into a single\n * reducer function. It will call every child reducer, and gather their results\n * into a single state object, whose keys correspond to the keys of the passed\n * reducer functions.\n *\n * @param {Object} reducers An object whose values correspond to different\n * reducer functions that need to be combined into one. One handy way to obtain\n * it is to use ES6 `import * as reducers` syntax. The reducers may never return\n * undefined for any action. Instead, they should return their initial state\n * if the state passed to them was undefined, and the current state for any\n * unrecognized action.\n *\n * @returns {Function} A reducer function that invokes every reducer inside the\n * passed object, and builds a state object with the same shape.\n */\nfunction combineReducers(reducers) {\n  var reducerKeys = Object.keys(reducers);\n  var finalReducers = {};\n  for (var i = 0; i < reducerKeys.length; i++) {\n    var key = reducerKeys[i];\n\n    if (true) {\n      if (typeof reducers[key] === 'undefined') {\n        (0, _warning2.default)('No reducer provided for key \"' + key + '\"');\n      }\n    }\n\n    if (typeof reducers[key] === 'function') {\n      finalReducers[key] = reducers[key];\n    }\n  }\n  var finalReducerKeys = Object.keys(finalReducers);\n\n  if (true) {\n    var unexpectedKeyCache = {};\n  }\n\n  var sanityError;\n  try {\n    assertReducerSanity(finalReducers);\n  } catch (e) {\n    sanityError = e;\n  }\n\n  return function combination() {\n    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};\n    var action = arguments[1];\n\n    if (sanityError) {\n      throw sanityError;\n    }\n\n    if (true) {\n      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);\n      if (warningMessage) {\n        (0, _warning2.default)(warningMessage);\n      }\n    }\n\n    var hasChanged = false;\n    var nextState = {};\n    for (var i = 0; i < finalReducerKeys.length; i++) {\n      var key = finalReducerKeys[i];\n      var reducer = finalReducers[key];\n      var previousStateForKey = state[key];\n      var nextStateForKey = reducer(previousStateForKey, action);\n      if (typeof nextStateForKey === 'undefined') {\n        var errorMessage = getUndefinedStateErrorMessage(key, action);\n        throw new Error(errorMessage);\n      }\n      nextState[key] = nextStateForKey;\n      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;\n    }\n    return hasChanged ? nextState : state;\n  };\n}\n\n//# sourceURL=webpack://redux/./src/combineReducers.js?"
          );

          /***/
        },

      /***/ "./src/compose.js":
        /*!************************!*\
  !*** ./src/compose.js ***!
  \************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            "\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = compose;\n/**\n * Composes single-argument functions from right to left. The rightmost\n * function can take multiple arguments as it provides the signature for\n * the resulting composite function.\n *\n * @example\n * let fn1 = ()=>console.log('1');\n * let fn2 = ()=>console.log('2');\n * let fn2 = ()=>console.log('3');\n *\n * // 3\n * // 2\n * // 1\n * let composed = compose(fn1,fn2,fn3);\n * composed();\n *\n * @param {...Function} funcs The functions to compose.\n * @returns {Function} A function obtained by composing the argument functions\n * from right to left. For example, compose(f, g, h) is identical to doing\n * (...args) => f(g(h(...args))).\n */\nfunction compose() {\n  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {\n    funcs[_key] = arguments[_key];\n  }\n\n  // 返回一个identity函数\n  if (funcs.length === 0) {\n    return function (arg) {\n      return arg;\n    };\n  }\n\n  // 直接返回\n  if (funcs.length === 1) {\n    return funcs[0];\n  }\n\n  var last = funcs[funcs.length - 1];\n  var rest = funcs.slice(0, -1);\n  return function () {\n    return rest.reduceRight(function (composed, f) {\n      return f(composed);\n    }, last.apply(undefined, arguments));\n  };\n}\n\n//# sourceURL=webpack://redux/./src/compose.js?"
          );

          /***/
        },

      /***/ "./src/createStore.js":
        /*!****************************!*\
  !*** ./src/createStore.js ***!
  \****************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            "\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.ActionTypes = undefined;\n\nvar _typeof = typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; };\n\nexports.default = createStore;\n\nvar _isPlainObject = __webpack_require__(/*! lodash/isPlainObject */ \"./node_modules/lodash/isPlainObject.js\");\n\nvar _isPlainObject2 = _interopRequireDefault(_isPlainObject);\n\nvar _symbolObservable = __webpack_require__(/*! symbol-observable */ \"./node_modules/symbol-observable/es/index.js\");\n\nvar _symbolObservable2 = _interopRequireDefault(_symbolObservable);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n/**\n * These are private action types reserved by Redux.\n * For any unknown actions, you must return the current state.\n * If the current state is undefined, you must return the initial state.\n * Do not reference these action types directly in your code.\n */\nvar ActionTypes = exports.ActionTypes = {\n  INIT: '@@redux/INIT'\n\n  /**\n   * Creates a Redux store that holds the state tree.\n   * The only way to change the data in the store is to call `dispatch()` on it.\n   *\n   * There should only be a single store in your app. To specify how different\n   * parts of the state tree respond to actions, you may combine several reducers\n   * into a single reducer function by using `combineReducers`.\n   *\n   * @param {Function} reducer A function that returns the next state tree, given\n   * the current state tree and the action to handle.\n   *\n   * @param {any} [preloadedState] The initial state. You may optionally specify it\n   * to hydrate the state from the server in universal apps, or to restore a\n   * previously serialized user session.\n   * If you use `combineReducers` to produce the root reducer function, this must be\n   * an object with the same shape as `combineReducers` keys.\n   *\n   * @param {Function} enhancer The store enhancer. You may optionally specify it\n   * to enhance the store with third-party capabilities such as middleware,\n   * time travel, persistence, etc. The only store enhancer that ships with Redux\n   * is `applyMiddleware()`.\n   *\n   * @returns {Store} A Redux store that lets you read the state, dispatch actions\n   * and subscribe to changes.\n   */\n};function createStore(reducer, preloadedState, enhancer) {\n  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {\n    enhancer = preloadedState;\n    preloadedState = undefined;\n  }\n\n  if (typeof enhancer !== 'undefined') {\n    if (typeof enhancer !== 'function') {\n      throw new Error('Expected the enhancer to be a function.');\n    }\n\n    return enhancer(createStore)(reducer, preloadedState);\n  }\n\n  if (typeof reducer !== 'function') {\n    throw new Error('Expected the reducer to be a function.');\n  }\n\n  var currentReducer = reducer;\n  var currentState = preloadedState;\n  var currentListeners = [];\n  var nextListeners = currentListeners;\n  var isDispatching = false;\n\n  function ensureCanMutateNextListeners() {\n    if (nextListeners === currentListeners) {\n      nextListeners = currentListeners.slice();\n    }\n  }\n\n  /**\n   * Reads the state tree managed by the store.\n   *\n   * @returns {any} The current state tree of your application.\n   */\n  function getState() {\n    return currentState;\n  }\n\n  /**\n   * Adds a change listener. It will be called any time an action is dispatched,\n   * and some part of the state tree may potentially have changed. You may then\n   * call `getState()` to read the current state tree inside the callback.\n   *\n   * You may call `dispatch()` from a change listener, with the following\n   * caveats:\n   *\n   * 1. The subscriptions are snapshotted just before every `dispatch()` call.\n   * If you subscribe or unsubscribe while the listeners are being invoked, this\n   * will not have any effect on the `dispatch()` that is currently in progress.\n   * However, the next `dispatch()` call, whether nested or not, will use a more\n   * recent snapshot of the subscription list.\n   *\n   * 2. The listener should not expect to see all state changes, as the state\n   * might have been updated multiple times during a nested `dispatch()` before\n   * the listener is called. It is, however, guaranteed that all subscribers\n   * registered before the `dispatch()` started will be called with the latest\n   * state by the time it exits.\n   *\n   * @param {Function} listener A callback to be invoked on every dispatch.\n   * @returns {Function} A function to remove this change listener.\n   */\n  function subscribe(listener) {\n    if (typeof listener !== 'function') {\n      throw new Error('Expected listener to be a function.');\n    }\n\n    var isSubscribed = true;\n\n    ensureCanMutateNextListeners();\n    nextListeners.push(listener);\n\n    return function unsubscribe() {\n      if (!isSubscribed) {\n        return;\n      }\n\n      isSubscribed = false;\n\n      ensureCanMutateNextListeners();\n      var index = nextListeners.indexOf(listener);\n      nextListeners.splice(index, 1);\n    };\n  }\n\n  /**\n   * Dispatches an action. It is the only way to trigger a state change.\n   *\n   * The `reducer` function, used to create the store, will be called with the\n   * current state tree and the given `action`. Its return value will\n   * be considered the **next** state of the tree, and the change listeners\n   * will be notified.\n   *\n   * The base implementation only supports plain object actions. If you want to\n   * dispatch a Promise, an Observable, a thunk, or something else, you need to\n   * wrap your store creating function into the corresponding middleware. For\n   * example, see the documentation for the `redux-thunk` package. Even the\n   * middleware will eventually dispatch plain object actions using this method.\n   *\n   * @param {Object} action A plain object representing “what changed”. It is\n   * a good idea to keep actions serializable so you can record and replay user\n   * sessions, or use the time travelling `redux-devtools`. An action must have\n   * a `type` property which may not be `undefined`. It is a good idea to use\n   * string constants for action types.\n   *\n   * @returns {Object} For convenience, the same action object you dispatched.\n   *\n   * Note that, if you use a custom middleware, it may wrap `dispatch()` to\n   * return something else (for example, a Promise you can await).\n   */\n  function dispatch(action) {\n    if (!(0, _isPlainObject2.default)(action)) {\n      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');\n    }\n\n    if (typeof action.type === 'undefined') {\n      throw new Error('Actions may not have an undefined \"type\" property. ' + 'Have you misspelled a constant?');\n    }\n\n    if (isDispatching) {\n      throw new Error('Reducers may not dispatch actions.');\n    }\n\n    try {\n      isDispatching = true;\n      currentState = currentReducer(currentState, action);\n    } finally {\n      isDispatching = false;\n    }\n\n    var listeners = currentListeners = nextListeners;\n    for (var i = 0; i < listeners.length; i++) {\n      listeners[i]();\n    }\n\n    return action;\n  }\n\n  /**\n   * Replaces the reducer currently used by the store to calculate the state.\n   *\n   * You might need this if your app implements code splitting and you want to\n   * load some of the reducers dynamically. You might also need this if you\n   * implement a hot reloading mechanism for Redux.\n   *\n   * @param {Function} nextReducer The reducer for the store to use instead.\n   * @returns {void}\n   */\n  function replaceReducer(nextReducer) {\n    if (typeof nextReducer !== 'function') {\n      throw new Error('Expected the nextReducer to be a function.');\n    }\n\n    currentReducer = nextReducer;\n    dispatch({ type: ActionTypes.INIT });\n  }\n\n  /**\n   * Interoperability point for observable/reactive libraries.\n   * @returns {observable} A minimal observable of state changes.\n   * For more information, see the observable proposal:\n   * https://github.com/zenparsing/es-observable\n   */\n  function observable() {\n    var outerSubscribe = subscribe;\n    return _defineProperty({\n      /**\n       * The minimal observable subscription method.\n       * @param {Object} observer Any object that can be used as an observer.\n       * The observer object should have a `next` method.\n       * @returns {subscription} An object with an `unsubscribe` method that can\n       * be used to unsubscribe the observable from the store, and prevent further\n       * emission of values from the observable.\n       */\n      subscribe: function subscribe(observer) {\n        if ((typeof observer === 'undefined' ? 'undefined' : _typeof(observer)) !== 'object') {\n          throw new TypeError('Expected the observer to be an object.');\n        }\n\n        function observeState() {\n          if (observer.next) {\n            observer.next(getState());\n          }\n        }\n\n        observeState();\n        var unsubscribe = outerSubscribe(observeState);\n        return { unsubscribe: unsubscribe };\n      }\n    }, _symbolObservable2.default, function () {\n      return this;\n    });\n  }\n\n  // When a store is created, an \"INIT\" action is dispatched so that every\n  // reducer returns their initial state. This effectively populates\n  // the initial state tree.\n  dispatch({ type: ActionTypes.INIT });\n\n  return _defineProperty({\n    dispatch: dispatch,\n    subscribe: subscribe,\n    getState: getState,\n    replaceReducer: replaceReducer\n  }, _symbolObservable2.default, observable);\n}\n\n//# sourceURL=webpack://redux/./src/createStore.js?"
          );

          /***/
        },

      /***/ "./src/index.js":
        /*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            "\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineReducers = exports.createStore = undefined;\n\nvar _createStore = __webpack_require__(/*! ./createStore */ \"./src/createStore.js\");\n\nvar _createStore2 = _interopRequireDefault(_createStore);\n\nvar _combineReducers = __webpack_require__(/*! ./combineReducers */ \"./src/combineReducers.js\");\n\nvar _combineReducers2 = _interopRequireDefault(_combineReducers);\n\nvar _bindActionCreators = __webpack_require__(/*! ./bindActionCreators */ \"./src/bindActionCreators.js\");\n\nvar _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);\n\nvar _applyMiddleware = __webpack_require__(/*! ./applyMiddleware */ \"./src/applyMiddleware.js\");\n\nvar _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);\n\nvar _compose = __webpack_require__(/*! ./compose */ \"./src/compose.js\");\n\nvar _compose2 = _interopRequireDefault(_compose);\n\nvar _warning = __webpack_require__(/*! ./utils/warning */ \"./src/utils/warning.js\");\n\nvar _warning2 = _interopRequireDefault(_warning);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\n/*\n* This is a dummy function to check if the function name has been altered by minification.\n* If the function has been minified and NODE_ENV !== 'production', warn the user.\n*/\nfunction isCrushed() {}\n\nif (\"development\" !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {\n  (0, _warning2.default)('You are currently using minified code outside of NODE_ENV === \\'production\\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');\n}\n\nexports.createStore = _createStore2.default;\nexports.combineReducers = _combineReducers2.default;\nexports.bindActionCreators = _bindActionCreators2.default;\nexports.applyMiddleware = _applyMiddleware2.default;\nexports.compose = _compose2.default;\n\n//# sourceURL=webpack://redux/./src/index.js?"
          );

          /***/
        },

      /***/ "./src/utils/warning.js":
        /*!******************************!*\
  !*** ./src/utils/warning.js ***!
  \******************************/
        /*! no static exports found */
        /***/ function(module, exports, __webpack_require__) {
          "use strict";
          eval(
            "\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = warning;\n/**\n * Prints a warning in the console if it exists.\n *\n * @param {String} message The warning message.\n * @returns {void}\n */\nfunction warning(message) {\n  /* eslint-disable no-console */\n  if (typeof console !== 'undefined' && typeof console.error === 'function') {\n    console.error(message);\n  }\n  /* eslint-enable no-console */\n  try {\n    // This error was thrown as a convenience so that if you enable\n    // \"break on all exceptions\" in your console,\n    // it would pause the execution at this line.\n    throw new Error(message);\n    /* eslint-disable no-empty */\n  } catch (e) {}\n  /* eslint-enable no-empty */\n}\n\n//# sourceURL=webpack://redux/./src/utils/warning.js?"
          );

          /***/
        }

      /******/
    }
  );
});
