require 'zillabyte'
require 'aws-sdk'
require 'open-uri'
require "base64"

comp = Zillabyte.component("web_screenshots")

# Declare the schema for inputs to the component
input_stream = comp.inputs do
  name "web_pages"
  field "url", :string
end

# Extract screenshot
image_stream = input_stream.each do |tuple|

  url = tuple['url']

  begin

    # Use casperjs to actually take the screenshot
    id = rand(10000000)
    Timeout::timeout(30) do 
      File.delete("match_#{id}.png") if File.exists?("match_#{id}.png")
      results = `casperjs screenshot.js #{id} #{url}`
    end

    # Upload screenshot to S3
    if File.exists?("match_#{id}.png")

      uri = URI.parse(url)
      bytes = File.read("match_#{id}.png")

      # Binary types are currently unsupoorted; so convert binary to b64
      b64 = Base64.encode64(bytes)
      
      # Emit
      emit :png_image_b64 => b64, :url => url
      log "screenshot taken: #{url}"
      
      # Cleanup
      File.delete("match_#{id}.png")

    else
      log "screenshot not taken: #{url}"
    end
    
  rescue Timeout::Error => e
    log "timeout for: #{url}"
  rescue => e
    log "error #{e.message}"
  end

end

# Declare the output schema for the component
image_stream.outputs do
  name "web_page_screenshots"
  field "url", :string
  field "png_image_b64", :string
end
