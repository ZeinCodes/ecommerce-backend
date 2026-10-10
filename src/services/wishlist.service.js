
import * as wishlistRepository from "../repositories/wishlist.repository.js";
import NotFoundError from "../errors/NotFoundError.js";

const getWishlistItems = async (userId) => {
    return await wishlistRepository.getWishlistItems(userId);
};

const addWishlistItem = async (userId, productId) => {
    const wishlistItem = await wishlistRepository.addWishlistItem(
        userId,
        productId
    );

    if (!wishlistItem) {
        throw new NotFoundError("Product not found");
    }

    return wishlistItem;
};

const removeWishlistItem = async (userId, productId) => {
    const wishlistItem = await wishlistRepository.removeWishlistItem(
        userId,
        productId
    );

    if (!wishlistItem) {
        throw new NotFoundError("Wishlist item not found");
    }

    return wishlistItem;
};

export {
    getWishlistItems,
    addWishlistItem,
    removeWishlistItem
};