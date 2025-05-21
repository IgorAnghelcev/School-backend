import express from 'express';
import userRoutes from './routes/user';
import classRoutes from './routes/class';
import scheduleRoutes from './routes/schedule';
import lessonRoutes from './routes/lesson';
import authRoutes from './routes/auth';
import postRoutes from './routes/post';
import cookieParser from 'cookie-parser';
import {config} from "./config/config";
import passwordRoutes from './routes/password';

const app = express();
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('OK');
});

app.use(userRoutes);
app.use(classRoutes)
app.use(scheduleRoutes);
app.use(lessonRoutes);
app.use(authRoutes);
app.use(postRoutes);
app.use(passwordRoutes);
const PORT = config.PORT;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
