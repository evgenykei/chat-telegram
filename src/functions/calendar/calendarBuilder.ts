import * as _ from 'lodash'
import * as moment from 'moment'

import Node from '../../menu/Node'

const MINDATE = moment({ year: 1990 }),
      MAXDATE = moment({ year: 2049 }).endOf('year')

export function BuildYears(node: Node,
                           curDate?: moment.Moment, minDate?: moment.Moment, maxDate?: moment.Moment): Node[][] {

  if (!curDate) curDate = moment()
  if (!minDate) minDate = MINDATE
  if (!maxDate) maxDate = MAXDATE

  const from = moment({ year: Math.floor(curDate.year() / 10) * 10 }),
        to = from.clone().add(9, 'years')

  const head = [
    inBounds(from.clone().subtract(1, 'years'), minDate, maxDate, 'year')
      ? new Node(`${node.id}.${from.year() - 2}`, '<')
      : new Node(`${node.id}.noaction`, ' '),

    new Node(`${node.id}.noaction`, `${from.year()} - ${to.year()}`),

    inBounds(to.clone().add(1, 'years'), minDate, maxDate, 'year')
      ? new Node(`${node.id}.${to.year() + 2}`, '>')
      : new Node(`${node.id}.noaction`, ' '),
  ]

  const body = _.range(from.year() - 1, to.year() + 2).map(y => {
    const validYear = inBounds(moment({ year: y }), minDate!, maxDate!, 'year')
    const id = validYear ? `${node.id}.${y};0` : `${node.id}.noaction`
    const title = validYear ? y.toString() : ' '
    return new Node(id, title)
  })

  const result = _.chunk(_.concat(head, body), 3)
  if (node.parent) result.unshift([new Node(node.parent!.id, 'button.back')])
  return result
}

export function BuildMonths(node: Node, iso?: string,
                            curDate?: moment.Moment, minDate?: moment.Moment, maxDate?: moment.Moment): Node[][] {

  if (!iso) iso = 'en'
  if (!curDate) curDate = moment()
  if (!minDate) minDate = MINDATE
  if (!maxDate) maxDate = MAXDATE

  const head = [
    inBounds(curDate.clone().subtract(1, 'years'), minDate, maxDate, 'year')
      ? new Node(`${node.id}.${curDate.year() - 1};0`, '<')
      : new Node(`${node.id}.noaction`, ' '),

    new Node(`${node.id}.${curDate!.year()}`, `${curDate.year()}`),

    inBounds(curDate.clone().add(1, 'years'), minDate, maxDate, 'year')
      ? new Node(`${node.id}.${curDate.year() + 1};0`, '>')
      : new Node(`${node.id}.noaction`, ' '),
  ]

  const body = _.range(0, 12).map(m => {
    const validMonth = inBounds(curDate!.clone().month(m), minDate!, maxDate!, 'month')
    const id = validMonth ? `${node.id}.${curDate!.year()};${m};0` : `${node.id}.noaction`
    const title = validMonth ? _.capitalize(moment().locale(iso || 'en').month(m).format('MMM')) : ' '
    return new Node(id, title)
  })

  const result = _.chunk(_.concat(head, body), 3)
  if (node.parent) result.unshift([new Node(node.parent!.id, 'button.back')])
  return result
}

export function BuildDays(node: Node, iso?: string,
                          curDate?: moment.Moment, minDate?: moment.Moment, maxDate?: moment.Moment): Node[][] {

  if (!iso) iso = 'en'
  if (!curDate) curDate = moment()
  if (!minDate) minDate = MINDATE
  if (!maxDate) maxDate = MAXDATE

  const prevMonthDate = curDate.clone().subtract(1, 'months'),
        nextMonthDate = curDate.clone().add(1, 'months')

  const head = [
    inBounds(prevMonthDate, minDate, maxDate, 'month')
      ? new Node(`${node.id}.${prevMonthDate.year()};${prevMonthDate.month()};0`, '<')
      : new Node(`${node.id}.noaction`, ' '),

    new Node(`${node.id}.${curDate!.year()};${curDate!.month()}`,
      _.capitalize(curDate.locale(iso).format('MMMM, YYYY'))),

    inBounds(nextMonthDate, minDate, maxDate, 'month')
      ? new Node(`${node.id}.${nextMonthDate.year()};${nextMonthDate.month()};0`, '>')
      : new Node(`${node.id}.noaction`, ' '),
  ]

  const weekDays = _.range(0, 7).map(d =>
    new Node(`${node.id}.noaction`, _.capitalize(moment().locale(iso!).weekday(d).format('ddd'))))

  const isoFirstWeekDay = moment.localeData(iso).firstDayOfWeek() - 1
  const body = _.chunk(_.range(1 + isoFirstWeekDay, 43 + isoFirstWeekDay).map(it => {
    const day = curDate!.clone().day(it)
    const validDay = day.month() === curDate!.month() && inBounds(day, minDate!, maxDate!, 'day')
    const id = validDay
      ? `${node.id}.${curDate!.year()};${curDate!.month()};${day.day()};0`
      : `${node.id}.noaction`
    const title = validDay ? day.format('DD') : '  '
    return new Node(id, title)
  }), 7).filter(it => it.some(val => val.title.trim().length !== 0))

  const result = _.concat([head], [weekDays], body)
  if (node.parent) result.unshift([new Node(node.parent!.id, 'button.back')])
  return result
}

function inBounds(cur: moment.Moment, min: moment.Moment, max: moment.Moment, unit: moment.unitOfTime.StartOf) {
  const curClone = cur.clone().startOf(unit),
        minClone = min.clone().startOf(unit),
        maxClone = max.clone().startOf(unit)
  return curClone >= minClone && curClone <= maxClone
}
