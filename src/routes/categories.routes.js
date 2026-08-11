import express from "express";
import categoryController from "../controllers/categories.controllers.js";

const categoriesRouter = express.Router();

categoriesRouter.get(
    '/categories',
    categoryController.getAllCategories
)

categoriesRouter.get(
    '/categories/:id',
    categoryController.getCategoryById
)
 
categoriesRouter.get(
    '/categories',
    categoryController.getCategoryByName
)
 
categoriesRouter.post(
    '/categories',
    categoryController.postCategory
)
 
categoriesRouter.patch(
    '/categories/:id',
    categoryController.patchCategory
)
 
categoriesRouter.delete(
    '/categories/:id',
    categoryController.deleteCategory
)
 
export default categoriesRouter;