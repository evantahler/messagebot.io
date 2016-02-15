# MessageBot.io (the website)

## Do not publish to the `gh-pages` branch directly.  Make any changes in a PR to master.

This project contains the build files for `messagebot.io` (which are served by github-pages)

We use [Middleman](https://middlemanapp.com/) to build and compile this site, and host it for free on [Github Pages](http://pages.github.com/). Pages can be written in markdown or HTML, and Middleman will build the site.

## Run the site locally:

- install ruby (comes with OSX)
- install bundler: `gem install bundler`
- use bundler to install the needed gems `bundle install`
- run the middleman servers locally `bundle exec middleman`

## Deploy the code

Open a pull requset to the `master` branch with your changes in the `site` folder.  

From there, we'll build the `gh-pages` branch out of master (see `deploy.sh` in this directory), and deploy the site.  GitHub pages will automatically build the site for us upon push.

## Thanks

- The theme for the home section of the site comes from: http://startbootstrap.com/grayscale
- The theme for the docs section of the site comes from: https://github.com/tripit/slate
