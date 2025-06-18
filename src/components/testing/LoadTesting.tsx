
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PolicyService } from "@/services/database/policyService";
import { QuoteService } from "@/services/database/quoteService";
import { useAuth } from "@/contexts/AuthContext";

interface LoadTestResult {
  operation: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageTime: number;
  maxTime: number;
  minTime: number;
  requestsPerSecond: number;
}

export const LoadTesting = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<LoadTestResult[]>([]);
  const [config, setConfig] = useState({
    concurrentUsers: 10,
    requestsPerUser: 5,
    delayBetweenRequests: 100
  });
  const { toast } = useToast();
  const { user, organizationId } = useAuth();

  const runLoadTest = async () => {
    if (!user || !organizationId) {
      toast({
        title: "Authentication Required",
        description: "Please ensure you're logged in to run load tests",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setResults([]);

    try {
      // Test Policy Creation Load
      const policyResults = await testPolicyCreationLoad();
      setResults(prev => [...prev, policyResults]);

      // Test Quote Creation Load
      const quoteResults = await testQuoteCreationLoad();
      setResults(prev => [...prev, quoteResults]);

      // Test Read Operations Load
      const readResults = await testReadOperationsLoad();
      setResults(prev => [...prev, readResults]);

      toast({
        title: "Load Tests Completed",
        description: "All load tests have finished successfully",
      });
    } catch (error) {
      toast({
        title: "Load Test Failed",
        description: error instanceof Error ? error.message : "Load test failed",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const testPolicyCreationLoad = async (): Promise<LoadTestResult> => {
    const startTime = Date.now();
    const times: number[] = [];
    let successCount = 0;
    let failCount = 0;

    const promises = Array.from({ length: config.concurrentUsers }, async (_, userIndex) => {
      for (let i = 0; i < config.requestsPerUser; i++) {
        const requestStart = Date.now();
        try {
          await PolicyService.create({
            organization_id: organizationId!,
            policy_number: `LOAD-POL-${userIndex}-${i}-${Date.now()}`,
            client_name: `Load Test Client ${userIndex}-${i}`,
            underwriter: 'Load Test Underwriter',
            policy_type: 'Motor',
            sum_insured: 100000,
            premium: 5000,
            commission_rate: 10,
            commission_amount: 500,
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            created_by: user!.id
          });
          successCount++;
        } catch (error) {
          failCount++;
        }
        
        const requestTime = Date.now() - requestStart;
        times.push(requestTime);
        
        if (config.delayBetweenRequests > 0) {
          await new Promise(resolve => setTimeout(resolve, config.delayBetweenRequests));
        }
      }
    });

    await Promise.all(promises);
    
    const totalTime = Date.now() - startTime;
    const totalRequests = config.concurrentUsers * config.requestsPerUser;
    
    return {
      operation: 'Policy Creation',
      totalRequests,
      successfulRequests: successCount,
      failedRequests: failCount,
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      maxTime: Math.max(...times),
      minTime: Math.min(...times),
      requestsPerSecond: (totalRequests / totalTime) * 1000
    };
  };

  const testQuoteCreationLoad = async (): Promise<LoadTestResult> => {
    const startTime = Date.now();
    const times: number[] = [];
    let successCount = 0;
    let failCount = 0;

    const promises = Array.from({ length: config.concurrentUsers }, async (_, userIndex) => {
      for (let i = 0; i < config.requestsPerUser; i++) {
        const requestStart = Date.now();
        try {
          await QuoteService.create({
            organization_id: organizationId!,
            quote_number: `LOAD-QTE-${userIndex}-${i}-${Date.now()}`,
            client_name: `Load Test Quote Client ${userIndex}-${i}`,
            underwriter: 'Load Test Underwriter',
            policy_type: 'Fire',
            sum_insured: 50000,
            premium: 2500,
            commission_rate: 8,
            valid_until: '2024-12-31',
            created_by: user!.id
          });
          successCount++;
        } catch (error) {
          failCount++;
        }
        
        const requestTime = Date.now() - requestStart;
        times.push(requestTime);
        
        if (config.delayBetweenRequests > 0) {
          await new Promise(resolve => setTimeout(resolve, config.delayBetweenRequests));
        }
      }
    });

    await Promise.all(promises);
    
    const totalTime = Date.now() - startTime;
    const totalRequests = config.concurrentUsers * config.requestsPerUser;
    
    return {
      operation: 'Quote Creation',
      totalRequests,
      successfulRequests: successCount,
      failedRequests: failCount,
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      maxTime: Math.max(...times),
      minTime: Math.min(...times),
      requestsPerSecond: (totalRequests / totalTime) * 1000
    };
  };

  const testReadOperationsLoad = async (): Promise<LoadTestResult> => {
    const startTime = Date.now();
    const times: number[] = [];
    let successCount = 0;
    let failCount = 0;

    const promises = Array.from({ length: config.concurrentUsers }, async () => {
      for (let i = 0; i < config.requestsPerUser; i++) {
        const requestStart = Date.now();
        try {
          await Promise.all([
            PolicyService.getAll(),
            QuoteService.getAll()
          ]);
          successCount++;
        } catch (error) {
          failCount++;
        }
        
        const requestTime = Date.now() - requestStart;
        times.push(requestTime);
        
        if (config.delayBetweenRequests > 0) {
          await new Promise(resolve => setTimeout(resolve, config.delayBetweenRequests));
        }
      }
    });

    await Promise.all(promises);
    
    const totalTime = Date.now() - startTime;
    const totalRequests = config.concurrentUsers * config.requestsPerUser;
    
    return {
      operation: 'Read Operations',
      totalRequests,
      successfulRequests: successCount,
      failedRequests: failCount,
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      maxTime: Math.max(...times),
      minTime: Math.min(...times),
      requestsPerSecond: (totalRequests / totalTime) * 1000
    };
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Load Testing Suite</CardTitle>
        <p className="text-sm text-gray-600">
          Test system performance under various load conditions
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="concurrentUsers">Concurrent Users</Label>
            <Input
              id="concurrentUsers"
              type="number"
              value={config.concurrentUsers}
              onChange={(e) => setConfig({...config, concurrentUsers: parseInt(e.target.value) || 1})}
              min="1"
              max="50"
            />
          </div>
          <div>
            <Label htmlFor="requestsPerUser">Requests per User</Label>
            <Input
              id="requestsPerUser"
              type="number"
              value={config.requestsPerUser}
              onChange={(e) => setConfig({...config, requestsPerUser: parseInt(e.target.value) || 1})}
              min="1"
              max="20"
            />
          </div>
          <div>
            <Label htmlFor="delayBetweenRequests">Delay Between Requests (ms)</Label>
            <Input
              id="delayBetweenRequests"
              type="number"
              value={config.delayBetweenRequests}
              onChange={(e) => setConfig({...config, delayBetweenRequests: parseInt(e.target.value) || 0})}
              min="0"
              max="5000"
            />
          </div>
        </div>

        <Button 
          onClick={runLoadTest} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Running Load Tests...' : 'Start Load Testing'}
        </Button>

        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Load Test Results</h3>
            {results.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{result.operation}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-semibold">Total Requests</div>
                      <div>{result.totalRequests}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Success Rate</div>
                      <div className="text-green-600">
                        {((result.successfulRequests / result.totalRequests) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold">Avg Response Time</div>
                      <div>{result.averageTime.toFixed(0)}ms</div>
                    </div>
                    <div>
                      <div className="font-semibold">Requests/Second</div>
                      <div>{result.requestsPerSecond.toFixed(2)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
