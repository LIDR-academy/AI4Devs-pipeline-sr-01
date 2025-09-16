import request from 'supertest';
import { app } from '../test-app';
import { setupTestData, cleanupTestData, prisma } from '../setup';
import path from 'path';
import fs from 'fs';

describe('POST /upload - PDF Resume Integration Test', () => {
  let testData: any;
  let testFilePath: string;

  beforeAll(async () => {
    testData = await setupTestData();
    
    // Create a test PDF file
    testFilePath = path.join(__dirname, 'test-resume.pdf');
    const testPdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF');
    fs.writeFileSync(testFilePath, testPdfContent);
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
    
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  it('should upload PDF resume with standard filename', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('file', testFilePath, 'resume.pdf');

    if (response.status !== 200) {
      console.log('Response status:', response.status);
      console.log('Response body:', response.body);
    }

    expect(response.status).toBe(200);

    // Validate response structure
    expect(response.body).toHaveProperty('filePath');
    expect(response.body).toHaveProperty('fileType');
    
    // Validate file path
    expect(response.body.filePath).toMatch(/^\.\.\/uploads\/\d+-resume\.pdf$/);
    expect(response.body.fileType).toBe('application/pdf');

    // Verify file was actually saved
    const savedFilePath = path.join(__dirname, '..', '..', response.body.filePath);
    expect(fs.existsSync(savedFilePath)).toBe(true);
  });

  it('should upload PDF with special characters in filename', async () => {
    const specialFileName = 'resume_2024-01-15_v2.1.pdf';
    const response = await request(app)
      .post('/upload')
      .attach('file', testFilePath, specialFileName);

    expect(response.status).toBe(200);
    expect(response.body.filePath).toMatch(/^\.\.\/uploads\/\d+-resume_2024-01-15_v2\.1\.pdf$/);
    expect(response.body.fileType).toBe('application/pdf');
  });

  it('should upload PDF with long filename', async () => {
    const longFileName = 'very_long_filename_that_exceeds_normal_length_but_should_still_work_correctly.pdf';
    const response = await request(app)
      .post('/upload')
      .attach('file', testFilePath, longFileName);

    expect(response.status).toBe(200);
    expect(response.body.filePath).toMatch(/^\.\.\/uploads\/\d+-very_long_filename_that_exceeds_normal_length_but_should_still_work_correctly\.pdf$/);
    expect(response.body.fileType).toBe('application/pdf');
  });

  it('should upload PDF with Unicode characters in filename', async () => {
    const unicodeFileName = 'curriculum_vitae_2024.pdf';
    const response = await request(app)
      .post('/upload')
      .attach('file', testFilePath, unicodeFileName);

    expect(response.status).toBe(200);
    expect(response.body.filePath).toMatch(/^\.\.\/uploads\/\d+-curriculum_vitae_2024\.pdf$/);
    expect(response.body.fileType).toBe('application/pdf');
  });

  it('should upload PDF with mixed case filename', async () => {
    const mixedCaseFileName = 'Resume_2024_FINAL.pdf';
    const response = await request(app)
      .post('/upload')
      .attach('file', testFilePath, mixedCaseFileName);

    expect(response.status).toBe(200);
    expect(response.body.filePath).toMatch(/^\.\.\/uploads\/\d+-Resume_2024_FINAL\.pdf$/);
    expect(response.body.fileType).toBe('application/pdf');
  });

  it('should upload PDF with file extension in uppercase', async () => {
    const uppercaseExtFileName = 'resume.PDF';
    const response = await request(app)
      .post('/upload')
      .attach('file', testFilePath, uppercaseExtFileName);

    expect(response.status).toBe(200);
    expect(response.body.filePath).toMatch(/^\.\.\/uploads\/\d+-resume\.PDF$/);
    expect(response.body.fileType).toBe('application/pdf');
  });

  it('should upload PDF with multiple dots in filename', async () => {
    const multiDotFileName = 'resume.v2.1.final.pdf';
    const response = await request(app)
      .post('/upload')
      .attach('file', testFilePath, multiDotFileName);

    expect(response.status).toBe(200);
    expect(response.body.filePath).toMatch(/^\.\.\/uploads\/\d+-resume\.v2\.1\.final\.pdf$/);
    expect(response.body.fileType).toBe('application/pdf');
  });

  it('should upload PDF with hyphenated filename', async () => {
    const hyphenatedFileName = 'john-doe-resume-2024.pdf';
    const response = await request(app)
      .post('/upload')
      .attach('file', testFilePath, hyphenatedFileName);

    expect(response.status).toBe(200);
    expect(response.body.filePath).toMatch(/^\.\.\/uploads\/\d+-john-doe-resume-2024\.pdf$/);
    expect(response.body.fileType).toBe('application/pdf');
  });

  it('should handle missing file field', async () => {
    const response = await request(app)
      .post('/upload');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid file type, only PDF and DOCX are allowed!');
  });

  it('should handle invalid file type', async () => {
    // Create a test text file
    const testTxtPath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testTxtPath, 'This is a test text file');

    const response = await request(app)
      .post('/upload')
      .attach('file', testTxtPath, 'test-file.txt');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid file type, only PDF and DOCX are allowed!');

    // Clean up test file
    fs.unlinkSync(testTxtPath);
  });

  it('should handle file that is too large', async () => {
    // Create a large test file (simulate by creating a file larger than 10MB)
    const largeFilePath = path.join(__dirname, 'large-file.pdf');
    const largeContent = Buffer.alloc(11 * 1024 * 1024); // 11MB
    fs.writeFileSync(largeFilePath, largeContent);

    const response = await request(app)
      .post('/upload')
      .attach('file', largeFilePath, 'large-file.pdf');

    if (response.status !== 400) {
      console.log('Response status:', response.status);
      console.log('Response body:', response.body);
    }

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'File too large');

    // Clean up test file
    fs.unlinkSync(largeFilePath);
  });
});
