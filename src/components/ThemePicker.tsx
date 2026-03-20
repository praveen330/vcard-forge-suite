import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const CARD_THEMES: { key: string; label: string; bg: string; text: string; accent: string; gradient?: string }[] = [
  // Dark themes
  { key: 'dark', label: 'Dark', bg: '#13131C', text: '#F5F2EC', accent: '#C4923A' },
  { key: 'ocean', label: 'Ocean', bg: '#0A1929', text: '#E3F2FD', accent: '#42A5F5', gradient: 'linear-gradient(135deg, #0A1929, #1A3A5C)' },
  { key: 'forest', label: 'Forest', bg: '#0D1F0D', text: '#E8F5E9', accent: '#66BB6A', gradient: 'linear-gradient(135deg, #0D1F0D, #1B3A1B)' },
  { key: 'sunset', label: 'Sunset', bg: '#1A0A00', text: '#FFF3E0', accent: '#FF7043', gradient: 'linear-gradient(135deg, #FF6B35, #D32F2F)' },
  { key: 'royal', label: 'Royal', bg: '#1A0033', text: '#F3E5F5', accent: '#AB47BC', gradient: 'linear-gradient(135deg, #1A0033, #4A0072)' },
  { key: 'charcoal', label: 'Charcoal', bg: '#1C1C1E', text: '#F2F2F7', accent: '#FF9F0A', gradient: 'linear-gradient(135deg, #1C1C1E, #2C2C2E)' },
  { key: 'navy', label: 'Navy', bg: '#0F172A', text: '#F1F5F9', accent: '#38BDF8', gradient: 'linear-gradient(135deg, #0F172A, #1E3A5F)' },
  { key: 'wine', label: 'Wine', bg: '#1A0A14', text: '#FDE8EF', accent: '#F43F5E', gradient: 'linear-gradient(135deg, #1A0A14, #4A1028)' },
  { key: 'graphite', label: 'Graphite', bg: '#18181B', text: '#FAFAFA', accent: '#A1A1AA', gradient: 'linear-gradient(135deg, #18181B, #27272A)' },
  // Light / white themes
  { key: 'white', label: 'Classic', bg: '#FFFFFF', text: '#1A1A1A', accent: '#C4923A' },
  { key: 'pearl', label: 'Pearl', bg: '#FAFAF8', text: '#2D2D2D', accent: '#8B7355', gradient: 'linear-gradient(135deg, #FAFAF8, #F0EDE5)' },
  { key: 'icici', label: 'Corporate', bg: '#FFFFFF', text: '#1A1A1A', accent: '#F58220', gradient: 'linear-gradient(135deg, #FFFFFF, #FFF5EB)' },
  { key: 'mint', label: 'Mint', bg: '#F5FBF8', text: '#1A2E28', accent: '#0D9488', gradient: 'linear-gradient(135deg, #F5FBF8, #E0F2EE)' },
  { key: 'lavender', label: 'Lavender', bg: '#F8F5FF', text: '#2D1F4E', accent: '#7C3AED', gradient: 'linear-gradient(135deg, #F8F5FF, #EDE5FF)' },
  { key: 'sky', label: 'Sky', bg: '#F0F7FF', text: '#1A2B4A', accent: '#2563EB', gradient: 'linear-gradient(135deg, #F0F7FF, #DBEAFE)' },
  { key: 'coral', label: 'Coral', bg: '#FFF0ED', text: '#1A1A1A', accent: '#FF6B6B', gradient: 'linear-gradient(135deg, #FFF0ED, #FFE0DB)' },
  { key: 'sand', label: 'Sand', bg: '#FAF7F2', text: '#3D3528', accent: '#B8860B', gradient: 'linear-gradient(135deg, #FAF7F2, #F0E8D8)' },
  { key: 'rose', label: 'Rose', bg: '#FFF5F7', text: '#3D1F28', accent: '#E11D48', gradient: 'linear-gradient(135deg, #FFF5F7, #FFE0E6)' },
  { key: 'slate', label: 'Slate', bg: '#F8FAFC', text: '#1E293B', accent: '#475569', gradient: 'linear-gradient(135deg, #F8FAFC, #E2E8F0)' },
  { key: 'cream', label: 'Cream', bg: '#FFFDF7', text: '#292524', accent: '#D97706', gradient: 'linear-gradient(135deg, #FFFDF7, #FEF3C7)' },
  { key: 'arctic', label: 'Arctic', bg: '#F0FDFF', text: '#164E63', accent: '#0891B2', gradient: 'linear-gradient(135deg, #F0FDFF, #CFFAFE)' },
  { key: 'blush', label: 'Blush', bg: '#FDF2F8', text: '#831843', accent: '#EC4899', gradient: 'linear-gradient(135deg, #FDF2F8, #FCE7F3)' },
  { key: 'ivory', label: 'Ivory', bg: '#FEFCE8', text: '#3F3F46', accent: '#84CC16', gradient: 'linear-gradient(135deg, #FEFCE8, #ECFCCB)' },
  { key: 'silver', label: 'Silver', bg: '#F4F4F5', text: '#27272A', accent: '#71717A', gradient: 'linear-gradient(135deg, #F4F4F5, #E4E4E7)' },
  // Custom option
  { key: 'custom', label: 'Custom', bg: '#FFFFFF', text: '#1A1A1A', accent: '#2563EB' },
];

