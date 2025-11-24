
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-900 to-amber-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors">
              <ArrowRight size={24} />
              <span>العودة للرئيسية</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-2xl">₹</span>
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold tracking-wide">التواصل معنا</h1>
              <p className="text-sm opacity-90">للاستفسار والدعم الفني</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Content */}
      <div className="max-w-4xl mx-auto py-20 px-4">
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-4xl font-bold text-gray-800 mb-4">
              معلومات التواصل
            </CardTitle>
            <p className="text-lg text-gray-600">
              نحن هنا لمساعدتك في أي استفسار
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* App Designer Info with Logo */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-100 p-8 rounded-2xl border border-purple-200 shadow-lg">
              <div className="text-center space-y-4">
                <div className="flex justify-center mb-4">
                  <img 
                    src="/lovable-uploads/caa96dde-c2b5-46a7-b10a-316f029f8d63.png" 
                    alt="الشواحي إكسبريس"
                    className="w-24 h-24 rounded-2xl shadow-xl border-4 border-white"
                  />
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-purple-200 shadow-md">
                  <p className="text-gray-700 text-lg leading-relaxed font-medium">
                    تم تصميم التطبيق من قبل الداعم الفني لشركة الشواحي للصرافة
                  </p>
                  <p className="text-purple-600 text-xl font-bold mt-2">
                    صبري الربيزي
                  </p>
                </div>
              </div>
            </div>

            {/* Developer Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl border border-blue-200 shadow-lg">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <span className="text-white font-bold text-3xl">ص</span>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800">
                  صبري الربيزي
                </h2>
                
                <p className="text-lg text-gray-700">
                  مطور التطبيق والداعم الفني
                </p>
              </div>
            </div>

            {/* Contact Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone Contact */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Phone size={24} className="text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 text-center mb-3">
                  اتصال مباشر
                </h3>
                
                <div className="text-center">
                  <a 
                    href="tel:772055335" 
                    className="text-2xl font-bold text-green-600 hover:text-green-700 transition-colors block"
                    dir="ltr"
                  >
                    772055335
                  </a>
                  <p className="text-sm text-gray-600 mt-2">انقر للاتصال المباشر</p>
                </div>
              </div>

              {/* WhatsApp Contact */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle size={24} className="text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 text-center mb-3">
                  واتساب
                </h3>
                
                <div className="text-center">
                  <a 
                    href="https://wa.me/967772055335" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xl font-bold text-green-600 hover:text-green-700 transition-colors block"
                    dir="ltr"
                  >
                    772055335
                  </a>
                  <p className="text-sm text-gray-600 mt-2">انقر للمراسلة عبر واتساب</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200 shadow-lg">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  أوقات التواصل
                </h3>
                <p className="text-gray-700">
                  متاح للتواصل من السبت إلى الخميس
                </p>
                <p className="text-gray-700">
                  من الساعة 9:00 صباحاً إلى 6:00 مساءً
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
