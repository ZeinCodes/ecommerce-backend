import NotFoundError from "../errors/NotFoundError.js";
import categoriesRepository from "../repositories/categories.repositories.js";

const getAllCategories = async (page, limit) => {
    return categoriesRepository.findAllCategories(page, limit);
};

const getCategoryById = async (id) => {
    const result = await categoriesRepository.findCategoryById(id);

    if (!result) {
        throw new NotFoundError("Category not found");
    }

    return result;
};

const getCategoryByName = async (name) => {
    const result = await categoriesRepository.findCategoryByName(name);

    if (!result) {
        throw new NotFoundError("Category not found");
    }

    return result;
};

const postCategory = async (name) => {
    const result = await categoriesRepository.addNewCategory(name);

    return result;
};

const patchCategory = async (id, name) => {
    const result = await categoriesRepository.updateCategory(id, name);

    if (!result) {
        throw new NotFoundError("Category not found");
    }

    return result;
};

const deleteCategory = async (id) => {
    const result = await categoriesRepository.deleteCategory(id);

    if (!result) {
        throw new NotFoundError("Category not found");
    }

    return result;
};

const categoriesService = {
    getAllCategories,
    getCategoryById,
    getCategoryByName,
    postCategory,
    patchCategory,
    deleteCategory
};

export default categoriesService;