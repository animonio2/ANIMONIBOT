const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const fs = require('fs-extra')
const axios = require('axios')
const similarity = require('string-similarity')

let bot
let brain = []
let players = {}
let conversations = {}
let emotions = {}
let reputation = {}
let warnings = {}

let lastMessage = ""
let lastTime = 0

// LOAD
if (fs.existsSync('brain.json')) brain = fs.readJsonSync('brain.json')
if (fs.existsSync('players.json')) players = fs.readJsonSync('players.json')

// SAVE
function saveAll() {
  fs.writeJsonSync('brain.json', brain)
  fs.writeJsonSync('players.json', players)
}

// INIT
function ensurePlayer(user) {
  if (!players[user]) players[user] = {}
  if (!conversations[user]) conversations[user] = []
  if (!emotions[user]) emotions[user] = "normal"
  if (!reputation[user]) reputation[user] = 0
  if (!warnings[user]) warnings[user] = 0
}


// FOLLOW
function follow() {
  setInterval(() => {
    let list = Object.values(bot.players).filter(p => p.entity)
    if (!list.length) return

    let target = list[Math.floor(Math.random()*list.length)]
    bot.lookAt(target.entity.position.offset(0,1.6,0))
    bot.pathfinder.setGoal(new goals.GoalFollow(target.entity, 2), true)
  }, 5000)
}

// AUTH
function handleAuth() {
  setTimeout(() => {
    bot.chat('/register Animoni123 Animoni123')
    setTimeout(() => bot.chat('/login Animoni123'), 2000)
  }, 3000)
}

// FILTER
function isRealPlayer(user, msg) {
  if (!user || user === bot.username) return false
  if (!msg || msg.startsWith('/')) return false
  return true
}

// BOT
function createBot() {
  bot = mineflayer.createBot({
    host: 'ANIMONI.aternos.me',
    port: 59644,
    username: 'ANIMONIBOT',
    version: '1.20.4'
  })

  bot.loadPlugin(pathfinder)

  bot.once('spawn', () => {
    const mcData = require('minecraft-data')(bot.version)
    bot.pathfinder.setMovements(new Movements(bot, mcData))

    handleAuth()
    smartTalk()
    selfThinking()
    follow()
  })

  bot.on('chat', async (user, msg) => {
    if (!isRealPlayer(user, msg)) return

    msg = msg.toLowerCase()

    ensurePlayer(user)
    addMemory(user, msg)
    analyze(user, msg)
    learn(msg)

    jailCheck(user)

    let reply = await generateReply(user, msg)
    if (reply && reply !== msg) send(reply)
  })

  bot.on('end', () => setTimeout(createBot, 5000))
}

createBot()
