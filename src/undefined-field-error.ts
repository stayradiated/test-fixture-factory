import type { MissingField } from './types.js'

const formatMissingField = (field: MissingField): string => {
  const { key, fixtureList } = field

  if (fixtureList.length === 0) {
    return `- ${key}: must be provided as an attribute`
  }

  return `- ${key}: must be provided as an attribute or via the test context (${fixtureList.join(', ')})`
}

class UndefinedFieldError extends Error {
  constructor(name: string, missingFields: MissingField[]) {
    const count = missingFields.length

    super(
      `[${name}] ${count} required field(s) have undefined values:
${missingFields.map(formatMissingField).join('\n')}`,
    )
  }
}

export { UndefinedFieldError }
