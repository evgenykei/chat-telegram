import * as url from 'url'

import axios from 'axios'
import * as moment from 'moment'
import { config } from 'node-config-ts'
import { CheckUserBody, IAbapAPI, ResetPasswordBody, VacationDaysBody } from './IAbapAPI'

export default class AbapAPI implements IAbapAPI {

  public async resetPassword(chatId: number): Promise<string> {
    const req = await axios.get(url.resolve(config.urls.abapTransformer, config.urls.abapResetPasswordFunction), {
      params: { user_id: chatId },
    })
    const data = req.data as ResetPasswordBody
    if (data.SYSUBRC.trim() !== '0') throw new Error('Remote function finished with error')
    return data.NEWPASS.trim()
  }

  public async getVacationDays(chatId: number, date: moment.Moment): Promise<number> {
    const req = await axios.get(url.resolve(config.urls.abapTransformer, config.urls.abapDaysVacationFunction), {
      params: {
        user_id: chatId,
        dateto: date.format('YYYYMMDD'),
      },
    })
    const data = req.data as VacationDaysBody
    if (!data.DAYS.trim()) throw new Error('Remote function finished with error')
    return parseInt(data.DAYS.trim(), 10)
  }

  public async checkUser(chatId: number): Promise<boolean> {
    const req = await axios.get(url.resolve(config.urls.abapTransformer, config.urls.abapUserCheckFunction), {
      params: { user_id: chatId },
    })
    const data = req.data as CheckUserBody
    return data.SYSUBRC.trim() === '0'
  }
}
