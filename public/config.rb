require 'compass/import-once/activate'
require 'susy'
require 'compass-normalize'
require 'font-awesome-sass'
# Require any additional compass plugins here.

# Set this to the root of your project when deployed:
http_path = "/"
css_dir = "css"
sass_dir = "sass"
images_dir = "images"
javascripts_dir = "js"
relative_assets = true
line_comments = false
enable_sourcemaps = true
sass_options = {:sourcemap => false}
#output_style = :compact
output_style = :compressed

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed

# To enable relative paths to assets via compass helper functions. Uncomment:


# To disable debugging comments that display the original location of your selectors. Uncomment:



# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass
