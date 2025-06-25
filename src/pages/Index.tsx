
import React, { useState } from 'react';
import CurrencyTabs from '@/components/CurrencyTabs';

const Index = () => {
  const [selectedCity, setSelectedCity] = useState('عدن');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-2xl">₹</span>
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold tracking-wide">أسعار العملات اليمنية</h1>
              <p className="text-sm opacity-90">تحديث مباشر ولحظي • {new Date().toLocaleDateString('ar-SA')}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium border border-white/30 shadow-lg">
              USD
            </div>
            <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium border border-white/30 shadow-lg">
              SAR
            </div>
            <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium border border-white/30 shadow-lg">
              AED
            </div>
            <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium border border-white/30 shadow-lg">
              EGP
            </div>
          </div>
        </div>
      </div>

      {/* City Selector */}
      <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="text-center mb-10">
          <h2 className="text-white text-2xl mb-8 font-light tracking-wide">اختر المدينة</h2>
          
          <div className="flex justify-center gap-8 mb-10">
            <button 
              onClick={() => setSelectedCity('صنعاء')} 
              className={`relative transition-all duration-500 group ${
                selectedCity === 'صنعاء' ? 'transform scale-110' : 'hover:transform hover:scale-105'
              }`}
            >
              <div className="w-36 h-36 rounded-3xl overflow-hidden border-4 border-gradient-to-r from-purple-400 to-pink-400 shadow-2xl group-hover:shadow-purple-500/50 transition-all duration-300">
                <img 
                  alt="صنعاء" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                  src="/lovable-uploads/51456852-7651-4526-9445-d268f033ea3c.jpg" 
                />
              </div>
              <div className="mt-4 text-white text-xl font-bold tracking-wide">صنعاء</div>
              {selectedCity === 'صنعاء' && (
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full shadow-lg"></div>
              )}
            </button>

            <button 
              onClick={() => setSelectedCity('عدن')} 
              className={`relative transition-all duration-500 group ${
                selectedCity === 'عدن' ? 'transform scale-110' : 'hover:transform hover:scale-105'
              }`}
            >
              <div className="w-36 h-36 rounded-3xl overflow-hidden border-4 border-gradient-to-r from-blue-400 to-cyan-400 shadow-2xl group-hover:shadow-blue-500/50 transition-all duration-300">
                <img 
                  alt="عدن" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                  src="/lovable-uploads/401073c5-56aa-4edd-b071-9494a6cc2ce0.jpg" 
                />
              </div>
              <div className="mt-4 text-white text-xl font-bold tracking-wide">
                عدن
                <div className="h-1 bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 to-red-400 rounded-full mt-2 mx-auto w-16"></div>
              </div>
              {selectedCity === 'عدن' && (
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-lg"></div>
              )}
            </button>
          </div>
        </div>

        {/* Currency Cards */}
        <CurrencyTabs selectedCity={selectedCity} />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-white/20 px-4 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-4 text-center">
            <button className="flex flex-col items-center gap-2 text-purple-600 hover:text-purple-700 transition-all duration-300 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-xl">😊</span>
              </div>
              <span className="text-sm font-medium">مساعد</span>
            </button>
            
            <button className="flex flex-col items-center gap-2 text-purple-600 hover:text-purple-700 transition-all duration-300 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-xl">🏠</span>
              </div>
              <span className="text-sm font-medium">الرئيسية</span>
            </button>
            
            <button className="flex flex-col items-center gap-2 text-purple-600 hover:text-purple-700 transition-all duration-300 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-xl">👤</span>
              </div>
              <span className="text-sm font-medium">حسابي</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
