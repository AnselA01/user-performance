import { useState } from 'react'
const snoowrap = require('snoowrap');

async function getUserComments() {
  const reddit = new snoowrap({
    userAgent: 'reddit comment scraper by JungleJohn224',
    clientId: 'EgPyrKLVLN_aqClKeznBiw',
    clientSecret: 'AUEBpPWEcqf_vCX4dOuBIZ5PpGGDwQ',
    refreshToken: '228218038382-uo6p6bzkhTAs684UboXHRHe_e1kqMQ'
  });
  
  const comments = await reddit.getUser('JungleJohn224').getComments().map(Comment => Comment.body)
  console.log(comments[0])
  if (comments[0].match(/([A-Z]){3}/)) {
    console.log("here")
  }

}

const Header = () => {

  return (
    <div>
      <span className="title">Title Here</span>
      <span className="search-bar">
        <input type="text" placeholder="Search for a user..." className="searchbar" id="searchbar"></input>
        <button onClick={searchUser}>submit</button>
      </span>
    </div>
  )
}

const App = () => {

  return (
    <div>
      <Header />
      <Test />
    </div>
  )
}

export default App
