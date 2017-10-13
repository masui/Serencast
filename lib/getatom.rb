#!/usr/bin/env ruby
# -*- coding: utf-8 -*-
# -*- ruby -*-
#

require 'rss'
require 'open-uri'
require 'hpricot'

#
# 取得したフィードを配列で返す。
# フィードが無い場合は空配列を返す。
# 指定したURLが無効な場合はnilを返す。
#

require 'feed-normalizer'

def process_atom(rss,a)
  content = ''
  open(rss){ |f|
    content = f.read
  }

  rss = FeedNormalizer::FeedNormalizer.parse(content)
  rss.entries.map do |item|
    obj = {}
    obj['url'] = item.url.to_s.force_encoding("utf-8")
    obj['title'] = item.title.to_s.force_encoding("utf-8")
    a << obj
  end
end

def getatom(title,url)
  o = {}
  o['title'] = title
  o['children'] = []
  process_atom(url,o['children'])
  o
end

if $0 == __FILE__ then
  require 'json'
  puts getatom('hondana','http://hondana.org/atom.xml').to_json
end

