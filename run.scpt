set scriptPath to POSIX path of (path to me as text)
set scriptDir to do shell script "dirname " & quoted form of scriptPath
tell application "Terminal"
    set font size of default settings to 20
    activate
    do script "cd " & quoted form of scriptDir & ";./node cli.js"
end tell