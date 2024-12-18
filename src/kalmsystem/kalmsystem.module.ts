import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KalmsystemService } from './kalmsystem.service';
import { KalmsystemController } from './kalmsystem.controller';

import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [KalmsystemService],
  controllers: [KalmsystemController],
})
export class KalmsystemModule {}
