import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { StorageService } from 'src/storage/storage.service';
import { User } from './interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(private readonly storage: StorageService) {}

  register(email: string): { apiKey: string } {
    const users = this.storage.read<User[]>('users.json');
    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      throw new ConflictException(`Email ${email} is already registered`);
    }

    const newUser: User = {
      id: randomUUID(),
      email,
      role: 'user',
      apiKey: randomUUID(),
      createdAt: new Date().toISOString(),
    };

    this.storage.write('users.json', [...users, newUser]);

    return { apiKey: newUser.apiKey };
  }

  regenerateKey(apiKey: string): { apiKey: string } {
    const users = this.storage.read<User[]>('users.json');
    const index = users.findIndex((user) => user.apiKey === apiKey);

    if (index === -1) {
      throw new NotFoundException('User not found');
    }

    const newKey = randomUUID();
    users[index] = { ...users[index], apiKey: newKey };

    this.storage.write('users.json', users);

    return { apiKey: newKey };
  }

  findByApiKey(apiKey: string): User | undefined {
    return this.storage
      .read<User[]>('users.json')
      .find((user) => user.apiKey === apiKey);
  }

  getMe(apiKey: string): Omit<User, 'apiKey'> {
    const user = this.findByApiKey(apiKey);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  deleteAccount(apiKey: string): void {
    const users = this.storage.read<User[]>('users.json');
    const index = users.findIndex((user) => user.apiKey === apiKey);

    if (index === -1) {
      throw new NotFoundException('User not found');
    }

    users.splice(index, 1);

    this.storage.write('users.json', users);
  }
}
