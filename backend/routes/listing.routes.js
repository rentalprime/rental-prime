const express = require("express");
const router = express.Router();
const { protect, authorizeSuperAdmin } = require("../middlewares/auth");
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
} = require("../controllers/listing.controller");

router.use(protect);
router.use(authorizeSuperAdmin);

router.route("/").get(getListings).post(createListing);

router.route("/:id").get(getListing).put(updateListing).delete(deleteListing);

module.exports = router;
