const Invoice = require('../models/Invoice');
const { AppError } = require('../middleware/errorHandler');
const fs = require('fs').promises;
const path = require('path');

class InvoiceService {
  async processInvoice(file) {
    if (!file) {
      throw new AppError('No file uploaded', 400);
    }

    // Store file path
    const invoiceImage = `/uploads/${file.filename}`;

    // For now, return the file info
    // In production, integrate OCR service like Google Vision API or Tesseract
    const extractedData = await this.extractInvoiceData(file.path);

    return {
      invoiceImage,
      extractedData,
      message: 'Invoice uploaded. Please review extracted data and create assets.'
    };
  }

  async extractInvoiceData(filePath) {
    // Placeholder for OCR integration
    // TODO: Integrate with OCR service (Google Vision API, AWS Textract, or Tesseract)
    return {
      note: 'OCR integration pending. Manually enter asset details.',
      suggestedFields: {
        invoiceNumber: '',
        vendor: '',
        purchaseDate: '',
        totalAmount: 0,
        items: []
      }
    };
  }

  async getInvoices(options) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const invoices = await Invoice.find()
      .populate('vendor', 'name')
      .populate('assets', 'assetId name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Invoice.countDocuments();

    return {
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getInvoiceById(id) {
    const invoice = await Invoice.findById(id)
      .populate('vendor')
      .populate('assets');

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    return invoice;
  }
}

module.exports = new InvoiceService();
