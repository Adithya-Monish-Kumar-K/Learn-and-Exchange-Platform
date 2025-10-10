import express from "express";
import { body } from "express-validator";
import {
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  getOffersByUser,
  acceptOffer,
  withdrawOffer,
  addFeedback,
} from "../controllers/offer";

const router = express.Router();

// Validation middleware for offer creation
const validateOfferCreation = [
  body("task")
    .notEmpty()
    .withMessage("Task is required")
    .isMongoId()
    .withMessage("Task must be a valid ID"),
  body("offeredBy")
    .notEmpty()
    .withMessage("Offered by is required")
    .isMongoId()
    .withMessage("Offered by must be a valid user ID"),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
  body("valueType")
    .notEmpty()
    .withMessage("Value type is required")
    .isIn(["service", "skill", "asset", "other"])
    .withMessage("Value type must be one of: service, skill, asset, other"),
  body("valueDetail")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Value detail cannot exceed 500 characters"),
  body("assets").optional().isArray().withMessage("Assets must be an array"),
  body("expiresAt")
    .optional()
    .isISO8601()
    .withMessage("Expires at must be a valid date"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be one of: low, medium, high"),
  body("estimatedDelivery")
    .optional()
    .isISO8601()
    .withMessage("Estimated delivery must be a valid date"),
  body("terms")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Terms cannot exceed 1000 characters"),
];

// Validation middleware for offer update
const validateOfferUpdate = [
  body("description")
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
  body("valueType")
    .optional()
    .isIn(["service", "skill", "asset", "other"])
    .withMessage("Value type must be one of: service, skill, asset, other"),
  body("valueDetail")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Value detail cannot exceed 500 characters"),
  body("status")
    .optional()
    .isIn(["pending", "accepted", "declined", "withdrawn"])
    .withMessage("Status must be one of: pending, accepted, declined, withdrawn"),
  body("assets").optional().isArray().withMessage("Assets must be an array"),
  body("expiresAt")
    .optional()
    .isISO8601()
    .withMessage("Expires at must be a valid date"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be one of: low, medium, high"),
  body("estimatedDelivery")
    .optional()
    .isISO8601()
    .withMessage("Estimated delivery must be a valid date"),
  body("terms")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Terms cannot exceed 1000 characters"),
  body("attachments")
    .optional()
    .isArray()
    .withMessage("Attachments must be an array"),
];

// Validation middleware for accepting an offer
const validateAcceptOffer = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("User ID must be valid"),
];

// Validation middleware for feedback
const validateFeedback = [
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Comment cannot exceed 1000 characters"),
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("User ID must be valid"),
];

// Main CRUD routes
router
  .route("/")
  .get(getAllOffers)
  .post(validateOfferCreation, createOffer);

router
  .route("/:id")
  .get(getOfferById)
  .put(validateOfferUpdate, updateOffer)
  .delete(deleteOffer);

// User-specific offers
router.get("/user/:userId", getOffersByUser);

// Offer actions
router.post("/:id/accept", validateAcceptOffer, acceptOffer);
router.post("/:id/withdraw", withdrawOffer);
router.post("/:id/feedback", validateFeedback, addFeedback);

export default router;
