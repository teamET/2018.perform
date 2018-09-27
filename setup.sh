source ~/.bashrc
nvm use --lts

cd 2018.perform
curl -X POST --data-urlencode "payload={\"channel\": \"#bot\", \"username\": \"webhookbot\", \"text\": \"This is posted to #bot and comes from a bot named webhookbot.\n http://$(hostname -I|cut -f1 -d' ')\n \`$(whoami)@$(hostname -I|cut -f1 -d' ')\`\n\`$(pwd)\`\n\`\`\`$(ls -al)\`\`\`\", \"icon_emoji\": \":sunglasses:\"}" $WEBHOOK_URL

# hexo
cd static
hexo generate
#ln -s public /var/www/public

# bot
cd /root/2018.perform/bot
npm install
#ln -s data /var/www/public/data 
