const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Moving API",
      version: "1.0.0",
      description: "swagger docs for codeit team4 moving project",
    },
    components: {
      securitySchemes: {
        jwt: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        jwt: [],
      },
    ],
    servers: [
      {
        url: "localhost:3000",
        describe: "local development server",
      },
    ],
  },
  apis: [path.resolve(__dirname, "swagger/*.yaml")],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
