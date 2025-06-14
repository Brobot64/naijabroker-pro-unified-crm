
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "Premier Insurance Group",
      text: "NaijaBroker Pro transformed our operations. We've increased efficiency by 300% and client satisfaction scores are at an all-time high.",
      rating: 5
    },
    {
      name: "Michael Adebayo", 
      company: "Lagos Insurance Brokers",
      text: "The compliance features alone saved us countless hours. The platform is intuitive and our team adopted it immediately.",
      rating: 5
    },
    {
      name: "Grace Okafor",
      company: "Shield Financial Services", 
      text: "Finally, a solution built specifically for Nigerian insurance brokers. The local compliance features are outstanding.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gray-50 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by Nigerian Insurance Professionals
          </h2>
          <p className="text-xl text-gray-600">
            See what industry leaders are saying about NaijaBroker Pro
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/90 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
