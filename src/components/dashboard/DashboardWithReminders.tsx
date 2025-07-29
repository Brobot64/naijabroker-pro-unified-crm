import React from 'react';
import { ActionableKPIs } from './ActionableKPIs';
import { QuoteReminderManager } from './QuoteReminderManager';

export const DashboardWithReminders = () => {
  return (
    <div className="space-y-6">
      <ActionableKPIs />
      <QuoteReminderManager />
    </div>
  );
};