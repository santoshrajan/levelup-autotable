var counter,
    validName = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/,
    methods = {}

methods.initAutoKeys = function(callback) {
    if (typeof counter != 'undefined') {
        return callback()
    }
    this.get('__counter', function (err, value) {
        if (err) {
            if (err.name === 'NotFoundError') {
                counter = 0
            } else {
                throw err
            }
        } else {
            counter = value
        }
        callback()
    })
}

methods.newAutoKey = function(callback) {
    if (typeof callback != 'function') {
        throw new Error("newKey requires a callback function")
    }
    this.put("__counter", ++counter, function(err) {
        callback(err, counter.toString())
    })
}

methods.putField = function(key, name, value, options, callback) {
    if (validName.test(name)) {
        this.put(key + ":" + name, value, options, callback)
    } else {
        throw new Error("Invalid char in field name")
    }
}

methods.getField = function(key, name, options, callback) {
    this.get(key + ":" + name, options, callback)
}

methods.delField = function(key, name, options, callback) {
    this.del(key + ":" + name, options, callback)
}

methods.getRecord = function(key, callback) {
    var ret = {}
    this.createReadStream({start: key, end: parseInt(key) + 1})
        .on('data', function (data) {
            ret[data.key.split(':')[1]] = data.value
        })
        .on('error', function (err) {
            callback(err)
        })
        .on('end', function (err) {
            callback(null, ret)
        })
}

methods.putRecord = function(key, value, callback) {
    var ops = []
    Object.keys(value).forEach(function(k) {
        ops.push({type: 'put', key: key + ":" + k, value: value[k]})
    })
    this.batch(ops, function (err) {
        callback(err)
    })
}

methods.delRecord = function(key, callback) {
    var ops = []
    var db = this
    this.createReadStream({start: key, end: parseInt(key) + 1})
        .on('data', function (data) {
            ops.push({type: 'del', key: data.key})
        })
        .on('error', function (err) {
            callback(err)
        })
        .on('end', function (err) {
            db.batch(ops, function (err) {
                if (err) return callback(err)
                callback()
            })
        })
}

methods.dump = function(callback) {
    this.createReadStream()
        .on('data', function (data) {
            console.log(data.key, '=', data.value)
        })
        .on('error', function (err) {
            if (callback) {
                callback(err)
            } else {
                throw err
            }
        })
        .on('end', function (err) {
            if (callback) {
                callback()
            }
        })
}

module.exports = function(db) {
    Object.keys(methods).forEach(function(key) {
        db[key] = methods[key]
    })
}
