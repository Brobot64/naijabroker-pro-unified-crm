
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PolicyService } from "@/services/database/policyService";
import { ClaimService } from "@/services/database/claimService";

interface TopClient {
  client: string;
  premium: number;
  formattedPremium: string;
  claimsRatio: string;
  policies: number;
  renewalDate: string;
  riskScore: number;
  riskLevel: string;
}

export const TopClientsTable = () => {
  const [topClients, setTopClients] = useState<TopClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopClients();
  }, []);

  const loadTopClients = async () => {
    try {
      const [policies, claims] = await Promise.all([
        PolicyService.getAll(),
        ClaimService.getAll()
      ]);

      // Group policies by client and calculate totals
      const clientData = policies.reduce((acc, policy) => {
        if (policy.status !== 'active') return acc;
        
        const clientName = policy.client_name;
        if (!acc[clientName]) {
          acc[clientName] = {
            premium: 0,
            policies: 0,
            claimsAmount: 0,
            latestRenewal: null
          };
        }
        
        acc[clientName].premium += Number(policy.premium || 0);
        acc[clientName].policies += 1;
        
        // Track latest renewal date
        const renewalDate = new Date(policy.end_date);
        if (!acc[clientName].latestRenewal || renewalDate > acc[clientName].latestRenewal) {
          acc[clientName].latestRenewal = renewalDate;
        }
        
        return acc;
      }, {} as Record<string, any>);

      // Add claims data
      claims.forEach(claim => {
        const clientName = claim.client_name;
        if (clientData[clientName] && claim.status === 'settled') {
          clientData[clientName].claimsAmount += Number(claim.settlement_amount || 0);
        }
      });

      // Convert to array and calculate metrics
      const clientsArray = Object.entries(clientData).map(([client, data]) => {
        const claimsRatio = data.premium > 0 ? (data.claimsAmount / data.premium) * 100 : 0;
        const riskScore = Math.max(10, Math.min(100, 100 - claimsRatio));
        
        let riskLevel = 'low';
        if (claimsRatio > 60) riskLevel = 'high';
        else if (claimsRatio > 35) riskLevel = 'medium';

        return {
          client,
          premium: data.premium,
          formattedPremium: formatCurrency(data.premium),
          claimsRatio: `${claimsRatio.toFixed(1)}%`,
          policies: data.policies,
          renewalDate: data.latestRenewal ? data.latestRenewal.toLocaleDateString('en-GB') : 'N/A',
          riskScore: Math.round(riskScore),
          riskLevel
        };
      });

      // Sort by premium and take top 5
      const topClientsData = clientsArray
        .sort((a, b) => b.premium - a.premium)
        .slice(0, 5);

      setTopClients(topClientsData);
    } catch (error) {
      console.error('Error loading top clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Clients by Premium</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-gray-500">Loading client data...</span>
            </div>
          ) : topClients.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-gray-500">No client data available</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">Client</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">Premium (₦)</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">Claims Ratio</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">Policies</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">Renewal Date</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {topClients.map((client, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-gray-900">{client.client}</td>
                    <td className="py-3 px-2 text-gray-700">{client.formattedPremium}</td>
                    <td className="py-3 px-2">
                      <span className={`text-sm ${parseFloat(client.claimsRatio) > 50 ? 'text-red-600' : 'text-green-600'}`}>
                        {client.claimsRatio}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-700">{client.policies}</td>
                    <td className="py-3 px-2 text-gray-700">{client.renewalDate}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{client.riskScore}</span>
                        <Badge className={getRiskBadgeColor(client.riskLevel)}>
                          {client.riskLevel}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
