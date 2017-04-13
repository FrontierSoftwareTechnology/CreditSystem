/**
 * Created by Administrator on 2017/4/12 0012.
 */

var async = require('async');

var dailyCreditLimit = {
    read : 100,
    comment : 200
}

function doRead(DB,
                user_article_read_table,
                user_table
){
    //please ensure below collections are right!
    var articleCollection = DB.collection('articles');
    var userCollection =  DB.collection('users');
    var creditLogCollection =  DB.collection('creditLog');
    //for reader
    var readerID = user_table.uid;
    if(!user_table.dailyCredit4Read){
        user_table.dailyCredit4Read = 0;
    }
    //ensure daily limit not exceeded
    var credit2Add;
    if(user_table.dailyCredit4Read < dailyCreditLimit.read ){
        credit2Add = credit4Read(user_article_read_table.readTimeLength);
        if(credit2Add + user_table.dailyCredit4Read > dailyCreditLimit.read){
            credit2Add = dailyCreditLimit.read - user_table.dailyCredit4Read;
        }
        user_table.dailyCredit4Read += credit2Add;
        user_table.credits += credit2Add;
    }
    userCollection.save(user_table, function(err){
        if(err)
            console.log(err);
    });
    var log = {
        uid : user_table.uid,
        change : credit2Add,
        reason : 'read',
        aid : user_article_read_table.aid,
        readTimeLength : user_article_read_table.readTimeLength,
        timeStamp : user_article_read_table.timeStamp
    }
    creditLogCollection.insert(log, function(err){
        if(err)
            console.log(err);
    });
    //for writer
    async.waterfall([
        function(callback){                 //find article by aid
            articleCollection.find({aid : user_article_read_table.aid}).toArray( function(err, article){
                if(err){
                    callback(err);
                }
                callback(null, article[0]);
            });
        },
        function(article, callback){        //find author by article author
            userCollection.find({"uname" : article.author}).toArray( function(err, author) {
                author = author[0];
                var credit2Add;
                credit2Add = credit4BeRead(user_article_read_table.readTimeLength, article.readingNum);
                author.credits += credit2Add;
                userCollection.save(author, function(err){
                    if(err)
                        console.log(err);
                });

                var log = {
                    uid : author.uid,
                    change : credit2Add,
                    reason : 'beRead',
                    aid : user_article_read_table.aid,
                    uid2 : readerID,
                    readTimeLength : user_article_read_table.readTimeLength,
                    timeStamp : user_article_read_table.timeStamp
                }
                creditLogCollection.insert(log, function(err){
                    if(err)
                        console.log(err);
                    callback(null);
                });
            });
        }
    ],function(err){
            if(err)
                console.log(err);
            });
}
function doSupport(DB,
                user_article_read_table,
                user_table
){
    //please ensure below collections are right!
    var articleCollection = DB.collection('articles');
    var userCollection =  DB.collection('users');
    var creditLogCollection =  DB.collection('creditLog');
    //for writer
    async.waterfall([
        function(callback){                 //find article by aid
            articleCollection.find({aid : user_article_read_table.aid}).toArray( function(err, article){
                if(err){
                    callback(err);
                }
                callback(null, article[0]);
            });
        },
        function(article, callback){        //find author by article author
            userCollection.find({"uname" : article.author}).toArray( function(err, author) {
                author = author[0];
                var credit2Add;
                credit2Add = credit4BeSupported(article.supportNum);
                author.credits += credit2Add;
                userCollection.save(author, function(err){
                    if(err)
                        console.log(err);
                });

                var log = {
                    uid : author.uid,
                    change : credit2Add,
                    reason : 'beSupported',
                    aid : user_article_read_table.aid,
                    uid2 : user_table.uid,
                    readTimeLength : user_article_read_table.readTimeLength,
                    timeStamp : user_article_read_table.timeStamp
                }
                creditLogCollection.insert(log, function(err){
                    if(err)
                        console.log(err);
                    callback(null);
                });
            });
        }
    ],function(err){
        if(err)
            console.log(err);
    });
}
function doComment(DB,
                user_article_read_table,
                user_table
){
    //please ensure below collections are right!
    var articleCollection = DB.collection('articles');
    var userCollection =  DB.collection('users');
    var creditLogCollection =  DB.collection('creditLog');
    //for reader
    var readerID = user_table.uid;
    if(!user_table.dailyCredit4Comment){
        user_table.dailyCredit4Comment = 0;
    }
    //ensure daily limit not exceeded
    var credit2Add;
    if(user_table.dailyCredit4Comment < dailyCreditLimit.comment ){
        credit2Add = credit4Comment(user_article_read_table.comment.length);
        if(credit2Add + user_table.dailyCredit4Comment > dailyCreditLimit.comment){
            credit2Add = dailyCreditLimit.comment - user_table.dailyCredit4Comment;
        }
        user_table.dailyCredit4Comment += credit2Add;
        user_table.credits += credit2Add;
    }
    userCollection.save(user_table, function(err){
        if(err)
            console.log(err);
    });

    var log = {
        uid : user_table.uid,
        change : credit2Add,
        reason : 'comment',
        aid : user_article_read_table.aid,
        readTimeLength : user_article_read_table.readTimeLength,
        timeStamp : user_article_read_table.timeStamp
    }
    creditLogCollection.insert(log, function(err){
        if(err)
            console.log(err);
    });

    //for writer
    async.waterfall([
        function(callback){                 //find article by aid
            articleCollection.find({aid : user_article_read_table.aid}).toArray( function(err, article){
                if(err){
                    callback(err);
                }
                callback(null, article[0]);
            });
        },
        function(article, callback){        //find author by article author
            userCollection.find({"uname" : article.author}).toArray( function(err, author) {
                author = author[0];
                var credit2Add;
                credit2Add = credit4BeCommented(user_article_read_table.comment.length, article.commentNum);
                author.credits += credit2Add;
                userCollection.save(author, function(err){
                    if(err)
                        console.log(err);
                });

                var log = {
                    uid : author.uid,
                    change : credit2Add,
                    reason : 'beCommented',
                    aid : user_article_read_table.aid,
                    uid2 : user_table.uid,
                    comment : user_article_read_table.comment,
                    timeStamp : user_article_read_table.timeStamp
                }
                creditLogCollection.insert(log, function(err){
                    if(err)
                        console.log(err);
                    callback(null);
                });
            });
        }
    ],function(err){
        if(err)
            console.log(err);
    });
}
function doCollect(DB,
                user_article_read_table,
                user_table
){
    //please ensure below collections are right!
    var articleCollection = DB.collection('articles');
    var userCollection =  DB.collection('users');
    var creditLogCollection =  DB.collection('creditLog');
    //for writer
    async.waterfall([
        function(callback){                 //find article by aid
            articleCollection.find({aid : user_article_read_table.aid}).toArray( function(err, article){
                if(err){
                    callback(err);
                }
                callback(null, article[0]);
            });
        },
        function(article, callback){        //find author by article author
            userCollection.find({"uname" : article.author}).toArray( function(err, author) {
                author = author[0];
                var credit2Add;
                if(!article.collectNum)
                    article.collectNum = 0;
                credit2Add = credit4BeCollected(article.collectNum);
                author.credits += credit2Add;
                userCollection.save(author, function(err){
                    if(err)
                        console.log(err);
                });

                var log = {
                    uid : author.uid,
                    change : credit2Add,
                    reason : 'beCollected',
                    aid : user_article_read_table.aid,
                    uid2 : user_table.uid,
                    timeStamp : user_article_read_table.timeStamp
                }
                creditLogCollection.insert(log, function(err){
                    if(err)
                        console.log(err);
                    callback(null);
                });
            });
        }
    ],function(err){
        if(err)
            console.log(err);
    });
}

