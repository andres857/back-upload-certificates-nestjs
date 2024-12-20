import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KalmsystemService } from './kalmsystem.service';
import { KalmsystemController } from './kalmsystem.controller';

import { User } from 'src/entities/user.entity';
import { UserCertificate } from 'src/entities/user-certificate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserCertificate])],
  providers: [KalmsystemService],
  controllers: [KalmsystemController],
  exports: [KalmsystemService],
})
export class KalmsystemModule {}
