@echo off
set "commit=dir"
set /p "commit=Enter your commit comments: "
echo.commit is: %commit%
git add -A
git commit -m "%commit%"
git push origin master
REM echo.press any key or ^<CTRL+C^> to abort . . .
REM >nul pause
REM %command%