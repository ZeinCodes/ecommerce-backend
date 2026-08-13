import express from "express";
import usersRouter from "./routes/users.routes.js";
import authRouter from "./routes/auth.routes.js";
import categoriesRouter from "./routes/categories.routes.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

app.use(express.json());

app.use(usersRouter);
app.use(authRouter);
app.use(categoriesRouter);

app.use(errorHandler);

export default app;