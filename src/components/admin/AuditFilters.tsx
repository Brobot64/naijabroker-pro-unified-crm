
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface AuditFiltersProps {
  searchTerm: string;
  severityFilter: string;
  actionFilter: string;
  onSearchChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
  onActionChange: (value: string) => void;
}

export const AuditFilters = ({
  searchTerm,
  severityFilter,
  actionFilter,
  onSearchChange,
  onSeverityChange,
  onActionChange
}: AuditFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Input
        placeholder="Search logs..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Select value={severityFilter} onValueChange={onSeverityChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Severities</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
      <Select value={actionFilter} onValueChange={onActionChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Actions</SelectItem>
          <SelectItem value="USER">User Actions</SelectItem>
          <SelectItem value="SECURITY">Security Actions</SelectItem>
          <SelectItem value="LOGIN">Login Actions</SelectItem>
          <SelectItem value="POLICY">Policy Actions</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline">
        <Filter className="w-4 h-4 mr-2" />
        More Filters
      </Button>
    </div>
  );
};
