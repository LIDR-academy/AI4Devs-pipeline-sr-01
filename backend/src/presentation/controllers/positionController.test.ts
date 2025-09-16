import { getCandidatesByPosition, getInterviewFlowByPosition, getAllPositions } from './positionController';
import { Request, Response } from 'express';
import { getCandidatesByPositionService, getInterviewFlowByPositionService, getAllPositionsService } from '../../application/services/positionService';

jest.mock('../../application/services/positionService');

describe('positionController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCandidatesByPosition', () => {
    it('should return 200 and candidates data', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockCandidates = [
        { 
          fullName: 'John Doe', 
          currentInterviewStep: 'Technical Interview', 
          averageScore: 4,
          applicationId: 1,
          candidateId: 1
        },
        { 
          fullName: 'Jane Smith', 
          currentInterviewStep: 'HR Interview', 
          averageScore: 4.25,
          applicationId: 2,
          candidateId: 2
        }
      ];

      (getCandidatesByPositionService as jest.Mock).mockResolvedValue(mockCandidates);

      await getCandidatesByPosition(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCandidates);
    });

    it('should return 400 for invalid position ID format', async () => {
      const req = { params: { id: 'abc' } } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await getCandidatesByPosition(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid position ID format'
      });
    });

    it('should return 500 for service errors', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      (getCandidatesByPositionService as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      await getCandidatesByPosition(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error retrieving candidates',
        error: 'Database connection failed'
      });
    });
  });

  describe('getInterviewFlowByPosition', () => {
    it('should return 200 and interview flow data', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockInterviewFlow = {
        positionName: 'Software Engineer',
        interviewFlow: {
          id: 1,
          description: 'Standard development interview process',
          interviewSteps: [
            { id: 1, interviewFlowId: 1, interviewTypeId: 1, name: 'Initial Screening', orderIndex: 1 },
            { id: 2, interviewFlowId: 1, interviewTypeId: 2, name: 'Technical Interview', orderIndex: 2 },
            { id: 3, interviewFlowId: 1, interviewTypeId: 3, name: 'Manager Interview', orderIndex: 3 },
            { id: 4, interviewFlowId: 1, interviewTypeId: 4, name: 'Final Decision', orderIndex: 4 },
          ]
        }
      };

      (getInterviewFlowByPositionService as jest.Mock).mockResolvedValue(mockInterviewFlow);

      await getInterviewFlowByPosition(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ interviewFlow: mockInterviewFlow });
    });

    it('should return 404 when position is not found', async () => {
      const req = { params: { id: '999' } } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      (getInterviewFlowByPositionService as jest.Mock).mockRejectedValue(new Error('Position not found'));

      await getInterviewFlowByPosition(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Position not found',
        error: 'Position not found'
      });
    });

    it('should return 404 for any error (current controller behavior)', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      (getInterviewFlowByPositionService as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      await getInterviewFlowByPosition(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Position not found',
        error: 'Database connection failed'
      });
    });
  });

  describe('getAllPositions', () => {
    it('should return 200 and all visible positions', async () => {
      const req = {} as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockPositions = [
        {
          id: 1,
          title: 'Software Engineer',
          description: 'Develop software applications',
          status: 'Open',
          isVisible: true,
          location: 'Remote',
          salaryMin: 50000,
          salaryMax: 80000,
          employmentType: 'Full-time',
          applicationDeadline: new Date('2024-12-31')
        },
        {
          id: 2,
          title: 'Product Manager',
          description: 'Manage product development',
          status: 'Open',
          isVisible: true,
          location: 'New York',
          salaryMin: 80000,
          salaryMax: 120000,
          employmentType: 'Full-time',
          applicationDeadline: new Date('2024-11-30')
        }
      ];

      (getAllPositionsService as jest.Mock).mockResolvedValue(mockPositions);

      await getAllPositions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockPositions);
    });

    it('should return 500 for service errors', async () => {
      const req = {} as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      (getAllPositionsService as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      await getAllPositions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error retrieving positions',
        error: 'Database connection failed'
      });
    });

    it('should handle non-Error objects', async () => {
      const req = {} as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      (getAllPositionsService as jest.Mock).mockRejectedValue('String error');

      await getAllPositions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error retrieving positions',
        error: 'String error'
      });
    });
  });
});