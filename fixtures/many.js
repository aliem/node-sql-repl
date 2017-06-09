const sql = require("sql");

exports.one = sql.define({
    name: "one",
    columns: ["id", "name"],
});
exports.two = sql.define({
    name: "two",
    columns: ["id", "name", "one_id"],
    foreignKeys: [
        {
            table: "one",
            columns: ["one_id"],
            refColumns: ["id"],
        },
    ],
});