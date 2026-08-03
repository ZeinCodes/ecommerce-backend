import express from 'express';
import router from './routes/users.routes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

app.use(router);

app.use(errorHandler)

export default app;