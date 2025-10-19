import { Button } from "@/components/ui/button";
import { Heart, Menu, User, MessageCircle, Bell, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Link } from "react-router-dom";
import HoneycombLogo from "./HoneycombLogo";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-400/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-black/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <HoneycombLogo size="md" animated={true} />
            <div className="flex flex-col">
              <span className="text-xl font-bold gradient-text">
                BEE HIVE MATCH
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Muslim Matchmaking
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => scrollToSection('features')}
              className="text-muted-foreground hover:text-amber-400 transition-colors duration-200 font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-muted-foreground hover:text-amber-400 transition-colors duration-200 font-medium"
            >
              How It Works
            </button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {user ? (
              <Link to="/dashboard">
                <Button 
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:from-amber-500 hover:to-yellow-600 font-semibold"
                  size="sm"
                >
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button 
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:from-amber-500 hover:to-yellow-600 font-semibold"
                    size="sm"
                  >
                    Join Now
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-amber-400/20 py-4 space-y-4 animate-slide-up bg-background/95">
            <nav className="flex flex-col space-y-2 pt-4 border-t border-amber-400/20">
              <button
                onClick={() => scrollToSection('features')}
                className="text-left text-muted-foreground hover:text-amber-400 transition-colors duration-200 font-medium py-2 px-4 rounded-lg hover:bg-amber-400/10"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left text-muted-foreground hover:text-amber-400 transition-colors duration-200 font-medium py-2 px-4 rounded-lg hover:bg-amber-400/10"
              >
                How It Works
              </button>
            </nav>
            <div className="flex flex-col space-y-2 pt-4 border-t border-amber-400/20">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="justify-start w-full text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Button>
              {user ? (
                <Link to="/dashboard">
                  <Button 
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:from-amber-500 hover:to-yellow-600 font-semibold justify-start w-full"
                    size="sm"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start w-full text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button 
                      className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:from-amber-500 hover:to-yellow-600 font-semibold justify-start w-full"
                      size="sm"
                    >
                      Join Now
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;