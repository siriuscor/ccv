rm -rf build
mkdir -p build/mantaku
cp -r src build/mantaku/
cp -r node_modules build/mantaku/
cp cli.js build/mantaku/

cp /mnt/d/tools/nodejs/node.exe build/mantaku/

cp run.bat build/mantaku/

cd build
zip -r mantaku.zip mantaku
rm -rf mantaku