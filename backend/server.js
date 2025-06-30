// import express from 'express'
// import cors from 'cors'

// import dotenv from 'dotenv'
// import ConnectDb from './src/lib/db.js';
// import authRouter from './src/router/authRouter.js';
// import messageRouter from './src/router/messageRouter.js';


// dotenv.config()

// const app = express();
// app.use(express.json())
// app.use(cors({
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Autherization"]

// }))
// ConnectDb()
// app.use('/auth',authRouter)
// app.use('/message',messageRouter)


// const PORT = process.env.port ||5000
// app.listen(PORT, () =>
//     console.log(`server running at ${PORT}`)
// )
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'

import ConnectDb from './src/lib/db.js'
import authRouter from './src/router/authRouter.js'
import messageRouter from './src/router/messageRouter.js'
import { setupSocket } from './src/lib/socket.js'
import cookieParser from 'cookie-parser';

// after app initialization



dotenv.config()

const app = express()
const server = http.createServer(app)

app.use(express.json())
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(cookieParser());
ConnectDb()

app.use('/auth', authRouter)
app.use('/message', messageRouter)

// setup socket
setupSocket(server)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running at ${PORT}`))
