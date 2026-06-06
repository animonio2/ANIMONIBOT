const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')

let bot

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

    setTimeout(() => {
      bot.chat('/register Animoni123 Animoni123')
      setTimeout(() => {
        bot.chat('/login Animoni123')
      }, 2000)
    }, 3000)

    setInterval(() => {
      const players = Object.values(bot.players).filter(
        p => p.entity && p.username !== bot.username
      )

      if (!players.length) return

      const target = players[0]

      bot.lookAt(target.entity.position.offset(0, 1.6, 0))
      bot.pathfinder.setGoal(
        new goals.GoalFollow(target.entity, 2),
        true
      )
    }, 5000)
  })

  bot.on('end', () => {
    setTimeout(createBot, 5000)
  })

  bot.on('error', console.log)
}

createBot()
