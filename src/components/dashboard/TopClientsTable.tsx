
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const TopClientsTable = () => {
  const topClients = [
    {
      client: "Dangote Cement",
      premium: "₦123,750,000",
      claimsRatio: "82.0%",
      policies: 5,
      renewalDate: "30/09/2023",
      riskScore: 65,
      riskLevel: "medium"
    },
    {
      client: "MTN Nigeria",
      premium: "₦105,200,000",
      claimsRatio: "28.0%",
      policies: 4,
      renewalDate: "15/03/2024",
      riskScore: 86,
      riskLevel: "low"
    },
    {
      client: "Access Bank",
      premium: "₦93,250,000",
      claimsRatio: "22.0%",
      policies: 4,
      renewalDate: "10/04/2024",
      riskScore: 91,
      riskLevel: "low"
    },
    {
      client: "FBN Holdings",
      premium: "₦87,500,000",
      claimsRatio: "32.0%",
      policies: 4,
      renewalDate: "15/12/2023",
      riskScore: 82,
      riskLevel: "low"
    },
    {
      client: "Nigerian Breweries",
      premium: "₦75,850,000",
      claimsRatio: "41.0%",
      policies: 4,
      renewalDate: "20/01/2024",
      riskScore: 78,
      riskLevel: "medium"
    },
  ];

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
                  <td className="py-3 px-2 text-gray-700">{client.premium}</td>
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
        </div>
      </CardContent>
    </Card>
  );
};
