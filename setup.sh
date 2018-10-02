set -ex
source /root/.bash_profile
hexo --version
npm --version
node --version

# hexo
cd /root/2018.perform/static
npm install --save hexo-cli
hexo generate --force --bail
cp -rf ./public/* /var/www/public
echo "{'test':'test'}" > /var/www/public/data/test.json  #/var/www/public/data should be directory

# bot
cd /root/2018.perform/bot
npm install
if [[ forever list |grep bot.js ]] ; then
    forever restart --minUptime 1000 --spinSleepTime 1000 /root/2018.perform/bot/bot.js
else
    forever restart --minUptime 1000 --spinSleepTime 1000 /root/2018.perform/bot/bot.js
fi

#api-server
cd /root/2018.perform/api-server
npm install
if [[ forever list |grep api-server ]] ; then
    forever restart --minUptime 1000 --spinSleepTime 1000 /root/2018.perform/api-server/bin/www
else
    forever start --minUptime 1000 --spinSleepTime 1000 /root/2018.perform/api-server/bin/www
fi




curl -X POST --data-urlencode "payload={\"channel\": \"#bot\", \"username\": \"webhookbot\", \"text\": \"This is posted to #bot and comes from a bot named webhookbot.\n http://$(hostname -I|cut -f1 -d' ')\n \`$(whoami)@$(hostname -I|cut -f1 -d' ')\`\n\", \"icon_emoji\": \":sunglasses:\"}" $WEBHOOK_URL

curl -X POST --data-urlencode "payload={\"channel\": \"#server_log\", \"username\": \"webhookbot\", \"text\": \"\`\`\`$(cd /var/www/public ;find .|sort)\`\`\`\", \"icon_emoji\": \":sunglasses:\"}" $WEBHOOK_URL

