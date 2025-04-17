
const BOT_ID    = "";
const BOT_Server= "";

import {
    Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, AttachmentBuilder
} from 'discord.js';
import { exec } from 'node:child_process'
import { fileURLToPath } from 'url'
import path from 'path'
import { unlinkSync } from 'fs'

const ___firename = fileURLToPath(
    import.meta.url);
const ___dirname = path.dirname(___firename);

const client = new Client({intents: [GatewayIntentBits.Guilds]});
const rest = new REST({ version: '10' }).setToken(""); // ur token

let latestimage = "1.png"
const possiblechannles = [] // add ur channel id for array

// set slash commands
const commands = [
    new SlashCommandBuilder()
    .setName("sendvideo")
    .setDescription("Upload Video to Channel!")
    .addChannelOption(option => { return option.setName('channel').setDescription("which channel do u want to upload?").setRequired(true) })
    .addStringOption(option => { return option.setName("videourl").setDescription("Please put Video Url").setRequired(true) })
    .addStringOption(option => { return option.setName("sec").setDescription("What frame should i set to thumnbail image(Secound)").setRequired(true) })
    .addStringOption(option => { return option.setName("description").setDescription("Please tell me some infomartions like title or description").setRequired(true) })
    .addStringOption(option => { return option.setName("information").setDescription("if you wanna put some more other information") })
]

// upload to api(slash commands)
try {
    await rest.put(Routes.applicationCommands(BOT_ID, BOT_Server), { body: commands });
    console.log("Slash Command was updated!")
} catch (e) {
    console.log(e)
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    let options = interaction.options;

    if(interaction.commandName === "sendvideo") {
        if(possiblechannles.includes(options.getChannel('channel').id)) {
            await interaction.reply(':man_detective: i am trying to upload that video! wait a minutes')
            const result = await Main(options.getString("sec"), options.getString("videourl"), options.getChannel('channel').id, options.getString("description"), options.getString("information"), interaction);
            await interaction.editReply(result)
        } else {
            interaction.reply(`:exclamation: You can't send video! -> #${options.getChannel('channel').name}`)
        }
    }
});

/**
 * Process Thumnbail and Send Embed
 */
async function Main(sec, url, channelID, title, information, interaction) {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now()
        const ffmpegPath = path.join(___dirname, "src", "ffmpeg.exe")
        let output = `output_${timestamp}.png`
        let command = `${ffmpegPath} -ss ${sec} -i "${url}" -frames:v 1 ${output} -y`
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return resolve(':question:  Error at during generate thumnbail!');
            }
            latestimage = output;

            const Embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`✨Upload by **${interaction.user}**✨ Video is [here](${url})`)
            .setTitle(title)
            .setImage(`attachment://SPOILER_image.png`)
            .setTimestamp()

            if(information) {
                Embed.setDescription(information + ` ✨Upload by **${interaction.user}**✨ Video is [here](${url})`)
            }


            const attachmentImage = new AttachmentBuilder().setName("SPOILER_image.png").setFile(`./${latestimage}`)

            client.channels.cache.get(channelID).send({ embeds: [Embed], files: [attachmentImage]}).then(() => {
                unlinkSync(`./${latestimage}`)
            })

            resolve(":heart_on_fire: That video was uploaded. Thanks for contribute to this server!!")

        
        });
    })
}
client.login(""); // ur token