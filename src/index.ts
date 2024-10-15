import QRCode, { QRCodeToDataURLOptions, QRCodeToBufferOptions } from 'qrcode';

export interface SEPAQROptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  scale?: number;
}

export interface SEPAData {
  bic?: string;
  name: string;
  iban: string;
  amount?: string;
  currency?: string;
  purposeCode?: string;
  remittanceInfo?: string;
  beneficiaryToOriginator?: string;
}

export type OutputType = 'base64' | 'buffer' | 'utf8';

export class SEPAQRGenerator {
  private options: SEPAQROptions;

  constructor(options: SEPAQROptions = {}) {
    this.options = {
      errorCorrectionLevel: 'M',
      margin: 4,
      scale: 4,
      ...options
    };
  }

  private validateData(data: SEPAData): void {
    if (!data.name || !data.iban) {
      throw new Error('Missing required fields: name and iban');
    }
    if (data.bic && !/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(data.bic)) {
      throw new Error('Invalid BIC format');
    }
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(data.iban)) {
      throw new Error('Invalid IBAN format');
    }
    if (data.amount && !/^\d+(\.\d{1,2})?$/.test(data.amount)) {
      throw new Error('Invalid amount format');
    }
    if (data.currency && !/^[A-Z]{3}$/.test(data.currency)) {
      throw new Error('Invalid currency code');
    }
    if (data.purposeCode && !/^[A-Z]{4}$/.test(data.purposeCode)) {
      throw new Error('Invalid purpose code format');
    }
  }

  private generateContent(data: SEPAData): string {
    this.validateData(data);

    const content = [
      'BCD',
      '002',
      '1',
      'SCT',
      data.bic || '',
      data.name,
      data.iban,
      (data.currency || 'EUR') + (data.amount || '1'),
      data.purposeCode || '',
      data.remittanceInfo || '',
      data.beneficiaryToOriginator || ''
    ];

    return content.join('\n');
  }

  public async generateQRCode(data: SEPAData, outputType: OutputType = 'base64'): Promise<string | Buffer> {
    const content = this.generateContent(data);

    try {
      switch (outputType) {
        case 'base64':
          return await QRCode.toDataURL(content, {
            errorCorrectionLevel: this.options.errorCorrectionLevel,
            margin: this.options.margin,
            scale: this.options.scale,
          } as QRCodeToDataURLOptions);
        case 'buffer':
          return await QRCode.toBuffer(content, {
            errorCorrectionLevel: this.options.errorCorrectionLevel,
            margin: this.options.margin,
            scale: this.options.scale,
          } as QRCodeToBufferOptions);
        case 'utf8':
          return content;
        default:
          throw new Error(`Unsupported output type: ${outputType}`);
      }
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to generate QR code: ${err.message}`);
      } else {
        throw new Error('Failed to generate QR code: Unknown error');
      }
    }
  }
}