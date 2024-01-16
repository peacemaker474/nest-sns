import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatsService } from './chats.service';
import { EnterChatDto } from './dto/enter-chat.dto';

@WebSocketGateway({
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  constructor(private readonly chatsService: ChatsService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    console.log(`on connect called: ${socket.id}`);
  }

  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const chat = await this.chatsService.createChat(data);
    return chat;
  }

  @SubscribeMessage('enter_chat')
  async enterChat(
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    for (const chatId of data.chatIds) {
      const exists = await this.chatsService.checkExistChat(chatId);

      if (!exists) {
        throw new WsException({
          code: 100,
          message: `존재하지 않는 채팅방입니다. ChatID: ${chatId}`,
        });
      }
    }

    socket.join(data.chatIds.map((v) => v.toString()));
  }

  @SubscribeMessage('send_message')
  sendMessage(
    @MessageBody()
    message: {
      message: string;
      chatId: number;
    },
    @ConnectedSocket() socket: Socket,
  ) {
    socket
      .to(message.chatId.toString())
      .emit('receive_message', message.message);
  }
}
