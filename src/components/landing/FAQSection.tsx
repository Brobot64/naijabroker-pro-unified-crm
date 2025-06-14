
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const FAQSection = () => {
  const faqs = [
    {
      question: "How quickly can I get started with NaijaBroker Pro?",
      answer: "You can get started immediately with our 14-day free trial. The onboarding process takes just a few minutes, and you'll have access to all features right away."
    },
    {
      question: "Is my data secure and compliant with Nigerian regulations?",
      answer: "Yes, we ensure full compliance with Nigerian data protection laws and insurance regulations. All data is encrypted and stored securely with regular backups."
    },
    {
      question: "Can I integrate with my existing systems?",
      answer: "Absolutely! Our platform offers robust API integrations and can connect with most existing CRM, accounting, and insurance systems commonly used in Nigeria."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We provide comprehensive support including onboarding assistance, training materials, email support, and priority phone support for Professional and Enterprise plans."
    },
    {
      question: "Can I customize the platform for my brokerage?",
      answer: "Yes! Our platform is highly customizable. You can add your branding, customize workflows, and use our developer dashboard for advanced configurations."
    },
    {
      question: "What happens if I need to cancel my subscription?",
      answer: "You can cancel anytime. We provide data export tools so you can take your information with you. No long-term contracts or cancellation fees."
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
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get answers to common questions about NaijaBroker Pro
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-lg shadow-sm border">
                <AccordionTrigger className="px-6 py-4 text-left font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FAQSection;
