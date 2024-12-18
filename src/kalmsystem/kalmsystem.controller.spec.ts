import { Test, TestingModule } from '@nestjs/testing';
import { KalmsystemController } from './kalmsystem.controller';

describe('KalmsystemController', () => {
  let controller: KalmsystemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KalmsystemController],
    }).compile();

    controller = module.get<KalmsystemController>(KalmsystemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
