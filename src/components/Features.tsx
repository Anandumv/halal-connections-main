import { Shield, Users, MessageCircle, Globe } from 'lucide-react';

export default function Features() {
const features = [
  {
    icon: Shield,
      title: "Halal & Safe",
      description: "Built with Islamic values at the core, ensuring privacy, respect, and family involvement in the matchmaking process."
  },
  {
    icon: Users,
      title: "Verified Profiles",
      description: "All profiles are manually verified to ensure authenticity and create a trustworthy community for serious relationships."
  },
  {
    icon: MessageCircle,
      title: "Smart Matching",
      description: "Advanced algorithms help you find compatible partners based on faith, values, lifestyle, and personal preferences."
  },
  {
      icon: MessageCircle,
      title: "Secure Communication",
      description: "Private messaging system with family involvement options, ensuring respectful and halal communication."
  },
  {
    icon: Globe,
      title: "Global Community",
      description: "Connect with Muslims from around the world, expanding your search for the perfect match across cultures."
  }
];

  return (
    <section id="features" className="py-20 px-4 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 honeycomb-bg opacity-10"></div>
      
      <div className="container mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="gradient-text text-4xl md:text-5xl font-bold mb-6">
            Why Choose Bee Hive Match?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our platform is designed specifically for the Muslim community, 
            combining modern technology with traditional Islamic values.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
                key={index} 
              className="honeycomb-card p-8 hover:glow-border transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-8 h-8 text-black" />
                    </div>
              
              <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-amber-400 transition-colors">
                    {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}