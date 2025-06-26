
-- تنظيف وإزالة جميع المهام المجدولة
-- تم تشغيل هذا الأمر مسبقاً ولكن نحتفظ بالملف للمرجعية

-- إلغاء جميع المهام المجدولة التي تحتوي على 'update' في اسمها
DO $$ 
DECLARE 
    job_record RECORD;
BEGIN
    FOR job_record IN 
        SELECT jobname FROM cron.job WHERE jobname LIKE '%update%'
    LOOP
        PERFORM cron.unschedule(job_record.jobname);
        RAISE NOTICE 'تم إلغاء المهمة: %', job_record.jobname;
    END LOOP;
END $$;

-- التحقق من عدم وجود مهام مجدولة متبقية
SELECT 
    jobname as "اسم المهمة",
    schedule as "الجدولة", 
    active as "نشطة"
FROM cron.job 
WHERE jobname LIKE '%update%'
ORDER BY jobname;
