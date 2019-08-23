# www.messagebot.io

[![Greenkeeper badge](https://badges.greenkeeper.io/messagebot/messagebot-www.svg)](https://greenkeeper.io/)

[![CircleCI](https://circleci.com/gh/messagebot/messagebot-www.svg?style=svg)](https://circleci.com/gh/messagebot/messagebot-www)

## Install
This is a [React Project](https://facebook.github.io/react/) utilizing [next.js](https://github.com/zeit/next.js/) and [react-bootstrap](https://react-bootstrap.github.io/)

- `npm install`

## Running in Development
- `npm run dev`

## Building for Production

- `npm run build`
- `npm start`

The master branch of this repository is automatically deployed by circle.ci on a successful test run to www.messagebot.io.

## Linting

We use [standard.js](https://standardjs.com) to manage our lint rules.  We run `standard` as part of our test suite, and your contributions must pass.  Standard is *very* opinionated and inflexible such that we cannot inject our own opinions.  There are no eslint/jshint files to manage in this project.

## CSS
- we use a default boostrap CSS file
- all components provide thier own CSS inline
