source /root/.bash_profile
hexo --version
npm --version
node --version

# hexo
cd /root/2018.perform/static
hexo --version
npm install --save hexo-cli
hexo generate
cp -rf ./public/* /var/www/public
mkdir /var/www/public/data
echo "{'test':'test'}" > /var/www/public/data/test.json

# bot
cd /root/2018.perform/bot
npm install

curl -X POST --data-urlencode "payload={\"channel\": \"#bot\", \"username\": \"webhookbot\", \"text\": \"This is posted to #bot and comes from a bot named webhookbot.\n http://$(hostname -I|cut -f1 -d' ')\n \`$(whoami)@$(hostname -I|cut -f1 -d' ')\`\n\`$(pwd)\`\n\", \"icon_emoji\": \":sunglasses:\"}" $WEBHOOK_URL

curl -X POST --data-urlencode "payload={\"channel\": \"#server_log\", \"username\": \"webhookbot\", \"text\": \"\`\`\`$(cd /var/www/public ;find .)\`\`\`\", \"icon_emoji\": \":sunglasses:\"}" $WEBHOOK_URL

