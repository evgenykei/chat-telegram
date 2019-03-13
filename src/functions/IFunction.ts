import IBot from '../bot/IBot'
import LocaleManager from '../localeManager/LocaleManager'
import Node from '../menu/Node'

type IFunction = (body: MessageBody, node: Node, bot: IBot, localeManager: LocaleManager) => void

export default IFunction
