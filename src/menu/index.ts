import * as _ from 'lodash'

import * as functions from '../functions'
import LocaleManager from '../localeManager/LocaleManager'
import Node from './Node'

export function createMenu(localeManager: LocaleManager): Node {
  // Root
  return new Node('root', 'button.root', 'MAINMENU', functions.sendSubmenu, [
    // Analytical reports
    new Node('analytical_reports', 'button.analyticalReports', 'ANALYTICALREPORTS', functions.sendSubmenu, [
      new Node('weekly_report', 'button.weeklyReport', undefined, functions.weeklyReport),
      new Node('monthly_report', 'button.monthlyReport', undefined, functions.monthlyReport),
    ]),

    // Employee services
    new Node('employee_services', 'button.employeeServices', 'EMPLOYEESERVICES', functions.sendSubmenu, [
      new Node('reset_password', 'button.resetPassword', undefined, functions.resetPassword),
      new Node('request_vacation_days', 'button.requestVacationDays', undefined, functions.requestVacationDays),
      new Node('request_vacation', 'button.requestVacation', undefined, functions.requestVacation),
    ]),

    // Contact support
    new Node('contact_support', 'button.contactSupport', undefined, functions.contactSupport),

    // Presentation
    new Node('presentation', 'button.presentation', undefined, functions.getPresentation),

    // Language
    new Node('language', 'button.language', undefined, functions.sendSubmenu,
      _.values(localeManager.locales)
        .map(locale => new Node(locale.name, locale.title, undefined, functions.setLanguage))),
  ])
}
