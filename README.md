# Ogar3
An open source Agar.io server implementation, based on Jaralowell's [Ogarserv](https://github.com/JaraLowell/OgarServ/releases/tag/1.5.9) & [Cigar](https://github.com/CigarProject/Cigar)

## Want old version?
[Here you go!](https://github.com/Faris90/Ogar3/tree/old-ogar3)
## Project Status
The [Server Tracker](https://ogar3tracker.faris90.repl.co/) is down


## How to access server
Go to localhost if you set the port to 80 go to localhost:80
## Demos
[Render](https://ogar3-demo.onrender.com/)
[Agar.dob.jp](http://agar.dob.jp)
## Obtaining and Using
## Server tracker
 [Server Tracker](http://ogar3tracker.wdr.icu/)
 ## Info
As Ogar3 is written in Node.js, you must have Node.js and its "ws" module installed to use it (Unless you are on Windows). You can usually download Node using your distribution's package manager (for *nix-like systems), or from [the Node website](http://nodejs.org). To install the "ws" module that is required, open up your system command line (cmd for windows, terminal for mac) and type "npm install ws".

Although Ogar3 allows you to run both the Agar.io master server and game server separately, it's currently recommended that you run both servers together until the master server is more implemented. Alternatively, you could run the game server only, and use a client-side mod to connect to the IP address of the server.

```sh
~$ git clone git:github.com/Faris90/Ogar3.git Ogar3
~$ npm install ./Ogar3	
~$ npm start
```

Currently, Ogar3 listens on this port(for now):
* *:80 - for the game server


Please note that on some systems, you may have to run the process as root or otherwise elevate your privileges to allow the process to listen on the needed ports.

## Configuring Ogar3
Use gameserver.ini in src to modify Ogar3's configurations field.


