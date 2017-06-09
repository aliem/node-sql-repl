const {existSync} = require("fs");
const {join, basename, extname} = require("path");
const repl = require("repl");
const hist = require("repl.history");
const sql = require("sql");

module.exports = function REPL(definitions = {}) {
    const r = repl.start({
        prompt: '$> ',
        replMode: repl.REPL_MODE_STRICT,
    });
    hist(r, join(process.env.HOME, ".sqlrepl_history"));
    r.context.SQL = sql;
    r.context.sql = sql;
    for (const key in definitions) {
        r.context[key] = definitions[key];
    }
}
if (!module.parent) {
    module.exports();
}