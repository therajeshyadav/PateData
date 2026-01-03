import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { FileText, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
            <FileText className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
          <p className="text-sm text-muted-foreground mb-8">
            The snippet you're looking for doesn't exist or has expired.
          </p>
        </div>
        
        <div className="space-y-4">
          <a href="/">
            <Button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </a>
          <p className="text-sm text-muted-foreground">
            Create a new snippet or browse existing ones
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
