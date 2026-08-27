import productsService from "../services/products.service.js";

const getAllProducts = async (req, res, next) => {
    try {

        const { 
            page, 
            limit, 
            category_id, 
            min_price, 
            max_price 
        } = req.validated.query;

        const { name } = req.query;
        
        if (name) {
            const result = await productsService.getProductByName(name);

            return res.status(200).json({
                success: true,
                result
            });
        }

        const result = await productsService.getAllProducts(
            page,
            limit,
            category_id,
            min_price,
            max_price
        );
        
        const totalPages = Math.ceil(
            result.total / limit
        );
        
        if (result.products.length === 0) {
            res.status(200).json({
            success: true,
            category_id: category_id,
            result: "There is no products",
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
 
        }
        res.status(200).json({
            success: true,
            category_id: category_id,
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

        res.status(200).json({
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
        } = req.body;

        const result = await productsService.postProduct(
            category_id,
            name,
            description,
            price,
            stock,
            sku
        );

        res.status(201).json({
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

        const updates = req.body;
        const fields = Object.keys(updates);

        const result = await productsService.patchProduct(
            fields,
            updates,
            id
        );

        res.status(200).json({
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

        res.status(200).json({
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