const express = require("express");
const router = express.Router();
const userController = require("../../controllers/Buyer_app controllers/buyer_app_user_controller");
const { protect } = require("../../middlewares/auth");

router.post("/", userController.createUser);
router.get("/", userController.getAllUsers);
router.get("/id", protect, userController.getUserById);
router.put("/update-profile", protect, userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
