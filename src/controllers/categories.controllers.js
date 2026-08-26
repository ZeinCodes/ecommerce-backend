import categoriesService from "../services/categories.service.js";

const getAllCategories = async (req, res, next) => {
    try {
        const { name } = req.query;
        const { page, limit } = req.validated.query;

        if (name) {
            const result = await categoriesService.getCategoryByName(name);
    
            return res.status(200).json({
                success: true,
                result
            });
        }

        const result = await categoriesService.getAllCategories(page, limit);

        const totalPages = Math.ceil(
            result.total / limit
        )

        res.status(200).json({
            success: true,
            result: result.categories,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        })

    } catch (error) {
        next(error);
    }
};

const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await categoriesService.getCategoryById(id);

        res.status(200).json({
            success: true,
            result
        });
    } catch (error) {
        next(error);
    }
};

const postCategory = async (req, res, next) => {
    try {
        const { name } = req.body;

        const result = await categoriesService.postCategory(name);

        res.status(201).json({
            message: "New category created",
            success: true,
            result
        });
    } catch (error) {
        next(error);
    }
};

const patchCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const result = await categoriesService.patchCategory(id, name);

        res.status(200).json({
            message: "Category updated",
            success: true,
            result
        });
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await categoriesService.deleteCategory(id);

        res.status(200).json({
            message: "Category has been deleted",
            success: true,
            result
        });
    } catch (error) {
        next(error);
    }
};

const categoryController = {
    getAllCategories,
    getCategoryById,
    postCategory,
    patchCategory,
    deleteCategory
};

export default categoryController;