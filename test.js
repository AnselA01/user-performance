const snoowrap = require('snoowrap');

async function getUserComments() {
  const reddit = new snoowrap({
    userAgent: 'reddit comment scraper by JungleJohn224',
    clientId: 'EgPyrKLVLN_aqClKeznBiw',
    clientSecret: 'AUEBpPWEcqf_vCX4dOuBIZ5PpGGDwQ',
    refreshToken: '228218038382-uo6p6bzkhTAs684UboXHRHe_e1kqMQ'
  });

  const comments = await reddit.getUser('MisesAndMarx').getComments().map(Comment => Comment.body)
  console.log(comments[0])
  for (let i = 0; i < comments.length; i++) {
    if (comments[i].match(/([A-Z]){3}/)) {
      console.log("here")
    }
  }
}
getUserComments()
