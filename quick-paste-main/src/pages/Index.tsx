import { PasteForm } from '@/components/PasteForm';
import { FileText } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container py-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-foreground" />
            <h1 className="text-lg font-semibold text-foreground">Pastebin Lite</h1>
          </div>
        </div>
      </header>

      <main className="container py-8 px-4">
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Share text snippets
          </h2>
          <p className="text-muted-foreground">
            Create a paste and get a shareable link. Optionally set an expiry time or view limit.
          </p>
        </div>

        <PasteForm />
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

export default Index;
