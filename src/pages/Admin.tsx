import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus, Trash2, Save, Upload, ImageIcon, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/** صف مدينة في لوحة التحكم. */
interface CityRow {
  id?: number;
  order: number;
  name_ar: string;
  name_en: string;
  image_url: string | null;
}

const BUCKET = 'city-images';
const SUPABASE_URL = 'https://lgkexjmtzmcwfbkockwj.supabase.co';
const publicUrl = (path: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

const Admin = () => {
  const [rows, setRows] = useState<CityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const notify = (type: 'ok' | 'err', text: string) => setMessage({ type, text });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('city_slides')
      .select('*')
      .order('order', { ascending: true });
    if (error) notify('err', error.message);
    setRows((data ?? []) as CityRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const patch = (index: number, p: Partial<CityRow>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...p } : r)));

  const uploadImage = async (index: number, file: File | undefined) => {
    if (!file) return;
    notify('ok', 'جاري رفع الصورة...');
    const path = `uploads/${Date.now()}_${file.name.replace(/[^\w.\-]+/g, '_')}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) return notify('err', 'فشل رفع الصورة: ' + error.message);
    patch(index, { image_url: publicUrl(path) });
    notify('ok', 'تم رفع الصورة ✓ — اضغط «حفظ» لتطبيقها');
  };

  const saveRow = async (index: number) => {
    const r = rows[index];
    if (!r.name_ar.trim()) return notify('err', 'اكتب اسم المدينة بالعربية');
    setSaving(index);
    setMessage(null);
    const { error } = await supabase.from('city_slides').upsert(
      {
        id: r.id ?? undefined,
        order: Number(r.order) || 0,
        name_ar: r.name_ar.trim(),
        name_en: r.name_en.trim() || r.name_ar.trim(),
        image_url: r.image_url,
      },
      { onConflict: 'id' },
    );
    setSaving(null);
    if (error) notify('err', 'فشل الحفظ: ' + error.message);
    else { notify('ok', 'تم الحفظ ✓'); load(); }
  };

  const deleteRow = async (index: number) => {
    const r = rows[index];
    if (!r.id) {
      setRows((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    const { error } = await supabase.from('city_slides').delete().eq('id', r.id);
    if (error) notify('err', 'فشل الحذف: ' + error.message);
    else { notify('ok', 'تم الحذف'); load(); }
  };

  const addRow = () =>
    setRows((prev) => [...prev, { order: prev.length, name_ar: '', name_en: '', image_url: null }]);
return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-900 to-amber-800 pt-6 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-yellow-300 transition-colors">
            <ArrowRight size={22} />
            <span className="font-semibold">العودة للرئيسية</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-xl">₹</span>
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold">لوحة تحكم المدن</h1>
              <p className="text-xs opacity-90">إدراج الصور وتعديل أسماء المدن</p>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl mb-4">
          <p className="font-semibold mb-2 flex items-center gap-2 text-gray-800">
            <ExternalLink size={16} /> روابط سريعة (لوحة Supabase السحابية)
          </p>
          <ul className="space-y-1 text-sm">
            <li>
              <a className="text-blue-600 underline" href="https://supabase.com/dashboard/project/lgkexjmtzmcwfbkockwj/editor/public/city_slides" target="_blank" rel="noopener noreferrer">
                جدول المدن (تعديل الأسماء يدوياً)
              </a>
            </li>
            <li>
              <a className="text-blue-600 underline" href="https://supabase.com/dashboard/project/lgkexjmtzmcwfbkockwj/storage/buckets/city-images" target="_blank" rel="noopener noreferrer">
                دلو الصور city-images (رفع الصور يدوياً)
              </a>
            </li>
          </ul>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-xl text-white text-sm font-medium ${message.type === 'ok' ? 'bg-green-600' : 'bg-red-600'}`}>
            {message.text}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mb-4">
          <button onClick={addRow} className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold px-4 py-2 rounded-xl shadow-lg hover:opacity-90 transition">
            <Plus size={18} /> إضافة مدينة
          </button>
          <button onClick={load} className="bg-amber-700/40 text-white px-4 py-2 rounded-xl hover:bg-amber-700/60 transition">
            تحديث القائمة
          </button>
        </div>

        {loading ? (
          <div className="text-center text-white py-20">جاري التحميل...</div>
        ) : (
          <div className="space-y-4">
            {rows.map((r, i) => (
              <div key={r.id ?? i} className="bg-white/95 rounded-2xl shadow-xl p-4 flex flex-col md:flex-row gap-4">
                <div className="flex flex-col items-center gap-2 md:w-44 shrink-0">
                  {r.image_url ? (
                    <img src={r.image_url} alt={r.name_ar} className="w-36 h-24 object-cover rounded-xl border" />
                  ) : (
                    <div className="w-36 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 gap-1">
                      <ImageIcon size={20} />
                      <span className="text-xs">لا صورة</span>
                    </div>
                  )}
                  <label className="flex items-center gap-1 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg cursor-pointer hover:bg-blue-700 transition">
                    <Upload size={14} /> رفع صورة
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(i, e.target.files?.[0])} />
                  </label>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">الاسم بالعربية</label>
                    <input className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-50" value={r.name_ar} onChange={(e) => patch(i, { name_ar: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">الاسم بالإنجليزية</label>
                    <input className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-50" value={r.name_en} onChange={(e) => patch(i, { name_en: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">الترتيب (order)</label>
                    <input type="number" className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-50" value={r.order} onChange={(e) => patch(i, { order: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">رابط الصورة (اختياري)</label>
                    <input dir="ltr" className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-50 text-xs" value={r.image_url ?? ''} onChange={(e) => patch(i, { image_url: e.target.value || null })} placeholder="https://.../city-images/..." />
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-2 shrink-0">
                  <button disabled={saving === i} onClick={() => saveRow(i)} className="flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-green-700 transition disabled:opacity-50">
                    <Save size={16} /> {saving === i ? 'حفظ...' : 'حفظ'}
                  </button>
                  <button onClick={() => deleteRow(i)} className="flex items-center justify-center gap-2 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-red-700 transition">
                    <Trash2 size={16} /> حذف
                  </button>
                </div>
              </div>
            ))}
            {rows.length === 0 && !loading && (
              <div className="text-center text-white py-16">لا توجد مدن بعد — اضغط «إضافة مدينة» للبدء.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
