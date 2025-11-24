
-- إلغاء جميع المهام المجدولة الموجودة
DO $$ 
DECLARE 
    job_record RECORD;
BEGIN
    -- إلغاء جميع المهام التي تحتوي على 'update' في اسمها
    FOR job_record IN 
        SELECT jobname FROM cron.job WHERE jobname LIKE '%update%'
    LOOP
        PERFORM cron.unschedule(job_record.jobname);
        RAISE NOTICE 'تم إلغاء المهمة: %', job_record.jobname;
    END LOOP;
END $$;

-- التحقق من المهام المتبقية
SELECT 
    jobname as "اسم المهمة",
    schedule as "الجدولة", 
    active as "نشطة"
FROM cron.job 
ORDER BY jobname;
