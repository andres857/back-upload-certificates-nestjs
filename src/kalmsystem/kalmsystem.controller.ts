import { Controller, Get, Param } from '@nestjs/common';
import { KalmsystemService } from './kalmsystem.service';

@Controller('kalmsystem')
export class KalmsystemController {
  constructor(private readonly kalmsystemService: KalmsystemService) {}

  @Get(':identification')
  async findByIdentification(@Param('identification') identification: string) {
    return await this.kalmsystemService.findByIdentification(identification);
  }
}
