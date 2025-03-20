import express from 'express';
import morgan from 'morgan';
import connect from './database/connectDB.js';
import userRouter from './routes/user.route.js';
import projectRouter from './routes/project.route.js';
import aiRouter from './routes/ai.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

connect();

const app = express();
// //cors, which allows frontend apps (React, Vue, Angular, etc.) to communicate with your backend API.
// const allowedOrigins = process.env.FRONTEND_URL?.split(',');

// // app.use(cors({
// //     origin: 'https://collab-ai-project.vercel.app', // Allow requests from your frontend
// //     methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
// //     credentials: true, // If you're using cookies for authentication
// // }));

// app.use(cors({
//     origin: (origin, callback) => {
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

// Enable preflight requests for all routes
// app.options('*', cors()); // Add this line here

app.use(cors({
    origin: ['https://collab-ai-project.vercel.app','http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization','X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Date', 'X-Api-Version'],
    credentials: true
}));

// Morgan, which is a middleware for logging HTTP requests in Node.js applications, commonly used with Express.js.
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/users', userRouter);
app.use('/projects', projectRouter);
app.use('/ai', aiRouter);

app.get('/', (req, res) => {
    res.send("Welcome to Collab AI!");
});

export default app;