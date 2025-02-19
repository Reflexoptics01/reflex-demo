import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DateRange {
  startDate: Date;
  endDate: Date;
}

type CategoryType = 'sales' | 'purchases' | 'expenses' | 'stock' | 'advances';

interface FinancialData {
  date: Date;
  amount: number;
  category: CategoryType;
}

const FinancialReport: React.FC = () => {
  const [dateRangeType, setDateRangeType] = useState<'quarterly' | 'half-yearly' | 'custom'>('quarterly');
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date()
  });
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>(['sales']);
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [comparisonDateRange, setComparisonDateRange] = useState<DateRange>({
    startDate: new Date(new Date().getFullYear() - 1, 0, 1),
    endDate: new Date(new Date().getFullYear() - 1, 11, 31)
  });
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [comparisonData, setComparisonData] = useState<FinancialData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const categories: CategoryType[] = ['sales', 'purchases', 'expenses', 'stock', 'advances'];

  const fetchDataForRange = useCallback(async (range: DateRange): Promise<FinancialData[]> => {
    const data: FinancialData[] = [];
    
    for (const category of selectedCategories) {
      let collectionName = '';
      switch (category) {
        case 'sales':
          collectionName = 'orders';
          break;
        case 'purchases':
          collectionName = 'purchases';
          break;
        case 'expenses':
          collectionName = 'expenses';
          break;
        case 'stock':
          collectionName = 'inventory';
          break;
        case 'advances':
          collectionName = 'advances';
          break;
      }

      const q = query(
        collection(db, collectionName),
        where('timestamp', '>=', range.startDate),
        where('timestamp', '<=', range.endDate)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        data.push({
          date: docData.timestamp.toDate(),
          amount: parseFloat(docData.amount || docData.total || '0'),
          category
        });
      });
    }

    return data;
  }, [selectedCategories]);

  const fetchFinancialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentData = await fetchDataForRange(customDateRange);
      setFinancialData(currentData);

      if (comparisonEnabled) {
        const compareData = await fetchDataForRange(comparisonDateRange);
        setComparisonData(compareData);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [customDateRange, comparisonEnabled, comparisonDateRange, fetchDataForRange]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const handleDateRangeTypeChange = (type: 'quarterly' | 'half-yearly' | 'custom') => {
    setDateRangeType(type);
    const currentYear = new Date().getFullYear();
    
    switch (type) {
      case 'quarterly':
        const currentQuarter = Math.floor(new Date().getMonth() / 3);
        setCustomDateRange({
          startDate: new Date(currentYear, currentQuarter * 3, 1),
          endDate: new Date(currentYear, (currentQuarter + 1) * 3, 0)
        });
        break;
      case 'half-yearly':
        const currentHalf = Math.floor(new Date().getMonth() / 6);
        setCustomDateRange({
          startDate: new Date(currentYear, currentHalf * 6, 1),
          endDate: new Date(currentYear, (currentHalf + 1) * 6, 0)
        });
        break;
      // For custom, keep the existing date range
    }
  };

  const getChartData = () => {
    const labels = Array.from(new Set([
      ...financialData.map(d => d.date.toLocaleDateString()),
      ...comparisonData.map(d => d.date.toLocaleDateString())
    ])).sort();

    const datasets = selectedCategories.flatMap(category => {
      const currentPeriodData = {
        label: `${category} (Current Period)`,
        data: labels.map(label => {
          const matchingData = financialData.find(
            d => d.date.toLocaleDateString() === label && d.category === category
          );
          return matchingData?.amount || 0;
        }),
        borderColor: getCategoryColor(category),
        fill: false
      };

      if (comparisonEnabled) {
        const comparisonPeriodData = {
          label: `${category} (Comparison Period)`,
          data: labels.map(label => {
            const matchingData = comparisonData.find(
              d => d.date.toLocaleDateString() === label && d.category === category
            );
            return matchingData?.amount || 0;
          }),
          borderColor: getCategoryColor(category, true),
          fill: false,
          borderDash: [5, 5]
        };
        return [currentPeriodData, comparisonPeriodData];
      }

      return [currentPeriodData];
    });

    return { labels, datasets };
  };

  const getCategoryColor = (category: CategoryType, isComparison = false): string => {
    const colors = {
      sales: isComparison ? '#4CAF50AA' : '#4CAF50',
      purchases: isComparison ? '#2196F3AA' : '#2196F3',
      expenses: isComparison ? '#F44336AA' : '#F44336',
      stock: isComparison ? '#9C27B0AA' : '#9C27B0',
      advances: isComparison ? '#FF9800AA' : '#FF9800'
    };
    return colors[category];
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="space-y-6">
        {/* Date Range Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range Type</label>
            <div className="flex space-x-4">
              <button
                onClick={() => handleDateRangeTypeChange('quarterly')}
                className={`px-4 py-2 rounded-md ${
                  dateRangeType === 'quarterly'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Quarterly
              </button>
              <button
                onClick={() => handleDateRangeTypeChange('half-yearly')}
                className={`px-4 py-2 rounded-md ${
                  dateRangeType === 'half-yearly'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Half-Yearly
              </button>
              <button
                onClick={() => handleDateRangeTypeChange('custom')}
                className={`px-4 py-2 rounded-md ${
                  dateRangeType === 'custom'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {dateRangeType === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={customDateRange.startDate.toISOString().split('T')[0]}
                  onChange={(e) => setCustomDateRange(prev => ({
                    ...prev,
                    startDate: new Date(e.target.value)
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={customDateRange.endDate.toISOString().split('T')[0]}
                  onChange={(e) => setCustomDateRange(prev => ({
                    ...prev,
                    endDate: new Date(e.target.value)
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Category Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategories(prev =>
                    prev.includes(category)
                      ? prev.filter(c => c !== category)
                      : [...prev, category]
                  );
                }}
                className={`px-4 py-2 rounded-md ${
                  selectedCategories.includes(category)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Controls */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="enableComparison"
              checked={comparisonEnabled}
              onChange={(e) => setComparisonEnabled(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="enableComparison" className="text-sm font-medium text-gray-700">
              Enable Comparison
            </label>
          </div>

          {comparisonEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comparison Start Date
                </label>
                <input
                  type="date"
                  value={comparisonDateRange.startDate.toISOString().split('T')[0]}
                  onChange={(e) => setComparisonDateRange(prev => ({
                    ...prev,
                    startDate: new Date(e.target.value)
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comparison End Date
                </label>
                <input
                  type="date"
                  value={comparisonDateRange.endDate.toISOString().split('T')[0]}
                  onChange={(e) => setComparisonDateRange(prev => ({
                    ...prev,
                    endDate: new Date(e.target.value)
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="h-96">
              <Line
                data={getChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: 'index',
                    intersect: false,
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Financial Report'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `₹${value}`
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialReport; 