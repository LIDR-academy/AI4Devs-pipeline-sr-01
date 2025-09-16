import { PrismaClient } from '@prisma/client';

// Mock data storage
const mockData = {
  companies: new Map(),
  interviewFlows: new Map(),
  positions: new Map(),
  interviewTypes: new Map(),
  interviewSteps: new Map(),
  employees: new Map(),
  candidates: new Map(),
  educations: new Map(),
  workExperiences: new Map(),
  resumes: new Map(),
  applications: new Map(),
  interviews: new Map(),
};

// Counter for auto-incrementing IDs
let idCounter = 1;

// Helper function to get next ID
const getNextId = () => idCounter++;

// Helper function to create mock record
const createMockRecord = (data: any, id?: number) => {
  const record: any = {
    id: id || getNextId(),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Convert date strings to Date objects for specific fields
  if (record.startDate && typeof record.startDate === 'string') {
    record.startDate = new Date(record.startDate);
  }
  if (record.endDate && typeof record.endDate === 'string') {
    record.endDate = new Date(record.endDate);
  }
  if (record.applicationDate && typeof record.applicationDate === 'string') {
    record.applicationDate = new Date(record.applicationDate);
  }
  if (record.interviewDate && typeof record.interviewDate === 'string') {
    record.interviewDate = new Date(record.interviewDate);
  }
  if (record.applicationDeadline && typeof record.applicationDeadline === 'string') {
    record.applicationDeadline = new Date(record.applicationDeadline);
  }
  
  return record;
};

// Mock Prisma Client
export const createMockPrismaClient = () => {
  const mockPrisma = {
    company: {
      findFirst: jest.fn().mockImplementation(({ where }) => {
        const companies = Array.from(mockData.companies.values());
        return Promise.resolve(companies.find(c => 
          Object.keys(where).every(key => c[key] === where[key])
        ) || null);
      }),
      create: jest.fn().mockImplementation(({ data }) => {
        const company = createMockRecord(data);
        mockData.companies.set(company.id, company);
        return Promise.resolve(company);
      }),
      findMany: jest.fn().mockImplementation(() => {
        return Promise.resolve(Array.from(mockData.companies.values()));
      }),
      deleteMany: jest.fn().mockImplementation(() => {
        mockData.companies.clear();
        return Promise.resolve({ count: 0 });
      }),
    },
    interviewFlow: {
      findFirst: jest.fn().mockImplementation(({ where }) => {
        const flows = Array.from(mockData.interviewFlows.values());
        return Promise.resolve(flows.find(f => 
          Object.keys(where).every(key => f[key] === where[key])
        ) || null);
      }),
      create: jest.fn().mockImplementation(({ data }) => {
        const flow = createMockRecord(data);
        mockData.interviewFlows.set(flow.id, flow);
        return Promise.resolve(flow);
      }),
      findMany: jest.fn().mockImplementation(() => {
        return Promise.resolve(Array.from(mockData.interviewFlows.values()));
      }),
      deleteMany: jest.fn().mockImplementation(() => {
        mockData.interviewFlows.clear();
        return Promise.resolve({ count: 0 });
      }),
    },
    position: {
      findFirst: jest.fn().mockImplementation(({ where }) => {
        const positions = Array.from(mockData.positions.values());
        return Promise.resolve(positions.find(p => 
          Object.keys(where).every(key => p[key] === where[key])
        ) || null);
      }),
      create: jest.fn().mockImplementation(({ data }) => {
        const position = createMockRecord(data);
        mockData.positions.set(position.id, position);
        return Promise.resolve(position);
      }),
      findUnique: jest.fn().mockImplementation(({ where, include }) => {
        const position = mockData.positions.get(where.id);
        if (!position) return Promise.resolve(null);
        
        if (include) {
          const result = { ...position };
          if (include.interviewFlow) {
            result.interviewFlow = mockData.interviewFlows.get(position.interviewFlowId);
            if (include.interviewFlow.include?.interviewSteps) {
              const steps = Array.from(mockData.interviewSteps.values())
                .filter(step => step.interviewFlowId === position.interviewFlowId)
                .sort((a, b) => a.orderIndex - b.orderIndex);
              result.interviewFlow.interviewSteps = steps;
            }
          }
          return Promise.resolve(result);
        }
        return Promise.resolve(position);
      }),
      findMany: jest.fn().mockImplementation(({ where }) => {
        const positions = Array.from(mockData.positions.values());
        if (where.isVisible) {
          return Promise.resolve(positions.filter(p => p.isVisible === where.isVisible));
        }
        return Promise.resolve(positions);
      }),
      deleteMany: jest.fn().mockImplementation(() => {
        mockData.positions.clear();
        return Promise.resolve({ count: 0 });
      }),
    },
    interviewType: {
      findFirst: jest.fn().mockImplementation(({ where }) => {
        const types = Array.from(mockData.interviewTypes.values());
        return Promise.resolve(types.find(t => 
          Object.keys(where).every(key => t[key] === where[key])
        ) || null);
      }),
      create: jest.fn().mockImplementation(({ data }) => {
        const type = createMockRecord(data);
        mockData.interviewTypes.set(type.id, type);
        return Promise.resolve(type);
      }),
      findMany: jest.fn().mockImplementation(() => {
        return Promise.resolve(Array.from(mockData.interviewTypes.values()));
      }),
      deleteMany: jest.fn().mockImplementation(() => {
        mockData.interviewTypes.clear();
        return Promise.resolve({ count: 0 });
      }),
    },
    interviewStep: {
      findFirst: jest.fn().mockImplementation(({ where }) => {
        const steps = Array.from(mockData.interviewSteps.values());
        return Promise.resolve(steps.find(s => 
          Object.keys(where).every(key => s[key] === where[key])
        ) || null);
      }),
      create: jest.fn().mockImplementation(({ data }) => {
        const step = createMockRecord(data);
        mockData.interviewSteps.set(step.id, step);
        return Promise.resolve(step);
      }),
      findMany: jest.fn().mockImplementation(() => {
        return Promise.resolve(Array.from(mockData.interviewSteps.values()));
      }),
      deleteMany: jest.fn().mockImplementation(() => {
        mockData.interviewSteps.clear();
        return Promise.resolve({ count: 0 });
      }),
    },
    employee: {
      findFirst: jest.fn().mockImplementation(({ where }) => {
        const employees = Array.from(mockData.employees.values());
        return Promise.resolve(employees.find(e => 
          Object.keys(where).every(key => e[key] === where[key])
        ) || null);
      }),
      create: jest.fn().mockImplementation(({ data }) => {
        const employee = createMockRecord(data);
        mockData.employees.set(employee.id, employee);
        return Promise.resolve(employee);
      }),
      findMany: jest.fn().mockImplementation(() => {
        return Promise.resolve(Array.from(mockData.employees.values()));
      }),
      deleteMany: jest.fn().mockImplementation(() => {
        mockData.employees.clear();
        return Promise.resolve({ count: 0 });
      }),
    },
    candidate: {
      findFirst: jest.fn().mockImplementation(({ where }) => {
        const candidates = Array.from(mockData.candidates.values());
        return Promise.resolve(candidates.find(c => 
          Object.keys(where).every(key => c[key] === where[key])
        ) || null);
      }),
      create: jest.fn().mockImplementation(({ data }) => {
        // Check for duplicate email
        const existingCandidate = Array.from(mockData.candidates.values())
          .find(c => c.email === data.email);
        if (existingCandidate) {
          const error = new Error('The email already exists in the database');
          (error as any).code = 'P2002';
          return Promise.reject(error);
        }
        
        const candidate = createMockRecord(data);
        mockData.candidates.set(candidate.id, candidate);
        return Promise.resolve(candidate);
      }),
      findUnique: jest.fn().mockImplementation(({ where, include }) => {
        const candidate = mockData.candidates.get(where.id);
        if (!candidate) return Promise.resolve(null);
        
        if (include) {
          const result = { ...candidate };
          if (include.educations) {
            result.educations = Array.from(mockData.educations.values())
              .filter(edu => edu.candidateId === candidate.id);
          }
          if (include.workExperiences) {
            result.workExperiences = Array.from(mockData.workExperiences.values())
              .filter(exp => exp.candidateId === candidate.id);
          }
          if (include.resumes) {
            result.resumes = Array.from(mockData.resumes.values())
              .filter(resume => resume.candidateId === candidate.id);
          }
          return Promise.resolve(result);
        }
        return Promise.resolve(candidate);
      }),
      findMany: jest.fn().mockImplementation(() => {
        return Promise.resolve(Array.from(mockData.candidates.values()));
      }),
      deleteMany: jest.fn().mockImplementation(() => {
        mockData.candidates.clear();
        return Promise.resolve({ count: 0 });
      }),
    },
    education: {
      create: jest.fn().mockImplementation(({ data }) => {
        const education = createMockRecord({
          ...data,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null
        });
        mockData.educations.set(education.id, education);
        return Promise.resolve(education);
      }),
      findMany: jest.fn().mockImplementation(() => {
        return Promise.resolve(Array.from(mockData.educations.values()));
      }),
      deleteMany: jest.fn().mockImplementation(() => {
        mockData.educations.clear();
        return Promise.resolve({ count: 0 });
      }),
    },
    workExperience: {
      create: jest.fn().mockImplementation(({ data }) => {
        const experience = createMockRecord({
          ...data,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null
        });
        mockData.workExperiences.set(experience.id, experience);
        return Promise.resolve(experience);
      }),
      findMany: jest.fn().mockImplementation(() => {
        return Promise.resolve(Array.from(mockData.workExperiences.values()));
      }),
      deleteMany: jest.fn().mockImplementation(() => {
        mockData.workExperiences.clear();
        return Promise.resolve({ count: 0 });
      }),
    },
    resume: {
      create: jest.fn().mockImplementation(({ data }) => {
        const resume = createMockRecord(data);
        mockData.resumes.set(resume.id, resume);
        return Promise.resolve(resume);
      }),
      findMany: jest.fn().mockImplementation(() => {
        return Promise.resolve(Array.from(mockData.resumes.values()));
      }),
      deleteMany: jest.fn().mockImplementation(() => {
        mockData.resumes.clear();
        return Promise.resolve({ count: 0 });
      }),
    },
    application: {
      create: jest.fn().mockImplementation(({ data }) => {
        const application = createMockRecord(data);
        mockData.applications.set(application.id, application);
        return Promise.resolve(application);
      }),
      findFirst: jest.fn().mockImplementation(({ where }) => {
        const applications = Array.from(mockData.applications.values());
        return Promise.resolve(applications.find(a => 
          Object.keys(where).every(key => a[key] === where[key])
        ) || null);
      }),
      findUnique: jest.fn().mockImplementation(({ where, include }) => {
        const application = mockData.applications.get(where.id);
        if (!application) return Promise.resolve(null);
        
        if (include) {
          const result = { ...application };
          if (include.interviews) {
            result.interviews = Array.from(mockData.interviews.values())
              .filter(interview => interview.applicationId === application.id);
          }
          if (include.interviewStep) {
            result.interviewStep = mockData.interviewSteps.get(application.currentInterviewStep);
          }
          if (include.position) {
            result.position = mockData.positions.get(application.positionId);
          }
          if (include.candidate) {
            result.candidate = mockData.candidates.get(application.candidateId);
          }
          return Promise.resolve(result);
        }
        return Promise.resolve(application);
      }),
      findMany: jest.fn().mockImplementation(({ where, include }) => {
        let applications = Array.from(mockData.applications.values());
        
        if (where.positionId) {
          applications = applications.filter(a => a.positionId === where.positionId);
        }
        
        if (include) {
          applications = applications.map(app => {
            const result = { ...app };
            if (include.candidate) {
              result.candidate = mockData.candidates.get(app.candidateId);
            }
            if (include.interviews) {
              result.interviews = Array.from(mockData.interviews.values())
                .filter(interview => interview.applicationId === app.id);
            }
            if (include.interviewStep) {
              result.interviewStep = mockData.interviewSteps.get(app.currentInterviewStep);
            }
            return result;
          });
        }
        
        return Promise.resolve(applications);
      }),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const application = mockData.applications.get(where.id);
        if (!application) return Promise.resolve(null);
        
        const updatedApplication = { ...application, ...data };
        mockData.applications.set(application.id, updatedApplication);
        return Promise.resolve(updatedApplication);
      }),
      deleteMany: jest.fn().mockImplementation(() => {
        mockData.applications.clear();
        return Promise.resolve({ count: 0 });
      }),
    },
    interview: {
      create: jest.fn().mockImplementation(({ data }) => {
        const interview = createMockRecord(data);
        mockData.interviews.set(interview.id, interview);
        return Promise.resolve(interview);
      }),
      createMany: jest.fn().mockImplementation(({ data }) => {
        data.forEach((item: any) => {
          const interview = createMockRecord(item);
          mockData.interviews.set(interview.id, interview);
        });
        return Promise.resolve({ count: data.length });
      }),
      findMany: jest.fn().mockImplementation(() => {
        return Promise.resolve(Array.from(mockData.interviews.values()));
      }),
      deleteMany: jest.fn().mockImplementation(() => {
        mockData.interviews.clear();
        return Promise.resolve({ count: 0 });
      }),
    },
    $disconnect: jest.fn().mockImplementation(() => {
      // Clear all mock data
      Object.values(mockData).forEach(map => map.clear());
      idCounter = 1;
      return Promise.resolve();
    }),
  };

  return mockPrisma as unknown as PrismaClient;
};

// Reset mock data
export const resetMockData = () => {
  Object.values(mockData).forEach(map => map.clear());
  idCounter = 1;
};

// Get mock data for inspection
export const getMockData = () => mockData;
