To Install Ogar Unlimited, you need [Node.js](http://nodejs.org)

(To install Node.js for linux simply do this `curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodes` Then do this `sudo apt-get install -y build-essential`)

(You can install and use Ogar unlimited on windows very quickly. First click `InstallWebSocket.bat` in src. then wait (it takes awhile) then click `Start.bat` and your off! the next time you start the server, you only have to click `Start.bat`)

(If you want to control your server from different locations, use SSH)

First download the repository and unzip it or do `git clone https://github.com/AJS-development/Ogar-unlimited.git`

Then locate the folder `Ogar-unlimited/src` by using `cd [directorypath]` in commandprompt/terminal

Do `npm install` to install ws and request. Or you can do `npm install ws` and do `npm install request` (needed plugins)

Type in `sudo node index.js` It might require your password. (Note: this will not work if you are not using a root/administrator user)

Then connect by typing `agar.io/?ip=localhost:443`

If you want to connect with your friends, you need to port forward

(you can also host it for free using c9.io)

(Installation for Linux)
```
pi@andrewserver:~ $ git clone https://github.com/AJS-development/Ogar-unlimited.git
Cloning into 'Ogar-unlimited'...
remote: Counting objects: 7147, done.
remote: Compressing objects: 100% (66/66), done.
remote: Total 7147 (delta 45), reused 0 (delta 0), pack-reused 7081
Receiving objects: 100% (7147/7147), 1.10 MiB | 1.83 MiB/s, done.
Resolving deltas: 100% (5082/5082), done.
Checking connectivity... done.
pi@andrewserver:~ $ cd ~/Ogar-unlimited/src
pi@andrewserver:~/Ogar-unlimited/src $ npm install
Ogar@1.0.0 /home/pi/Ogar-unlimited
├─┬ request@2.69.0 
│ ├── aws-sign2@0.6.0 
│ ├─┬ aws4@1.3.2 
│ │ └─┬ lru-cache@4.0.0 
│ │   ├── pseudomap@1.0.2 
│ │   └── yallist@2.0.0 
│ ├─┬ bl@1.0.3 
│ │ └─┬ readable-stream@2.0.5 
│ │   ├── core-util-is@1.0.2 
│ │   ├── inherits@2.0.1 
│ │   ├── isarray@0.0.1 
│ │   ├── process-nextick-args@1.0.6 
│ │   ├── string_decoder@0.10.31 
│ │   └── util-deprecate@1.0.2 
│ ├── caseless@0.11.0 
│ ├─┬ combined-stream@1.0.5 
│ │ └── delayed-stream@1.0.0 
│ ├── extend@3.0.0 
│ ├── forever-agent@0.6.1 
│ ├─┬ form-data@1.0.0-rc3 
│ │ └── async@1.5.2 
│ ├─┬ har-validator@2.0.6 
│ │ ├─┬ chalk@1.1.1 
│ │ │ ├─┬ ansi-styles@2.2.0 
│ │ │ │ └── color-convert@1.0.0 
│ │ │ ├── escape-string-regexp@1.0.5 
│ │ │ ├─┬ has-ansi@2.0.0 
│ │ │ │ └── ansi-regex@2.0.0 
│ │ │ ├── strip-ansi@3.0.1 
│ │ │ └── supports-color@2.0.0 
│ │ ├─┬ commander@2.9.0 
│ │ │ └── graceful-readlink@1.0.1 
│ │ ├─┬ is-my-json-valid@2.13.1 
│ │ │ ├── generate-function@2.0.0 
│ │ │ ├─┬ generate-object-property@1.2.0 
│ │ │ │ └── is-property@1.0.2 
│ │ │ ├── jsonpointer@2.0.0 
│ │ │ └── xtend@4.0.1 
│ │ └─┬ pinkie-promise@2.0.0 
│ │   └── pinkie@2.0.4 
│ ├─┬ hawk@3.1.3 
│ │ ├── boom@2.10.1 
│ │ ├── cryptiles@2.0.5 
│ │ ├── hoek@2.16.3 
│ │ └── sntp@1.0.9 
│ ├─┬ http-signature@1.1.1 
│ │ ├── assert-plus@0.2.0 
│ │ ├─┬ jsprim@1.2.2 
│ │ │ ├── extsprintf@1.0.2 
│ │ │ ├── json-schema@0.2.2 
│ │ │ └── verror@1.3.6 
│ │ └─┬ sshpk@1.7.4 
│ │   ├── asn1@0.2.3 
│ │   ├─┬ dashdash@1.13.0 
│ │   │ └── assert-plus@1.0.0 
│ │   ├── ecc-jsbn@0.1.1 
│ │   ├── jodid25519@1.0.2 
│ │   ├── jsbn@0.1.0 
│ │   └── tweetnacl@0.14.1 
│ ├── is-typedarray@1.0.0 
│ ├── isstream@0.1.2 
│ ├── json-stringify-safe@5.0.1 
│ ├─┬ mime-types@2.1.10 
│ │ └── mime-db@1.22.0 
│ ├── node-uuid@1.4.7 
│ ├── oauth-sign@0.8.1 
│ ├── qs@6.0.2 
│ ├── stringstream@0.0.5 
│ ├── tough-cookie@2.2.1 
│ └── tunnel-agent@0.4.2 
└─┬ ws@1.0.1 
  ├── options@0.0.6 
  └── ultron@1.0.2 

npm WARN Ogar@1.0.0 license should be a valid SPDX license expression
pi@andrewserver:~/Ogar-unlimited/src $ sudo node index.js
                                        _ _       _              _ 
                                       | (_)     (_)_           | |
  ___   ____  ____  ____    _   _ ____ | |_ ____  _| |_  ____ _ | |
 / _ \ / _  |/ _  |/ ___)  | | | |  _ \| | |    \| |  _)/ _  ) || |
| |_| ( ( | ( ( | | |      | |_| | | | | | | | | | | |_( (/ ( (_| |
 \___/ \_|| |\_||_|_|       \____|_| |_|_|_|_|_|_|_|\___)____)____|
      (_____|                                                      
[Game] Ogar Unlimited - An open source Agar.io server implementation
[Game] By The AJS development team
[Game] Server version is 11.6.0
[Game] Loaded stats server on port 88
[Game] Listening on port 443
[Game] Current game mode is Free For All
>[Autopause] The Game Was Paused to save memory. Join the game to resume!
[Console] We recieved a world-wide message!: For those who updated before 11:00 eastern time, you should update again as I added more key features and fixed bugs. For those who didnt update. IT IS ENTIRELY RECCOMENDED TO DO SO AS IT ADDS KEY ANTI BOT MESURES, EVEN PREVENTING DAVIDMANN'S BOTS
```
