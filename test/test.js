/**
 * Created by Administrator on 2017/4/13 0013.
 */
function test(){
    var async = require('async');
    var dbConnector = require('../db/dbConnector');
    var updateUserCredits = require('../CreditSystem/updateCredits');
    dbConnector(function(db){
        async.series([
            function(callback){
                db.collection('users').find({uid:"0"}).toArray(function(err, user){
                    if(err)
                        callback(err);
                    callback(null,user[0]);
                });
            },
            function(callback){
                db.collection('user_article_read').find({uid:"0"}).toArray(function(err, use_table){
                    if(err)
                        callback(err);
                    callback(null, use_table[0]);
                });
            }
        ], function(err, result){
            if(err){
                console.log(err);
            }
            else {
                console.log("credit before " + result[0].credits);
                updateUserCredits(db, result[1], result[0]);
                setTimeout(checkResult, 3000);
            }
        });
    });
}

function checkResult() {
    var dbConnector = require('../db/dbConnector');
    dbConnector(function(db) {
        db.collection('users').find({uid: "0"}).toArray(function (err, user) {
            if (err)
                console.log(err);
            console.log("credit after " + user[0].credits);
        });
    });
}
module.exports = test;