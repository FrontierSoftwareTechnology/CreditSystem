/**
 * Created by Administrator on 2017/4/12 0012.
 */

var async = require('async');

var debugMode = {
    enable : 1
};

var dailyCreditLimit = {
    read : 100,
    comment : 200
}

/*
*   please modify this func according to your collection names
* */
function getCollections(DB) {
    var cols = {
        articleCollection : DB.collection('articles'),
        userCollection : DB.collection('users'),
        creditLogCollection : DB.collection('creditLog'),
    }
    return cols;
}

/*
*   for reader: credit += 5 if readTimeLength > 15 && dailyCredit4Read < 100
*   for writer: credit += 0 if readTimeLength <= 15
*                         2 if readTimes <= 100
*                         1 if readTimes <= 1000
*                         0.5 if readTimes > 1000
* */
function doRead(DB,
                user_article_read_table,
                user_table
){
    var collections = getCollections(DB);
    var articleCollection = collections.articleCollection;
    var userCollection =  collections.userCollection;
    var creditLogCollection =  collections.creditLogCollection;
    //for reader
    var readerID = user_table.uid;
    if(!user_table.dailyCredit4Read){
        user_table.dailyCredit4Read = 0;
    }
    //ensure daily limit not exceeded
    var credit2Add = 0;
    if(user_table.dailyCredit4Read < dailyCreditLimit.read ){
        credit2Add = credit4Read(user_article_read_table.readTimeLength);           //update credit
        if(credit2Add + user_table.dailyCredit4Read > dailyCreditLimit.read){
            credit2Add = dailyCreditLimit.read - user_table.dailyCredit4Read;
        }
    }
    userCollection.update({'uid':user_table.uid},{$inc:{'dailyCredit4Read':credit2Add,'credits': credit2Add}}, function(err){      //save log
        if(err)
            console.log(err);
    });
    var log = {
        uid : user_table.uid,
        change : credit2Add,
        reason : 'read',
        aid : user_article_read_table.aid,
        readTimeLength : user_article_read_table.readTimeLength,
        timestamp : user_article_read_table.timestamp
    }
    if(debugMode.enable)
        console.log(log);
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
                var credit2Add = 0;             //update credit
                credit2Add = credit4BeRead(user_article_read_table.readTimeLength, article.readingNum);
                userCollection.update({'uid':author.uid},{$inc:{'credits': credit2Add}}, function(err){
                    if(err)
                        console.log(err);
                });

                var log = {                 //save log
                    uid : author.uid,
                    change : credit2Add,
                    reason : 'beRead',
                    aid : user_article_read_table.aid,
                    uid2 : readerID,
                    readTimeLength : user_article_read_table.readTimeLength,
                    timestamp : user_article_read_table.timestamp
                }
                if(debugMode.enable)
                    console.log(log);
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

/*
*    for writer: credit += 10 if supportNum <= 100
*                          5  if supportNum <= 1000
*                          2  if supportNum > 1000
* */
function doSupport(DB,
                user_article_read_table,
                user_table
){
    var collections = getCollections(DB);
    var articleCollection = collections.articleCollection;
    var userCollection =  collections.userCollection;
    var creditLogCollection =  collections.creditLogCollection;
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
                var credit2Add = 0;             //update credit
                credit2Add = credit4BeSupported(article.supportNum);
                userCollection.update({'uid':author.uid},{$inc:{'credits': credit2Add}}, function(err){
                    if(err)
                        console.log(err);
                });

                var log = {                 //save log
                    uid : author.uid,
                    change : credit2Add,
                    reason : 'beSupported',
                    aid : user_article_read_table.aid,
                    uid2 : user_table.uid,
                    readTimeLength : user_article_read_table.readTimeLength,
                    timestamp : user_article_read_table.timestamp
                }
                if(debugMode.enable)
                    console.log(log);
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

/*
*   for reader: credit += 10 if commentLength >= 5 && dailyCredit4Comment < 200
*   for writer: credit += 0 if commentLength < 5
*                         20 if commentNums <= 100
*                         10 if commentNums <= 1000
*                         5  if commentNums > 1000
* */
function doComment(DB,
                user_article_read_table,
                user_table
){
    var collections = getCollections(DB);
    var articleCollection = collections.articleCollection;
    var userCollection =  collections.userCollection;
    var creditLogCollection =  collections.creditLogCollection;
    //for reader
    var readerID = user_table.uid;
    if(!user_table.dailyCredit4Comment){
        user_table.dailyCredit4Comment = 0;
    }
    //ensure daily limit not exceeded
    var credit2Add = 0;
    if(user_table.dailyCredit4Comment < dailyCreditLimit.comment ){
        credit2Add = credit4Comment(user_article_read_table.comment.length);
        if(credit2Add + user_table.dailyCredit4Comment > dailyCreditLimit.comment){         //update credit
            credit2Add = dailyCreditLimit.comment - user_table.dailyCredit4Comment;
        }
    }
    userCollection.update({'uid':user_table.uid},{$inc:{'dailyCredit4Comment':credit2Add,'credits': credit2Add}}, function(err){
        if(err)
            console.log(err);
    });

    var log = {                     //save log
        uid : user_table.uid,
        change : credit2Add,
        reason : 'comment',
        aid : user_article_read_table.aid,
        readTimeLength : user_article_read_table.readTimeLength,
        timestamp : user_article_read_table.timestamp
    }
    if(debugMode.enable)
        console.log(log);
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
                var credit2Add;             //update credit
                credit2Add = credit4BeCommented(user_article_read_table.comment.length, article.commentNum);
                userCollection.update({'uid':author.uid},{$inc:{'credits': credit2Add}}, function(err){
                    if(err)
                        console.log(err);
                });

                var log = {                 //save log
                    uid : author.uid,
                    change : credit2Add,
                    reason : 'beCommented',
                    aid : user_article_read_table.aid,
                    uid2 : user_table.uid,              //commenter
                    comment : user_article_read_table.comment,
                    timestamp : user_article_read_table.timestamp
                }
                if(debugMode.enable)
                    console.log(log);
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

/*
*   for writer: credit += 40 if collectNum <= 10
*                         20 if collectNum <= 100
*                         10 if collcetNum <= 1000
*                         5  if collectNum > 1000
* */
function doCollect(DB,
                user_article_read_table,
                user_table
){
    var collections = getCollections(DB);
    var articleCollection = collections.articleCollection;
    var userCollection =  collections.userCollection;
    var creditLogCollection =  collections.creditLogCollection;
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
                var credit2Add = 0;
                if(!article.collectNum)     //origin record contains no filed named collectNum
                    article.collectNum = 0;
                credit2Add = credit4BeCollected(article.collectNum);        //update credit
                userCollection.update({'uid':author.uid},{$inc:{'credits': credit2Add}}, function(err){
                    if(err)
                        console.log(err);
                });

                var log = {                 //save log
                    uid : author.uid,
                    change : credit2Add,
                    reason : 'beCollected',
                    aid : user_article_read_table.aid,
                    uid2 : user_table.uid,              //collector
                    timestamp : user_article_read_table.timestamp
                }
                if(debugMode.enable)
                    console.log(log);
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

/*
*   belows are specific rules for credit update, please modify them freely
* */

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
    doCollect : doCollect,
    debugMode : debugMode
}