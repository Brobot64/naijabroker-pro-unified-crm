
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, Users, Settings } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: FileText,
      title: "Quote Management",
      description: "Streamline your insurance quoting process with automated calculations and client management."
    },
    {
      icon: Shield,
      title: "Policy Management",
      description: "Comprehensive policy tracking, renewals, and compliance management in one platform."
    },
    {
      icon: Users,
      title: "CRM Integration",
      description: "Built-in customer relationship management with lead tracking and conversion analytics."
    },
    {
      icon: Settings,
      title: "Developer Dashboard",
      description: "Full control panel for system configuration, monitoring, and customization."
    }
  ];

  return (
    <section className="py-20 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need to run your brokerage
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From lead generation to policy management, we've got every aspect of your insurance business covered.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
