import type { AnyField } from './types.js'

const formatMissingField = ([key, field]: [string, AnyField]): string => {
  const fixtureList = field.context?.fixtureList ?? []

  if (fixtureList.length === 0) {
    return `- ${key}: must be provided as an attribute`
  }

  return `- ${key}: must be provided as an attribute or via the test context (${fixtureList.join(', ')})`
}

class UndefinedFieldError extends Error {
  constructor(name: string, missingFields: [string, AnyField][]) {
    const count = missingFields.length

    super(
      `[${name}] ${count} required field(s) have undefined values:
${missingFields.map(formatMissingField).join('\n')}`,
    )
  }
}

export { UndefinedFieldError }
