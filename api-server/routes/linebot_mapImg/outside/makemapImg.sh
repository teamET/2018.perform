#imagemapの読み込みよう画像を生成する
mkdir origin
for file in *.png; do
	filename=( `echo $file | tr -s '.' ' '` )
	mkdir ${filename[0]}
	convert $file -resize 240x ${filename[0]}/240
	convert $file -resize 300x ${filename[0]}/300
	convert $file -resize 460x ${filename[0]}/460
	convert $file -resize 700x ${filename[0]}/700
	convert $file -resize 1040x ${filename[0]}/1040
	mv ${filename[0]}.${filename[1]} origin
done
