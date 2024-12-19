const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const path = require("path");

const Token = "7100629905:AAH_UdiCC8j9k1DaEwZTfK7PPklX8Eg0LKg";
const botUsername = "todaywhat_bot";
const webAppPath = path.resolve("https://maj-coin.tiiny.site/");

const bot = new TelegramBot(Token, { polling: true });

const usersFilePath = "./data/users.json";

// بررسی و اطمینان از وجود فایل JSON
if (!fs.existsSync(usersFilePath)) {
  fs.writeFileSync(usersFilePath, JSON.stringify({}));
}

let users = {};
try {
  users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
} catch (err) {
  console.error("Error reading JSON file:", err);
  users = {};
}

const saveUsers = () => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || "کاربر";

  if (!users[chatId]) {
    const inviteCode = uuidv4();
    users[chatId] = {
      inviteCode,
      invitedBy: null,
      invitees: [],
      name: userName,
    };
    saveUsers();
  }

  bot.sendMessage(
    chatId,
    `به ربات ایردراپ خوش آمدید، ${userName}! از منوی زیر گزینه مورد نظر خود را انتخاب کنید.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🎮 شروع بازی",
              url: `https://your-replit-app-url.repl.co`,
            },
          ], // Replace with your deployed Replit app's URL
          [{ text: "🔗 دریافت لینک دعوت", callback_data: "get_invite_link" }],
          [{ text: "👥 مشاهده دوستان", callback_data: "view_friends" }],
        ],
      },
    }
  );
});

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === "get_invite_link") {
    const inviteCode = users[chatId].inviteCode;
    const inviteLink = `https://t.me/${botUsername}?start=${inviteCode}`;
    bot.sendMessage(chatId, `این لینک دعوت شماست:\n${inviteLink}`);
  }

  if (data === "view_friends") {
    const invitees = users[chatId].invitees;
    if (invitees.length === 0) {
      bot.sendMessage(chatId, "شما هنوز هیچ دوستی دعوت نکرده‌اید.");
    } else {
      let friendsList = "لیست دوستان دعوت شده:\n";
      invitees.forEach((inviteeId) => {
        const friendName = users[inviteeId].name;
        friendsList += `- ${friendName}\n`;
      });
      bot.sendMessage(chatId, friendsList);
    }
  }
});

bot.onText(/\/start (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const inviteCode = match[1];
  const userName = msg.from.first_name || "کاربر";

  if (!users[chatId]) {
    const inviterId = Object.keys(users).find(
      (id) => users[id].inviteCode === inviteCode
    );

    if (inviterId) {
      users[chatId] = {
        inviteCode: uuidv4(),
        invitedBy: inviteCode,
        invitees: [],
        name: userName,
      };
      users[inviterId].invitees.push(chatId);
      saveUsers();

      // ارسال پیام موفقیت‌آمیز به دعوت‌کننده
      bot.sendMessage(
        inviterId,
        `دعوت شما با موفقیت انجام شد. کاربر جدیدی با نام ${userName} به سیستم اضافه شد.`
      );

      // ارسال پیام به دعوت‌شده مبنی بر اینکه توسط چه کسی دعوت شده است
      bot.sendMessage(
        chatId,
        `شما توسط ${users[inviterId].name} دعوت شده‌اید.`
      );
    } else {
      bot.sendMessage(chatId, "کد دعوت معتبر نیست. لطفا مجددا تلاش کنید.");
    }
  } else {
    bot.sendMessage(chatId, "شما قبلاً ثبت‌نام کرده‌اید.");
  }

  bot.sendMessage(
    chatId,
    `ثبت نام شما با موفقیت انجام شد، ${userName}! از منوی زیر گزینه مورد نظر خود را انتخاب کنید.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🎮 شروع بازی",
              url: `https://maj-coin.tiiny.site/`,
            },
          ], // Replace with your deployed Replit app's URL
          [{ text: "🔗 دریافت لینک دعوت", callback_data: "get_invite_link" }],
          [{ text: "👥 مشاهده دوستان", callback_data: "view_friends" }],
        ],
      },
    }
  );
});

console.log("run bot in server");
