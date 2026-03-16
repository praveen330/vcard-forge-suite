import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export const CARD_THEMES: { key: string; label: string; bg: string; text: string; accent: string; gradient?: string }[] = [
  { key: 'dark', label: 'Dark', bg: '#13131C', text: '#F5F2EC', accent: '#C4923A' },
  { key: 'ocean', label: 'Ocean', bg: '#0A1929', text: '#E3F2FD', accent: '#42A5F5', gradient: 'linear-gradient(135deg, #0A1929, #1A3A5C)' },
  { key: 'forest', label: 'Forest', bg: '#0D1F0D', text: '#E8F5E9', accent: '#66BB6A', gradient: 'linear-gradient(135deg, #0D1F0D, #1B3A1B)' },
  { key: 'sunset', label: 'Sunset', bg: '#1A0A00', text: '#FFF3E0', accent: '#FF7043', gradient: 'linear-gradient(135deg, #FF6B35, #D32F2F)' },
  { key: 'royal', label: 'Royal', bg: '#1A0033', text: '#F3E5F5', accent: '#AB47BC', gradient: 'linear-gradient(135deg, #1A0033, #4A0072)' },
  { key: 'white', label: 'Light', bg: '#FFFFFF', text: '#1A1A1A', accent: '#C4923A' },
  { key: 'coral', label: 'Coral', bg: '#FFF0ED', text: '#1A1A1A', accent: '#FF6B6B', gradient: 'linear-gradient(135deg, #FF9A9E, #FECFEF)' },
  { key: 'icici', label: 'Corporate', bg: '#FFFFFF', text: '#1A1A1A', accent: '#F58220', gradient: 'linear-gradient(135deg, #F58220, #E55B13)' },
];

export function getTheme(key: string) {
  return CARD_THEMES.find(t => t.key === key) || CARD_THEMES[0];
}

interface ThemePickerProps {
  value: string;
  onChange: (theme: string) => void;
}

export function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">Card Theme</Label>
      <div className="grid grid-cols-4 gap-2">
        {CARD_THEMES.map((theme) => (
          <button
            key={theme.key}
            onClick={() => onChange(theme.key)}
            className={cn(
              'relative rounded-lg p-3 border-2 transition-all text-center text-xs font-medium',
              value === theme.key
                ? 'border-primary ring-2 ring-primary/30 scale-105'
                : 'border-border hover:border-primary/50'
            )}
            style={{
              background: theme.gradient || theme.bg,
              color: theme.text,
            }}
          >
            <div className="w-4 h-4 rounded-full mx-auto mb-1" style={{ background: theme.accent }} />
            {theme.label}
          </button>
        ))}
      </div>
    </div>
  );
}
