var LINE_TOKEN = 'nFbrdPdbbEJCZ9Q9Q/3pgTn2LDC2/ZN9UtFFtbG0zl+zoQY0zPQNuw6t6LRwCymO0aXObsCdCpbBbFa8WHT4v2kxg27+ZVhbGjwGqavj5wEYtOW+yt8gg2vfei3qlxwGP/PlDwWFRWYDRgaNFi8XbwdB04t89/1O/w1cDnyilFU=';

var MORNING_MESSAGES = [
  '今日も素敵な一日になりますように🐰✨',
  '耕平さんならきっと大丈夫です🐰💪',
  '無理しすぎず、マイペースでいきましょう🐰🌸',
  '今日も耕平さんを応援しています🐰⭐',
  '小さな一歩が大きな成果につながります🐰🌈',
];

var REMINDER_MESSAGES = [
  'もうすぐですよ、準備はよいですか？🐰⏰',
  'お時間が近づいてまいりました🐰✨',
  'そろそろお支度をされてはいかがでしょうか🐰💕',
];

var WEEKLY_MESSAGES = [
  '今週も一週間、無理せず頑張りましょうね🐰🌟',
  '素敵な一週間になりますように🐰✨',
  '耕平さんの今週を全力応援します🐰💪',
];

function getRandomMessage(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}

function getWeather() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('weather_data');
  if (cached) return cached;

  var lat = 33.1597;
  var lon = 129.7158;
  var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo&forecast_days=2';

  try {
    var response = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
    if (response.getResponseCode() !== 200) {
      return '🌡️ 天気情報を取得できませんでした（しばらくお待ちください）';
    }
    var data = JSON.parse(response.getContentText());

    var weatherCodes = {
      0: '☀️ 快晴', 1: '🌤️ 晴れ', 2: '⛅ 曇り時々晴れ', 3: '☁️ 曇り',
      45: '🌫️ 霧', 48: '🌫️ 霧氷', 51: '🌦️ 霧雨（弱）', 53: '🌦️ 霧雨',
      55: '🌦️ 霧雨（強）', 61: '🌧️ 雨（弱）', 63: '🌧️ 雨', 65: '🌧️ 雨（強）',
      71: '❄️ 雪（弱）', 73: '❄️ 雪', 75: '❄️ 雪（強）', 77: '🌨️ 霰',
      80: '🌧️ にわか雨（弱）', 81: '🌧️ にわか雨', 82: '🌧️ にわか雨（強）',
      85: '🌨️ にわか雪', 86: '🌨️ にわか雪（強）',
      95: '⛈️ 雷雨', 96: '⛈️ 雷雨＋雹', 99: '⛈️ 激しい雷雨＋雹',
    };

    var todayCode = data.daily.weathercode[0];
    var tomorrowCode = data.daily.weathercode[1];
    var todayLabel = weatherCodes[todayCode] !== undefined ? weatherCodes[todayCode] : '(' + todayCode + ')';
    var tomorrowLabel = weatherCodes[tomorrowCode] !== undefined ? weatherCodes[tomorrowCode] : '(' + tomorrowCode + ')';

    var todayStr = '今日：' + todayLabel + ' 🌡️' + data.daily.temperature_2m_min[0] + '°〜' + data.daily.temperature_2m_max[0] + '°';
    var tomorrowStr = '明日：' + tomorrowLabel + ' 🌡️' + data.daily.temperature_2m_min[1] + '°〜' + data.daily.temperature_2m_max[1] + '°';

    var result = todayStr + '\n' + tomorrowStr;
    cache.put('weather_data', result, 21600);
    return result;

  } catch (e) {
    return '🌡️ 天気情報を取得できませんでした';
  }
}

function fetchRssNews(url, count) {
  try {
    var response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: {'User-Agent': 'Mozilla/5.0 (compatible; GAS/1.0)'}
    });
    if (response.getResponseCode() !== 200) return [];

    var xml = response.getContentText();
    var document = XmlService.parse(xml);
    var root = document.getRootElement();
    var channel = root.getChild('channel');
    var items = channel.getChildren('item');

    var results = [];
    for (var i = 0; i < items.length && results.length < count; i++) {
      var title = items[i].getChildText('title');
      var link = items[i].getChildText('link');
      if (title && link) {
        results.push({title: title, link: link});
      }
    }
    return results;
  } catch (e) {
    return [];
  }
}

