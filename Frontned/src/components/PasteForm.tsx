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
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-foreground">
              Code/Text Content
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your text here..."
              className="min-h-[200px] font-mono text-sm resize-y bg-background/50 border-border/50 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ttl" className="text-sm font-medium text-foreground flex items-center gap-2">
                <div className="p-1 rounded bg-primary/10">
                  <Clock className="w-3 h-3 text-primary" />
                </div>
                TTL (seconds)
              </Label>
              <Input
                id="ttl"
                type="number"
                min="1"
                value={ttlSeconds}
                onChange={(e) => setTtlSeconds(e.target.value)}
                placeholder="Optional"
                className="bg-background/50 border-border/50 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="views" className="text-sm font-medium text-foreground flex items-center gap-2">
                <div className="p-1 rounded bg-primary/10">
                  <Eye className="w-3 h-3 text-primary" />
                </div>
                Max Views
              </Label>
              <Input
                id="views"
                type="number"
                min="1"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                placeholder="Optional"
                className="bg-background/50 border-border/50 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-destructive"></div>
                {error}
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover:scale-[1.02] transition-all duration-200" 
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Snippet'}
          </Button>
        </form>

        {result && (
          <div className="mt-6 p-4 rounded-lg bg-success/10 border border-success/20 animate-fade-in backdrop-blur-sm">
            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              Snippet created successfully!
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 rounded-md bg-background/50 border border-border/50 text-sm font-mono truncate">
                {result.url}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="shrink-0 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
              >
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
