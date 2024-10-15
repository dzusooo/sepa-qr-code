import { SEPAQRGenerator, SEPAData, SEPAQROptions, OutputType } from '../src';

describe('SEPAQRGenerator', () => {
  let sepaQR: SEPAQRGenerator;
  let validData: SEPAData;

  beforeEach(() => {
    sepaQR = new SEPAQRGenerator();
    validData = {
      bic: 'BFSWDE33BER',
      name: 'Wikimedia Foerdergesellschaft',
      iban: 'DE33100205000001194700',
      amount: '10.00',
      currency: 'EUR',
      purposeCode: 'GDDS',
      remittanceInfo: 'Donation to Wikipedia',
      beneficiaryToOriginator: 'Thank you for your donation'
    };
  });

  describe('constructor', () => {
    it('should create an instance with default options', () => {
      expect(sepaQR).toBeInstanceOf(SEPAQRGenerator);
    });

    it('should create an instance with custom options', () => {
      const customOptions: SEPAQROptions = {
        errorCorrectionLevel: 'H',
        margin: 2,
        scale: 8
      };
      const customSepaQR = new SEPAQRGenerator(customOptions);
      expect(customSepaQR).toBeInstanceOf(SEPAQRGenerator);
    });
  });

  describe('generateQRCode', () => {
    it('should generate a base64 QR code by default', async () => {
      const result = (await sepaQR.generateQRCode(validData)) as string;
      expect(typeof result).toBe('string');
      expect(result.startsWith('data:image/png;base64,')).toBe(true);
    });

    it('should generate a buffer QR code when specified', async () => {
      const result = await sepaQR.generateQRCode(validData, 'buffer');
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should generate raw content for UTF8 output type', async () => {
      const result = await sepaQR.generateQRCode(validData, 'utf8');
      expect(typeof result).toBe('string');
      expect(result).toBe('BCD\n002\n1\nSCT\nBFSWDE33BER\nWikimedia Foerdergesellschaft\nDE33100205000001194700\nEUR10.00\nGDDS\nDonation to Wikipedia\nThank you for your donation');
    });

    it('should throw an error for unsupported output type', async () => {
      await expect(sepaQR.generateQRCode(validData, 'unsupported' as OutputType))
        .rejects.toThrow('Unsupported output type: unsupported');
    });

    it('should throw an error for missing required fields', async () => {
      const invalidData = { ...validData, name: '' };
      await expect(sepaQR.generateQRCode(invalidData)).rejects.toThrow('Missing required fields: name and iban');
    });

    it('should generate QR code with minimal required data', async () => {
      const minimalData: SEPAData = {
        name: 'John Doe',
        iban: 'DE89370400440532013000'
      };
      const result = (await sepaQR.generateQRCode(minimalData)) as string;
      expect(typeof result).toBe('string');
      expect(result.startsWith('data:image/png;base64,')).toBe(true);
    });

    it('should handle maximum length inputs', async () => {
      const maxLengthData: SEPAData = {
        bic: 'BFSWDE33BER',
        name: 'A'.repeat(70),
        iban: 'DE89370400440532013000',
        amount: '123456789.00',
        purposeCode: 'ABCD',
        remittanceInfo: 'A'.repeat(140),
        beneficiaryToOriginator: 'A'.repeat(70)
      };
      const result = (await sepaQR.generateQRCode(maxLengthData)) as string;
      expect(typeof result).toBe('string');
      expect(result.startsWith('data:image/png;base64,')).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw an error for invalid BIC', async () => {
      const invalidData = { ...validData, bic: 'INVALID' };
      await expect(sepaQR.generateQRCode(invalidData)).rejects.toThrow('Invalid BIC format');
    });

    it('should throw an error for invalid IBAN', async () => {
      const invalidData = { ...validData, iban: 'INVALID' };
      await expect(sepaQR.generateQRCode(invalidData)).rejects.toThrow('Invalid IBAN format');
    });

    it('should throw an error for invalid amount format', async () => {
      const invalidData = { ...validData, amount: 'INVALID' };
      await expect(sepaQR.generateQRCode(invalidData)).rejects.toThrow('Invalid amount format');
    });

    it('should throw an error for invalid purpose code', async () => {
      const invalidData = { ...validData, purposeCode: 'INVALIDCODE' };
      await expect(sepaQR.generateQRCode(invalidData)).rejects.toThrow('Invalid purpose code format');
    });
  });

  describe('currency handling', () => {
    it('should use EUR as default currency if not specified', async () => {
      const dataWithoutCurrency = { ...validData };
      delete dataWithoutCurrency.currency;
      const result = await sepaQR.generateQRCode(dataWithoutCurrency, 'utf8');
      expect(result).toContain('\nEUR');
    });

    it('should use specified currency', async () => {
      const dataWithCustomCurrency = { ...validData, currency: 'USD' };
      const result = await sepaQR.generateQRCode(dataWithCustomCurrency, 'utf8');
      expect(result).toContain('\nUSD');
    });

    it('should throw an error for invalid currency', async () => {
      const invalidData = { ...validData, currency: 'INVALID' };
      await expect(sepaQR.generateQRCode(invalidData)).rejects.toThrow('Invalid currency code');
    });

    it('should handle all valid ISO 4217 currency codes', async () => {
      const currencies = ['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY'];
      for (const currency of currencies) {
        const dataWithCurrency = { ...validData, currency };
        const result = await sepaQR.generateQRCode(dataWithCurrency, 'utf8');
        expect(result).toContain(`\n${currency}`);
      }
    });
  });

  describe('content generation', () => {
    it('should generate correct content string', async () => {
      const result = await sepaQR.generateQRCode(validData, 'utf8');
      expect(result).toBe('BCD\n002\n1\nSCT\nBFSWDE33BER\nWikimedia Foerdergesellschaft\nDE33100205000001194700\nEUR10.00\nGDDS\nDonation to Wikipedia\nThank you for your donation');
    });

    it('should handle optional fields correctly', async () => {
      const minimalData: SEPAData = {
        name: 'John Doe',
        iban: 'DE89370400440532013000',
      };
      const result = await sepaQR.generateQRCode(minimalData, 'utf8');
      expect(result).toBe('BCD\n002\n1\nSCT\n\nJohn Doe\nDE89370400440532013000\nEUR1\n\n\n');
    });
  });
});
