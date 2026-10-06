import swaggerJSDoc from "swagger-jsdoc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const routesGlob = path
    .join(currentDir, "../routes/*.js")
    .replace(/\\/g, "/");

const swaggerOption = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "E-commerce API",
            version: "1.0.0",
            description:
                "REST API for an e-commerce application"
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
                url: "/"
            }
        ]
    },

    apis: [
        routesGlob
    ],

    failOnErrors: true
};

const swaggerSpec =
    swaggerJSDoc(swaggerOption);

export default swaggerSpec;