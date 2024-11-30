type UndefinedFieldErrorOptions = {
  factory: string
  attribute: string
  dependency: string
}

class UndefinedFieldError extends Error {
  constructor(options: UndefinedFieldErrorOptions) {
    const { factory, dependency, attribute } = options
    super(
      `[${factory}] Undefined field: '${attribute}'. You must either define a '${dependency}' test fixture or supply the '${attribute}' attribute.`,
    )
  }
}

export { UndefinedFieldError }
