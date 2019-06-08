set NODE_VER="5.9.1"
if not exist "%systemdrive%\Program Files (x86)" (
    start https://nodejs.org/dist/v%NODE_VER%/node-v%NODE_VER%-x86.msi
) else (
    start https://nodejs.org/dist/v%NODE_VER%/node-v%NODE_VER%-x64.msi
)

npm install
npm install -g localtunnel
