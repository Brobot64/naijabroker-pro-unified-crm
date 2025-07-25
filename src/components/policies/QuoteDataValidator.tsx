import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  underwriter: string;
  policy_type: string;
  sum_insured: number;
  premium: number;
  commission_rate: number;
  final_contract_url?: string;
  workflow_stage: string;
}

interface QuoteDataValidatorProps {
  quote: Quote | null;
  onValidationResult: (isValid: boolean, errors: string[]) => void;
}

export const QuoteDataValidator = ({ quote, onValidationResult }: QuoteDataValidatorProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!quote) {
      onValidationResult(false, ["No quote selected"]);
      return;
    }

    const errors: string[] = [];

    // Validate premium
    if (!quote.premium || quote.premium <= 0) {
      errors.push("Premium must be greater than ₦0");
    }

    // Validate sum insured
    if (!quote.sum_insured || quote.sum_insured <= 0) {
      errors.push("Sum Insured must be greater than ₦0");
    }

    // Validate underwriter
    if (!quote.underwriter || quote.underwriter === 'TBD') {
      errors.push("Underwriter information is missing or incomplete");
    }

    // Validate client name
    if (!quote.client_name || quote.client_name.trim() === '') {
      errors.push("Client name is required");
    }

    // Validate policy type
    if (!quote.policy_type || quote.policy_type.trim() === '') {
      errors.push("Policy type is required");
    }

    // Validate final contract
    if (!quote.final_contract_url) {
      errors.push("Final contract document is missing");
    }

    // Validate workflow stage
    if (quote.workflow_stage !== 'completed') {
      errors.push("Quote workflow must be completed");
    }

    const isValid = errors.length === 0;
    onValidationResult(isValid, errors);

    if (!isValid) {
      console.warn(`Quote validation failed for ${quote.quote_number}:`, errors);
    }
  }, [quote, onValidationResult]);

  if (!quote) return null;

  const getValidationStatus = () => {
    const errors: string[] = [];
    
    if (!quote.premium || quote.premium <= 0) errors.push("Invalid premium");
    if (!quote.sum_insured || quote.sum_insured <= 0) errors.push("Invalid sum insured");
    if (!quote.underwriter || quote.underwriter === 'TBD') errors.push("Missing underwriter");
    if (!quote.final_contract_url) errors.push("Missing contract");
    if (quote.workflow_stage !== 'completed') errors.push("Incomplete workflow");

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const { isValid, errors } = getValidationStatus();

  return (
    <Card className={`border-2 ${isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-2">
          {isValid ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <span className={`font-medium ${isValid ? 'text-green-700' : 'text-red-700'}`}>
            Quote Data Validation
          </span>
        </div>
        
        {isValid ? (
          <p className="text-sm text-green-600">
            All quote data is valid and ready for policy conversion.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-red-600 font-medium">
              The following issues must be resolved:
            </p>
            <ul className="text-sm text-red-600 space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};