#!/bin/bash
if sudo -v | grep -qw "Sorry"; then
    echo "Testing if '$USER' can use 'sudo': passed!"
else
    echo "Testing if '$USER' can use 'sudo': FAILED!"
    echo "Cannot proceed! Please google 'adding user to sudoers'"
    exit 1
fi

echo "Setting up Ogar Unlimited, you will be asked for you sudo password."

mkdir plugins

sudo setcap 'cap_net_bind_service=+ep' /usr/bin/node
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=443/udp
sudo firewall-cmd --permanent --add-port=88/tcp
sudo firewall-cmd --permanent --add-port=88/udp
#sudo firewall-cmd --permanent --add-port=88/tcp
#sudo firewall-cmd --permanent --add-port=88/udp
sudo firewall-cmd --reload

cd ..
echo "Installing n which is a tool to update node..."
sudo npm install n -G       # install n which is used to set node to stable
echo "Setting node to the current stable version..."
sudo n 5.9.0               # set node to stable
echo "Installing dependencies..."
npm install                 # install all modules
echo "Ogar Unlimited is ready to run!"
echo "To start Ogar Unlimited type: ./start.sh"

