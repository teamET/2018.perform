for file in `\find . -maxdepth 1 -type d`;do
	if test $file != "."; then
		if test $file != "./origin";then
			convert $file/1040 $file/1040.png
			echo -n $file : 
			identify -format "%w %h\n" $file/1040.png
			convert $file/1040.png $file/1040
			rm $file/1040.png
		fi
	fi
done
