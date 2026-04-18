import { Creator } from "@/types/creator";

const bilibiliAvatar = (id: string) => `/avatars/bilibili/${id}.jpg`;
const youtubeAvatar = (handle: string) => `https://unavatar.io/youtube/${handle}`;

export const creators: Creator[] = [
  {
    id: "creator_gaiao",
    name: "盖奥网球",
    shortDescription: "内容全面清晰，适合打基础和自学入门",
    tags: ["入门友好", "基础筑形", "讲解透彻"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["basics", "forehand", "serve", "grip", "footwork", "topspin"],
    styleTags: ["入门友好", "讲解透彻", "基础筑形", "动作拆解"],
    bio: "内容全面清晰，适合基础入门和自学提升。",
    suitableFor: ["零基础", "正手框架建立", "发球入门"],
    featuredContentIds: ["content_gaiao_01", "content_gaiao_03", "content_gaiao_05", "content_gaiao_06"],
    featuredVideos: [
      {
        id: "creator_gaiao_video_01",
        title: "详细版 网球正手零基础教学",
        target: "正手框架总立不住",
        levels: ["2.5", "3.0"],
        thumbnail: '/thumbnails/bilibili/f141ebcafbe7565d32be6b26d6854fe6d3bf845c.jpg',
    viewCount: 150977,
        duration: '1:14',
        url: "https://www.bilibili.com/video/BV1XM4y187mR/",
        platform: "Bilibili"
      },
      {
        id: "creator_gaiao_video_02",
        title: "网球反手零基础教学",
        target: "反手总打不扎实",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/e4600b2ca3cd245f33ad97fb5d03cb74ccb2006e.jpg',
    viewCount: 39525,
        duration: '1:03',
        url: "https://www.bilibili.com/video/BV1YL411d7oX/",
        platform: "Bilibili"
      },
      {
        id: "creator_gaiao_video_03",
        title: "网球步伐训练合集",
        target: "脚步启动总慢半拍",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/040a19ed2bc864e2d9101347b15782f7e0e36bc4.jpg',
    viewCount: 60771,
        duration: '1:27',
        url: "https://www.bilibili.com/video/BV1Tg4y1w7Xe/",
        platform: "Bilibili"
      },
      {
        id: "creator_gaiao_video_04",
        title: "#网球 如何练会拐弯的侧旋发球 #网球发球#网球教学#网球盖奥",
        target: "侧旋发球总做不出来",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/51f03db09cb87e128474d2ece17fbbdf2ea2f057.jpg',
    viewCount: 36915,
        duration: '0:32',
        url: "https://www.bilibili.com/video/BV1YA4y1D7YR/",
        platform: "Bilibili"
      },
      {
        id: "creator_gaiao_video_05",
        title: "球打不深怎么办",
        target: "相持球总打不深",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/96883140bb27637300a9b52f844000e25556ab57.jpg',
    viewCount: 17182,
        duration: '0:48',
        url: "https://www.bilibili.com/video/BV1kp421d7od/",
        platform: "Bilibili"
      }
    ],
    profileUrl: "https://space.bilibili.com/1664596828?spm_id_from=333.337.0.0",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/1664596828?spm_id_from=333.337.0.0"
    },
    avatar: bilibiliAvatar("creator_gaiao"),
    rankingSignals: {
      subscriberScore: 0.96,
      averageViewsScore: 0.95,
      activityScore: 0.86,
      catalogScore: 0.9,
      authorityScore: 0.9,
      curatorBoost: 1
    },
    environment: ["testing", "production"],
    nameEn: "Gaiao Tennis",
    shortDescriptionEn: "Clear, all-around lessons for beginners building fundamentals",
    bioEn: "Clear, wide-ranging instruction for beginners who want a solid base and a reliable self-study path.",
    suitableForEn: ["Complete beginners","Building a forehand foundation","Serve basics"]
  },
  {
    id: "creator_mouratoglou_cn",
    name: "冠军教练-莫拉托格鲁",
    shortDescription: "职业视角拆解发球框架",
    tags: ["进阶突破", "发球专修", "实战拆解"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["serve", "forehand", "matchplay", "basics", "grip"],
    styleTags: ["职业视角", "系统化", "动作拆解"],
    bio: "偏职业教练视角和高质量技术拆解，适合想看更系统训练逻辑与动作框架的球员。",
    suitableFor: ["进阶动作框架", "职业训练视角", "比赛执行"],
    featuredContentIds: ["content_cn_d_01"],
    featuredVideos: [
      {
        id: "creator_mouratoglou_cn_video_01",
        title: "网球技巧| 正手击球，提前开拍",
        target: "正手准备总是偏晚",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: '/thumbnails/bilibili/60f674fe6381eac7a5fc388bd4a9c21b5c74c12b.jpg',
    viewCount: 26542,
        duration: '0:37',
        url: "https://www.bilibili.com/video/BV1zK411d7SW/",
        platform: "Bilibili"
      },
      {
        id: "creator_mouratoglou_cn_video_02",
        title: "网球截击五部曲",
        target: "截击细节总是混乱",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: '/thumbnails/bilibili/12427e203edb27a230920f96083783deb633e228.jpg',
    viewCount: 21688,
        duration: '1:12',
        url: "https://www.bilibili.com/video/BV1xm4y1K7KS/",
        platform: "Bilibili"
      },
      {
        id: "creator_mouratoglou_cn_video_03",
        title: "大师讲堂|莫拉托格鲁教练教你一步一步让发球更流畅！",
        target: "发球动作总不流畅",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: '/thumbnails/bilibili/3824544837bd4bd47db704c163c91474e275a168.jpg',
    viewCount: 8824,
        duration: '2:56',
        url: "https://www.bilibili.com/video/BV1aB4y1m7Nv/",
        platform: "Bilibili"
      },
      {
        id: "creator_mouratoglou_cn_video_04",
        title: "网球教学：开放式反手击球",
        target: "开放式反手不会用",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: '/thumbnails/bilibili/fad09681d3b7e94b7838158060be2a30f42da685.jpg',
    viewCount: 7708,
        duration: '1:31',
        url: "https://www.bilibili.com/video/BV1cb4y1P7su/",
        platform: "Bilibili"
      },
      {
        id: "creator_mouratoglou_cn_video_05",
        title: "砰！莫式力量控制黄金法则！",
        target: "发力一大就失控",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: '/thumbnails/bilibili/48ccd4c24f6615da76ec5622beb45c0208da2e17.jpg',
    viewCount: 4426,
        duration: '0:39',
        url: "https://www.bilibili.com/video/BV1i7AdeSEFf/",
        platform: "Bilibili"
      }
    ],
    profileUrl: "https://space.bilibili.com/1096810530?spm_id_from=333.337.search-card.all.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/1096810530?spm_id_from=333.337.search-card.all.click"
    },
    avatar: bilibiliAvatar("creator_mouratoglou_cn"),
    rankingSignals: {
      subscriberScore: 0.88,
      averageViewsScore: 0.9,
      activityScore: 0.8,
      catalogScore: 0.75,
      authorityScore: 1,
      curatorBoost: 0.95
    },
    environment: ["testing", "production"],
    nameEn: "Coach Mouratoglou",
    shortDescriptionEn: "Pro-level serve framework breakdowns",
    bioEn: "A professional-coach perspective with high-quality technical breakdowns, great for players who want more systematic training logic and stroke structure.",
    suitableForEn: ["Advanced technique structure","Pro training perspective","Match execution"]
  },
  {
    id: "creator_furao",
    name: "网球工匠付饶",
    shortDescription: "动作细节和击球点纠正",
    tags: ["细节纠偏", "反手专修", "步法启动"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["forehand", "backhand", "movement", "basics", "grip"],
    styleTags: ["细节纠偏", "讲解透彻", "动作拆解"],
    bio: "偏技术细节和动作修正，适合处理反手稳定性、击球点和脚步问题。",
    suitableFor: ["反手下网", "击球点偏晚", "基础动作修正"],
    featuredContentIds: ["content_fr_01", "content_fr_03"],
    featuredVideos: [
      {
        id: "creator_furao_video_01",
        title: "干货and硬货｜双反球速提升不能错过的两个训练方法",
        target: "双反球速总起不来",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/d83e49d82698a0dcdb6d03c412af855dfbec9d47.jpg',
    viewCount: 18358,
        duration: '7:23',
        url: "https://www.bilibili.com/video/BV1Ty4y1G7r6/",
        platform: "Bilibili"
      },
      {
        id: "creator_furao_video_02",
        title: "发球加速不是靠手臂，而是用手腕｜《跟职业一起训练》第四集",
        target: "发球想加速却只抡手",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/01629ab79b28769850818e1c00ecb017fb69e228.jpg',
    viewCount: 46997,
        duration: '5:39',
        url: "https://www.bilibili.com/video/BV123411H7u6/",
        platform: "Bilibili"
      },
      {
        id: "creator_furao_video_03",
        title: "正！手！千！万！别！引！拍！",
        target: "正手引拍越做越大",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/7910cfd92081586293280ac5f6c4f0091ba4a6d7.jpg',
    viewCount: 206893,
        duration: '9:22',
        url: "https://www.bilibili.com/video/BV1Zf4y1b7aW/",
        platform: "Bilibili"
      },
      {
        id: "creator_furao_video_04",
        title: "新年首战：网球工匠付饶4.5vs智利纳达尔Camilo5.0（2022继续向5.0攀登）",
        target: "想看实战对抗细节",
        levels: ["3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/82d0351f649ba96ee628548caafa0ae057748b00.jpg',
    viewCount: 10010,
        duration: '10:54',
        url: "https://www.bilibili.com/video/BV1jm4y1X7yF/",
        platform: "Bilibili"
      },
      {
        id: "creator_furao_video_05",
        title: "【网球工匠付饶】测评Vcore米白色款网球拍",
        target: "想看器材实测思路",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/f8d7620ee92779dc3700de4d009f8167d6e8cb89.jpg',
    viewCount: 41994,
        duration: '5:05',
        url: "https://www.bilibili.com/video/BV1qz421i79v/",
        platform: "Bilibili"
      }
    ],
    profileUrl: "https://space.bilibili.com/370058962?spm_id_from=333.337.search-card.all.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/370058962?spm_id_from=333.337.search-card.all.click"
    },
    avatar: bilibiliAvatar("creator_furao"),
    rankingSignals: {
      subscriberScore: 0.72,
      averageViewsScore: 0.78,
      activityScore: 0.82,
      catalogScore: 0.7,
      authorityScore: 0.75,
      curatorBoost: 0.82
    },
    environment: ["testing", "production"],
    nameEn: "Fu Rao Tennis",
    shortDescriptionEn: "Technical fixes for contact point and mechanics",
    bioEn: "Detail-driven technique corrections, especially useful for backhand stability, contact point, and footwork problems.",
    suitableForEn: ["Backhands into the net","Late contact","Basic stroke corrections"]
  },
  {
    id: "creator_racketbrothers",
    name: "RacketBrothers",
    shortDescription: "双打实战和比赛执行",
    tags: ["网前专修", "实战拆解", "讲解透彻"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["doubles", "net", "matchplay", "return"],
    styleTags: ["实战拆解", "双打导向", "比赛导向"],
    bio: "偏实战与双打场景，适合希望提升网前处理、接发和比赛执行的球员。",
    suitableFor: ["双打网前", "接发被压制", "比赛策略执行"],
    featuredContentIds: ["content_rb_01", "content_rb_02", "content_rb_03", "content_cn_b_01", "content_cn_b_02", "content_cn_b_03"],
    featuredVideos: [
      {
        id: "creator_racketbrothers_video_01",
        title: "【网球教学-言之有理】5.0大佬教我如何让截击更SIX",
        target: "网前截击总不稳",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/8e9a2416bfa72356df1d9ce499d1221652b5c7ef.jpg',
    viewCount: 138186,
        duration: '22:03',
        url: "https://www.bilibili.com/video/BV1954y147nF/",
        platform: "Bilibili"
      },
      {
        id: "creator_racketbrothers_video_02",
        title: "【网球教学-言之有理】5.0大佬教我如何让发球和接发球更GOOD",
        target: "接发第一拍质量低",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/a7c193cdba7994f40ab95c947c618f94bb1f8973.jpg',
    viewCount: 285931,
        duration: '30:38',
        url: "https://www.bilibili.com/video/BV1Ep4y1W7kc/",
        platform: "Bilibili"
      },
      {
        id: "creator_racketbrothers_video_03",
        title: "【网球比赛】2023天天有网球年终总决赛周柏言/赵子昂HL",
        target: "想看双打实战执行",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/d8bbdfd63f468624fd2530609984dbf8dea11039.jpg',
    viewCount: 36442,
        duration: '7:41',
        url: "https://www.bilibili.com/video/BV1JN4y18792/",
        platform: "Bilibili"
      },
      {
        id: "creator_racketbrothers_video_04",
        title: "【网球教学-言之有理】5.0大佬教我如何让切削更UP",
        target: "切削总飘不下压",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/a3bd03f8d1177ffb7fbb365b176d5ba11812ea1e.jpg',
    viewCount: 189975,
        duration: '23:45',
        url: "https://www.bilibili.com/video/BV1TU4y187QS/",
        platform: "Bilibili"
      },
      {
        id: "creator_racketbrothers_video_05",
        title: "【网球教学-言之讲理】5.0大佬教“全国U14年终第一”怎样打好单手反拍&截击（上）",
        target: "单反和截击衔接乱",
        levels: ["3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/5dd6a9934e4a546847ff8a53668f0830c12ebfb7.jpg',
    viewCount: 50976,
        duration: '16:27',
        url: "https://www.bilibili.com/video/BV1Sj411r7Ka/",
        platform: "Bilibili"
      }
    ],
    profileUrl: "https://space.bilibili.com/6796357?spm_id_from=333.337.search-card.all.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/6796357?spm_id_from=333.337.search-card.all.click"
    },
    avatar: bilibiliAvatar("creator_racketbrothers"),
    rankingSignals: {
      subscriberScore: 0.68,
      averageViewsScore: 0.74,
      activityScore: 0.76,
      catalogScore: 0.68,
      authorityScore: 0.76,
      curatorBoost: 0.77
    },
    environment: ["testing", "production"],
    shortDescriptionEn: "Doubles tactics and match execution",
    bioEn: "Match-play and doubles-oriented instruction, especially useful for volley control, returns, and on-court decision-making.",
    suitableForEn: ["Doubles net play","Returns under pressure","Executing match tactics"]
  },
  {
    id: "creator_cn_a",
    name: "是沛恩呀",
    shortDescription: "反手准备和脚步理顺",
    tags: ["讲解透彻", "反手专修", "步法启动"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5"],
    specialties: ["backhand", "footwork"],
    styleTags: ["讲解透彻", "动作拆解"],
    bio: "偏基础动作和击球准备拆解，适合想先把反手和脚步问题理顺的业余球员。",
    suitableFor: ["反手下网", "准备偏慢"],
    featuredContentIds: ["content_cn_a_01", "content_cn_a_02", "content_common_02"],
    featuredVideos: [
      {
        id: "creator_cn_a_video_01",
        title: "网球技术｜新手｜一种简单易练的截击✨",
        target: "截击动作总是乱",
        levels: ["3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/f7740abefccf6743e36f9aeb5e6a6f2da7b85385.jpg',
    viewCount: 82557,
        duration: '1:12',
        url: "https://www.bilibili.com/video/BV1b2UmBTEsV/",
        platform: "Bilibili"
      },
      {
        id: "creator_cn_a_video_02",
        title: "网球新手｜切削发球一分钟速成✅3步",
        target: "切削发球总转不起来",
        levels: ["3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/4d1163b793537b55bccf451ccc1a15ef27dd1c62.jpg',
    viewCount: 33837,
        duration: '1:01',
        url: "https://www.bilibili.com/video/BV1Q8NWzmESF/",
        platform: "Bilibili"
      },
      {
        id: "creator_cn_a_video_03",
        title: "网球技术｜一分钟✅｜跟着德约学起跳反手‼️➡️",
        target: "起跳反手总不会用",
        levels: ["3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/f34a8c49caa5ce8f855455c2bff586ae1a58d7b3.jpg',
    viewCount: 7216,
        duration: '1:01',
        url: "https://www.bilibili.com/video/BV1TrwQe9E2A/",
        platform: "Bilibili"
      },
      {
        id: "creator_cn_a_video_04",
        title: "网球热身｜5组动作提升状态🎾新手必练‼️",
        target: "上场前总不会热身",
        levels: ["3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/5e3944513a109f027eb34e68c7b10754f9015e3f.jpg',
    viewCount: 3969,
        duration: '1:17',
        url: "https://www.bilibili.com/video/BV1oaN9eEEpk/",
        platform: "Bilibili"
      },
      {
        id: "creator_cn_a_video_05",
        title: "网球必练｜一键模式✅新手也能打直球❗️",
        target: "总打不出稳定直线",
        levels: ["3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/521bc95fc6a86451bbb659fb31995cafc6611b4b.jpg',
    viewCount: 11063,
        duration: '1:24',
        url: "https://www.bilibili.com/video/BV1i1sUzVEfW/",
        platform: "Bilibili"
      }
    ],
    profileUrl: "https://space.bilibili.com/551162560/upload/video",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/551162560/upload/video"
    },
    avatar: bilibiliAvatar("creator_cn_a"),
    rankingSignals: {
      subscriberScore: 0.54,
      averageViewsScore: 0.6,
      activityScore: 0.66,
      catalogScore: 0.58,
      authorityScore: 0.7,
      curatorBoost: 0.56
    },
    environment: ["testing", "production"],
    nameEn: "Peien Tennis",
    shortDescriptionEn: "Backhand preparation and footwork basics",
    bioEn: "Breaks down fundamental stroke prep and ready-position habits, a strong fit for recreational players who want to clean up backhand and footwork issues first.",
    suitableForEn: ["Backhand net errors","Slow preparation"]
  },
  {
    id: "creator_leontv_cn",
    name: "LeonTV网球频道",
    shortDescription: "系统化理顺正反手框架",
    tags: ["基础筑形", "讲解透彻", "正手专修"],
    region: "domestic",
    platforms: ["Bilibili", "YouTube"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["basics", "forehand", "backhand", "matchplay", "grip"],
    styleTags: ["讲解透彻", "入门友好", "系统化"],
    bio: "偏系统化教学和练习框架，适合想把正反手、基础节奏和实战思路一起理顺的球员。",
    suitableFor: ["基础动作", "正反手稳定性", "实战理解"],
    featuredContentIds: ["content_cn_c_02", "content_cn_d_02", "content_cn_d_03", "content_gaiao_02", "content_fr_02"],
    featuredVideos: [
      {
        id: "creator_leontv_cn_video_01",
        title: "职业选手分腿垫步的三大步骤｜LeonTV｜网球教学",
        target: "分腿垫步总慢半拍",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/bcd585e7eb1eb34b3f90ec584d18425635997e30.jpg',
    viewCount: 25227,
        duration: '7:25',
        url: "https://www.bilibili.com/video/BV1PN4y1R7jL/",
        platform: "Bilibili"
      },
      {
        id: "creator_leontv_cn_video_02",
        title: "【网球教学】正拍打出力并能保持稳定性的三个步骤｜ LeonTV ｜网球基础",
        target: "正手发力总靠手臂",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/8ec3416ebcfbb18422c57f72fa81f2acab2bb791.jpg',
    viewCount: 309388,
        duration: '13:16',
        url: "https://www.bilibili.com/video/BV1h64y1D78J/",
        platform: "Bilibili"
      },
      {
        id: "creator_leontv_cn_video_03",
        title: "【网球 教学】平击上旋 vs 重上旋｜正拍 打出压制力的关键！｜LeonTV",
        target: "上旋弧线总拉不出",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/7e035fbef7f29ef5cff1dac5f7a84bcd72e8b445.jpg',
    viewCount: 38860,
        duration: '8:06',
        url: "https://www.bilibili.com/video/BV1QRLizLEnv/",
        platform: "Bilibili"
      },
      {
        id: "creator_leontv_cn_video_04",
        title: "【网球教学】接发球完整教学｜任何层级都适用的必学技巧｜LeonTV",
        target: "接发总被对手压住",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/1a11be43cdbb07be461fcbd702d3124d8e6d318c.jpg',
    viewCount: 9247,
        duration: '15:38',
        url: "https://www.bilibili.com/video/BV1D7YfzDEfo/",
        platform: "Bilibili"
      },
      {
        id: "creator_leontv_cn_video_05",
        title: "90%业余球员都曾犯的三大脚步错误！实战修正｜网球脚步｜LeonTV",
        target: "脚步错误反复出现",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/1508293f4adf9fc8b3be7f0f2620e501e09b0cb5.jpg',
    viewCount: 19149,
        duration: '7:24',
        url: "https://www.bilibili.com/video/BV1mF5KzmEgP/",
        platform: "Bilibili"
      }
    ],
    profileUrl: "https://space.bilibili.com/431898127?spm_id_from=333.337.search-card.all.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/431898127?spm_id_from=333.337.search-card.all.click",
      YouTube: "https://www.youtube.com/@LeonTV/videos"
    },
    avatar: bilibiliAvatar("creator_leontv_cn"),
    rankingSignals: {
      subscriberScore: 0.5,
      averageViewsScore: 0.57,
      activityScore: 0.68,
      catalogScore: 0.66,
      authorityScore: 0.72,
      curatorBoost: 0.72
    },
    environment: ["testing", "production"],
    nameEn: "LeonTV Tennis",
    shortDescriptionEn: "Systematic forehand and backhand fundamentals",
    bioEn: "Structured teaching with clear practice frameworks, good for players who want to organize both groundstrokes, basic rhythm, and match understanding together.",
    suitableForEn: ["Stroke fundamentals","Forehand and backhand stability","Practical match understanding"]
  },
  {
    id: "creator_james",
    name: "青蛙王子James",
    shortDescription: "3.0-3.5 综合提升",
    tags: ["基础筑形", "正手专修", "入门友好"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["basics", "movement", "matchplay"],
    styleTags: ["讲解透彻", "入门友好", "实战拆解"],
    bio: "偏业余球友视角的动作拆解和打球思路整理，适合想把基础框架和实战理解一起理顺的球员。",
    suitableFor: ["2.5-4.0", "基础框架", "实战理解"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_james_video_01",
        title: "【留学网球日常】浅浅的谈一下第七代vcore的使用感受吧",
        target: "想挑一把更顺手的拍",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/7ad92d40468500df06a1604a134c4e82ce2a2258.jpg',
    viewCount: 25718,
        duration: '14:49',
        url: "https://www.bilibili.com/video/BV1FG4y1X7DA/",
        platform: "Bilibili"
      },
      {
        id: "creator_james_video_02",
        title: "【网球拍测评】Wilson shift是工业垃圾还是上旋福音？",
        target: "想知道上旋拍值不值",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/c67df583432d5a1dc79270adc969b04497018d06.jpg',
    viewCount: 21904,
        duration: '18:17',
        url: "https://www.bilibili.com/video/BV1hV4y197oy/",
        platform: "Bilibili"
      },
      {
        id: "creator_james_video_03",
        title: "【网球vlog日常】对话职业穿线师第一期！｜磅数，线径，材料？！！一个视频带你看清楚",
        target: "穿线参数总是搞不清",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/6ec591018de6011a25392e54c6942de9022a568a.jpg',
    viewCount: 16008,
        duration: '17:24',
        url: "https://www.bilibili.com/video/BV1bd1sYrEtc/",
        platform: "Bilibili"
      },
      {
        id: "creator_james_video_04",
        title: "【网球教学日常】跟着前ATP双打180的球员来学习截击！｜让你在网前变得更加充满侵略性！！！",
        target: "网前截击总打不死",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/a28acffb34993a9c85b236b7093f06f1b97ebc71.jpg',
    viewCount: 7191,
        duration: '6:18',
        url: "https://www.bilibili.com/video/BV14J4m1x75K/",
        platform: "Bilibili"
      },
      {
        id: "creator_james_video_05",
        title: "【网球教学日常】ATP职业大佬提高你的正手稳定性｜让你的正手成为你的得分利器！！！",
        target: "正手稳定性总上不去",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/fd9313de08983234979cb0c99ec8125ac8c54930.jpg',
    viewCount: 3643,
        duration: '17:43',
        url: "https://www.bilibili.com/video/BV18t421p7Nr/",
        platform: "Bilibili"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://space.bilibili.com/524583239?spm_id_from=333.337.search-card.all.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/524583239?spm_id_from=333.337.search-card.all.click"
    },
    avatar: bilibiliAvatar("creator_james"),
    rankingSignals: {
      subscriberScore: 0.5,
      averageViewsScore: 0.56,
      activityScore: 0.6,
      catalogScore: 0.55,
      authorityScore: 0.55,
      curatorBoost: 0.55
    },
    environment: ["testing", "production"],
    nameEn: "Prince James",
    shortDescriptionEn: "All-around improvement for 3.0 to 3.5 players",
    bioEn: "A recreational-player perspective on mechanics and decision-making, helpful when you want cleaner fundamentals plus better on-court understanding.",
    suitableForEn: ["2.5 to 4.0 players","Basic stroke framework","Match understanding"]
  },
  {
    id: "creator_liuliu",
    name: "六六网球",
    shortDescription: "适合新手练脚步和稳定",
    tags: ["入门友好", "步法启动", "基础筑形"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5"],
    specialties: ["basics", "footwork", "consistency", "training"],
    styleTags: ["入门友好", "适合自学", "训练导向"],
    bio: "偏基础训练组织和步伐稳定性，适合想把练习内容安排得更扎实的新手球友。",
    suitableFor: ["自练安排", "脚步基础", "稳定性"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_liuliu_video_01",
        title: "网球切削慢动作教学丨细节拆解",
        target: "切削动作总做不顺",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/d897eed483ddc1e13475a1077a45223916e04094.jpg',
    viewCount: 7900,
        duration: '0:27',
        url: "https://www.bilibili.com/video/BV1fxy3BgECv/",
        platform: "Bilibili"
      },
      {
        id: "creator_liuliu_video_02",
        title: "一个视频学会8种网球切削技术",
        target: "切削变化总是不会用",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/91bf4726be460a0ff2b38fae6565f1dc7cd84fc0.jpg',
    viewCount: 9511,
        duration: '0:56',
        url: "https://www.bilibili.com/video/BV1wABXB1EtU/",
        platform: "Bilibili"
      },
      {
        id: "creator_liuliu_video_03",
        title: "网球底层逻辑：稳定大于一切！",
        target: "练习总在瞎发力",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/54a3e9225691616a4a477ee0530c1db587cbb346.jpg',
    viewCount: 10543,
        duration: '5:29',
        url: "https://www.bilibili.com/video/BV1jQZQBQECX/",
        platform: "Bilibili"
      },
      {
        id: "creator_liuliu_video_04",
        title: "打网球必学的10个热身动作",
        target: "上场前总不会热身",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/a137c39924d5a5ff433ad0047cede39d37503ca4.jpg',
    viewCount: 2636,
        duration: '1:32',
        url: "https://www.bilibili.com/video/BV1PAq5BuE85/",
        platform: "Bilibili"
      },
      {
        id: "creator_liuliu_video_05",
        title: "打网球必做的手眼协调性训练！",
        target: "训练结构总是乱练",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/bafac66bd018ebbe22d0aeb6923e26a8ff953b2e.jpg',
    viewCount: 1568,
        duration: '0:33',
        url: "https://www.bilibili.com/video/BV13ywFzgE7D/",
        platform: "Bilibili"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://space.bilibili.com/3546889345567354?spm_id_from=333.337.search-card.all.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/3546889345567354?spm_id_from=333.337.search-card.all.click"
    },
    avatar: bilibiliAvatar("creator_liuliu"),
    rankingSignals: {
      subscriberScore: 0.52,
      averageViewsScore: 0.6,
      activityScore: 0.67,
      catalogScore: 0.6,
      authorityScore: 0.6,
      curatorBoost: 0.6
    },
    environment: ["testing", "production"],
    nameEn: "Liuliu Tennis",
    shortDescriptionEn: "Beginner-friendly footwork and consistency",
    bioEn: "Focused on basic practice organization and steadier footwork, a good fit for beginners who want more structured sessions.",
    suitableForEn: ["Solo practice structure","Footwork basics","Consistency"]
  },
  {
    id: "creator_pikachu",
    name: "打网球的皮卡邱",
    shortDescription: "真实练球过程更有代入感",
    tags: ["入门友好", "实战拆解", "步法启动"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5"],
    specialties: ["matchplay", "basics", "training", "movement"],
    styleTags: ["业余球友视角", "实战拆解", "入门友好"],
    bio: "偏业余球友视角的练球和实战记录，适合想从真实练习过程里获得启发的球员。",
    suitableFor: ["练球思路", "实战体感", "入门提升"],
    featuredContentIds: ["content_cn_a_03", "content_cn_c_03", "content_cn_f_02"],
    featuredVideos: [
      {
        id: "creator_pikachu_video_01",
        title: "打球脚步又慢又乱❓四个基础步伐要掌握",
        target: "脚步又慢又乱",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/95a16864f40364f032e3ffa7989717aa9ab9cf21.jpg',
    viewCount: 20949,
        duration: '1:58',
        url: "https://www.bilibili.com/video/BV1SZ6qYFEVS/",
        platform: "Bilibili"
      },
      {
        id: "creator_pikachu_video_02",
        title: "5个练习🎾没有球搭子，一个人也能默默涨球!",
        target: "没人陪练就不会练",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/49156c0240cb1bee00a0cda1498f18a984bf3527.jpg',
    viewCount: 53846,
        duration: '1:06',
        url: "https://www.bilibili.com/video/BV1LvS3YWEnL/",
        platform: "Bilibili"
      },
      {
        id: "creator_pikachu_video_03",
        title: "网球学练馆的11种练法🎾方法用得对，训练不枯燥",
        target: "训练总是越练越乱",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/9b9d88aec4933ae8c7d31db2bec9ac08f114ba31.jpg',
    viewCount: 24778,
        duration: '1:03',
        url: "https://www.bilibili.com/video/BV16uHizBEp2/",
        platform: "Bilibili"
      },
      {
        id: "creator_pikachu_video_04",
        title: "🎾网球发球力量从哪来？身体像弹弓一样弹射❗",
        target: "发球想有力却只抡手",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/d8f3fcf15bf12292a32cae5d5515157961691398.jpg',
    viewCount: 764254,
        duration: '0:35',
        url: "https://www.bilibili.com/video/BV1ox421f7VX/",
        platform: "Bilibili"
      },
      {
        id: "creator_pikachu_video_05",
        title: "网球新手必看❗五种网球握拍全解析",
        target: "总搞不清该怎么握拍",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/158754b6b85286c29789c61f54394e8a29ffb7eb.jpg',
    viewCount: 52134,
        duration: '2:34',
        url: "https://www.bilibili.com/video/BV1Dm421s7Rg/",
        platform: "Bilibili"
      }
    ],
    recommendedCount: 3,
    profileUrl: "https://space.bilibili.com/477934059?spm_id_from=333.337.search-card.all.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/477934059?spm_id_from=333.337.search-card.all.click"
    },
    avatar: bilibiliAvatar("creator_pikachu"),
    rankingSignals: {
      subscriberScore: 0.48,
      averageViewsScore: 0.58,
      activityScore: 0.64,
      catalogScore: 0.56,
      authorityScore: 0.58,
      curatorBoost: 0.58
    },
    environment: ["testing", "production"],
    nameEn: "Pikachu Tennis",
    shortDescriptionEn: "Relatable practice logs and real-play examples",
    bioEn: "Real-player practice and match recordings that help recreational players learn from believable sessions and small improvements.",
    suitableForEn: ["Practice ideas","Match feel","Beginner improvement"]
  },
  {
    id: "creator_matsuo_yuki_cn",
    name: "松尾友贵Proの网球教学",
    shortDescription: "进阶动作细节和纠错",
    tags: ["细节纠偏", "进阶突破", "反手专修"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["forehand", "backhand", "serve", "basics"],
    styleTags: ["职业视角", "细节纠偏", "动作拆解"],
    bio: "偏职业选手/教练级动作拆解，适合想看更精细技术要点的进阶球员。",
    suitableFor: ["进阶技术细节", "正反手修正", "发球框架"],
    featuredContentIds: ["content_zlx_03", "content_common_03"],
    featuredVideos: [
      {
        id: "creator_matsuo_yuki_cn_video_01",
        title: "【觉醒】只用15分钟就掌握切削发球！松尾教练也惊呆了！【松尾友贵Proの网球教学】",
        target: "发球缺少旋转变化",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: '/thumbnails/bilibili/c22922ade6408547499c57f016cefd54166cfd2a.jpg',
    viewCount: 14678,
        duration: '12:42',
        url: "https://www.bilibili.com/video/BV1JT5wz4EJJ/",
        platform: "Bilibili"
      },
      {
        id: "creator_matsuo_yuki_cn_video_02",
        title: "让对手讨厌的有穿透力的切削球！简单易懂的3个要点！【松尾友贵Proの网球教学】",
        target: "切削总飘不往前走",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: '/thumbnails/bilibili/5367bb69a6ce6b1c50e53b0a643bf64fccd5bc68.jpg',
    viewCount: 7797,
        duration: '7:10',
        url: "https://www.bilibili.com/video/BV1aTaxzxENT/",
        platform: "Bilibili"
      },
      {
        id: "creator_matsuo_yuki_cn_video_03",
        title: "战术大师！伊藤葵选手的挑高球和角度球击球方式学习！",
        target: "高球和角度球不会用",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: '/thumbnails/bilibili/86554dbec03f66a72ddee9b2382552ab5feab606.jpg',
    viewCount: 5658,
        duration: '14:38',
        url: "https://www.bilibili.com/video/BV1uJaTzvEVq/",
        platform: "Bilibili"
      },
      {
        id: "creator_matsuo_yuki_cn_video_04",
        title: "【初学必见】只用20分钟就可以掌握挡击接发回球！【松尾友贵Proの网球教学】",
        target: "接发总被发球压住",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/688c521b3a7e6cdb5d7e4c02d9ab45db0d8be0d3.jpg',
    viewCount: 4406,
        duration: '9:33',
        url: "https://www.bilibili.com/video/BV18xXgYnEMA/",
        platform: "Bilibili"
      },
      {
        id: "creator_matsuo_yuki_cn_video_05",
        title: "【害怕比赛】练习很好比赛无法正常发挥！一定要看！【松尾友贵Proの网球教学】",
        target: "比赛一打就发挥失常",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: '/thumbnails/bilibili/8e3bce7037f4dccb467993ca3db9fab2eef66cd7.jpg',
    viewCount: 3898,
        duration: '8:58',
        url: "https://www.bilibili.com/video/BV1tcNjzsEZi/",
        platform: "Bilibili"
      }
    ],
    profileUrl: "https://space.bilibili.com/3546822188468643?spm_id_from=333.337.search-card.all.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/3546822188468643?spm_id_from=333.337.search-card.all.click"
    },
    avatar: bilibiliAvatar("creator_matsuo_yuki_cn"),
    rankingSignals: {
      subscriberScore: 0.57,
      averageViewsScore: 0.76,
      activityScore: 0.55,
      catalogScore: 0.5,
      authorityScore: 0.86,
      curatorBoost: 0.8
    },
    environment: ["testing", "production"],
    nameEn: "Yuki Matsuo Pro",
    shortDescriptionEn: "Advanced technique details and corrections",
    bioEn: "Professional-player and coach-level breakdowns for players who want more refined technical detail.",
    suitableForEn: ["Advanced technique details","Forehand and backhand corrections","Serve structure"]
  },
  {
    id: "creator_austin_camp",
    name: "奥斯汀-冬令营",
    shortDescription: "训练结构和发球基础",
    tags: ["入门友好", "发球专修", "步法启动"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["serve", "basics", "movement", "training"],
    styleTags: ["训练导向", "系统化", "讲解透彻"],
    bio: "偏训练营式内容和专项练习思路，适合想把发球、移动和训练结构串起来的球员。",
    suitableFor: ["训练计划", "发球基础", "脚步训练"],
    featuredContentIds: ["content_zlx_02"],
    featuredVideos: [
      {
        id: "creator_austin_camp_video_01",
        title: "上旋发球零基础教学",
        target: "上旋发球总发不起来",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/02ec1b009f740466e241119ce1b0b61bb00eace3.jpg',
    viewCount: 38913,
        duration: '2:13',
        url: "https://www.bilibili.com/video/BV1KG4y1x77a/",
        platform: "Bilibili"
      },
      {
        id: "creator_austin_camp_video_02",
        title: "不会单反的看完就会了，单反不好的看完狂涨1个水平",
        target: "单反动作总不扎实",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/6a1fcdbf33864d830133ffb87f4e73f7cba50f0a.jpg',
    viewCount: 27701,
        duration: '3:09',
        url: "https://www.bilibili.com/video/BV1UW4y1q7jB/",
        platform: "Bilibili"
      },
      {
        id: "creator_austin_camp_video_03",
        title: "网球平击发球零基础教学",
        target: "平击发球总没速度",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/f62ce04f74b98f58dc4b58db1d3d2bc2a991a12a.jpg',
    viewCount: 19543,
        duration: '5:14',
        url: "https://www.bilibili.com/video/BV1dF4m1V7BS/",
        platform: "Bilibili"
      },
      {
        id: "creator_austin_camp_video_04",
        title: "网球无脑战术？练好这个就已经吃遍天了",
        target: "比赛战术总想不清",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/af95906662a153d3211a190b7659488aa09326ba.jpg',
    viewCount: 24429,
        duration: '1:19',
        url: "https://www.bilibili.com/video/BV13u4y1e7Lx/",
        platform: "Bilibili"
      },
      {
        id: "creator_austin_camp_video_05",
        title: "球感练好，训练比事半功倍",
        target: "训练结构总是乱练",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/c9ea7db9c326e2fbd84fe629af0d0fbee834a394.jpg',
    viewCount: 14197,
        duration: '1:38',
        url: "https://www.bilibili.com/video/BV1MW4y1e7KG/",
        platform: "Bilibili"
      }
    ],
    profileUrl: "https://space.bilibili.com/324446217?spm_id_from=333.337.search-card.all.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/324446217?spm_id_from=333.337.search-card.all.click"
    },
    avatar: bilibiliAvatar("creator_austin_camp"),
    rankingSignals: {
      subscriberScore: 0.45,
      averageViewsScore: 0.54,
      activityScore: 0.62,
      catalogScore: 0.58,
      authorityScore: 0.62,
      curatorBoost: 0.6
    },
    environment: ["testing", "production"],
    nameEn: "Austin Tennis Camp",
    shortDescriptionEn: "Serve basics and structured training",
    bioEn: "Camp-style content and drill design, useful for linking serve basics, footwork, and session structure.",
    suitableForEn: ["Training plans","Serve basics","Footwork drills"]
  },
  {
    id: "creator_yexiu_gege",
    name: "叶修鸽哥",
    shortDescription: "适合自练和训练框架搭建",
    tags: ["基础筑形", "步法启动", "讲解透彻"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["basics", "footwork", "training", "net", "serve"],
    styleTags: ["讲解透彻", "训练导向", "系统化"],
    bio: "偏从零自习课和训练组织，适合想把脚步、网前和日常练习框架搭起来的球员。",
    suitableFor: ["自练框架", "脚步与站定", "训练计划"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_yexiu_gege_video_01",
        title: "从零开始的网球自习系列课-训练计划制定篇",
        target: "练球总没计划和结构",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/1e157438275a1ef778836f6d00f51046f6f8717c.jpg',
    viewCount: 12817,
        duration: '19:21',
        url: "https://www.bilibili.com/video/BV1HEyaBiEaW/",
        platform: "Bilibili"
      },
      {
        id: "creator_yexiu_gege_video_02",
        title: "从零开始的网球自习系列课-双打截击篇",
        target: "网前截击总没章法",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/62dd22f83ac821c12150956dd37acf0ab0899fa8.jpg',
    viewCount: 11665,
        duration: '9:27',
        url: "https://www.bilibili.com/video/BV1EbkyB8EQx/",
        platform: "Bilibili"
      },
      {
        id: "creator_yexiu_gege_video_03",
        title: "如何减速站定击球",
        target: "跑到位后总站不住",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/0f25066c8bbd193224acd331e5077e5423f4ee2c.jpg',
    viewCount: 15822,
        duration: '9:11',
        url: "https://www.bilibili.com/video/BV1vLcBzSE1P/",
        platform: "Bilibili"
      },
      {
        id: "creator_yexiu_gege_video_04",
        title: "从零开始的网球自习系列课-脚下篇",
        target: "脚步路线总是乱",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/f8037ecf37217b779e729324c44125b210c33ecd.png',
    viewCount: 38862,
        duration: '38:49',
        url: "https://www.bilibili.com/video/BV1tf421S7rt/",
        platform: "Bilibili"
      },
      {
        id: "creator_yexiu_gege_video_05",
        title: "从零开始的网球自习系列课-发球下肢篇",
        target: "发球下肢发力总脱节",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/333e09d33fd5a97df40ea6525232840c12f4d9ee.jpg',
    viewCount: 25774,
        duration: '7:44',
        url: "https://www.bilibili.com/video/BV1h24qenEqf/",
        platform: "Bilibili"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://space.bilibili.com/20019050/upload/video",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/20019050/upload/video"
    },
    avatar: bilibiliAvatar("creator_yexiu_gege"),
    rankingSignals: {
      subscriberScore: 0.48,
      averageViewsScore: 0.59,
      activityScore: 0.72,
      catalogScore: 0.7,
      authorityScore: 0.64,
      curatorBoost: 0.64
    },
    environment: ["testing", "production"],
    nameEn: "Yexiu Tennis",
    shortDescriptionEn: "Self-practice structure for everyday players",
    bioEn: "Organized, from-zero practice lessons for players who want a clearer framework for footwork, net play, and daily sessions.",
    suitableForEn: ["Solo practice structure","Footwork and setup","Training plans"]
  },
  {
    id: "creator_sara_airehan",
    name: "Sara爱热汗",
    shortDescription: "前职业球员视角，发球和脚步讲得清楚",
    tags: ["讲解透彻", "发球专修", "步法启动"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["serve", "movement", "footwork", "training", "basics"],
    styleTags: ["前职业球员", "讲解透彻", "训练导向"],
    bio: "偏前职业球员视角的发球、热身和脚步训练，适合想把动作顺序和训练感觉建立起来的球员。",
    suitableFor: ["发球入门", "脚步训练", "热身跟练"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_sara_airehan_video_01",
        title: "【网球】职业选手3分钟教会你发球｜超详细讲解",
        target: "发球入门总抓不到顺序",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: "/thumbnails/bilibili/ebfcb72c9928de678886101ea90d50fec71f848c.jpg",
    viewCount: 110801,
        duration: "2:37",
        url: "https://www.bilibili.com/video/BV1jP4y187gD/",
        platform: "Bilibili"
      },
      {
        id: "creator_sara_airehan_video_02",
        title: "网球发球提升｜想要发好球，必须要学会抛球",
        target: "发球抛球总不稳定",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "/thumbnails/bilibili/2c042fee15c8db0fd921869c156e214ddc9df6a6.jpg",
    viewCount: 56871,
        duration: "3:32",
        url: "https://www.bilibili.com/video/BV1Mf4y1v7Ub/",
        platform: "Bilibili"
      },
      {
        id: "creator_sara_airehan_video_03",
        title: "职业选手的发球训练｜5步教会你手臂内旋Pronation",
        target: "发球内旋总找不到感觉",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: "/thumbnails/bilibili/000339229681b17217d4a591ec2357141e07d819.jpg",
    viewCount: 60035,
        duration: "3:00",
        url: "https://www.bilibili.com/video/BV1bK4y1L7YE/",
        platform: "Bilibili"
      },
      {
        id: "creator_sara_airehan_video_04",
        title: "吐血整理！10个网球折返跑训练｜加强脚下",
        target: "脚下启动总拖沓",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: "/thumbnails/bilibili/238e2d9bd910222c8e8e4980f667d3ea14c72b6b.jpg",
    viewCount: 6025,
        duration: "1:27",
        url: "https://www.bilibili.com/video/BV13v421y7mq/",
        platform: "Bilibili"
      },
      {
        id: "creator_sara_airehan_video_05",
        title: "4分钟网球交叉步跟练｜提升步伐",
        target: "交叉步总跟不上球路",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: "/thumbnails/bilibili/82ff37c0ed048e2da20ced5679c33e50cb8a78b7.jpg",
    viewCount: 14327,
        duration: "3:55",
        url: "https://www.bilibili.com/video/BV1WG411i7pP/",
        platform: "Bilibili"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://space.bilibili.com/358241838?spm_id_from=333.788.upinfo.detail.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/358241838?spm_id_from=333.788.upinfo.detail.click"
    },
    avatar: bilibiliAvatar("creator_sara_airehan"),
    rankingSignals: {
      subscriberScore: 0.56,
      averageViewsScore: 0.58,
      activityScore: 0.63,
      catalogScore: 0.54,
      authorityScore: 0.72,
      curatorBoost: 0.66
    },
    environment: ["testing", "production"],
    nameEn: "Sara Tennis",
    shortDescriptionEn: "Former-pro perspective on serve and footwork",
    bioEn: "A former-pro perspective on serving, warm-up, and footwork, especially helpful for players who want cleaner sequencing and better movement feel.",
    suitableForEn: ["Serve basics","Footwork drills","Warm-up follow-alongs"]
  },
  {
    id: "creator_braden_tennis_academy",
    name: "布雷登网球学院",
    shortDescription: "握拍、站位和发力讲得细",
    tags: ["基础筑形", "细节纠偏", "讲解透彻"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["grip", "forehand", "backhand", "topspin", "basics"],
    styleTags: ["基础筑形", "动作拆解", "细节纠偏"],
    bio: "偏握拍、站位、发力和击球原理拆解，适合想把基础动作细节重新理顺的球员。",
    suitableFor: ["握拍重建", "基础站位", "发力理解"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_braden_tennis_academy_video_01",
        title: "网球正手击球非持拍手的另一个关键性作用",
        target: "正手非持拍手总乱摆",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "/thumbnails/bilibili/2afec3a3d44eb6e5bc2bb32298bba20e1c5c9aaf.jpg",
    viewCount: 7519,
        duration: "3:16",
        url: "https://www.bilibili.com/video/BV1Ue4y1c7A1/",
        platform: "Bilibili"
      },
      {
        id: "creator_braden_tennis_academy_video_02",
        title: "全网最系统最全面的握拍、站位与发力方式教程6",
        target: "握拍站位总不顺",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "/thumbnails/bilibili/bc5e2235a1bdd65ab35b246c6eb5aa17312475aa.jpg",
    viewCount: 5532,
        duration: "3:26",
        url: "https://www.bilibili.com/video/BV1vV4y1o7fw/",
        platform: "Bilibili"
      },
      {
        id: "creator_braden_tennis_academy_video_03",
        title: "全网最系统最全面的握拍、站位与发力方式教程（五）双反握拍",
        target: "双反握拍总别扭",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "/thumbnails/bilibili/1ad5ce6f215e48590a50cff9480af870d4a236d9.jpg",
    viewCount: 7443,
        duration: "4:32",
        url: "https://www.bilibili.com/video/BV1ML411Y7ar/",
        platform: "Bilibili"
      },
      {
        id: "creator_braden_tennis_academy_video_04",
        title: "全网最系统最全面的握拍、站位与发力方式教程（四）正手握拍4",
        target: "正手握拍总不稳定",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "/thumbnails/bilibili/a251c020b28646ab6001f7f1c7224f1e92649851.jpg",
    viewCount: 6948,
        duration: "4:01",
        url: "https://www.bilibili.com/video/BV1Fa4y1P7GG/",
        platform: "Bilibili"
      },
      {
        id: "creator_braden_tennis_academy_video_05",
        title: "打上旋球真的是击球的下部吗？",
        target: "上旋总转不起来",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: "/thumbnails/bilibili/dbe3fd60814ebac76d39c27f850a2e29a386b61a.jpg",
    viewCount: 11675,
        duration: "3:32",
        url: "https://www.bilibili.com/video/BV12s4y1Z7RZ/",
        platform: "Bilibili"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://space.bilibili.com/506356125/upload/video",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/506356125/upload/video"
    },
    avatar: bilibiliAvatar("creator_braden_tennis_academy"),
    rankingSignals: {
      subscriberScore: 0.47,
      averageViewsScore: 0.57,
      activityScore: 0.52,
      catalogScore: 0.62,
      authorityScore: 0.61,
      curatorBoost: 0.62
    },
    environment: ["testing", "production"],
    nameEn: "Braden Tennis Academy",
    shortDescriptionEn: "Grip, spacing, and power explained clearly",
    bioEn: "Detailed breakdowns of grip, court positioning, power generation, and strike mechanics, strong for rebuilding fundamentals.",
    suitableForEn: ["Grip reset","Basic positioning","Understanding power generation"]
  },
  {
    id: "creator_topspin_zhixuan",
    name: "TOPSPIN致旋网球",
    shortDescription: "训练营视角，偏脚步和发球体系",
    tags: [
      "基础筑形",
      "步法启动",
      "发球专修"
    ],
    region: "domestic",
    platforms: [
      "Bilibili"
    ],
    levels: [
      "2.5",
      "3.0",
      "3.5",
      "4.0"
    ],
    specialties: [
      "footwork",
      "serve",
      "backhand",
      "training",
      "forehand"
    ],
    styleTags: [
      "训练营视角",
      "系统化",
      "动作拆解"
    ],
    bio: "偏原创训练和课程化输出，常见脚步、对墙训练、发球组织和单反拆解，适合想把练习结构搭起来的球员。",
    suitableFor: [
      "脚步训练",
      "单反进阶",
      "发球组织"
    ],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_topspin_zhixuan_video_01",
        title: "【TOPSPIN ALONE】一个人的网球脚步训练（从新手到大师）",
        sourceTitle: "【TOPSPIN ALONE】一个人的网球脚步训练（从新手到大师）",
        target: "一个人练脚步总没方向",
        levels: [
          "2.5",
          "3.0",
          "3.5",
          "4.0"
        ],
        thumbnail: "/thumbnails/bilibili/9823ff6549ca0e6c57c53d7059b9865775347c86.jpg",
        viewCount: 60462,
        duration: "12:13",
        url: "https://www.bilibili.com/video/BV1Wa41187vu/",
        platform: "Bilibili"
      },
      {
        id: "creator_topspin_zhixuan_video_02",
        title: "【TOPSPIN DETAIL】最全网球单反技术详解（上）",
        sourceTitle: "【TOPSPIN DETAIL】最全网球单反技术详解（上）",
        target: "单反框架总不稳定",
        levels: [
          "3.0",
          "3.5",
          "4.0"
        ],
        thumbnail: "/thumbnails/bilibili/74d45e990a57290d1c1c43c5f6a71efb8bf8c669.jpg",
        viewCount: 25678,
        duration: "11:32",
        url: "https://www.bilibili.com/video/BV1mR4y1f7WE/",
        platform: "Bilibili"
      },
      {
        id: "creator_topspin_zhixuan_video_03",
        title: "【TOPSPIN ALONE】真の墙裂推荐！一个人网球对墙练习大全！",
        sourceTitle: "【TOPSPIN ALONE】真の墙裂推荐！一个人网球对墙练习大全！",
        target: "一个人练球总没结构",
        levels: [
          "2.5",
          "3.0",
          "3.5",
          "4.0"
        ],
        thumbnail: "/thumbnails/bilibili/70693ceff7283517c06ba34be5d820cf8a235b69.jpg",
        viewCount: 22706,
        duration: "10:18",
        url: "https://www.bilibili.com/video/BV1RP4y1T7Ge/",
        platform: "Bilibili"
      },
      {
        id: "creator_topspin_zhixuan_video_04",
        title: "【TOPSPIN BIG 4】网球单打发球方“四拍原则”",
        sourceTitle: "【TOPSPIN BIG 4】网球单打发球方“四拍原则”",
        target: "发球局总不知道怎么组织",
        levels: [
          "3.0",
          "3.5",
          "4.0"
        ],
        thumbnail: "/thumbnails/bilibili/98727b5607ba26520b17ac50b10de016a0a2957e.jpg",
        viewCount: 17275,
        duration: "9:23",
        url: "https://www.bilibili.com/video/BV1rG4y1W79Q/",
        platform: "Bilibili"
      },
      {
        id: "creator_topspin_zhixuan_video_05",
        title: "【TOPSPIN CLINIC】网球新手/初学者正手技术诊断",
        sourceTitle: "【TOPSPIN CLINIC】网球新手/初学者正手技术诊断",
        target: "正手动作总找不到问题",
        levels: [
          "2.5",
          "3.0",
          "3.5"
        ],
        thumbnail: "/thumbnails/bilibili/a404319d175fa8d5907930de4114acbb4f1608dc.jpg",
        viewCount: 11236,
        duration: "8:24",
        url: "https://www.bilibili.com/video/BV1GT4y1U7go/",
        platform: "Bilibili"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://space.bilibili.com/4742158/",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/4742158/"
    },
    avatar: bilibiliAvatar("creator_topspin_zhixuan"),
    rankingSignals: {
      subscriberScore: 0.62,
      averageViewsScore: 0.56,
      activityScore: 0.44,
      catalogScore: 0.58,
      authorityScore: 0.67,
      curatorBoost: 0.6
    },
    environment: ["testing", "production"],
    nameEn: "TOPSPIN Tennis",
    shortDescriptionEn: "Camp-style footwork and serve systems",
    bioEn: "Original drill-based content around footwork, wall training, serve organization, and one-handed backhand progressions, useful for players building practice structure.",
    suitableForEn: ["Footwork training","One-handed backhand progressions","Serve organization"]
  },
  {
    id: "creator_yang_xiaohan",
    name: "网球羊小涵",
    shortDescription: "真人示范型教学，偏正反手和截击",
    tags: [
      "入门友好",
      "正手专修",
      "讲解透彻"
    ],
    region: "domestic",
    platforms: [
      "Bilibili"
    ],
    levels: [
      "2.5",
      "3.0",
      "3.5",
      "4.0"
    ],
    specialties: [
      "forehand",
      "backhand",
      "net",
      "serve",
      "training"
    ],
    styleTags: [
      "真人示范",
      "直接上手",
      "教学短课"
    ],
    bio: "前省队背景，偏本人示范式教学，常见正手上旋、反手基础、网前截击和训练课程片段，适合喜欢看真人动作的人。",
    suitableFor: [
      "正手上旋",
      "反手基础",
      "网前截击"
    ],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_yang_xiaohan_video_01",
        title: "【网球教学】02 三步教会你打网球正手上旋！！",
        sourceTitle: "【网球教学】02 三步教会你打网球正手上旋！！",
        target: "正手上旋总转不起来",
        levels: [
          "2.5",
          "3.0",
          "3.5"
        ],
        thumbnail: "/thumbnails/bilibili/a5e8d94000b98c90da31649ee8328d9344436cd6.jpg",
        viewCount: 39798,
        duration: "3:34",
        url: "https://www.bilibili.com/video/BV1wE411h75b/",
        platform: "Bilibili"
      },
      {
        id: "creator_yang_xiaohan_video_02",
        title: "【网球教学】01 反手基础教学 网球教学 网球基础 反手训练",
        sourceTitle: "【网球教学】01 反手基础教学 网球教学 网球基础 反手训练",
        target: "反手基础总不扎实",
        levels: [
          "2.5",
          "3.0",
          "3.5"
        ],
        thumbnail: "/thumbnails/bilibili/0fd16c34991634956ca3fd27f6ff2e426a7f01f2.jpg",
        viewCount: 19569,
        duration: "3:56",
        url: "https://www.bilibili.com/video/BV1jE411f7t7/",
        platform: "Bilibili"
      },
      {
        id: "creator_yang_xiaohan_video_03",
        title: "【网球教学】 03 正手截击没你想的那么难",
        sourceTitle: "【网球教学】 03 正手截击没你想的那么难",
        target: "网前截击总不敢做动作",
        levels: [
          "3.0",
          "3.5",
          "4.0"
        ],
        thumbnail: "/thumbnails/bilibili/b10aa6257b8bdd02a61f5a1c9bdc8a2d1dbc586c.jpg",
        viewCount: 15656,
        duration: "3:35",
        url: "https://www.bilibili.com/video/BV1rJ411S7ny/",
        platform: "Bilibili"
      },
      {
        id: "creator_yang_xiaohan_video_04",
        title: "【网球课程】04 为什么运动的人都那么纤细呢？",
        sourceTitle: "【网球课程】04 为什么运动的人都那么纤细呢？",
        target: "训练结构和体能总没概念",
        levels: [
          "2.5",
          "3.0",
          "3.5"
        ],
        thumbnail: "/thumbnails/bilibili/1d198c6596ec17d27adc4e5c36d0f192891b5618.jpg",
        viewCount: 4769,
        duration: "6:37",
        url: "https://www.bilibili.com/video/BV1mJ411R7JR/",
        platform: "Bilibili"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://space.bilibili.com/279722876/",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/279722876/"
    },
    avatar: bilibiliAvatar("creator_yang_xiaohan"),
    rankingSignals: {
      subscriberScore: 0.46,
      averageViewsScore: 0.45,
      activityScore: 0.25,
      catalogScore: 0.32,
      authorityScore: 0.66,
      curatorBoost: 0.52
    },
    environment: ["testing", "production"],
    nameEn: "Xiaohan Tennis",
    shortDescriptionEn: "Demonstration-led forehand, backhand, and volley lessons",
    bioEn: "A former provincial-team background with demonstration-heavy teaching, helpful for players who learn best by watching real mechanics.",
    suitableForEn: ["Forehand topspin","Backhand basics","Volleys at net"]
  },
  {
    id: "creator_bugu_tennis",
    name: "布谷网球",
    shortDescription: "零基础到进阶的慢节奏讲解",
    tags: [
      "基础筑形",
      "讲解透彻",
      "步法启动"
    ],
    region: "domestic",
    platforms: [
      "Bilibili"
    ],
    levels: [
      "2.5",
      "3.0",
      "3.5",
      "4.0"
    ],
    specialties: [
      "basics",
      "forehand",
      "footwork",
      "training",
      "consistency"
    ],
    styleTags: [
      "循序渐进",
      "零基础友好",
      "课程化"
    ],
    bio: "偏原创干货和循序渐进讲解，当前公开合集里更偏站位、重心和基础技术搭建，适合慢慢打基础的人。",
    suitableFor: [
      "击球站位",
      "零基础进阶",
      "节奏建立"
    ],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_bugu_tennis_video_01",
        title: "网球必会的四种击球站位，你用对了吗？",
        sourceTitle: "网球必会的四种击球站位，你用对了吗？",
        target: "击球站位总拿不准",
        levels: [
          "2.5",
          "3.0",
          "3.5",
          "4.0"
        ],
        thumbnail: "/thumbnails/bilibili/6f8c08c5308a905fa9fe70bfeeb659e4250d6f4a.jpg",
        viewCount: 610,
        duration: "2:17",
        url: "https://www.bilibili.com/video/BV12YAEzWEqJ/",
        platform: "Bilibili"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://space.bilibili.com/3461580186454605/",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/3461580186454605/"
    },
    avatar: bilibiliAvatar("creator_bugu_tennis"),
    rankingSignals: {
      subscriberScore: 0.3,
      averageViewsScore: 0.22,
      activityScore: 0.18,
      catalogScore: 0.25,
      authorityScore: 0.44,
      curatorBoost: 0.48
    },
    environment: ["testing", "production"],
    nameEn: "Bugu Tennis",
    shortDescriptionEn: "Patient explanations from beginner to intermediate",
    bioEn: "Original, step-by-step explanations with an emphasis on spacing, balance, and foundational technique for players building slowly.",
    suitableForEn: ["Hitting position","Beginner-to-intermediate progress","Rhythm building"]
  },
  {
    id: "creator_wangdong_tennis",
    name: "网动网球",
    shortDescription: "课后复盘型内容，偏动力链和训练",
    tags: [
      "基础筑形",
      "步法启动",
      "细节纠偏"
    ],
    region: "domestic",
    platforms: [
      "Bilibili"
    ],
    levels: [
      "2.5",
      "3.0",
      "3.5",
      "4.0"
    ],
    specialties: [
      "training",
      "forehand",
      "movement",
      "topspin",
      "serve"
    ],
    styleTags: [
      "教练团队",
      "课后复盘",
      "训练导向"
    ],
    bio: "培训机构 / 教练团队型账号，公开内容偏正手动力链、上旋入门、盯球与在家训练，适合当练习清单和课后复盘。",
    suitableFor: [
      "正手动力链",
      "在家训练",
      "上旋入门"
    ],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_wangdong_tennis_video_01",
        title: "网球正手动力链",
        sourceTitle: "网球正手动力链",
        target: "正手发力总是断链",
        levels: [
          "2.5",
          "3.0",
          "3.5",
          "4.0"
        ],
        thumbnail: "/thumbnails/bilibili/d2f0412b45973408be4326f9cc407bf4e7b31033.jpg",
        viewCount: 3700,
        duration: "6:29",
        url: "https://www.bilibili.com/video/BV1f4ijBvExB/",
        platform: "Bilibili"
      },
      {
        id: "creator_wangdong_tennis_video_02",
        title: "上旋球怎么打？新手一开始先别学！！",
        sourceTitle: "上旋球怎么打？新手一开始先别学！！",
        target: "上旋练太早反而越打越乱",
        levels: [
          "2.5",
          "3.0",
          "3.5"
        ],
        thumbnail: "/thumbnails/bilibili/8582c282431aa375ed56ed4b191a9125872d1d8b.jpg",
        viewCount: 2793,
        duration: "4:29",
        url: "https://www.bilibili.com/video/BV1cGiyBSEpT/",
        platform: "Bilibili"
      },
      {
        id: "creator_wangdong_tennis_video_03",
        title: "网球 2.5 自救！盯球差 = 打不准？这组训练练到眼到手到👀",
        sourceTitle: "网球 2.5 自救！盯球差 = 打不准？这组训练练到眼到手到👀",
        target: "盯球差总导致打不准",
        levels: [
          "2.5",
          "3.0"
        ],
        thumbnail: "/thumbnails/bilibili/0aae152446e579674a4b87074e22884e5780c731.jpg",
        viewCount: 2708,
        duration: "4:19",
        url: "https://www.bilibili.com/video/BV1XJqGBmEjH/",
        platform: "Bilibili"
      },
      {
        id: "creator_wangdong_tennis_video_04",
        title: "在家就能提升球技的八个小训练！",
        sourceTitle: "在家就能提升球技的八个小训练！",
        target: "在家练球总没方法",
        levels: [
          "2.5",
          "3.0",
          "3.5"
        ],
        thumbnail: "/thumbnails/bilibili/a6b6fd6c705a947a6d9b1b29e6400c20f66375c3.jpg",
        viewCount: 1719,
        duration: "3:10",
        url: "https://www.bilibili.com/video/BV12WB5B2EhY/",
        platform: "Bilibili"
      },
      {
        id: "creator_wangdong_tennis_video_05",
        title: "“今天才知道发球不止平击、上旋、侧旋， 岳教练掏出第4种：逆旋发球！",
        sourceTitle: "“今天才知道发球不止平击、上旋、侧旋， 岳教练掏出第4种：逆旋发球！",
        target: "发球旋转总分不清楚",
        levels: [
          "3.0",
          "3.5",
          "4.0"
        ],
        thumbnail: "/thumbnails/bilibili/6e0f6c941642adee76ad5898b0b31e4809af8338.jpg",
        viewCount: 4870,
        duration: "1:40",
        url: "https://www.bilibili.com/video/BV1Z2rZBaEkb/",
        platform: "Bilibili"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://space.bilibili.com/3546976958286341/",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/3546976958286341/"
    },
    avatar: bilibiliAvatar("creator_wangdong_tennis"),
    rankingSignals: {
      subscriberScore: 0.28,
      averageViewsScore: 0.2,
      activityScore: 0.35,
      catalogScore: 0.3,
      authorityScore: 0.46,
      curatorBoost: 0.44
    },
    environment: ["testing", "production"],
    nameEn: "Wangdong Tennis",
    shortDescriptionEn: "Power-chain and training-list style lessons",
    bioEn: "A coaching-team account focused on forehand power chains, topspin basics, ball tracking, and at-home training ideas, useful as a practice checklist and review tool.",
    suitableForEn: ["Forehand power chain","At-home training","Topspin basics"]
  },
  {
    id: "creator_yin_coach_tennis",
    name: "教网球的尹教练",
    shortDescription: "偏训练方法和青少年课堂",
    tags: [
      "基础筑形",
      "步法启动",
      "进阶突破"
    ],
    region: "domestic",
    platforms: [
      "Bilibili"
    ],
    levels: [
      "2.5",
      "3.0",
      "3.5",
      "4.0"
    ],
    specialties: [
      "training",
      "movement",
      "basics",
      "consistency",
      "mental"
    ],
    styleTags: [
      "青少年训练",
      "训练方法",
      "课堂型"
    ],
    bio: "更偏青少年训练、身体素质和训练方法集合。当前公开检索到的直达教学视频不稳定，先纳入博主榜，内容库后续再补。",
    suitableFor: [
      "青少年训练",
      "训练方法",
      "课堂复盘"
    ],
    featuredContentIds: [],
    featuredVideos: [],
    recommendedCount: 0,
    profileUrl: "https://space.bilibili.com/2060499993/",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/2060499993/"
    },
    avatar: bilibiliAvatar("creator_yin_coach_tennis"),
    rankingSignals: {
      subscriberScore: 0.22,
      averageViewsScore: 0.18,
      activityScore: 0.24,
      catalogScore: 0.32,
      authorityScore: 0.45,
      curatorBoost: 0.42
    },
    environment: ["testing", "production"],
    nameEn: "Coach Yin Tennis",
    shortDescriptionEn: "Training methods and youth-court coaching",
    bioEn: "More about junior training, physical preparation, and coaching methods. Stable direct teaching videos are limited for now, but the account is still useful on the rankings page.",
    suitableForEn: ["Junior training","Training methods","Lesson review"]
  },
  {
    id: "creator_yi_laoshi_sport",
    name: "一老师运动版",
    shortDescription: "短平快纠错，偏小技巧和细节",
    tags: [
      "细节纠偏",
      "发球专修",
      "步法启动"
    ],
    region: "domestic",
    platforms: [
      "Bilibili"
    ],
    levels: [
      "3.0",
      "3.5",
      "4.0"
    ],
    specialties: [
      "grip",
      "serve",
      "movement",
      "forehand",
      "basics"
    ],
    styleTags: [
      "碎片纠错",
      "短平快",
      "细节提示"
    ],
    bio: "风格偏一分钟动作纠错、小技巧和发球细节。当前公开检索到的稳定直达视频较少，先纳入博主榜，内容库后续再补。",
    suitableFor: [
      "碎片纠错",
      "发球小技巧",
      "脚步细节"
    ],
    featuredContentIds: [],
    featuredVideos: [],
    recommendedCount: 0,
    profileUrl: "https://space.bilibili.com/180255509/",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/180255509/"
    },
    avatar: bilibiliAvatar("creator_yi_laoshi_sport"),
    rankingSignals: {
      subscriberScore: 0.36,
      averageViewsScore: 0.34,
      activityScore: 0.22,
      catalogScore: 0.24,
      authorityScore: 0.4,
      curatorBoost: 0.41
    },
    environment: ["testing", "production"],
    nameEn: "Coach Yi Tennis",
    shortDescriptionEn: "Short, fast fixes for common technique errors",
    bioEn: "One-minute corrections, quick tips, and serve details. Stable direct teaching videos are limited for now, but the account is still worth surfacing in rankings.",
    suitableForEn: ["Quick corrections","Serve tips","Footwork details"]
  },
  {
    id: "creator_qingying_tennis",
    name: "轻盈网球",
    shortDescription: "中文字幕整理型资料库，基础内容全",
    tags: [
      "讲解透彻",
      "基础筑形",
      "发球专修"
    ],
    region: "domestic",
    platforms: [
      "Bilibili"
    ],
    levels: [
      "2.5",
      "3.0",
      "3.5",
      "4.0"
    ],
    specialties: [
      "basics",
      "serve",
      "forehand",
      "backhand",
      "doubles"
    ],
    styleTags: [
      "中文字幕整理",
      "资料库型",
      "系统入门"
    ],
    bio: "以海外优质网球教学的中文字幕整理为主，不是中文原创拍摄型账号，但作为中文资料库非常实用，尤其适合入门系统看。",
    suitableFor: [
      "中文字幕教学",
      "基础入门",
      "发球与正手"
    ],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_qingying_tennis_video_01",
        title: "网球零基础入门必看！第一课 正手、反手和发球",
        sourceTitle: "网球零基础入门必看！第一课 正手、反手和发球",
        target: "零基础总不知道先学什么",
        levels: [
          "2.5",
          "3.0"
        ],
        thumbnail: "/thumbnails/bilibili/529b919020eb9553036e14723e093625c656b98a.jpg",
        viewCount: 370252,
        duration: "18:50",
        url: "https://www.bilibili.com/video/BV1iW4y1W7Mf/",
        platform: "Bilibili"
      },
      {
        id: "creator_qingying_tennis_video_02",
        title: "吐血推荐！改正5个最常见的网球正手错误",
        sourceTitle: "吐血推荐！改正5个最常见的网球正手错误",
        target: "正手总有老毛病改不掉",
        levels: [
          "2.5",
          "3.0",
          "3.5"
        ],
        thumbnail: "/thumbnails/bilibili/f50a0153b368b02f0aef2cd0c63f8b0c842319d3.jpg",
        viewCount: 158046,
        duration: "13:53",
        url: "https://www.bilibili.com/video/BV1sv4y1m7uu/",
        platform: "Bilibili"
      },
      {
        id: "creator_qingying_tennis_video_03",
        title: "网球入门必看！讲的最清楚的网球握拍方式",
        sourceTitle: "网球入门必看！讲的最清楚的网球握拍方式",
        target: "握拍总拿不准到底怎么握",
        levels: [
          "2.5",
          "3.0",
          "3.5"
        ],
        thumbnail: "/thumbnails/bilibili/c0f6c62b46e3b4c24c64800485b852540022185a.jpg",
        viewCount: 94665,
        duration: "4:09",
        url: "https://www.bilibili.com/video/BV1rW4y1H7fQ/",
        platform: "Bilibili"
      },
      {
        id: "creator_qingying_tennis_video_04",
        title: "网球发球必看！5个步骤学会发球",
        sourceTitle: "网球发球必看！5个步骤学会发球",
        target: "发球总不知道该怎么起步",
        levels: [
          "2.5",
          "3.0",
          "3.5"
        ],
        thumbnail: "/thumbnails/bilibili/36ff9bf3604ce7f0902474b9401c076ce3b45ab1.jpg",
        viewCount: 59944,
        duration: "16:38",
        url: "https://www.bilibili.com/video/BV18R4y1Q7N3/",
        platform: "Bilibili"
      },
      {
        id: "creator_qingying_tennis_video_05",
        title: "强烈推荐！网球上旋发球终极课",
        sourceTitle: "强烈推荐！网球上旋发球终极课",
        target: "上旋发球总练不出来",
        levels: [
          "3.0",
          "3.5",
          "4.0"
        ],
        thumbnail: "/thumbnails/bilibili/46c533ac23860d11fbe828d6beedd0381db5954a.jpg",
        viewCount: 54372,
        duration: "12:02",
        url: "https://www.bilibili.com/video/BV1Td4y1b734/",
        platform: "Bilibili"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://space.bilibili.com/3461582428309696/",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/3461582428309696/"
    },
    avatar: bilibiliAvatar("creator_qingying_tennis"),
    rankingSignals: {
      subscriberScore: 0.74,
      averageViewsScore: 0.82,
      activityScore: 0.61,
      catalogScore: 0.76,
      authorityScore: 0.48,
      curatorBoost: 0.52
    },
    environment: ["testing", "production"],
    nameEn: "Qingying Tennis",
    shortDescriptionEn: "A Chinese-subtitled teaching library with strong fundamentals",
    bioEn: "Primarily curates Chinese-subtitled versions of strong overseas tennis instruction. It is not an original Chinese teaching channel, but it is very practical as a learning library.",
    suitableForEn: ["Chinese-subtitled lessons","Fundamentals","Serve and forehand basics"]
  },
  {
    id: "creator_weiwei_tennis",
    name: "维维网球",
    shortDescription: "中文字幕教学整理，偏发球和击球点",
    tags: [
      "细节纠偏",
      "反手专修",
      "发球专修"
    ],
    region: "domestic",
    platforms: [
      "Bilibili"
    ],
    levels: [
      "3.0",
      "3.5",
      "4.0",
      "4.5"
    ],
    specialties: [
      "forehand",
      "serve",
      "backhand",
      "slice",
      "movement"
    ],
    styleTags: [
      "中文字幕整理",
      "击球点细化",
      "发球拆解"
    ],
    bio: "核心是国外优质教学的中文字幕 / 中英双字整理，偏击球点、发球和反手处理，更适合想把国外优质教学当中文资料库来用的人。",
    suitableFor: [
      "中文字幕教学",
      "击球点优化",
      "发球与反手"
    ],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_weiwei_tennis_video_01",
        title: "「维维网球」R-Flex教学之5步掌握完美正拍击球点（中文字幕）",
        sourceTitle: "「维维网球」R-Flex教学之5步掌握完美正拍击球点（中文字幕）",
        target: "正拍击球点总找不准",
        levels: [
          "3.0",
          "3.5",
          "4.0"
        ],
        thumbnail: "/thumbnails/bilibili/e8409f656790a99009cd6489b3e5b30e7b9c0926.jpg",
        viewCount: 23517,
        duration: "13:50",
        url: "https://www.bilibili.com/video/BV1ir1YBYE46/",
        platform: "Bilibili"
      },
      {
        id: "creator_weiwei_tennis_video_02",
        title: "「维维网球」PPT网球教学：为什么所有网球职业选手都这样发球——含训练方法（中文字幕）",
        sourceTitle: "「维维网球」PPT网球教学：为什么所有网球职业选手都这样发球——含训练方法（中文字幕）",
        target: "发球总抓不住职业动作关键",
        levels: [
          "3.0",
          "3.5",
          "4.0",
          "4.5"
        ],
        thumbnail: "/thumbnails/bilibili/77b93b578821ed54cf5a7c6ceea9529f9f065bcc.jpg",
        viewCount: 10661,
        duration: "9:33",
        url: "https://www.bilibili.com/video/BV1rAj2zRENd/",
        platform: "Bilibili"
      },
      {
        id: "creator_weiwei_tennis_video_03",
        title: "「维维网球」TTT系列网球教学：停止击球过晚——三步找到你的最佳击球点（中文字幕）",
        sourceTitle: "「维维网球」TTT系列网球教学：停止击球过晚——三步找到你的最佳击球点（中文字幕）",
        target: "击球总是来不及",
        levels: [
          "3.0",
          "3.5",
          "4.0"
        ],
        thumbnail: "/thumbnails/bilibili/bd1183a97dbf0d5ef98ca1d373fc714a439b6b3d.jpg",
        viewCount: 5934,
        duration: "9:37",
        url: "https://www.bilibili.com/video/BV18fiFBzEVF/",
        platform: "Bilibili"
      },
      {
        id: "creator_weiwei_tennis_video_04",
        title: "「维维网球」皮隆科娃系列教学：如何发球——平击发球、上旋发球与切削发球（中文字幕）",
        sourceTitle: "「维维网球」皮隆科娃系列教学：如何发球——平击发球、上旋发球与切削发球（中文字幕）",
        target: "发球类型总分不清",
        levels: [
          "3.0",
          "3.5",
          "4.0"
        ],
        thumbnail: "/thumbnails/bilibili/727b72465b9ecd9f9c1b059ea19a9626fe903edb.jpg",
        viewCount: 5837,
        duration: "8:51",
        url: "https://www.bilibili.com/video/BV1mSahzwEf3/",
        platform: "Bilibili"
      },
      {
        id: "creator_weiwei_tennis_video_05",
        title: "「维维网球」TH网球教学：不解决这个问题——比赛中永远打不出利落的正手击球（中文字幕）",
        sourceTitle: "「维维网球」TH网球教学：不解决这个问题——比赛中永远打不出利落的正手击球（中文字幕）",
        target: "比赛里正手总打不利索",
        levels: [
          "3.0",
          "3.5",
          "4.0"
        ],
        thumbnail: "/thumbnails/bilibili/012d51e653cc153ca765a69c41d02cdb7c2c329b.jpg",
        viewCount: 5761,
        duration: "8:40",
        url: "https://www.bilibili.com/video/BV18qeDzfEbD/",
        platform: "Bilibili"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://space.bilibili.com/668228879/",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/668228879/"
    },
    avatar: bilibiliAvatar("creator_weiwei_tennis"),
    rankingSignals: {
      subscriberScore: 0.5,
      averageViewsScore: 0.43,
      activityScore: 0.39,
      catalogScore: 0.48,
      authorityScore: 0.46,
      curatorBoost: 0.49
    },
    environment: ["testing", "production"],
    nameEn: "Weiwei Tennis",
    shortDescriptionEn: "Subtitled teaching focused on serve and contact point",
    bioEn: "Curates high-quality overseas lessons with Chinese subtitles, especially around contact point, serve, and backhand technique.",
    suitableForEn: ["Chinese-subtitled lessons","Contact-point improvement","Serve and backhand"]
  },
  {
    id: "creator_mt_tennis_cn",
    name: "MT_TENNIS",
    shortDescription: "慢动作与中字整理，适合看动作模板",
    tags: [
      "进阶突破",
      "正手专修",
      "发球专修"
    ],
    region: "domestic",
    platforms: [
      "Bilibili"
    ],
    levels: [
      "3.0",
      "3.5",
      "4.0",
      "4.5"
    ],
    specialties: [
      "forehand",
      "serve",
      "training",
      "backhand",
      "basics"
    ],
    styleTags: [
      "中字整理",
      "慢动作观察",
      "动作模板"
    ],
    bio: "以海外教学中字整理、慢动作赏析和动作模板观察为主，不属于中文原创教学，但适合拿来研究正手发力和动作范式。",
    suitableFor: [
      "慢动作观察",
      "中字整理",
      "动作模板赏析"
    ],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_mt_tennis_cn_video_01",
        title: "【TTT-西蒙网球教学/中字】正手发力的3个训练方法！",
        sourceTitle: "【TTT-西蒙网球教学/中字】正手发力的3个训练方法！",
        target: "正手发力总找不到训练法",
        levels: [
          "3.0",
          "3.5",
          "4.0"
        ],
        thumbnail: "/thumbnails/bilibili/cd5b2a578b3dbbaad1fa208896b016b40aa5514b.jpg",
        viewCount: 17779,
        duration: "10:00",
        url: "https://www.bilibili.com/video/BV1JE411v7gY/",
        platform: "Bilibili"
      },
      {
        id: "creator_mt_tennis_cn_video_02",
        title: "【TTT-西蒙网球教学/中字】西蒙分析德尔波特罗的超级正手！",
        sourceTitle: "【TTT-西蒙网球教学/中字】西蒙分析德尔波特罗的超级正手！",
        target: "想看高质量正手模板",
        levels: [
          "3.0",
          "3.5",
          "4.0",
          "4.5"
        ],
        thumbnail: "/thumbnails/bilibili/c53bbb9489b2fdf9f62902aee83da507e96825fd.jpg",
        viewCount: 9863,
        duration: "12:26",
        url: "https://www.bilibili.com/video/BV197411d72L/",
        platform: "Bilibili"
      },
      {
        id: "creator_mt_tennis_cn_video_03",
        title: "【TTT-网球训练】看看西蒙17岁学生的高强度网球训练！",
        sourceTitle: "【TTT-网球训练】看看西蒙17岁学生的高强度网球训练！",
        target: "想看高强度训练怎么练",
        levels: [
          "3.0",
          "3.5",
          "4.0"
        ],
        thumbnail: "/thumbnails/bilibili/8b0f25a4167fb2d54e2439afd6022d2b0c1987a9.jpg",
        viewCount: 9575,
        duration: "10:54",
        url: "https://www.bilibili.com/video/BV1FE41147BZ/",
        platform: "Bilibili"
      },
      {
        id: "creator_mt_tennis_cn_video_04",
        title: "【TTT-网球训练】Top Tennis Training西蒙职业网球训练方法速览！值得借鉴与学习！",
        sourceTitle: "【TTT-网球训练】Top Tennis Training西蒙职业网球训练方法速览！值得借鉴与学习！",
        target: "职业训练结构总没概念",
        levels: [
          "3.0",
          "3.5",
          "4.0"
        ],
        thumbnail: "/thumbnails/bilibili/d22f7f19eac42ecb3037172bd205800f49d15366.jpg",
        viewCount: 8710,
        duration: "3:09",
        url: "https://www.bilibili.com/video/BV11E411N7GE/",
        platform: "Bilibili"
      },
      {
        id: "creator_mt_tennis_cn_video_05",
        title: "【网坛三巨头-正手对比/镜像处理】三巨头正手慢动作比对 & 后附正手常速训练视频！",
        sourceTitle: "【网坛三巨头-正手对比/镜像处理】三巨头正手慢动作比对 & 后附正手常速训练视频！",
        target: "想对比高水平正手差异",
        levels: [
          "3.5",
          "4.0",
          "4.5"
        ],
        thumbnail: "/thumbnails/bilibili/15c471847c8e1c6bc4bb9fd8e3c357e87fce7987.jpg",
        viewCount: 14372,
        duration: "5:22",
        url: "https://www.bilibili.com/video/BV1TJ411h7p1/",
        platform: "Bilibili"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://space.bilibili.com/454770507/",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/454770507/"
    },
    avatar: bilibiliAvatar("creator_mt_tennis_cn"),
    rankingSignals: {
      subscriberScore: 0.64,
      averageViewsScore: 0.58,
      activityScore: 0.2,
      catalogScore: 0.4,
      authorityScore: 0.41,
      curatorBoost: 0.38
    },
    environment: ["testing", "production"],
    nameEn: "MT Tennis",
    shortDescriptionEn: "Slow motion and subtitled model-based study",
    bioEn: "Uses Chinese-subtitled overseas teaching plus slow-motion breakdowns, useful for studying forehand power and technical models.",
    suitableForEn: ["Slow-motion study","Chinese-subtitled library","Technique model analysis"]
  },
  {
    id: "creator_topspinpro_hidden",
    name: "topspinpro",
    shortDescription: "真实上传源，暂不参与博主榜",
    tags: ["训练器材", "上旋专项", "教学短课"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["topspin", "forehand", "training"],
    styleTags: ["真实上传源", "非榜单博主", "短课"],
    bio: "用于承载真实视频上传源，保证内容库中的博主名与源视频一致，不参与博主榜展示。",
    suitableFor: ["真实上传源"],
    featuredContentIds: ["content_gaiao_04"],
    rankingEligible: false,
    discoveryEligible: false,
    platformLinks: {
      Bilibili: "https://space.bilibili.com/495270797/"
    },
    rankingSignals: {
      subscriberScore: 0,
      averageViewsScore: 0,
      activityScore: 0,
      catalogScore: 0,
      authorityScore: 0,
      curatorBoost: 0
    },
    environment: ["testing", "production"]
  },
  {
    id: "creator_quanshui_hanshansi_hidden",
    name: "泉水叮咚寒山寺",
    shortDescription: "真实上传源，暂不参与博主榜",
    tags: ["翻译整理", "发球专修", "教学短课"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["serve", "training", "matchplay"],
    styleTags: ["真实上传源", "非榜单博主", "搬运整理"],
    bio: "用于承载真实视频上传源，保证内容库中的博主名与源视频一致，不参与博主榜展示。",
    suitableFor: ["真实上传源"],
    featuredContentIds: ["content_zlx_01"],
    rankingEligible: false,
    discoveryEligible: false,
    platformLinks: {
      Bilibili: "https://space.bilibili.com/522611110/"
    },
    rankingSignals: {
      subscriberScore: 0,
      averageViewsScore: 0,
      activityScore: 0,
      catalogScore: 0,
      authorityScore: 0,
      curatorBoost: 0
    },
    environment: ["testing", "production"]
  },
  {
    id: "creator_gaiao_xiaohongshu_hidden",
    name: "盖奥",
    shortDescription: "小红书真实上传源，暂不参与博主榜",
    tags: ["基础筑形", "正手基础", "发球节奏"],
    region: "domestic",
    platforms: ["Xiaohongshu"],
    levels: ["2.5", "3.0", "3.5"],
    specialties: ["forehand", "serve", "movement", "basics"],
    styleTags: ["真实上传源", "非榜单博主", "小红书直链"],
    bio: "用于承载已人工审核通过的小红书真实上传源，保证平台分开的直链记录可以进入内容库，同时不参与博主榜展示。",
    suitableFor: ["真实上传源", "小红书直链"],
    featuredContentIds: ["content_xhs_gaiao_01", "content_xhs_gaiao_02", "content_xhs_gaiao_03", "content_xhs_gaiao_04", "content_xhs_gaiao_05"],
    rankingEligible: false,
    discoveryEligible: false,
    profileUrl: "https://www.xiaohongshu.com/user/profile/5c3b619e000000000703fccc",
    platformLinks: {
      Xiaohongshu: "https://www.xiaohongshu.com/user/profile/5c3b619e000000000703fccc"
    },
    rankingSignals: {
      subscriberScore: 0,
      averageViewsScore: 0,
      activityScore: 0,
      catalogScore: 0,
      authorityScore: 0,
      curatorBoost: 0
    },
    environment: ["testing", "production"]
  },
  {
    id: "creator_lingxi_xiaohongshu_hidden",
    name: "灵熙🎾",
    shortDescription: "小红书真实上传源，暂不参与博主榜",
    tags: ["网前意识", "脚步思路", "发球节奏"],
    region: "domestic",
    platforms: ["Xiaohongshu"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["net", "movement", "matchplay", "serve"],
    styleTags: ["真实上传源", "非榜单博主", "小红书直链"],
    bio: "用于承载已人工审核通过的小红书真实上传源，作为灵熙目前已确认的平台主直链记录，不参与博主榜展示。",
    suitableFor: ["真实上传源", "小红书直链"],
    featuredContentIds: ["content_xhs_lingxi_01", "content_xhs_lingxi_02", "content_xhs_lingxi_03", "content_xhs_lingxi_04", "content_xhs_lingxi_05"],
    rankingEligible: false,
    discoveryEligible: false,
    profileUrl: "https://www.xiaohongshu.com/user/profile/63aef7df000000002702a346",
    platformLinks: {
      Xiaohongshu: "https://www.xiaohongshu.com/user/profile/63aef7df000000002702a346"
    },
    rankingSignals: {
      subscriberScore: 0,
      averageViewsScore: 0,
      activityScore: 0,
      catalogScore: 0,
      authorityScore: 0,
      curatorBoost: 0
    },
    environment: ["testing", "production"]
  },
  {
    id: "creator_mouratoglou_xiaohongshu_hidden",
    name: "冠军教练 - 莫拉托格鲁",
    shortDescription: "小红书真实上传源，暂不参与博主榜",
    tags: ["职业视角", "系统化", "前四拍组织"],
    region: "domestic",
    platforms: ["Xiaohongshu"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["forehand", "backhand", "net", "matchplay", "basics"],
    styleTags: ["真实上传源", "非榜单博主", "小红书直链"],
    bio: "用于承载已人工审核通过的小红书真实上传源，保证莫拉托格鲁内容在不同平台保持独立记录，不参与博主榜展示。",
    suitableFor: ["真实上传源", "小红书直链"],
    featuredContentIds: ["content_xhs_mouratoglou_01", "content_xhs_mouratoglou_02", "content_xhs_mouratoglou_03", "content_xhs_mouratoglou_04", "content_xhs_mouratoglou_05"],
    rankingEligible: false,
    discoveryEligible: false,
    profileUrl: "https://www.xiaohongshu.com/user/profile/6050684100000000010047d5",
    platformLinks: {
      Xiaohongshu: "https://www.xiaohongshu.com/user/profile/6050684100000000010047d5"
    },
    rankingSignals: {
      subscriberScore: 0,
      averageViewsScore: 0,
      activityScore: 0,
      catalogScore: 0,
      authorityScore: 0,
      curatorBoost: 0
    },
    environment: ["testing", "production"]
  },
  {
    id: "creator_dabaiyang_xiaohongshu_hidden",
    name: "奔跑的大白羊",
    shortDescription: "小红书候选审核用隐藏博主，暂不参与博主榜",
    tags: ["正手细节", "发球细节", "步频训练"],
    region: "domestic",
    platforms: ["Xiaohongshu"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["forehand", "serve", "movement", "basics"],
    styleTags: ["候选审核", "非榜单博主", "小红书直链"],
    bio: "用于承载奔跑的大白羊在小红书候选审核模式下的展示信息，不代表已进入 runtime 内容库，也不参与博主榜展示。",
    suitableFor: ["候选审核", "小红书直链"],
    featuredContentIds: [],
    rankingEligible: false,
    discoveryEligible: false,
    profileUrl: "https://www.xiaohongshu.com/user/profile/5676c499b8ce1a5b6e806853",
    platformLinks: {
      Xiaohongshu: "https://www.xiaohongshu.com/user/profile/5676c499b8ce1a5b6e806853"
    },
    rankingSignals: {
      subscriberScore: 0,
      averageViewsScore: 0,
      activityScore: 0,
      catalogScore: 0,
      authorityScore: 0,
      curatorBoost: 0
    },
    environment: ["testing", "production"]
  },
  {
    id: "creator_search_curated",
    name: "教练整理搜索入口",
    shortDescription: "暂未绑定单一博主",
    tags: ["基础筑形", "实战拆解", "讲解透彻"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["training", "matchplay", "basics", "consistency", "return", "defense", "mental"],
    styleTags: ["搜索入口", "教练整理", "无单一博主归属"],
    bio: "用于承载教练手工整理、但暂时无法诚实归属到单一 B 站博主的搜索入口内容，不参与博主排行榜或博主页推荐。",
    suitableFor: ["搜索入口内容", "暂未绑定单一 B 站博主", "主题检索"],
    featuredContentIds: [
      "content_cn_c_01",
      "content_common_01",
      "content_cn_e_01",
      "content_cn_e_02",
      "content_cn_e_03",
      "content_cn_f_01",
      "content_cn_f_03"
    ],
    rankingEligible: false,
    discoveryEligible: false,
    rankingSignals: {
      subscriberScore: 0,
      averageViewsScore: 0,
      activityScore: 0,
      catalogScore: 0,
      authorityScore: 0,
      curatorBoost: 0
    },
    environment: ["testing", "production"]
  },
  {
    id: "creator_mouratoglou_official",
    name: "patrickmouratoglou_official",
    shortDescription: "世界级教练的系统拆解",
    tags: ["进阶突破", "发球专修", "实战拆解"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["serve", "forehand", "matchplay", "basics"],
    styleTags: ["职业视角", "系统化", "动作拆解"],
    bio: "偏世界级教练视角和职业训练逻辑，适合想理解高水平技术框架与比赛思维的球员。",
    suitableFor: ["职业训练视角", "进阶技术", "比赛执行"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_mouratoglou_official_video_01",
        title: "How to fix your serve and finally get full power",
        target: "发球总打不出全力",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/6HuaZ1kTTkM/mqdefault.jpg',
    viewCount: 391731,
        duration: '10:46',
        url: "https://www.youtube.com/watch?v=6HuaZ1kTTkM",
        platform: "YouTube"
      },
      {
        id: "creator_mouratoglou_official_video_02",
        title: "The return of serve: TENNIS MASTERCLASS by Patrick Mouratoglou, EPISODE 1",
        target: "接发启动总是偏慢",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/vPtNtNi8_NI/mqdefault.jpg',
    viewCount: 1814794,
        duration: '20:52',
        url: "https://www.youtube.com/watch?v=vPtNtNi8_NI",
        platform: "YouTube"
      },
      {
        id: "creator_mouratoglou_official_video_03",
        title: "Serve and volley: TENNIS MASTERCLASS by Patrick Mouratoglou, EPISODE 8",
        target: "上网衔接总断节奏",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/pUb1fZ-f994/mqdefault.jpg',
    viewCount: 219645,
        duration: '12:48',
        url: "https://www.youtube.com/watch?v=pUb1fZ-f994",
        platform: "YouTube"
      },
      {
        id: "creator_mouratoglou_official_video_04",
        title: "15-minute slice serve lesson",
        target: "切削发球总找不到感觉",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/I3tyFvI17OE/mqdefault.jpg',
    viewCount: 124928,
        duration: '12:13',
        url: "https://www.youtube.com/watch?v=I3tyFvI17OE",
        platform: "YouTube"
      },
      {
        id: "creator_mouratoglou_official_video_05",
        title: "Get Rid of Double Faults: Serve Lesson with Patrick Mouratoglou",
        target: "二发双误总是偏多",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/6ko_0cjfP-0/mqdefault.jpg',
    viewCount: 914143,
        duration: '11:27',
        url: "https://www.youtube.com/watch?v=6ko_0cjfP-0",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@patrickmouratoglou_official",
    platformLinks: {
      YouTube: "https://www.youtube.com/@patrickmouratoglou_official"
    },
    avatar: youtubeAvatar("@patrickmouratoglou_official"),
    rankingSignals: {
      subscriberScore: 0.92,
      averageViewsScore: 0.84,
      activityScore: 0.88,
      catalogScore: 0.82,
      authorityScore: 1,
      curatorBoost: 0.98
    },
    environment: ["testing", "production"],
    nameZh: "莫拉托格鲁教练",
    shortDescriptionEn: "World-class coach breakdowns on serve and tactics",
    bioEn: "Systematic coaching from one of the top coaches in professional tennis, covering serve mechanics, match strategy, and shot selection.",
    suitableForEn: ["Serve mechanics","Match tactics","Advanced technique"]
  },
  {
    id: "creator_venus_williams",
    name: "Venus Williams",
    shortDescription: "职业球员分享比赛经验",
    tags: ["实战拆解", "进阶突破", "发球专修"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.5", "4.0", "4.5"],
    specialties: ["serve", "matchplay", "mental"],
    styleTags: ["职业球员", "比赛导向", "经验导向"],
    bio: "偏职业球员视角和比赛经验分享，适合想从顶级选手经验中理解训练与比赛心态的球员。",
    suitableFor: ["比赛经验", "职业视角", "发球与执行"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_venus_williams_video_01",
        title: "How To Hit A Basic Tennis Serve with Venus Williams",
        target: "一发动作为何总不稳",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/bRCQwLgEs9M/mqdefault.jpg',
    viewCount: 3079945,
        duration: '13:08',
        url: "https://www.youtube.com/watch?v=bRCQwLgEs9M",
        platform: "YouTube"
      },
      {
        id: "creator_venus_williams_video_02",
        title: "How to Hit a 2nd Serve in Tennis With Venus Williams",
        target: "二发总是不敢加转",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/3mhGN6KtjZg/mqdefault.jpg',
    viewCount: 107532,
        duration: '5:47',
        url: "https://www.youtube.com/watch?v=3mhGN6KtjZg",
        platform: "YouTube"
      },
      {
        id: "creator_venus_williams_video_03",
        title: "How To Hit Forehand with Venus Williams",
        target: "正手击球总不够扎实",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/mXy0jJl8Pnc/mqdefault.jpg',
    viewCount: 782912,
        duration: '11:18',
        url: "https://www.youtube.com/watch?v=mXy0jJl8Pnc",
        platform: "YouTube"
      },
      {
        id: "creator_venus_williams_video_04",
        title: "How To Hit A Tennis Backhand With Venus Williams",
        target: "反手动作总不够顺",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/5M52JoEDtwY/mqdefault.jpg',
    viewCount: 332086,
        duration: '9:25',
        url: "https://www.youtube.com/watch?v=5M52JoEDtwY",
        platform: "YouTube"
      },
      {
        id: "creator_venus_williams_video_05",
        title: "How To Improve Your Footwork With Venus Williams",
        target: "脚步总跟不上节奏",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/PX6n7jvbCj0/mqdefault.jpg',
    viewCount: 97753,
        duration: '9:10',
        url: "https://www.youtube.com/watch?v=PX6n7jvbCj0",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@VenusWilliams/videos",
    platformLinks: {
      YouTube: "https://www.youtube.com/@VenusWilliams/videos"
    },
    avatar: youtubeAvatar("@VenusWilliams"),
    rankingSignals: {
      subscriberScore: 0.98,
      averageViewsScore: 0.88,
      activityScore: 0.76,
      catalogScore: 0.58,
      authorityScore: 1,
      curatorBoost: 0.95
    },
    environment: ["testing", "production"],
    nameZh: "维纳斯·威廉姆斯",
    shortDescriptionEn: "Pro player insights on match mentality",
    bioEn: "A Grand Slam champion sharing first-hand experience on competition mindset, shot selection, and what it takes to compete at a high level.",
    suitableForEn: ["Match mentality","Pro perspective","Serve and power"]
  },
  {
    id: "creator_tennis_with_dylan",
    name: "Tennis with Dylan",
    shortDescription: "发球脚步和实战训练",
    tags: ["发球专修", "步法启动", "实战拆解"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["serve", "movement", "matchplay"],
    styleTags: ["讲解透彻", "实战拆解"],
    bio: "偏职业球员与教练视角，适合想加强发球、步伐和实战训练思路的业余球员。",
    suitableFor: ["发球节奏", "步法启动", "实战训练"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_tennis_with_dylan_video_01",
        title: "How to Serve more ACCURATELY in Tennis",
        target: "发球落点总控制不住",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/IzsqHxQ0AWM/mqdefault.jpg',
    viewCount: 85451,
        duration: '6:28',
        url: "https://www.youtube.com/watch?v=IzsqHxQ0AWM",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_with_dylan_video_02",
        title: "How To Hit A Powerful Kick Serve! A Full 8 Step Guide",
        target: "kick serve一直发不起来",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/KSq5w6CT9tg/mqdefault.jpg',
    viewCount: 56224,
        duration: '23:51',
        url: "https://www.youtube.com/watch?v=KSq5w6CT9tg",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_with_dylan_video_03",
        title: "Master Your Tennis Serve: Top 5 Fluency Exercises",
        target: "发球动作总不够流畅",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/tws4espU65c/mqdefault.jpg',
    viewCount: 5224,
        duration: '5:22',
        url: "https://www.youtube.com/watch?v=tws4espU65c",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_with_dylan_video_04",
        title: "How to level up your footwork game!",
        target: "脚步总慢一步",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/wE2NvPBezVo/mqdefault.jpg',
    viewCount: 3467,
        duration: '5:05',
        url: "https://www.youtube.com/watch?v=wE2NvPBezVo",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_with_dylan_video_05",
        title: "How to Master your Drop Shot | Tennis lesson & Tips",
        target: "小球手感总拿不准",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/qKWBcr1esUs/mqdefault.jpg',
    viewCount: 39697,
        duration: '6:43',
        url: "https://www.youtube.com/watch?v=qKWBcr1esUs",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@Tenniswithdylan",
    platformLinks: {
      YouTube: "https://www.youtube.com/@Tenniswithdylan"
    },
    avatar: youtubeAvatar("@Tenniswithdylan"),
    rankingSignals: {
      subscriberScore: 0.8,
      averageViewsScore: 0.84,
      activityScore: 0.86,
      catalogScore: 0.74,
      authorityScore: 0.82,
      curatorBoost: 1
    },
    environment: ["testing", "production"],
    nameZh: "迪伦网球",
    shortDescriptionEn: "Serve, footwork, and live drill sessions",
    bioEn: "Energetic drills and footwork-focused practice sessions, useful for players who want to sharpen movement and serve rhythm.",
    suitableForEn: ["Footwork drills","Serve rhythm","Live practice"]
  },
  {
    id: "creator_top_tennis_training",
    name: "Top Tennis Training",
    shortDescription: "系统化正反手教学",
    tags: ["基础筑形", "正手专修", "讲解透彻"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["serve", "forehand", "backhand", "basics"],
    styleTags: ["讲解透彻", "系统化", "入门友好"],
    bio: "偏系统化基础教学，适合需要把发球和整体动作框架重新理顺的业余球员。",
    suitableFor: ["发球抛球不稳", "基础动作重建", "技术框架梳理"],
    featuredContentIds: ["content_ttt_01"],
    featuredVideos: [
      {
        id: "creator_top_tennis_training_video_01",
        title: "Simple Tennis Serve Technique Masterclass for Beginners",
        target: "发球抛球总是不稳",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/IiRGdagtOKE/mqdefault.jpg',
    viewCount: 1662697,
        duration: '16:42',
        url: "https://www.youtube.com/watch?v=IiRGdagtOKE",
        platform: "YouTube"
      },
      {
        id: "creator_top_tennis_training_video_02",
        title: "Forehand Power Unlocked: Use This To Create Speed 🚀",
        target: "正手总打不出速度",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/M5R8M6xsr74/mqdefault.jpg',
    viewCount: 10554,
        duration: '0:34',
        url: "https://www.youtube.com/watch?v=M5R8M6xsr74",
        platform: "YouTube"
      },
      {
        id: "creator_top_tennis_training_video_03",
        title: "Carlos Alcaraz Forehand Analysis",
        target: "想学现代正手发力",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/6lZHjJiALrY/mqdefault.jpg',
    viewCount: 24506,
        duration: '0:34',
        url: "https://www.youtube.com/watch?v=6lZHjJiALrY",
        platform: "YouTube"
      },
      {
        id: "creator_top_tennis_training_video_04",
        title: "Forehand Transformation of US College Player 🧐",
        target: "正手动作想系统重建",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/pdiVTlAw87M/mqdefault.jpg',
    viewCount: 43189,
        duration: '0:26',
        url: "https://www.youtube.com/watch?v=pdiVTlAw87M",
        platform: "YouTube"
      },
      {
        id: "creator_top_tennis_training_video_05",
        title: "Hammer Your Serve For More Power 🎾🔨",
        target: "发球总缺少爆发力",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/ZFFKO5pRe4U/mqdefault.jpg',
    viewCount: 35081,
        duration: '0:24',
        url: "https://www.youtube.com/watch?v=ZFFKO5pRe4U",
        platform: "YouTube"
      }
    ],
    recommendedCount: 1,
    profileUrl: "https://www.youtube.com/@TopTennisTrainingOfficial",
    platformLinks: {
      YouTube: "https://www.youtube.com/@TopTennisTrainingOfficial"
    },
    avatar: youtubeAvatar("@TopTennisTrainingOfficial"),
    rankingSignals: {
      subscriberScore: 0.88,
      averageViewsScore: 0.86,
      activityScore: 0.85,
      catalogScore: 0.88,
      authorityScore: 0.84,
      curatorBoost: 0.82
    },
    environment: ["testing", "production"],
    nameZh: "顶级网球训练",
    shortDescriptionEn: "Structured forehand and backhand lessons",
    bioEn: "Methodical groundstroke instruction covering forehand and backhand fundamentals with clear progressions.",
    suitableForEn: ["Forehand fundamentals","Backhand stability","Clear progressions"]
  },
  {
    id: "creator_essential_tennis",
    name: "Essential Tennis",
    shortDescription: "底线深度和比赛策略",
    tags: ["进阶突破", "实战拆解", "战术拆局"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["consistency", "forehand", "backhand", "matchplay"],
    styleTags: ["讲解透彻", "实战拆解", "系统化"],
    bio: "偏业余球员高频问题教学，适合补相持深度、稳定性和比赛执行的基础认知。",
    suitableFor: ["球总打浅", "底线深度控制", "稳定性提升"],
    featuredContentIds: ["content_et_01"],
    featuredVideos: [
      {
        id: "creator_essential_tennis_video_01",
        title: "How To Control Groundstroke Depth",
        target: "相持球总落在发球线",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/rqvhgHDx-lE/mqdefault.jpg',
    viewCount: 173776,
        duration: '6:43',
        url: "https://www.youtube.com/watch?v=rqvhgHDx-lE",
        platform: "YouTube"
      },
      {
        id: "creator_essential_tennis_video_02",
        title: "How to make REAL serve improvement",
        target: "发球练了很久没进步",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/9IcmG7vGE2A/mqdefault.jpg',
    viewCount: 2691,
        duration: '1:16',
        url: "https://www.youtube.com/watch?v=9IcmG7vGE2A",
        platform: "YouTube"
      },
      {
        id: "creator_essential_tennis_video_03",
        title: "You're standing in the WRONG place (doubles strategy)",
        target: "双打站位总是站错",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/EDCjPd41ipo/mqdefault.jpg',
    viewCount: 20694,
        duration: '15:02',
        url: "https://www.youtube.com/watch?v=EDCjPd41ipo",
        platform: "YouTube"
      },
      {
        id: "creator_essential_tennis_video_04",
        title: "How to improve your FLAT and SLICE serves:",
        target: "平击和切削发球分不清",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/a1ItdT8iPiE/mqdefault.jpg',
    viewCount: 2507,
        duration: '0:49',
        url: "https://www.youtube.com/watch?v=a1ItdT8iPiE",
        platform: "YouTube"
      },
      {
        id: "creator_essential_tennis_video_05",
        title: "Why you CAN'T shake your bad tennis habits",
        target: "坏习惯怎么都改不掉",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/mk5FDsmiqWU/mqdefault.jpg',
    viewCount: 4047,
        duration: '2:25',
        url: "https://www.youtube.com/watch?v=mk5FDsmiqWU",
        platform: "YouTube"
      }
    ],
    recommendedCount: 1,
    profileUrl: "https://www.youtube.com/@EssentialTennis/videos",
    platformLinks: {
      YouTube: "https://www.youtube.com/@EssentialTennis/videos"
    },
    avatar: youtubeAvatar("@EssentialTennis"),
    rankingSignals: {
      subscriberScore: 0.9,
      averageViewsScore: 0.84,
      activityScore: 0.9,
      catalogScore: 1,
      authorityScore: 0.82,
      curatorBoost: 0.8
    },
    environment: ["testing", "production"],
    nameZh: "Essential网球",
    shortDescriptionEn: "Rally depth and match strategy for club players",
    bioEn: "Strategy-first teaching focused on rally consistency, court positioning, and smart shot selection for recreational competitors.",
    suitableForEn: ["Rally depth","Court positioning","Match strategy"]
  },
  {
    id: "creator_online_tennis_instruction",
    name: "Online Tennis Instruction",
    shortDescription: "长线技术框架和重建",
    tags: ["基础筑形", "发球专修", "讲解透彻"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["serve", "forehand", "backhand", "basics"],
    styleTags: ["系统化", "动作拆解", "讲解透彻"],
    bio: "偏长线技术框架和专项细节讲解，适合想系统补基础动作的球员。",
    suitableFor: ["技术重建", "发球框架", "正反手动作"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_online_tennis_instruction_video_01",
        title: "How to Hit Powerful Forehands Like Andrey Rublev💪🏼",
        target: "正手力量总起不来",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/A4RcqEYAX_4/mqdefault.jpg',
    viewCount: 1159,
        duration: '0:36',
        url: "https://www.youtube.com/watch?v=A4RcqEYAX_4",
        platform: "YouTube"
      },
      {
        id: "creator_online_tennis_instruction_video_02",
        title: "Let’s level up your serve 🚀",
        target: "发球想整体升级一档",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/sqTAN15wKPA/mqdefault.jpg',
    viewCount: 798,
        duration: '0:37',
        url: "https://www.youtube.com/watch?v=sqTAN15wKPA",
        platform: "YouTube"
      },
      {
        id: "creator_online_tennis_instruction_video_03",
        title: "Stop over-rotating your forehand 🎾 💥",
        target: "正手总是过度转体",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/JEwzpFtz3f4/mqdefault.jpg',
    viewCount: 978,
        duration: '1:43',
        url: "https://www.youtube.com/watch?v=JEwzpFtz3f4",
        platform: "YouTube"
      },
      {
        id: "creator_online_tennis_instruction_video_04",
        title: "Unlock the forehand secret of Roger Federer 🎾✨",
        target: "想学更流畅的正手",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/u6h56Fatgoo/mqdefault.jpg',
    viewCount: 1491,
        duration: '0:52',
        url: "https://www.youtube.com/watch?v=u6h56Fatgoo",
        platform: "YouTube"
      },
      {
        id: "creator_online_tennis_instruction_video_05",
        title: "Avoid late contact when hitting! 🎾",
        target: "击球点总是偏晚",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/_2gV8oLht7w/mqdefault.jpg',
    viewCount: 815,
        duration: '1:29',
        url: "https://www.youtube.com/watch?v=_2gV8oLht7w",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@OnlineTennisInstruction",
    platformLinks: {
      YouTube: "https://www.youtube.com/@OnlineTennisInstruction"
    },
    avatar: youtubeAvatar("@OnlineTennisInstruction"),
    rankingSignals: {
      subscriberScore: 0.82,
      averageViewsScore: 0.78,
      activityScore: 0.82,
      catalogScore: 0.9,
      authorityScore: 0.82,
      curatorBoost: 0.78
    },
    environment: ["testing", "production"],
    nameZh: "在线网球教学",
    shortDescriptionEn: "Long-form technique rebuilds and frameworks",
    bioEn: "In-depth stroke reconstruction lessons for players who want to rebuild their technique from the ground up.",
    suitableForEn: ["Technique rebuild","Serve framework","Stroke structure"]
  },
  {
    id: "creator_performance_plus_tennis",
    name: "Performance-Plus Tennis",
    shortDescription: "动作修正和移动基础",
    tags: ["细节纠偏", "步法启动", "基础筑形"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["forehand", "backhand", "basics", "movement"],
    styleTags: ["动作拆解", "讲解透彻", "训练导向"],
    bio: "偏动作修正和训练细节，适合想把击球和移动基础做扎实的球员。",
    suitableFor: ["动作修正", "基础训练", "击球稳定性"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_performance_plus_tennis_video_01",
        title: "PRO Forehand In 5 Simple Steps | Tennis Forehand Technique Lesson",
        target: "正手基础总不成形",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/CFhKuNW8n4M/mqdefault.jpg',
    viewCount: 25746,
        duration: '10:39',
        url: "https://www.youtube.com/watch?v=CFhKuNW8n4M",
        platform: "YouTube"
      },
      {
        id: "creator_performance_plus_tennis_video_02",
        title: "Hit More Balanced Forehands With These Footwork Patterns",
        target: "正手脚步总站不稳",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/wJL_bF2vTR4/mqdefault.jpg',
    viewCount: 3830,
        duration: '7:05',
        url: "https://www.youtube.com/watch?v=wJL_bF2vTR4",
        platform: "YouTube"
      },
      {
        id: "creator_performance_plus_tennis_video_03",
        title: "Professional Volley Technique Explained | Volley Tennis Lesson",
        target: "网前截击总不稳定",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/CZieswXdzX8/mqdefault.jpg',
    viewCount: 81796,
        duration: '7:44',
        url: "https://www.youtube.com/watch?v=CZieswXdzX8",
        platform: "YouTube"
      },
      {
        id: "creator_performance_plus_tennis_video_04",
        title: "How To IMPROVE Your Racket Drop Right Away! | Tennis Serve Lesson",
        target: "发球拍头下沉不够",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/EodEeytcd44/mqdefault.jpg',
    viewCount: 13600,
        duration: '8:43',
        url: "https://www.youtube.com/watch?v=EodEeytcd44",
        platform: "YouTube"
      },
      {
        id: "creator_performance_plus_tennis_video_05",
        title: "5 Drills For EASY Serve Pronation! Tennis Serve Lesson",
        target: "发球内旋总做不出来",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/CJlW6tOT4Ho/mqdefault.jpg',
    viewCount: 57618,
        duration: '12:30',
        url: "https://www.youtube.com/watch?v=CJlW6tOT4Ho",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@PerformancePlusTennis/videos",
    platformLinks: {
      YouTube: "https://www.youtube.com/@PerformancePlusTennis/videos"
    },
    avatar: youtubeAvatar("@PerformancePlusTennis"),
    rankingSignals: {
      subscriberScore: 0.72,
      averageViewsScore: 0.76,
      activityScore: 0.75,
      catalogScore: 0.72,
      authorityScore: 0.78,
      curatorBoost: 0.76
    },
    environment: ["testing", "production"],
    nameZh: "进阶网球训练",
    shortDescriptionEn: "Movement corrections and stroke adjustments",
    bioEn: "Detail-oriented coaching focused on fixing movement patterns and refining stroke mechanics.",
    suitableForEn: ["Movement fixes","Stroke refinement","Footwork basics"]
  },
  {
    id: "creator_karue_sell",
    name: "Karue Sell",
    shortDescription: "现代击球和实战细节",
    tags: ["进阶突破", "正手专修", "实战拆解"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.5", "4.0", "4.5"],
    specialties: ["forehand", "backhand", "matchplay"],
    styleTags: ["讲解透彻", "细节纠偏"],
    bio: "偏现代击球和职业训练视角，适合想看高质量击球细节与实战决策的球员。",
    suitableFor: ["现代正反手", "击球细节", "实战决策"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_karue_sell_video_01",
        title: "How I Improved My Forehand and Won 17 MATCHES IN A ROW",
        target: "正手稳定性迟迟上不去",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/a5cQqfBOvRM/mqdefault.jpg',
    viewCount: 420355,
        duration: '12:24',
        url: "https://www.youtube.com/watch?v=a5cQqfBOvRM",
        platform: "YouTube"
      },
      {
        id: "creator_karue_sell_video_02",
        title: "Hit Better Groundstrokes: Driving vs Lifting - Make The Right Choice ft ATP Top 300 and @WinstonDu",
        target: "拉球还是平击总拿不准",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/4gzgsVEs0Nc/mqdefault.jpg',
    viewCount: 182763,
        duration: '16:18',
        url: "https://www.youtube.com/watch?v=4gzgsVEs0Nc",
        platform: "YouTube"
      },
      {
        id: "creator_karue_sell_video_03",
        title: "The ULTIMATE Double Handed Backhand Lesson | Ft. Winston DU",
        target: "双反细节总不够顺",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/7ZR7n-PWCUQ/mqdefault.jpg',
    viewCount: 298426,
        duration: '22:56',
        url: "https://www.youtube.com/watch?v=7ZR7n-PWCUQ",
        platform: "YouTube"
      },
      {
        id: "creator_karue_sell_video_04",
        title: "I Am A Top 300 Player In The World - Here Are 10 Drills That Helped Me Improve My Footwork",
        target: "移动节奏总跟不上",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/qwHc-YqK3qw/mqdefault.jpg',
    viewCount: 211029,
        duration: '24:37',
        url: "https://www.youtube.com/watch?v=qwHc-YqK3qw",
        platform: "YouTube"
      },
      {
        id: "creator_karue_sell_video_05",
        title: "Tennis Tactics SIMPLIFIED By Former Top 400 ATP - 3 Simple Rules You Need To Follow",
        target: "比赛选择总是太乱",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/G9wZ942dwJE/mqdefault.jpg',
    viewCount: 139181,
        duration: '13:48',
        url: "https://www.youtube.com/watch?v=G9wZ942dwJE",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@Karue-Sell",
    platformLinks: {
      YouTube: "https://www.youtube.com/@Karue-Sell"
    },
    avatar: youtubeAvatar("@Karue-Sell"),
    rankingSignals: {
      subscriberScore: 0.78,
      averageViewsScore: 0.82,
      activityScore: 0.8,
      catalogScore: 0.7,
      authorityScore: 0.86,
      curatorBoost: 0.76
    },
    environment: ["testing", "production"],
    nameZh: "卡鲁·塞尔",
    shortDescriptionEn: "Modern strokes and live match details",
    bioEn: "A modern-game perspective with insights on shot shaping, timing, and real match execution.",
    suitableForEn: ["Modern technique","Forehand power","Match execution"]
  },
  {
    id: "creator_intuitive_tennis",
    name: "Intuitive Tennis",
    shortDescription: "4.5 学员实拍纠正",
    tags: ["细节纠偏", "进阶突破", "反手专修"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.5", "4.0", "4.5"],
    specialties: ["serve", "backhand", "slice", "matchplay"],
    styleTags: ["细节纠偏", "纠错导向", "讲解透彻"],
    bio: "偏动作修正和击球细节纠错，适合想看切削、发球和击球轨迹修正的球员。",
    suitableFor: ["切削总飘", "动作细节修正", "击球轨迹不稳定"],
    featuredContentIds: ["content_it_01"],
    featuredVideos: [
      {
        id: "creator_intuitive_tennis_video_01",
        title: "Backhand Slice Tennis Lesson with 4.5 NTRP Student",
        target: "反手切削总飘太高",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/d-VvKDgoIew/mqdefault.jpg',
    viewCount: 458190,
        duration: '11:13',
        url: "https://www.youtube.com/watch?v=d-VvKDgoIew",
        platform: "YouTube"
      },
      {
        id: "creator_intuitive_tennis_video_02",
        title: "How To Hit A Kick Serve?",
        target: "kick serve总是做不出来",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/j6c1WPIsk_8/mqdefault.jpg',
    viewCount: 345517,
        duration: '17:14',
        url: "https://www.youtube.com/watch?v=j6c1WPIsk_8",
        platform: "YouTube"
      },
      {
        id: "creator_intuitive_tennis_video_03",
        title: "Hit Up on Kick with Bent Arm? | 4.5 NTRP Player Serve Lesson",
        target: "kick serve发力路径不清",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/NPdd7vEVgjw/mqdefault.jpg',
    viewCount: 34204,
        duration: '15:44',
        url: "https://www.youtube.com/watch?v=NPdd7vEVgjw",
        platform: "YouTube"
      },
      {
        id: "creator_intuitive_tennis_video_04",
        title: "Kick Serve vs Slice Serve | How to Avoid Slice When Trying to Kick",
        target: "kick和slice总是混掉",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/PXt7NbymwRw/mqdefault.jpg',
    viewCount: 537907,
        duration: '7:49',
        url: "https://www.youtube.com/watch?v=PXt7NbymwRw",
        platform: "YouTube"
      },
      {
        id: "creator_intuitive_tennis_video_05",
        title: "The Biggest Kick Serve Myths | Why They Will Halt Improvement",
        target: "学kick serve总走弯路",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/UKco_SyQgeU/mqdefault.jpg',
    viewCount: 83239,
        duration: '9:41',
        url: "https://www.youtube.com/watch?v=UKco_SyQgeU",
        platform: "YouTube"
      }
    ],
    recommendedCount: 1,
    profileUrl: "https://www.youtube.com/@intuitivetennis",
    platformLinks: {
      YouTube: "https://www.youtube.com/@intuitivetennis"
    },
    avatar: youtubeAvatar("@intuitivetennis"),
    rankingSignals: {
      subscriberScore: 0.8,
      averageViewsScore: 0.8,
      activityScore: 0.83,
      catalogScore: 0.78,
      authorityScore: 0.84,
      curatorBoost: 0.78
    },
    environment: ["testing", "production"],
    nameZh: "直觉网球",
    shortDescriptionEn: "Real student corrections at the 4.0–4.5 level",
    bioEn: "On-court lesson recordings showing real-time corrections for intermediate to advanced recreational players.",
    suitableForEn: ["Live corrections","Backhand fixes","4.0+ improvement"]
  },
  {
    id: "creator_tennis_evolution",
    name: "Tennis Evolution",
    shortDescription: "适合重建基础动作框架",
    tags: ["入门友好", "基础筑形", "讲解透彻"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["serve", "forehand", "backhand", "basics"],
    styleTags: ["入门友好", "讲解透彻"],
    bio: "偏系统化技术教学，适合想补正反手、发球和基础动作框架的业余球员。",
    suitableFor: ["基础动作", "正反手修正", "发球入门"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_tennis_evolution_video_01",
        title: "Master the Kick Serve | Slow Motion ATP Pro Demo",
        target: "kick serve发力轨迹不清",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/yjdw6WToO80/mqdefault.jpg',
    viewCount: 2329,
        duration: '6:37',
        url: "https://www.youtube.com/watch?v=yjdw6WToO80",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_evolution_video_02",
        title: "Learning Lag: The Secret to Effortless Racquet Speed",
        target: "想提拍速却总发死力",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/uOcqkQgjtoU/mqdefault.jpg',
    viewCount: 4182,
        duration: '5:22',
        url: "https://www.youtube.com/watch?v=uOcqkQgjtoU",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_evolution_video_03",
        title: "The Famous Spanish Drill to Build Consistency 🇪🇸",
        target: "相持稳定性总是断档",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/xnMnNXALL-E/mqdefault.jpg',
    viewCount: 51158,
        duration: '4:59',
        url: "https://www.youtube.com/watch?v=xnMnNXALL-E",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_evolution_video_04",
        title: "Stop Using the Wrong Forehand Stance | Open vs Closed Explained",
        target: "正手站位总选不对",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/lobiC9wUHLw/mqdefault.jpg',
    viewCount: 2243,
        duration: '5:41',
        url: "https://www.youtube.com/watch?v=lobiC9wUHLw",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_evolution_video_05",
        title: "Your Tennis Footwork is NOT Helping You Play Better",
        target: "移动脚步总帮倒忙",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/8a4QSG53ftc/mqdefault.jpg',
    viewCount: 2010,
        duration: '6:41',
        url: "https://www.youtube.com/watch?v=8a4QSG53ftc",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@TennisEvolution",
    platformLinks: {
      YouTube: "https://www.youtube.com/@TennisEvolution"
    },
    avatar: youtubeAvatar("@TennisEvolution"),
    rankingSignals: {
      subscriberScore: 0.68,
      averageViewsScore: 0.66,
      activityScore: 0.7,
      catalogScore: 0.76,
      authorityScore: 0.68,
      curatorBoost: 0.68
    },
    environment: ["testing", "production"],
    nameZh: "网球进化",
    shortDescriptionEn: "Beginner-friendly stroke rebuilds",
    bioEn: "Step-by-step fundamentals for players who want to rebuild their strokes with a clean, repeatable framework.",
    suitableForEn: ["Stroke rebuild","Beginner fundamentals","Clean technique"]
  },
  {
    id: "creator_time_value_of_tennis",
    name: "Time Value of Tennis",
    shortDescription: "技术细节和比赛理解并重",
    tags: ["细节纠偏", "进阶突破", "实战拆解"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["forehand", "backhand", "matchplay", "basics", "consistency"],
    styleTags: ["细节纠偏", "比赛导向", "讲解透彻"],
    bio: "偏技术细节和比赛决策拆解，适合想同时理解动作质量和回合思路的球员。",
    suitableFor: ["技术细节", "回合思路", "进阶突破"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_time_value_of_tennis_video_01",
        title: "To Make Every Volley In Against Anyone , Do This",
        target: "网前总不敢主动上",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://i.ytimg.com/vi/_dYUksHdM6k/mqdefault.jpg",
    viewCount: 202189,
        duration: "9:04",
        url: "https://www.youtube.com/watch?v=_dYUksHdM6k",
        platform: "YouTube"
      },
      {
        id: "creator_time_value_of_tennis_video_02",
        title: "How To Handle High Balls With A One Handed Backhand!",
        target: "反手高点击球总处理不好",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://i.ytimg.com/vi/5_FWpma6BA4/mqdefault.jpg",
    viewCount: 147271,
        duration: "6:54",
        url: "https://www.youtube.com/watch?v=5_FWpma6BA4",
        platform: "YouTube"
      },
      {
        id: "creator_time_value_of_tennis_video_03",
        title: "Avoid the MOST COMMON MISTAKE trying to generate TOPSPIN! Learn what the tennis Pro's do.",
        target: "上旋总是转不起来",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://i.ytimg.com/vi/ekj5T9aBv6Y/mqdefault.jpg",
    viewCount: 93002,
        duration: "5:22",
        url: "https://www.youtube.com/watch?v=ekj5T9aBv6Y",
        platform: "YouTube"
      },
      {
        id: "creator_time_value_of_tennis_video_04",
        title: "How To Hit The PERFECT RETURN!",
        target: "接发总被发球压住",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://i.ytimg.com/vi/SoHBjFOK5I0/mqdefault.jpg",
    viewCount: 4651,
        duration: "8:43",
        url: "https://www.youtube.com/watch?v=SoHBjFOK5I0",
        platform: "YouTube"
      },
      {
        id: "creator_time_value_of_tennis_video_05",
        title: "This will TRANSFORM YOUR SERVE and add up to 20 MPH to it! Serve technique lesson",
        target: "发球总缺少球速和顺畅度",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://i.ytimg.com/vi/ue0M7ki9G1w/mqdefault.jpg",
    viewCount: 1602207,
        duration: "6:26",
        url: "https://www.youtube.com/watch?v=ue0M7ki9G1w",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@timevalueoftennis2866",
    platformLinks: {
      YouTube: "https://www.youtube.com/@timevalueoftennis2866"
    },
    avatar: youtubeAvatar("@timevalueoftennis2866"),
    rankingSignals: {
      subscriberScore: 0.62,
      averageViewsScore: 0.64,
      activityScore: 0.58,
      catalogScore: 0.7,
      authorityScore: 0.7,
      curatorBoost: 0.68
    },
    environment: ["testing", "production"],
    nameZh: "网球时间价值",
    shortDescriptionEn: "Technical detail paired with match IQ",
    bioEn: "Balances fine-grained technique with tactical understanding, useful for players who want both cleaner strokes and smarter play.",
    suitableForEn: ["Technique + tactics","Advanced detail","Match understanding"]
  },
  {
    id: "creator_the_tennis_mentor",
    name: "The Tennis Mentor",
    shortDescription: "基础动作和训练逻辑讲得扎实",
    tags: ["基础筑形", "讲解透彻", "入门友好"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["serve", "forehand", "backhand", "basics", "training"],
    styleTags: ["讲解透彻", "系统化", "入门友好"],
    bio: "偏基础动作和训练逻辑，适合想用更清楚的方法建立正反手、发球和训练节奏的球员。",
    suitableFor: ["基础动作", "训练节奏", "发球入门"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_the_tennis_mentor_video_01",
        title: "5 BIGGEST Forehand Mistakes (& How To Fix Them)",
        target: "正手动作总有明显漏洞",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://i.ytimg.com/vi/0MeYx4hXm0Y/mqdefault.jpg",
    viewCount: 42117,
        duration: "10:37",
        url: "https://www.youtube.com/watch?v=0MeYx4hXm0Y",
        platform: "YouTube"
      },
      {
        id: "creator_the_tennis_mentor_video_02",
        title: "Andy Murray Has 3 Return Tips For You",
        target: "接发总是来不及准备",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://i.ytimg.com/vi/fxQ6XFAn2gs/mqdefault.jpg",
    viewCount: 355170,
        duration: "1:23",
        url: "https://www.youtube.com/watch?v=fxQ6XFAn2gs",
        platform: "YouTube"
      },
      {
        id: "creator_the_tennis_mentor_video_03",
        title: "How To MISS LESS Tennis Balls",
        target: "稳定性总是很难维持",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://i.ytimg.com/vi/Gg4olIlr864/mqdefault.jpg",
    viewCount: 26570,
        duration: "0:52",
        url: "https://www.youtube.com/watch?v=Gg4olIlr864",
        platform: "YouTube"
      },
      {
        id: "creator_the_tennis_mentor_video_04",
        title: "Open Stance Backhand Lesson",
        target: "反手站位和启动总不顺",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://i.ytimg.com/vi/jvkfG7z5scE/mqdefault.jpg",
    viewCount: 11819,
        duration: "1:06",
        url: "https://www.youtube.com/watch?v=jvkfG7z5scE",
        platform: "YouTube"
      },
      {
        id: "creator_the_tennis_mentor_video_05",
        title: "The 5 Footwork Fundamentals Every Tennis Player Needs",
        target: "脚步启动总慢半拍",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://i.ytimg.com/vi/UjRv-SbO6K8/mqdefault.jpg",
    viewCount: 40049,
        duration: "14:06",
        url: "https://www.youtube.com/watch?v=UjRv-SbO6K8",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@TheTennisMentor/videos",
    platformLinks: {
      YouTube: "https://www.youtube.com/@TheTennisMentor/videos"
    },
    avatar: youtubeAvatar("@TheTennisMentor"),
    rankingSignals: {
      subscriberScore: 0.6,
      averageViewsScore: 0.62,
      activityScore: 0.72,
      catalogScore: 0.74,
      authorityScore: 0.66,
      curatorBoost: 0.7
    },
    environment: ["testing", "production"],
    nameZh: "网球导师",
    shortDescriptionEn: "Solid fundamentals and training logic",
    bioEn: "Clear, well-structured lessons on basic mechanics and practice organization for recreational players.",
    suitableForEn: ["Fundamentals","Practice structure","Training logic"]
  }
,
  {
    id: "creator_2minute_tennis",
    name: "2MinuteTennis",
    shortDescription: "短平快讲清实战细节",
    tags: ["讲解透彻", "实战拆解", "正手专修"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["forehand", "serve", "matchplay", "net", "topspin"],
    styleTags: ["短平快", "动作拆解", "实战拆解"],
    bio: "偏短平快教学和实战纠错，适合想快速修正常见动作问题并提升单打执行的球员。",
    suitableFor: ["正手发力", "单打策略", "网前处理"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_2minute_tennis_video_01",
        title: "This Boring Tip Gives You TONS of Forehand Power",
        target: "正手发力总提不上来",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/7-N5BjFDb74/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=7-N5BjFDb74",
        platform: "YouTube"
      },
      {
        id: "creator_2minute_tennis_video_02",
        title: "99% of Tennis Players Refuse To Do This",
        target: "基础动作总练不到点上",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/4vckXuoN3Vs/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=4vckXuoN3Vs",
        platform: "YouTube"
      },
      {
        id: "creator_2minute_tennis_video_03",
        title: "Singles Strategies That Easily Help You Win",
        target: "单打思路总不够清楚",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/KvfUhGc2D9c/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=KvfUhGc2D9c",
        platform: "YouTube"
      },
      {
        id: "creator_2minute_tennis_video_04",
        title: "Only 10% of Players Use This Secret Forehand Technique",
        target: "正手细节总差一点感觉",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/dLRs1kly8tg/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=dLRs1kly8tg",
        platform: "YouTube"
      },
      {
        id: "creator_2minute_tennis_video_05",
        title: "The 6 Forehand Fundamentals That Change Everything",
        target: "正手基础总是搭不稳",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/o8oVYHYxmDY/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=o8oVYHYxmDY",
        platform: "YouTube"
      },
      {
        id: "creator_2minute_tennis_video_06",
        title: "The Low Volley Mistake Every Singles Player Makes",
        target: "低位截击总处理不好",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/xDobUsDaaUg/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=xDobUsDaaUg",
        platform: "YouTube"
      },
      {
        id: "creator_2minute_tennis_video_07",
        title: "Subscriber Serve vs Federer's Technique | What's Different?",
        target: "发球动作总不够顺",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/Ir2NMQP7HlA/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=Ir2NMQP7HlA",
        platform: "YouTube"
      },
      {
        id: "creator_2minute_tennis_video_08",
        title: "Your Topspin Is About To Get So Much Better",
        target: "上旋总拉不起来",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/nwdCoNHpmn8/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=nwdCoNHpmn8",
        platform: "YouTube"
      },
      {
        id: "creator_2minute_tennis_video_09",
        title: "80% of Players Screw THIS UP About The Pinpoint Stance",
        target: "发球站位总不稳定",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/CcydVlPSUWI/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=CcydVlPSUWI",
        platform: "YouTube"
      },
      {
        id: "creator_2minute_tennis_video_10",
        title: "Do THIS When Your Opponent Hits a Drop Shot",
        target: "遇到小球总反应偏慢",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/ZivIaErJArg/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=ZivIaErJArg",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@2MinuteTennis",
    platformLinks: {
      YouTube: "https://www.youtube.com/@2MinuteTennis"
    },
    avatar: youtubeAvatar("UCQVakLjtBUGlQOThqRZ7uhw"),
    rankingSignals: {
      subscriberScore: 0.74,
      averageViewsScore: 0.76,
      activityScore: 0.73,
      catalogScore: 0.72,
      authorityScore: 0.7,
      curatorBoost: 0.74
    },
    environment: ["testing", "production"],
    nameZh: "两分钟网球",
    shortDescriptionEn: "Quick, precise tips on match-play details",
    bioEn: "Short, high-density videos that zero in on specific technique points and match situations.",
    suitableForEn: ["Quick tips","Match-play details","Forehand fixes"]
  },
  {
    id: "creator_feel_tennis_instruction",
    name: "Feel Tennis Instruction",
    shortDescription: "细节拆解扎实，讲得很透",
    tags: ["细节纠偏", "讲解透彻", "进阶突破"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["forehand", "serve", "topspin", "basics", "return"],
    styleTags: ["细节纠偏", "动作原理", "系统化"],
    bio: "偏动作原理和击球感觉拆解，适合想把发力、上旋和提前击球真正弄懂的球员。",
    suitableFor: ["上旋理解", "发力原理", "提前击球"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_feel_tennis_instruction_video_01",
        title: "How to Hit Smoother Tennis Strokes (And Unlock Easy Power)",
        target: "动作总是发不上力",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/o7WQrfk318s/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=o7WQrfk318s",
        platform: "YouTube"
      },
      {
        id: "creator_feel_tennis_instruction_video_02",
        title: "Why Topspin Pro Can Teach the Wrong Swing Path",
        target: "挥拍路径总找不准",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/BJKo7LgVhys/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=BJKo7LgVhys",
        platform: "YouTube"
      },
      {
        id: "creator_feel_tennis_instruction_video_03",
        title: "Why Do My Tennis Shots Go Long? (And How to Fix It for Good)",
        target: "球总容易打飞出界",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/I9h_rZKaIzQ/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=I9h_rZKaIzQ",
        platform: "YouTube"
      },
      {
        id: "creator_feel_tennis_instruction_video_04",
        title: "The Biggest Topspin Pro Mistake",
        target: "上旋练法总容易跑偏",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/pONexB78lK4/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=pONexB78lK4",
        platform: "YouTube"
      },
      {
        id: "creator_feel_tennis_instruction_video_05",
        title: "Tennis Coiling and Uncoiling Explained | The Corkscrew Principle",
        target: "转体和发力总脱节",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/CilZcMuZXZ0/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=CilZcMuZXZ0",
        platform: "YouTube"
      },
      {
        id: "creator_feel_tennis_instruction_video_06",
        title: "How to Serve With the Sun in Your Face",
        target: "发球受环境影响太大",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/jy5Z4tm4OZY/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=jy5Z4tm4OZY",
        platform: "YouTube"
      },
      {
        id: "creator_feel_tennis_instruction_video_07",
        title: "Why Taking the Ball Early in Tennis Is So Difficult",
        target: "提前击球总做不到",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/bWHoOGcYph0/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=bWHoOGcYph0",
        platform: "YouTube"
      },
      {
        id: "creator_feel_tennis_instruction_video_08",
        title: "Open Stance Forehand for Adult Tennis Players",
        target: "开放式正手总不顺",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/7CwbFPR7OvA/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=7CwbFPR7OvA",
        platform: "YouTube"
      },
      {
        id: "creator_feel_tennis_instruction_video_09",
        title: "Topspin in Tennis Works — If You Can Hit the Sweet Spot",
        target: "甜点击球总抓不准",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/-1VnQj6SmSw/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=-1VnQj6SmSw",
        platform: "YouTube"
      },
      {
        id: "creator_feel_tennis_instruction_video_10",
        title: "Why There Is No Free Power in Tennis",
        target: "总想轻松发力却越打越乱",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/bZFw2UpybNc/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=bZFw2UpybNc",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@feeltennis",
    platformLinks: {
      YouTube: "https://www.youtube.com/@feeltennis"
    },
    avatar: youtubeAvatar("UCTK9oKMGU0XIQpLJYDs45fw"),
    rankingSignals: {
      subscriberScore: 0.68,
      averageViewsScore: 0.72,
      activityScore: 0.67,
      catalogScore: 0.7,
      authorityScore: 0.72,
      curatorBoost: 0.73
    },
    environment: ["testing", "production"],
    nameZh: "感觉网球",
    shortDescriptionEn: "Deep, thorough technique breakdowns",
    bioEn: "Detailed stroke analysis that goes beyond the surface, useful for players who want to truly understand why a technique works.",
    suitableForEn: ["Deep technique","Stroke analysis","Advanced detail"]
  },
  {
    id: "creator_total_tennis_domination",
    name: "Total Tennis Domination",
    shortDescription: "发力和实战连接讲得很强",
    tags: ["细节纠偏", "进阶突破", "实战拆解"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["forehand", "backhand", "serve", "net", "matchplay"],
    styleTags: ["发力原理", "实战拆解", "进阶突破"],
    bio: "偏发力链条、击球质量和实战执行，适合想把旋转、力量和落点真正串起来的球员。",
    suitableFor: ["发力链条", "网前处理", "比赛执行"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_total_tennis_domination_video_01",
        title: "Start Using Rotation Instead...(drills included)",
        target: "击球发力总靠手臂",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/XMh1ZOaq4mc/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=XMh1ZOaq4mc",
        platform: "YouTube"
      },
      {
        id: "creator_total_tennis_domination_video_02",
        title: "You’ll Keep Losing… Even With “Perfect” Technique",
        target: "动作不错但比赛总输",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/HRU1F0kIeOo/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=HRU1F0kIeOo",
        platform: "YouTube"
      },
      {
        id: "creator_total_tennis_domination_video_03",
        title: "How to Freeze Your Opponent Without Hitting Harder...",
        target: "不发力时总压不住对手",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/Y6bPX0u9Ylo/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=Y6bPX0u9Ylo",
        platform: "YouTube"
      },
      {
        id: "creator_total_tennis_domination_video_04",
        title: "Tennis Forehand and Backhand Power Starts HERE(It’s NOT Your Arm)..",
        target: "正反手力量总出不来",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/wEVP73YFOdM/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=wEVP73YFOdM",
        platform: "YouTube"
      },
      {
        id: "creator_total_tennis_domination_video_05",
        title: "How The Best Tennis Pro Create Forehand Racquet Whip…(drills included)",
        target: "正手鞭打感总打不出",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/LVJ94ZfGU3I/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=LVJ94ZfGU3I",
        platform: "YouTube"
      },
      {
        id: "creator_total_tennis_domination_video_06",
        title: "The One Moment That Decides Every Volley",
        target: "截击时机总抓不准",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/L0RPjWB5h_E/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=L0RPjWB5h_E",
        platform: "YouTube"
      },
      {
        id: "creator_total_tennis_domination_video_07",
        title: "Stop \"Steering\" The Ball! (Do THIS For Elite Accuracy)",
        target: "击球总容易发飘",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/_7Vr-cCdyCs/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=_7Vr-cCdyCs",
        platform: "YouTube"
      },
      {
        id: "creator_total_tennis_domination_video_08",
        title: "Why Swinging Harder Is Killing Your Forehand Power (Drills included...)",
        target: "越发力正手越散",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/MUyD8xSXpjw/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=MUyD8xSXpjw",
        platform: "YouTube"
      },
      {
        id: "creator_total_tennis_domination_video_09",
        title: "This One Hidden Move can Unlock up to 40% More Serve Power...",
        target: "发球总差那一点爆发",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/7Bis27k-8Ss/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=7Bis27k-8Ss",
        platform: "YouTube"
      },
      {
        id: "creator_total_tennis_domination_video_10",
        title: "Stop Using Your Arm To Serve! (Do THIS For Easy Power)",
        target: "发球总是手臂主导",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/B9SY86GLBSQ/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=B9SY86GLBSQ",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/c/totaltennisdomination",
    platformLinks: {
      YouTube: "https://www.youtube.com/c/totaltennisdomination"
    },
    avatar: youtubeAvatar("UCTO3dlkLx9CrLNFgMpOqpAA"),
    rankingSignals: {
      subscriberScore: 0.6,
      averageViewsScore: 0.63,
      activityScore: 0.7,
      catalogScore: 0.68,
      authorityScore: 0.69,
      curatorBoost: 0.72
    },
    environment: ["testing", "production"],
    nameZh: "全面制胜网球",
    shortDescriptionEn: "Power generation and match connections",
    bioEn: "Focused on how to generate power efficiently and connect technique to real match situations.",
    suitableForEn: ["Power generation","Match application","Advanced technique"]
  },
  {
    id: "creator_fuzzy_yellow_balls",
    name: "Fuzzy Yellow Balls",
    shortDescription: "比赛拆解清楚，策略含金量高",
    tags: ["战术拆局", "实战拆解", "进阶突破"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["matchplay", "serve", "doubles", "forehand", "return"],
    styleTags: ["比赛拆解", "策略导向", "讲解透彻"],
    bio: "偏比赛模式拆解和关键分处理，适合想看高水平思路如何落到实战执行里的球员。",
    suitableFor: ["比赛思路", "关键分处理", "双打策略"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_fuzzy_yellow_balls_video_01",
        title: "This point is a perfect example of how Federer broke Nadal's game",
        target: "高水平破局思路看不懂",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/yhQhNvWY0Io/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=yhQhNvWY0Io",
        platform: "YouTube"
      },
      {
        id: "creator_fuzzy_yellow_balls_video_02",
        title: "The weirdest Federer vs Nadal rally you missed",
        target: "拉锯战里总抓不到关键",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/EQ3xE_xNKxA/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=EQ3xE_xNKxA",
        platform: "YouTube"
      },
      {
        id: "creator_fuzzy_yellow_balls_video_03",
        title: "After Federer did this, Nadal never beat him again",
        target: "比赛调整总慢半拍",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/M7lZ4lC6Amo/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=M7lZ4lC6Amo",
        platform: "YouTube"
      },
      {
        id: "creator_fuzzy_yellow_balls_video_04",
        title: "If you can pick up the 3rd ball, you can serve 100 mph",
        target: "发球后三拍总接不上",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/cB72-9r4P7I/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=cB72-9r4P7I",
        platform: "YouTube"
      },
      {
        id: "creator_fuzzy_yellow_balls_video_05",
        title: "This point is a perfect example of how Federer broke Nadal's game",
        target: "如何用战术拆解强点",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/6knSeTr9Hv4/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=6knSeTr9Hv4",
        platform: "YouTube"
      },
      {
        id: "creator_fuzzy_yellow_balls_video_06",
        title: "Are you losing to doubles teams you should beat?",
        target: "双打配合总打不顺",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/Rbi2lBDh_Zg/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=Rbi2lBDh_Zg",
        platform: "YouTube"
      },
      {
        id: "creator_fuzzy_yellow_balls_video_07",
        title: "This point is a perfect example of how Djokovic broke Federer's game",
        target: "看不清高手怎么抢节奏",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/C6-1wrRKvjU/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=C6-1wrRKvjU",
        platform: "YouTube"
      },
      {
        id: "creator_fuzzy_yellow_balls_video_08",
        title: "Did this play make Djokovic the GOAT? 🐐",
        target: "关键分选择总犹豫",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/Fs2Y371h3VU/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=Fs2Y371h3VU",
        platform: "YouTube"
      },
      {
        id: "creator_fuzzy_yellow_balls_video_09",
        title: "Medvedev beat Alcaraz with a shot pros almost never hit",
        target: "防守反击总少变化",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/6rX4i5d5ux0/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=6rX4i5d5ux0",
        platform: "YouTube"
      },
      {
        id: "creator_fuzzy_yellow_balls_video_10",
        title: "How Federer won points against PRIME Novak Djokovic",
        target: "强强对抗的落点思路不清",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/6GbVb659Q0o/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=6GbVb659Q0o",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/fuzzyyellowballs",
    platformLinks: {
      YouTube: "https://www.youtube.com/fuzzyyellowballs"
    },
    avatar: youtubeAvatar("UCXQ-a9jN5DkWtSYKjVXqsew"),
    rankingSignals: {
      subscriberScore: 0.86,
      averageViewsScore: 0.88,
      activityScore: 0.62,
      catalogScore: 0.74,
      authorityScore: 0.92,
      curatorBoost: 0.78
    },
    environment: ["testing", "production"],
    nameZh: "毛绒黄球",
    shortDescriptionEn: "Sharp match breakdowns with tactical depth",
    bioEn: "Pro match analysis with clear explanations of tactics, patterns, and decision-making at the highest level.",
    suitableForEn: ["Match analysis","Tactical patterns","Strategy insights"]
  },
  {
    id: "creator_daily_tennis_lesson",
    name: "Daily Tennis Lesson",
    shortDescription: "分主题教学，基础动作很系统",
    tags: ["网前专修", "基础筑形", "入门友好"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["net", "serve", "return", "basics", "training"],
    styleTags: ["分主题教学", "基础筑形", "讲解透彻"],
    bio: "偏单项技术拆分练习，适合想把高压、截击、接发等具体环节逐项补强的球员。",
    suitableFor: ["高压球", "网前处理", "接发基础"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_daily_tennis_lesson_video_01",
        title: "Expectation vs Reality",
        target: "练球预期总和实际差太多",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/Hi8nBXg7N-A/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=Hi8nBXg7N-A",
        platform: "YouTube"
      },
      {
        id: "creator_daily_tennis_lesson_video_02",
        title: "Top 3 Overhead Mistakes | OVERHEAD",
        target: "高压球总处理不好",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/K_EexG6l7E8/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=K_EexG6l7E8",
        platform: "YouTube"
      },
      {
        id: "creator_daily_tennis_lesson_video_03",
        title: "Bounce vs Out Of The Air | OVERHEAD",
        target: "高压该等落地还是截击总拿不准",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/ikEqU3049nE/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=ikEqU3049nE",
        platform: "YouTube"
      },
      {
        id: "creator_daily_tennis_lesson_video_04",
        title: "Overhead Technique | OVERHEAD",
        target: "高压动作总不连贯",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/ssDipBYDZFo/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=ssDipBYDZFo",
        platform: "YouTube"
      },
      {
        id: "creator_daily_tennis_lesson_video_05",
        title: "Overhead Positioning | OVERHEAD",
        target: "高压站位总走不对",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/p5hX_oLsGDg/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=p5hX_oLsGDg",
        platform: "YouTube"
      },
      {
        id: "creator_daily_tennis_lesson_video_06",
        title: "Overhead Prep | OVERHEAD",
        target: "高压准备总偏慢",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/iSXlWbkgFXM/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=iSXlWbkgFXM",
        platform: "YouTube"
      },
      {
        id: "creator_daily_tennis_lesson_video_07",
        title: "Swing Volley | PUNISH SLOW BALLS",
        target: "慢球进攻总抓不住",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/tfop5rWlHNo/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=tfop5rWlHNo",
        platform: "YouTube"
      },
      {
        id: "creator_daily_tennis_lesson_video_08",
        title: "Drop Shot | PUNISH SLOW BALLS",
        target: "放小球总没有质量",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/0OAOFp0YN-M/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=0OAOFp0YN-M",
        platform: "YouTube"
      },
      {
        id: "creator_daily_tennis_lesson_video_09",
        title: "Volley | PUNISH SLOW BALLS",
        target: "截击总是做得太大",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/axmqay5GN8o/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=axmqay5GN8o",
        platform: "YouTube"
      },
      {
        id: "creator_daily_tennis_lesson_video_10",
        title: "Serve Return | PUNISH SLOW BALLS",
        target: "接发球总抢不到主动",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/hv6R6frWmb4/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=hv6R6frWmb4",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/c/DailyTennisLesson",
    platformLinks: {
      YouTube: "https://www.youtube.com/c/DailyTennisLesson"
    },
    avatar: youtubeAvatar("UCOau_eZu2kaRoqjR4xcA-Hg"),
    rankingSignals: {
      subscriberScore: 0.55,
      averageViewsScore: 0.58,
      activityScore: 0.61,
      catalogScore: 0.66,
      authorityScore: 0.62,
      curatorBoost: 0.66
    },
    environment: ["testing", "production"],
    nameZh: "每日网球课",
    shortDescriptionEn: "Systematic basics organized by topic",
    bioEn: "Well-organized lessons covering fundamental strokes topic by topic, good for building a solid base.",
    suitableForEn: ["Organized basics","Topic-based learning","Beginner-friendly"]
  },
  {
    id: "creator_tennis_hacker",
    name: "Tennis Hacker",
    shortDescription: "成人球友视角，纠错很直接",
    tags: ["入门友好", "讲解透彻", "细节纠偏"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["forehand", "backhand", "net", "training", "matchplay"],
    styleTags: ["成人球友", "纠错直接", "讲解透彻"],
    bio: "偏成人球友常见问题纠正，适合想在较短时间里把正手、反手、截击和练习习惯理顺的球员。",
    suitableFor: ["成人自学", "反手纠错", "练习方法"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_tennis_hacker_video_01",
        title: "The fastest way to improve volley consistency!",
        target: "截击稳定性总上不来",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/XXXNM70iQkU/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=XXXNM70iQkU",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_hacker_video_02",
        title: "Develop a rock solid forehand after 40!",
        target: "成年人正手总不够稳",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/XDcu37q9TuY/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=XDcu37q9TuY",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_hacker_video_03",
        title: "Make your forehand better this week!",
        target: "正手想尽快有提升",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/cS7TLFK_xjI/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=cS7TLFK_xjI",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_hacker_video_04",
        title: "These 4 practice mistakes are killing your progress!",
        target: "练了很多却没进步",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/18tPSkQnQ4Y/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=18tPSkQnQ4Y",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_hacker_video_05",
        title: "How to meet the ball out in front every time!",
        target: "击球点总卡在身后",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/BtKsuVbBmV8/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=BtKsuVbBmV8",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_hacker_video_06",
        title: "You'll never have a RELAXED one handed backhand until you fix this!",
        target: "单反总打得太紧",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/vKaa3Gsuq5E/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=vKaa3Gsuq5E",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_hacker_video_07",
        title: "How to hit through the ball on your forehand!",
        target: "正手总吃不透球",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/16EUwOPq8tE/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=16EUwOPq8tE",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_hacker_video_08",
        title: "Start winning more matches today!",
        target: "比赛总差最后一步",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/zGrqSbliB1s/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=zGrqSbliB1s",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_hacker_video_09",
        title: "Fix your ball tracking to fix your error count!",
        target: "盯球总不够清楚",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/gGLbTyw0NDo/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=gGLbTyw0NDo",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_hacker_video_10",
        title: "The skill is the secret to rapid tennis improvement!",
        target: "想更快建立进步节奏",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/5QGQUF08CpI/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=5QGQUF08CpI",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/c/TennisHacker",
    platformLinks: {
      YouTube: "https://www.youtube.com/c/TennisHacker"
    },
    avatar: youtubeAvatar("UCSiizATUv3qKHRS6UG2C2tQ"),
    rankingSignals: {
      subscriberScore: 0.58,
      averageViewsScore: 0.61,
      activityScore: 0.72,
      catalogScore: 0.68,
      authorityScore: 0.66,
      curatorBoost: 0.69
    },
    environment: ["testing", "production"],
    nameZh: "网球黑客",
    shortDescriptionEn: "Adult player perspective with direct fixes",
    bioEn: "A recreational player's coaching perspective with practical, no-nonsense corrections.",
    suitableForEn: ["Adult learners","Direct corrections","Practical fixes"]
  },
  {
    id: "creator_meike_babel_tennis",
    name: "Meike Babel Tennis",
    shortDescription: "比赛模式拆解细，双打也强",
    tags: ["战术拆局", "进阶突破", "讲解透彻"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["matchplay", "doubles", "serve", "forehand", "return"],
    styleTags: ["模式拆解", "比赛导向", "双打意识"],
    bio: "偏比赛模式、左手球员应对和双打/接发细节，适合想把策略和动作选择结合起来的球员。",
    suitableFor: ["左手对策", "双打上网", "接发站位"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_meike_babel_tennis_video_01",
        title: "Break left-handed #tennisplayer preferred pattern with these plays",
        target: "打左手球员总不适应",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/6K2rS5UKutM/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=6K2rS5UKutM",
        platform: "YouTube"
      },
      {
        id: "creator_meike_babel_tennis_video_02",
        title: "SIMPLE pattern to serve when playing against a left-handed #tennisplayer",
        target: "对左手发球线路总读不清",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/P0kF2r9MydM/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=P0kF2r9MydM",
        platform: "YouTube"
      },
      {
        id: "creator_meike_babel_tennis_video_03",
        title: "Change your return position #tennisreturn",
        target: "接发站位总找不准",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/sIN3ZYEkzSE/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=sIN3ZYEkzSE",
        platform: "YouTube"
      },
      {
        id: "creator_meike_babel_tennis_video_04",
        title: "How to Beat Left-Handed Tennis Players (Simple Winning Patterns)",
        target: "遇到左手球员总吃亏",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/btj7A_8No7Y/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=btj7A_8No7Y",
        platform: "YouTube"
      },
      {
        id: "creator_meike_babel_tennis_video_05",
        title: "Madison Keys' #tennisserve",
        target: "发球发力节奏总不顺",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/6gtADCKZEJg/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=6gtADCKZEJg",
        platform: "YouTube"
      },
      {
        id: "creator_meike_babel_tennis_video_06",
        title: "Work on your first two \"touches\" with this #tennisdrill",
        target: "前两拍总接不上",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/ITAZy6nYUlw/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=ITAZy6nYUlw",
        platform: "YouTube"
      },
      {
        id: "creator_meike_babel_tennis_video_07",
        title: "When to close to net #tennis #tennisdoubles",
        target: "双打上网时机总偏晚",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/TeqnptfIGcw/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=TeqnptfIGcw",
        platform: "YouTube"
      },
      {
        id: "creator_meike_babel_tennis_video_08",
        title: "How to prevent errors #tennis",
        target: "非受迫失误总太多",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/4MQwOsbxrv0/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=4MQwOsbxrv0",
        platform: "YouTube"
      },
      {
        id: "creator_meike_babel_tennis_video_09",
        title: "C-shaped motion on #tennisforehand",
        target: "正手轨迹总不顺",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/9QHERqM1lzM/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=9QHERqM1lzM",
        platform: "YouTube"
      },
      {
        id: "creator_meike_babel_tennis_video_10",
        title: "How Alex Eala fixes mistakes IMMEDIATELY!",
        target: "比赛中临场调整总太慢",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/2Qs_p-spxXs/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=2Qs_p-spxXs",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/channel/UCOGFaeAM9YZya2GUgtT10qQ",
    platformLinks: {
      YouTube: "https://www.youtube.com/channel/UCOGFaeAM9YZya2GUgtT10qQ"
    },
    avatar: youtubeAvatar("UCOGFaeAM9YZya2GUgtT10qQ"),
    rankingSignals: {
      subscriberScore: 0.52,
      averageViewsScore: 0.6,
      activityScore: 0.69,
      catalogScore: 0.63,
      authorityScore: 0.7,
      curatorBoost: 0.68
    },
    environment: ["testing", "production"],
    nameZh: "迈克·巴贝尔网球",
    shortDescriptionEn: "Match patterns and doubles strategy",
    bioEn: "Detailed match-pattern breakdowns and doubles tactics from a coaching perspective.",
    suitableForEn: ["Match patterns","Doubles strategy","Advanced play"]
  }
,
  {
    id: "creator_racquetflex",
    name: "RacquetFlex",
    shortDescription: "发球和击球原理拆得很细",
    tags: ["发球专修", "细节纠偏", "讲解透彻"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["serve", "forehand", "matchplay", "net", "topspin"],
    styleTags: ["动作原理", "讲解透彻", "实战拆解"],
    bio: "偏发球、击球触点和比赛里真正能用上的技术细节，适合想把发球和进攻衔接练扎实的球员。",
    suitableFor: ["发球提速", "双误控制", "上网压迫"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_racquetflex_video_01",
        title: "How To Find The Perfect Forehand Contact In 5 Simple Steps",
        target: "正手击球点总找不准",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/xs6P8YKMlCA/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=xs6P8YKMlCA",
        platform: "YouTube"
      },
      {
        id: "creator_racquetflex_video_02",
        title: "Why Swinging HARDER Makes Your Serve SLOWER (Real Case Studies)",
        target: "发球越抡越没速度",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/ebZRRsB1XWI/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=ebZRRsB1XWI",
        platform: "YouTube"
      },
      {
        id: "creator_racquetflex_video_03",
        title: "The Perfect Kick Serve Wrist Action in 3 Steps (Science Explained)",
        target: "Kick发球腕部动作不对",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/Rn4IOsBXFv8/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=Rn4IOsBXFv8",
        platform: "YouTube"
      },
      {
        id: "creator_racquetflex_video_04",
        title: "The Fastest Way To Stop Double-Faulting (Even Under Pressure)",
        target: "双误总是压不住",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/jy4PgM0TY34/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=jy4PgM0TY34",
        platform: "YouTube"
      },
      {
        id: "creator_racquetflex_video_05",
        title: "The Perfect Kick Serve Contact (STOP ACCIDENTAL SLICE)",
        target: "Kick发球总变成侧旋",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/g1ADa7Etpa0/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=g1ADa7Etpa0",
        platform: "YouTube"
      },
      {
        id: "creator_racquetflex_video_06",
        title: "Your elbow position is killing your serve power 😳",
        target: "发球肘位总跑偏",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/Sh9sK0k6l9Y/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=Sh9sK0k6l9Y",
        platform: "YouTube"
      },
      {
        id: "creator_racquetflex_video_07",
        title: "Nadal's Deadly Serve + Forehand Combo",
        target: "发球加正手衔接总断",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/dfSq_NTwr-E/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=dfSq_NTwr-E",
        platform: "YouTube"
      },
      {
        id: "creator_racquetflex_video_08",
        title: "Attacking the Net Makes Tennis So Much Easier",
        target: "上网压迫总不坚决",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/bkeCxUehlsI/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=bkeCxUehlsI",
        platform: "YouTube"
      },
      {
        id: "creator_racquetflex_video_09",
        title: "Never Aim Your Serve Here on Deuce",
        target: "Deuce区发球落点总选错",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/TEOT6AxCkgE/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=TEOT6AxCkgE",
        platform: "YouTube"
      },
      {
        id: "creator_racquetflex_video_10",
        title: "How to Improve Your Serve Confidence in Matches",
        target: "比赛里发球总没信心",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/_rrU0R-IjW0/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=_rrU0R-IjW0",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/racquetflex",
    platformLinks: {
      YouTube: "https://www.youtube.com/racquetflex"
    },
    avatar: youtubeAvatar("UCtzuS4wcMk7vl9q-vgnTu4g"),
    rankingSignals: {
      subscriberScore: 0.62,
      averageViewsScore: 0.66,
      activityScore: 0.74,
      catalogScore: 0.69,
      authorityScore: 0.69,
      curatorBoost: 0.72
    },
    environment: ["testing", "production"],
    nameZh: "球拍力学",
    shortDescriptionEn: "Serve and stroke mechanics explained in depth",
    bioEn: "Physics-informed breakdowns of serve mechanics and hitting principles.",
    suitableForEn: ["Serve mechanics","Stroke physics","Detailed analysis"]
  },
  {
    id: "creator_tpa_tennis",
    name: "TPA tennis",
    shortDescription: "现代正手和发球讲得很实用",
    tags: ["正手专修", "进阶突破", "讲解透彻"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["forehand", "serve", "footwork", "matchplay", "topspin"],
    styleTags: ["现代技术", "动作拆解", "进阶突破"],
    bio: "偏现代正手、发球和击球间距处理，适合想把正手发力和来球空间感练顺的球员。",
    suitableFor: ["现代正手", "来球间距", "发球提速"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_tpa_tennis_video_01",
        title: "How to Get a Deeper Racket Drop for a Powerful Serve",
        target: "发球拍头下垂不够",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/aw55_LTiMRM/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=aw55_LTiMRM",
        platform: "YouTube"
      },
      {
        id: "creator_tpa_tennis_video_02",
        title: "How to Set Up for a Short Ball",
        target: "短球上步总慢",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/1OHgNk_Lg8A/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=1OHgNk_Lg8A",
        platform: "YouTube"
      },
      {
        id: "creator_tpa_tennis_video_03",
        title: "Master Spin, Win More Matches",
        target: "上旋质量总不够",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/JvBZqVgTTrw/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=JvBZqVgTTrw",
        platform: "YouTube"
      },
      {
        id: "creator_tpa_tennis_video_04",
        title: "The Forehand Technique Nobody Teaches",
        target: "现代正手动作总别扭",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/ral2cHTFcdY/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=ral2cHTFcdY",
        platform: "YouTube"
      },
      {
        id: "creator_tpa_tennis_video_05",
        title: "The Right Way To Jump Into Your Forehand",
        target: "正手起跳发力总乱",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/IhLcK-ScJ1k/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=IhLcK-ScJ1k",
        platform: "YouTube"
      },
      {
        id: "creator_tpa_tennis_video_06",
        title: "This One Move Instantly Improves Your Forehand",
        target: "正手总打不透",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/1-g1OD8gh-I/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=1-g1OD8gh-I",
        platform: "YouTube"
      },
      {
        id: "creator_tpa_tennis_video_07",
        title: "Getting Jammed? Here’s The Fix #tennis #technique #spacing #tennistips",
        target: "总被来球顶住",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/LwY03Lm9L5g/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=LwY03Lm9L5g",
        platform: "YouTube"
      },
      {
        id: "creator_tpa_tennis_video_08",
        title: "Stop Getting Jammed on Your Groundstrokes",
        target: "底线击球总被挤压",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/r7YqEMWFf5g/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=r7YqEMWFf5g",
        platform: "YouTube"
      },
      {
        id: "creator_tpa_tennis_video_09",
        title: "Great Forehand Technique Demo - Max Purcell",
        target: "想学职业正手细节",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/HHo2ViXTXRA/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=HHo2ViXTXRA",
        platform: "YouTube"
      },
      {
        id: "creator_tpa_tennis_video_10",
        title: "Serve Speed Tips - TPA Video Analysis #serve #tennis #technique",
        target: "发球速度总卡住",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/OKcCniahFXY/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=OKcCniahFXY",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@TomAllsopp",
    platformLinks: {
      YouTube: "https://www.youtube.com/@TomAllsopp"
    },
    avatar: youtubeAvatar("UCxr1cQMWsMhVlqXLJo62OMg"),
    rankingSignals: {
      subscriberScore: 0.57,
      averageViewsScore: 0.62,
      activityScore: 0.78,
      catalogScore: 0.66,
      authorityScore: 0.67,
      curatorBoost: 0.7
    },
    environment: ["testing", "production"],
    nameZh: "TPA网球",
    shortDescriptionEn: "Practical modern forehand and serve lessons",
    bioEn: "Practical instruction on modern forehand technique and serve development.",
    suitableForEn: ["Modern forehand","Serve development","Practical tips"]
  },
  {
    id: "creator_edgar_giffenig_tennis",
    name: "Edgar Giffenig Tennis",
    shortDescription: "战术和基本功拆解很扎实",
    tags: ["战术拆局", "讲解透彻", "基础筑形"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["matchplay", "basics", "serve", "footwork", "consistency"],
    styleTags: ["系统化", "战术拆解", "基础训练"],
    bio: "偏单打战术、基础动作和墙练体系，适合想把训练组织和比赛思路一起搭起来的球员。",
    suitableFor: ["单打战术", "抛球稳定", "墙练方法"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_edgar_giffenig_tennis_video_01",
        title: "Tennis Instruction: Practical Mental Training",
        target: "比赛心态总容易乱",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/v8nKZ2gWgn8/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=v8nKZ2gWgn8",
        platform: "YouTube"
      },
      {
        id: "creator_edgar_giffenig_tennis_video_02",
        title: "Tennis Instruction Singles Tactic  Rally Ideas",
        target: "相持思路总不清楚",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/ZzMmaJdbs6c/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=ZzMmaJdbs6c",
        platform: "YouTube"
      },
      {
        id: "creator_edgar_giffenig_tennis_video_03",
        title: "Tennis Instruction - How to Beat a \"Pusher\"",
        target: "遇到磨球型对手总没办法",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/yOKK0vG2RaA/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=yOKK0vG2RaA",
        platform: "YouTube"
      },
      {
        id: "creator_edgar_giffenig_tennis_video_04",
        title: "Tennis Instruction - Rush your Opponent and Gain Time for Yourself",
        target: "总抢不到主动时间",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/CiPVLm60Vfo/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=CiPVLm60Vfo",
        platform: "YouTube"
      },
      {
        id: "creator_edgar_giffenig_tennis_video_05",
        title: "Tennis Instruction - Singles Tactics - The Passing Shot",
        target: "穿越球总打不好",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/asbIqzJzhxU/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=asbIqzJzhxU",
        platform: "YouTube"
      },
      {
        id: "creator_edgar_giffenig_tennis_video_06",
        title: "Tennis Instruction: Optimize your Technique",
        target: "技术动作总是效率不高",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/h8KmzxdNkfs/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=h8KmzxdNkfs",
        platform: "YouTube"
      },
      {
        id: "creator_edgar_giffenig_tennis_video_07",
        title: "Tennis Drill: Progressive Groundstroke Wall Drills Vol  2 Advanced",
        target: "想系统练高级墙练",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/h3KlEBrN9gs/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=h3KlEBrN9gs",
        platform: "YouTube"
      },
      {
        id: "creator_edgar_giffenig_tennis_video_08",
        title: "Tennis Drills: Progressive Groundstroke Wall Drills Volume 1",
        target: "想用墙练打基础",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/87jYKXuY4jk/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=87jYKXuY4jk",
        platform: "YouTube"
      },
      {
        id: "creator_edgar_giffenig_tennis_video_09",
        title: "Tennis Instruction – Develop a Consistent and Dependable Toss",
        target: "抛球总是不稳定",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/4DN0Hj2yoMk/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=4DN0Hj2yoMk",
        platform: "YouTube"
      },
      {
        id: "creator_edgar_giffenig_tennis_video_10",
        title: "Tennis Instruction:  The Ideal Stances on your Groundstrokes –Open - Closed?",
        target: "击球站位总选不对",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/IOprLbVRArI/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=IOprLbVRArI",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/channel/UCd_QKuxjUqriwJ7dw7KMrAQ",
    platformLinks: {
      YouTube: "https://www.youtube.com/channel/UCd_QKuxjUqriwJ7dw7KMrAQ"
    },
    avatar: youtubeAvatar("UCd_QKuxjUqriwJ7dw7KMrAQ"),
    rankingSignals: {
      subscriberScore: 0.46,
      averageViewsScore: 0.52,
      activityScore: 0.43,
      catalogScore: 0.72,
      authorityScore: 0.7,
      curatorBoost: 0.66
    },
    environment: ["testing", "production"],
    nameZh: "埃德加网球教学",
    shortDescriptionEn: "Tactics and fundamentals explained clearly",
    bioEn: "Coaching-focused content that ties tactics to fundamentals with clear, structured explanations.",
    suitableForEn: ["Tactics","Fundamentals","Structured coaching"]
  },
  {
    id: "creator_patrick_smith_tennis_coaching",
    name: "Patrick Smith Tennis Coaching",
    shortDescription: "双打和时机处理很有干货",
    tags: ["讲解透彻", "网前专修", "战术拆局"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["doubles", "timing", "topspin", "serve", "matchplay"],
    styleTags: ["讲解透彻", "实战拆解", "双打策略"],
    bio: "偏双打站位、时机调整和上旋理解，适合想把比赛里站位和击球选择理顺的球员。",
    suitableFor: ["双打站位", "时机调整", "上旋理解"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_patrick_smith_tennis_coaching_video_01",
        title: "3 Most Important Drills To Actually Improve As A Beginner Tennis Player ",
        target: "练了很多却没真进步",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: "https://img.youtube.com/vi/6HSHMqxcG2Q/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=6HSHMqxcG2Q",
        platform: "YouTube"
      },
      {
        id: "creator_patrick_smith_tennis_coaching_video_02",
        title: "Copy This To Have More Success At The Net In Doubles Tennis ",
        target: "双打网前总不够稳",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/gLigylEFxaA/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=gLigylEFxaA",
        platform: "YouTube"
      },
      {
        id: "creator_patrick_smith_tennis_coaching_video_03",
        title: "Master These Moves To Fix Your Timing In Tennis - Beginner To Pro ",
        target: "击球时机总对不上",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/qxGDHaADrto/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=qxGDHaADrto",
        platform: "YouTube"
      },
      {
        id: "creator_patrick_smith_tennis_coaching_video_04",
        title: "The Simple Doubles Strategy To Always Be In Right Position - The Pros Know This But Do You? ",
        target: "双打站位总站不对",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/227hFGyVUe8/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=227hFGyVUe8",
        platform: "YouTube"
      },
      {
        id: "creator_patrick_smith_tennis_coaching_video_05",
        title: "How Topspin Is Actually Created In Tennis - Low To High Myth? ",
        target: "上旋原理总理解偏了",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/ZcT69D02CfE/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=ZcT69D02CfE",
        platform: "YouTube"
      },
      {
        id: "creator_patrick_smith_tennis_coaching_video_06",
        title: "#1 Solution To Fix Your 'Waiter's Tray' And Hit Bigger Serves",
        target: "托盘式发球总改不掉",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/PhqmeSTE8ME/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=PhqmeSTE8ME",
        platform: "YouTube"
      },
      {
        id: "creator_patrick_smith_tennis_coaching_video_07",
        title: "How The Pros Win Points Without Sacrificing Consistency ",
        target: "想进攻又怕失误太多",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/QRPSRGwwAwM/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=QRPSRGwwAwM",
        platform: "YouTube"
      },
      {
        id: "creator_patrick_smith_tennis_coaching_video_08",
        title: "Secret To More Speed On The Forehand - How To Accelerate The Racket ",
        target: "正手拍头加速总不够",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/uUqSMyaLu-4/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=uUqSMyaLu-4",
        platform: "YouTube"
      },
      {
        id: "creator_patrick_smith_tennis_coaching_video_09",
        title: "How To Hit Perfect Half Volleys (Advanced Tennis Technique) ",
        target: "半截击总处理不好",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/GJxeLhNSRTI/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=GJxeLhNSRTI",
        platform: "YouTube"
      },
      {
        id: "creator_patrick_smith_tennis_coaching_video_10",
        title: "Singles Tennis Strategy And Shot Selection - The Four Zones ",
        target: "单打选球总没章法",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/sYXF77vwRzE/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=sYXF77vwRzE",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/channel/UCQbv0dgYyCb_MzKvEjiIzFQ",
    platformLinks: {
      YouTube: "https://www.youtube.com/channel/UCQbv0dgYyCb_MzKvEjiIzFQ"
    },
    avatar: youtubeAvatar("UCQbv0dgYyCb_MzKvEjiIzFQ"),
    rankingSignals: {
      subscriberScore: 0.58,
      averageViewsScore: 0.63,
      activityScore: 0.73,
      catalogScore: 0.69,
      authorityScore: 0.68,
      curatorBoost: 0.7
    },
    environment: ["testing", "production"],
    nameZh: "帕特里克教练",
    shortDescriptionEn: "Doubles timing and shot selection insights",
    bioEn: "Useful doubles coaching on timing, positioning, and shot selection.",
    suitableForEn: ["Doubles coaching","Timing","Shot selection"]
  },
  {
    id: "creator_one_minute_tennis",
    name: "One Minute Tennis",
    shortDescription: "短视频密度高，技术点很准",
    tags: ["细节纠偏", "讲解透彻", "步法启动"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["forehand", "footwork", "serve", "topspin", "basics"],
    styleTags: ["短平快", "技术细节", "动作感觉"],
    bio: "偏一分钟内讲清一个技术细节，适合想快速修正击球感觉、脚步和发力链条的球员。",
    suitableFor: ["脚步细节", "正手发力", "Kick发球"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_one_minute_tennis_video_01",
        title: "Why You Trust Your Backhand More Than Your Forehand",
        target: "正手总不如反手放心",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/-lgiop01S4w/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=-lgiop01S4w",
        platform: "YouTube"
      },
      {
        id: "creator_one_minute_tennis_video_02",
        title: "Forehand - Topspin and Flat Swing Path",
        target: "正手上旋和平击总分不清",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/V8sq1WpAxfc/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=V8sq1WpAxfc",
        platform: "YouTube"
      },
      {
        id: "creator_one_minute_tennis_video_03",
        title: "The Evolution of the Split Step - Why Pros Use a Double Split",
        target: "分腿垫步节奏总不对",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/IDcMWkMQd9U/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=IDcMWkMQd9U",
        platform: "YouTube"
      },
      {
        id: "creator_one_minute_tennis_video_04",
        title: "FOREHAND KINETIC CHAIN TRICK",
        target: "正手动力链总接不上",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/SmKRBbMQnW4/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=SmKRBbMQnW4",
        platform: "YouTube"
      },
      {
        id: "creator_one_minute_tennis_video_05",
        title: "The Hidden Detail in Tennis: 3 Different Ready Positions",
        target: "准备姿势总太单一",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/ZGtcFncG3YA/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=ZGtcFncG3YA",
        platform: "YouTube"
      },
      {
        id: "creator_one_minute_tennis_video_06",
        title: "How to attack deep balls",
        target: "深球来了总只能被动顶",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/lkRonnp2ZOs/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=lkRonnp2ZOs",
        platform: "YouTube"
      },
      {
        id: "creator_one_minute_tennis_video_07",
        title: "“Fix Your Kick Serve With This Simple Throwing Drill”",
        target: "Kick发球总找不到感觉",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/AyRFWwpJXOA/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=AyRFWwpJXOA",
        platform: "YouTube"
      },
      {
        id: "creator_one_minute_tennis_video_08",
        title: "Burst and Glide",
        target: "启动和制动总衔接不好",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/xgwjutiSS3s/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=xgwjutiSS3s",
        platform: "YouTube"
      },
      {
        id: "creator_one_minute_tennis_video_09",
        title: "Why Pros Have Effortless Power (The Racket Lag Test)",
        target: "想发力却总很费劲",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/VUnQfUcK2hU/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=VUnQfUcK2hU",
        platform: "YouTube"
      },
      {
        id: "creator_one_minute_tennis_video_10",
        title: "Instant Forehand Speed",
        target: "正手球速总起不来",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/WpnCEw8MWFQ/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=WpnCEw8MWFQ",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@OneMinuteTennis",
    platformLinks: {
      YouTube: "https://www.youtube.com/@OneMinuteTennis"
    },
    avatar: youtubeAvatar("UCbmBx0-ZS9V7KSbyhrZcYqw"),
    rankingSignals: {
      subscriberScore: 0.5,
      averageViewsScore: 0.61,
      activityScore: 0.69,
      catalogScore: 0.65,
      authorityScore: 0.64,
      curatorBoost: 0.67
    },
    environment: ["testing", "production"],
    nameZh: "一分钟网球",
    shortDescriptionEn: "Dense short videos on specific technique points",
    bioEn: "Bite-sized videos that each target one specific technique detail or footwork issue.",
    suitableForEn: ["Short format","Specific fixes","Footwork details"]
  },
  {
    id: "creator_your_online_tennis_coach",
    name: "Your Online Tennis Coach",
    shortDescription: "时机、眼睛和截击讲得很透",
    tags: ["网前专修", "细节纠偏", "基础筑形"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["timing", "volley", "basics", "serve", "consistency"],
    styleTags: ["讲解透彻", "动作感觉", "基础训练"],
    bio: "偏时机、视线和截击这些经常被忽略的细节，适合想把基础击球感觉重新校准的球员。",
    suitableFor: ["时机问题", "视线跟球", "截击基础"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_your_online_tennis_coach_video_01",
        title: "Volleys Missing? Here's What's Actually Happening",
        target: "截击总是失误太多",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/hq-1YxRqyQI/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=hq-1YxRqyQI",
        platform: "YouTube"
      },
      {
        id: "creator_your_online_tennis_coach_video_02",
        title: "Your Head Is Ruining Your Tennis Timing",
        target: "击球时机总差半拍",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/ZrhpSf35ttE/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=ZrhpSf35ttE",
        platform: "YouTube"
      },
      {
        id: "creator_your_online_tennis_coach_video_03",
        title: "Mini Tennis Practice That Actually Works #tennis #tutorial",
        target: "小场热身总练不到点",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/XnFRRFdILyU/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=XnFRRFdILyU",
        platform: "YouTube"
      },
      {
        id: "creator_your_online_tennis_coach_video_04",
        title: "How to Become One With the Ball in Tennis",
        target: "总是吃不准来球",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/X2iRyYf2IBU/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=X2iRyYf2IBU",
        platform: "YouTube"
      },
      {
        id: "creator_your_online_tennis_coach_video_05",
        title: "The Volley Technique That Separates Good From Great",
        target: "截击动作总不稳定",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/t1sC3sAguHA/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=t1sC3sAguHA",
        platform: "YouTube"
      },
      {
        id: "creator_your_online_tennis_coach_video_06",
        title: "Turn Your Weakest Stroke Into Your Weapon",
        target: "弱项总是练不成强项",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/Ilw9SK0JIRQ/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=Ilw9SK0JIRQ",
        platform: "YouTube"
      },
      {
        id: "creator_your_online_tennis_coach_video_07",
        title: "Why You're Losing Power on Every Shot (Timing)",
        target: "每拍击球都发不上力",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/PNvw8FpdsKc/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=PNvw8FpdsKc",
        platform: "YouTube"
      },
      {
        id: "creator_your_online_tennis_coach_video_08",
        title: "Where Your Eyes Should Be on Every Single Point",
        target: "眼睛总跟不住球",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/3YnfpMAkMAU/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=3YnfpMAkMAU",
        platform: "YouTube"
      },
      {
        id: "creator_your_online_tennis_coach_video_09",
        title: "Bounce Your Eyes With the Ball to Fix Timing",
        target: "迎球节奏总不稳定",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/qE6rfm1IRZo/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=qE6rfm1IRZo",
        platform: "YouTube"
      },
      {
        id: "creator_your_online_tennis_coach_video_10",
        title: "The Serve Timing Secret Nobody Talks About",
        target: "发球节奏总卡住",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/J6ENsoZCBwU/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=J6ENsoZCBwU",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@youronlinetenniscoach",
    platformLinks: {
      YouTube: "https://www.youtube.com/@youronlinetenniscoach"
    },
    avatar: youtubeAvatar("UC4OdGlldLhLqe7TEw1I8DVw"),
    rankingSignals: {
      subscriberScore: 0.51,
      averageViewsScore: 0.58,
      activityScore: 0.74,
      catalogScore: 0.63,
      authorityScore: 0.65,
      curatorBoost: 0.67
    },
    environment: ["testing", "production"],
    nameZh: "你的网球教练",
    shortDescriptionEn: "Timing, vision, and volley details explained well",
    bioEn: "Focused on timing, ball tracking, and volley mechanics with clear explanations.",
    suitableForEn: ["Timing","Ball tracking","Volley mechanics"]
  },
  {
    id: "creator_crunch_time_coaching",
    name: "Crunch Time Coaching",
    shortDescription: "lesson实拍多，发球和正手干货密",
    tags: ["讲解透彻", "发球专修", "进阶突破"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["2.5", "3.0", "3.5", "4.0", "4.5"],
    specialties: ["serve", "forehand", "footwork", "volley", "topspin"],
    styleTags: ["lesson实拍", "训练导向", "讲解透彻"],
    bio: "偏 lesson 实拍和训练拆解，尤其适合想补发球、正手和脚步逻辑的俱乐部球员。",
    suitableFor: ["发球训练", "正手纠正", "脚步与lesson实拍"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_crunch_time_coaching_video_01",
        title: "10X Your Slice Serve in 10 Minutes (This Drill Is Ridiculous)",
        target: "Slice发球总做不出弧线",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/x35WrkLXmWU/mqdefault.jpg",
        viewCount: 30670,
        url: "https://www.youtube.com/watch?v=x35WrkLXmWU",
        platform: "YouTube"
      },
      {
        id: "creator_crunch_time_coaching_video_02",
        title: "Quick Tips: 2 Secrets to Consistent Forehands",
        target: "正手总不够稳定",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/d83v5BmewWo/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=d83v5BmewWo",
        platform: "YouTube"
      },
      {
        id: "creator_crunch_time_coaching_video_03",
        title: "Develop Perfect Forehand Technique 100% by yourself",
        target: "想自己把正手框架练顺",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/1es8pfYRHbk/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=1es8pfYRHbk",
        platform: "YouTube"
      },
      {
        id: "creator_crunch_time_coaching_video_04",
        title: "Forehand Deadly Accuracy: Tennis Lesson",
        target: "正手落点总控不住",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/tMpTJxc0Jh0/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=tMpTJxc0Jh0",
        platform: "YouTube"
      },
      {
        id: "creator_crunch_time_coaching_video_05",
        title: "5 Ways to Instantly Improve your Forehand",
        target: "想快速修正正手动作",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://img.youtube.com/vi/QrHA1p2YoeI/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=QrHA1p2YoeI",
        platform: "YouTube"
      },
      {
        id: "creator_crunch_time_coaching_video_06",
        title: "Massive Topspin Forehands in 3 Simple Steps",
        target: "正手上旋总拉不出来",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/CIfArOyZGug/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=CIfArOyZGug",
        platform: "YouTube"
      },
      {
        id: "creator_crunch_time_coaching_video_07",
        title: "Forehand Lesson: 5 Massive Forehand Power Drills",
        target: "正手想发力却发不出来",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/d-d5Jq45RC4/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=d-d5Jq45RC4",
        platform: "YouTube"
      },
      {
        id: "creator_crunch_time_coaching_video_08",
        title: "Tennis Volley Lesson: Best Forehand Volley Tip Ever",
        target: "网前截击总没把握",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://img.youtube.com/vi/jbE0Dkf1JHI/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=jbE0Dkf1JHI",
        platform: "YouTube"
      },
      {
        id: "creator_crunch_time_coaching_video_09",
        title: "Top 10 Beginner Tennis Drills for Jan 2022",
        target: "刚入门不知道怎么练",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: "https://img.youtube.com/vi/7mzcbyqw_J4/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=7mzcbyqw_J4",
        platform: "YouTube"
      },
      {
        id: "creator_crunch_time_coaching_video_10",
        title: "Anna learns topspin and footwork in her 2nd tennis lesson",
        target: "脚步和上旋总连不起来",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: "https://img.youtube.com/vi/IM65pLjZgxQ/mqdefault.jpg",
        viewCount: 2944,
        url: "https://www.youtube.com/watch?v=IM65pLjZgxQ",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@PeterFreemanTennis",
    platformLinks: {
      YouTube: "https://www.youtube.com/@PeterFreemanTennis"
    },
    avatar: youtubeAvatar("UCwDXnQWw5E83CF1Dai79M8A"),
    rankingSignals: {
      subscriberScore: 0.53,
      averageViewsScore: 0.57,
      activityScore: 0.73,
      catalogScore: 0.66,
      authorityScore: 0.66,
      curatorBoost: 0.68
    },
    environment: ["testing", "production"],
    nameZh: "关键时刻教练",
    shortDescriptionEn: "Real lesson footage with serve and forehand focus",
    bioEn: "On-court lesson recordings emphasizing serve and forehand development.",
    suitableForEn: ["Lesson footage","Serve focus","Forehand development"]
  },
  {
    id: "creator_tenniswithtyler",
    name: "TenniswithTyler",
    shortDescription: "发球节奏和训练结构讲得直给，适合快速上手",
    shortDescriptionEn: "Straightforward serve-rhythm teaching with practical session structure",
    tags: ["发球节奏", "训练导向", "入门友好"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["2.5", "3.0", "3.5", "4.0", "4.5"],
    specialties: ["serve", "training", "footwork"],
    styleTags: ["短平快", "训练导向", "讲解透彻"],
    bio: "偏发球节奏与训练练法拆解，适合想快速稳定发球 timing 的业余球员。",
    bioEn: "Focused on serve rhythm and practice structure, ideal for recreational players trying to stabilize serve timing quickly.",
    suitableFor: ["发球节奏", "基础 timing", "训练上手"],
    suitableForEn: ["Serve rhythm", "Timing basics", "Practice structure"],
    featuredContentIds: [],
    featuredVideos: [],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@TenniswithTyler",
    platformLinks: {
      YouTube: "https://www.youtube.com/@TenniswithTyler"
    },
    avatar: youtubeAvatar("@TenniswithTyler"),
    environment: ["testing", "production"],
    rankingSignals: {
      subscriberScore: 0.45,
      averageViewsScore: 0.55,
      activityScore: 0.68,
      catalogScore: 0.58,
      authorityScore: 0.56,
      curatorBoost: 0.6
    }
  },
  {
    id: "creator_the_game_of_tennis",
    name: "The Game of Tennis",
    shortDescription: "以职业案例讲发球 timing 与力量转换",
    shortDescriptionEn: "Uses pro examples to explain serve timing and power transfer",
    tags: ["进阶突破", "发球专修", "案例拆解"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["serve", "matchplay", "training"],
    styleTags: ["案例拆解", "技术原理", "讲解透彻"],
    bio: "偏职业案例和技术原理拆解，适合希望把发球 timing 与爆发力真正对齐的球员。",
    bioEn: "Breaks down pro patterns and technical principles for players who want cleaner serve timing and better power sequencing.",
    suitableFor: ["发球时机", "发球力量", "进阶优化"],
    suitableForEn: ["Serve timing", "Serve power", "Advanced refinement"],
    featuredContentIds: [],
    featuredVideos: [],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@thegameoftennis9660",
    platformLinks: {
      YouTube: "https://www.youtube.com/@thegameoftennis9660"
    },
    avatar: youtubeAvatar("@thegameoftennis9660"),
    environment: ["testing", "production"],
    rankingSignals: {
      subscriberScore: 0.47,
      averageViewsScore: 0.56,
      activityScore: 0.64,
      catalogScore: 0.57,
      authorityScore: 0.58,
      curatorBoost: 0.61
    }
  },
  {
    id: "creator_patrick_mouratoglou",
    name: "Patrick Mouratoglou",
    shortDescription: "职业级教学视角，技术要点拆解清晰",
    shortDescriptionEn: "Elite coaching perspective with clear technical breakdowns",
    tags: ["进阶突破", "讲解透彻", "职业视角"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["serve", "overhead", "matchplay", "footwork"],
    styleTags: ["职业视角", "动作拆解", "系统化"],
    bio: "偏职业训练视角和动作细节拆解，适合想做进阶技术优化的球员。",
    bioEn: "Brings a pro-level training lens and detailed technical explanations for players making higher-level refinements.",
    suitableFor: ["高压球时机", "发球技术", "比赛执行"],
    suitableForEn: ["Overhead timing", "Serve technique", "Match execution"],
    featuredContentIds: [],
    featuredVideos: [],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@MouratoglouTennis",
    platformLinks: {
      YouTube: "https://www.youtube.com/@MouratoglouTennis"
    },
    avatar: youtubeAvatar("@MouratoglouTennis"),
    environment: ["testing", "production"],
    rankingSignals: {
      subscriberScore: 0.72,
      averageViewsScore: 0.7,
      activityScore: 0.65,
      catalogScore: 0.68,
      authorityScore: 0.78,
      curatorBoost: 0.76
    }
  },
  {
    id: "creator_coach_ben_zink",
    name: "Coach Ben Zink",
    shortDescription: "基础到进阶连接顺滑，节奏类讲解直观",
    shortDescriptionEn: "Smooth from fundamentals to progression, with intuitive rhythm cues",
    tags: ["入门友好", "动作拆解", "节奏训练"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["overhead", "serve", "footwork", "basics"],
    styleTags: ["结构化", "步骤化", "练习导向"],
    bio: "偏步骤化教学和纠错流程，适合把复杂动作拆成可执行步骤。",
    bioEn: "Favors step-by-step teaching and correction sequences that turn complex mechanics into practical reps.",
    suitableFor: ["高压球基础", "发球节奏", "步法入门"],
    suitableForEn: ["Overhead basics", "Serve rhythm", "Footwork basics"],
    featuredContentIds: [],
    featuredVideos: [],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@CoachBenZink",
    platformLinks: {
      YouTube: "https://www.youtube.com/@CoachBenZink"
    },
    avatar: youtubeAvatar("@CoachBenZink"),
    environment: ["testing", "production"],
    rankingSignals: {
      subscriberScore: 0.48,
      averageViewsScore: 0.54,
      activityScore: 0.63,
      catalogScore: 0.57,
      authorityScore: 0.55,
      curatorBoost: 0.58
    }
  },
  {
    id: "creator_iron_will_tennis",
    name: "Iron Will Tennis",
    shortDescription: "训练思路清楚，动作节奏强调到位",
    shortDescriptionEn: "Clear training logic with strong emphasis on timing and sequencing",
    tags: ["训练导向", "讲解透彻", "时机控制"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["overhead", "serve", "training", "footwork"],
    styleTags: ["训练导向", "动作细节", "节奏控制"],
    bio: "偏训练场景应用和时机控制，适合希望稳定执行动作的球员。",
    bioEn: "Leans on training applications and timing control for players who want more repeatable execution.",
    suitableFor: ["高压球稳定", "发球时机", "训练结构"],
    suitableForEn: ["Overhead stability", "Serve timing", "Practice structure"],
    featuredContentIds: [],
    featuredVideos: [],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@IronWillTennis",
    platformLinks: {
      YouTube: "https://www.youtube.com/@IronWillTennis"
    },
    avatar: youtubeAvatar("@IronWillTennis"),
    environment: ["testing", "production"],
    rankingSignals: {
      subscriberScore: 0.44,
      averageViewsScore: 0.5,
      activityScore: 0.6,
      catalogScore: 0.55,
      authorityScore: 0.52,
      curatorBoost: 0.56
    }
  },
  {
    id: "creator_best_tennis_tv",
    name: "BestTennisTV",
    shortDescription: "全流程教学内容多，覆盖基础到进阶",
    shortDescriptionEn: "Plenty of full-process instruction from basics through progression",
    tags: ["入门友好", "系统化", "全流程"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["overhead", "serve", "basics", "training"],
    styleTags: ["系统化", "全流程", "教学导向"],
    bio: "偏完整动作流程教学，适合需要从头到尾建立技术框架的球员。",
    bioEn: "Focuses on complete technical sequences for players who want to build a skill from start to finish.",
    suitableFor: ["高压球全流程", "基础动作梳理", "训练执行"],
    suitableForEn: ["Full overhead process", "Fundamental technique cleanup", "Practice execution"],
    featuredContentIds: [],
    featuredVideos: [],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@BestTennisTV",
    platformLinks: {
      YouTube: "https://www.youtube.com/@BestTennisTV"
    },
    avatar: youtubeAvatar("@BestTennisTV"),
    environment: ["testing", "production"],
    rankingSignals: {
      subscriberScore: 0.42,
      averageViewsScore: 0.48,
      activityScore: 0.58,
      catalogScore: 0.56,
      authorityScore: 0.51,
      curatorBoost: 0.54
    }
  }


];
