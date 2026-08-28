' Launches run_queue.cmd with NO visible console window.
' Task Scheduler always shows a cmd window when the action is a .cmd/.bat,
' so the scheduled task points at this wrapper instead (via wscript.exe).
' 0 = hidden window, False = do not wait for it to finish.
Set sh = CreateObject("WScript.Shell")
here = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))
sh.Run """" & here & "run_queue.cmd""", 0, False
