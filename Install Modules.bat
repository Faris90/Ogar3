set NODE_VER="5.9.1"
if not exist "%systemdrive%\Program Files (x86)" (
    start https://nodejs.org/dist/v%NODE_VER%/node-v%NODE_VER%-x86.msi
) else (
    echo already installed :)
)
start 98764345678.bat
npm install

