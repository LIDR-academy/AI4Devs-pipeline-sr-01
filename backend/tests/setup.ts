import { PrismaClient } from '@prisma/client';

// Test database setup
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb'
    }
  }
});

// Test data fixtures
export const testFixtures = {
  company: {
    name: 'Test Company'
  },
  interviewFlow: {
    description: 'Test interview flow'
  },
  position: {
    title: 'Test Position',
    description: 'Test position description',
    status: 'Open',
    isVisible: true,
    location: 'Remote',
    jobDescription: 'Test job description',
    salaryMin: 50000,
    salaryMax: 80000,
    employmentType: 'Full-time',
    benefits: 'Health insurance, 401k',
    requirements: 'Test requirements',
    responsibilities: 'Test responsibilities',
    companyDescription: 'Test company description',
    applicationDeadline: new Date('2024-12-31'),
    contactInfo: 'test@company.com'
  },
  interviewType: {
    name: 'HR Interview',
    description: 'Human resources interview'
  },
  interviewStep: {
    name: 'Initial Screening',
    orderIndex: 1
  },
  employee: {
    name: 'Test Employee',
    email: 'employee@test.com',
    role: 'Interviewer'
  }
};

// Cleanup function for tests
export const cleanupTestData = async () => {
  // Delete in reverse order of dependencies
  await prisma.interview.deleteMany();
  await prisma.application.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.workExperience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.interviewStep.deleteMany();
  await prisma.interviewType.deleteMany();
  await prisma.position.deleteMany();
  await prisma.interviewFlow.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.company.deleteMany();
};

// Setup test data
export const setupTestData = async () => {
  // Find or create company
  let company = await prisma.company.findFirst({
    where: { name: 'LTI' }
  });
  
  if (!company) {
    company = await prisma.company.create({
      data: { name: 'LTI' }
    });
  }

  // Find or create interview flow
  let interviewFlow = await prisma.interviewFlow.findFirst({
    where: { description: 'Standard development interview process' }
  });
  
  if (!interviewFlow) {
    interviewFlow = await prisma.interviewFlow.create({
      data: { description: 'Standard development interview process' }
    });
  }

  // Find or create position
  let position = await prisma.position.findFirst({
    where: { title: 'Senior Full-Stack Engineer' }
  });
  
  if (!position) {
    position = await prisma.position.create({
      data: {
        title: 'Senior Full-Stack Engineer',
        description: 'Develop and maintain software applications.',
        status: 'Open',
        isVisible: true,
        location: 'Remote',
        jobDescription: 'Full-stack development',
        companyId: company.id,
        interviewFlowId: interviewFlow.id,
        salaryMin: 50000,
        salaryMax: 80000,
        employmentType: 'Full-time',
        benefits: 'Health insurance, 401k, Paid time off',
        contactInfo: 'hr@lti.com',
        requirements: '3+ years of experience in software development, knowledge in React and Node.js',
        responsibilities: 'Develop, test, and maintain software solutions.',
        companyDescription: 'LTI is a leading HR solutions provider.',
        applicationDeadline: new Date('2024-12-31')
      }
    });
  }

  // Find or create interview type
  let interviewType = await prisma.interviewType.findFirst({
    where: { name: 'HR Interview' }
  });
  
  if (!interviewType) {
    interviewType = await prisma.interviewType.create({
      data: {
        name: 'HR Interview',
        description: 'Assess overall fit, tech stack, salary range and availability'
      }
    });
  }

  // Find or create interview step
  let interviewStep = await prisma.interviewStep.findFirst({
    where: { name: 'Initial Screening' }
  });
  
  if (!interviewStep) {
    interviewStep = await prisma.interviewStep.create({
      data: {
        interviewFlowId: interviewFlow.id,
        interviewTypeId: interviewType.id,
        name: 'Initial Screening',
        orderIndex: 1
      }
    });
  }

  // Find or create employee
  let employee = await prisma.employee.findFirst({
    where: { email: 'alice.johnson@lti.com' }
  });
  
  if (!employee) {
    employee = await prisma.employee.create({
      data: {
        companyId: company.id,
        name: 'Alice Johnson',
        email: 'alice.johnson@lti.com',
        role: 'Interviewer'
      }
    });
  }

  return {
    company,
    interviewFlow,
    position,
    interviewType,
    interviewStep,
    employee
  };
};
