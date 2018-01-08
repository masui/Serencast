# -*- coding: utf-8 -*-
# -*- ruby -*-
#

require 'net/http'
require 'uri'

require 'rss'
require 'open-uri'
require 'hpricot'

#
# 取得したフィードをオブジェクトで返す。
#

def getrss(title,url)
  content = ''
  begin
    open(url){ |f|
      content = f.read
    }
  rescue => e
  end

  rss = nil
  begin
    rss = RSS::Parser::parse(content)
  rescue RSS::InvalidRSSError
    rss = RSS::Parser::parse(content,false)
  end

  obj = {}
  obj['title'] = title
  obj['children'] = []

  if rss then
    rss.items.each { |u|
      next if u.title =~ /^PR:/ ||
      u.title =~ /^【PR】/ ||
      u.title =~ /^【広告特集】/ ||
      u.title =~ /^AD:/ ||
      u.title =~ /^\s*$/
      o = {}
      o['title'] = u.title
      o['url'] = u.link
      obj['children'] << o
    }
  else
    content.each_with_index { |line,i|
      while line.sub!(/<link>([^<]*)<\/link>/,'') do
        o = {}
        o['url'] = $1
        o['title'] = "記事#{i}"
        obj['children'] << o
      end
      while line.sub!(/<link.*href="(.*?)"/,'') do
        o = {}
        o['url'] = $1
        o['title'] = "記事#{i}"
        obj['children'] << o
      end
    }
  end

  obj
end

#def process_rss(rss,list)
#  content = ''
#  open(rss){ |f|
#    content = f.read
#  }
#      
#  rss = nil
#  begin
#    rss = RSS::Parser::parse(content)
#  rescue RSS::InvalidRSSError
#    rss = RSS::Parser::parse(content,false)
#  end
#  if rss then
#    rss.items.each { |u|
#      next if u.title =~ /^PR:/ ||
#      u.title =~ /^【PR】/ ||
#      u.title =~ /^【広告特集】/ ||
#      u.title =~ /^AD:/ ||
#      u.title =~ /^\s*$/
#      list << "url:#{u.link}\ttitle:#{u.title}"
#    }
#  else
#    content.each_with_index { |line,i|
#      while line.sub!(/<link>([^<]*)<\/link>/,'') do
#        list << "url:#{$1}\t記事#{i}"
#      end
#      while line.sub!(/<link.*href="(.*?)"/,'') do
#        list << "url:#{$1}\t記事#{i}"
#      end
#    }
#  end
#end
#
#def feeds(url)
#  list = []
#  begin
#    server = open(url)
#  rescue
#    return nil
#  end
#  links = Hpricot(server).search('link')
#  links.each { |link|
#    if link.attributes['type'] == 'application/rss+xml' ||
#        link.attributes['type'] == 'application/atom+xml' then
#      rss = link.attributes['href']
#      puts rss
#      if rss !~ /^http:/ then
#        if rss =~ /^\// then
#          url =~ /(http:\/\/[^\/]+)\//
#          rss = $1 + '/' + rss.sub(/^\//,'')
#        else
#          url.sub(/\/$/,'')
#          rss = url + '/' + rss.sub(/^\.\//,'')
#        end
#      end
#
#      process_rss(rss,list)
#
#      break
#    end
#  }
#  exit
#  return list
#end

if $0 == __FILE__
  require 'json'
  # puts getrss('asahi','http://www3.asahi.com/rss/index.rdf').to_json
  # puts getrss('hondana','http://hondana.org/atom.xml').to_json
  puts getrss('sasaken','https://rumors.kento.work/users/306/rss.rss').to_json
end


#  puts "title:ニュース"
#  getnews('朝日新聞','https://www.asahi.com/')
#  getnews('朝日新聞デジタル','https://headlines.yahoo.co.jp/rss/asahik-dom.xml',true)
#  # getnews('日本経済新聞','http://www.nikkei.com/')
#  # getnews('読売新聞','https://www.yomiuri.co.jp/')
#  getnews('毎日新聞','https://mainichi.jp/')
#  #getnews('産経新聞','https://sankei.jp.msn.com')
#  getnews('産経新聞','https://headlines.yahoo.co.jp/rss/san-dom.xml',true)
#  # getnews('ITmedia','http://www.itmedia.co.jp')
# ## #getnews('はてな人気記事','http://feeds.feedburner.com/hatena/b/hotentry',true)
# ## #getnews('はてな一般記事','http://b.hatena.ne.jp/hotentry.rss?mode=general',true)
