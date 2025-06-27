const { REST, Routes } = require('discord.js');
const { loadCommands } = require('./utils/command-loader');

require('dotenv').config();

const loadedCommands = loadCommands();
const commands = loadedCommands.map(command => command.data.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      // Routes.applicationCommands(process.env.CLIENT_ID),
      Routes.applicationGuildCommands(process.env.CLIENT_ID, '1387612331386863626'),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();