import { useParams, Link } from 'react-router-dom';
import { PasteView } from '@/components/PasteView';
import { FileText } from 'lucide-react';

const ViewPaste = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center">
        <p className="text-muted-foreground">Invalid paste ID</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container py-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-all duration-200 hover:scale-105">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-primary/80">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              CodeShare
            </h1>
          </Link>
        </div>
      </header>

      <main className="container py-8 px-4">
        <PasteView id={id} />
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

export default ViewPaste;
