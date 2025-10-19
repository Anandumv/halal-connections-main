import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Users, Star, MessageCircle, Heart, CheckCircle } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 honeycomb-bg opacity-10"></div>
      
      {/* Solid Black Background */}
      <div className="absolute inset-0 bg-background"></div>
      
      <div className="relative container mx-auto text-center">
        {/* Main Heading */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">FIND YOUR RIGHTEOUS</span>
            <br />
            <span className="text-foreground">PARTNER</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            A trusted Muslim matchmaking platform designed to help you find a compatible spouse who shares your values, faith, and life goals.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            size="lg" 
            className="btn-primary text-lg px-8 py-4"
            asChild
          >
            <Link to="/auth">
              REGISTER
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="btn-outline text-lg px-8 py-4"
            asChild
          >
            <Link to="/auth">
              Sign In
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto mt-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-black" />
            </div>
            <div className="gradient-text text-3xl font-bold mb-2">100%</div>
            <p className="text-muted-foreground">Halal & Safe</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-black" />
            </div>
            <div className="gradient-text text-3xl font-bold mb-2">4.9★</div>
            <p className="text-muted-foreground">User Rating</p>
          </div>
        </div>


      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 border border-amber-400/20 rounded-full"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 border border-amber-400/10 rounded-full"></div>
      <div className="absolute top-1/2 left-5 w-3 h-3 bg-amber-400 rounded-full opacity-60"></div>
      <div className="absolute top-1/3 right-8 w-2 h-2 bg-amber-400 rounded-full opacity-40"></div>
    </section>
  );
}