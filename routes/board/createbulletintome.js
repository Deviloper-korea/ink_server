var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const pool = require('../../config/dbpool');
const async = require('async');
const crypto = require('crypto');
//const date = require('date-utils');
var moment = require('moment');

router.post('/', (req,res) => {
    let user_id = req.session.user_id;
    let bulletin_text = req.body.bulletin_text;
    let topic_text = req.body.topic_text;
//    let bulletin_ink=req.body.bulletin_ink;
    //let dt = new Date();
    //let bulletin_date = now.toFormat('YYYY-MM-DD HH24:MI:SS');
    var now = moment();
    var bulletin_date = now.format('YYYY-MM-DD HH:mm:ss');
    console.log(bulletin_date);
    let query = {
        insertQuery: 'INSERT INTO bulletin (bulletin_date, bulletin_ink,user_id, bulletin_text, topic_text) VALUES (?,?, ?, ?, ?)',
        selectShowQuery: 'select bulletin_id, bulletin_date, bulletin_good_count, bulletin_ink, bulletin_text, topic_text, user_id FROM bulletin limit 20 ',
        selectIndex: 'SELECT bulletin_id, bulletin_date, bulletin_good_count, bulletin_ink, user_id, bulletin_text, topic_text '+
        'FROM bulletin WHERE (bulletin_id = ? )'
    };
    let taskArray = [
        (callback) =>{
            console.log(req.session.user_id);
            if(req.session.user_id){
                callback(null);
            }else{
                callback("0");
                res.status(500).send({
                    stat : 0,
                });
            }
        },
        (callback) => {

            pool.getConnection((err, connection) => {
                if(err){
                    res.status(500).send({
                        stat: "fail"
                    });
                    connection.release();
                    callback("DB connection err : ");
                }else{
                    callback(null, connection);
                }
            });
        },
        (connection, callback) => {
            let updateink = "select * from users where user_id=?";
            connection.query(updateink, [req.session.user_id], (err, rows) => {
                if(err){
                    console.log("!!!!");
                    connection.release();
                    res.status(501).send({
                        stat: "101"
                    });
                    callback("101", null);
                }else{
                    // if(rows[0].ink-req.body.bulletin_ink<0){
                    //     res.status(501).send({
                    //         stat:101
                    //     });
                    //     callback("101", null);
                    //
                    // }else{
                    //     callback(null,connection);
                    // }
                    callback(null, connection);
                }
            });
        },
        (connection, callback) => {
            console.log("update");
            let updateink = "update users set ink =ink+? where user_id=?;";
            connection.query(updateink, [1,req.session.user_id], (err, rows) => {
                if(err){
                    connection.release();
                    res.status(501).send({
                        stat: "102"
                    });
                    callback("102", null);
                }else{
                    console.log(rows);
                    callback(null, connection);

                }
            });
        },
        (connection, callback) => {
            let insertQuery = query.insertQuery;
            connection.query(insertQuery, [bulletin_date, 0,user_id, bulletin_text, topic_text], (err, row) => {
                if(err){
                    res.status(500).send({
                        stat: "fail"
                    });
                    console.log(err);
                    connection.release();
                    callback("insert error");
                }else{
                    console.log(row);
                    callback(null, connection, row);
                }
            });
        },
        (connection, row, callback) => {
            let selectShowQuery = query.selectShowQuery;
            connection.query(selectShowQuery, (err, rows) => {
                console.log("여기" + row.insertId);
                if(err){
                    res.status(401).send({
                        stat: "select error"
                    });
                    connection.release();
                    callback("select error", null);
                }else{
                    let selectIndex = query.selectIndex;
                    connection.query(selectIndex, row.insertId, (err, bulletinData) =>{
                        if(err){
                            console.log(err);
                            res.status(401).send({
                                stat:"error"
                            });
                            connection.release();
                            callback("index error", null);
                        }else{
                            console.log(row.insertId);
                            res.status(201).send({
                                stat: "select success",
                                data: {
                                    "bulletin_id" : bulletinData[0].bulletin_id,
                                    "bulletin_name" : bulletinData[0].bulletin_name,
                                    "bulletin_date" : bulletinData[0].bulletin_date,
                                    "bulletin_good_count" : bulletinData[0].bulletin_good_count,
                                    "bulletin_ink" : bulletinData[0].bulletin_ink,
                                    "bulletin_text" : bulletinData[0].bulletin_text,
                                    "user_id" : bulletinData[0].user_id,
                                    "topic_text" : bulletinData[0].topic_text
                                },
                                list: rows

                            });
                            connection.release();
                            callback("list success", null);

                        }
                    });
                }
            });
        }

    ];
    async.waterfall(taskArray, (err, result) => {
        if(err) console.log(err);
        else console.log(result);
    });
});



module.exports = router;
