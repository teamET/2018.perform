curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
source ~/.bashrc
if [[ $(nvm --version)  ]]; then
	nvm --version
else
	echo 'nvm not found'
	exit
fi

nvm install --lts
node --version
npm --version

npm install -g generator-keystone yo
mkdir workspace
cd workspace

