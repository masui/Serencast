# -- macicon_mk.sh --
# src file name 1024x1024.png
srcFile="serencast.png"
 
# dest directory name
iconFlder=serencast.iconset
destDir="./$iconFlder/"
 
# create dest directory
mkdir $destDir
 
# ====================
iconsize='
1024x1024
512x512
512x512
256x256
256x256
128x128
64x64
32x32
32x32
16x16
'
dst_name='
icon_512x512@2x 
icon_512x512
icon_256x256@2x
icon_256x256 
icon_128x128@2x 
icon_128x128 
icon_32x32@2x 
icon_32x32
icon_16x16@2x 
icon_16x16
'
## 配列に変換
array_text=(`echo $iconsize`)
array_dstname=(`echo $dst_name`)
 
## for文でくるくるする
for (( i = 0; i < ${#array_text[@]}; ++i ))
do
t1=${array_text[$i]}
t2=${array_dstname[$i]}
 
echo "### $t1 ---> $t2"
 
destFilePath=$destDir$t2".png"
echo "### $destFilePath"
 
convert -geometry  $t1! $srcFile $destFilePath
 
#convert -geometry  750x1334! $file $destFilePath
# t1=${array_text[$i]}
# t2=${array_text2[$i]}
# echo "### $t1 -> $t2"
 
done
 
# ====================
# フォルダから,iconset作成する
 iconutil -c icns $iconFlder
