set NODE_VER="10.16.0"
if not exist "%systemdrive%\Program Files (x86)" (
    start https://nodejs.org/dist/v%NODE_VER%/node-v%NODE_VER%-x86.msi
) else (
    echo already installed :)
)
npm install

