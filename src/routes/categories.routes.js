import express from "express";
import categoryController from "../controllers/categories.controllers.js";
import validate from "../middlewares/validate.js";
import authenticate from "../middlewares/authentication.js";
import authorize from "../middlewares/authorization.js";
import {
    createCategorySchema,
    updateCategorySchema
} from "../validators/categories.validator.js";
import { paginationSchema } from "../validators/pagination.validation.js";

const categoriesRouter = express.Router();

categoriesRouter.get(
    "/categories",
    validate(paginationSchema, "query"),
    categoryController.getAllCategories
);

categoriesRouter.get(
    "/categories/:id",
    categoryController.getCategoryById
);

categoriesRouter.post(
    "/categories",
    authenticate,
    authorize("admin"),
    validate(createCategorySchema),
    categoryController.postCategory
);

categoriesRouter.patch(
    "/categories/:id",
    authenticate,
    authorize("admin"),
    validate(updateCategorySchema),
    categoryController.patchCategory
);

categoriesRouter.delete(
    "/categories/:id",
    authenticate,
    authorize("admin"),
    categoryController.deleteCategory
);

export default categoriesRouter;