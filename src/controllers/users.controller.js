import getFullUsers from "../services/users.service.js";

const getAllUsers = async(req, res) => {
    try {
        const { email, role } = req.query;

        const allUsers = await getFullUsers(email, role);
    
        res.status(200).json({
            message: 'success',
            allUsers
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

export default getAllUsers;