function getTopNews() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('news_data_v2');
  if (cached) return cached;

  var result = '';

  var majorNews = fetchRssNews('https://www3.nhk.or.jp/rss/news/cat0.xml', 3);
  result += '🔴 重大ニュース\n────────────\n';
  if (majorNews.length > 0) {
    majorNews.forEach(function(item) { result += '🔹 ' + item.title + '\n' + item.link + '\n'; });
  } else { result += '取得できませんでした\n'; }
  result += '\n';

  var techNews = fetchRssNews('https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml', 3);
  result += '💡 新テクノロジー\n────────────\n';
  if (techNews.length > 0) {
    techNews.forEach(function(item) { result += '🔹 ' + item.title + '\n' + item.link + '\n'; });
  } else { result += '取得できませんでした\n'; }
  result += '\n';

  var econNews = fetchRssNews('https://www3.nhk.or.jp/rss/news/cat3.xml', 3);
  result += '🌏 世界経済\n────────────\n';
  if (econNews.length > 0) {
    econNews.forEach(function(item) { result += '🔹 ' + item.title + '\n' + item.link + '\n'; });
  } else { result += '取得できませんでした\n'; }
  result += '────────────';

  cache.put('news_data_v2', result, 10800);
  return result;
}

function sendLineMessage(message) {
  var url = 'https://api.line.me/v2/bot/message/broadcast';
  var headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + LINE_TOKEN
  };
  var payload = JSON.stringify({ messages: [{type: 'text', text: message}] });
  try {
    UrlFetchApp.fetch(url, { method: 'post', headers: headers, payload: payload, muteHttpExceptions: true });
  } catch (e) {
    Logger.log('LINE送信エラー: ' + e.message);
  }
}

function checkCalendarAndNotify() {
  var today = new Date();
  var tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  var todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  var todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  var tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0);
  var tomorrowEnd = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59);

  var calendar = CalendarApp.getDefaultCalendar();
  var todayEvents = calendar.getEvents(todayStart, todayEnd);
  var tomorrowEvents = calendar.getEvents(tomorrowStart, tomorrowEnd);

  var weather = getWeather();
  var news = getTopNews();

  var weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  var dateStr = (today.getMonth() + 1) + '月' + today.getDate() + '日（' + weekDays[today.getDay()] + '）';

  var message = '🐰 おはようございます、耕平さん！\n';
  message += 'ウサギの秘書でございます🌸\n\n';
  message += '📆 ' + dateStr + '\n\n';
  message += '🌤️ 佐世保の天気\n────────────\n';
  message += weather + '\n────────────\n\n';
  message += news + '\n\n';

  if (todayEvents.length > 0) {
    message += '📅 本日のご予定はこちらです\n────────────\n';
    for (var i = 0; i < todayEvents.length; i++) {
      var e = todayEvents[i];
      var start = Utilities.formatDate(e.getStartTime(), 'Asia/Tokyo', 'HH:mm');
      var end = Utilities.formatDate(e.getEndTime(), 'Asia/Tokyo', 'HH:mm');
      var diffMs = e.getStartTime() - today;
      var diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      var diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      var timeUntil = diffMs > 0 ? (diffHours > 0 ? '（あと' + diffHours + '時間' + (diffMins > 0 ? diffMins + '分' : '') + '）' : (diffMins > 0 ? '（あと' + diffMins + '分）' : '')) : '（進行中）';
      message += '🕐 ' + start + '〜' + end + '\n　' + e.getTitle() + ' ' + timeUntil + '\n';
    }
    message += '────────────\n\n';
  } else {
    message += '📅 本日のご予定はございません\nゆっくりお過ごしくださいね🌸\n\n';
  }

  if (tomorrowEvents.length > 0) {
    message += '📆 明日のご予定\n────────────\n';
    for (var j = 0; j < tomorrowEvents.length; j++) {
      var ev = tomorrowEvents[j];
      var startT = Utilities.formatDate(ev.getStartTime(), 'Asia/Tokyo', 'HH:mm');
      var endT = Utilities.formatDate(ev.getEndTime(), 'Asia/Tokyo', 'HH:mm');
      message += '🕐 ' + startT + '〜' + endT + '\n　' + ev.getTitle() + '\n';
    }
    message += '────────────\n\n';
  }

  message += getRandomMessage(MORNING_MESSAGES);
  sendLineMessage(message);
}

