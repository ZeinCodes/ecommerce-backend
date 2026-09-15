import * as cartService from "../services/cart.service.js";

const getCart = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const cart = await cartService.getCart(userId);

        res.status(200).json({
            success: true,
            message: "Cart retrieved",
            ...cart
        });
    } catch (error) {
        next(error);
    }
};

const addItemToCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { product_id, quantity } = req.validated.body;

        const cartItem = await cartService.addItemToCart(
            userId,
            product_id,
            quantity
        );

        res.status(201).json({
            success: true,
            message: "Product added to cart",
            cartItem
        });
    } catch (error) {
        next(error);
    }
};

const updateItemQuantity = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { quantity } = req.validated.body;

        const cartItem = await cartService.updateItemQuantity(
            id,
            userId,
            quantity
        );

        res.status(200).json({
            success: true,
            message: "Cart item quantity updated",
            cartItem
        });
    } catch (error) {
        next(error);
    }
};

const removeItem = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        await cartService.removeItem(id, userId);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export {
    getCart,
    addItemToCart,
    updateItemQuantity,
    removeItem
};