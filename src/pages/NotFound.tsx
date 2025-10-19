import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Heart, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen animated-bg honeycomb-bg flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-black" />
          </div>
          <h1 className="gradient-text text-6xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist. Let's get you back to finding your perfect match!
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="btn-primary w-full">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="btn-outline w-full">
            <Link to="/auth">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Auth
            </Link>
          </Button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-amber-400/20">
          <p className="text-muted-foreground text-sm">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
