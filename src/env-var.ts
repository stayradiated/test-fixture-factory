const getSkipDestroyEnvVar = (): boolean => {
  // if we are in a node environment, check the process.env object
  if (typeof process !== 'undefined' && 'env' in process) {
    return (process.env.TFF_SKIP_DESTROY ?? '').trim().length > 0
  }
  return false
}

const SKIP_DESTROY = getSkipDestroyEnvVar()

export { SKIP_DESTROY }
