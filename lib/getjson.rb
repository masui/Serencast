# -*- coding: utf-8 -*-
# -*- ruby -*-
#
# ScrapboxデータをJSONに変換
#

# $:.unshift File.dirname(__FILE__)

require 'net/https'
require 'uri'
require 'json'

require 'getltsv'
require 'getrss'
require 'getatom'
require 'getbookmarks'

def _getjson(project,page)
  if page == "__bookmarks" then
    return getbookmarks(project)
  end

  uri = URI.parse("https://scrapbox.io/api/pages/#{project}/#{URI.encode(page)}/text")

  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true  # ************************
  http.verify_mode = OpenSSL::SSL::VERIFY_NONE

  req = Net::HTTP::Get.new(uri.path)
  res = http.request(req)

  root = {}
  root['children'] = []
  root['title'] = 'root'
  parents = []
  parents[0] = root
  
  a = res.body.split(/\n/)
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
    
    if line =~ /^\[\/([^\/]*)\/([^\/]*)\]/ # 別のScrapboxデータ
      c = _getjson($1,$2)
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
        elsif url =~ /\.rdf$/ || url =~ /\/(rss|feed)/ || url =~ /(rss|feed)\// then
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
  
def getjson(project,page)
  _getjson(project,page)['children'].to_json
end

if __FILE__ == $0 then
  # puts getjson('karin-bookmarks','__bookmarks').to_json
  puts getjson('nikezonoCast','Masterpiece').to_json
end
