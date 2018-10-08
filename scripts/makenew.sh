echo your user name is $1 right? [Y/n]
read ANS

case $ANS in
	"" | "Y" | "y" | "yes") echo ok,command continue;;
	* ) echo exit && exit;
esac

useradd $1 
mkdir /home/$1
sudo usermod $1 -d /home/$1 -g $1 -G $1,root,sudo
chown $1 /home/$1
chsh $1 -s /bin/bash

ls -l /home/
groups $1

