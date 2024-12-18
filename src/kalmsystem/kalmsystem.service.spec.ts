import { Test, TestingModule } from '@nestjs/testing';
import { KalmsystemService } from './kalmsystem.service';

describe('KalmsystemService', () => {
  let service: KalmsystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KalmsystemService],
    }).compile();

    service = module.get<KalmsystemService>(KalmsystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
