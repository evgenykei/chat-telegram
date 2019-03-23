import * as moment from 'moment'

export interface IAbapAPI {
  resetPassword(chatId: number): Promise<string>
  getVacationDays(chatId: number, date: moment.Moment): Promise<number>
  checkUser(chatId: number): Promise<boolean>
}

export interface ResetPasswordBody {
  NEWPASS: string,
  SYSUBRC: string
}

export interface VacationDaysBody {
  DAYS: string
}

export interface CheckUserBody {
  SYSUBRC: string
}
