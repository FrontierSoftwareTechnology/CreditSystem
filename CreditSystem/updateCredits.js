/**
 * Created by Administrator on 2017/4/12 0012.
 */

updateActions = require('./updateActions');

// enable debug output
var debugMode = {
    enable : 0
}

function updateUserCredits(DB,
    user_article_read_table,
    user_table
){
    updateActions.debugMode.enable = debugMode.enable;
    if(user_article_read_table.doRead) {
        if(debugMode.enable){
            console.log("Read Action");
            console.log(user_article_read_table);
            console.log(user_table);
        }
        updateActions.doRead(DB, user_article_read_table, user_table);
    }
    if(user_article_read_table.doSupport) {
        if(debugMode.enable){
            console.log("Support Action");
            console.log(user_article_read_table);
            console.log(user_table);
        }
        updateActions.doSupport(DB, user_article_read_table, user_table);
    }
    if(user_article_read_table.doComment) {
        if(debugMode.enable){
            console.log("Comment Action");
            console.log(user_article_read_table);
            console.log(user_table);
        }
        updateActions.doComment(DB, user_article_read_table, user_table);
    }
    if(user_article_read_table.doCollect) {
        if(debugMode.enable){
            console.log("Collect Action");
            console.log(user_article_read_table);
            console.log(user_table);
        }
        updateActions.doCollect(DB, user_article_read_table, user_table);
    }
}

module.exports = updateUserCredits;