export function getTheme(key: string, primaryColor?: string | null, secondaryColor?: string | null) {
  if (key === 'custom' && primaryColor) {
    const isLightPrimary = isLightColor(primaryColor);
    return {
      key: 'custom',
      label: 'Custom',
      bg: secondaryColor || '#FFFFFF',
      text: isLightPrimary ? '#1A1A1A' : '#FFFFFF',
      accent: primaryColor,
      gradient: secondaryColor
        ? `linear-gradient(135deg, ${secondaryColor}, ${adjustBrightness(secondaryColor, -15)})`
        : undefined,
    };
  }
  return CARD_THEMES.find(t => t.key === key) || CARD_THEMES[0];
}

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

function adjustBrightness(hex: string, percent: number): string {
  const c = hex.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(c.substring(0, 2), 16) + Math.round(2.55 * percent)));
  const g = Math.max(0, Math.min(255, parseInt(c.substring(2, 4), 16) + Math.round(2.55 * percent)));
  const b = Math.max(0, Math.min(255, parseInt(c.substring(4, 6), 16) + Math.round(2.55 * percent)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

interface ThemePickerProps {
  value: string;
  onChange: (theme: string) => void;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  onPrimaryChange?: (color: string) => void;
  onSecondaryChange?: (color: string) => void;
}

export function ThemePicker({ value, onChange, primaryColor, secondaryColor, onPrimaryChange, onSecondaryChange }: ThemePickerProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Card Theme</Label>
      <div className="grid grid-cols-5 gap-2">
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
              background: theme.key === 'custom' && primaryColor
                ? `linear-gradient(135deg, ${primaryColor}, ${secondaryColor || '#FFFFFF'})`
                : theme.gradient || theme.bg,
              color: theme.key === 'custom' ? '#1A1A1A' : theme.text,
            }}
          >
            <div
              className="w-4 h-4 rounded-full mx-auto mb-1"
              style={{ background: theme.key === 'custom' && primaryColor ? primaryColor : theme.accent }}
            />
            {theme.label}
          </button>
        ))}
      </div>

      {value === 'custom' && (
        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-card">
          <div>
            <Label className="text-xs">Primary Color (accent/brand)</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={primaryColor || '#2563EB'}
                onChange={e => onPrimaryChange?.(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0"
              />
              <Input
                value={primaryColor || '#2563EB'}
                onChange={e => onPrimaryChange?.(e.target.value)}
                placeholder="#2563EB"
                className="bg-background text-xs h-8"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Secondary Color (background)</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={secondaryColor || '#FFFFFF'}
                onChange={e => onSecondaryChange?.(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0"
              />
              <Input
                value={secondaryColor || '#FFFFFF'}
                onChange={e => onSecondaryChange?.(e.target.value)}
                placeholder="#FFFFFF"
                className="bg-background text-xs h-8"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
