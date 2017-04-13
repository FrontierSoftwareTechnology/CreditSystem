/**
 * Created by Administrator on 2017/4/12 0012.
 */
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/test';

/* return a db object
* */
function connnectDB(callback){
    MongoClient.connect(DB_CONN_STR, function(err, db) {
        if(err)
            console.log(err);
        else
            callback(db);
    });
}

module.exports = connnectDB;