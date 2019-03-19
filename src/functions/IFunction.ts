import IBot from '../bot/IBot'
import Node from '../menu/Node'
import LocaleService from '../services/locale/LocaleService'

export type IFunction = (body: IFunctionBody) => void

export interface IFunctionBody {
  messageBody: MessageBody,
  node: Node,
  bot: IBot,
  localeService: LocaleService,
  args?: string[],
}
