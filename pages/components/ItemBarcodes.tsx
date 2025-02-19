import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQRCode } from 'next-qrcode';
import Barcode from 'react-barcode';
import { PrinterIcon, XMarkIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import QRCode from 'qrcode';

interface PurchaseOrderItem {
  id: string;
  brand: string;
  quantity: string;
  price: string;
  notes?: string;
  type: 'frame' | 'lens' | 'contact-lens' | 'accessory';
  modelNumber?: string;
  size?: string;
  frameType?: string;
  shape?: string;
  color?: string;
  material?: string;
  index?: string;
  coating?: string;
  category?: string;
  diameter?: string;
  replacement?: string;
  baseCurve?: string;
  waterContent?: string;
}

interface ItemBarcodesProps {
  item: PurchaseOrderItem;
  purchaseOrderId: string;
  itemIndex: number;
}

export function ItemBarcodes({ item, purchaseOrderId, itemIndex }: ItemBarcodesProps) {
  const { Canvas } = useQRCode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [qrDataUrls, setQrDataUrls] = useState<string[]>([]);
  const quantity = parseInt(item.quantity) || 1;
  const barcodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const qrRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Generate a unique code for each item that includes all relevant information
  const generateItemCode = (sequenceNumber: number) => {
    const baseCode = `PO${purchaseOrderId}-${itemIndex + 1}-${sequenceNumber}`;
    return baseCode;
  };

  // Generate item information for QR code
  const generateItemInfo = useCallback((sequenceNumber: number) => {
    const baseInfo = {
      purchaseOrderId,
      itemIndex: itemIndex + 1,
      sequenceNumber,
      type: item.type,
      brand: item.brand,
      ...item
    };
    return JSON.stringify(baseInfo);
  }, [purchaseOrderId, itemIndex, item]);

  useEffect(() => {
    if (isGenerated) {
      const generateQRDataUrls = async () => {
        try {
          const urls = await Promise.all(
            Array.from({ length: quantity }, async (_, i) => {
              const itemInfo = generateItemInfo(i + 1);
              return await QRCode.toDataURL(itemInfo, {
                width: 200,
                margin: 1,
                errorCorrectionLevel: 'M'
              });
            })
          );
          setQrDataUrls(urls);
        } catch (error) {
          console.error('Error generating QR codes:', error);
        }
      };
      generateQRDataUrls();
    }
  }, [isGenerated, quantity, generateItemInfo]);

  const handlePrintBarcode = (index: number) => {
    const printContent = barcodeRefs.current[index];
    if (printContent) {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Barcode</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          body { margin: 20px; }
          .print-container { text-align: center; }
          .details { margin-top: 15px; font-size: 14px; }
          .title { font-size: 16px; font-weight: bold; margin-bottom: 15px; }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write('<div class="print-container">');
        printWindow.document.write('<div class="title">Barcode - Unit ' + (index + 1) + '</div>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</div></body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const handlePrintQR = (index: number) => {
    const qrDataUrl = qrDataUrls[index];
    if (qrDataUrl) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print QR Code</title>
              <style>
                @media print {
                  body { margin: 0; }
                  img { max-width: 100%; height: auto; }
                }
                body { margin: 20px; text-align: center; }
                .print-container { display: inline-block; }
                .details { margin-top: 15px; font-size: 14px; line-height: 1.4; }
                .title { font-size: 16px; font-weight: bold; margin-bottom: 15px; }
                .qr-image { width: 200px; height: 200px; }
              </style>
            </head>
            <body>
              <div class="print-container">
                <div class="title">QR Code - Unit ${index + 1}</div>
                <img 
                  src="${qrDataUrl}" 
                  class="qr-image" 
                />
                <div class="details">
                  <div><strong>Type:</strong> ${item.type}</div>
                  <div><strong>Brand:</strong> ${item.brand}</div>
                  ${item.modelNumber ? `<div><strong>Model:</strong> ${item.modelNumber}</div>` : ''}
                </div>
              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    window.close();
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  // Generate multiple barcodes based on quantity
  const generateBarcodes = () => {
    return Array.from({ length: quantity }, (_, i) => {
      const itemCode = generateItemCode(i + 1);
      const itemInfo = generateItemInfo(i + 1);

      return (
        <div key={i} className="mb-6 p-4 border rounded-lg bg-white">
          <div className="text-sm font-medium text-gray-900 mb-3">
            Unit {i + 1} of {quantity}
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center border rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Barcode</div>
              <div 
                ref={el => barcodeRefs.current[i] = el}
                className="bg-white"
              >
                <Barcode 
                  value={itemCode}
                  width={1.2}
                  height={50}
                  fontSize={12}
                  margin={5}
                  displayValue={true}
                />
                <div className="mt-2 text-xs text-gray-500">
                  <div><strong>Type:</strong> {item.type}</div>
                  <div><strong>Brand:</strong> {item.brand}</div>
                  {item.modelNumber && <div><strong>Model:</strong> {item.modelNumber}</div>}
                </div>
              </div>
              <button
                onClick={() => handlePrintBarcode(i)}
                className="mt-2 inline-flex items-center px-2 py-1 text-xs border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                <PrinterIcon className="h-4 w-4 mr-1" />
                Print Barcode
              </button>
            </div>

            <div className="flex flex-col items-center border rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-2">QR Code</div>
              <div 
                ref={el => qrRefs.current[i] = el}
                className="bg-white"
              >
                {qrDataUrls[i] ? (
                  <img 
                    src={qrDataUrls[i]} 
                    alt="QR Code" 
                    width={120}
                    height={120}
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                ) : (
                  <Canvas
                    text={itemInfo}
                    options={{
                      type: 'image/png',
                      quality: 0.9,
                      margin: 1,
                      scale: 4,
                      width: 120,
                    }}
                  />
                )}
                <div className="mt-2 text-xs text-gray-500">
                  <div><strong>Type:</strong> {item.type}</div>
                  <div><strong>Brand:</strong> {item.brand}</div>
                  {item.modelNumber && <div><strong>Model:</strong> {item.modelNumber}</div>}
                </div>
              </div>
              <button
                onClick={() => handlePrintQR(i)}
                className="mt-2 inline-flex items-center px-2 py-1 text-xs border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                <QrCodeIcon className="h-4 w-4 mr-1" />
                Print QR
              </button>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-xs inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm font-medium rounded text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        Barcodes & QR
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Barcodes and QR Codes - Item {itemIndex + 1}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {!isGenerated ? (
                  <button
                    onClick={() => setIsGenerated(true)}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Generate Codes
                  </button>
                ) : (
                  <div className="max-h-[70vh] overflow-y-auto">
                    {generateBarcodes()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 