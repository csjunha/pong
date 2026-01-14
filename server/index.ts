import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupSocketHandlers } from './socketHandlers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
    const distPath = path.join(__dirname, '..', 'dist');
    app.use(express.static(distPath));
    app.use((req, res, next) => {
        if (req.path.startsWith('/socket.io')) return next();
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

setupSocketHandlers(io);

const PORT = Number(process.env.PORT) || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    if (isProduction) {
        console.log('Serving static files from dist/');
    }
    console.log('Ready for connections from any device on the network');
});
