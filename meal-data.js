/* 共享餐单数据：index.html（餐单）与 prep.html（备料计算）共用的单一数据源。
   食材用量写在每日餐单 meals[].items[].amount（单位见 foodBases[key].unit），
   修改餐单请改这里，两个页面自动同步。 */
window.MealData = (function () {
  'use strict';

  /* 食物基准值（每 baseAmount 对应的营养） */
  const foodBases = {
      corn: { name: '玉米（真空包装）', basis: '每根（带芯约333g）', baseAmount: 333, unit: 'g', kcal: 212, protein: 6.6, carbs: 41.4, fat: 2.4 },
      wholeEgg: { name: '全蛋', basis: '每1个', baseAmount: 1, unit: '个', kcal: 72, protein: 6.3, carbs: 0.6, fat: 5 },
      highProteinMilk: { name: '高蛋白低脂奶', basis: '每100ml', baseAmount: 100, unit: 'ml', kcal: 36, protein: 4.2, carbs: 2.8, fat: 0.8 },
      pasteurizedWholeMilk: { name: '鲜牛奶（巴氏全脂）', basis: '每100ml', baseAmount: 100, unit: 'ml', kcal: 67, protein: 3.3, carbs: 4.8, fat: 3.9 },
      filetSteakRaw: { name: '菲力牛排（生）', basis: '每100g', baseAmount: 100, unit: 'g', kcal: 130, protein: 21, carbs: 0, fat: 5 },
      oysterBladeSteak: { name: '板腱牛排（生）', basis: '每100g', baseAmount: 100, unit: 'g', kcal: 140, protein: 20.5, carbs: 0, fat: 5.5 },
      chickenBreastRaw: { name: '鸡胸肉（生）', basis: '每100g', baseAmount: 100, unit: 'g', kcal: 120, protein: 23, carbs: 0, fat: 2.6 },
      chickenThighRaw: { name: '去皮鸡腿（生）', basis: '每100g', baseAmount: 100, unit: 'g', kcal: 145, protein: 19, carbs: 0, fat: 8 },
      // 鸡排：能量 365kJ ≈ 87kcal（1kcal = 4.184kJ）
      chickenSteak: { name: '鸡排', basis: '每100g', baseAmount: 100, unit: 'g', kcal: 87, protein: 14.3, carbs: 4.8, fat: 1.1, sodiumMg: 325 },
      // 青花鱼排（挪威鲭鱼，生）：Omega-3（EPA+DHA）约 2.6g/100g，补足脂肪与 Omega-3
      mackerel: { name: '青花鱼排（生）', basis: '每100g', baseAmount: 100, unit: 'g', kcal: 205, protein: 19, carbs: 0, fat: 14 },
      sweetPotato: { name: '红薯（生）', basis: '每100g', baseAmount: 100, unit: 'g', kcal: 86, protein: 1.6, carbs: 20.1, fat: 0.1 },
      potato: { name: '土豆（生）', basis: '每100g', baseAmount: 100, unit: 'g', kcal: 77, protein: 2.0, carbs: 17.2, fat: 0.1 },
      kabochaPumpkin: { name: '贝贝南瓜（可食部）', basis: '每100g', baseAmount: 100, unit: 'g', kcal: 91, protein: 1.5, carbs: 20, fat: 0.2 },
      cucumber: { name: '黄瓜条', basis: '每100g', baseAmount: 100, unit: 'g', kcal: 15, protein: 0.8, carbs: 2.9, fat: 0.2 },
      bellPepper: { name: '彩椒（生）', basis: '每100g', baseAmount: 100, unit: 'g', kcal: 31, protein: 1.0, carbs: 6.0, fat: 0.3 },
      banana: { name: '香蕉（可食部）', basis: '每100g', baseAmount: 100, unit: 'g', kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
      kiwi: { name: '猕猴桃（可食部）', basis: '每100g', baseAmount: 100, unit: 'g', kcal: 61, protein: 1.1, carbs: 14.5, fat: 0.5 },
      oats: { name: '即食燕麦片', basis: '每25g', baseAmount: 25, unit: 'g', kcal: 95, protein: 3.3, carbs: 16, fat: 1.8 },
      wholeWheatNoodles: {
        name: '全麦面（云山半）', basis: '每100g', baseAmount: 100, unit: 'g',
        kcal: 365, energyKj: 1526, protein: 14.4, carbs: 70.6, fat: 2.2,
        saturatedFatG: 0.4, sugarsG: 3.9, sodiumMg: 170,
        packageSizeG: 200, packageCount: 2,
        ingredients: '黑全麦粉、荞麦粉（30%）、饮用水、食用盐',
      },
      haitianSoySauce: { name: '海天零添加酱油', basis: '每15ml', baseAmount: 15, unit: 'ml', energyKj: 70, kcal: 70 / 4.184, protein: 1.8, carbs: 2.3, fat: 0, sodiumMg: 938 },
      choppedChili: { name: '精制剁辣椒', basis: '每100g', baseAmount: 100, unit: 'g', energyKj: 136, kcal: 136 / 4.184, protein: 1.3, carbs: 6.7, fat: 0, sodiumMg: 3200 },
      wujiangPickledMustard: { name: '乌江榨菜', basis: '每50g', baseAmount: 50, unit: 'g', energyKj: 308, kcal: 308 / 4.184, protein: 0.6, carbs: 0.5, fat: 7.5, sodiumMg: 1000 },
      lard: { name: '猪油（无盐）', basis: '每100g', baseAmount: 100, unit: 'g', kcal: 902, protein: 0, carbs: 0, fat: 100, sodiumMg: 0 },
      whey: { name: '蛋白粉', basis: '每31g（约1勺）', baseAmount: 31, unit: 'g', kcal: 121, protein: 23.6, carbs: 3.8, fat: 1.1 },
      almonds: { name: '巴旦木（杏仁）', basis: '每10g', baseAmount: 10, unit: 'g', kcal: 58, protein: 2.1, carbs: 2.0, fat: 5.0 },
      camelliaOil: { name: '山茶油（烹饪）', basis: '每5ml（1茶匙）', baseAmount: 5, unit: 'ml', kcal: 45, protein: 0, carbs: 0, fat: 5 },
      butter: { name: '黄油（烹饪）', basis: '每10g', baseAmount: 10, unit: 'g', kcal: 72, protein: 0.1, carbs: 0, fat: 8.1 },
    };

  /* 每碗 100g 干全麦面的拌面调料 */
  const noodleSeasonings = [
    { foodKey: 'haitianSoySauce', amount: 2, amountText: '2ml（约2–2.5g）', summaryText: '海天酱油 2ml（约2–2.5g）' },
    { foodKey: 'choppedChili', amount: 2, summaryText: '精制剁辣椒 2g' },
    { foodKey: 'wujiangPickledMustard', amount: 4, summaryText: '乌江榨菜 4g' },
    { foodKey: 'lard', amount: 3, summaryText: '无盐猪油 3g' },
  ];

  /* 每日餐单：每周 7 天（周一至周日） */
  const userDays = [
      {
        shortName: '周一 胸',
        title: '周一 · 练胸日',
        tag: '💪 训练·高碳',
        tagClass: 'tag-high',
        meals: [
          {
            type: 'breakfast', name: '🌅 早餐',
            items: [
              { foodKey: 'corn', amount: 200, amountText: '200g（约2/3根）', summaryText: '玉米 200g（约2/3根）' },
              { foodKey: 'wholeEgg', amount: 2, amountText: '2个', summaryText: '全蛋 2个' },
              { foodKey: 'highProteinMilk', amount: 250, amountText: '250ml', summaryText: '高蛋白低脂奶 250ml' },

            ],
          },
          {
            type: 'lunch', name: '🍱 午餐',
            alternatives: ['贝贝南瓜（可食部约350g）可替换红薯和土豆'],
            items: [
              { foodKey: 'chickenSteak', amount: 200, amountText: '2袋（200g）', summaryText: '鸡排 2袋（200g）', highlight: true },
              { foodKey: 'sweetPotato', amount: 195, amountText: '195g', summaryText: '红薯（生）195g' },
              { foodKey: 'potato', amount: 195, amountText: '195g', summaryText: '土豆（生）195g' },
              { foodKey: 'cucumber', amount: 150, amountText: '150g', summaryText: '黄瓜条 150g' },
            ],
          },
          {
            type: 'pre', name: '⚡ 练前 60min',
            items: [
              { foodKey: 'banana', amount: 120, amountText: '120g（约1根）', summaryText: '香蕉 1根（可食部约120g）' },
            ],
          },
          {
            type: 'dinner', name: '🌙 晚餐（练后）',
            items: [
              { foodKey: 'chickenSteak', amount: 200, amountText: '2袋（200g）', summaryText: '鸡排 2袋（200g）', highlight: true },
              { foodKey: 'whey', amount: 15, amountText: '半勺（约15g）', summaryText: '蛋白粉 半勺（约15g）' },
              { foodKey: 'almonds', amount: 30, amountText: '约21粒', summaryText: '巴旦木 约21粒（30g）' },
              { foodKey: 'wholeWheatNoodles', amount: 100, amountText: '100g（干重）', summaryText: '全麦面（干重）100g' },
              ...noodleSeasonings,
              { foodKey: 'bellPepper', amount: 200, amountText: '200g（去蒂去籽后生重）', summaryText: '彩椒 200g（去蒂去籽后生重）' },
            ],
          },
        ],
      },
      {
        shortName: '周二 背',
        title: '周二 · 练背日',
        tag: '💪 训练·高碳',
        tagClass: 'tag-high',
        meals: [
          {
            type: 'breakfast', name: '🌅 早餐',
            items: [
              { foodKey: 'corn', amount: 200, amountText: '200g（约2/3根）', summaryText: '玉米 200g（约2/3根）' },
              { foodKey: 'wholeEgg', amount: 2, amountText: '2个', summaryText: '全蛋 2个' },
              { foodKey: 'highProteinMilk', amount: 250, amountText: '250ml', summaryText: '高蛋白低脂奶 250ml' },

            ],
          },
          {
            type: 'lunch', name: '🍱 午餐',
            alternatives: ['贝贝南瓜（可食部约350g）可替换红薯和土豆'],
            items: [
              { foodKey: 'chickenSteak', amount: 200, amountText: '2袋（200g）', summaryText: '鸡排 2袋（200g）', highlight: true },
              { foodKey: 'sweetPotato', amount: 195, amountText: '195g', summaryText: '红薯（生）195g' },
              { foodKey: 'potato', amount: 195, amountText: '195g', summaryText: '土豆（生）195g' },
              { foodKey: 'cucumber', amount: 150, amountText: '150g', summaryText: '黄瓜条 150g' },
            ],
          },
          {
            type: 'pre', name: '⚡ 练前 60min',
            items: [
              { foodKey: 'banana', amount: 120, amountText: '120g（约1根）', summaryText: '香蕉 1根（可食部约120g）' },
            ],
          },
          {
            type: 'dinner', name: '🌙 晚餐（练后）',
            items: [
              { foodKey: 'chickenSteak', amount: 200, amountText: '2袋（200g）', summaryText: '鸡排 2袋（200g）', highlight: true },
              { foodKey: 'whey', amount: 15, amountText: '半勺（约15g）', summaryText: '蛋白粉 半勺（约15g）' },
              { foodKey: 'almonds', amount: 30, amountText: '约21粒', summaryText: '巴旦木 约21粒（30g）' },
              { foodKey: 'wholeWheatNoodles', amount: 100, amountText: '100g（干重）', summaryText: '全麦面（干重）100g' },
              ...noodleSeasonings,
              { foodKey: 'bellPepper', amount: 200, amountText: '200g（去蒂去籽后生重）', summaryText: '彩椒 200g（去蒂去籽后生重）' },
            ],
          },
        ],
      },
      {
        shortName: '周三 腿',
        title: '周三 · 练腿日',
        tag: '💪 训练·最高碳',
        tagClass: 'tag-high',
        meals: [
          {
            type: 'breakfast', name: '🌅 早餐',
            items: [
              { foodKey: 'corn', amount: 200, amountText: '200g（约2/3根）', summaryText: '玉米 200g（约2/3根）' },
              { foodKey: 'wholeEgg', amount: 2, amountText: '2个', summaryText: '全蛋 2个' },
              { foodKey: 'highProteinMilk', amount: 250, amountText: '250ml', summaryText: '高蛋白低脂奶 250ml' },

            ],
          },
          {
            type: 'lunch', name: '🍱 午餐',
            alternatives: ['贝贝南瓜（可食部约385g）可替换红薯和土豆'],
            items: [
              { foodKey: 'chickenSteak', amount: 200, amountText: '2袋（200g）', summaryText: '鸡排 2袋（200g）', highlight: true },
              { foodKey: 'sweetPotato', amount: 215, amountText: '215g', summaryText: '红薯（生）215g' },
              { foodKey: 'potato', amount: 215, amountText: '215g', summaryText: '土豆（生）215g' },
              { foodKey: 'cucumber', amount: 150, amountText: '150g', summaryText: '黄瓜条 150g' },
            ],
          },
          {
            type: 'pre', name: '⚡ 练前 60min',
            items: [
              { foodKey: 'banana', amount: 120, amountText: '120g（约1根）', summaryText: '香蕉 1根（可食部约120g）' },
            ],
          },
          {
            type: 'dinner', name: '🌙 晚餐（练后）',
            items: [
              { foodKey: 'mackerel', amount: 200, amountText: '1块（200g）', summaryText: '青花鱼排 1块（200g）', highlight: true },
              { foodKey: 'whey', amount: 15, amountText: '半勺（约15g）', summaryText: '蛋白粉 半勺（约15g）' },
              { foodKey: 'almonds', amount: 30, amountText: '约21粒', summaryText: '巴旦木 约21粒（30g）' },
              { foodKey: 'wholeWheatNoodles', amount: 100, amountText: '100g（干重）', summaryText: '全麦面（干重）100g' },
              ...noodleSeasonings,
              { foodKey: 'bellPepper', amount: 200, amountText: '200g（去蒂去籽后生重）', summaryText: '彩椒 200g（去蒂去籽后生重）' },
            ],
          },
        ],
      },
      {
        shortName: '周四 肩',
        title: '周四 · 练肩日',
        tag: '💪 训练·中碳',
        tagClass: 'tag-mid',
        meals: [
          {
            type: 'breakfast', name: '🌅 早餐',
            items: [
              { foodKey: 'corn', amount: 200, amountText: '200g（约2/3根）', summaryText: '玉米 200g（约2/3根）' },
              { foodKey: 'wholeEgg', amount: 2, amountText: '2个', summaryText: '全蛋 2个' },
              { foodKey: 'highProteinMilk', amount: 250, amountText: '250ml', summaryText: '高蛋白低脂奶 250ml' },

            ],
          },
          {
            type: 'lunch', name: '🍱 午餐',
            alternatives: ['贝贝南瓜（可食部约315g）可替换红薯和土豆'],
            items: [
              { foodKey: 'chickenSteak', amount: 200, amountText: '2袋（200g）', summaryText: '鸡排 2袋（200g）', highlight: true },
              { foodKey: 'sweetPotato', amount: 175, amountText: '175g', summaryText: '红薯（生）175g' },
              { foodKey: 'potato', amount: 175, amountText: '175g', summaryText: '土豆（生）175g' },
              { foodKey: 'cucumber', amount: 150, amountText: '150g', summaryText: '黄瓜条 150g' },
            ],
          },
          {
            type: 'pre', name: '⚡ 练前 60min',
            items: [
              { foodKey: 'banana', amount: 120, amountText: '120g（约1根）', summaryText: '香蕉 1根（可食部约120g）' },
            ],
          },
          {
            type: 'dinner', name: '🌙 晚餐（练后）',
            items: [
              { foodKey: 'chickenSteak', amount: 200, amountText: '2袋（200g）', summaryText: '鸡排 2袋（200g）', highlight: true },
              { foodKey: 'whey', amount: 15, amountText: '半勺（约15g）', summaryText: '蛋白粉 半勺（约15g）' },
              { foodKey: 'almonds', amount: 30, amountText: '约21粒', summaryText: '巴旦木 约21粒（30g）' },
              { foodKey: 'wholeWheatNoodles', amount: 100, amountText: '100g（干重）', summaryText: '全麦面（干重）100g' },
              ...noodleSeasonings,
              { foodKey: 'bellPepper', amount: 200, amountText: '200g（去蒂去籽后生重）', summaryText: '彩椒 200g（去蒂去籽后生重）' },
            ],
          },
        ],
      },
      {
        shortName: '周五 腹',
        title: '周五 · 练腹日',
        tag: '💪 训练·中碳',
        tagClass: 'tag-mid',
        meals: [
          {
            type: 'breakfast', name: '🌅 早餐',
            items: [
              { foodKey: 'corn', amount: 200, amountText: '200g（约2/3根）', summaryText: '玉米 200g（约2/3根）' },
              { foodKey: 'wholeEgg', amount: 2, amountText: '2个', summaryText: '全蛋 2个' },
              { foodKey: 'highProteinMilk', amount: 250, amountText: '250ml', summaryText: '高蛋白低脂奶 250ml' },

            ],
          },
          {
            type: 'lunch', name: '🍱 午餐',
            alternatives: ['贝贝南瓜（可食部约315g）可替换红薯和土豆'],
            items: [
              { foodKey: 'chickenSteak', amount: 200, amountText: '2袋（200g）', summaryText: '鸡排 2袋（200g）', highlight: true },
              { foodKey: 'sweetPotato', amount: 175, amountText: '175g', summaryText: '红薯（生）175g' },
              { foodKey: 'potato', amount: 175, amountText: '175g', summaryText: '土豆（生）175g' },
              { foodKey: 'cucumber', amount: 150, amountText: '150g', summaryText: '黄瓜条 150g' },
            ],
          },
          {
            type: 'pre', name: '⚡ 练前 60min',
            items: [
              { foodKey: 'banana', amount: 120, amountText: '120g（约1根）', summaryText: '香蕉 1根（可食部约120g）' },
            ],
          },
          {
            type: 'dinner', name: '🌙 晚餐（练后）',
            items: [
              { foodKey: 'mackerel', amount: 200, amountText: '1块（200g）', summaryText: '青花鱼排 1块（200g）', highlight: true },
              { foodKey: 'whey', amount: 15, amountText: '半勺（约15g）', summaryText: '蛋白粉 半勺（约15g）' },
              { foodKey: 'almonds', amount: 30, amountText: '约21粒', summaryText: '巴旦木 约21粒（30g）' },
              { foodKey: 'wholeWheatNoodles', amount: 100, amountText: '100g（干重）', summaryText: '全麦面（干重）100g' },
              ...noodleSeasonings,
              { foodKey: 'bellPepper', amount: 200, amountText: '200g（去蒂去籽后生重）', summaryText: '彩椒 200g（去蒂去籽后生重）' },
            ],
          },
        ],
      },
      {
        shortName: '周六 修复',
        title: '周六 · 修复日',
        tag: '🛌 修复·中低碳',
        tagClass: 'tag-low',
        meals: [
          {
            type: 'breakfast', name: '🌅 早餐',
            items: [
              { foodKey: 'corn', amount: 200, amountText: '200g（约2/3根）', summaryText: '玉米 200g（约2/3根）' },
              { foodKey: 'wholeEgg', amount: 2, amountText: '2个', summaryText: '全蛋 2个' },
              { foodKey: 'highProteinMilk', amount: 200, amountText: '200ml', summaryText: '高蛋白低脂奶 200ml' },

            ],
          },
          {
            type: 'lunch', name: '🍱 午餐',
            alternatives: ['贝贝南瓜（可食部约270g）可替换红薯和土豆'],
            items: [
              { foodKey: 'chickenSteak', amount: 200, amountText: '2袋（200g）', summaryText: '鸡排 2袋（200g）', highlight: true },
              { foodKey: 'sweetPotato', amount: 150, amountText: '150g', summaryText: '红薯（生）150g' },
              { foodKey: 'potato', amount: 150, amountText: '150g', summaryText: '土豆（生）150g' },
              { foodKey: 'cucumber', amount: 150, amountText: '150g', summaryText: '黄瓜条 150g' },
            ],
          },
          {
            type: 'dinner', name: '🌙 晚餐',
            items: [
              { foodKey: 'chickenSteak', amount: 200, amountText: '2袋（200g）', summaryText: '鸡排 2袋（200g）', highlight: true },
              { foodKey: 'whey', amount: 15, amountText: '半勺（约15g）', summaryText: '蛋白粉 半勺（约15g）' },
              { foodKey: 'almonds', amount: 30, amountText: '约21粒', summaryText: '巴旦木 约21粒（30g）' },
              { foodKey: 'wholeWheatNoodles', amount: 100, amountText: '100g（干重）', summaryText: '全麦面（干重）100g' },
              ...noodleSeasonings,
              { foodKey: 'bellPepper', amount: 200, amountText: '200g（去蒂去籽后生重）', summaryText: '彩椒 200g（去蒂去籽后生重）' },
            ],
          },
          {
            type: 'pre', name: '🚶 运动',
            note: '快走 40 分钟 或 完全休息（二选一）',
          },
        ],
      },
      {
        shortName: '周日 修复',
        title: '周日 · 修复日',
        tag: '🛌 修复·中低碳',
        tagClass: 'tag-low',
        meals: [
          {
            type: 'breakfast', name: '🌅 早餐',
            items: [
              { foodKey: 'corn', amount: 200, amountText: '200g（约2/3根）', summaryText: '玉米 200g（约2/3根）' },
              { foodKey: 'wholeEgg', amount: 2, amountText: '2个', summaryText: '全蛋 2个' },
              { foodKey: 'highProteinMilk', amount: 200, amountText: '200ml', summaryText: '高蛋白低脂奶 200ml' },

            ],
          },
          {
            type: 'lunch', name: '🍱 午餐',
          alternatives: ['贝贝南瓜（可食部约250g）可替换红薯和土豆'],
            items: [
              { foodKey: 'chickenSteak', amount: 200, amountText: '2袋（200g）', summaryText: '鸡排 2袋（200g）', highlight: true },
              { foodKey: 'sweetPotato', amount: 140, amountText: '140g', summaryText: '红薯（生）140g' },
              { foodKey: 'potato', amount: 140, amountText: '140g', summaryText: '土豆（生）140g' },
              { foodKey: 'cucumber', amount: 150, amountText: '150g', summaryText: '黄瓜条 150g' },
            ],
          },
          {
            type: 'dinner', name: '🌙 晚餐',
            items: [
              { foodKey: 'chickenSteak', amount: 200, amountText: '2袋（200g）', summaryText: '鸡排 2袋（200g）', highlight: true },
              { foodKey: 'whey', amount: 15, amountText: '半勺（约15g）', summaryText: '蛋白粉 半勺（约15g）' },
              { foodKey: 'almonds', amount: 30, amountText: '约21粒', summaryText: '巴旦木 约21粒（30g）' },
              { foodKey: 'wholeWheatNoodles', amount: 100, amountText: '100g（干重）', summaryText: '全麦面（干重）100g' },
              ...noodleSeasonings,
              { foodKey: 'bellPepper', amount: 200, amountText: '200g（去蒂去籽后生重）', summaryText: '彩椒 200g（去蒂去籽后生重）' },
            ],
          },
        ],
      },
    ];

  /* 妹妹增重餐（每天固定模板） */
  const sisterDays = Array.from({ length: 7 }, (_, i) => ({
      shortName: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
      title: `增重餐 · ${['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i]}`,
      tag: '📈 健康增重',
      tagClass: 'tag-high',
      meals: [
        {
          type: 'breakfast', name: '🌅 早餐',
          items: [
            { foodKey: 'corn', amount: 333, amountText: '1根（带芯约333g）', summaryText: '玉米 1根（带芯约333g）' },
            { foodKey: 'wholeEgg', amount: 2, amountText: '2个', summaryText: '全蛋 2个' },
            { foodKey: 'pasteurizedWholeMilk', amount: 250, amountText: '250ml', summaryText: '鲜牛奶（全脂）250ml' },
          ],
        },
        {
          type: 'lunch', name: '🍱 午餐',
          items: [
            { foodKey: 'chickenSteak', amount: 100, amountText: '1袋（100g）', summaryText: '鸡排 1袋（100g）', highlight: true },
            { foodKey: 'sweetPotato', amount: 200, amountText: '200g', summaryText: '红薯（生）200g' },
            { foodKey: 'potato', amount: 80, amountText: '80g', summaryText: '土豆（生）80g' },
          ],
        },
        {
          type: 'snack', name: '🥜 下午加餐',
          items: [
            { foodKey: 'banana', amount: 120, amountText: '120g（约1根）', summaryText: '香蕉 1根（可食部约120g）' },
            { foodKey: 'almonds', amount: 20, amountText: '约14粒', summaryText: '巴旦木 约14粒（20g）' },
          ],
        },
        {
          type: 'dinner', name: '🌙 晚餐',
          items: [
            { foodKey: 'chickenSteak', amount: 100, amountText: '1袋（100g）', summaryText: '鸡排 1袋（100g）', highlight: true },
            { foodKey: 'sweetPotato', amount: 200, amountText: '200g', summaryText: '红薯（生）200g' },
            { foodKey: 'potato', amount: 80, amountText: '80g', summaryText: '土豆（生）80g' },
          ],
        },
      ],
    }));

  return { foodBases, userDays, sisterDays };
})();
