import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserPlus, MessageCircle, Heart } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "Create Your Profile",
      description: "Sign up and create a detailed profile with your preferences, photos, and personal information.",
      color: "from-amber-400 to-amber-600"
    },
    {
      icon: MessageCircle,
      title: "Connect Safely",
      description: "Start conversations with potential matches through our secure messaging system with family involvement.",
      color: "from-amber-500 to-amber-700"
    },
    {
      icon: Heart,
      title: "Build Your Future",
      description: "Take your relationship to the next level with family meetings and marriage planning support.",
      color: "from-amber-600 to-amber-800"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 honeycomb-bg opacity-10"></div>
      
      <div className="container mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="gradient-text text-4xl md:text-5xl font-bold mb-6">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your journey to finding your perfect match is simple and straightforward. 
            Follow these three easy steps to start your halal matrimonial journey.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step Number */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-black font-bold text-lg shadow-lg border-2 border-white/20">
                {index + 1}
              </div>
              
              {/* Step Card */}
              <div className="honeycomb-card p-6 h-full hover:glow-border transition-all duration-300 group">
                <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-8 h-8 text-black" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-amber-400 transition-colors">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>



        {/* CTA Section */}
        <div className="text-center">
          <div className="honeycomb-card p-12 max-w-4xl mx-auto">
            <h3 className="gradient-text text-3xl font-bold mb-6">
              Ready to Start Your Journey?
            </h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Create your free profile today and take the first step towards your happily ever after.
            </p>
            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="btn-primary text-lg px-8 py-4"
                asChild
              >
                <Link to="/auth">
                  Create Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">Trusted by families worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm">

            <div className="flex items-center gap-2 text-amber-400">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span>Verified Profiles Only</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span>Privacy Protected</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}