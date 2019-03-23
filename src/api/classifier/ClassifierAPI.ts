
import * as url from 'url'

import axios from 'axios'
import { config } from 'node-config-ts'

export default class ClassifierAPI implements IClassifierAPI {

  public async getClassName(text: string): Promise<string> {
    const req = await axios.get(url.resolve(config.urls.classifier, 'api/predict' + encodeURIComponent(text)))
    return req.data
  }

}
