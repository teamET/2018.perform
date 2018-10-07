#line messaging api のイメージマップ用画像幅と高さを示す。
#./dir/filename/1040のようなディレクトリ構造で有効
for dir in `\find . -maxdepth 1 -type d`;do
	if test $dir != "."; then
		cd $dir
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
		cd ..
	fi
done
