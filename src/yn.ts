/*
 * ----------------------------------------------------------------------------
 *
 *  This is a fork of the `yn` package, which is a simple utility to parse a
 *  yes/no like string into a boolean.
 *
 *  See https://github.com/sindresorhus/yn for the original package.
 *
 *  Usage:
 *
 *    import { yn } from './yn.ts'
 *
 *    // returns true
 *    yn('y')
 *    yn('yes')
 *    yn('true')
 *    yn('1')
 *
 *    // returns false
 *    yn('n')
 *    yn('no')
 *    yn('false')
 *    yn('0')
 *
 *    // unknown values return false
 *    yn('foo')
 *    yn('bar')
 *    yn('baz')
 *
 * ----------------------------------------------------------------------------
 *
 *  MIT License
 *
 *  Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 *  IN THE SOFTWARE.
 *
 * ----------------------------------------------------------------------------
 */

const yn = (input: unknown): boolean => {
  if (input === undefined || input === null) {
    return false
  }

  const value = String(input).trim()

  if (/^(?:y|yes|true|1|on)$/i.test(value)) {
    return true
  }

  if (/^(?:n|no|false|0|off)$/i.test(value)) {
    return false
  }

  return false
}

export { yn }
