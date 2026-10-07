import addressesService from "../services/addresses.service.js";

const getAddresses = async (req, res, next) => {
    try {
        const result = await addressesService.getAddresses(req.user.id);

        return res.status(200).json({
            success: true,
            result
        });
    } catch (error) {
        next(error);
    }
};

const getAddressById = async (req, res, next) => {
    try {
        const result = await addressesService.getAddressById(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            result
        });
    } catch (error) {
        next(error);
    }
};

const postAddress = async (req, res, next) => {
    try {
        const result = await addressesService.postAddress(
            req.user.id,
            req.validated.body
        );

        return res.status(201).json({
            message: "Address created",
            success: true,
            result
        });
    } catch (error) {
        next(error);
    }
};

const patchAddress = async (req, res, next) => {
    try {
        const result = await addressesService.patchAddress(
            req.params.id,
            req.user.id,
            req.validated.body
        );

        return res.status(200).json({
            message: "Address updated",
            success: true,
            result
        });
    } catch (error) {
        next(error);
    }
};

const deleteAddress = async (req, res, next) => {
    try {
        await addressesService.deleteAddress(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            message: "Address has been deleted",
            success: true
        });
    } catch (error) {
        next(error);
    }
};

const addressesController = {
    getAddresses,
    getAddressById,
    postAddress,
    patchAddress,
    deleteAddress
};

export default addressesController;