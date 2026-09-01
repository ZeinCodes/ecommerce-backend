import productsService from "../services/products.service.js";

const getAllProducts = async (req, res, next) => {
    try {
        const {
            page,
            limit,
            category_id,
            min_price,
            max_price,
            name,
            sortBy,
            order
        } = req.validated.query;

        const result = await productsService.getAllProducts(
            page,
            limit,
            category_id,
            min_price,
            max_price,
            name,
            sortBy,
            order
        );

        const totalPages = Math.ceil(result.total / limit);

        return res.status(200).json({
            success: true,
            result: result.products,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await productsService.getProductById(id);

        return res.status(200).json({
            success: true,
            result
        });
    } catch (error) {
        next(error);
    }
};

const postProduct = async (req, res, next) => {
    try {
        const {
            category_id,
            name,
            description,
            price,
            stock,
            sku
        } = req.validated.body;

        const result = await productsService.postProduct(
            category_id,
            name,
            description,
            price,
            stock,
            sku
        );

        return res.status(201).json({
            message: "New product created",
            success: true,
            result
        });
    } catch (error) {
        next(error);
    }
};

const patchProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.validated.body;
        const fields = Object.keys(updates);

        const result = await productsService.patchProduct(
            fields,
            updates,
            id
        );

        return res.status(200).json({
            message: "Product updated",
            success: true,
            result
        });
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await productsService.deleteProduct(id);

        return res.status(200).json({
            message: "Product has been deleted",
            success: true,
            result
        });
    } catch (error) {
        next(error);
    }
};

const productsController = {
    getAllProducts,
    getProductById,
    postProduct,
    patchProduct,
    deleteProduct
};

export default productsController;