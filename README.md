# EPC/SEPA QR Generator

A TypeScript library for generating EPC/SEPA (Single Euro Payments Area) QR Codes for easy bank transfers.

# SEPA QR Generator API Documentation

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [API Reference](#api-reference)
   - [SEPAQRGenerator](#sepaqrgenerator)
   - [SEPAData](#sepadata)
   - [SEPAQROptions](#sepaqroptions)
   - [OutputType](#outputtype)

## Installation

```bash
npm install sepa-qr-code
```

## Usage

```typescript
import { SEPAQRGenerator, SEPAData } from "sepa-qr-code";

const generator = new SEPAQRGenerator();

const data: SEPAData = {
  name: "John Doe",
  iban: "DE89370400440532013000",
  amount: "100.00",
  currency: "EUR",
  remittanceInfo: "Invoice 123",
};

generator
  .generateQRCode(data)
  .then((qrCode) => {
    console.log("QR Code generated:", qrCode);
  })
  .catch((error) => {
    console.error("Error generating QR code:", error.message);
  });
```

## API Reference

### SEPAQRGenerator

The main class for generating SEPA QR codes.

#### Constructor

```typescript
constructor(options?: SEPAQROptions)
```

Creates a new instance of SEPAQRGenerator.

- `options`: Optional. An object of type `SEPAQROptions` to customize the QR code generation.

#### Methods

##### generateQRCode

```typescript
generateQRCode(data: SEPAData, outputType: OutputType = 'base64'): Promise<string | Buffer>
```

Generates a QR code based on the provided SEPA data.

- `data`: An object of type `SEPAData` containing the SEPA transfer information.
- `outputType`: Optional. Specifies the output format of the QR code. Default is 'base64'.
- Returns: A Promise that resolves to either a string (for 'base64' and 'utf8' types) or a Buffer (for 'buffer' type).

### SEPAData

An interface representing the data required for a SEPA transfer.

```typescript
interface SEPAData {
  bic?: string;
  name: string;
  iban: string;
  amount?: string;
  currency?: string;
  purposeCode?: string;
  remittanceInfo?: string;
  beneficiaryToOriginator?: string;
}
```

- `bic`: Optional. The Bank Identifier Code (8 or 11 characters).
- `name`: Required. The name of the beneficiary (max 70 characters).
- `iban`: Required. The International Bank Account Number (15 to 34 characters).
- `amount`: Optional. The transfer amount (max 12 characters, including 2 decimal places).
- `currency`: Optional. The currency code (3 characters, default is 'EUR').
- `purposeCode`: Optional. The purpose of the credit transfer (4 characters).
- `remittanceInfo`: Optional. Remittance information/Payment Reference (max 140 characters). This can be used to include additional information such as an order number.
- `beneficiaryToOriginator`: Optional. Information from the beneficiary to the originator (max 70 characters).

### SEPAQROptions

An interface for customizing the QR code generation.

```typescript
interface SEPAQROptions {
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  margin?: number;
  scale?: number;
}
```

- `errorCorrectionLevel`: Optional. The error correction level of the QR Code.
  - 'L': Low (7% of codewords can be restored)
  - 'M': Medium (15% of codewords can be restored)
  - 'Q': Quartile (25% of codewords can be restored)
  - 'H': High (30% of codewords can be restored)
    Default is 'M'.
- `margin`: Optional. The margin around the QR code in modules. Default is 4.
- `scale`: Optional. The scale factor for the QR code. Default is 4.

### OutputType

A type representing the possible output formats for the QR code.

```typescript
type OutputType = "base64" | "buffer" | "utf8";
```

- `'base64'`: Returns the QR code as a base64 encoded string.
- `'buffer'`: Returns the QR code as a Buffer object.
- `'utf8'`: Returns the raw content of the QR code as a UTF-8 string.
