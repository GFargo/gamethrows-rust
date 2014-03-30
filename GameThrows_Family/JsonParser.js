// Thanks Koelkast123
// Form Thread: http://gomagma.org/community/index.php?topic=313.msg1411#msg1411

var gap,indent;
function On_Command(Player, cmd, args) {
        switch(cmd) {
                case "json":
                        var obj = {
                          "test": ["foo", "bar"]
                        };
                        var test = JSONstringify(obj);
                        var json = JSONparse(test);
                        Player.Message(json.test[0]);    
        }
}
 
function JSONstringify(value) {
    gap = ''; indent = '';
    return JSONstr('', {'': value});
};
 
function JSONquote(string) {
        var meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };
        var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    escapable.lastIndex = 0;
    return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
        var c = meta[a];
        return typeof c === 'string'
            ? c
            : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + string + '"';
}
 
function JSONstr(key, holder) {
    var i,          
        k,          
        v,          
        length,
        mind = gap,
        partial,
        value = holder[key];
       
    if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
        value = value.toJSON(key);
    }
   
    switch (typeof value) {
            case 'string':
                return JSONquote(value);
            case 'number':
                return String(value);
            case 'boolean':
            case 'null':
                return String(value);
            case 'object':
                if (!value) {
                    return 'null';
                }
                gap += indent;
                partial = [];
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = JSONstr(i, value) || 'null';
                    }
                    v = partial.length === 0
                        ? '[]'
                        : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = JSONstr(k, value);
                        if (v) {
                            partial.push(JSONquote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
                v = partial.length === 0 ? '{}'
                    : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
    }
}
function JSONparse(text) {
 
    var j;
        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    text = String(text);
    cx.lastIndex = 0;
    if (cx.test(text)) {
        text = text.replace(cx, function (a) {
            return '\\u' +
                ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        });
    }
    if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                j = eval('(' + text + ')');
                return j;
            }
 
}