function sendReminderNotify() {
  var now = new Date();
  var oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  var calendar = CalendarApp.getDefaultCalendar();
  var events = calendar.getEvents(now, oneHourLater);

  for (var i = 0; i < events.length; i++) {
    var e = events[i];
    var diffMs = e.getStartTime() - now;
    var diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins <= 60 && diffMins > 0) {
      var start = Utilities.formatDate(e.getStartTime(), 'Asia/Tokyo', 'HH:mm');
      var message = '🐰 耕平さん、お知らせです✨\n\n「' + e.getTitle() + '」\nまであと' + diffMins + '分となりました⏰\n\n' + start + '開始予定です\n\n' + getRandomMessage(REMINDER_MESSAGES);
      sendLineMessage(message);
    }
  }
}

function sendWeeklyNotify() {
  var today = new Date();
  if (today.getDay() !== 1) return;

  var weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  var weekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 23, 59, 59);
  var calendar = CalendarApp.getDefaultCalendar();
  var events = calendar.getEvents(weekStart, weekEnd);
  var days = ['日', '月', '火', '水', '木', '金', '土'];

  var message = '🐰 おはようございます、耕平さん！\n今週のご予定をお知らせします📅\n\n────────────\n';

  if (events.length > 0) {
    for (var i = 0; i < events.length; i++) {
      var e = events[i];
      var date = Utilities.formatDate(e.getStartTime(), 'Asia/Tokyo', 'M/d');
      var day = days[e.getStartTime().getDay()];
      var start = Utilities.formatDate(e.getStartTime(), 'Asia/Tokyo', 'HH:mm');
      var end = Utilities.formatDate(e.getEndTime(), 'Asia/Tokyo', 'HH:mm');
      message += '📌 ' + date + '(' + day + ') ' + start + '〜' + end + '\n　' + e.getTitle() + '\n';
    }
  } else {
    message += '今週はご予定がございません🌸\n';
  }

  message += '────────────\n\n' + getRandomMessage(WEEKLY_MESSAGES);
  sendLineMessage(message);
}

// ===== 予約通知（Googleフォーム連携）=====
function onFormSubmit(e) {
  const values = e.values;
  const timestamp = values[0];
  const name      = values[1];
  const phone     = values[2];
  const date      = values[3];
  const time      = values[4];
  const memo      = values[5] || 'なし';

  const message =
    '📅 新しい予約が入りました！\n\n' +
    '👤 お名前：' + name + '\n' +
    '📞 電話番号：' + phone + '\n' +
    '📆 希望日：' + date + '\n' +
    '🕐 希望時間：' + time + '\n' +
    '📝 ご要望：' + memo + '\n\n' +
    '⏰ 受付時刻：' + timestamp;

  sendLineMessagePush(message);
}

function sendLineMessagePush(message) {
  const props = PropertiesService.getScriptProperties();
  const token  = props.getProperty('LINE_TOKEN');
  const userId = props.getProperty('LINE_USER_ID');

  const url = 'https://api.line.me/v2/bot/message/push';
  const payload = { to: userId, messages: [{ type: 'text', text: message }] };
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + token },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  UrlFetchApp.fetch(url, options);
}

// ===== 予約通知テスト =====
function testReservationNotify() {
  sendLineMessagePush(
    '📅 新しい予約が入りました！\n\n' +
    '👤 お名前：テスト太郎\n' +
    '📞 電話番号：090-0000-0000\n' +
    '📆 希望日：2026/04/15\n' +
    '🕐 希望時間：14時\n' +
    '📝 ご要望：なし\n\n' +
    '⏰ 受付時刻：2026/04/09 10:30:00'
  );
}