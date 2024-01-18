import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatsService } from './chats.service';
import { EnterChatDto } from './dto/enter-chat.dto';
import { CreateMessagesDto } from './messages/dto/create-messages.dto';
import { ChatsMessagesService } from './messages/messages.service';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { SocketCatchHttpExceptionFilter } from 'src/common/exception/socket-catch-http.exception-filter';
import { UsersModel } from 'src/users/entity/users.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({
  namespace: 'chats',
})
export class ChatsGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: ChatsMessagesService,
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: any) {
    console.log(`after gateway init`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`on disconnect called: ${socket.id}`);
  }

  async handleConnection(socket: Socket & { user: UsersModel }) {
    console.log(`on connect called: ${socket.id}`);

    const headers = socket.handshake.headers;
    const rawToken = headers['authorization'];

    if (!rawToken) {
      socket.disconnect();
    }

    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);
      const payload = this.authService.verifyToken(token);
      const user = await this.userService.getUserByEmail(payload.email);

      socket.user = user;

      return true;
    } catch (error) {
      socket.disconnect();
    }
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chat = await this.chatsService.createChat(data);
    return chat;
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('enter_chat')
  async enterChat(
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
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

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody()
    data: CreateMessagesDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chatExists = await this.chatsService.checkExistChat(data.chatId);

    if (!chatExists) {
      throw new WsException('존재하지 않는 채팅방입니다.');
    }

    const message = await this.messagesService.createMessage(
      data,
      socket.user.id,
    );

    socket
      .to(message.chat.id.toString())
      .emit('receive_message', message.message);
  }
}
