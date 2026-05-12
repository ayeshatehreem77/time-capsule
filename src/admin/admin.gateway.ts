import {
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationGateway {
    @WebSocketServer()
    server!: Server;

    sendLog(log: any) {
        this.server.emit('new-log', log);
    }
    handleConnection(client: any) {
        const userId = client.handshake.query.userId;
        console.log("🟢 Connected:", userId);
        client.join(userId);
    }

    sendNotification(userId: string, data: any) {
        console.log("📡 Emitting to:", userId);
        this.server.to(userId).emit('new-notification', data);
    }
}