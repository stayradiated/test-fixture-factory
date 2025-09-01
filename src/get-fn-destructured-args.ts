/*
 *
 * This code originally forked from Vitest
 *
 * vitest/packages/runner/src/fixture.ts
 * - getUsedProps
 * - splitByComma
 *
 * Original source at https://github.com/vitest-dev/vitest/blob/2b9b34311fbae60dd89715b67976d4bc92a13985/packages/runner/src/fixture.ts#L341-L414
 *
 * MIT License
 *
 * Copyright (c) 2021-Present VoidZero Inc. and Vitest contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const splitByComma = (s: string) => {
  const result = []
  const stack = []
  let start = 0
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '{' || s[i] === '[') {
      stack.push(s[i] === '{' ? '}' : ']')
    } else if (s[i] === stack.at(-1)) {
      stack.pop()
    } else if (!stack.length && s[i] === ',') {
      const token = s.substring(start, i).trim()
      if (token) {
        result.push(token)
      }
      start = i + 1
    }
  }
  const lastToken = s.substring(start).trim()
  if (lastToken) {
    result.push(lastToken)
  }
  return result
}

/*
 * Given a function, return the destructured arguments
 * used in the _source code_ of the function.
 *
 * getFnDestructredArgs(fn)
 * ({ test } => {}) → ['test']
 * ({ a, b, c} => {}) → ['test', 'test2']
 * function ({ a, b, c}) { ... } → ['a', 'b', 'c']
 *
 */

// biome-ignore lint/suspicious/noExplicitAny: we want to accept any function
type AnyFunction = (...args: any[]) => any

const getFnDestructuredArgs = (fn: AnyFunction): string[] => {
  let fnString = fn.toString()

  // match lowered async function and strip it off
  //   __async(this, null, function*
  //   __async(this, arguments, function*
  //   __async(this, [_0, _1], function*
  if (
    /__async\((?:this|null), (?:null|arguments|\[[_0-9, ]*\]), function\*/.test(
      fnString,
    )
  ) {
    fnString = fnString.split(/__async\((?:this|null),/)[1] ?? ''
  }
  const match = fnString.match(/[^(]*\(([^)]*)/)
  if (!match) {
    return []
  }

  const args = splitByComma(match[1] ?? '')
  if (!args.length) {
    return []
  }

  const first = args[0] ?? ''
  if (!(first.startsWith('{') && first.endsWith('}'))) {
    throw new Error(
      `The first argument inside a fixture must use object destructuring pattern, e.g. ({ test } => {}). Instead, received "${first}".`,
    )
  }

  const _first = first.slice(1, -1).replace(/\s/g, '')
  const props = splitByComma(_first).map((prop) => {
    return prop.replace(/:.*|=.*/g, '')
  })

  const last = props.at(-1)
  if (last?.startsWith('...')) {
    throw new Error(
      `Rest parameters are not supported in fixtures, received "${last}".`,
    )
  }

  return props
}

export { getFnDestructuredArgs }
