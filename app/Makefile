program:
	coffee -c -b javascripts/gear.coffee

mac: program
	- cd ..; /bin/rm -r -f serencast-darwin-x64
	cd ..; make mac
#	mv ../serencast-darwin-x64 .

run: program
	electron .
