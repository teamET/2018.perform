source ~/.bashrc

curl -X POST --data-urlencode "payload={\"channel\": \"#bot\", \"username\": \"webhookbot\", \"text\": \"This is posted to #bot and comes from a bot named webhookbot. `$(whoami)@$(hostname -I|cut -f1 -d' ')`\n\`$(pwd)\`\n\`\`\`$(ls -al)\`\`\`\", \"icon_emoji\": \":sunglasses:\"}" $WEBHOOK_URL

# hexo
#cd static && hexo generate && ln -s public /var/www/public

# bot
#cd bot&& npm install && ln -s files /var/www/api/files && forever bot.js
