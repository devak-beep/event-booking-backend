const generateQRCode = (assetId) => {
  return `QR-${assetId}-${Date.now()}`;
};

module.exports = { generateQRCode };
