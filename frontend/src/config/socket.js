import socket from "socket.io-client";

let socketInstance = null;

export const initializeSocket = (projectId) => {
    socketInstance = socket(import.meta.env.VITE_API_URL, {
        auth: {
            token: localStorage.getItem('token')
        },
        query: {
            projectId
        }
    });
    return socketInstance;
}

// This setup ensures messages are sent with .emit() and received with .on(), preventing errors.

export const receiveMessage = (eventName, callback) => {
    socketInstance.on(eventName, callback);
}

export const sendMessage = (eventName, data) => {
    socketInstance.emit(eventName, data);
}