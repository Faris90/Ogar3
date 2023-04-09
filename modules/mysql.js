function MySQL() {

}

module.exports = MySQL;

MySQL.prototype.init = function(sqlconfig) {
    this.mysql      = require('mysql');
    this.connection = this.mysql.createConnection({
        host     : sqlconfig.host,
        user     : sqlconfig.user,
        password : sqlconfig.password,
        database : sqlconfig.database
    });
    this.connection.on('error', function(err) {
        console.log('\u001B[31mMySQL Error!\u001B[0m\n', err);
    });
};

MySQL.prototype.connect = function() {
    this.connection.connect(function(err) {
        if( err != null ) {
            console.log('\u001B[31mMySQL Error!\u001B[0m\n', err);
        }
    });
};

MySQL.prototype.ping = function() {
    this.connection.query('SELECT 1');
};

MySQL.prototype.close = function() {
    this.connection.end();
};

MySQL.prototype.writeScore = function(name, ip, score,table) {
    this.connection.query('INSERT INTO `' + table + '` (`name`,`ip`,`score`,`lastseen`) VALUES ( ? , ? , ? ,CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE `score` = IF(`score` < ? , ? , `score`),`lastseen` = CURRENT_TIMESTAMP', [name, ip, score, score, score ], function(err, rows, fields) {
        if( err != null ) console.log('\u001B[31mMySQL Error!\u001B[0m\n' + err);
    });
};

MySQL.prototype.createTable = function(table,database) {
    this.connection.query('CREATE DATABASE IF NOT EXISTS `' + database + '` CHARACTER SET=utf8 COLLATE=utf8_bin;', function(err, rows, fields) {
        if( err != null ) console.log('\u001B[31mMySQL Error!\u001B[0m\n' + err);
    });
    this.connection.query('CREATE TABLE IF NOT EXISTS `' + table + '` (`name` varchar(15) COLLATE utf8_bin NOT NULL, `ip` varchar(16) COLLATE utf8_bin NOT NULL, `score` mediumint(9) NOT NULL, `status` tinyint(4) NOT NULL, `lastseen` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE KEY `name` (`name`,`ip`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT="Ogar Player Score";', function(err, rows, fields) {
        if( err != null ) console.log('\u001B[31mMySQL Error!\u001B[0m\n' + err);
    });
};