
import * as wishlistService from "../services/wishlist.service.js";

const getWishlistItems = async (req, res) => {
    const userId = req.user.id;

    const items = await wishlistService.getWishlistItems(userId);

    res.status(200).json({
        success: true,
        data: items
    });
};

const addWishlistItem = async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;

    const item = await wishlistService.addWishlistItem(
        userId,
        productId
    );

    res.status(201).json({
        success: true,
        message: "Product added to wishlist successfully",
        data: item
    });
};

const removeWishlistItem = async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;

    const item = await wishlistService.removeWishlistItem(
        userId,
        productId
    );

    res.status(200).json({
        success: true,
        message: "Product removed from wishlist successfully",
        data: item
    });
};

export {
    getWishlistItems,
    addWishlistItem,
    removeWishlistItem
};