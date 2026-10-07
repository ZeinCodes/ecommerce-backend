import NotFoundError from "../errors/NotFoundError.js";
import addressesRepository from "../repositories/addresses.repository.js";

const getAddresses = async (userId) => {
    return addressesRepository.findAllByUser(userId);
};

const getAddressById = async (id, userId) => {
    const result = await addressesRepository.findById(id, userId);

    if (!result) {
        throw new NotFoundError("Address not found");
    }

    return result;
};

const postAddress = async (userId, data) => {
    return addressesRepository.createAddress(userId, data);
};

const patchAddress = async (id, userId, updates) => {
    const result = await addressesRepository.updateAddress(id, userId, updates);

    if (!result) {
        throw new NotFoundError("Address not found");
    }

    return result;
};

const deleteAddress = async (id, userId) => {
    const result = await addressesRepository.deleteAddress(id, userId);

    if (!result) {
        throw new NotFoundError("Address not found");
    }

    return result;
};

const addressesService = {
    getAddresses,
    getAddressById,
    postAddress,
    patchAddress,
    deleteAddress
};

export default addressesService;