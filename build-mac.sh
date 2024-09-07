VERSION=`grep '"version"' package.json | sed 's/[^0-9.]*//g'`

rm -rf build
DEST=build/mantaku
mkdir -p $DEST

npx esbuild cli.js --bundle --platform=node --outfile=$DEST/cli.js \
    --external:webp-converter #--external:@lesjoursfr/html-to-epub

#patch epub
sed -i '_bak' 's#import_meta.url#"file://"+__dirname+"/node_modules/@lesjoursfr/html-to-epub/lib/index.js"#g' $DEST/cli.js
rm $DEST/cli.js_bak

#copy assets
cp -r src/sites $DEST/
cp src/easylist.txt $DEST/

echo $VERSION > $DEST/version

#copy sharp dep
mkdir $DEST/node_modules
# cp -r node_modules/sharp $DEST/node_modules/
# cp -r node_modules/@img $DEST/node_modules/
cp -r node_modules/@lesjoursfr $DEST/node_modules/
rm -rf $DEST/node_modules/@lesjoursfr/html-to-epub/tempDir
#'file://'+ __dirname + '/node_modules/@lesjoursfr/html-to-epub/lib/index.js'
# cd $DEST/node_modules/@lesjoursfr/html-to-epub
cp -r node_modules/webp-converter $DEST/node_modules/
cp -r node_modules/uuid $DEST/node_modules/

#copy node executable
cp `which node` $DEST/

osacompile -o $DEST/run.app run.scpt
cp run $DEST/

cd build
zip -r mantaku-v$VERSION-darwin.zip mantaku
rm -rf mantaku