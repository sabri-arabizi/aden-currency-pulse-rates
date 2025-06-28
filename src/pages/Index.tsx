import React, { useState } from 'react';
import CurrencyTabs from '@/components/CurrencyTabs';
import SarUpdateButton from '@/components/SarUpdateButton';
import GoldUpdateButton from '@/components/GoldUpdateButton';
import { Link } from 'react-router-dom';
const Index = () => {
  const [selectedCity, setSelectedCity] = useState('عدن');
  return <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-900 to-amber-800 py-0 relative">
      {/* Background Logo - الصورة الثانية */}
      <div className="fixed bottom-4 left-4 z-0 opacity-20">
        <img src="/lovable-uploads/53f2e558-f1d9-467f-88bf-47f6983e46bb.png" alt="Logo" className="w-32 min-h-32 min-h-32 " />
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 md:p-6 shadow-2xl relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 rounded-full bg-yellow-400/80 p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-xl md:text-2xl">₹</span>
            </div>
            <div className="text-white text-center sm:text-right">
              <h1 className="text-xl md:text-2xl font-bold tracking-wide">أسعار العملات اليمنية</h1>
              <p className="text-xs md:text-sm opacity-90">تحديث مباشر ولحظي • {new Date().toLocaleDateString('en-US')}</p>
            </div>
          </div>
          
          <div className="flex gap-2 md:gap-3 items-center flex-wrap justify-center">
            <SarUpdateButton />
            <GoldUpdateButton />
            
            <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-xl text-xs md:text-sm font-medium border border-white/30 shadow-lg">
              USD
            </div>
            <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-xl text-xs md:text-sm font-medium border border-white/30 shadow-lg">
              AED
            </div>
            <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-xl text-xs md:text-sm font-medium border border-white/30 shadow-lg">
              EGP
            </div>
          </div>
        </div>
      </div>

      {/* City Selector */}
      <div className="max-w-7xl mx-auto py-6 md:py-10 px-4 relative z-10">
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-white text-xl md:text-2xl mb-6 md:mb-8 font-light tracking-wide">اختر المدينة</h2>
          
          <div className="flex justify-center gap-4 md:gap-8 mb-6 md:mb-10 px-4 mx-auto py-4 bg-amber-800/40 rounded-full backdrop-blur-sm">
            <button onClick={() => setSelectedCity('صنعاء')} className={`relative transition-all duration-500 group ${selectedCity === 'صنعاء' ? 'transform scale-110' : 'hover:transform hover:scale-105'}`}>
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl overflow-hidden border-4 border-gradient-to-r from-purple-400 to-pink-400 shadow-2xl group-hover:shadow-purple-500/50 transition-all duration-300">
                <img alt="صنعاء" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" src="/lovable-uploads/51456852-7651-4526-9445-d268f033ea3c.jpg" />
              </div>
              <div className="mt-4 text-white text-lg md:text-xl font-bold tracking-wide">صنعاء</div>
              {selectedCity === 'صنعاء' && <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full shadow-lg"></div>}
            </button>

            <button onClick={() => setSelectedCity('عدن')} className={`relative transition-all duration-500 group ${selectedCity === 'عدن' ? 'transform scale-110' : 'hover:transform hover:scale-105'}`}>
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl overflow-hidden border-4 border-gradient-to-r from-blue-400 to-cyan-400 shadow-2xl group-hover:shadow-blue-500/50 transition-all duration-300">
                <img alt="عدن" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" src="/lovable-uploads/401073c5-56aa-4edd-b071-9494a6cc2ce0.jpg" />
              </div>
              <div className="mt-4 text-white text-lg md:text-xl font-bold tracking-wide">
                عدن
                <div className="h-1 bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 rounded-full mt-2 mx-auto w-16"></div>
              </div>
              {selectedCity === 'عدن' && <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-lg"></div>}
            </button>
          </div>
        </div>

        <CurrencyTabs selectedCity={selectedCity} />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 backdrop-blur-md border-t border-white/20 px-4 py-3 md:py-4 shadow-2xl safe-area-inset-bottom bg-amber-900/50 z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
            <Link to="/contact" className="flex flex-col items-center gap-1 md:gap-2 text-yellow-400 hover:text-yellow-300 transition-all duration-300 group p-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-lg md:text-xl">📞</span>
              </div>
              <span className="text-xs md:text-sm font-medium">التواصل معنا</span>
            </Link>
            
            <button className="flex flex-col items-center gap-1 md:gap-2 text-yellow-400 hover:text-yellow-300 transition-all duration-300 group p-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-lg md:text-xl">🏠</span>
              </div>
              <span className="text-xs md:text-sm font-medium">الرئيسية</span>
            </button>
            
            <button className="flex flex-col items-center gap-1 md:gap-2 text-yellow-400 hover:text-yellow-300 transition-all duration-300 group p-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-lg md:text-xl">👤</span>
              </div>
              <span className="text-xs md:text-sm font-medium">حسابي</span>
            </button>
          </div>
        </div>
      </div>
    </div>;
};
export default Index;