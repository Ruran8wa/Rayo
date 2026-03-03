import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockService = {
  listUsers: jest.fn(),
  getPreferences: jest.fn(),
  upsertPreferences: jest.fn(),
  getSavedPlaces: jest.fn(),
  savePlace: jest.fn(),
  removePlace: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockService }],
    }).compile();
    controller = module.get(UsersController);
  });

  describe('listUsers', () => {
    it('delegates to usersService.listUsers', async () => {
      const expected = {
        users: [{ id: '1', email: 'a@b.com', created_at: '2026-01-01', last_sign_in_at: null }],
      };
      mockService.listUsers.mockResolvedValue(expected);

      const result = await controller.listUsers();

      expect(mockService.listUsers).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });
});
