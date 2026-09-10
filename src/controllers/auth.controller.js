import * as authService from "../services/auth.service.js";

const userLogin = async (req, res, next) => {
    try {        
        const { email, password } = req.validated.body;

        const result = await authService.login(
            email,
            password
        );

        res.status(200).json({
            success: true,
            message: `Welcome Back ${result.user.name}`,
            token: result.token
        });
    } catch (error) {
        console.log(error)
        next(error);
    }
};

const userRegister = async (req, res, next) => {
    try {
        
        const { name, email, password } = req.validated.body;
        
        const result = await authService.register(
            name, email, password
        );
        
        res.status(200).json({
            success: true,
            message: "Signed up",
            token: result.token
        })
    } catch (error) {
        next(error);        
    }
}

export {
    userLogin,
    userRegister
};