# -*- coding: utf-8 -*-

require 'net/https'
require 'uri'
require 'json'

require 'get'

def gethistory(project,title="Bookmarks")
  res = get("https://scrapbox.io/api/pages/#{project}?limit=1000")
  return unless res
  pagelist = JSON.parse(res)

  pagelist['pages'].each { |page|
    page['descriptions'].each { |desc|
      if desc =~ /^(\d+)\/(\d+)\/(\d+)$/ then
        page['updated'] = Time.new($1,$2,$3).to_i
      end
    }
  }

  curyear = 0
  curmonth = 0
  curday = 0
  
  root = {}
  root['title'] = title # "Bookmarks"
  root['children'] = []

  rootroot = {}
  rootroot['title'] = title # "Bookmarks"
  rootroot['children'] = [root]

  yeardata = {}
  monthdata = {}
  daydata = {}

  pages = pagelist['pages'].sort { |x, y|
    y['updated'] <=> x['updated']
  }

  pages.each { |page|
    t = Time.at(page['updated'])
    year = t.year
    month = t.month
    day = t.day
    if year != curyear then
      yeardata = {}
      yeardata['title'] = year
      yeardata['children'] = []
      root['children'] << yeardata
      curyear = year
      curmonth = 0
      curday = 0
    end
    if month != curmonth then
      monthdata = {}
      monthdata['title'] = "#{month}月"
      monthdata['children'] = []
      yeardata['children'] << monthdata
      curmonth = month
      curday = 0
    end
    if day != curday then
      daydata = {}
      daydata['title'] = "#{month}/#{day}"
      daydata['children'] = []
      monthdata['children'] << daydata
      curday = day
    end
    entry = {}
    desc = page['descriptions'][0].to_s
    desc.sub!(/^\[/,'')
    desc.sub!(/\]$/,'')
    if desc !~ /^\s*$/ then
      a = desc.split(/\s/)
      if a.length == 1 then
        entry['title'] = page['title'].force_encoding("utf-8")
        entry['url'] = a[0]
      else
        if a[0] =~ /http/ then
          entry['title'] = a[1..a.length-1].join(' ').force_encoding("utf-8")
          entry['url'] = a[0]
        elsif a[a.length-1] =~ /http/
          entry['title'] = a[0..a.length-2].join(' ').force_encoding("utf-8")
          entry['url'] = a[a.length-1]
        end
      end
      daydata['children'] << entry
    end
  }
  rootroot
end

if $0 == __FILE__ then
  # puts gethistory("masui-bookmarks").to_json
  puts gethistory("Jazz").to_json
end
