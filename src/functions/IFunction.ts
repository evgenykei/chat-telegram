import IBot from '../bot/IBot'
import Node from '../menu/Node'
import LocaleService from '../services/locale/LocaleService'

type IFunction = (body: MessageBody, node: Node, bot: IBot, localeService: LocaleService) => void

export default IFunction
