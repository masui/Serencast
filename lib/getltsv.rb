# -*- coding: utf-8 -*-

require 'net/http'
require 'uri'

require 'json'

def getltsv(url)
  root = {}
  parents = []
  parents[0] = root


  uri = URI.parse(url)
  res = Net::HTTP.get_response(uri)

  res.body.split(/\n/).each { |line|
    line.chomp!
    next if line =~ /^\s*$/m
    next if line =~ /^#/m
 
    line.sub!(/^(\s*)/,'')
    indent = $&.length

    node = {}
    parents[indent+1] = node
    parents[indent]['children'] = [] if parents[indent]['children'].nil?

    parents[indent]['children'] << node
    line.split(/\t/).each { |entry|
      entry =~ /^([a-zA-Z_]+):(\s*)(.*)$/
      node[$1.force_encoding("utf-8")] = $3.force_encoding("utf-8")
      # node[$1] = $3
    }
  }

  root
end

if $0 == __FILE__
  puts getltsv("http://video.masuilab.org/gear.ltsv").to_json
end
