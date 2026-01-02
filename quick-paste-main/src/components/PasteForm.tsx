import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPaste } from '@/lib/pasteStore';
import { Copy, Check, Clock, Eye } from 'lucide-react';

export function PasteForm() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [result, setResult] = useState<{ id: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    const ttl = ttlSeconds ? parseInt(ttlSeconds, 10) : undefined;
    const views = maxViews ? parseInt(maxViews, 10) : undefined;

    if (ttlSeconds && (isNaN(ttl!) || ttl! < 1)) {
      setError('TTL must be a positive integer');
      return;
    }

    if (maxViews && (isNaN(views!) || views! < 1)) {
      setError('Max views must be a positive integer');
      return;
    }

    setLoading(true);
    try {
      const res = await createPaste(content, ttl, views);
      setResult(res);
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create paste');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (result?.url) {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="content" className="text-sm font-medium text-foreground">
            Paste Content
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your text here..."
            className="min-h-[200px] font-mono text-sm resize-y bg-card border-border focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ttl" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              TTL (seconds)
            </Label>
            <Input
              id="ttl"
              type="number"
              min="1"
              value={ttlSeconds}
              onChange={(e) => setTtlSeconds(e.target.value)}
              placeholder="Optional"
              className="bg-card border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="views" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              Max Views
            </Label>
            <Input
              id="views"
              type="number"
              min="1"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              placeholder="Optional"
              className="bg-card border-border"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create Paste'}
        </Button>
      </form>

      {result && (
        <div className="mt-6 p-4 rounded-md bg-success/10 border border-success/20 animate-fade-in">
          <p className="text-sm font-medium text-foreground mb-2">Paste created successfully!</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded bg-card border border-border text-sm font-mono truncate">
              {result.url}
            </code>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
