#!/usr/bin/env node
"use strict";

const repl = require('./index');

const minimist = require("minimist");
const argv = minimist(process.argv.slice(2));

if (argv["h"] || argv["help"]) {
    console.log(`
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

const tableFiles = argv["t"] || argv["tables"];
if (Array.isArray(tableFiles)) {
    for (let i of tableFiles) {
        const name = basename(i, extname(i));
        const mod = require(tableFiles);
        Object
            .keys(mod)
            .filter((n) => !/(module|exports)/.test(n))
            .forEach((n) => definitions[n] = mod[n]);

        console.log("loading: %s", i);
    }
}
const defFiles = argv["d"] || argv["load"];
if (Array.isArray(tableFiles)) {
    for (let i of tableFiles) {
        const name = basename(i, extname(i));
        definitions[i] = sql.define(require(tableFiles));

        console.log("loading: %s", i);
    }
} else if (typeof defFiles === "string") {
    const name = basename(defFiles, extname(defFiles));
    definitions[name] = sql.define(require(`./${defFiles}`));

    console.log("loading: %s", defFiles);
}

repl(definitions);
