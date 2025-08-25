const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Moving API",
      version: "1.0.0",
      description:
        "Swagger Docs for Codeit Team4 Moving Project<br/>Website URL: [https://moving-web.site/](https://moving-web.site/)",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [],
    servers: [
      {
        url: "/",
      },
    ],
  },
  apis: [path.resolve(__dirname, "*.yaml")],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
