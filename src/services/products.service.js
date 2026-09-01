import NotFoundError from "../errors/NotFoundError.js";
import productsRepository from "../repositories/products.repository.js";

const getAllProducts = async (
    page,
    limit,
    category_id,
    min_price,
    max_price,
    name,
    sortBy,
    order
) => {
    return productsRepository.findAllProducts(
        page,
        limit,
        category_id,
        min_price,
        max_price,
        name,
        sortBy,
        order
    );
};

const getProductById = async (id) => {
    const result = await productsRepository.findProductById(id);

    if (!result) {
        throw new NotFoundError("Product not found");
    }

    return result;
};

const getProductByName = async (name) => {
    const result = await productsRepository.findProductByName(name);

    if (!result) {
        throw new NotFoundError("Product not found");
    }

    return result;
};

const postProduct = async (
    category_id,
    name,
    description,
    price,
    stock,
    sku
) => {
    return await productsRepository.addNewProduct(
        category_id,
        name,
        description,
        price,
        stock,
        sku
    );
};

const patchProduct = async (fields, updates, id) => {
    const result = await productsRepository.updateProduct(
        fields,
        updates,
        id
    );

    return result;
};

const deleteProduct = async (id) => {
    const result = await productsRepository.deleteProduct(id);

    return result;
};

const productsService = {
    getAllProducts,
    getProductById,
    getProductByName,
    postProduct,
    patchProduct,
    deleteProduct
};

export default productsService;