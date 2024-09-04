rm -rf build
DEST=build/mantaku
mkdir -p $DEST

npx esbuild cli.js --bundle --platform=node --outfile=$DEST/cli.js --minify

#copy assets
cp -r src/sites $DEST/
cp src/easylist.txt $DEST/

#copy node executable
cp `which node` $DEST/

# osacompile -o build/run.app run.scpt
cp run $DEST/

cd build
zip -r mantaku-v1.0.0-darwin.zip mantaku
rm -rf mantaku