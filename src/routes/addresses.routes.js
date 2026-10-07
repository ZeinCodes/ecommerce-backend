import express from "express";
import addressesController from "../controllers/addresses.controller.js";
import authenticate from "../middlewares/authentication.js";
import validate from "../middlewares/validate.js";
import {
    createAddressSchema,
    updateAddressSchema
} from "../validators/addresses.validator.js";

const addressesRouter = express.Router();

/**
 * @swagger
 * /addresses:
 *   get:
 *     summary: Get current user's addresses
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 *       401:
 *         description: Unauthorized
 */
addressesRouter.get(
    "/addresses",
    authenticate,
    addressesController.getAddresses
);

/**
 * @swagger
 * /addresses/{id}:
 *   get:
 *     summary: Get an address by ID
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Address retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
addressesRouter.get(
    "/addresses/:id",
    authenticate,
    addressesController.getAddressById
);

/**
 * @swagger
 * /addresses:
 *   post:
 *     summary: Add a new address
 *     tags: [Addresses]
 *     description: The first address is automatically the default.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - street
 *               - city
 *               - postal_code
 *               - country
 *             properties:
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postal_code:
 *                 type: string
 *               country:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Address created successfully
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation failed
 */
addressesRouter.post(
    "/addresses",
    authenticate,
    validate(createAddressSchema),
    addressesController.postAddress
);

/**
 * @swagger
 * /addresses/{id}:
 *   patch:
 *     summary: Update an address
 *     tags: [Addresses]
 *     description: Send is_default true to make this the default address.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postal_code:
 *                 type: string
 *               country:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *                 enum: [true]
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 *       422:
 *         description: Validation failed
 */
addressesRouter.patch(
    "/addresses/:id",
    authenticate,
    validate(updateAddressSchema),
    addressesController.patchAddress
);

/**
 * @swagger
 * /addresses/{id}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Addresses]
 *     description: Soft delete. If it was the default, the newest remaining address becomes the default.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
addressesRouter.delete(
    "/addresses/:id",
    authenticate,
    addressesController.deleteAddress
);

export default addressesRouter;