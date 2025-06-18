
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PolicyService } from "@/services/database/policyService";
import { QuoteService } from "@/services/database/quoteService";
import { ClaimService } from "@/services/database/claimService";
import { useAuth } from "@/contexts/AuthContext";

interface TestResult {
  name: string;
  status: 'pending' | 'passed' | 'failed';
  message: string;
  duration?: number;
}

export const IntegrationTests = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();
  const { user, organizationId } = useAuth();

  const updateTest = (name: string, status: TestResult['status'], message: string, duration?: number) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, status, message, duration } : test
    ));
  };

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    const startTime = Date.now();
    updateTest(testName, 'pending', 'Running...');
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      updateTest(testName, 'passed', 'Integration test passed', duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTest(testName, 'failed', error instanceof Error ? error.message : 'Test failed', duration);
    }
  };

  const runIntegrationTests = async () => {
    if (!user || !organizationId) {
      toast({
        title: "Authentication Required",
        description: "Please ensure you're logged in to run tests",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    
    const testList = [
      'Quote to Policy Conversion',
      'Policy to Claim Creation',
      'End-to-End Workflow',
      'Cross-Component Data Consistency',
      'User Permissions Integration'
    ];

    setTests(testList.map(name => ({
      name,
      status: 'pending' as const,
      message: 'Waiting to run...'
    })));

    // Test Quote to Policy Conversion
    await runTest('Quote to Policy Conversion', async () => {
      const testQuote = {
        organization_id: organizationId,
        quote_number: `INT-QTE-${Date.now()}`,
        client_name: 'Integration Test Client',
        underwriter: 'Test Underwriter',
        policy_type: 'Motor',
        sum_insured: 100000,
        premium: 5000,
        commission_rate: 10,
        valid_until: '2024-12-31',
        created_by: user.id
      };

      const quote = await QuoteService.create(testQuote);
      
      const policyData = {
        organization_id: organizationId,
        policy_number: `INT-POL-${Date.now()}`,
        client_name: quote.client_name,
        underwriter: quote.underwriter,
        policy_type: quote.policy_type,
        sum_insured: quote.sum_insured,
        premium: quote.premium,
        commission_rate: quote.commission_rate,
        commission_amount: (quote.premium * quote.commission_rate) / 100,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        created_by: user.id
      };

      const policy = await PolicyService.create(policyData);
      await QuoteService.convertToPolicy(quote.id, policy.id);
      
      const updatedQuote = await QuoteService.getById(quote.id);
      if (updatedQuote?.status !== 'accepted' || updatedQuote?.converted_to_policy !== policy.id) {
        throw new Error('Quote conversion failed');
      }
    });

    // Test Policy to Claim Creation
    await runTest('Policy to Claim Creation', async () => {
      const policies = await PolicyService.getAll();
      if (policies.length === 0) {
        throw new Error('No policies available for claim testing');
      }

      const policy = policies[0];
      const testClaim = {
        organization_id: organizationId,
        policy_id: policy.id,
        claim_number: `INT-CLM-${Date.now()}`,
        policy_number: policy.policy_number,
        client_name: policy.client_name,
        claim_type: 'Integration Test',
        incident_date: '2024-06-01',
        estimated_loss: 25000,
        created_by: user.id
      };

      const claim = await ClaimService.create(testClaim);
      if (!claim.id || claim.policy_id !== policy.id) {
        throw new Error('Claim creation integration failed');
      }
    });

    // Additional integration tests would go here...

    setIsRunning(false);
    
    const passedTests = tests.filter(t => t.status === 'passed').length;
    const totalTests = tests.length;
    
    toast({
      title: "Integration Tests Completed",
      description: `${passedTests}/${totalTests} tests passed`,
      variant: passedTests === totalTests ? "default" : "destructive"
    });
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      default: return '⏸️';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Integration Testing Suite</CardTitle>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Tests integration between different components and workflows
          </p>
          <Button 
            onClick={runIntegrationTests} 
            disabled={isRunning}
            className="ml-4"
          >
            {isRunning ? 'Running Tests...' : 'Run Integration Tests'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tests.map((test) => (
            <div 
              key={test.name}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getStatusIcon(test.status)}</span>
                <div>
                  <h4 className="font-medium">{test.name}</h4>
                  <p className={`text-sm ${getStatusColor(test.status)}`}>
                    {test.message}
                  </p>
                </div>
              </div>
              {test.duration && (
                <span className="text-xs text-gray-500">
                  {test.duration}ms
                </span>
              )}
            </div>
          ))}
        </div>
        
        {tests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Click "Run Integration Tests" to start testing component integration
          </div>
        )}
      </CardContent>
    </Card>
  );
};
