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
  MapPin,
  TrendingUp,
  Zap,
  Globe
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
      {/* Floating Graphics */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-indigo-100 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-40 left-16 w-40 h-40 bg-blue-50 rounded-full opacity-25 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-indigo-50 rounded-full opacity-20 animate-bounce delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 relative z-10">
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
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Complete Insurance Brokerage 
                <span className="text-blue-600"> Management System</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Streamline your insurance operations with our comprehensive CRM, policy management, 
                and compliance tools designed specifically for Nigerian insurance brokers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
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
            
            {/* Hero Image with Dynamic Elements */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=400&fit=crop&crop=faces"
                  alt="Professional using NaijaBroker Pro"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
              </div>
              
              {/* Floating Stats Cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 animate-bounce">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-semibold">300% Efficiency</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3 animate-pulse">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-semibold">Real-time Updates</span>
                </div>
              </div>
              
              <div className="absolute top-1/2 -left-6 bg-white rounded-lg shadow-lg p-3 animate-bounce delay-300">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-indigo-500" />
                  <span className="text-sm font-semibold">Global Reach</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
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

      {/* Team Section with Professional Images */}
      <section className="py-20 bg-gray-50 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative overflow-hidden rounded-lg shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=400&fit=crop&crop=faces"
                    alt="Insurance professional"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 to-transparent"></div>
                </div>
                <div className="relative overflow-hidden rounded-lg shadow-lg transform -rotate-2 hover:rotate-0 transition-transform duration-300 mt-8">
                  <img 
                    src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=300&h=400&fit=crop&crop=faces"
                    alt="Business professional"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/30 to-transparent"></div>
                </div>
              </div>
              
              {/* Animated Background Elements */}
              <div className="absolute -z-10 top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-50 animate-ping"></div>
              <div className="absolute -z-10 bottom-10 right-10 w-16 h-16 bg-indigo-200 rounded-full opacity-40 animate-pulse"></div>
            </div>
            
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Built by Insurance Professionals, for Insurance Professionals
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our team understands the unique challenges of the Nigerian insurance market. 
                We've built NaijaBroker Pro from the ground up to address real-world problems 
                faced by brokers every day.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Check className="h-6 w-6 text-green-500" />
                  <span className="text-gray-700">20+ years combined industry experience</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-6 w-6 text-green-500" />
                  <span className="text-gray-700">Built for Nigerian regulatory compliance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-6 w-6 text-green-500" />
                  <span className="text-gray-700">Continuous updates based on user feedback</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Portal Callout */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-30 translate-y-30"></div>
            </div>
            
            <div className="relative z-10">
              <Settings className="h-16 w-16 mx-auto mb-6 animate-spin-slow" />
              <h2 className="text-3xl font-bold mb-4">Developer Portal</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                Advanced configuration, API access, and system monitoring tools for technical teams. 
                Build custom integrations and manage multi-tenant deployments.
              </p>
              <Link to="/app">
                <Button variant="secondary" size="lg" className="text-lg px-8 py-3 hover:scale-105 transition-transform">
                  Access Developer Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 relative z-10">
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
              <Card key={index} className={`relative transition-all duration-300 hover:scale-105 ${plan.popular ? 'border-blue-500 shadow-lg scale-105 bg-gradient-to-b from-blue-50 to-white' : 'bg-white/90 backdrop-blur'}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 animate-pulse">
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
                    <Button className="w-full hover:scale-105 transition-transform" variant={plan.popular ? "default" : "outline"}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Collaboration Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-blue-50 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Collaborate Seamlessly with Your Team
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Real-time collaboration tools that keep your entire brokerage team connected, 
                informed, and working efficiently towards common goals.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-blue-500" />
                  <span className="text-gray-700">Multi-user workspace with role-based access</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-blue-500" />
                  <span className="text-gray-700">Shared document management and templates</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-blue-500" />
                  <span className="text-gray-700">Secure client data sharing and compliance</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop&crop=center"
                  alt="Team collaboration in modern office"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-transparent"></div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -left-6 bg-white rounded-full p-4 shadow-lg animate-bounce">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-white rounded-full p-4 shadow-lg animate-pulse">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 relative z-10">
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
