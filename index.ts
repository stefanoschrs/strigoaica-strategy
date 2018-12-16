'use strict'

import { camel as toCamelCase } from 'case'

export abstract class Strategy {
  templatesPath: string
  type: string

  send (templateId: string, data: any) {}

  static extractMergeValueMeta (rawTemplate: string) {
    return rawTemplate
      .split('\n')
      .filter((line) => line.startsWith('['))
      .map((line) => line
        .slice(1, line.length - 1)
        .split(':', 2))
      .reduce((acc, curr) => {
        acc[toCamelCase(curr[0])] = curr[1].trim()

        return acc
      }, {})
  }

  static fillMergeValueTemplate (rawTemplate: string, params: {}) {
    /** Remove meta */
    rawTemplate = rawTemplate
      .split('\n')
      .filter((line) => !line.startsWith('['))
      .join('\n')

    /** Extract unique mergeValues */
    let mergeValues = Strategy.extractMergeValues(rawTemplate)

    /** Replace mergeValues with payloadValues */
    for (let i = mergeValues.length - 1; i >= 0; i--) {
      let mv = mergeValues[i]
      let param = params[toCamelCase(mv.slice(2, mv.length - 2))]
      mv = mv
        .replace(/\*/g, '\\*')
        .replace(/\|/g, '\\|')

      if (param) {
        rawTemplate = rawTemplate.replace(new RegExp(mv, 'g'), param)
        mergeValues.splice(i, 1)
      }
    }

    if (mergeValues.length) {
      throw new Error('Missing merge values')
    }

    return rawTemplate
  }

  /**
   * Aux
   */
  static extractMergeValues (text) {
    const values = text.match(/\*\|(\w*)\|\*/g)

    return values.reduce((acc, curr) => {
      if (!acc.includes(curr)) {
        acc.push(curr)
      }

      return acc
    }, [])
  }
}
