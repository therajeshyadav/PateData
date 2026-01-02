import { useEffect, useState } from 'react';
import { getPaste, type PasteResponse, type PasteError } from '@/lib/pasteStore';
import { Copy, Check, Clock, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface PasteViewProps {
  id: string;
}

export function PasteView({ id }: PasteViewProps) {
  const [data, setData] = useState<PasteResponse | null>(null);
  const [error, setError] = useState<PasteError | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPaste = async () => {
      const result = await getPaste(id);
      
      if (result.success === true) {
        setData(result.data);
        setError(null);
      } else if (result.success === false) {
        setError(result.error);
        setData(null);
      }
      
      setLoading(false);
    };
    
    fetchPaste();
  }, [id]);

  const copyToClipboard = async () => {
    if (data?.content) {
      await navigator.clipboard.writeText(data.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatExpiry = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const date = new Date(expiresAt);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto animate-fade-in">
        <div className="p-8 rounded-md bg-card border border-border">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto animate-fade-in">
        <div className="p-8 rounded-md bg-card border border-destructive/20">
          <div className="flex items-center gap-3 text-destructive mb-4">
            <AlertCircle className="w-5 h-5" />
            <h2 className="text-lg font-medium">Paste Unavailable</h2>
          </div>
          <p className="text-muted-foreground mb-6">{error.error}</p>
          <Link to="/">
            <Button variant="outline">Create New Paste</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="rounded-md bg-card border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {data.remaining_views !== null && (
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {data.remaining_views} view{data.remaining_views !== 1 ? 's' : ''} remaining
              </span>
            )}
            {data.expires_at && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Expires: {formatExpiry(data.expires_at)}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <pre className="p-4 overflow-x-auto">
          <code className="font-mono text-sm text-foreground whitespace-pre-wrap break-words">
            {data.content}
          </code>
        </pre>
      </div>

      <div className="mt-6 text-center">
        <Link to="/">
          <Button variant="outline">Create New Paste</Button>
        </Link>
      </div>
    </div>
  );
}
