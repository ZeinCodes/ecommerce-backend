import * as cartRepository from "../repositories/cart.repositories.js";
import NotFoundError from "../errors/NotFoundError.js";
import BadRequestError from "../errors/BadRequestError.js";
import productsRepository from "../repositories/products.repository.js";

const buildCartResponse = (items) => {
    const itemCount = items.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const subtotal = items.reduce(
        (sum, item) => sum + Number(item.subtotal),
        0
    );

    return {
        items,
        itemCount,
        subtotal
    };
};

const getCart = async (userId) => {
    const items = await cartRepository.getCartItems(userId);

    return buildCartResponse(items);
};

const addItemToCart = async (userId, productId, quantity) => {
    const product = await productsRepository.findProductById(productId);

    if (!product) {
        throw new NotFoundError("Product not found");
    }

    const existingItem = await cartRepository.findCartItemByProduct(
        userId,
        productId
    );

    const totalQuantity = existingItem
        ? existingItem.quantity + quantity
        : quantity;

    if (product.stock < totalQuantity) {
        throw new BadRequestError("Insufficient stock");
    }

    if (existingItem) {
        return cartRepository.incrementCartItemQuantity(
            existingItem.id,
            userId,
            quantity
        );
    }

    return cartRepository.insertCartItem(
        userId,
        productId,
        quantity
    );
};

const updateItemQuantity = async (id, userId, quantity) => {
    const existingItem = await cartRepository.findCartItemById(id, userId);

    if (!existingItem) {
        throw new NotFoundError("Cart item not found");
    }

    const product = await productsRepository.findProductById(
        existingItem.product_id
    );

    if (!product) {
        throw new NotFoundError("Product not found");
    }

    if (product.stock < quantity) {
        throw new BadRequestError("Insufficient stock");
    }

    return cartRepository.updateCartItemQuantity(
        id,
        userId,
        quantity
    );
};

const removeItem = async (id, userId) => {
    const deletedItem = await cartRepository.deleteCartItem(id, userId);

    if (!deletedItem) {
        throw new NotFoundError("Cart item not found");
    }

    return deletedItem;
};

export {
    getCart,
    addItemToCart,
    updateItemQuantity,
    removeItem
};