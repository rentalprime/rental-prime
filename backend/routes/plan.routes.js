const express = require("express");
const router = express.Router();
const { protect, authorizeSuperAdmin } = require("../middlewares/auth");
const {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  getPlanStats,
  getActivePlans,
  bulkDeletePlans,
  updatePlanStatus,
} = require("../controllers/plan.controller");

// Routes
router
  .route("/")
  .get(getPlans) // Public access for reading plans
  .post(protect, authorizeSuperAdmin, createPlan); // Super admin only

router.route("/stats").get(protect, authorizeSuperAdmin, getPlanStats); // Super admin only

router.route("/active").get(getActivePlans); // Public access for active plans

router.route("/bulk").delete(protect, authorizeSuperAdmin, bulkDeletePlans); // Super admin only

router
  .route("/:id")
  .get(getPlan) // Public access for reading single plan
  .put(protect, authorizeSuperAdmin, updatePlan) // Super admin only
  .delete(protect, authorizeSuperAdmin, deletePlan); // Super admin only

router
  .route("/:id/status")
  .patch(protect, authorizeSuperAdmin, updatePlanStatus); // Super admin only

module.exports = router;
