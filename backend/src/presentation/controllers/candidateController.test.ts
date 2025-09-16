import { updateCandidateStageController, addCandidateController, getCandidateById } from './candidateController';
import { Request, Response } from 'express';
import { updateCandidateStage, addCandidate, findCandidateById } from '../../application/services/candidateService';

jest.mock('../../application/services/candidateService');

describe('candidateController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateCandidateStageController', () => {
    it('should return 200 and updated candidate stage with complete application data', async () => {
      const req = { 
        params: { id: '1' }, 
        body: { applicationId: '1', currentInterviewStep: '2' } 
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockCompleteApplication = {
        id: 1,
        positionId: 1,
        candidateId: 1,
        currentInterviewStep: 2,
        applicationDate: new Date(),
        status: 'Pending',
        interviews: [
          { id: 1, score: 4.0, notes: 'Good interview' },
          { id: 2, score: 3.5, notes: 'Technical skills' }
        ],
        interviewStep: { id: 2, name: 'Technical Interview' },
        position: { id: 1, title: 'Software Engineer' },
        candidate: { id: 1, firstName: 'John', lastName: 'Doe' }
      };

      (updateCandidateStage as jest.Mock).mockResolvedValue(mockCompleteApplication);

      await updateCandidateStageController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Candidate stage updated successfully',
        data: mockCompleteApplication,
      });
    });

    it('should return 400 for invalid application ID format', async () => {
      const req = { 
        params: { id: '1' }, 
        body: { applicationId: 'abc', currentInterviewStep: '2' } 
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await updateCandidateStageController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid position ID format'
      });
    });

    it('should return 400 for invalid currentInterviewStep format', async () => {
      const req = { 
        params: { id: '1' }, 
        body: { applicationId: '1', currentInterviewStep: 'xyz' } 
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await updateCandidateStageController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid currentInterviewStep format'
      });
    });

    it('should return 404 when application is not found', async () => {
      const req = { 
        params: { id: '1' }, 
        body: { applicationId: '1', currentInterviewStep: '2' } 
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      (updateCandidateStage as jest.Mock).mockRejectedValue(new Error('Error: Application not found'));

      await updateCandidateStageController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Application not found',
        error: 'Error: Application not found'
      });
    });
  });

  describe('addCandidateController', () => {
    it('should return 201 and candidate data with nested records', async () => {
      const req = { 
        body: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@test.com',
          phone: '612345678',
          address: '123 Test St',
          educations: [
            { institution: 'University', title: 'Computer Science', startDate: '2020-01-01', endDate: '2024-01-01' }
          ],
          workExperiences: [
            { company: 'Tech Corp', position: 'Developer', startDate: '2024-01-01', endDate: null }
          ],
          cv: { filePath: '/uploads/resume.pdf', fileType: 'application/pdf' }
        }
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockCandidate = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '612345678',
        address: '123 Test St',
        educations: [
          { id: 1, institution: 'University', title: 'Computer Science', startDate: new Date('2020-01-01'), endDate: new Date('2024-01-01') }
        ],
        workExperiences: [
          { id: 1, company: 'Tech Corp', position: 'Developer', startDate: new Date('2024-01-01'), endDate: null }
        ],
        resumes: [
          { id: 1, filePath: '/uploads/resume.pdf', fileType: 'application/pdf' }
        ]
      };

      (addCandidate as jest.Mock).mockResolvedValue(mockCandidate);

      await addCandidateController(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Candidate added successfully',
        data: mockCandidate
      });
    });

    it('should return 400 for validation errors', async () => {
      const req = { 
        body: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'invalid-email',
          phone: '612345678',
          address: '123 Test St'
        }
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      (addCandidate as jest.Mock).mockRejectedValue(new Error('Invalid email format'));

      await addCandidateController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error adding candidate',
        error: 'Invalid email format'
      });
    });
  });

  describe('getCandidateById', () => {
    it('should return candidate data', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockCandidate = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '612345678',
        address: '123 Test St',
        educations: [],
        workExperiences: [],
        resumes: []
      };

      (findCandidateById as jest.Mock).mockResolvedValue(mockCandidate);

      await getCandidateById(req, res);

      expect(res.json).toHaveBeenCalledWith(mockCandidate);
    });

    it('should return 400 for invalid ID format', async () => {
      const req = { params: { id: 'abc' } } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await getCandidateById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid ID format'
      });
    });

    it('should return 404 when candidate is not found', async () => {
      const req = { params: { id: '999' } } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      (findCandidateById as jest.Mock).mockResolvedValue(null);

      await getCandidateById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Candidate not found'
      });
    });
  });
});