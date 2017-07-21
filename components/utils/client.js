require('isomorphic-fetch') // ensure fech is in-scope, even on the server

const hosts = {
  development: 'http://localhost:8080',
  production: 'https://api.messagebot.io'
}

export default class Client {
  constructor () {
    if (process && process.title === 'node') {
      // no caching API requests
    } else {
      window.MESSAGEBOT = window.MESSAGEBOT || {}
      if (!window.MESSAGEBOT.CLIENT) { window.MESSAGEBOT.CLIENT = {storage: {}} }
      this.storage = window.MESSAGEBOT.CLIENT.storage
    }
  }

  apiEndpoint () {
    if (process && process.title === 'node') {
      if (process.env.NODE_ENV === 'production') { return hosts.production }
      return hosts.development
    } else {
      let parts = window.location.host.split('.')
      if (parts[0] === 'www') {
        parts.shift()
        return hosts.production
      } else {
        return hosts.development
      }
    }
  }

  set (k, v) {
    if (this.storage) {
      this.storage[k] = v
    }
  }

  get (k) {
    if (this.storage) {
      return this.storage[k]
    }
  }

  del (k) {
    if (this.storage) {
      delete this.storage[k]
    }
  }

  actionPromise (data, path, verb) {
    let self = this

    return new Promise(function (resolve, reject) {
      self.action(data, path, verb, (response) => {
        return resolve(response)
      }, (error) => {
        reject(error)
      })
    })
  }

  action (data, path, verb, successCallback, errorCallback) {
    let i

    if (typeof successCallback !== 'function') {
      successCallback = (response) => {
        let successMessage = 'OK!'
        if (response.message) { successMessage = response.message }
        if (window) { window.alert(successMessage) }
      }
    }

    if (typeof errorCallback !== 'function') {
      errorCallback = (errorMessage, error) => {
        console.error(error)
      }
    }

    for (i in data) {
      if (data[i] === null || data[i] === undefined) { delete data[i] }
    }

    let options = {
      credentials: 'include',
      method: verb,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }

    if (data.locale) {
      options.headers['locale'] = data.locale
    }

    if (Object.keys(data).length > 0 && (verb.toUpperCase() === 'GET') && path.indexOf('?') < 0) {
      path += '?'
      for (i in data) {
        if (data[i]) {
          path += i + '=' + data[i] + '&'
        }
      }
    }

    if (verb.toUpperCase() === 'GET') {
      //
    } else if (data.file) {
      delete options.headers
      options.body = new FormData()
      for (i in data) {
        if (data[i]) {
          options.body.append(i, data[i])
        }
      }
    } else {
      options.body = JSON.stringify(data)
    }

    function parseJSON (response) {
      return response.json()
    }

    fetch(this.apiEndpoint() + path, options).then(parseJSON).then((response) => {
      if (response.error) { return errorCallback(response.error) }
      return successCallback(response)
    }).catch((error) => {
      if (error) { return errorCallback(error.toString(), error) }
    })
  }
}
