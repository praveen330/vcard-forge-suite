import { useState } from 'react';
import { CardLink } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2, GripVertical, ExternalLink, Loader2 } from 'lucide-react';

interface LinksManagerProps {
  cardId: string;
  links: CardLink[];
  onUpdate: (links: CardLink[]) => void;
}

export function LinksManager({ cardId, links, onUpdate }: LinksManagerProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [adding, setAdding] = useState(false);

  const addLink = async () => {
    if (!newTitle.trim() || !newUrl.trim()) {
      toast.error('Title and URL are required');
      return;
    }
    const url = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
    setAdding(true);
    try {
      const { data, error } = await supabase
        .from('card_links')
        .insert({ card_id: cardId, title: newTitle.trim(), url, sort_order: links.length })
        .select()
        .single();
      if (error) throw error;
      onUpdate([...links, data as unknown as CardLink]);
      setNewTitle('');
      setNewUrl('');
      toast.success('Link added!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add link');
    } finally {
      setAdding(false);
    }
  };

  const removeLink = async (id: string) => {
    try {
      const { error } = await supabase.from('card_links').delete().eq('id', id);
      if (error) throw error;
      onUpdate(links.filter(l => l.id !== id));
      toast.success('Link removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove link');
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Product / Useful Links</Label>

      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((link) => (
            <div key={link.id} className="flex items-center gap-2 bg-card rounded-lg p-2 border border-border">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{link.title}</p>
                <p className="text-xs text-muted-foreground truncate">{link.url}</p>
              </div>
              <a href={link.url} target="_blank" rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button onClick={() => removeLink(link.id)}
                className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Link title (e.g. Product Guide)"
          className="bg-card"
        />
        <Input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="https://example.com/page"
          className="bg-card"
        />
        <Button variant="outline" size="default" onClick={addLink} disabled={adding}>
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
