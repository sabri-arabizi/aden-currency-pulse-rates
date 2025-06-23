import React, { useState } from 'react';
import CurrencyTabs from '@/components/CurrencyTabs';
const Index = () => {
  const [selectedCity, setSelectedCity] = useState('عدن');
  return <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-red-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-800 to-red-800 p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">₹</span>
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold">أسعار العملات</h1>
              <p className="text-sm opacity-90">آخر تحديث: {new Date().toLocaleDateString('ar-SA')}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              USD
            </div>
            <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
              SAR
            </div>
            <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              ₹
            </div>
          </div>
        </div>
      </div>

      {/* City Selector */}
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center mb-8">
          <h2 className="text-white text-xl mb-6">اختر المدينة</h2>
          
          <div className="flex justify-center gap-6 mb-8">
            <button onClick={() => setSelectedCity('صنعاء')} className={`relative transition-all duration-300 ${selectedCity === 'صنعاء' ? 'transform scale-110' : 'hover:transform hover:scale-105'}`}>
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-500 shadow-xl">
                <img alt="صنعاء" className="w-full h-full object-cover" src="/lovable-uploads/51456852-7651-4526-9445-d268f033ea3c.jpg" />
              </div>
              <div className="mt-3 text-white text-lg font-bold">صنعاء</div>
              {selectedCity === 'صنعاء' && <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-yellow-500 rounded-full"></div>}
            </button>

            <button onClick={() => setSelectedCity('عدن')} className={`relative transition-all duration-300 ${selectedCity === 'عدن' ? 'transform scale-110' : 'hover:transform hover:scale-105'}`}>
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-500 shadow-xl">
                <img alt="عدن" className="w-full h-full object-cover" src="/lovable-uploads/401073c5-56aa-4edd-b071-9494a6cc2ce0.jpg" />
              </div>
              <div className="mt-3 text-white text-lg font-bold">
                عدن
                <div className="h-1 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 to-red-500 rounded-full mt-1 mx-auto w-12"></div>
              </div>
              {selectedCity === 'عدن' && <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-yellow-500 rounded-full"></div>}
            </button>
          </div>

          {/* Currency/Gold Toggle */}
          <div className="flex justify-center gap-4 mb-8">
            <button className="bg-yellow-500 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-yellow-600 transition-colors flex items-center gap-2">
              <span>💰</span>
              عملات
            </button>
            <button className="bg-gray-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
              <span>🥇</span>
              ذهب
            </button>
          </div>
        </div>

        {/* Currency Cards */}
        <CurrencyTabs selectedCity={selectedCity} />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 gap-4 text-center">
            <button className="flex flex-col items-center gap-1 text-yellow-600 hover:text-yellow-700 transition-colors">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-lg">😊</span>
              </div>
              <span className="text-xs font-medium">مساعد</span>
            </button>
            
            <button className="flex flex-col items-center gap-1 text-yellow-600 hover:text-yellow-700 transition-colors">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-lg">🏠</span>
              </div>
              <span className="text-xs font-medium">الرئيسية</span>
            </button>
            
            <button className="flex flex-col items-center gap-1 text-yellow-600 hover:text-yellow-700 transition-colors">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-lg">👤</span>
              </div>
              <span className="text-xs font-medium">حسابي</span>
            </button>
          </div>
        </div>
      </div>
    </div>;
};
export default Index;