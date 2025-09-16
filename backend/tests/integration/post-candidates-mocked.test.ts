import request from 'supertest';
import { app } from '../mocks/test-app-mock';
import { setupMockTestData, cleanupMockTestData, createMockCandidate } from '../mocks/setup-mock';

describe('POST /candidates - Mocked Integration Test', () => {
  let testData: any;

  beforeAll(async () => {
    testData = await setupMockTestData();
  });

  afterAll(async () => {
    await cleanupMockTestData();
  });

  it('should create candidate with complete profile (all fields populated)', async () => {
    const completeCandidateData = {
      firstName: 'María',
      lastName: 'González',
      email: 'maria.gonzalez@test.com',
      phone: '612345678',
      address: '123 Main Street, City, State 12345',
      educations: [
        {
          institution: 'Universidad Nacional',
          title: 'Licenciatura en Ingeniería de Sistemas',
          startDate: '2015-09-01',
          endDate: '2019-06-01'
        },
        {
          institution: 'Instituto Tecnológico',
          title: 'Maestría en Ciencias de la Computación',
          startDate: '2019-09-01',
          endDate: '2021-06-01'
        }
      ],
      workExperiences: [
        {
          company: 'Tech Solutions Inc',
          position: 'Desarrollador de Software Junior',
          description: 'Desarrollo y mantenimiento de aplicaciones web usando React y Node.js',
          startDate: '2021-07-01',
          endDate: '2022-12-01'
        },
        {
          company: 'Innovation Labs',
          position: 'Desarrollador Full-Stack Senior',
          description: 'Liderazgo técnico en proyectos de gran escala, arquitectura de microservicios',
          startDate: '2023-01-01',
          endDate: null // Current job
        }
      ],
      cv: {
        filePath: '/uploads/maria_gonzalez_resume.pdf',
        fileType: 'application/pdf'
      }
    };

    const response = await request(app)
      .post('/candidates')
      .send(completeCandidateData);

    expect(response.status).toBe(201);

    // Validate response structure
    expect(response.body).toHaveProperty('message', 'Candidate added successfully');
    expect(response.body).toHaveProperty('data');

    const candidateData = response.body.data;

    // Validate candidate basic info
    expect(candidateData).toHaveProperty('id');
    expect(candidateData.firstName).toBe('María');
    expect(candidateData.lastName).toBe('González');
    expect(candidateData.email).toBe('maria.gonzalez@test.com');
    expect(candidateData.phone).toBe('612345678');
    expect(candidateData.address).toBe('123 Main Street, City, State 12345');

    // Validate education records
    expect(candidateData.educations).toHaveLength(2);
    expect(candidateData.educations[0]).toMatchObject({
      institution: 'Universidad Nacional',
      title: 'Licenciatura en Ingeniería de Sistemas',
      startDate: '2015-09-01',
      endDate: '2019-06-01'
    });
    expect(candidateData.educations[1]).toMatchObject({
      institution: 'Instituto Tecnológico',
      title: 'Maestría en Ciencias de la Computación',
      startDate: '2019-09-01',
      endDate: '2021-06-01'
    });

    // Validate work experience records
    expect(candidateData.workExperiences).toHaveLength(2);
    expect(candidateData.workExperiences[0]).toMatchObject({
      company: 'Tech Solutions Inc',
      position: 'Desarrollador de Software Junior',
      description: 'Desarrollo y mantenimiento de aplicaciones web usando React y Node.js',
      startDate: '2021-07-01',
      endDate: '2022-12-01'
    });
    expect(candidateData.workExperiences[1]).toMatchObject({
      company: 'Innovation Labs',
      position: 'Desarrollador Full-Stack Senior',
      description: 'Liderazgo técnico en proyectos de gran escala, arquitectura de microservicios',
      startDate: '2023-01-01'
    });
    expect(candidateData.workExperiences[1].endDate).toBeNull();

    // Validate CV information (stored as resumes)
    expect(candidateData.resumes).toHaveLength(1);
    expect(candidateData.resumes[0]).toMatchObject({
      filePath: '/uploads/maria_gonzalez_resume.pdf',
      fileType: 'application/pdf'
    });
  });

  it('should handle Spanish characters in names correctly', async () => {
    const candidateWithSpanishNames = {
      firstName: 'José María',
      lastName: 'Fernández García',
      email: 'jose.fernandez@test.com',
      phone: '666777888',
      address: 'Calle Mayor 123, Madrid, España',
      educations: [
        {
          institution: 'Universidad Complutense',
          title: 'Grado en Ingeniería Informática',
          startDate: '2016-09-01',
          endDate: '2020-06-01'
        }
      ],
      workExperiences: [
        {
          company: 'Empresa Española S.L.',
          position: 'Desarrollador Frontend',
          description: 'Desarrollo de interfaces de usuario con React y TypeScript',
          startDate: '2020-09-01',
          endDate: null
        }
      ],
      cv: {
        filePath: '/uploads/jose_fernandez_cv.pdf',
        fileType: 'application/pdf'
      }
    };

    const response = await request(app)
      .post('/candidates')
      .send(candidateWithSpanishNames);

    expect(response.status).toBe(201);

    expect(response.body.data.firstName).toBe('José María');
    expect(response.body.data.lastName).toBe('Fernández García');
    expect(response.body.data.address).toBe('Calle Mayor 123, Madrid, España');
  });

  it('should handle validation errors', async () => {
    const invalidCandidateData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid-email', // Invalid email format
      phone: '612345678',
      address: '123 Test St'
    };

    const response = await request(app)
      .post('/candidates')
      .send(invalidCandidateData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Error adding candidate');
    expect(response.body).toHaveProperty('error');
  });

  it('should handle duplicate email', async () => {
    const candidateData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      phone: '612345678',
      address: '123 Test St'
    };

    // Create first candidate
    await request(app)
      .post('/candidates')
      .send(candidateData);

    // Try to create second candidate with same email
    const response = await request(app)
      .post('/candidates')
      .send(candidateData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Error adding candidate');
    expect(response.body.error).toContain('email already exists');
  });
});
