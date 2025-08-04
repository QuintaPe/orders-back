import { Server } from 'socket.io';

let io;

export const initializeWebSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('Cliente conectado:', socket.id);

        // Unirse a una sala específica para una mesa
        socket.on('join-table', (tableNumber) => {
            socket.join(`table-${tableNumber}`);
            console.log(`Cliente ${socket.id} se unió a la mesa ${tableNumber}`);
        });

        // Unirse a la sala de cocina (para cocineros)
        socket.on('join-kitchen', () => {
            socket.join('kitchen');
            console.log(`Cliente ${socket.id} se unió a la cocina`);
        });

        // Unirse a la sala de camareros
        socket.on('join-waiters', () => {
            socket.join('waiters');
            console.log(`Cliente ${socket.id} se unió a la sala de camareros`);
        });

        // Unirse a la sala de administradores
        socket.on('join-admin', () => {
            socket.join('admin');
            console.log(`Cliente ${socket.id} se unió a la sala de administradores`);
        });

        socket.on('disconnect', () => {
            console.log('Cliente desconectado:', socket.id);
        });
    });

    return io;
};

// Función para emitir eventos de pedidos
export const emitOrderEvent = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};

// Función para emitir eventos específicos a una mesa
export const emitToTable = (tableNumber, event, data) => {
    if (io) {
        io.to(`table-${tableNumber}`).emit(event, data);
    }
};

// Función para emitir eventos a la cocina
export const emitToKitchen = (event, data) => {
    if (io) {
        io.to('kitchen').emit(event, data);
    }
};

// Función para emitir eventos a los camareros
export const emitToWaiters = (event, data) => {
    if (io) {
        io.to('waiters').emit(event, data);
    }
};

// Función para emitir eventos a los administradores
export const emitToAdmin = (event, data) => {
    if (io) {
        io.to('admin').emit(event, data);
    }
};

// Eventos específicos para pedidos
export const orderEvents = {
    ORDER_CREATED: 'order:created',
    ORDER_UPDATED: 'order:updated',
    ORDER_COMPLETED: 'order:completed',
    ORDER_CANCELLED: 'order:cancelled',
    ORDER_STATUS_CHANGED: 'order:status-changed'
}; 