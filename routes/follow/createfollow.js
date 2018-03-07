var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const pool = require('../../config/dbpool');
const async = require('async');
const crypto = require('crypto');


router.post('/', (req, res) => {

  let taskArray = [
    (callback) => {
      console.log(req.session.user_id);
      if (req.session.user_id) {
        callback(null);
      } else {
        callback("0");
        res.status(500).send({
          stat: 0,
        });
      }
    },
    (callback) => {
      pool.getConnection((err, connection) => {
        if (err) {
          res.status(500).send({
            stat: "fail",
            masg: "DB connection fail"
          });
          connection.release();
          callback("DB connection err : " + err);
        } else {
          callback(null, connection);
        }
      });
    },
    (connection, callback) => {
      let insertFollowQuery = "insert into follower(user_id, follower_user_id) values(?,?);";
      connection.query(insertFollowQuery, [req.session.user_id, req.body.follower_user_id], (err, data) => {
        if (err) {
          res.status(500).send({
  					stat: "fail",
  					masg: "insert follow error"
  				});
          connection.release();
  				callback('insert follow error' + err);
        } else {
          res.status(201).send({
            stat:"success",
            data:{
              user_id : req.session.user_id,
              follower_user_id : req.body.follower_user_id
            }
          });
          connection.release();
        }
      });
    }

  ];
  
  async.waterfall(taskArray, (err, result) => {
    if (err) console.log(err);
    else console.log(result);
  });
});



module.exports = router;
