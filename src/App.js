import { useState } from 'react'

const searchUser = () => {
  console.log(document.getElementById("searchbar").value)
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

const Test = () => {
  
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
