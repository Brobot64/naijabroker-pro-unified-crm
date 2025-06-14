
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  FileText, 
  Users, 
  Settings, 
  Check, 
  Star,
  ArrowRight,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
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

  const pricingPlans = [
    {
      name: "Starter",
      price: "₦25,000",
      period: "/month",
      features: ["Up to 5 users", "Basic CRM", "Quote management", "Email support"],
      popular: false
    },
    {
      name: "Professional", 
      price: "₦65,000",
      period: "/month",
      features: ["Up to 20 users", "Advanced CRM", "Policy management", "Priority support", "Compliance tools"],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      features: ["Unlimited users", "Full feature access", "Custom integrations", "24/7 support", "Developer dashboard"],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">NaijaBroker Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/app" className="text-gray-700 hover:text-blue-600">Features</Link>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600">Pricing</a>
              <Link to="/app">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/app">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Complete Insurance Brokerage 
              <span className="text-blue-600"> Management System</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Streamline your insurance operations with our comprehensive CRM, policy management, 
              and compliance tools designed specifically for Nigerian insurance brokers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/app">
                <Button size="lg" className="text-lg px-8 py-3">
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Free 14-day trial • No credit card required • Setup in minutes
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
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
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
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

      {/* Developer Portal Callout */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white">
            <Settings className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Developer Portal</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Advanced configuration, API access, and system monitoring tools for technical teams. 
              Build custom integrations and manage multi-tenant deployments.
            </p>
            <Link to="/app">
              <Button variant="secondary" size="lg" className="text-lg px-8 py-3">
                Access Developer Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20">
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
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your brokerage size and needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/app">
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">NaijaBroker Pro</span>
              </div>
              <p className="text-gray-400 mb-4">
                Complete Insurance Brokerage Management System for Nigerian professionals.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+234 (0) 800 BROKER</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>hello@naijabroker.pro</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Lagos, Nigeria</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/app" className="hover:text-white">Features</Link></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><Link to="/app" className="hover:text-white">Developer Portal</Link></li>
                <li><a href="#" className="hover:text-white">API Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Training Videos</a></li>
                <li><a href="#" className="hover:text-white">Compliance Guide</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-400 mb-4">Stay updated with industry insights and platform updates.</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-md focus:outline-none focus:border-blue-500"
                />
                <Button className="rounded-l-none">Subscribe</Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2024 NaijaBroker Pro. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-white">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
