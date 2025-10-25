import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const SanaaGoldUpdateButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔄 بدء تحديث أسعار الذهب في صنعاء...');
      
      const { data, error } = await supabase.functions.invoke('update-gold-sanaa-zoza');
      
      if (error) {
        console.error('❌ خطأ في استدعاء دالة التحديث:', error);
        throw error;
      }

      if (data?.success) {
        console.log('✅ تم التحديث بنجاح:', data);
        
        toast({
          title: "✅ تم تحديث أسعار الذهب",
          description: `تم تحديث ${data.updatedTypes?.length || 0} عيار من موقع zoza.top`,
          duration: 6000,
        });
        
        // Reload the page to fetch fresh data
        window.location.reload();
      } else {
        throw new Error(data?.error || 'فشل في التحديث');
      }
    } catch (error) {
      console.error('❌ خطأ في التحديث:', error);
      toast({
        title: "❌ خطأ في التحديث",
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUpdate}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white border-0"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <TrendingUp className="h-4 w-4" />
      )}
      {isLoading ? 'جاري التحديث...' : 'تحديث أسعار الذهب'}
    </Button>
  );
};
