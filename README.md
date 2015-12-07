# www.messagebot.io

## Do not publish to the `gh-pages` branch directly.  Make any changes in a PR to master.

This folder contains the build files for www.messagebot.io (which are served by github-pages)

We use [Middleman](https://middlemanapp.com/) to build and compile this site, and host it for free on [Github Pages](http://pages.github.com/). Pages can be written in markdown or HTML, and Jekyll will build the site. 

There are two main parts of the site (and consequently 2 main layouts): `home` and `docs`.

You will need ruby installed locally and the `github-pages` gem

## Run the site locally:

- install ruby
- install bundler: `gem install bundler`
- use bundler to install the needed gems `bundle install`
- run the middleman servers locally `./site.sh` (`EXECJS_RUNTIME=Node bundle exec middleman`)

## Deploy the code

Open a pull requset to the `master` branch with your changes.  

From there, we'll build the `gh-pages` branch out of master (see `pubish.sh` in this directory), and deploy the site.  GitHub pages will automatically build the site for us uppon push.