import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, DollarSign } from 'lucide-react';

export const AdenGold21UpdateButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const { toast } = useToast();

  const handleUpdate = async () => {
    if (!buyPrice || !sellPrice) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال أسعار الشراء والبيع",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-aden-gold-21-whatsapp', {
        body: {
          buy_price: parseFloat(buyPrice),
          sell_price: parseFloat(sellPrice)
        }
      });

      if (error) throw error;

      toast({
        title: "نجح التحديث",
        description: "تم تحديث أسعار الذهب عيار 21 لعدن بنجاح",
      });

      setBuyPrice('');
      setSellPrice('');
      setShowForm(false);
    } catch (error) {
      console.error('Error updating gold prices:', error);
      toast({
        title: "خطأ في التحديث",
        description: "فشل في تحديث أسعار الذهب",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <DollarSign className="h-4 w-4" />
        تحديث ذهب 21 عدن
      </Button>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">تحديث أسعار الذهب عيار 21 - عدن</h3>
        <Button
          onClick={() => setShowForm(false)}
          variant="ghost"
          size="sm"
        >
          ×
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground">سعر الشراء</label>
          <Input
            type="number"
            placeholder="22300"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            className="text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">سعر البيع</label>
          <Input
            type="number"
            placeholder="22600"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      <Button
        onClick={handleUpdate}
        disabled={isLoading}
        className="w-full"
        size="sm"
      >
        {isLoading ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            جاري التحديث...
          </>
        ) : (
          'تحديث الأسعار'
        )}
      </Button>
    </Card>
  );
};