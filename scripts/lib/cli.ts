// Small helpers for maintenance scripts. Secrets are read interactively so they
// never end up in source code, shell history, or console output.
import readline from 'node:readline'

type LineSource = { next: () => Promise<string> }
let pipedSource: LineSource | null = null

/**
 * One shared reader for piped stdin. Separate readline instances would each buffer
 * the whole chunk, so later prompts would lose their lines.
 */
function pipedLines(): LineSource {
  if (pipedSource) return pipedSource

  const rl = readline.createInterface({ input: process.stdin, terminal: false })
  const queue: string[] = []
  const waiters: Array<{ resolve: (line: string) => void; reject: (error: Error) => void }> = []
  let closed = false

  rl.on('line', (line) => {
    const waiter = waiters.shift()
    if (waiter) waiter.resolve(line)
    else queue.push(line)
  })
  rl.on('close', () => {
    closed = true
    for (const waiter of waiters.splice(0)) waiter.reject(new Error('Input stdin habis'))
  })

  pipedSource = {
    next: () => {
      if (queue.length) return Promise.resolve(queue.shift()!)
      if (closed) return Promise.reject(new Error('Input stdin habis'))
      return new Promise((resolve, reject) => waiters.push({ resolve, reject }))
    },
  }
  return pipedSource
}

/** Reads a visible line (used for confirmations). */
export async function promptLine(question: string): Promise<string> {
  process.stdout.write(question)
  if (!process.stdin.isTTY) {
    const line = await pipedLines().next()
    process.stdout.write('\n')
    return line
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
  // Question text was already written above
  const answer = await new Promise<string>((resolve) => rl.question('', resolve))
  rl.close()
  return answer
}

/** Reads a line without echoing it. */
export async function promptHidden(question: string): Promise<string> {
  const stdin = process.stdin
  process.stdout.write(question)

  if (!stdin.isTTY) {
    const line = await pipedLines().next()
    process.stdout.write('\n')
    return line
  }

  return new Promise((resolve, reject) => {
    let value = ''
    stdin.setRawMode(true)
    stdin.setEncoding('utf8')
    stdin.resume()

    const cleanup = () => {
      stdin.setRawMode(false)
      stdin.pause()
      stdin.removeListener('data', onData)
      process.stdout.write('\n')
    }

    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n') {
          cleanup()
          resolve(value)
          return
        }
        if (char === '\u0003') {
          cleanup()
          reject(new Error('Dibatalkan oleh pengguna'))
          return
        }
        if (char === '\u007f' || char === '\b') {
          value = value.slice(0, -1)
        } else {
          value += char
        }
      }
    }

    stdin.on('data', onData)
  })
}

/** Asks for a new password twice and enforces a minimum length. */
export async function promptNewPassword(label: string, minLength: number): Promise<string> {
  const password = await promptHidden(`Password baru untuk ${label} (min ${minLength} karakter): `)
  if (password.length < minLength) {
    throw new Error(`Password untuk ${label} kurang dari ${minLength} karakter`)
  }
  const confirmation = await promptHidden(`Ulangi password untuk ${label}: `)
  if (confirmation !== password) {
    throw new Error(`Konfirmasi password untuk ${label} tidak cocok`)
  }
  return password
}

/** Returns the positional argument at `index` or exits with a usage message. */
export function requireArg(index: number, usage: string): string {
  const value = process.argv[2 + index]
  if (!value) {
    console.error(`Penggunaan: ${usage}`)
    process.exit(1)
  }
  return value
}

/** Host and database name from DATABASE_URL, without credentials. */
export function describeDatabaseTarget(url = process.env.DATABASE_URL ?? ''): { host: string; database: string } {
  try {
    const parsed = new URL(url)
    return { host: parsed.hostname, database: parsed.pathname.replace(/^\//, '') }
  } catch {
    return { host: 'tidak diketahui', database: 'tidak diketahui' }
  }
}

/** Requires an explicit "ya" before a script writes to a non-local database. */
export async function confirmDatabaseTarget(action: string, url = process.env.DATABASE_URL ?? ''): Promise<void> {
  const { host, database } = describeDatabaseTarget(url)
  console.log(`Target database: ${host} / ${database}`)
  if (host === 'localhost' || host === '127.0.0.1') return

  const answer = await promptLine(`Ini bukan database lokal. Ketik "ya" untuk ${action}: `)
  if (answer.trim().toLowerCase() !== 'ya') {
    throw new Error('Dibatalkan: target database tidak dikonfirmasi')
  }
}
