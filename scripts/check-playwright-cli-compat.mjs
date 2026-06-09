#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const strict = process.argv.slice(2).includes('--strict');

const requiredCommands = [
  ['--help'],
  ['open', '--help'],
  ['snapshot', '--help'],
  ['screenshot', '--help'],
  ['click', '--help'],
  ['fill', '--help'],
];

const optionalCommands = [
  ['goto', '--help'],
  ['reload', '--help'],
  ['go-back', '--help'],
  ['dblclick', '--help'],
  ['type', '--help'],
  ['state-save', '--help'],
  ['state-load', '--help'],
  ['tracing-start', '--help'],
  ['tracing-stop', '--help'],
  ['console', '--help'],
  ['network', '--help'],
  ['dialog-accept', '--help'],
  ['dialog-dismiss', '--help'],
  ['mousemove', '--help'],
  ['mousedown', '--help'],
  ['mouseup', '--help'],
  ['attach', '--help'],
  ['route', '--help'],
  ['eval', '--help'],
  ['run-code', '--help'],
];

function runPlaywrightCli(args) {
  const result = spawnSync('playwright-cli', args, {
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  return {
    args,
    status: result.status,
    error: result.error,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    ok: result.status === 0,
  };
}

function label(args) {
  return `playwright-cli ${args.join(' ')}`;
}

function summarizeFailure(result) {
  if (result.error) return result.error.message;
  const output = `${result.stderr}\n${result.stdout}`.trim();
  return output ? output.split(/\r?\n/).slice(0, 3).join(' ') : `exit status ${result.status}`;
}

const requiredFailures = [];
const optionalFailures = [];

for (const args of requiredCommands) {
  const result = runPlaywrightCli(args);
  if (!result.ok) requiredFailures.push({ args, reason: summarizeFailure(result) });
}

for (const args of optionalCommands) {
  const result = runPlaywrightCli(args);
  if (!result.ok) optionalFailures.push({ args, reason: summarizeFailure(result) });
}

const optionalFailureIsFatal = strict && optionalFailures.length > 0;
const failed = requiredFailures.length > 0 || optionalFailureIsFatal;

console.log(`Playwright CLI compatibility check: ${failed ? 'FAIL' : 'PASS'}`);
console.log(`Strict mode: ${strict ? 'enabled' : 'disabled'}`);
console.log(`Required commands checked: ${requiredCommands.length}`);
console.log(`Optional commands checked: ${optionalCommands.length}`);

if (requiredFailures.length) {
  console.error('\nRequired command failures:');
  for (const failure of requiredFailures) {
    console.error(`- ${label(failure.args)} :: ${failure.reason}`);
  }
}

if (optionalFailures.length) {
  const output = strict ? console.error : console.log;
  output('\nOptional command warnings:');
  for (const failure of optionalFailures) {
    output(`- ${label(failure.args)} :: ${failure.reason}`);
  }
  if (!strict) {
    console.log('\nOptional command warnings do not fail this check unless --strict is used.');
  }
}

if (requiredFailures.length > 0) {
  console.error(
    '\nInstall or expose Playwright CLI before browser exploration, evidence capture, generation from live behavior, or browser-dependent healing.',
  );
}

process.exit(failed ? 1 : 0);
