/**
 * Created by Administrator on 2017/4/12 0012.
 */

updateActions = require('./updateActions');


function updateUserCredits(DB,
    user_article_read_table,
    user_table
){
    if(user_article_read_table.doRead) {
        updateActions.doRead(DB, user_article_read_table, user_table);
    }
    if(user_article_read_table.doSupport) {
        updateActions.doSupport(DB, user_article_read_table, user_table);
    }
    if(user_article_read_table.doComment) {
        updateActions.doComment(DB, user_article_read_table, user_table);
    }
    if(user_article_read_table.doCollect) {
        updateActions.doCollect(DB, user_article_read_table, user_table);
    }
}

module.exports = updateUserCredits;