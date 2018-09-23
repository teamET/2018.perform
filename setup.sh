
# hexo
cd static && hexo generate && ln -s public /var/www/public

# bot
cd bot&& npm install && ln -s files /var/www/api/files && forever bot.js
