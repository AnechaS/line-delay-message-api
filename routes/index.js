const express = require('express');
const messageController = require('../controllers/message.controller');

const router = express.Router();

router.post('/send', messageController.send);
router.post('/cancel', messageController.cancel);

module.exports = router;
