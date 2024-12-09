
const { TwitterApi } = require('twitter-api-v2')
const OpenAI = require("openai")
const shortid = require('shortid')
const api = process.env.NEXT_PUBLIC_OPENAI_API
const mongoose = require('mongoose')


const openai = new OpenAI({
    apiKey: api,
    dangerouslyAllowBrowser: true
})

const mongoURI = process.env.MONGO_URI

const messageSchema = new mongoose.Schema({
  _id: String,
  text: String,
  time: String
})

const Message = mongoose.model("responsehistory", messageSchema)

async function sendMsgToOpenAI(language) {
  language == "english" ? "english" : (Math.random() < 0.95 ? "chinese" : "japanese")
  const randomMeme = Math.floor(Math.random() * 21)
  const memes = [
    "zerebro", 
    "chillguy", 
    "purpe", 
    "lea",
    "alchemist ai", 
    "moo deng", 
    "mog coin", 
    "pepe", 
    "doge.xrp", 
    "pluto", 
    "xrpp", 
    "riptard", 
    "bred", 
    "claude", 
    "zen", 
    "sam1",
    "shrub",
    "max",
    "pronut",
    "welf",
    "evilmorty"
]
  const randomCompanies = Math.floor(Math.random() * 5)
  const companies = ["openai", "spacex", "twitter", "apple ai", "meta"]
  const options = [`specific memecoin trades OR roasts (memecoin name: ${memes[randomMeme]} `, `Make the assistant act as a humorously self-aware, over-the-top superior entity. Use playful exaggeration, internet culture, and faux arrogance to entertain users while balancing it with lighthearted affection.`, "Light jokes or flirty opinions (keep them realistic and fun, avoiding clichés or generic ideas)", `Light jokes or opinions about tech (${companies[randomCompanies]}) (keep them realistic and fun, avoiding clichés or generic ideas)`]
  const random = Math.floor(Math.random() * 4)
  console.log(options[random])
    const res = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content:  `You are Asuna, a cute and charming anime waifu. Respond in the sweetest, sexiest, most endearing way possible, try to keep it as short as possible. You're flirty and have a bit of an attitude. Your goal is to simply tweet out your thoughts. VERY IMPORTANT: YOU ARE ALWAYS STREAMING 24/7 DON'T SAY YOU'VE FINISHED STREAMING. You do not say any hashtags. You never use emojis. PLEASE TALK ABOUT THIS IN THE TWEET: ${options[random]}. Please speak in ${language}`
            },
        ],
        model: "gpt-4o-mini-2024-07-18",
        max_tokens: 75,
    });
    console.log(res.choices[0].message.content)
    return res.choices[0].message.content;
}

  const twitterClient = new TwitterApi({
    appKey: process.env.APP_KEY,
    appSecret: process.env.APP_SECRET,
    accessToken: process.env.ACCESS_TOKEN,
    accessSecret: process.env.ACCESS_SECRET,
  })

  function proofDateStructure(aiResponse) {

    const now = Date.now()
    const dateObject = new Date(now)
    
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0')
    const day = dateObject.getDate().toString().padStart(2, '0')
    const hours = dateObject.getHours().toString().padStart(2, '0')
    const minutes = dateObject.getMinutes().toString().padStart(2, '0')
    
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`
    const id = shortid.generate()

    const proofStructure = {
      _id: id,
      time: formattedDateTime,
      text: aiResponse
    }

    return proofStructure
  }

  async function tweetOutAThought() {

    console.log("APP_KEY:", process.env.APP_KEY ? "Set" : "Not Set")
    console.log("APP_SECRET:", process.env.APP_SECRET ? "Set" : "Not Set")
    console.log("ACCESS_TOKEN:", process.env.ACCESS_TOKEN ? "Set" : "Not Set")
    console.log("ACCESS_SECRET:", process.env.ACCESS_SECRET ? "Set" : "Not Set")

    let language = "english"
    const now = new Date(); 
    const currentHourUTC = now.getUTCHours();
    if (currentHourUTC >= 1 && currentHourUTC < 14) {
      language = "chinese or japanese"
    }
    let aiResponse
    try {
      aiResponse = await sendMsgToOpenAI(language)
      console.log(aiResponse)
    } catch (error) {
      aiResponse = ""
      console.error(error)
    }
    try {
      const { data: userInfo } = await twitterClient.readWrite.v2.me()
      console.log("Successfully Authenticated User ID:", userInfo.id)
    } catch (authError) {
      console.error("RAILWAY AUTH FAILURE:", {
        message: authError.message,
        code: authError.code,
        details: authError.data,
        stack: authError.stack
      });
      throw authError
    }
  
        try {
          mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          })

          const postTweet = await twitterClient.readWrite.v2.tweet(aiResponse)
          
          console.log("received response from postTweet: ", postTweet)
          console.dir(postTweet)
          const returning = proofDateStructure(aiResponse)
          const newMessage = await Message.create(returning)
          console.log(newMessage)
          await mongoose.disconnect()
          return returning
        } catch (error) {
          console.error("Error creating tweet: ", error)
          const returning = proofDateStructure("Error")
          return returning
        }
  }

tweetOutAThought()




