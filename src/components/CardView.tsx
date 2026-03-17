import { Card, CardLink } from '@/types/database';
import { Promo } from '@/types/database';
import { PromoCard } from '@/components/PromoCard';
import { QRDisplay } from '@/components/QRDisplay';
import { WalletCard } from '@/components/WalletCard';
import { getTheme } from '@/components/ThemePicker';
import { ExternalLink, ChevronRight, Phone, Mail, MessageCircle, Smartphone, Globe, Linkedin, Instagram, Twitter, Download } from 'lucide-react';

interface CardViewProps {
  card: Card;
  promos?: Promo[];
  links?: CardLink[];
  appUrl: string;
}

function generateVCard(card: Card, publicUrl: string): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${card.full_name}`];
  if (card.company) lines.push(`ORG:${card.company}`);
  if (card.job_title) lines.push(`TITLE:${card.job_title}`);
  if (card.email) lines.push(`EMAIL;TYPE=WORK:${card.email}`);
  if (card.phone) lines.push(`TEL;TYPE=CELL:${card.phone}`);
  if (card.website) lines.push(`URL:${card.website}`);
  if (card.linkedin) lines.push(`X-SOCIALPROFILE;type=linkedin:${card.linkedin}`);
  if (card.avatar_url) lines.push(`PHOTO;VALUE=uri:${card.avatar_url}`);
  lines.push(`NOTE:Digital card: ${publicUrl}`);
  lines.push('END:VCARD');
  return lines.join('\r\n') + '\r\n';
}

export function CardView({ card, promos = [], links = [], appUrl }: CardViewProps) {
  const publicUrl = `${appUrl}/${card.slug}`;
  const theme = getTheme(card.theme_color || 'dark');
  const isLight = ['white', 'coral', 'icici'].includes(card.theme_color);

  const handleSaveContact = () => {
    const vcf = generateVCard(card, publicUrl);
    const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = card.full_name.trim().split(/\s+/).join('-').toLowerCase() + '.vcf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const socialLinks = [
    card.linkedin && { icon: <Linkedin className="w-4 h-4" />, href: card.linkedin.startsWith('http') ? card.linkedin : `https://linkedin.com/in/${card.linkedin}`, label: 'LinkedIn' },
    card.instagram && { icon: <Instagram className="w-4 h-4" />, href: `https://instagram.com/${card.instagram.replace('@', '')}`, label: 'Instagram' },
    card.twitter && { icon: <Twitter className="w-4 h-4" />, href: `https://x.com/${card.twitter.replace('@', '')}`, label: 'X' },
    card.website && { icon: <Globe className="w-4 h-4" />, href: card.website, label: 'Web' },
  ].filter(Boolean) as { icon: JSX.Element; href: string; label: string }[];

  const actionButtons = [
    { icon: <Smartphone className="w-5 h-5" />, label: 'Save Contact', onClick: handleSaveContact, accent: true },
    card.whatsapp && { icon: <MessageCircle className="w-5 h-5" />, label: 'WhatsApp', href: `https://wa.me/${card.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${card.full_name.split(' ')[0]}!`)}` },
    card.phone && { icon: <Phone className="w-5 h-5" />, label: 'Call', href: `tel:${card.phone}` },
    card.email && { icon: <Mail className="w-5 h-5" />, label: 'Email', href: `mailto:${card.email}` },
  ].filter(Boolean) as { icon: JSX.Element; label: string; onClick?: () => void; href?: string; accent?: boolean }[];

  const boxStyle = {
    background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'}`,
  };

  return (
    <div
      className="min-h-screen flex items-start justify-center px-4 py-8"
      style={{ background: theme.gradient || theme.bg, color: theme.text }}
    >
      <div className="w-full max-w-md space-y-5 animate-fade-in">
        {/* Company Logo - BIG */}
        {card.company_logo_url && (
          <div className="flex justify-center">
            <img src={card.company_logo_url} alt={card.company || 'Company'} className="h-16 w-auto max-w-[200px] object-contain" />
          </div>
        )}

        {/* Avatar + Name */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-28 h-28 rounded-full border-[3px] overflow-hidden"
            style={{ borderColor: theme.accent, background: isLight ? '#f5f5f5' : 'rgba(255,255,255,0.1)' }}
          >
            {card.avatar_url ? (
              <img src={card.avatar_url} alt={card.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold" style={{ color: theme.accent }}>
                {card.full_name.charAt(0)}
              </div>
            )}
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{card.full_name}</h1>
            {card.job_title && <p className="font-medium" style={{ color: theme.accent }}>{card.job_title}</p>}
            {card.company && <p className="text-sm opacity-70">{card.company}</p>}
          </div>
        </div>

        {/* Bio - wider */}
        {card.bio && (
          <div className="rounded-xl p-4 text-center text-sm" style={boxStyle}>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60">About Me</h4>
            <p className="opacity-80 leading-relaxed">{card.bio}</p>
          </div>
        )}

        {/* Action Buttons - compact grid */}
        <div className="grid grid-cols-2 gap-2">
          {actionButtons.map((btn, i) => {
            const cls = `flex flex-col items-center justify-center gap-1.5 rounded-xl p-3 text-center transition-transform hover:scale-[1.03] cursor-pointer`;
            const style = btn.accent
              ? { background: theme.accent, color: '#fff' }
              : { ...boxStyle };

            if (btn.href) {
              return (
                <a key={i} href={btn.href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>
                  {btn.icon}
                  <span className="text-xs font-semibold">{btn.label}</span>
                </a>
              );
            }
            return (
              <button key={i} onClick={btn.onClick} className={cls} style={style}>
                {btn.icon}
                <span className="text-xs font-semibold">{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Social Icons - single row */}
        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-3">
            {socialLinks.map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{ background: theme.accent, color: '#fff' }}
                title={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        )}

        {/* Useful Links */}
        {links.length > 0 && (
          <div className="rounded-xl p-4" style={boxStyle}>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-1 opacity-60">Useful Links</h4>
            <p className="text-xs opacity-40 mb-3">Guide to Products & Features</p>
            <div className="space-y-1">
              {links.map(link => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-lg transition-colors hover:opacity-80"
                  style={{ background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)' }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${theme.accent}20`, color: theme.accent }}>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-sm font-medium">{link.title}</span>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {card.gallery_images && card.gallery_images.length > 0 && (
          <div className="rounded-xl p-4" style={boxStyle}>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-60">Gallery</h4>
            <div className="grid grid-cols-2 gap-2">
              {card.gallery_images.map((img, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Promos */}
        {promos.length > 0 && (
          <div className="space-y-3">
            {promos.map(promo => <PromoCard key={promo.id} promo={promo} />)}
          </div>
        )}

        {/* Wallet Card */}
        <div className="rounded-xl p-4" style={boxStyle}>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-60 text-center">Add to Wallet</h4>
          <WalletCard card={card} appUrl={appUrl} />
        </div>

        {/* QR Share */}
        <div className="flex flex-col items-center pt-4 pb-8">
          <QRDisplay url={publicUrl} size={120} showDownload={false} label="Share my card" />
        </div>

        {/* Branding */}
        <div className="text-center pb-6">
          <p className="text-xs opacity-40">
            Powered by <span className="font-semibold" style={{ color: theme.accent }}>VCARD·OS</span>
          </p>
        </div>
      </div>
    </div>
  );
}
