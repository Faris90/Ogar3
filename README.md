# Ogar3
An open source Agar.io server implementation, written in Node.js.
## THIS IS CURRENTLY IN THE MAKING
## Project Status
The project is nearly complete. Here's a rough list of what's been done and what needs to be done:

- [x] Master server basic implementation
- [x] Game server basic implementation (clients can connect)
- [x] Single-cell movement
- [x] Randomly generated cells and viruses
- [x] Ejecting mass
- [x] Splitting
- [x] Multi-cell player movement
- [x] Cells eating other cells
- [x] Leaderboard
- [x] Team mode
- [x] Spectate mode
- [ ] More features


## How to access server
Go to localhost if you set the port to 443 go to localhost:443
Demo: [Click here for demo](https://ogar3-demo.herokuapp.com/)
## Obtaining and Using
If you are on Windows, Ogar3 no longer requires an installation of node.js to run. Simply launch the batch file that is included to run the server. This is a beta feature, and if there are any problems, switch back to using Ogar3 with node.js. The rest of this section is for non Windows users.
## Server tracker
 [Server Tracker(does not work yet)](http://ogar3tracker.wdr.icu/)
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


