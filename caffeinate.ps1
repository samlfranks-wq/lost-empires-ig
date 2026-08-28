# Keeps Windows awake (and the display on) so the hourly "IG Publisher Queue"
# task can actually fire. Does NOT change any power settings - it asserts a
# temporary execution-state request that dies with this process.
#
#   powershell -ExecutionPolicy Bypass -File caffeinate.ps1 -UntilHour 21
#   powershell -ExecutionPolicy Bypass -File caffeinate.ps1 -Until "2026-08-28 19:00"
#   powershell -ExecutionPolicy Bypass -File caffeinate.ps1 -UntilDay Friday
#
# Stop early: close the window, or Stop-Process on the pid.
#
# Runs longer than 12h release the DISPLAY hold and keep only the system awake.
# The publisher queue needs the machine on, not the screen lit - holding the
# panel on for days is pointless wear and heat. Override with -KeepDisplay.
#
# ASCII ONLY in this file. PowerShell 5.1 reads .ps1 as ANSI, so a UTF-8
# em-dash silently corrupts the surrounding string and breaks parsing.

param(
  [int]$UntilHour = 21,
  [string]$Until,        # explicit end, e.g. "2026-08-28 19:00"
  [string]$UntilDay,     # day name, e.g. Friday - uses -UntilHour for the time
  [switch]$KeepDisplay   # force the display hold even on a long run
)

Add-Type -Name Power -Namespace Win32 -MemberDefinition @'
[DllImport("kernel32.dll", SetLastError = true)]
public static extern uint SetThreadExecutionState(uint esFlags);
'@

# Decimal, not hex strings - PowerShell 5.1 cannot cast "0x80000000" to uint32.
$ES_CONTINUOUS       = [uint32]2147483648  # 0x80000000
$ES_SYSTEM_REQUIRED  = [uint32]1           # 0x00000001
$ES_DISPLAY_REQUIRED = [uint32]2           # 0x00000002

if ($Until) {
  $endAt = [datetime]::Parse($Until)
}
elseif ($UntilDay) {
  $target = [System.DayOfWeek]$UntilDay
  $endAt  = (Get-Date).Date.AddHours($UntilHour)
  # Walk forward to the next matching weekday. If today matches but the hour
  # has already passed, this rolls to the same day next week - which is what
  # "keep it awake until Friday" means when asked on a Friday evening.
  while ($endAt.DayOfWeek -ne $target -or $endAt -lt (Get-Date)) {
    $endAt = $endAt.AddDays(1)
  }
}
else {
  $endAt = (Get-Date).Date.AddHours($UntilHour)
  if ($endAt -lt (Get-Date)) { $endAt = $endAt.AddDays(1) }
}

$hours = [math]::Round(($endAt - (Get-Date)).TotalHours, 1)
$holdDisplay = $KeepDisplay -or ($hours -le 12)

$flags = $ES_CONTINUOUS -bor $ES_SYSTEM_REQUIRED
if ($holdDisplay) { $flags = $flags -bor $ES_DISPLAY_REQUIRED }

$what = if ($holdDisplay) { "Sleep and display-off suppressed" } else { "Sleep suppressed (display free to turn off)" }
Write-Output "Caffeinated. $what until $endAt  [$hours h]"

try {
  while ((Get-Date) -lt $endAt) {
    [Win32.Power]::SetThreadExecutionState($flags) | Out-Null
    Start-Sleep -Seconds 50
  }
}
finally {
  # Hand control back to the normal power policy no matter how we exit.
  [Win32.Power]::SetThreadExecutionState($ES_CONTINUOUS) | Out-Null
  Write-Output "Decaffeinated - normal power settings restored."
}
