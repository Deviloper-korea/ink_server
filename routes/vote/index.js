var express = require('express');
var router = express.Router();
var votecount = require('./votecount');

var showvoteuser = require('./showvoteuser');
var deletevotecount = require('./deletevotecount');

console.log("vote");
/* GET home page. */
router.use('/votecount', votecount);
router.use('/showvoteuser', showvoteuser);
router.use('/deletevotecount', deletevotecount);

module.exports = router;
