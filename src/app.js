import express from "express";
import usersRouter from "./routes/users.routes.js";
import authRouter from "./routes/auth.routes.js";
import categoriesRouter from "./routes/categories.routes.js";
import errorHandler from "./middlewares/errorHandler.js";
import productsRouter from "./routes/products.routes.js";
import ordersRouter from "./routes/orders.routes.js";

const app = express();

app.use(express.json());

app.use(authRouter);
app.use(usersRouter);
app.use(categoriesRouter);
app.use(productsRouter);
app.use(ordersRouter)

app.use(errorHandler);

export default app;