push:
	git push -u origin master

icon:
	convert public/images/favicon.png -define icon:auto-resize public/images/favicon.ico

program:
	coffee -c -b public/javascripts/gear.coffee

mac:
	electron-packager ./app serencast --overwrite --platform=darwin --arch=x64 --electronVersion=0.36.1

windows:
	electron-packager ./app serencast --overwrite --platform=win32 --arch=x64 --electronVersion=0.36.1
zip: windows
	zip -r serencast.zip serencast-win32-x64

run:
	bundle exec /home/tmasui/.rbenv/shims/ruby serencast.rb -p 3000
#	bundle exec /usr/local/opt/ruby/bin/ruby serencast.rb
