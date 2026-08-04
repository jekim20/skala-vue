import { spawn } from 'node:child_process'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const processes = [
  start('VUE', ['run', 'dev']),
  start('API', ['run', 'api']),
]
let shuttingDown = false

function start(name, args) {
  const child = spawn(npmCommand, args, {
    env: process.env,
    stdio: ['inherit', 'pipe', 'pipe'],
  })

  pipeWithLabel(child.stdout, name, process.stdout)
  pipeWithLabel(child.stderr, name, process.stderr)

  child.on('error', (error) => {
    console.error(`[${name}] 실행 실패: ${error.message}`)
    shutdown(1)
  })
  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      console.log(`[${name}] 종료됨 (${signal || code || 0})`)
      shutdown(code || 0)
    }
  })
  return child
}

function pipeWithLabel(stream, name, target) {
  let pending = ''
  stream.on('data', (chunk) => {
    pending += chunk.toString()
    const lines = pending.split(/\r?\n/)
    pending = lines.pop()
    for (const line of lines) target.write(`[${name}] ${line}\n`)
  })
  stream.on('end', () => {
    if (pending) target.write(`[${name}] ${pending}\n`)
  })
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return
  shuttingDown = true
  process.exitCode = exitCode
  for (const child of processes) {
    if (!child.killed) child.kill('SIGTERM')
  }
  setTimeout(() => process.exit(exitCode), 300)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
