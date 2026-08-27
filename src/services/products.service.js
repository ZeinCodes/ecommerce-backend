import NotFoundError from "../errors/NotFoundError.js";
import productsRepository from "../repositories/products.repository.js";

const getAllProducts = async (
    page, 
    limit, 
    category_id, 
    min_price, 
    max_price
) => {
    
    return productsRepository.findAllProducts(
        page, limit, category_id, min_price, max_price
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

    if (!result) {
        throw new NotFoundError("Product not found");
    }

    return result;
};

const deleteProduct = async (id) => {
    const result = await productsRepository.deleteProduct(id);

    if (!result) {
        throw new NotFoundError("Product not found");
    }

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