import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, DollarSign } from 'lucide-react';

interface GoldPrices {
  [key: string]: {
    buy: string;
    sell: string;
  };
}

export const AdenAllGoldUpdateButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [goldPrices, setGoldPrices] = useState<GoldPrices>({
    'عيار 24': { buy: '', sell: '' },
    'عيار 22': { buy: '', sell: '' },
    'عيار 21': { buy: '', sell: '' },
    'عيار 18': { buy: '', sell: '' },
    'جنيه': { buy: '', sell: '' }
  });
  const { toast } = useToast();

  const handlePriceChange = (type: string, field: 'buy' | 'sell', value: string) => {
    setGoldPrices(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleUpdate = async (useManualPrices = true) => {
    if (useManualPrices) {
      // Check if at least one price is filled
      const hasValidPrice = Object.values(goldPrices).some(price => 
        price.buy.trim() !== '' && price.sell.trim() !== ''
      );
      
      if (!hasValidPrice) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال أسعار الشراء والبيع لعيار واحد على الأقل",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      const requestBody = useManualPrices ? {
        prices: Object.fromEntries(
          Object.entries(goldPrices).filter(([_, price]) => 
            price.buy.trim() !== '' && price.sell.trim() !== ''
          ).map(([type, price]) => [
            type, 
            { 
              buy: parseFloat(price.buy), 
              sell: parseFloat(price.sell) 
            }
          ])
        )
      } : {};

      const { data, error } = await supabase.functions.invoke('update-aden-all-gold-prices', {
        body: requestBody
      });

      if (error) throw error;

      const source = data?.source || (useManualPrices ? 'Manual Input' : 'boqash.com + calculations');
      const updatedCount = data?.results?.length || 0;
      
      toast({
        title: "نجح التحديث",
        description: `تم تحديث ${updatedCount} نوع من أسعار الذهب لعدن من ${source}`,
      });

      // Clear form
      setGoldPrices({
        'عيار 24': { buy: '', sell: '' },
        'عيار 22': { buy: '', sell: '' },
        'عيار 21': { buy: '', sell: '' },
        'عيار 18': { buy: '', sell: '' },
        'جنيه': { buy: '', sell: '' }
      });
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
        تحديث جميع أسعار الذهب - عدن
      </Button>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">تحديث جميع أسعار الذهب - عدن</h3>
        <Button
          onClick={() => setShowForm(false)}
          variant="ghost"
          size="sm"
        >
          ×
        </Button>
      </div>
      
      <div className="space-y-3">
        {Object.entries(goldPrices).map(([type, prices]) => (
          <div key={type} className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">{type}</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">سعر الشراء</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={prices.buy}
                  onChange={(e) => handlePriceChange(type, 'buy', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">سعر البيع</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={prices.sell}
                  onChange={(e) => handlePriceChange(type, 'sell', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => handleUpdate(true)}
          disabled={isLoading}
          className="flex-1"
          size="sm"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              جاري التحديث...
            </>
          ) : (
            'تحديث يدوي'
          )}
        </Button>
        <Button
          onClick={() => handleUpdate(false)}
          disabled={isLoading}
          variant="outline"
          className="flex-1"
          size="sm"
        >
          تحديث تلقائي
        </Button>
      </div>
    </Card>
  );
};