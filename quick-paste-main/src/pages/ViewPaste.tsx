import { useParams, Link } from 'react-router-dom';
import { PasteView } from '@/components/PasteView';
import { FileText } from 'lucide-react';

const ViewPaste = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Invalid paste ID</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container py-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <FileText className="w-5 h-5 text-foreground" />
            <h1 className="text-lg font-semibold text-foreground">Pastebin Lite</h1>
          </Link>
        </div>
      </header>

      <main className="container py-8 px-4">
        <PasteView id={id} />
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="container py-4">
          <p className="text-sm text-muted-foreground text-center">
            Pastebin Lite - Share text snippets easily
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ViewPaste;
