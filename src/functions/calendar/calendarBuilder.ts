import * as _ from 'lodash'
import * as moment from 'moment'

import Node from '../../menu/Node'

export function BuildYears(callbackData: string, year?: number, minDate?: Date, maxDate?: Date): Node[][] {
  if (!year) year = moment().year()
  const min = minDate ? moment(minDate).year() : 1990,
        max = maxDate ? moment(maxDate).year() : 2050,
        from = Math.floor((year + 1) / 10) * 10,
        to = from + 9

  const head = [
    inRange(from - 2, min, max)
      ? new Node(`${callbackData}.${from - 2}`, '<')
      : new Node(`${callbackData}.noaction`, ' '),

    new Node(`${callbackData}.noaction`, `${from} - ${to}`),

    inRange(to + 2, min, max)
      ? new Node(`${callbackData}.${to + 2}`, '>')
      : new Node(`${callbackData}.noaction`, ' '),
  ]

  const body = _.range(from - 1, to + 2).map(y => {
    const validYear = inRange(y, min, max)
    const id = validYear ? `${callbackData}.${y};0` : `${callbackData}.noaction`
    const title = validYear ? y.toString() : ' '
    return new Node(id, title)
  })

  return _.chunk(_.union(head, body), 3)
}

export function BuildMonths(callbackData: string, iso?: string,
                            year?: number, minDate?: Date,  maxDate?: Date): Node[][] {

  if (!year) year = moment().year()
  const minYear = minDate ? moment(minDate).year() : 1990,
        maxYear = maxDate ? moment(maxDate).year() : 2050,
        minMonth = minDate && year === minYear ? moment(minDate).month() : 0,
        maxMonth = maxDate && year === maxYear ? moment(maxDate).month() : 11

  const head = [
    inRange(year - 1, minYear, maxYear)
      ? new Node(`${callbackData}.${year - 1};0`, '<')
      : new Node(`${callbackData}.noaction`, ' '),

    new Node(`${callbackData}.noaction`, `${year}`),

    inRange(year + 1, minYear, maxYear)
      ? new Node(`${callbackData}.${year + 1};0`, '>')
      : new Node(`${callbackData}.noaction`, ' '),
  ]

  const body = _.range(0, 12).map(m => {
    const validMonth = inRange(m, minMonth, maxMonth)
    const id = validMonth ? `${callbackData}.${year};${m};0` : `${callbackData}.noaction`
    const title = validMonth ? _.capitalize(moment().locale(iso || 'en').month(m).format('MMM')) : ' '
    return new Node(id, title)
  })

  return _.chunk(_.union(head, body), 3)
}

function inRange(cur: number, min: number, max: number) {
  return cur >= min && cur <= max
}
