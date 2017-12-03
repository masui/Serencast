# -*- coding: utf-8 -*-
# -*- ruby -*-
#
# Scrapboxデータを取得
#

# $:.unshift File.dirname(__FILE__)

require 'net/https'
require 'uri'
require 'json'

require 'getltsv'
require 'getrss'
require 'getatom'
require 'getbookmarks'

require 'get'

def _getscdata(project,page=nil)
  if page == "__bookmarks"
    return getbookmarks(project,"Bookmarks")
  end
  if page.to_s == ''
    s = get("https://scrapbox.io/api/code/#{project}/settings/config.rb")
    eval s if s

    dispname = project
    res = get("https://scrapbox.io/api/projects/#{project}")
    if res
      projinfo = JSON.parse(res)
      dispname = projinfo['displayName']
    end

    return getbookmarks(project,dispname)
  end

  root = {}
  root['children'] = []
  root['title'] = 'root'
  parents = []
  parents[0] = root

  res = get("https://scrapbox.io/api/pages/#{project}/#{URI.encode(page)}/text")
  a = res.split(/\n/)
  a.shift # 先頭のタイトルを除去
  a.each { |line|
    next if line =~ /^\s*$/
    next if line =~ /^\s*#/
    
    line.sub!(/^(\s*)/,'')
    indent = $&.length
    
    node = {}
    parents[indent+1] = node
    
    (0..indent).each { |i|
      unless parents[i] then
        parents[i] = {}
        parents[i]['children'] = []
        parents[i]['title'] = page
        if i > 0 then
          parents[i-1]['children'] << parents[i]
        end
      end
    }

    parents[indent]['children'] = [] if parents[indent]['children'].nil?
    
    if line =~ /^\[\/([^\/]*)\/?\]/ # 別のScrapboxデータ
      c = _getscdata($1)
      c['children'].each { |child|
        parents[indent]['children'] << child
      }
    elsif line =~ /^\[\/([^\/]*)\/([^\/]*)\]/ # 別のScrapboxデータ
      c = _getscdata($1,$2)
      c['children'].each { |child|
        # parents[indent]['children'] << c['children'][0]
        parents[indent]['children'] << child
      }
    else
      #parents[indent]['children'] << node
      if line =~ /^(\s*)\[(.*http.*)\](.*)$/ then # normal link to a content data
        head = $1
        content = $2
        tail = $3
        a = content.split(/ /)
        title = ''
        url = ''
        if a[0] =~ /http/ then
          title = a[1..a.length-1].join(' ').force_encoding("utf-8")
          url = a[0]
        elsif a[a.length-1] =~ /http/
          title = a[0..a.length-2].join(' ').force_encoding("utf-8")
          url = a[a.length-1]
        end

        if url =~ /atom.*\.xml/ then
          parents[indent]['children'] << getatom(title,url)
        elsif url =~ /\.rdf$/ || url =~ /\/(rss|feed)/ || url =~ /(rss|feed)\// || url =~ /queryfeed.net/i || url =~ /twitrss.me\/twitter_user_to_rss/ || url =~ /\.rss$/ then
          parents[indent]['children'] << getrss(title,url)
        elsif url =~ /\.ltsv$/ then
          # Get the LTSV data and convert it to an object 
          # e.g. http://video.masuilab.org/gear.ltsv
          ltsvdata = getltsv(url)
          d = {}
          d['title'] = title
          d['children'] = []
          ltsvdata['children'].each { |data|
            d['children'] << data
          }
          parents[indent]['children'] << d
        else
          node['title'] = title
          node['url'] = url
          parents[indent]['children'] << node
        end
      else
        line =~ /^(\s*)(.*)$/
        node['title'] = $2.force_encoding("utf-8")
        parents[indent]['children'] << node
      end
    end
  }

  return root
end
  
def getscdata(project,page=nil)
  _getscdata(project,page)['children']
end

if __FILE__ == $0 then
  # puts getscdata('karin-bookmarks','__bookmarks').to_json
  # puts getscdata('nikezonoCast','Masterpiece').to_json
  # puts getscdata('masui-bookmarks').to_json
  puts getscdata('MasuiCast','Bookmarks').to_json
end
