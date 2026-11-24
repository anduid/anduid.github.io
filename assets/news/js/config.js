---
---
window.ANDU_CONFIG = {
  GAS_WEBAPP_URL: {{ site.gas_webapp_url | jsonify }},
  BASE: {{ site.news_base | jsonify }},
  XP_READ: 25, XP_BONUS: 40, XP_PER_LEVEL: 100, SCROLL_CLAIM: 0.95, WPM: 200, PAGE_SIZE: 6,
  CATEGORIES: {{ site.data.categories | jsonify }},
  MONSTERS: {{ site.data.monsters | jsonify }},
  MISSIONS: [
    { key: 'read', target: 3, id: 'Baca 3 berita sampai tuntas', en: 'Finish reading 3 articles' },
    { key: 'comment', target: 1, id: 'Tulis 1 komentar', en: 'Write 1 comment' }
  ]
};
