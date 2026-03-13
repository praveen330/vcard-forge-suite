import { Card } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MessageCircle, Smartphone, Globe, Linkedin, Instagram, Twitter } from 'lucide-react';

interface WalletButtonsProps {
  card: Card;
  appUrl: string;
}

function generateVCard(card: Card, publicUrl: string): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${card.full_name}`,
  ];
  if (card.company) lines.push(`ORG:${card.company}`);
  if (card.job_title) lines.push(`TITLE:${card.job_title}`);
  if (card.email) lines.push(`EMAIL:${card.email}`);
  if (card.phone) lines.push(`TEL:${card.phone}`);
  if (card.website) lines.push(`URL:${card.website}`);
  if (card.linkedin) lines.push(`X-SOCIALPROFILE;type=linkedin:${card.linkedin}`);
  if (card.avatar_url) lines.push(`PHOTO;VALUE=uri:${card.avatar_url}`);
  lines.push(`NOTE:Digital card: ${publicUrl}`);
  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function CardActionButtons({ card, appUrl }: WalletButtonsProps) {
  const publicUrl = `${appUrl}/${card.slug}`;

  const handleSaveContact = () => {
    const vcf = generateVCard(card, publicUrl);
    const blob = new Blob([vcf], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${card.slug}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const firstName = card.full_name.split(' ')[0];

  return (
    <div className="flex flex-col gap-3 w-full">
      <Button variant="gold" size="full" onClick={handleSaveContact}>
        <Smartphone className="mr-2 h-5 w-5" />
        Save Contact
      </Button>

      {card.whatsapp && (
        <Button variant="whatsapp" size="full" asChild>
          <a href={`https://wa.me/${card.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${firstName}!`)}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-5 w-5" />
            WhatsApp
          </a>
        </Button>
      )}

      {card.phone && (
        <Button variant="surface" size="full" asChild>
          <a href={`tel:${card.phone}`}>
            <Phone className="mr-2 h-5 w-5" />
            Call
          </a>
        </Button>
      )}

      {card.email && (
        <Button variant="surface" size="full" asChild>
          <a href={`mailto:${card.email}`}>
            <Mail className="mr-2 h-5 w-5" />
            Email
          </a>
        </Button>
      )}

      <div className="flex flex-wrap gap-2 justify-center pt-2">
        {card.linkedin && (
          <Button variant="outline" size="sm" asChild>
            <a href={card.linkedin.startsWith('http') ? card.linkedin : `https://linkedin.com/in/${card.linkedin}`} target="_blank" rel="noopener noreferrer">
              <Linkedin className="mr-1 h-4 w-4" /> LinkedIn
            </a>
          </Button>
        )}
        {card.website && (
          <Button variant="outline" size="sm" asChild>
            <a href={card.website} target="_blank" rel="noopener noreferrer">
              <Globe className="mr-1 h-4 w-4" /> Website
            </a>
          </Button>
        )}
        {card.instagram && (
          <Button variant="outline" size="sm" asChild>
            <a href={`https://instagram.com/${card.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
              <Instagram className="mr-1 h-4 w-4" /> Instagram
            </a>
          </Button>
        )}
        {card.twitter && (
          <Button variant="outline" size="sm" asChild>
            <a href={`https://x.com/${card.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
              <Twitter className="mr-1 h-4 w-4" /> Twitter
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
