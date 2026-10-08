// 六角學院課程推薦。
//
// 每個人只會看到一門課，規則由上往下比對，先符合的先套用（所以越前面的
// 規則代表「越強的訊號」）。推薦依據全部來自他自己填的答案，不是隨機推銷。
//
// 課程名稱與網址取自 hexschool.com/courses（2026-10 查核）。課程若改名、
// 下架或換網址，改這張表就好，比對邏輯不用動。
// image 是課程縮圖（放在 assets/courses/），有填才會顯示在推薦卡上方。

var BASE = 'https://www.hexschool.com';

// careerBug is multi-select, so rules test membership rather than equality.
function hasBug(answers, value) {
  return (answers.careerBug || []).indexOf(value) !== -1;
}

export var COURSES = {
  aiUpgrade: { name: 'AI 開發進化營', url: BASE + '/courses/ai-year-upgrade.html' },
  english: { name: '40 天高效職場英文班', url: BASE + '/courses/cln-40-days-english.html' },
  starterCamp: { name: '30 天軟體工程師體驗營', url: BASE + '/courses/software-engineer-camping.html' },
  backendTraining: { name: 'Node.js+雲端：後端就業培訓班', url: BASE + '/courses/backend-training.html' },
  cloudTraining: { name: '雲端架構部署直播班', url: BASE + '/courses/cloud_training.html' },
  frontendTraining: { name: 'JS+Vue 前端工程師培訓班', url: BASE + '/courses/frontend-training.html', image: 'assets/courses/frontend-training.webp' },
  typescript: { name: 'TypeScript 實戰課', url: BASE + '/courses/typescript-training.html' },
  react: { name: 'React 作品實戰班', url: BASE + '/courses/react-training.html' },
  jsCore: { name: 'JavaScript 核心篇', url: BASE + '/courses/js-core.html' },
  jsTraining: { name: 'JavaScript 工程師養成直播班', url: BASE + '/courses/js-training.html' },
  ui: { name: 'UI 設計入門', url: BASE + '/courses/ui.html' },
  allCourses: { name: '六角學院精選課程', url: BASE + '/courses/' }
};

// reason 會直接顯示給填答者看，講清楚「為什麼推這門給你」。
var RULES = [
  {
    when: function (a) { return a.goal2027 === 'switchToAI'; },
    course: 'aiUpgrade',
    reason: '你把 2027 的目標放在轉進 AI，與其自己摸索，不如直接照著走一遍。'
  },
  {
    when: function (a) { return a.aiFear === 'skillGap' || hasBug(a, 'aiAnxiety'); },
    course: 'aiUpgrade',
    reason: '你最擔心的是 AI 時代技術跟不上——擔心沒有用，動手用過一輪才會踏實。'
  },
  {
    when: function (a) { return a.goal2027 === 'foreign'; },
    course: 'english',
    reason: '技術你已經有了，進外商真正卡住人的常常是英文這一關。'
  },
  {
    when: function (a) { return a.experience === 'lt1'; },
    course: 'starterCamp',
    reason: '你還在第一年，這時候把基礎打穩，後面每一步都會輕鬆很多。'
  },
  {
    when: function (a) { return a.role === 'designer'; },
    course: 'ui',
    reason: '設計師懂一點開發會很吃香，但先把 UI 設計的底子練扎實，你的作品才有說服力。'
  },
  {
    when: function (a) { return a.role === 'student'; },
    course: 'starterCamp',
    reason: '還在學或準備轉職，先用體驗營走一遍工程師的日常，確認方向再全力衝。'
  },
  {
    when: function (a) { return a.role === 'backend' || a.role === 'devops'; },
    course: function (a) { return a.goal2027 === 'techLevelUp' ? 'cloudTraining' : 'backendTraining'; },
    reason: '依你的後端／維運背景，把這塊能力補完整，接得住的題目會多很多。'
  },
  {
    when: function (a) { return a.role === 'frontend' && hasBug(a, 'skill'); },
    course: 'jsCore',
    reason: '技術焦慮多半來自基礎沒踩穩，從核心補起會最有感。'
  },
  {
    when: function (a) {
      return a.role === 'frontend' && (a.goal2027 === 'senior' || a.goal2027 === 'techLevelUp');
    },
    course: function (a) { return a.goal2027 === 'senior' ? 'typescript' : 'react'; },
    reason: '你想在前端這條路上再往上一階，差的通常不是語法，是能不能做出完整的東西。'
  },
  {
    when: function (a) { return a.role === 'frontend' || a.role === 'fullstack'; },
    course: 'frontendTraining',
    reason: '依你的前端／全端背景，把主力技能練成能交付作品的程度最實際。'
  },
  {
    when: function (a) { return a.role === 'qa' || a.role === 'other'; },
    course: 'jsTraining',
    reason: '不管之後往哪走，一套紮實的 JavaScript 都是最通用的底。'
  },
  {
    when: function (a) { return a.goal2027 === 'switchJob' || a.goal2027 === 'raise'; },
    course: 'jsTraining',
    reason: '想跳槽或加薪，拿得出手的作品和硬實力才是最實在的籌碼。'
  }
];

var FALLBACK = { course: 'allCourses', reason: '依你的作答，這幾個方向都值得看看。' };

export function recommendCourse(answers) {
  var picked = FALLBACK;
  for (var i = 0; i < RULES.length; i++) {
    if (RULES[i].when(answers)) {
      picked = RULES[i];
      break;
    }
  }
  var key = typeof picked.course === 'function' ? picked.course(answers) : picked.course;
  var course = COURSES[key] || COURSES.allCourses;
  return { name: course.name, url: course.url, image: course.image || '', reason: picked.reason };
}
