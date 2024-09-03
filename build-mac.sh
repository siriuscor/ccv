rm -rf build
mkdir build
cp -r src build/
cp -r node_modules build/
cp cli.js build/

cp `which node` build/

osacompile -o build/run.app run.scpt