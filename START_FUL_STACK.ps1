# Wrapper for a common typo: START_FUL_STACK.ps1 -> START_FULL_STACK.ps1
# Keep this file so older docs/shortcuts still work.

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
& (Join-Path $here 'START_FULL_STACK.ps1')
