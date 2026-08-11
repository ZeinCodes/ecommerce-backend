import categoriesService from "../services/categories.service.js";

const getAllCategories = async (req, res, next) => {
    try {
        const result = await categoriesService.getAllCategories();

        res.status(200).json({
            result,
            success: true 
        })
    } catch (error) {
        next(error)
    }
}
 
const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await categoriesService.getCategoryById(id);

        res.status(200).json({
            result,
            success: true 
        })
    } catch (error) {
        next(error)
    }
}
 
const getCategoryByName = async (req, res, next) => {
    try {
        const { name } = req.params;

        const result = await categoriesService.getCategoryByName(name);

        res.status(200).json({
            result,
            success: true 
        })
    } catch (error) {
        next(error)
    }
}
 
const postCategory = async (req, res, next) => {
    try {
        const { name } = req.body;

        const result = await categoriesService.postCategory(name);

        res.status(201).json({
            message: "New Category Created",
            success: true,
            result,
        })
    } catch (error) {
        next(error)
    }
}
 
const patchCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { name } = req.body; 

        const result = await categoriesService.patchCategory(id, name);

        res.status(200).json({
            message: "Category Updated",
            success: true, 
            result,
        })
    } catch (error) {
        next(error)
    }
}
 
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await categoriesService.deleteCategory(id);

        res.status(200).json({
            message: "Category has been deleted",
            success: true,
            result
        })
    } catch (error) {
        next(error)
    }
}
 
const categoryController = {
    getAllCategories, 
    getCategoryById,
    getCategoryByName,
    postCategory, 
    patchCategory,
    deleteCategory
}

export default categoryController;