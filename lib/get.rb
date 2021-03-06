require 'net/https'
require 'uri'

def get(url)
  begin
    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    req = Net::HTTP::Get.new(uri.path)
    res = http.request(req)
    return nil unless res
    return res.body
  rescue
    return nil
  end
end

if __FILE__ == $0 then
  puts get("https://scrapbox.io/api/projects/Jazz")
end
