import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

function getServerUrl(): string {
  const host = window.location.hostname;
  const port = window.location.port;
  
  if (port === '5173') {
    return `http://${host}:3001`;
  }
  return `http://${host}:${port || '3001'}`;
}

export function getSocket(): Socket {
  if (!socket) {
    const url = getServerUrl();
    console.log('Connecting to server:', url);
    socket = io(url);
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
