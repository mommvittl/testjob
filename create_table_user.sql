create database IF NOT EXISTS  testaj ;
use testaj;

CREATE TABLE IF NOT EXISTS  `user`
(
`id` int(20) unsigned not null auto_increment primary key,
`name` varchar(50),
`email` varchar(100),
`territory` char(10) COLLATE utf8_unicode_ci NOT NULL
);
