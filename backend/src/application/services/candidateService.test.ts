import { updateCandidateStage } from './candidateService';
import { Application } from '../../domain/models/Application';
import { PrismaClient } from '@prisma/client';

// Mock the Application model
jest.mock('../../domain/models/Application', () => ({
  Application: {
    findOneByPositionCandidateId: jest.fn(),
  }
}));

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    application: {
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const mockApplication = {
  id: 1,
  positionId: 1,
  candidateId: 1,
  currentInterviewStep: 1,
  applicationDate: new Date(),
  status: 'Pending',
  save: jest.fn(),
};

const mockCompleteApplication = {
  id: 1,
  positionId: 1,
  candidateId: 1,
  currentInterviewStep: 2,
  applicationDate: new Date(),
  status: 'Pending',
  notes: null,
  interviews: [
    { id: 1, score: 4.0, notes: 'Good interview' },
    { id: 2, score: 3.5, notes: 'Technical skills' }
  ],
  interviewStep: { id: 2, name: 'Technical Interview' },
  position: { id: 1, title: 'Software Engineer' },
  candidate: { id: 1, firstName: 'John', lastName: 'Doe' }
};

describe('updateCandidateStage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update the candidate stage and return the complete application with interviews', async () => {
    // Mock Application.findOneByPositionCandidateId
    (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(mockApplication);
    
    // Mock application.save
    mockApplication.save.mockResolvedValue(undefined);
    
    // Mock prisma.application.findUnique
    const mockPrisma = new PrismaClient();
    jest.spyOn(mockPrisma.application, 'findUnique').mockResolvedValue(mockCompleteApplication);

    const result = await updateCandidateStage(1, 1, 2);
    
    expect(Application.findOneByPositionCandidateId).toHaveBeenCalledWith(1, 1);
    expect(mockApplication.save).toHaveBeenCalled();
    expect(mockApplication.currentInterviewStep).toBe(2);
    expect(result).toEqual(mockCompleteApplication);
  });

  it('should throw error when application is not found', async () => {
    (Application.findOneByPositionCandidateId as jest.Mock).mockResolvedValue(null);

    await expect(updateCandidateStage(1, 1, 2)).rejects.toThrow('Application not found');
  });
});