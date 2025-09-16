import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createMockPrismaClient } from './prisma-mock';

// Create mock Prisma client
const mockPrisma = createMockPrismaClient();

// Mock the Prisma client in the services
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

// Import routes after mocking
import candidateRoutes from '../../src/routes/candidateRoutes';
import positionRoutes from '../../src/routes/positionRoutes';
import { uploadFile } from '../../src/application/services/fileUploadService';

// Mock the domain models to use our mock Prisma
jest.mock('../../src/domain/models/Candidate', () => ({
  Candidate: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockImplementation(async () => {
      return await mockPrisma.candidate.create({ data });
    }),
    educations: [],
    workExperiences: [],
    resumes: []
  }))
}));

// Mock the static findOne method
jest.mock('../../src/domain/models/Candidate', () => {
  const originalModule = jest.requireActual('../../src/domain/models/Candidate');
  return {
    ...originalModule,
    Candidate: jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockImplementation(async () => {
        return await mockPrisma.candidate.create({ data });
      }),
      educations: [],
      workExperiences: [],
      resumes: []
    }))
  };
});

// Mock the static findOne method separately
const mockCandidateModule = require('../../src/domain/models/Candidate');
mockCandidateModule.Candidate.findOne = jest.fn().mockImplementation(async (id: number) => {
  return await mockPrisma.candidate.findUnique({
    where: { id },
    include: {
      educations: true,
      workExperiences: true,
      resumes: true
    }
  });
});

jest.mock('../../src/domain/models/Education', () => ({
  Education: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockImplementation(async () => {
      return await mockPrisma.education.create({ data });
    })
  }))
}));

jest.mock('../../src/domain/models/WorkExperience', () => ({
  WorkExperience: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockImplementation(async () => {
      return await mockPrisma.workExperience.create({ data });
    })
  }))
}));

jest.mock('../../src/domain/models/Resume', () => ({
  Resume: jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockImplementation(async () => {
      return await mockPrisma.resume.create({ data });
    })
  }))
}));

jest.mock('../../src/domain/models/Application', () => ({
  Application: {
    findOneByPositionCandidateId: jest.fn().mockImplementation(async (applicationId, candidateId) => {
      const application = await mockPrisma.application.findFirst({
        where: { id: applicationId, candidateId }
      });
      if (!application) return null;
      
      return {
        ...application,
        save: jest.fn().mockImplementation(async () => {
          return await mockPrisma.application.update({
            where: { id: application.id },
            data: { currentInterviewStep: application.currentInterviewStep }
          });
        })
      };
    })
  }
}));

declare global {
  namespace Express {
    interface Request {
      prisma: typeof mockPrisma;
    }
  }
}

dotenv.config();

export const app = express();

app.use(express.json());
app.use((req, res, next) => {
  req.prisma = mockPrisma;
  next();
});
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use('/candidates', candidateRoutes);
app.post('/upload', uploadFile);
app.use('/positions', positionRoutes);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});
