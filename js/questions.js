export const QUESTIONS = [
  {
    id: 'role',
    level: 1,
    type: 'single',
    visualStyle: 'cards',
    characterMood: 'coding',
    prompt: '選擇你的工程師角色！',
    options: [
      { value: 'frontend', label: '前端', emoji: '🎨' },
      { value: 'backend', label: '後端', emoji: '⚙️' },
      { value: 'fullstack', label: '全端', emoji: '🧩' },
      { value: 'app', label: 'App', emoji: '📱' },
      { value: 'ai', label: 'AI', emoji: '🤖', personaPoints: { aiEvolved: 1 } },
      { value: 'data', label: 'Data', emoji: '📊' },
      { value: 'devops', label: 'DevOps', emoji: '🛠️' },
      { value: 'qa', label: 'QA / 測試', emoji: '🔍' },
      { value: 'other', label: '其他', emoji: '✨' }
    ]
  },
  {
    id: 'experience',
    level: 2,
    type: 'single',
    visualStyle: 'expBar',
    // 有高低順序的題目：手機上改成垂直清單，右邊用等級格標出程度
    layout: 'ladder',
    characterMood: 'idea',
    prompt: '你在工程師世界生存多久了？',
    options: [
      { value: 'lt1', rank: 1, label: '未滿1年', emoji: '🌱', image: 'assets/growth/growth-01-sprout.png', personaPoints: { careerDebugger: 1 } },
      { value: '1to3', rank: 2, label: '1–3年', emoji: '🌿', image: 'assets/growth/growth-02-plant.png', personaPoints: { careerDebugger: 1 } },
      { value: '3to5', rank: 3, label: '3–5年', emoji: '🌳', image: 'assets/growth/growth-03-tree.png', personaPoints: { radarWatcher: 1 } },
      { value: '5to10', rank: 4, label: '5–10年', emoji: '🌲', image: 'assets/growth/growth-04-big-tree.png', personaPoints: { stableGrowth: 1 } },
      { value: 'gt10', rank: 5, label: '10年以上', emoji: '🏔️', image: 'assets/growth/growth-05-skill-tree.png', personaPoints: { stableGrowth: 2 } }
    ]
  },
  {
    id: 'satisfaction',
    level: 3,
    type: 'single',
    visualStyle: 'mood',
    // 有高低順序的題目：手機上改成垂直清單，右邊用等級格標出程度
    layout: 'ladder',
    characterMood: 'thinking',
    prompt: '現在這份工作，你還好嗎？',
    options: [
      { value: 'great', rank: 5, label: '很滿意', emoji: '😄', personaPoints: { stableGrowth: 2 }, dimensionValues: { stability: 5, careerBugIndex: 1 } },
      { value: 'good', rank: 4, label: '滿意', emoji: '🙂', personaPoints: { stableGrowth: 1 }, dimensionValues: { stability: 4, careerBugIndex: 2 } },
      { value: 'ok', rank: 3, label: '普通', emoji: '😐', personaPoints: { radarWatcher: 1 }, dimensionValues: { stability: 3, careerBugIndex: 3 } },
      { value: 'bad', rank: 2, label: '不太好', emoji: '😣', personaPoints: { careerDebugger: 1, jobHopper: 1 }, dimensionValues: { stability: 2, careerBugIndex: 4 } },
      { value: 'terrible', rank: 1, label: '我快不行了', emoji: '🥵', personaPoints: { jobHopper: 2, careerDebugger: 1 }, dimensionValues: { stability: 1, careerBugIndex: 5 } }
    ]
  },
  {
    id: 'salary',
    level: 4,
    type: 'single',
    visualStyle: 'coins',
    // 有高低順序的題目：手機上改成垂直清單，右邊用等級格標出程度
    layout: 'ladder',
    characterMood: 'money',
    prompt: '目前薪資落在哪個補給區？',
    subtitle: '月薪，新台幣',
    options: [
      { value: 'under40', rank: 1, label: '<40K', emoji: '🪙', personaPoints: { careerDebugger: 2 } },
      { value: '40to60', rank: 2, label: '40–60K', emoji: '🪙', personaPoints: { careerDebugger: 1 } },
      { value: '60to80', rank: 3, label: '60–80K', emoji: '🪙', personaPoints: { radarWatcher: 1 } },
      { value: '80to100', rank: 4, label: '80–100K', emoji: '🪙', personaPoints: { stableGrowth: 1 } },
      { value: 'over100', rank: 5, label: '100K+', emoji: '🪙', personaPoints: { stableGrowth: 1 } },
      { value: 'secret', offScale: true, label: '秘密', emoji: '🤐', personaPoints: { radarWatcher: 1 } }
    ]
  },
  {
    id: 'headhunterReaction',
    level: 5,
    type: 'single',
    visualStyle: 'comic',
    // 有高低順序的題目：手機上改成垂直清單，右邊用等級格標出程度
    layout: 'ladder',
    characterMood: 'searching',
    prompt: '現在有獵頭敲你，你會？',
    options: [
      { value: 'ignore', rank: 1, label: '不理', emoji: '🙅', personaPoints: { stableGrowth: 2 }, dimensionValues: { radar: 1 } },
      { value: 'peek', rank: 2, label: '看看', emoji: '👀', personaPoints: { radarWatcher: 2 }, dimensionValues: { radar: 3 } },
      { value: 'chat', rank: 3, label: '聊聊', emoji: '💬', personaPoints: { radarWatcher: 1, jobHopper: 1 }, dimensionValues: { radar: 4 } },
      { value: 'please', rank: 4, label: '拜託快找我', emoji: '🙏', personaPoints: { jobHopper: 2 }, dimensionValues: { radar: 5 } }
    ]
  },
  {
    id: 'jumpThreshold',
    level: 6,
    type: 'single',
    visualStyle: 'chips',
    // 有高低順序的題目：手機上改成垂直清單，右邊用等級格標出程度
    layout: 'ladder',
    characterMood: 'rocket',
    prompt: 'Boss 出多少，你願意跳槽？',
    options: [
      { value: 'noRaise', rank: 1, label: '不加也走', emoji: '🪙', personaPoints: { jobHopper: 2 }, dimensionValues: { radar: 5 } },
      { value: 'plus10', rank: 2, label: '+10%', emoji: '🪙', personaPoints: { jobHopper: 1, radarWatcher: 1 }, dimensionValues: { radar: 4 } },
      { value: 'plus20', rank: 3, label: '+20%', emoji: '🪙', personaPoints: { radarWatcher: 1 }, dimensionValues: { radar: 3 } },
      { value: 'plus30', rank: 4, label: '+30%', emoji: '🪙', personaPoints: { stableGrowth: 1 }, dimensionValues: { radar: 2 } },
      { value: 'jobFit', offScale: true, label: '工作適合比較重要', emoji: '❤️', personaPoints: { stableGrowth: 2 }, dimensionValues: { radar: 1 } },
      { value: 'remoteFlex', offScale: true, label: '遠端／彈性比薪水重要', emoji: '🏠', personaPoints: { stableGrowth: 1, radarWatcher: 1 }, dimensionValues: { radar: 2 } }
    ]
  },
  {
    id: 'careerBug',
    level: 7,
    type: 'multi',
    visualStyle: 'bugs',
    characterMood: 'stressed',
    prompt: '你目前的職涯卡點？（可複選 3 項）',
    maxSelections: 3,
    exclusiveOption: 'noBug',
    // Averaged rather than summed: picking three bugs says something about
    // which bugs, not that this one question should outweigh every other.
    blendMultiScores: true,
    options: [
      { value: 'salary', label: '薪資卡住', emoji: '🐛', image: 'assets/bugs/bug-salary.png', personaPoints: { careerDebugger: 2 }, dimensionValues: { careerBugIndex: 4 } },
      { value: 'boss', label: '主管問題', emoji: '🐛', image: 'assets/bugs/bug-boss.png', personaPoints: { careerDebugger: 2 }, dimensionValues: { careerBugIndex: 5 } },
      { value: 'hours', label: '工時太長', emoji: '🐛', image: 'assets/bugs/bug-workload.png', personaPoints: { careerDebugger: 1, jobHopper: 1 }, dimensionValues: { careerBugIndex: 4 } },
      { value: 'skill', label: '技術焦慮', emoji: '🐛', image: 'assets/bugs/bug-technology.png', personaPoints: { careerDebugger: 1, aiEvolved: -1 }, dimensionValues: { careerBugIndex: 3 } },
      { value: 'promotion', label: '升遷卡關', emoji: '🐛', image: 'assets/bugs/bug-promotion.png', personaPoints: { careerDebugger: 1, radarWatcher: 1 }, dimensionValues: { careerBugIndex: 3 } },
      { value: 'noOpportunity', label: '沒好機會', emoji: '🐛', image: 'assets/bugs/bug-noopportunity.png', personaPoints: { jobHopper: 1, careerDebugger: 1 }, dimensionValues: { careerBugIndex: 4 } },
      { value: 'aiAnxiety', label: 'AI焦慮', emoji: '🐛', image: 'assets/bugs/bug-ai.png', personaPoints: { careerDebugger: 2, aiEvolved: -2 }, dimensionValues: { careerBugIndex: 5 } },
      { value: 'noBug', label: '目前沒什麼Bug', emoji: '✨', image: 'assets/bugs/bug-noBug.png', personaPoints: { stableGrowth: 2 }, dimensionValues: { careerBugIndex: 1 } }
    ]
  },
  {
    id: 'aiFrequency',
    level: 8,
    type: 'single',
    visualStyle: 'robot',
    // 有高低順序的題目：手機上改成垂直清單，右邊用等級格標出程度
    layout: 'ladder',
    characterMood: 'ai',
    prompt: 'AI 已經進入你的工作了嗎？',
    options: [
      { value: 'daily', rank: 4, label: '每天', emoji: '🤖', personaPoints: { aiEvolved: 2 }, dimensionValues: { aiAdapt: 5 }, buffLabel: '重度 AI 工具使用者' },
      { value: 'sometimes', rank: 3, label: '偶爾', emoji: '🤖', personaPoints: { aiEvolved: 1 }, dimensionValues: { aiAdapt: 4 }, buffLabel: 'AI 輕度使用者' },
      { value: 'learning', rank: 2, label: '正在學', emoji: '🤖', personaPoints: { aiEvolved: 1 }, dimensionValues: { aiAdapt: 3 }, buffLabel: 'AI 學習中' },
      { value: 'rarely', rank: 1, label: '幾乎不用', emoji: '🤖', personaPoints: { careerDebugger: 1 }, dimensionValues: { aiAdapt: 2 }, buffLabel: 'AI 觀望者' },
      { value: 'notAllowed', offScale: true, label: '公司不給用', emoji: '🤖', personaPoints: { careerDebugger: 1 }, dimensionValues: { aiAdapt: 1 }, buffLabel: 'AI 待解鎖' }
    ]
  },
  {
    id: 'aiTools',
    level: 9,
    type: 'multi',
    visualStyle: 'gear',
    characterMood: 'ai',
    prompt: '你現在最常用哪個 AI Coding 夥伴？（可複選 3 項）',
    maxSelections: 3,
    exclusiveOption: 'none',
    options: [
      { value: 'chatgpt', label: 'ChatGPT', emoji: '💬', personaPoints: { aiEvolved: 1 } },
      { value: 'claude', label: 'Claude', emoji: '🟣', personaPoints: { aiEvolved: 1 } },
      { value: 'cursor', label: 'Cursor', emoji: '⌨️', personaPoints: { aiEvolved: 1 } },
      { value: 'copilot', label: 'Copilot', emoji: '🧑‍✈️', personaPoints: { aiEvolved: 1 } },
      { value: 'gemini', label: 'Gemini', emoji: '♊', personaPoints: { aiEvolved: 1 } },
      { value: 'windsurf', label: 'Windsurf', emoji: '🏄', personaPoints: { aiEvolved: 1 } },
      { value: 'other', label: '其他', emoji: '✨', personaPoints: { aiEvolved: 1 } },
      { value: 'none', label: '沒使用', emoji: '🚫', personaPoints: { careerDebugger: 1, aiEvolved: -1 } }
    ]
  },
  {
    id: 'aiImpact',
    level: 10,
    type: 'single',
    visualStyle: 'scenario',
    characterMood: 'ai',
    prompt: 'AI 讓你最有感的是？',
    options: [
      { value: 'faster', label: '開發變快', emoji: '⚡', personaPoints: { aiEvolved: 2 }, dimensionValues: { aiAdapt: 5 } },
      { value: 'learning', label: '學習變快', emoji: '📚', personaPoints: { aiEvolved: 2 }, dimensionValues: { aiAdapt: 5 } },
      { value: 'changed', label: '工作內容改變', emoji: '🔄', personaPoints: { aiEvolved: 1, radarWatcher: 1 }, dimensionValues: { aiAdapt: 4 } },
      { value: 'worried', label: '開始擔心被取代', emoji: '😰', personaPoints: { careerDebugger: 2, aiEvolved: -1 }, dimensionValues: { aiAdapt: 2 } },
      { value: 'noDiff', label: '沒什麼差', emoji: '🤷', personaPoints: { stableGrowth: 1 }, dimensionValues: { aiAdapt: 3 } }
    ]
  },
  {
    id: 'aiFear',
    level: 11,
    type: 'single',
    visualStyle: 'monster',
    characterMood: 'overwhelmed',
    prompt: 'AI 時代，你最怕哪件事？',
    options: [
      { value: 'skillGap', label: '技術跟不上', emoji: '👹', personaPoints: { careerDebugger: 1, aiEvolved: -1 }, dimensionValues: { careerBugIndex: 4 } },
      { value: 'juniorOpportunity', label: 'Junior機會減少', emoji: '👹', personaPoints: { careerDebugger: 1 }, dimensionValues: { careerBugIndex: 3 } },
      { value: 'salaryPressure', label: '薪資被壓縮', emoji: '👹', personaPoints: { careerDebugger: 1, jobHopper: 1 }, dimensionValues: { careerBugIndex: 4 } },
      { value: 'workloadSurge', label: '公司要求產能暴增', emoji: '👹', personaPoints: { careerDebugger: 1, jobHopper: 1 }, dimensionValues: { careerBugIndex: 4 } },
      { value: 'notScared', label: '其實不怕', emoji: '💪', personaPoints: { aiEvolved: 2, stableGrowth: 1 }, dimensionValues: { careerBugIndex: 1 } }
    ]
  },
  {
    id: 'goal2027',
    level: 12,
    type: 'single',
    visualStyle: 'badge',
    characterMood: 'trophy',
    prompt: '2027 你最想解鎖什麼成就？',
    options: [
      { value: 'raise', label: '加薪', emoji: '💰', image: 'assets/badges/badge-salary.png', personaPoints: { careerDebugger: 1 } },
      { value: 'switchJob', label: '跳槽', emoji: '🚪', image: 'assets/badges/badge-job-change.png', personaPoints: { jobHopper: 2 } },
      { value: 'senior', label: '升Senior', emoji: '⭐', image: 'assets/badges/badge-senior.png', personaPoints: { radarWatcher: 1 } },
      { value: 'foreign', label: '進外商', emoji: '🌍', image: 'assets/badges/badge-global.png', personaPoints: { radarWatcher: 1, jobHopper: 1 } },
      { value: 'remote', label: '全遠端', emoji: '🏡', image: 'assets/badges/badge-remote.png', personaPoints: { stableGrowth: 1 } },
      { value: 'switchToAI', label: '轉AI', emoji: '🤖', image: 'assets/badges/badge-ai.png', personaPoints: { aiEvolved: 2 } },
      { value: 'techLevelUp', label: '技術大升級', emoji: '🧠', image: 'assets/badges/badge-tech-levelup.png', personaPoints: { aiEvolved: 1, stableGrowth: 1 } },
      { value: 'wlb', label: 'WLB', emoji: '⚖️', image: 'assets/badges/badge-work-life-balance.png', personaPoints: { stableGrowth: 1, careerDebugger: 1 } }
    ]
  }
];
