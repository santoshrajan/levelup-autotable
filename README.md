levelup-autotable
=================

Auto increment key table for node-levelup, leveldb.
Auto incrementing keys.
Read, write, delete fields in a record individually.
Read, write, delete records.

    db = require('levelup')('./mydb')
    require("levelup-autotable")(db)

You must call `initAutoKeys` before using the database.
    db.initAutoKeys(callback)

You can call this from inside a request handler. Initialization is done the first time round. On subsequent calls it will just call `next`.
    app.use(function(req, res, next) {
        db.initAutoKeys(function() {next()})
    })

Get a new key. The key is a string with integer value starting from `1`. Use `parseInt` to do math on the key. 
    var key
    db.newAutoKey(function(err, newKey) {
        key = newKey
    })

Handle fields individually.
Put a field
    db.putField(key, "name", "John", options, callback)
    db.putField(key, "email", "john@example.org", options, callback)

The fieldname must be a valid javascript var name. ie only word chars `_` and `$` allowed.

Get a field.
    db.getField(key, fieldname, options, callback)

Delete a field.
    db.delField(key, fieldname, options, callback)

Get a record. 
    db.getRecord(key, function(err, value) {
        console.log(value) // {name: "John", email: "john@example.org"}
    })

Put a record.
    db.putRecord(key, {name: "John", email: "john@example.org"}, function(err) {
        //
    })

Delete a record. 
    db.delRecord(key, function(err) {
        //
    })





