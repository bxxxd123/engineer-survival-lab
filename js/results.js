export const PERSONA_PRIORITY = ['aiEvolved', 'jobHopper', 'careerDebugger', 'radarWatcher', 'stableGrowth'];

export const PERSONAS = {
  stableGrowth: {
    id: 'stableGrowth',
    emoji: '🌱',
    name: '穩定發育型',
    englishName: 'STABLE GROWTH',
    mascotImage: 'assets/mascot/persona-stable-growth.webp',
    accent: '#34D399',
    accentStrong: '#10B981',
    accentGlow: 'rgba(16, 185, 129, 0.35)',
    highlight: '把一件事做到底，比橫向亂跳更划算。',
    deepDive: {
      motivationTitle: '累積複利效應',
      motivation: '你的安全感來自「看得到進度」。比起職稱或薪資的跳躍式成長，你更相信每天多懂一點、多熟一點，累積出來的複利效應。',
      riskTitle: '深耕變舒適圈',
      risk: '最大的風險不是不成長，而是分不清楚「深耕」跟「舒適圈」的差別——同樣的技術棧待五年，可能是專家，也可能只是待得久。',
      actionTitle: '每季自我檢核',
      action: '每季問自己一次：這三個月我真的變厲害了嗎？還是只是變熟練？如果答案連續兩次都是後者，該考慮的不是離職，是換題目。'
    }
  },
  radarWatcher: {
    id: 'radarWatcher',
    emoji: '👀',
    name: '機會雷達型',
    englishName: 'OPPORTUNITY RADAR',
    mascotImage: 'assets/mascot/persona-opportunity-radar.webp',
    accent: '#38BDF8',
    accentStrong: '#0EA5E9',
    accentGlow: 'rgba(14, 165, 233, 0.35)',
    highlight: '雷達一直開著，你在等一個夠好的理由。',
    deepDive: {
      motivationTitle: '風險對沖佈局',
      motivation: '你不是騎驢找馬，是在做風險對沖——維持對外連結，讓自己永遠有一張備用地圖，不會被單一公司的變動打得措手不及。',
      riskTitle: '只看不決定',
      risk: '雷達開太久沒收穫，容易養成「只看不做決定」的習慣，機會來了也提不起勁認真談，因為潛意識裡覺得反正還有下一個。',
      actionTitle: '設定門檻測試',
      action: '設一個具體門檻（例如某個薪資數字、某個職稱），一旦出現符合門檻的機會，強迫自己走到最後一關，不管最後接不接受。'
    }
  },
  jobHopper: {
    id: 'jobHopper',
    emoji: '🚀',
    name: '準備跳槽型',
    englishName: 'READY TO JUMP',
    mascotImage: 'assets/mascot/persona-ready-to-jump.webp',
    accent: '#FBBF24',
    accentStrong: '#F59E0B',
    accentGlow: 'rgba(245, 158, 11, 0.35)',
    highlight: '不是要不要走，是在等一個點頭的 offer。',
    deepDive: {
      motivationTitle: '等待觸發點',
      motivation: '你已經算過帳了：留下來的邊際效益在下降，離開的風險你也評估過，現在只是在等一個讓整件事「值得」的觸發點。',
      riskTitle: '急就章風險',
      risk: '最容易犯的錯，是因為太想離開現在的痛苦，把「趕快有下一份工作」當成目標，而不是「找到真正對的下一份工作」。',
      actionTitle: '反向追問原因',
      action: '面談時反過來問對方：這個位置為什麼現在缺人？前一位在職多久、為什麼離開？答案會告訴你這是不是同一個坑。'
    }
  },
  careerDebugger: {
    id: 'careerDebugger',
    emoji: '🐛',
    name: '職涯Debug型',
    englishName: 'CAREER DEBUG',
    mascotImage: 'assets/mascot/persona-career-debug.webp',
    accent: '#F87171',
    accentStrong: '#EF4444',
    accentGlow: 'rgba(239, 68, 68, 0.35)',
    highlight: '不是壞掉，是太多小 bug 疊在一起。',
    deepDive: {
      motivationTitle: '多重問題疊加',
      motivation: '你不是玻璃心，是同時承受太多個「還可以忍」的小問題，單獨看都不到辭職的門檻，加總起來卻已經在透支。',
      riskTitle: '分心處理落空',
      risk: '同時處理太多問題最容易導致的結果是全部都處理一半，最後精疲力盡卻感覺不到任何一個真的變好，反而更挫折。',
      actionTitle: '聚焦單一優先',
      action: '花十分鐘寫下所有困擾你的事，圈出「只要它消失、其他都能忍」的那一個，這一季只集中火力解決這一個。'
    }
  },
  aiEvolved: {
    id: 'aiEvolved',
    emoji: '🤖',
    name: 'AI超進化型',
    englishName: 'AI EVOLVED',
    mascotImage: 'assets/mascot/persona-ai-evolved.webp',
    accent: '#A78BFA',
    accentStrong: '#8B5CF6',
    accentGlow: 'rgba(139, 92, 246, 0.35)',
    highlight: 'AI 不是威脅，是你這階段最大的槓桿。',
    deepDive: {
      motivationTitle: '保有決策權',
      motivation: '你很早就想通一件事：與其擔心 AI 取代你的工作，不如先確保自己是那個決定怎麼用 AI 的人，而不是被工具推著走的人。',
      riskTitle: '基本功退化',
      risk: '容易低估「基本功」的重要性——如果太依賴 AI 產出，久了可能會失去自己判斷對錯、debug 到底層原因的直覺跟手感。',
      actionTitle: '無 AI 挑戰',
      action: '定期挑一個你完全靠 AI 完成的任務，試著不用 AI 重做一次，確認自己還跟得上，AI 是加速器，不該是唯一的引擎。'
    }
  }
};
