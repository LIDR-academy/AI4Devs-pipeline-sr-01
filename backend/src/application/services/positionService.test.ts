import { getCandidatesByPositionService, getInterviewFlowByPositionService, getAllPositionsService } from './positionService';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    application: {
      findMany: jest.fn(),
    },
    position: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const mockPrisma = new PrismaClient();

describe('positionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCandidatesByPositionService', () => {
    it('should return candidates with their average scores', async () => {
      const mockApplications = [
        {
          id: 1,
          positionId: 1,
          candidateId: 1,
          applicationDate: new Date(),
          currentInterviewStep: 1,
          status: 'Pending',
          notes: null,
          candidate: { firstName: 'John', lastName: 'Doe' },
          interviewStep: { name: 'Technical Interview' },
          interviews: [{ score: 5 }, { score: 3 }],
        },
        {
          id: 2,
          positionId: 1,
          candidateId: 2,
          applicationDate: new Date(),
          currentInterviewStep: 2,
          status: 'Pending',
          notes: null,
          candidate: { firstName: 'Jane', lastName: 'Smith' },
          interviewStep: { name: 'HR Interview' },
          interviews: [{ score: 4 }, { score: 4.5 }],
        },
      ];

      jest.spyOn(mockPrisma.application, 'findMany').mockResolvedValue(mockApplications);

      const result = await getCandidatesByPositionService(1);
      
      expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
        where: { positionId: 1 },
        include: {
          candidate: true,
          interviews: true,
          interviewStep: true
        }
      });
      
      expect(result).toEqual([
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
        },
      ]);
    });

    it('should handle candidates with no interviews (average score 0)', async () => {
      const mockApplications = [
        {
          id: 1,
          positionId: 1,
          candidateId: 1,
          applicationDate: new Date(),
          currentInterviewStep: 1,
          status: 'Pending',
          notes: null,
          candidate: { firstName: 'John', lastName: 'Doe' },
          interviewStep: { name: 'Initial Screening' },
          interviews: [],
        },
      ];

      jest.spyOn(mockPrisma.application, 'findMany').mockResolvedValue(mockApplications);

      const result = await getCandidatesByPositionService(1);
      
      expect(result).toEqual([
        {
          fullName: 'John Doe',
          currentInterviewStep: 'Initial Screening',
          averageScore: 0,
          applicationId: 1,
          candidateId: 1
        },
      ]);
    });

    it('should throw error when database query fails', async () => {
      jest.spyOn(mockPrisma.application, 'findMany').mockRejectedValue(new Error('Database connection failed'));

      await expect(getCandidatesByPositionService(1)).rejects.toThrow('Error retrieving candidates by position');
    });
  });

  describe('getInterviewFlowByPositionService', () => {
    it('should return position with ordered interview flow', async () => {
      const mockPositionWithFlow = {
        id: 1,
        companyId: 1,
        interviewFlowId: 1,
        title: 'Software Engineer',
        description: 'Develop software applications',
        status: 'Open',
        isVisible: true,
        location: 'Remote',
        jobDescription: 'Full-stack development',
        salaryMin: 50000,
        salaryMax: 80000,
        employmentType: 'Full-time',
        benefits: 'Health insurance, 401k',
        contactInfo: 'hr@company.com',
        requirements: '3+ years experience',
        responsibilities: 'Develop and maintain applications',
        companyDescription: 'Leading tech company',
        applicationDeadline: new Date('2024-12-31'),
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

      jest.spyOn(mockPrisma.position, 'findUnique').mockResolvedValue(mockPositionWithFlow);

      const result = await getInterviewFlowByPositionService(1);
      
      expect(mockPrisma.position.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          interviewFlow: {
            include: {
              interviewSteps: {
                orderBy: {
                  orderIndex: 'asc'
                }
              }
            }
          }
        }
      });
      
      expect(result).toEqual({
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
      });
    });

    it('should throw error when position is not found', async () => {
      jest.spyOn(mockPrisma.position, 'findUnique').mockResolvedValue(null);

      await expect(getInterviewFlowByPositionService(999)).rejects.toThrow('Position not found');
    });
  });

  describe('getAllPositionsService', () => {
    it('should return all visible positions', async () => {
      const mockPositions = [
        {
          id: 1,
          companyId: 1,
          interviewFlowId: 1,
          title: 'Software Engineer',
          description: 'Develop software applications',
          status: 'Open',
          isVisible: true,
          location: 'Remote',
          jobDescription: 'Full-stack development',
          salaryMin: 50000,
          salaryMax: 80000,
          employmentType: 'Full-time',
          benefits: 'Health insurance, 401k',
          contactInfo: 'hr@company.com',
          requirements: '3+ years experience',
          responsibilities: 'Develop and maintain applications',
          companyDescription: 'Leading tech company',
          applicationDeadline: new Date('2024-12-31')
        },
        {
          id: 2,
          companyId: 1,
          interviewFlowId: 1,
          title: 'Product Manager',
          description: 'Manage product development',
          status: 'Open',
          isVisible: true,
          location: 'New York',
          jobDescription: 'Product management',
          salaryMin: 80000,
          salaryMax: 120000,
          employmentType: 'Full-time',
          benefits: 'Health insurance, 401k',
          contactInfo: 'hr@company.com',
          requirements: '5+ years experience',
          responsibilities: 'Manage product roadmap',
          companyDescription: 'Leading tech company',
          applicationDeadline: new Date('2024-11-30')
        }
      ];

      jest.spyOn(mockPrisma.position, 'findMany').mockResolvedValue(mockPositions);

      const result = await getAllPositionsService();
      
      expect(mockPrisma.position.findMany).toHaveBeenCalledWith({
        where: { isVisible: true }
      });
      
      expect(result).toEqual(mockPositions);
    });

    it('should throw error when database query fails', async () => {
      jest.spyOn(mockPrisma.position, 'findMany').mockRejectedValue(new Error('Database connection failed'));

      await expect(getAllPositionsService()).rejects.toThrow('Error retrieving all positions');
    });
  });
});

