
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Clock, Award } from "lucide-react";
import { motion } from "framer-motion";

const CaseStudiesSection = () => {
  const caseStudies = [
    {
      company: "Lagos Premier Insurance Brokers",
      industry: "Commercial Insurance",
      challenge: "Managing 500+ policies manually with spreadsheets",
      solution: "Implemented full NaijaBroker Pro suite with automated workflows",
      results: [
        { metric: "Processing Time", improvement: "75% reduction", icon: Clock },
        { metric: "Client Satisfaction", improvement: "95% rating", icon: Award },
        { metric: "Revenue Growth", improvement: "40% increase", icon: TrendingUp }
      ],
      testimonial: "NaijaBroker Pro transformed our operations completely. We've gone from chaos to complete control.",
      author: "Adebayo Ogundimu",
      position: "Managing Director"
    },
    {
      company: "Abuja Insurance Solutions",
      industry: "Personal & SME Insurance",
      challenge: "Poor client communication and missed renewals",
      solution: "Deployed CRM and automated renewal management system",
      results: [
        { metric: "Renewal Rate", improvement: "85% retention", icon: Users },
        { metric: "Response Time", improvement: "90% faster", icon: Clock },
        { metric: "New Clients", improvement: "60% growth", icon: TrendingUp }
      ],
      testimonial: "Our clients now receive timely updates and we never miss a renewal. It's been a game-changer.",
      author: "Fatima Abdullahi",
      position: "Operations Manager"
    }
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="py-20 relative z-10"
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
            Success Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how Nigerian insurance brokers are transforming their businesses with NaijaBroker Pro
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {caseStudies.map((study, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <CardTitle className="text-xl text-blue-600">{study.company}</CardTitle>
                      <Badge variant="secondary" className="mt-2">{study.industry}</Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Challenge:</h4>
                      <p className="text-gray-600">{study.challenge}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Solution:</h4>
                      <p className="text-gray-600">{study.solution}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Results:</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {study.results.map((result, resultIndex) => (
                          <div key={resultIndex} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                            <result.icon className="h-5 w-5 text-green-600" />
                            <div>
                              <div className="font-medium text-gray-900">{result.metric}</div>
                              <div className="text-green-600 font-semibold">{result.improvement}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t pt-6">
                      <blockquote className="text-gray-700 italic mb-4">
                        "{study.testimonial}"
                      </blockquote>
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900">{study.author}</div>
                        <div className="text-gray-600">{study.position}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default CaseStudiesSection;
