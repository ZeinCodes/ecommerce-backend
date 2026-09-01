import NotFoundError from "../errors/NotFoundError.js";
import categoriesRepository from "../repositories/categories.repositories.js";

const getAllCategories = async (
    page,
    limit,
    name
) => {
    return categoriesRepository.findAllCategories(
        page,
        limit,
        name
    );
};

const getCategoryById = async (
    id
) => {
    const result =
        await categoriesRepository.findCategoryById(
            id
        );

    if (!result) {
        throw new NotFoundError(
            "Category not found"
        );
    }

    return result;
};

const postCategory = async (
    name
) => {
    return categoriesRepository.addNewCategory(
        name
    );
};

const patchCategory = async (
    id,
    name
) => {
    const result =
        await categoriesRepository.updateCategory(
            id,
            name
        );

    if (!result) {
        throw new NotFoundError(
            "Category not found"
        );
    }

    return result;
};

const deleteCategory = async (
    id
) => {
    const result =
        await categoriesRepository.deleteCategory(
            id
        );

    if (!result) {
        throw new NotFoundError(
            "Category not found"
        );
    }

    return result;
};

const categoriesService = {
    getAllCategories,
    getCategoryById,
    postCategory,
    patchCategory,
    deleteCategory
};

export default categoriesService;