function credit4Read(readTimeLength) {
    //assert(readTimeLength >= 0);
    return readTimeLength <= 15 ? 0 : 5;
}

function credit4BeRead(readTimeLength, readCnt) {
    //assert(readTimeLength >= 0 && readCnt >= 0);
    if(readTimeLength <= 15)
        return 0;

    if(readCnt < 100) {
        return 2;
    }
    else if(readCnt < 1000) {
        return 1;
    }
    else
        return 0.5
}

function credit4BeSupported(supportCnt) {
    //assert(supportCnt >= 0);
    if(supportCnt <= 100)
        return 10;
    else if(supportCnt <= 1000)
        return 5;
    else
        return 2;
}

function credit4Comment(commentSize) {
    //assert(commentSize > 0);
    return commentSize >= 5 ? 10 : 0;
}

function credit4BeCommented(commentSize, commentCnt) {
    //assert(commentSize > 0 && commentCnt >= 0);
    if (commentSize < 5)
        return 0;
    if(commentCnt <= 100)
        return 20
    else if(commentCnt <= 1000)
        return 10;
    else
        return 5;
}

function credit4BeCollected(collectCnt) {
    //assert(collectCnt >= 0);
    if(collectCnt <= 10)
        return 40;
    else if(collectCnt <= 100)
        return 20;
    else if(collectCnt <= 1000)
        return 10;
    else
        return 5;
}

module.exports = {
    doRead : doRead,
    doSupport : doSupport,
    doComment : doComment,
    doCollect : doCollect
}