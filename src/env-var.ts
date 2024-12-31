import { yn } from './yn.js'

const getSkipDestroyEnvVar = (): boolean => {
  // if we are in a node environment, check the process.env object
  if (typeof process !== 'undefined' && 'env' in process) {
    // will return false if TFF_SKIP_DESTROY is not set
    // or if it is set to an empty/blank string or "0"
    return yn(process.env.TFF_SKIP_DESTROY)
  }
  return false
}

const SKIP_DESTROY = getSkipDestroyEnvVar()

export { SKIP_DESTROY }
