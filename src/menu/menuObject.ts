import * as functions from '../functions'
import Node from './Node'

// Root
export default new Node('root', 'menu.root', 'MAINMENU', undefined, [

  // Analytical reports
  new Node('analytical_reports', 'menu.analyticalReports', 'ANALYTICALREPORTS', undefined, [
    new Node('weekly_report', 'menu.weeklyReport', undefined, functions.weeklyReport),
    new Node('monthly_report', 'menu.monthlyReport', undefined, functions.monthlyReport),
  ]),

  // Employee services
  new Node('employee_services', 'menu.employeeServices', 'EMPLOYEESERVICES', undefined, [
    new Node('reset_password', 'menu.resetPassword', undefined, functions.resetPassword),
    new Node('request_vacation_days', 'menu.requestVacationDays', undefined, functions.requestVacationDays),
    new Node('request_vacation', 'menu.requestVacation', undefined, functions.requestVacation),
  ]),

  // Contact support
  new Node('contact_support', 'menu.contactSupport', undefined, functions.contactSupport),

  // Presentation
  new Node('presentation', 'menu.presentation', undefined, functions.getPresentation),
])
