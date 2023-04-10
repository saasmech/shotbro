/**
 * Copy of https://raw.githubusercontent.com/ulid/javascript/master/lib/index.ts
 * with unused parts removed.
 * Note, it's MIT license: https://github.com/ulid/javascript/blob/master/LICENSE
 *
 * We copy it here because it avoids having a dependency that might conflict with a downstream package.
 */

export interface PRNG {
  (): number
}

export interface ULID {
  (seedTime?: number): string
}

export interface LibError extends Error {
  source: string
}

function createError(message: string): LibError {
  const err = new Error(message) as LibError
  err.source = "ulid"
  return err
}

// These values should NEVER change. If
// they do, we're no longer making ulids!
const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ" // Crockford's Base32
const ENCODING_LEN = ENCODING.length
const TIME_MAX = Math.pow(2, 48) - 1
const TIME_LEN = 10
const RANDOM_LEN = 16

export function randomChar(prng: PRNG): string {
  let rand = Math.floor(prng() * ENCODING_LEN)
  if (rand === ENCODING_LEN) {
    rand = ENCODING_LEN - 1
  }
  return ENCODING.charAt(rand)
}

export function encodeTime(now: number, len: number): string {
  if (isNaN(now)) {
    throw new Error(now + " must be a number")
  }
  if (now > TIME_MAX) {
    throw createError("cannot encode time greater than " + TIME_MAX)
  }
  if (now < 0) {
    throw createError("time must be positive")
  }
  if (!Number.isInteger(now)) {
    throw createError("time must be an integer")
  }
  let mod
  let str = ""
  for (; len > 0; len--) {
    mod = now % ENCODING_LEN
    str = ENCODING.charAt(mod) + str
    now = (now - mod) / ENCODING_LEN
  }
  return str
}

export function encodeRandom(len: number, prng: PRNG): string {
  let str = ""
  for (; len > 0; len--) {
    str = randomChar(prng) + str
  }
  return str
}

export function detectPrng(allowInsecure: boolean = false, root?: any): PRNG {
  if (!root) {
    root = typeof window !== "undefined" ? window : null
  }

  const browserCrypto = root && (root.crypto || root.msCrypto)

  if (browserCrypto) {
    return () => {
      const buffer = new Uint8Array(1)
      browserCrypto.getRandomValues(buffer)
      return buffer[0] / 0xff
    }
  } else {
    try {
      const nodeCrypto = require("crypto")
      return () => nodeCrypto.randomBytes(1).readUInt8() / 0xff
    } catch (e) {
    }
  }

  if (allowInsecure) {
    try {
      console.error("secure crypto unusable, falling back to insecure Math.random()!")
    } catch (e) {
    }
    return () => Math.random()
  }

  throw createError("secure crypto unusable, insecure Math.random not allowed")
}

export function factory(currPrng?: PRNG): ULID {
  if (!currPrng) {
    currPrng = detectPrng()
  }
  return function ulid(seedTime?: number): string {
    if (!seedTime || isNaN(seedTime)) {
      seedTime = Date.now()
    }
    if (!currPrng) throw new Error('could not detect prng');
    return encodeTime(seedTime, TIME_LEN) + encodeRandom(RANDOM_LEN, currPrng)
  }
}

export const ulid = factory()
