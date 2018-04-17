var express = require('express');
var router = express.Router();
var showbulletin = require('./showbulletin');
var showlist = require('./showlist');
var createbulletin = require('./createbulletin');
var famebulletin = require('./famebulletin');
var createbulletintome = require('./createbulletintome');

router.use('/famebulletin', famebulletin);
router.use('/showbulletin', showbulletin);
router.use('/showlist', showlist);
router.use('/createbulletin', createbulletin);
router.use('/createbulletintome', createbulletintome);





module.exports = router;
