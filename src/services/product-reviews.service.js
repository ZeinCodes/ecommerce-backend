import NotFoundError from "../errors/NotFoundError.js";
import reviewsRepository from "../repositories/product-reviews.repository.js";
import productsRepository from "../repositories/products.repository.js";

const getAllReviews = async (
    productId,
    page,
    limit
) => {
    const product = await productsRepository.findProductById(productId);

    if (!product) {
        throw new NotFoundError("Product not found");
    }

    return reviewsRepository.findAllReviews(
        productId,
        page,
        limit
    );
};

const getReviewById = async (id, productId) => {
    const result = await reviewsRepository.findReviewById(
        id,
        productId
    );

    if (!result) {
        throw new NotFoundError("Review not found");
    }

    return result;
};

const postReview = async (
    userId,
    productId,
    rating,
    user_comment
) => {
    const product = await productsRepository.findProductById(productId);

    if (!product) {
        throw new NotFoundError("Product not found");
    }

    return reviewsRepository.addNewReview(
        userId,
        productId,
        rating,
        user_comment
    );
};

const patchReview = async (
    id,
    productId,
    userId,
    updates
) => {
    const result = await reviewsRepository.updateReview(
        id,
        productId,
        userId,
        updates
    );

    if (!result) {
        throw new NotFoundError("Review not found or you are not the owner");
    }

    return result;
};

const deleteReview = async (
    id,
    productId,
    userId
) => {
    const result = await reviewsRepository.deleteReview(
        id,
        productId,
        userId
    );

    if (!result) {
        throw new NotFoundError("Review not found or you are not the owner");
    }

    return result;
};

const reviewsService = {
    getAllReviews,
    getReviewById,
    postReview,
    patchReview,
    deleteReview
};

export default reviewsService;