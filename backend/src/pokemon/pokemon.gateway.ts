import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PokemonService } from './pokemon.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class PokemonGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PokemonGateway.name);

  constructor(
    private readonly pokemonService: PokemonService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Client attempting to connect: ${client.id}`);

      // Extraer token del handshake
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        this.logger.warn(
          `Connection rejected - No token provided: ${client.id}`,
        );
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      // Verificar token JWT
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });

      if (!payload || !payload.sub) {
        this.logger.warn(`Connection rejected - Invalid token: ${client.id}`);
        client.emit('error', { message: 'Invalid token' });
        client.disconnect();
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      client.data.userId = payload.sub;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      client.data.username = payload.username;

      this.logger.log(
        `Client connected successfully: ${client.id} (User: ${payload.username})`,
      );

      // Confirmar conexión exitosa al cliente
      client.emit('connected', {
        message: 'Connected successfully',
        userId: payload.sub,
      });
    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}:`, error);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      `Client disconnected: ${client.id} (User: ${client.data.username || 'Unknown'})`,
    );
  }

  @SubscribeMessage('request-sprite')
  async handleRequestSprite(@ConnectedSocket() client: Socket) {
    try {
      this.logger.log(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Sprite requested by user: ${client.data.username} (${client.id})`,
      );

      // Obtener sprite aleatorio
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const sprite = await this.pokemonService.getRandomSprite();

      // Emitir sprite al cliente
      client.emit('sprite-served', sprite);

      this.logger.log(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Sprite served to ${client.data.username}: ${sprite.name}`,
      );

      return { success: true };
    } catch (error) {
      this.logger.error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error serving sprite to ${client.data.username}:`,
        error,
      );

      // Emitir error al cliente
      client.emit('sprite-error', {
        message: 'Failed to fetch pokemon sprite',
      });

      return { success: false, error: 'Failed to fetch sprite' };
    }
  }

  @SubscribeMessage('delete-sprite')
  handleDeleteSprite(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { id: number },
  ) {
    try {
      this.logger.log(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Delete sprite requested by ${client.data.username}: ${data.id}`,
      );

      const result = this.pokemonService.remove(data.id);

      client.emit('sprite-deleted', result);

      return { success: true };
    } catch (error) {
      this.logger.error(`Error deleting sprite:`, error);
      return { success: false, error: 'Failed to delete sprite' };
    }
  }

  @SubscribeMessage('delete-all-sprites')
  handleDeleteAllSprites(@ConnectedSocket() client: Socket) {
    try {
      this.logger.log(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Delete all sprites requested by ${client.data.username}`,
      );

      const result = this.pokemonService.removeAll();

      client.emit('all-sprites-deleted', result);

      return { success: true };
    } catch (error) {
      this.logger.error(`Error deleting all sprites:`, error);
      return { success: false, error: 'Failed to delete sprites' };
    }
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    // Intentar obtener token desde query params
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const token =
      client.handshake.auth?.token ||
      (client.handshake.query?.token as string) ||
      null;

    // También intentar desde headers (Authorization: Bearer <token>)
    if (!token) {
      const authHeader = client.handshake.headers?.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return token;
  }
}
