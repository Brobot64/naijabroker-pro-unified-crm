
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, BarChart3, FileText, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const InteractiveDemoSection = () => {
  const [activeDemo, setActiveDemo] = useState(0);

  const demos = [
    {
      title: "Quote Management",
      description: "See how easy it is to create and manage insurance quotes",
      icon: FileText,
      screenshot: "/lovable-uploads/8f916a73-5470-4ef3-b7e6-90ad79431433.png",
      features: ["Automated calculations", "Client management", "Quote templates", "Instant sharing"]
    },
    {
      title: "Dashboard Analytics",
      description: "Real-time insights into your brokerage performance",
      icon: BarChart3,
      screenshot: "/lovable-uploads/8f916a73-5470-4ef3-b7e6-90ad79431433.png",
      features: ["Revenue tracking", "Client analytics", "Performance metrics", "Custom reports"]
    },
    {
      title: "CRM Integration",
      description: "Manage all your client relationships in one place",
      icon: Users,
      screenshot: "/lovable-uploads/8f916a73-5470-4ef3-b7e6-90ad79431433.png",
      features: ["Contact management", "Communication history", "Lead tracking", "Automated follow-ups"]
    },
    {
      title: "Policy Management",
      description: "Complete policy lifecycle management",
      icon: Calendar,
      screenshot: "/lovable-uploads/8f916a73-5470-4ef3-b7e6-90ad79431433.png",
      features: ["Renewal alerts", "Policy tracking", "Claims management", "Compliance monitoring"]
    }
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="py-20 bg-gray-50 relative z-10"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            See NaijaBroker Pro in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our interactive demos to see how we can transform your insurance brokerage
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {demos.map((demo, index) => (
              <Card 
                key={index}
                className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                  activeDemo === index ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveDemo(index)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${activeDemo === index ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <demo.icon className={`h-5 w-5 ${activeDemo === index ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{demo.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{demo.description}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center relative">
                <img 
                  src={demos[activeDemo].screenshot}
                  alt={`${demos[activeDemo].title} Demo`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Play className="h-5 w-5 mr-2" />
                    Watch Demo
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{demos[activeDemo].title}</h3>
                <div className="flex flex-wrap gap-2">
                  {demos[activeDemo].features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default InteractiveDemoSection;
