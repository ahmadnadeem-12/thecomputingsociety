const fs = require('fs');
const jsPDF = require('jspdf').jsPDF;

async function testPdfSize() {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  // Let's create a dummy JPEG base64 string
  // To simulate a large JPEG, we can use a library like canvas
}
