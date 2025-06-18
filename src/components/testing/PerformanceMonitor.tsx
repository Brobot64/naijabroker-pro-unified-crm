
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  threshold: number;
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const measureDatabasePerformance = async () => {
    const results: PerformanceMetric[] = [];

    // Measure connection time
    const connectionStart = performance.now();
    try {
      const response = await fetch('/api/health-check');
      const connectionTime = performance.now() - connectionStart;
      results.push({
        name: 'Database Connection',
        value: Math.round(connectionTime),
        unit: 'ms',
        status: connectionTime < 100 ? 'good' : connectionTime < 500 ? 'warning' : 'critical',
        threshold: 100
      });
    } catch (error) {
      results.push({
        name: 'Database Connection',
        value: -1,
        unit: 'ms',
        status: 'critical',
        threshold: 100
      });
    }

    // Measure memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      results.push({
        name: 'Memory Usage',
        value: memoryUsage,
        unit: 'MB',
        status: memoryUsage < 50 ? 'good' : memoryUsage < 100 ? 'warning' : 'critical',
        threshold: 50
      });
    }

    // Measure render performance
    const renderStart = performance.now();
    await new Promise(resolve => setTimeout(resolve, 0)); // Force re-render
    const renderTime = performance.now() - renderStart;
    results.push({
      name: 'Render Performance',
      value: Math.round(renderTime * 1000) / 1000,
      unit: 'ms',
      status: renderTime < 16 ? 'good' : renderTime < 33 ? 'warning' : 'critical',
      threshold: 16
    });

    // Measure bundle size (estimated)
    const scripts = Array.from(document.scripts);
    const totalSize = scripts.reduce((sum, script) => {
      return sum + (script.src ? 1000 : script.innerHTML.length); // Rough estimate
    }, 0);
    const bundleSize = Math.round(totalSize / 1024);
    results.push({
      name: 'Bundle Size',
      value: bundleSize,
      unit: 'KB',
      status: bundleSize < 500 ? 'good' : bundleSize < 1000 ? 'warning' : 'critical',
      threshold: 500
    });

    setMetrics(results);
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    measureDatabasePerformance();
    
    const interval = setInterval(() => {
      measureDatabasePerformance();
    }, 5000);

    return () => clearInterval(interval);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  const getStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good': return '🟢';
      case 'warning': return '🟡';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (isMonitoring) {
      cleanup = startMonitoring();
    }

    return cleanup;
  }, [isMonitoring]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Performance Monitor</CardTitle>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Real-time performance metrics and system health
          </p>
          <Button 
            onClick={isMonitoring ? stopMonitoring : () => setIsMonitoring(true)}
            variant={isMonitoring ? "destructive" : "default"}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <Card key={metric.name} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{metric.name}</h4>
                <span className="text-lg">{getStatusIcon(metric.status)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold">
                    {metric.value === -1 ? 'Error' : metric.value}
                  </span>
                  {metric.value !== -1 && (
                    <span className="text-sm text-gray-500 ml-1">
                      {metric.unit}
                    </span>
                  )}
                </div>
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status}
                </Badge>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Threshold: {metric.threshold} {metric.unit}
              </div>
            </Card>
          ))}
        </div>
        
        {metrics.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Start monitoring to see performance metrics
          </div>
        )}
      </CardContent>
    </Card>
  );
};
