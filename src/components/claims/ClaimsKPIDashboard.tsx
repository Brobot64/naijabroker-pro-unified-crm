import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClaimWorkflowService } from "@/services/database/claimWorkflowService";
import { ClaimService } from "@/services/database/claimService";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Timer,
  Users,
  TrendingUp,
  Activity
} from "lucide-react";

interface ClaimsKPIData {
  idleClaims: number;
  slaBreaches: number;
  pendingApproval: number;
  avgProcessingTime: number;
  claimsRatio: number;
  totalClaims: number;
  settledAmount: number;
  rejectionRate: number;
}

export const ClaimsKPIDashboard = () => {
  const [kpiData, setKpiData] = useState<ClaimsKPIData>({
    idleClaims: 0,
    slaBreaches: 0,
    pendingApproval: 0,
    avgProcessingTime: 0,
    claimsRatio: 0,
    totalClaims: 0,
    settledAmount: 0,
    rejectionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadKPIData = async () => {
    try {
      setLoading(true);
      
      // Get actionable insights
      const insights = await ClaimWorkflowService.getActionableInsights();
      
      // Get all claims for calculations
      const allClaims = await ClaimService.getAll();
      
      // Calculate KPIs
      const totalClaims = allClaims.length;
      const settledClaims = allClaims.filter(claim => claim.status === 'settled');
      const rejectedClaims = allClaims.filter(claim => claim.status === 'rejected');
      
      const settledAmount = settledClaims.reduce((sum, claim) => 
        sum + Number(claim.settlement_amount || 0), 0
      );
      
      const rejectionRate = totalClaims > 0 ? (rejectedClaims.length / totalClaims) * 100 : 0;
      
      // Calculate average processing time (for settled/rejected claims)
      const completedClaims = allClaims.filter(claim => 
        ['settled', 'rejected', 'closed'].includes(claim.status)
      );
      
      const avgProcessingTime = completedClaims.length > 0 
        ? completedClaims.reduce((sum, claim) => {
            const created = new Date(claim.created_at!);
            const updated = new Date(claim.updated_at!);
            return sum + (updated.getTime() - created.getTime());
          }, 0) / completedClaims.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      // Calculate claims ratio (settled amount vs estimated loss)
      const totalEstimatedLoss = allClaims.reduce((sum, claim) => 
        sum + Number(claim.estimated_loss || 0), 0
      );
      const claimsRatio = totalEstimatedLoss > 0 
        ? (settledAmount / totalEstimatedLoss) * 100 
        : 0;

      setKpiData({
        idleClaims: insights.idleClaims.length,
        slaBreaches: insights.slaBreaches.length,
        pendingApproval: insights.pendingApproval.length,
        avgProcessingTime: Math.round(avgProcessingTime * 10) / 10,
        claimsRatio: Math.round(claimsRatio * 10) / 10,
        totalClaims,
        settledAmount,
        rejectionRate: Math.round(rejectionRate * 10) / 10
      });
      
    } catch (error) {
      console.error('Failed to load KPI data:', error);
      toast({
        title: "Error",
        description: "Failed to load claims KPI data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKPIData();
  }, []);

  const getInsightColor = (type: 'idle' | 'sla' | 'approval', count: number) => {
    if (count === 0) return "text-green-600 bg-green-50";
    switch (type) {
      case 'idle':
        return count > 10 ? "text-red-600 bg-red-50" : "text-yellow-600 bg-yellow-50";
      case 'sla':
        return count > 5 ? "text-red-600 bg-red-50" : "text-orange-600 bg-orange-50";
      case 'approval':
        return count > 15 ? "text-blue-600 bg-blue-50" : "text-blue-500 bg-blue-25";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getActionableInsight = (type: 'idle' | 'sla' | 'approval', count: number) => {
    if (count === 0) return "All claims on track";
    
    switch (type) {
      case 'idle':
        return count > 10 
          ? "Critical: High idle claim backlog" 
          : "Review idle claims for updates";
      case 'sla':
        return count > 5 
          ? "Critical: Multiple SLA breaches" 
          : "Monitor SLA compliance closely";
      case 'approval':
        return count > 15 
          ? "Approval bottleneck detected" 
          : "Pending approvals within normal range";
      default:
        return "";
    }
  };

  const handleAutoAction = async (actionType: 'idle' | 'sla' | 'approval') => {
    toast({
      title: "Auto-action triggered",
      description: `Processing ${actionType} claims automation...`,
    });
    
    // Placeholder for auto-actions
    // In Phase 5, this will trigger actual remediation actions
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Claims Analytics Dashboard</h1>
        <Button onClick={loadKPIData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Actionable KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Idle Claims */}
        <Card className={`border-l-4 border-l-orange-500 ${getInsightColor('idle', kpiData.idleClaims)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Claims Idle 3+ Days
              </CardTitle>
              <Badge variant="outline" className="font-mono">
                {kpiData.idleClaims} claims idle
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-medium">
              {getActionableInsight('idle', kpiData.idleClaims)}
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleAutoAction('idle')}
              >
                Auto-remind agents
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SLA Breaches */}
        <Card className={`border-l-4 border-l-red-500 ${getInsightColor('sla', kpiData.slaBreaches)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                SLA Breaches
              </CardTitle>
              <Badge variant="outline" className="font-mono">
                {kpiData.slaBreaches} overdue
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-medium">
              {getActionableInsight('sla', kpiData.slaBreaches)}
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleAutoAction('sla')}
              >
                Escalate to supervisors
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approval */}
        <Card className={`border-l-4 border-l-blue-500 ${getInsightColor('approval', kpiData.pendingApproval)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Pending Approval
              </CardTitle>
              <Badge variant="outline" className="font-mono">
                {kpiData.pendingApproval} awaiting
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-medium">
              {getActionableInsight('approval', kpiData.pendingApproval)}
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleAutoAction('approval')}
              >
                Notify underwriters
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Avg Processing Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{kpiData.avgProcessingTime} days</p>
              <p className="text-sm text-gray-600">
                {kpiData.avgProcessingTime <= 7 ? "Meeting targets" : "Above target"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Claims Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{kpiData.claimsRatio}%</p>
              <p className="text-sm text-gray-600">
                Settled vs Estimated Loss
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Total Settled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">₦{(kpiData.settledAmount / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-gray-600">
                {kpiData.totalClaims} total claims
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Rejection Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{kpiData.rejectionRate}%</p>
              <p className="text-sm text-gray-600">
                {kpiData.rejectionRate <= 15 ? "Within normal range" : "Above average"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};