import { useState } from 'react'
import snoowrap from 'snoowrap'
import axios from 'axios'

const reddit = new snoowrap({
  userAgent: 'reddit comment scraper',
  clientId: 'EgPyrKLVLN_aqClKeznBiw',
  clientSecret: 'AUEBpPWEcqf_vCX4dOuBIZ5PpGGDwQ',
  refreshToken: '228218038382-uo6p6bzkhTAs684UboXHRHe_e1kqMQ'
});

async function getAccessToken() {
  var accessTokenConfig = {
    method: 'post',
    url: 'https://api.tdameritrade.com/v1/oauth2/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: 'grant_type=refresh_token&refresh_token=qA2TOp1%2FNOYapblrmEgZgWErKVmMuCPZ04ssyLqlQdUh5tad%2B0%2BatiOvzuaQK9gtNWu8a5HJwvxrRYCqbIs95Zex75HAjPeFCGX5%2FBAJiygalU6CuyRTmlAbbNteHPJiJEXXfw7bTtd1zm1tZY3uRBki4SpWUfmd3bxFw%2F3xVKkgiR%2BSzHALC1bSuHWR52XuU5qNFDpC4eJfdDRtZw7na5CZv3VxHfoMBQtA0UAAcCzOV2suckOfDejOBYAZMMrTdWHc%2FCrlASNzIpRHn0wZagG%2BvlO3j%2B2uo%2BGOq4VlwBYFwicKLWlKSHaXC77ni7ljtr1zdnv13NEoiDSafXpRAAcuDeRq2WI7EUGDJFbXiWuT3DVdi4J8YkwVEy2siRBdofwUJS%2Bad5nVIJwKceFMBeZCMNiMmo%2FKAX74yH7jcltnDv2iLySFBxL%2B0gF100MQuG4LYrgoVi%2FJHHvlx93%2F8xwIhYhVrMm8bF7bB26SqeagnEmNBNazRdfVro9M9FrE%2BoBqjKecscssfWrIb3YyM%2BV%2BWQQgc3TPgKh0UPGoC3hgdWPtzUrGfRW6sFvqLg8wZqmxhKaFqlL07Rt0G95PP%2BIrzpew8b6Ec3LbVUWXGjAYcsK2eS2vStM%2BIlT8N0yXh9OuphxAmtsOzVKZ4NqspEFZlb4hAuJeAZtDN%2F1AtioGyW392q382ofmFYrL6xqWBMl6hyp0ZezZ6MD7Mz9ma%2BNKpl9L59z5a75sKOMpNPKZvfynLDo1i5twZXP92QYxyk%2FNjHXS9qY5RkEwCtk7tdpkCs55Dpv7qEzS6WzisdVDrrSaSaBMryohcmTNUNWzDvYJxgpPvEw6psP60Oz8QN3c68E4lArdAc8wVVDN6Y71kyAPG0ETpZv5TxzZa53Dg%2Bfktj1rqwk%3D212FD3x19z9sWBHDJACbC00B75E&access_type=&code=&client_id=WG1FO4PYDJWWP91FFYNCFELNXQRPAJHM%40AMER.OAUTHAP&redirect_uri='
  };

  const response = await axios(accessTokenConfig)
  return "Bearer " + response.data.access_token
}

async function getUser() {
  const user = prompt("Input a user")
  const allComments = await reddit.getUser(user).getComments().map(Comment => Comment)
  let match = /\b([A-Z]){2,5}\b/g
  let matchDollarSign = /(?:^|\W)$(\w+)(?!\w)/g
  let matches = []
  let comments = []
  let dates = []
  let links = []
  for (let i = 0; i < allComments.length; i++) {
    let result = allComments[i].body.match(match || matchDollarSign)
    if (result) {
      matches.push(result)
      comments.push(allComments[i].body)
      dates.push((allComments[i].created_utc) * 1000)
      console.log()
      links.push("https://www.reddit.com" + allComments[i].permalink)
    }
  }
  let parsedDates = parseDates(dates)
  matches = matches.flat()
  let matchesObject = (await isSymbol(user, matches, comments, parsedDates, links))
  return matchesObject
}

async function isSymbol(user, matches, comments, dates, links) {
  let symbolMatches = []
  let commentMatches = []
  let dateMatches = []
  let linkMatches = []
  let prices = []
  for (let i = 0; i < matches.length; i++) { //check if each in matches is a valid symbol
    var content = {
      method: 'get',
      url: 'https://api.tdameritrade.com/v1/instruments?apikey=WG1FO4PYDJWWP91FFYNCFELNXQRPAJHM&symbol=' + matches[i] + '&projection=symbol-search',
      headers: {
        'Authorization': await getAccessToken()
      }
    };

    const response = await axios(content)
    if (Object.keys(response.data).length !== 0) {
      symbolMatches.push(matches[i])
      prices.push(await getCurrentPrice(matches[i]))
      commentMatches.push(comments[i])
      dateMatches.push(dates[i])
      linkMatches.push(links[i])
    }
  }
  symbolMatches.reverse()
  prices.reverse()
  commentMatches.reverse()
  dateMatches.reverse()
  linkMatches.reverse()

  return {
    user,
    symbolMatches,
    prices,
    commentMatches,
    dateMatches,
    linkMatches
  }
}


const parseDates = (dates) => {
  let parsedDates = []
  for (let i = 0; i < dates.length; i++) {
    let date = new Date(dates[i])
    parsedDates.push(date.toLocaleString('default', { month: 'short' }) + " " + date.getDate() +
      ", " + date.getFullYear())
  }
  return parsedDates
}

async function getCurrentPrice(symbol) {
  const quoteConfig = {
    method: 'get',
    url: 'https://api.tdameritrade.com/v1/marketdata/' + symbol + '/quotes?apikey=WG1FO4PYDJWWP91FFYNCFELNXQRPAJHM',
    headers: {
      Authorization: await getAccessToken()
    },
  };
  const response = await axios(quoteConfig)
  let price = (response.data[symbol].lastPrice).toFixed(2)
  let prefix = ""
  if (response.data[symbol].netChange > 0) prefix = "+"
  let percentChange = prefix + (response.data[symbol].markPercentChangeInDouble).toFixed(2) + "%"
  return {
    price,
    percentChange
  }
}

async function getHistoricPrice(symbol, date) {
  const quoteConfig = {
    
  }
} 

const Header = () => {
  return (
    <h1 className="header">
      <span id="user"></span>
    </h1>
  )
}

const Comments = () => {
  const [clicked, setClicked] = useState(false)
  const [comments, setComments] = useState([])

  if (!clicked) {
    setClicked(true)
    let commentElements = []
    getUser().then(userObject => {
      document.getElementById("user").innerHTML = userObject.user + " Latest Stock Mentions"
      for (let i = 0; i < userObject.commentMatches.length; i++) {
          let comment = (
            <div key={i} className="comment">
            <div className="commentDate">
              {userObject.dateMatches[i]}
            </div>
            <a className="commentBody" href={userObject.linkMatches[i]}>
              {userObject.commentMatches[i]}
            </a>
            <div className="currentPrice">
              {userObject.symbolMatches[i]}: {userObject.prices[i].price} {userObject.prices[i].percentChange}
            </div>
          </div>
        )
        commentElements.push(comment)
    }
  })
  .then(function() {
    setComments(commentElements)
  })
  }

  return (
    <div className="prices">
      {comments}
    </div>  
  )
}

const App = () => {
  return (
    <div>
      <Header />
      <Comments />
    </div>
  )
}

export default App
