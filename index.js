#!/usr/bin/env node
"use strict";

const {existSync, readFileSync} = require("fs");
const {join, basename, extname} = require("path");
const repl = require("repl");
const hist = require("repl.history");
const sql = require("sql");
const minimist = require("minimist");
const argv = minimist(process.argv.slice(2));

const log = console.log.bind(console);

const motd = readFileSync(join(__dirname, "motd.txt"), "utf8");

if (argv["h"] || argv["help"]) {
    log(`
  sql-repl [-l <filename>][-t <filename>][-h]

  REPL for brianc/node-sql

  Options:
    -l --load <filename>     load a JSON table definition
    -t --tables <filename>   load a module that exports table definitions
    -h --help                this help text

  Example:
    sql-repl -l table.json
    sql-repl -t definitions.js -l users.json
`);
    process.exit(0);
}

// Load table definitions
const definitions = {};

// From JS modules
const tableFiles = argv["t"] || argv["tables"];
if (Array.isArray(tableFiles)) {
    for (let i of tableFiles) {
        const name = basename(i, extname(i));
        const mod = require(tableFiles);
        Object
            .keys(mod)
            .filter((n) => !/(module|exports)/.test(n))
            .forEach((n) => definitions[n] = mod[n]);

        log("loading: %s", i);
    }
}

// From JSON
const defFiles = argv["d"] || argv["load"];
if (Array.isArray(tableFiles)) {
    for (let i of tableFiles) {
        const name = basename(i, extname(i));
        definitions[i] = sql.define(require(tableFiles));

        log("loading: %s", i);
    }
} else if (typeof defFiles === "string") {
    const name = basename(defFiles, extname(defFiles));
    definitions[name] = sql.define(require(`./${defFiles}`));

    log("loading: %s", defFiles);
}

REPL(definitions);

function REPL(definitions = {}) {
    log(motd);

    const r = repl.start({
        prompt: '$ > ',
        replMode: repl.REPL_MODE_STRICT,
    });
    hist(r, join(process.env.HOME, ".sqlrepl_history"));
    r.context.SQL = sql;
    r.context.sql = sql;
    for (const key in definitions) {
        r.context[key] = definitions[key];
    }
}