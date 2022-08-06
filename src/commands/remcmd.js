module.exports.execute = async function (bot, options) {
  return new Promise((resolve, reject) => {
    bot.application.commands.set([])
      .then(() => resolve({ description: 'Removed all slash commands' }))
      .catch(error => {
        const res = { error, title: 'Couldn\'t Remove slash commands' };
        reject(res);
      });
  });
};
