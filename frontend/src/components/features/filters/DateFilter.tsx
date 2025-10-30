import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { wbrApi } from '@/services/wbrApi';

interface DateFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateFilter({ value, onChange }: DateFilterProps) {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [minDate, setMinDate] = useState<string>('');
  const [maxDate, setMaxDate] = useState<string>('');

  useEffect(() => {
    const loadAvailableDates = async () => {
      try {
        const dates = await wbrApi.getAvailableDates();
        setAvailableDates(dates);

        if (dates.length > 0) {
          // Datas vêm ordenadas DESC, então a primeira é a mais recente
          setMaxDate(dates[0]);
          setMinDate(dates[dates.length - 1]);
        }
      } catch (error) {
        console.error('Erro ao carregar datas disponíveis:', error);
      }
    };

    loadAvailableDates();
  }, []);

  // Valida quando o usuário seleciona/altera a data
  const handleDateChange = (newDate: string) => {
    if (!newDate) {
      onChange(newDate);
      return;
    }

    // Se ainda não carregou as datas, permite qualquer valor temporariamente
    if (availableDates.length === 0) {
      onChange(newDate);
      return;
    }

    // Verifica se a data selecionada existe na lista de datas disponíveis
    if (availableDates.includes(newDate)) {
      onChange(newDate);
    } else {
      // Data não disponível - busca a mais próxima
      const closestDate = findClosestAvailableDate(newDate, availableDates);
      onChange(closestDate);

      // Feedback visual (opcional)
      console.warn(`Data ${newDate} não disponível. Usando ${closestDate} (mais próxima)`);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="date-filter">Data</Label>
      <Input
        id="date-filter"
        type="date"
        value={value}
        onChange={(e) => handleDateChange(e.target.value)}
        min={minDate}
        max={maxDate}
        className="w-full"
      />
      {maxDate && (
        <p className="text-xs text-muted-foreground">
          Última data: {new Date(maxDate + 'T00:00:00').toLocaleDateString('pt-BR')}
        </p>
      )}
    </div>
  );
}

// Encontra a data mais próxima disponível
function findClosestAvailableDate(targetDate: string, availableDates: string[]): string {
  const target = new Date(targetDate + 'T00:00:00').getTime();

  let closest = availableDates[0];
  let minDiff = Math.abs(new Date(closest + 'T00:00:00').getTime() - target);

  for (const date of availableDates) {
    const diff = Math.abs(new Date(date + 'T00:00:00').getTime() - target);
    if (diff < minDiff) {
      minDiff = diff;
      closest = date;
    }
  }

  return closest;
}

export default DateFilter;
