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
    data: 'grant_type=refresh_token&refresh_token=dNNk7ZThJlDPa9JfI7n8rZcn3ACztpIy7UisNh%2B%2BjDiIbtHy6jgyT7wAPYrLMmBKvHFjl0pAFg5PvbMWsEdN1zl6npO3ut8iql%2BHLObQ0OPiEwUVR%2BEckwtOKW%2B4DHLejgo1v82%2BIMnrWVRhSzJAMsplUe1z3myEqUvKX3JxPMW0vXrT9KS1x9cE%2FiIMiUCBsnpWgJwK49mtl6RP%2B5yBYZUykedyYxj4qqQgQQ7O%2B1TePfW9sphr2x%2Fc1MXHS8aCNHO%2FnZ2uCJ7cZHfN0RRup7taueMHIiBkpP0EEczpvLn7nnNoQzxh2y8gzesUgr67Ou0YylFEekY56ookWZedRk3gLroDfSoYOeOeiJi9p0kyFIgc6pIDasFyzQFK7qBe6OK0roXZASyqAhNovA%2FFeAL406OhrEanjwTZgsGbez6ZAuuaKMNXKU3jRs%2B100MQuG4LYrgoVi%2FJHHvlXL6oA9lmUHfGGkM2AzT5HXHaZTg7OV1yq5chrxyI9I92bqpjwq%2FBQRi2XzRHs%2FT6nog88sxmb60J7lreaxPrAWn7oaHTgwLKyY9ihr3RDvlj8CuKAbHsntECTP%2BLNZgtYgJaX1ci0f4ZRUEGSANeMDY8KIA7kzDUQDGsY51ytSTsd67CPnrifn5RIBUXQJ6s753jnBDUkF1c%2BG84Si%2F%2FyZ2FUumSjH9k392oD7rQGuEeTqRoru9HsoKVkMnLtJt3m1cboD%2FhH3aPL4KG6XlsFaotu4HiZsM0R525xpwicnp0Oncx11JFbTr%2FdoMswRcoaWZx3U0ZKVvKH6d9keUufRPJ%2F5lzsx%2FAKkvKOMqAV8WG6flov84iQa0hT6Nm9xIIJUcE6KZgC5BafJ3UHx1GfG03ZARUK%2Bc7VZBzjw2P52WOnaPoUoPpSTakVHU%3D212FD3x19z9sWBHDJACbC00B75E&access_type=&code=&client_id=PBTASGIYTYGO8FI5QLXRZS63AXHG40XH%40AMER.OAUTHAP&redirect_uri='
  };
  
  const response = await axios(accessTokenConfig)
  return "Bearer " + response.data.access_token
} 

async function isSymbol(matches, comments) {
  let symbols = []
  let commentMatches = []
  for (let i = 0; i < matches.length; i++) { //check if each in matches is a valid symbol
    var content = {
      method: 'get',
      url: 'https://api.tdameritrade.com/v1/instruments?apikey=PBTASGIYTYGO8FI5QLXRZS63AXHG40XH&symbol=' + matches[i] + '&projection=symbol-search',
      headers: {
        'Authorization': await getAccessToken()
      }
    };

    const response = await axios(content)
    if (Object.keys(response.data).length !== 0) {
      symbols.push(matches[i])
      commentMatches.push(comments[i])
    }
  }  
  return {
    symbols,
    commentMatches
  }
}

async function getUser() {
  const user = prompt("Input a user")
  const allComments = await reddit.getUser(user).getComments().map(Comment => Comment)
  let match = /\b([A-Z]){2,5}\b/g  //find all capital words that are 2-5 letters long
  let matches = []
  let comments = []
  let dates = []
  for (let i = 0; i < allComments.length; i++) {
    let result = allComments[i].body.match(match)
    if (result) {
      matches.push(result)
      comments.push(allComments[i].body)
      dates.push((allComments[i].created_utc) * 1000)
    }
  }
  let parsedDates = parseDates(dates)

  matches = matches.flat()
  let symbols = (await isSymbol(matches, comments)).symbols
  symbols = Object.values(symbols)
  console.log("symbol matches: ", symbols)
  let commentMatches = (await isSymbol(matches, comments)).commentMatches
  console.log("comment matches: ", commentMatches)
  return {
    symbols, 
    commentMatches,
    parsedDates
  }
}

const parseDates = (dates) => {
  let parsedDates = []
  for (let i = 0; i < dates.length; i++) {
    let date = new Date(dates[i])
    let workingDate = date.toLocaleString('default', { month: 'short' }) + " " + date.getDate() + 
    ", " + date.getFullYear()
    parsedDates.push(workingDate)
  }
  console.log(parsedDates)
  return parsedDates
}

async function getCurrentPrice(symbol) {
  const quoteConfig = {
    method: 'get',
    url: 'https://api.tdameritrade.com/v1/marketdata/' + symbol + '/quotes?apikey=PBTASGIYTYGO8FI5QLXRZS63AXHG40XH',
    headers: {
      Authorization: await getAccessToken()
    },
  };
  const response = await axios(quoteConfig)
  setTimeout(() => {
  }, "500")
  return response.data[symbol].lastPrice
}

const Header = () => {
  return (
    <h1 className="title">
      User Stock Mentions
    </h1>
  )
}

const Comments = () => {
  const [clicked, setClicked] = useState(false)
  const [comments, setComments] = useState([])

  if (!clicked) {
    setClicked(true)
    getUser().then(object => {
      let commentElements = []
      for (let i = 0; i < object.commentMatches.length - 1; i++) {
        getCurrentPrice(object.symbols[i]).then(price => {
          let comment = (
            <div className="comment">
            <div className="commentDate">{object.parsedDates[i]}</div>
            <div className="commentBody">{object.commentMatches[i]}</div>
            <div className="currentPrice">{price}</div>
          </div>
        )
        commentElements.push(comment)
        })
      }
      setComments(commentElements)
    })
  }

  return (
    <div>
{      <ul className="symbolsList">
        <li>{comments}</li>
      </ul>    
}    </div>
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
