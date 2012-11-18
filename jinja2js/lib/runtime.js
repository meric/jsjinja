// Generated by CoffeeScript 1.4.0
(function() {
  __hasProp = {}.hasOwnProperty,
__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
;

  var Context, Jinja2, Set, Template, new_context, root,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  new_context = function(template_name, blocks, vars, shared, globals, locals) {
    var parent;
    vars = vars || {};
    parent = (shared ? vars : globals);
    return new Context(parent, template_name, blocks);
  };

  Set = (function() {

    function Set() {}

    Set.prototype.add = function(o) {
      return this[o] = true;
    };

    Set.prototype.remove = function(o) {
      return delete this[o];
    };

    return Set;

  })();

  Template = (function() {

    function Template() {
      var key;
      this.blocks = {};
      for (key in this) {
        if (key.indexOf('block_') === 0) {
          this.blocks[key.slice(6)] = this[key];
        }
      }
    }

    Template.prototype.root = function() {};

    Template.prototype.render = function(obj) {
      var context;
      context = new Context(null, null, this.blocks);
      context.vars = obj;
      return this.root(context);
    };

    Template.prototype.module = function() {
      var context, key, module;
      context = new Context;
      this.root(context);
      module = {};
      for (key in context.exported_vars) {
        module[key] = context.vars[key];
      }
      return module;
    };

    Template.prototype.new_context = function(vars, shared, locals) {
      return new_context(this.name, this.blocks, vars, shared, this.globals, locals);
    };

    return Template;

  })();

  Context = (function() {

    function Context(parent, name, blocks) {
      var block_name;
      this.parent = parent;
      this.vars = {};
      this.blocks = {};
      for (block_name in blocks) {
        this.blocks[block_name] = [blocks[block_name]];
      }
      this.exported_vars = new Set();
    }

    Context.prototype["super"] = function(name, current) {
      var blocks, index;
      blocks = this.blocks[name];
      index = blocks.indexOf(current) + 1;
      return blocks[index];
    };

    Context.prototype.resolve = function(key) {
      var _ref;
      return this.vars[key] || ((_ref = this.parent) != null ? _ref.resolve(key) : void 0) || Jinja2.globals[key];
    };

    Context.prototype.call = function(f, args, kwargs) {
      var arg, call_args, _ref;
      if (!f) {
        return;
      }
      call_args = !f.__args__ ? args : [];
      if (f.__append_args__) {
        call_args.push(args);
      }
      if (f.__append_kwargs__) {
        call_args.push(kwargs);
      }
      for (arg in f.__args__) {
        call_args.push(kwargs[(_ref = f.__args__) != null ? _ref[arg] : void 0] || args.pop());
      }
      return f.apply(f.constructor || null, call_args);
    };

    Context.prototype.callfilter = function(f, preargs, args, kwargs) {
      var arg, call_args;
      if (!f) {
        return;
      }
      call_args = preargs;
      for (arg in f.__args__) {
        call_args.push(kwargs[f.__args__[arg]] || args.pop());
      }
      return f.apply(null, call_args);
    };

    return Context;

  })();

  Jinja2 = {
    templates: {},
    filters: {},
    globals: {},
    tests: {},
    registerGlobal: function(key, value) {
      return this.globals[key] = value;
    },
    registerFilter: function(name, func) {
      return this.filters[name] = func;
    },
    registerTest: function(name, func) {
      return this.tests[name] = func;
    },
    getFilter: function(name) {
      return this.filters[name];
    },
    registerTemplate: function(name, template) {
      return this.templates[name] = template;
    },
    getTemplate: function(name, from) {
      return new this.templates[name];
    },
    utils: {
      to_string: function(x) {
        if (x) {
          return String(x);
        } else {
          return "";
        }
      },
      missing: undefined,
      loop: function(i, len) {
        return {
          first: i === 0,
          last: i === (len - 1),
          index: i + 1,
          index0: i,
          revindex: len - i,
          revindex0: len - i - 1,
          length: len,
          cycle: function() {
            return arguments[i % arguments.length];
          }
        };
      }
    },
    "extends": __extends,
    Template: Template,
    Context: Context
  };

  root.Jinja2 = Jinja2;

  Jinja2.registerGlobal('range', function() {
    var array, end, i, s, start, step;
    start = void 0;
    end = void 0;
    step = void 0;
    array = [];
    switch (arguments.length) {
      case 1:
        start = 0;
        end = Math.floor(arguments[0]) - 1;
        step = 1;
        break;
      case 2:
      case 3:
        start = Math.floor(arguments[0]);
        end = Math.floor(arguments[1]) - 1;
        s = arguments[2];
        if (typeof s === "undefined") {
          s = 1;
        }
        step = Math.floor(s);
    }
    if (step > 0) {
      i = start;
      while (i <= end) {
        array.push(i);
        i += step;
      }
    } else if (step < 0) {
      step = -step;
      if (start > end) {
        i = start;
        while (i > end + 1) {
          array.push(i);
          i -= step;
        }
      }
    }
    return array;
  });

  Jinja2.registerGlobal('dict', (function() {
    var func;
    func = function(obj) {
      return obj;
    };
    func.__append_kwargs__ = true;
    return func;
  })());

  Jinja2.registerGlobal('cycler', function() {
    var cycler;
    cycler = {
      items: arguments,
      reset: function() {
        return cycler._setPos(0);
      },
      _setPos: function(pos) {
        cycler.pos = pos;
        return cycler.current = cycler.items[pos];
      },
      next: function() {
        var rv;
        rv = cycler.current;
        cycler._setPos((cycler.pos + 1) % cycler.items.length);
        return rv;
      }
    };
    cycler.reset();
    return cycler;
  });

  Jinja2.registerGlobal('joiner', function(sep) {
    var used;
    sep || (sep = ',');
    used = false;
    return function() {
      if (!used) {
        used = true;
        return '';
      } else {
        return sep;
      }
    };
  });

  Jinja2.registerFilter('length', function(obj) {
    return obj.length;
  });

  Jinja2.registerFilter('count', function(obj) {
    return obj.length;
  });

  Jinja2.registerFilter('indent', function(str, width, indentfirst) {
    var indention;
    width || (width = 4);
    indention = width ? Array(width + 1).join(" ") : "";
    return (indentfirst ? str : str.replace(/\n$/, '')).replace(/\n/g, "\n" + indention);
  });

  Jinja2.registerFilter('random', function(environment, seq) {
    if (seq) {
      return seq[Math.floor(Math.random() * seq.length)];
    } else {
      return undefined;
    }
  });

  Jinja2.registerFilter('last', function(environment, seq) {
    if (seq) {
      return seq[seq.length - 1];
    } else {
      return undefined;
    }
  });

  Jinja2.registerFilter('first', function(environment, seq) {
    if (seq) {
      return seq[0];
    } else {
      return undefined;
    }
  });

  Jinja2.registerFilter('title', function(str) {
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  });

  Jinja2.registerFilter('lower', function(str) {
    return str.toLowerCase();
  });

  Jinja2.registerFilter('upper', function(str) {
    return str.toUpperCase();
  });

  Jinja2.registerFilter('capitalize', function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  Jinja2.registerFilter('escape', function(html) {
    return String(html).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  });

  Jinja2.registerFilter('default', function(value, default_value, bool) {
    if ((bool && !value) || (value === void 0)) {
      return default_value;
    } else {
      return value;
    }
  });

  Jinja2.registerFilter('truncate', function(str, length, killwords, end) {
    length || (length = 255);
    end || (end = '...');
    if (str.length <= length) {
      return str;
    } else if (killwords) {
      return str.substring(0, length);
    } else {
      str = str.substring(0, maxLength + 1);
      str = str.substring(0, Math.min(str.length, str.lastIndexOf(" ")));
      return str + end;
    }
  });

  Jinja2.registerTest('callable', function(object) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  });

  Jinja2.registerTest('odd', function(value) {
    return value % 2 === 1;
  });

  Jinja2.registerTest('even', function(value) {
    return value % 2 === 0;
  });

  Jinja2.registerTest('divisibleby', function(value, num) {
    return value % num === 0;
  });

  Jinja2.registerTest('defined', function(value) {
    return typeof value !== "undefined";
  });

  Jinja2.registerTest('undefined', function(value) {
    return typeof value === "undefined";
  });

  Jinja2.registerTest('none', function(value) {
    return value === null;
  });

  Jinja2.registerTest('lower', function(value) {
    return value === value.toLowerCase();
  });

  Jinja2.registerTest('upper', function(value) {
    return value === value.toUpperCase();
  });

  Jinja2.registerTest('string', function(value) {
    return toString.call(value) === '[object String]';
  });

  Jinja2.registerTest('mapping', function(value) {
    return value === Object(value);
  });

  Jinja2.registerTest('number', function(value) {
    return toString.call(value) === '[object Number]';
  });

  Jinja2.registerTest('sequence', function(value) {
    return toString.call(value) === '[object Array]';
  });

  Jinja2.registerTest('sameas', function(value, other) {
    return value === other;
  });

  Jinja2.registerTest('iterable', function(value) {
    return toString.call(value) === '[object Array]';
  });

  Jinja2.registerTest('escaped', function(value) {
    return __indexOf.call(value, '__html__') >= 0;
  });

}).call(this);
