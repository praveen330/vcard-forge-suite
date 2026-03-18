import { useState } from 'react';
import { Card, CardLink } from '@/types/database';
import { Promo } from '@/types/database';
import { PromoCard } from '@/components/PromoCard';
import { QRDisplay } from '@/components/QRDisplay';
import { WalletCard } from '@/components/WalletCard';
import { getTheme } from '@/components/ThemePicker';
import { ExternalLink, ChevronRight, Download, X } from 'lucide-react';

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

// Brand colors for social/action buttons
const BRAND_COLORS: Record<string, { bg: string; text: string }> = {
  save: { bg: '#000000', text: '#FFFFFF' },
  whatsapp: { bg: '#25D366', text: '#FFFFFF' },
  call: { bg: '#007AFF', text: '#FFFFFF' },
  email: { bg: '#EA4335', text: '#FFFFFF' },
  linkedin: { bg: '#0A66C2', text: '#FFFFFF' },
  instagram: { bg: '#E4405F', text: '#FFFFFF' },
  twitter: { bg: '#000000', text: '#FFFFFF' },
  website: { bg: '#4285F4', text: '#FFFFFF' },
};

export function CardView({ card, promos = [], links = [], appUrl }: CardViewProps) {
  const publicUrl = `${appUrl}/${card.slug}`;
  const theme = getTheme(card.theme_color || 'dark');
  const isLight = ['white', 'coral', 'icici', 'pearl', 'mint', 'lavender', 'sky', 'sand', 'rose', 'slate', 'cream', 'arctic', 'blush', 'ivory', 'silver'].includes(card.theme_color);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

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

  // Social links row
  const socialLinks = [
    card.linkedin && { key: 'linkedin', href: card.linkedin.startsWith('http') ? card.linkedin : `https://linkedin.com/in/${card.linkedin}`, label: 'LinkedIn', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
    card.instagram && { key: 'instagram', href: `https://instagram.com/${card.instagram.replace('@', '')}`, label: 'Instagram', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z"/></svg> },
    card.twitter && { key: 'twitter', href: `https://x.com/${card.twitter.replace('@', '')}`, label: 'X', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
    card.website && { key: 'website', href: card.website, label: 'Web', svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg> },
  ].filter(Boolean) as { key: string; href: string; label: string; svg: JSX.Element }[];

  // Action buttons
  const actionButtons = [
    { key: 'save', label: 'Save Contact', onClick: handleSaveContact, svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    card.whatsapp && { key: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/${card.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${card.full_name.split(' ')[0]}!`)}`, svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
    card.phone && { key: 'call', label: 'Call', href: `tel:${card.phone}`, svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
    card.email && { key: 'email', label: 'Email', href: `mailto:${card.email}`, svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
  ].filter(Boolean) as { key: string; label: string; onClick?: () => void; href?: string; svg: JSX.Element }[];

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
        {/* Company Logo */}
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

        {/* Bio */}
        {card.bio && (
          <div className="rounded-xl p-4 text-center text-sm" style={boxStyle}>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60">About Me</h4>
            <p className="opacity-80 leading-relaxed">{card.bio}</p>
          </div>
        )}

        {/* Action Buttons - 2x2 grid with brand colors */}
        <div className="grid grid-cols-2 gap-2">
          {actionButtons.map((btn) => {
            const brand = BRAND_COLORS[btn.key] || BRAND_COLORS.save;
            const cls = `flex flex-col items-center justify-center gap-1.5 rounded-xl p-3 text-center transition-transform hover:scale-[1.03] cursor-pointer`;
            const style = { background: brand.bg, color: brand.text };

            if (btn.href) {
              return (
                <a key={btn.key} href={btn.href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>
                  {btn.svg}
                  <span className="text-xs font-semibold">{btn.label}</span>
                </a>
              );
            }
            return (
              <button key={btn.key} onClick={btn.onClick} className={cls} style={style}>
                {btn.svg}
                <span className="text-xs font-semibold">{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Social Icons Row with brand colors */}
        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-3">
            {socialLinks.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{ background: BRAND_COLORS[s.key]?.bg || theme.accent, color: '#fff' }}
                title={s.label}
              >
                {s.svg}
              </a>
            ))}
          </div>
        )}

        {/* Gallery */}
        {card.gallery_images && card.gallery_images.length > 0 && (
          <div className="rounded-xl p-4" style={boxStyle}>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-60">Gallery</h4>
            <div className="grid grid-cols-2 gap-2">
              {(card.gallery_images as string[]).map((img, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => setLightboxImg(img)}>
                  <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product / Useful Links - box section */}
        {links.length > 0 && (
          <div className="rounded-xl p-4" style={boxStyle}>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-1 opacity-60">Products & Links</h4>
            <p className="text-xs opacity-40 mb-3">Explore our offerings</p>
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

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2"
            onClick={() => setLightboxImg(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img src={lightboxImg} alt="" className="max-w-full max-h-[90vh] rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
}
