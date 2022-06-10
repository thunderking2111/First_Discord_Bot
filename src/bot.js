require('dotenv').config();
const { Client, Intents } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES] });

client.on('ready', async () => {
    console.log(`${client.user.username, client.user.tag}`);
    client.login(process.env.BOT_TOKEN);
});
