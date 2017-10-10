# coding: utf-8
#
# Scrapboxテキスト取得
#

require 'net/https'
require 'uri'

def getsbdata(project,pagetitle)
  uri = URI.parse("https://scrapbox.io/api/pages/#{project}/#{URI.encode(pagetitle)}/text")

  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  http.verify_mode = OpenSSL::SSL::VERIFY_NONE

  req = Net::HTTP::Get.new(uri.path)
  res = http.request(req)

  a = res.body.split(/\n/)
  a.shift # 先頭のタイトルを除去
  result = []
  a.each { |line|
    next if line =~ /^\s*$/
    next if line =~ /^\s*#/
    # next unless line =~ /:/
    result << line
  }

  result
end

if $0 == __FILE__
  puts getsbdata('masui','test').join("\n")
end


