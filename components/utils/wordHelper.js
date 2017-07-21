const WordHelper = {
  singleize: function (word) {
    word = word.toLowerCase()
    if (word === 'people') { return 'person' }
    if (word === 'messages') { return 'message' }
    if (word === 'events') { return 'event' }
    return word
  },

  pluralize: function (word) {
    word = word.toLowerCase()
    if (word === 'person') { return 'people' }
    if (word === 'message') { return 'messages' }
    if (word === 'event') { return 'events' }
    return word
  },

  titleize: function (phrase) {
    let words = phrase.split(' ')
    let i = 0

    while (i < words.length) {
      if (words[i] && words[i].length > 0) {
        let newWord = ''
        let j = 0
        while (j < words[i].length) {
          if (j === 0) {
            newWord += words[i][j].toUpperCase()
          } else {
            newWord += words[i][j].toLowerCase()
          }
          j++
        }
        words[i] = newWord
      }
      i++
    }

    return words.join(' ')
  },

  sentanceize: function (sentance) {
    sentance = sentance[0].toUpperCase() + sentance.substring(1)
    let end = sentance[(sentance.length - 1)]
    if (['.', '!'].indexOf(end) < 0) {
      sentance += '.'
    }

    return sentance
  }

  // routeQueryToParams: function (query) {
  //   const topLevelSearchTerms = [
  //     'type',
  //     'personGuid',
  //     'messageGuid',
  //     'eventGuid',
  //     'guid',
  //     'type',
  //     'createdAt',
  //     'updatedAt',
  //     'campaignId',
  //     'sentAt',
  //     'openedAt',
  //     'actedAt',
  //     'transport'
  //   ]
  //
  //   let searchKeys = []
  //   let searchValues = []
  //   const parts = query.split(' ')
  //   parts.forEach(function (part) {
  //     if (part !== '') {
  //       let words = part.split(':')
  //       if (topLevelSearchTerms.indexOf(words[0]) >= 0) {
  //         searchKeys.push(words[0])
  //       } else {
  //         searchKeys.push('data.' + words[0])
  //       }
  //       searchValues.push(words[1])
  //     }
  //   })
  //
  //   return [searchKeys, searchValues]
  // }
}

export default WordHelper
