import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { User } from 'src/entities/user.entity';

@Injectable()
export class KalmsystemService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll() {
    return await this.userRepository.find({
      where: {
        status_user: 'active',
        name: Not(''),
      },
      order: {
        created_at: 'DESC',
      },
    });
  }
}
