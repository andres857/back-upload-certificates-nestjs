import { Controller, Get } from '@nestjs/common';
import { KalmsystemService } from './kalmsystem.service';

@Controller('kalmsystem')
export class KalmsystemController {
  constructor(private readonly kalmsystemService: KalmsystemService) {}

  @Get()
  async findAll() {
    return await this.kalmsystemService.findAll();
  }
}
