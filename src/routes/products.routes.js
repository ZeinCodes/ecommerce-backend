import express from "express";
import productsController from "../controllers/products.controller.js";
import validate from "../middlewares/validate.js";
import authenticate from "../middlewares/authentication.js";
import authorize from "../middlewares/authorization.js";
import {
    createProductSchema,
    updateProductSchema
} from "../validators/products.validator.js";

const productsRouter = express.Router();

productsRouter.get(
    "/products",
    productsController.getAllProducts
);

productsRouter.get(
    "/products/:id",
    productsController.getProductById
);

productsRouter.post(
    "/products",
    authenticate,
    authorize("admin"),
    validate(createProductSchema),
    productsController.postProduct
);

productsRouter.patch(
    "/products/:id",
    authenticate,
    authorize("admin"),
    validate(updateProductSchema),
    productsController.patchProduct
);

productsRouter.delete(
    "/products/:id",
    authenticate,
    authorize("admin"),
    productsController.deleteProduct
);

export default productsRouter;