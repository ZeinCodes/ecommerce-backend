import swaggerJSDoc from "swagger-jsdoc";

const swaggerOption = {
    definition: {
        openapi: "3.0.0",
        
        info: {
            title: "E-commerce API",
            version: "1.0.0",
            description: "REST API fro an e-commerce application"
        },

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },

        servers: [
            {
                url: "http://localhost:3000"
            }
        ]
    },
    apis: [
        "src/routes/*.js"
    ],

    failOnErrors: true
};

const swaggerSpec = swaggerJSDoc(swaggerOption);

export default swaggerSpec;