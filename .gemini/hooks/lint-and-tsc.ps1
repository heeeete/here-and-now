$ErrorActionPreference = "Continue"
$null = $input | Out-String

if ($env:GEMINI_PROJECT_DIR) {
  Set-Location $env:GEMINI_PROJECT_DIR
}

$lintOutput = pnpm lint 2>&1 | Out-String
if ($lintOutput) { [Console]::Error.WriteLine($lintOutput.TrimEnd()) }
$lintExit = $LASTEXITCODE

if ($lintExit -ne 0) {
  '{"decision":"deny","reason":"pnpm lint failed","systemMessage":"pnpm lint failed. Fix lint errors first."}'
  exit 0
}

$tscOutput = pnpm tsc --noEmit 2>&1 | Out-String
if ($tscOutput) { [Console]::Error.WriteLine($tscOutput.TrimEnd()) }
$tscExit = $LASTEXITCODE

if ($tscExit -ne 0) {
  '{"decision":"deny","reason":"pnpm tsc --noEmit failed","systemMessage":"TypeScript check failed. Fix type errors."}'
  exit 0
}

'{"decision":"allow","systemMessage":"lint and tsc passed"}'
exit 0