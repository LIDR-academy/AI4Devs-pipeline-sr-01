import { createMockPrismaClient, resetMockData, getMockData } from './prisma-mock';

// Test data fixtures
export const mockTestFixtures = {
  company: {
    id: 1,
    name: 'LTI',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  interviewFlow: {
    id: 1,
    description: 'Standard development interview process',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  position: {
    id: 1,
    title: 'Senior Full-Stack Engineer',
    description: 'Develop and maintain software applications.',
    status: 'Open',
    isVisible: true,
    location: 'Remote',
    jobDescription: 'Full-stack development',
    companyId: 1,
    interviewFlowId: 1,
    salaryMin: 50000,
    salaryMax: 80000,
    employmentType: 'Full-time',
    benefits: 'Health insurance, 401k, Paid time off',
    contactInfo: 'hr@lti.com',
    requirements: '3+ years of experience in software development, knowledge in React and Node.js',
    responsibilities: 'Develop, test, and maintain software solutions.',
    companyDescription: 'LTI is a leading HR solutions provider.',
    applicationDeadline: new Date('2024-12-31'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  interviewType: {
    id: 1,
    name: 'HR Interview',
    description: 'Assess overall fit, tech stack, salary range and availability',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  interviewStep: {
    id: 1,
    interviewFlowId: 1,
    interviewTypeId: 1,
    name: 'Initial Screening',
    orderIndex: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  employee: {
    id: 1,
    companyId: 1,
    name: 'Alice Johnson',
    email: 'alice.johnson@lti.com',
    role: 'Interviewer',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
};

// Cleanup function for tests
export const cleanupMockTestData = async () => {
  resetMockData();
};

// Setup test data with mocks
export const setupMockTestData = async () => {
  // Create mock Prisma client
  const mockPrisma = createMockPrismaClient();
  
  // Reset mock data
  resetMockData();
  
  // Create company
  const company = await mockPrisma.company.create({
    data: { name: mockTestFixtures.company.name }
  });

  // Create interview flow
  const interviewFlow = await mockPrisma.interviewFlow.create({
    data: { description: mockTestFixtures.interviewFlow.description }
  });

  // Create position
  const position = await mockPrisma.position.create({
    data: {
      title: mockTestFixtures.position.title,
      description: mockTestFixtures.position.description,
      status: mockTestFixtures.position.status,
      isVisible: mockTestFixtures.position.isVisible,
      location: mockTestFixtures.position.location,
      jobDescription: mockTestFixtures.position.jobDescription,
      companyId: company.id,
      interviewFlowId: interviewFlow.id,
      salaryMin: mockTestFixtures.position.salaryMin,
      salaryMax: mockTestFixtures.position.salaryMax,
      employmentType: mockTestFixtures.position.employmentType,
      benefits: mockTestFixtures.position.benefits,
      contactInfo: mockTestFixtures.position.contactInfo,
      requirements: mockTestFixtures.position.requirements,
      responsibilities: mockTestFixtures.position.responsibilities,
      companyDescription: mockTestFixtures.position.companyDescription,
      applicationDeadline: mockTestFixtures.position.applicationDeadline
    }
  });

  // Create interview type
  const interviewType = await mockPrisma.interviewType.create({
    data: {
      name: mockTestFixtures.interviewType.name,
      description: mockTestFixtures.interviewType.description
    }
  });

  // Create interview step
  const interviewStep = await mockPrisma.interviewStep.create({
    data: {
      interviewFlowId: interviewFlow.id,
      interviewTypeId: interviewType.id,
      name: mockTestFixtures.interviewStep.name,
      orderIndex: mockTestFixtures.interviewStep.orderIndex
    }
  });

  // Create employee
  const employee = await mockPrisma.employee.create({
    data: {
      companyId: company.id,
      name: mockTestFixtures.employee.name,
      email: mockTestFixtures.employee.email,
      role: mockTestFixtures.employee.role
    }
  });

  return {
    company,
    interviewFlow,
    position,
    interviewType,
    interviewStep,
    employee
  };
};

// Helper function to create a candidate with all related data
export const createMockCandidate = async (candidateData: any) => {
  const mockPrisma = createMockPrismaClient();
  
  // Create candidate
  const candidate = await mockPrisma.candidate.create({
    data: {
      firstName: candidateData.firstName,
      lastName: candidateData.lastName,
      email: candidateData.email,
      phone: candidateData.phone,
      address: candidateData.address
    }
  });

  // Create educations
  if (candidateData.educations) {
    for (const education of candidateData.educations) {
      await mockPrisma.education.create({
        data: {
          ...education,
          candidateId: candidate.id,
          startDate: new Date(education.startDate),
          endDate: education.endDate ? new Date(education.endDate) : null
        }
      });
    }
  }

  // Create work experiences
  if (candidateData.workExperiences) {
    for (const experience of candidateData.workExperiences) {
      await mockPrisma.workExperience.create({
        data: {
          ...experience,
          candidateId: candidate.id,
          startDate: new Date(experience.startDate),
          endDate: experience.endDate ? new Date(experience.endDate) : null
        }
      });
    }
  }

  // Create resume
  if (candidateData.cv) {
    await mockPrisma.resume.create({
      data: {
        ...candidateData.cv,
        candidateId: candidate.id
      }
    });
  }

  return candidate;
};

// Helper function to create an application
export const createMockApplication = async (applicationData: any) => {
  const mockPrisma = createMockPrismaClient();
  
  return await mockPrisma.application.create({
    data: {
      candidateId: applicationData.candidateId,
      positionId: applicationData.positionId,
      applicationDate: new Date(applicationData.applicationDate || new Date()),
      currentInterviewStep: applicationData.currentInterviewStep,
      notes: applicationData.notes || null
    }
  });
};

// Helper function to create interviews
export const createMockInterviews = async (interviewsData: any[]) => {
  const mockPrisma = createMockPrismaClient();
  
  return await mockPrisma.interview.createMany({
    data: interviewsData.map(interview => ({
      ...interview,
      interviewDate: new Date(interview.interviewDate)
    }))
  });
};
