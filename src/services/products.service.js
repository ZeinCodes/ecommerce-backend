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

    const images = await productsRepository.getImages(id);

    return {
        ...result,
        images
    };
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

const getProductImages = async (productId) => {
    const result = await productsRepository.getImages(
        productId
    )

    return result;
} 

const addImageToProduct = async (productId, files) => {
    const result = await productsRepository.postImages(
        productId, 
        files
    );
    return result;
}

const deleteProductImage = async (productId, imageId) => {
    const result = await productsRepository.deleteImage(
        productId,
        imageId
    )
    return result;
}

const productsService = {
    getAllProducts,
    getProductById,
    getProductByName,
    postProduct,
    patchProduct,
    deleteProduct,
    getProductImages,
    addImageToProduct,
    deleteProductImage
};

export default productsService;