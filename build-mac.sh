rm -rf build
DEST=build/mantaku
mkdir -p $DEST

npx esbuild cli.js --bundle --platform=node --outfile=$DEST/cli.js --minify --external:webp-converter

#copy assets
cp -r src/sites $DEST/
cp src/easylist.txt $DEST/

#copy sharp dep
mkdir $DEST/node_modules
# cp -r node_modules/sharp $DEST/node_modules/
# cp -r node_modules/@img $DEST/node_modules/
cp -r node_modules/webp-converter $DEST/node_modules/
cp -r node_modules/uuid $DEST/node_modules/

#copy node executable
cp `which node` $DEST/

osacompile -o $DEST/run.app run.scpt
cp run $DEST/

cd build
zip -r mantaku-v1.0.2-darwin.zip mantaku
rm -rf mantaku