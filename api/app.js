const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const token = "7100629905:AAH_UdiCC8j9k1DaEwZTfK7PPklX8Eg0LKg"; // توکن ربات تلگرام
const bot = new TelegramBot(token, { polling: false });

// مسیر فایل JSON برای ذخیره‌سازی اطلاعات کاربران
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

// تعریف وب‌هوک برای دریافت آپدیت‌ها
module.exports = (req, res) => {
  if (req.method === "POST") {
    const update = req.body;

    // پردازش آپدیت‌های تلگرام
    bot.processUpdate(update);
    res.status(200).send("OK");
  } else {
    res.status(405).send("Method Not Allowed");
  }
};

// تنظیم وب‌هوک
bot.setWebHook("https://telegram-bot-coin.vercel.app/api/app");

// فرمان /start برای شروع تعامل با ربات
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || "کاربر";

  // بررسی اینکه آیا کاربر قبلاً ثبت‌نام کرده است یا خیر
  if (!users[chatId]) {
    const inviteCode = uuidv4(); // ایجاد کد دعوت جدید برای کاربر
    users[chatId] = {
      inviteCode,
      invitedBy: null,
      invitees: [],
      name: userName,
    };
    saveUsers();
  }

  // ارسال منوی اصلی به کاربر
  bot.sendMessage(
    chatId,
    `به ربات ایردراپ خوش آمدید، ${userName}! از منوی زیر گزینه مورد نظر خود را انتخاب کنید.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🎮 شروع بازی",
              url: "https://your-web-app-url.com", // آدرس وب‌اپلیکیشن شما
            },
          ],
          [{ text: "🔗 دریافت لینک دعوت", callback_data: "get_invite_link" }],
          [{ text: "👥 مشاهده دوستان", callback_data: "view_friends" }],
        ],
      },
    }
  );
});

// پردازش درخواست‌های callback از دکمه‌ها
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  // نمایش لینک دعوت
  if (data === "get_invite_link") {
    const inviteCode = users[chatId].inviteCode;
    const inviteLink = `https://t.me/${process.env.BOT_USERNAME}?start=${inviteCode}`;
    bot.sendMessage(chatId, `این لینک دعوت شماست:\n${inviteLink}`);
  }

  // نمایش لیست دوستان دعوت شده
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

// پردازش کد دعوت هنگام استفاده از /start <invite_code>
bot.onText(/\/start (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const inviteCode = match[1];
  const userName = msg.from.first_name || "کاربر";

  // بررسی اینکه آیا کاربر قبلاً ثبت‌نام کرده است یا خیر
  if (!users[chatId]) {
    const inviterId = Object.keys(users).find(
      (id) => users[id].inviteCode === inviteCode
    );

    // اگر کد دعوت معتبر بود
    if (inviterId) {
      users[chatId] = {
        inviteCode: uuidv4(),
        invitedBy: inviteCode,
        invitees: [],
        name: userName,
      };
      users[inviterId].invitees.push(chatId); // اضافه کردن کاربر به لیست دعوت‌شدگان
      saveUsers();

      bot.sendMessage(
        inviterId,
        `دعوت شما با موفقیت انجام شد. کاربر جدیدی با نام ${userName} به سیستم اضافه شد.`
      );

      bot.sendMessage(
        chatId,
        `شما توسط ${users[inviterId].name} دعوت شده‌اید.`
      );
    } else {
      bot.sendMessage(chatId, "کد دعوت معتبر نیست. لطفا مجدداً تلاش کنید.");
    }
  } else {
    bot.sendMessage(chatId, "شما قبلاً ثبت‌نام کرده‌اید.");
  }

  // ارسال منوی اصلی
  bot.sendMessage(
    chatId,
    `ثبت نام شما با موفقیت انجام شد، ${userName}! از منوی زیر گزینه مورد نظر خود را انتخاب کنید.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🎮 شروع بازی",
              url: "https://maj-coin.tiiny.site", // آدرس وب‌اپلیکیشن شما
            },
          ],
          [{ text: "🔗 دریافت لینک دعوت", callback_data: "get_invite_link" }],
          [{ text: "👥 مشاهده دوستان", callback_data: "view_friends" }],
        ],
      },
    }
  );
});

console.log("ربات در حال اجراست...");
