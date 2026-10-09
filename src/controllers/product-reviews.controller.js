import reviewsService from "../services/product-reviews.service.js";

const getAllReviews = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { page, limit } = req.validated.query;

        const result = await reviewsService.getAllReviews(
            productId,
            page,
            limit
        );

        const totalPages = Math.ceil(result.total / limit);

        return res.status(200).json({
            success: true,
            result: result.reviews,
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

const getReviewById = async (req, res, next) => {
    try {
        const { productId, reviewId } = req.params;

        const result = await reviewsService.getReviewById(
            reviewId,
            productId
        );

        return res.status(200).json({
            success: true,
            result
        });
    } catch (error) {
        next(error);
    }
};

const postReview = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;
        const { rating, user_comment } = req.validated.body;

        const result = await reviewsService.postReview(
            userId,
            productId,
            rating,
            user_comment
        );

        return res.status(201).json({
            message: "Review created",
            success: true,
            result
        });
    } catch (error) {
        next(error);
    }
};

const patchReview = async (req, res, next) => {
    try {
        const { productId, reviewId } = req.params;
        const userId = req.user.id;
        const updates = req.validated.body;

        const result = await reviewsService.patchReview(
            reviewId,
            productId,
            userId,
            updates
        );

        return res.status(200).json({
            message: "Review updated",
            success: true,
            result
        });
    } catch (error) {
        next(error);
    }
};

const deleteReview = async (req, res, next) => {
    try {
        const { productId, reviewId } = req.params;
        const userId = req.user.id;

        await reviewsService.deleteReview(
            reviewId,
            productId,
            userId
        );

        return res.status(200).json({
            message: "Review has been deleted",
            success: true
        });
    } catch (error) {
        next(error);
    }
};

const reviewsController = {
    getAllReviews,
    getReviewById,
    postReview,
    patchReview,
    deleteReview
};

export default reviewsController;