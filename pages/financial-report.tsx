import React from 'react';
import FinancialReport from '../components/FinancialReport';
import { NextPage } from 'next';

const FinancialReportPage: NextPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Financial Report</h1>
        <p className="mt-2 text-sm text-gray-600">
          Analyze financial data with custom date ranges, category filters, and period comparisons
        </p>
      </div>
      
      <FinancialReport />
    </div>
  );
};

export default FinancialReportPage; 