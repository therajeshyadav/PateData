import { PasteForm } from '@/components/PasteForm';
import { FileText } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container py-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-primary/80">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              CodeShare
            </h1>
          </div>
        </div>
      </header>

      <main className="container py-8 px-4">
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-4">
            Share code & text instantly
          </h2>
          <p className="text-muted-foreground text-lg">
            Create a snippet and get a shareable link. Set expiry time or view limits for secure sharing.
          </p>
        </div>

        <PasteForm />
      </main>

      <footer className="border-t border-border/50 mt-auto backdrop-blur-sm bg-background/80">
        <div className="container py-4">
          <p className="text-sm text-muted-foreground text-center">
            CodeShare - Share code & text snippets instantly
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
