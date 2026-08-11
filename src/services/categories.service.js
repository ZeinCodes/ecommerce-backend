import NotFoundError from "../errors/NotFoundError.js";
import categoriesRepository from "../repositories/categories.repositories.js";

const getAllCategories = async () => {
    const result = await categoriesRepository.findAllCategories();
    return result;
}

const getCategoryById = async (id) => {
    const result = await categoriesRepository.findCategoryById(id);
    if (!result) {
        throw new NotFoundError();
    }
    return result;
}
 
const getCategoryByName = async (name) => {
    const result = await categoriesRepository.findCategoryByName(name);
    if (!result) {
        throw new NotFoundError();
    }
    return result;
}
 
const postCategory = async (name) => {
    const result = await categoriesRepository.addNewCategory(name);
    return result;
}

const patchCategory = async (id, name) => {
    const result = await categoriesRepository.updateCategory(id, name);
    if (!result) {
        throw new NotFoundError();
    }
    return result;
}

const deleteCategory = async (id) => {
    const result = await categoriesRepository.deleteCategory(id);
    if (!result) {
        throw new NotFoundError();
    }
    return result;
}

const categoriesService = {
    getAllCategories, 
    getCategoryById,
    getCategoryByName,
    postCategory, 
    patchCategory,
    deleteCategory
}

export default categoriesService;