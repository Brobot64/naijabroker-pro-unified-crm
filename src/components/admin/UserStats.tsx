
import { Card, CardContent } from "@/components/ui/card";

interface UserStatsProps {
  users: Array<{ status: string; role: string }>;
}

export const UserStats = ({ users }: UserStatsProps) => {
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    agents: users.filter(u => u.role === 'Agent').length,
    underwriters: users.filter(u => u.role === 'Underwriter').length
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Total Users</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats.active}</div>
          <p className="text-xs text-muted-foreground">Active Users</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats.agents}</div>
          <p className="text-xs text-muted-foreground">Sales Agents</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats.underwriters}</div>
          <p className="text-xs text-muted-foreground">Underwriters</p>
        </CardContent>
      </Card>
    </div>
  );
};
