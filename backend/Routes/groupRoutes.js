const express = require("express");

const router = express.Router();

const groupController = require("../controllers/groupController");
const groupMessageController = require(
    "../controllers/groupController"
);
router.post("/create", groupController.createGroup);
router.get(
    "/:groupId/messages",
    groupMessageController.getGroupMessages
);

module.exports = router;