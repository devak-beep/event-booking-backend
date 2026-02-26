const invoiceService = require('../services/invoiceService');

class InvoiceController {
  async uploadInvoice(req, res, next) {
    try {
      const file = req.file;
      const result = await invoiceService.processInvoice(file);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getInvoices(req, res, next) {
    try {
      const { page, limit } = req.query;
      const options = { 
        page: parseInt(page) || 1, 
        limit: parseInt(limit) || 10 
      };
      const result = await invoiceService.getInvoices(options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getInvoiceById(req, res, next) {
    try {
      const invoice = await invoiceService.getInvoiceById(req.params.id);
      res.status(200).json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InvoiceController();
