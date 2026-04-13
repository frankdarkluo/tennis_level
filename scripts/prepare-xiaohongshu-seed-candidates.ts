import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { registerSrcAlias } from "./lib/registerSrcAlias";
import {
  buildXiaohongshuSeedCandidateArtifact,
  type XiaohongshuSeedCandidateInput
} from "./lib/xiaohongshuSeedCandidates";

registerSrcAlias();

const OUTPUT_DIR = resolve(process.cwd(), "ops/quality");
const OUTPUT_PATH = resolve(OUTPUT_DIR, "xiaohongshu-seed-candidates.json");

const CURATED_CANDIDATES: XiaohongshuSeedCandidateInput[] = [
  {
    creatorName: "盖奥",
    creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/5c3b619e000000000703fccc",
    creatorShortProfileUrl: "https://xhslink.com/m/3nXlLxIQQcu",
    rawUrl: "https://www.xiaohongshu.com/search_result/6436d3060000000011012067?xsec_token=ABjtcrIKBTUGC5VHoZPlC8uqeG2uhies59Bec4Jd_ACN4=&xsec_source=",
    resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/6436d3060000000011012067",
    title: "网球正手零基础教学（详细版）",
    profileConfirmedTitle: "网球正手零基础教学（详细版）",
    thumbnailUrl: "https://sns-webpic-qc.xhscdn.com/202604140054/9c86564ce9f5f35aff694ca609002d10/1000g0082b4tu69ch40005n1rc6f1vv6c0mqhrpo!nc_n_nwebp_mw_1",
    preliminaryProblemTags: ["forehand-basics"],
    discoveryQuery: "网球正手零基础教学（详细版）",
    surfaceDateText: "2023-04-12",
    surfaceLikeText: "7.5万",
    crossPlatformNotes: "Potential semantic overlap with existing Bilibili forehand-teaching items from the same creator; keep as a separate Xiaohongshu record until manual review confirms equivalence.",
    priority: 1
  },
  {
    creatorName: "盖奥",
    creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/5c3b619e000000000703fccc",
    creatorShortProfileUrl: "https://xhslink.com/m/3nXlLxIQQcu",
    rawUrl: "https://www.xiaohongshu.com/search_result/69d3aa0b000000002102d993?xsec_token=ABfzlDLhHh-qf1bKp5e8QgVKwZ4kAA-CP9TmdQyMalDMw=&xsec_source=",
    resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/69d3aa0b000000002102d993",
    title: "发球全要点（慢动作+细节节奏串联）",
    profileConfirmedTitle: "发球全要点（慢动作+细节节奏串联）",
    thumbnailUrl: "https://sns-webpic-qc.xhscdn.com/202604140051/5310cd9155208d73f05ccd32fb5a282d/1040g2sg31ukcj0bq2ie05n1rc6f1vv6c59dtim8!nc_n_nwebp_mw_1",
    preliminaryProblemTags: ["serve-basics", "serve-rhythm"],
    discoveryQuery: "发球全要点（慢动作+细节节奏串联） 盖奥",
    surfaceDateText: "04-06",
    surfaceLikeText: "1973",
    crossPlatformNotes: "Potential semantic overlap with existing Bilibili serve-teaching items from the same creator; keep as a separate Xiaohongshu record until manual review confirms equivalence.",
    priority: 2
  },
  {
    creatorName: "盖奥",
    creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/5c3b619e000000000703fccc",
    creatorShortProfileUrl: "https://xhslink.com/m/3nXlLxIQQcu",
    rawUrl: "https://www.xiaohongshu.com/search_result/69a44c1600000000150238d1?xsec_token=ABPiBbVr8jdORkqUKjP_Xg2xdZ52A9gAXMKrQKiDCk7ZE=&xsec_source=",
    resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/69a44c1600000000150238d1",
    title: "顺畅、丝滑发球的秘诀（细节全流程图）",
    profileConfirmedTitle: "顺畅、丝滑发球的秘诀（细节全流程图）",
    thumbnailUrl: "https://sns-webpic-qc.xhscdn.com/202604140051/05b96dc70ad5f499051fd303b43965ca/1040g2sg31t64c8df5se05n1rc6f1vv6ctep67a0!nc_n_nwebp_mw_1",
    preliminaryProblemTags: ["serve-rhythm", "serve-timing"],
    discoveryQuery: "顺畅、丝滑发球的秘诀（细节全流程图） 盖奥",
    surfaceDateText: "03-01",
    surfaceLikeText: "8843",
    crossPlatformNotes: "Potential semantic overlap with existing Bilibili serve-flow teaching items from the same creator; keep as a separate Xiaohongshu record until manual review confirms equivalence.",
    priority: 3
  },
  {
    creatorName: "盖奥",
    creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/5c3b619e000000000703fccc",
    creatorShortProfileUrl: "https://xhslink.com/m/3nXlLxIQQcu",
    rawUrl: "https://www.xiaohongshu.com/search_result/69c29c5f0000000021012666?xsec_token=ABH5hpssPelkvofgg2CnrsRvZ4iH26nWe_eqnDBttdSEU=&xsec_source=",
    resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/69c29c5f0000000021012666",
    title: "开拍慢总被球挤到？！做这6组跟练！",
    profileConfirmedTitle: "开拍慢总被球挤到？！做这6组跟练！",
    thumbnailUrl: "https://sns-webpic-qc.xhscdn.com/202604140051/3f5e683c468d2ee1396c3339b93e36cb/1040g2sg31u3no0ql24e05n1rc6f1vv6ccbhktag!nc_n_nwebp_mw_1",
    preliminaryProblemTags: ["slow-preparation", "late-contact"],
    discoveryQuery: "开拍慢总被球挤到？！做这6组跟练！",
    surfaceDateText: "03-24",
    surfaceLikeText: "2327",
    crossPlatformNotes: "Potential semantic overlap with existing Bilibili preparation/contact teaching items from the same creator; keep as a separate Xiaohongshu record until manual review confirms equivalence.",
    priority: 4
  },
  {
    creatorName: "盖奥",
    creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/5c3b619e000000000703fccc",
    creatorShortProfileUrl: "https://xhslink.com/m/3nXlLxIQQcu",
    rawUrl: "https://www.xiaohongshu.com/search_result/69bab756000000002102f66e?xsec_token=ABI62z72nqIPzHS_57oowbjLWDSmNv5f68F_dPYmP9s20=&xsec_source=",
    resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/69bab756000000002102f66e",
    title: "鞭打正手（单发暴击全流程拆解）",
    profileConfirmedTitle: "鞭打正手（单发暴击全流程拆解）",
    thumbnailUrl: "https://sns-webpic-qc.xhscdn.com/202604140052/4ede92f89d0e41ffbbb1c722c95271f1/1040g00831ts0sf2b6u005n1rc6f1vv6cp935ivo!nc_n_nwebp_mw_1",
    preliminaryProblemTags: ["forehand-basics", "forehand-no-power"],
    discoveryQuery: "鞭打正手（单发暴击全流程拆解） 盖奥",
    surfaceDateText: "03-18",
    surfaceLikeText: "2044",
    crossPlatformNotes: "Potential semantic overlap with existing Bilibili forehand-acceleration teaching items from the same creator; keep as a separate Xiaohongshu record until manual review confirms equivalence.",
    priority: 5
  },
  {
    creatorName: "灵熙🎾",
    creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/63aef7df000000002702a346",
    creatorShortProfileUrl: "https://xhslink.com/m/2pkWMTS4aVj",
    rawUrl: "https://www.xiaohongshu.com/search_result/69dce4c6000000002301dcf1?xsec_token=AB5E2X2dR3MjVp4n5Mhl12mZY0Wy8eSVhrlU2Vr-sPHdg=&xsec_source=",
    resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/69dce4c6000000002301dcf1",
    title: "我的拦网为什么这么好？",
    profileConfirmedTitle: "我的拦网为什么这么好？",
    thumbnailUrl: "https://sns-webpic-qc.xhscdn.com/202604140047/240f5e0a0397a57fef4fd17af39862bd/1040g00831utd2gnt3q005oteuvfpt8q6i4da8og!nc_n_nwebp_mw_1",
    preliminaryProblemTags: ["net-confidence"],
    discoveryQuery: "我的拦网为什么这么好 灵熙",
    surfaceDateText: "昨天 20:42",
    surfaceLikeText: "156",
    crossPlatformNotes: "No confirmed Bilibili surface is known for this creator. Treat Xiaohongshu as the primary direct-source surface and keep this record platform-specific.",
    priority: 1
  },
  {
    creatorName: "灵熙🎾",
    creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/63aef7df000000002702a346",
    creatorShortProfileUrl: "https://xhslink.com/m/2pkWMTS4aVj",
    rawUrl: "https://www.xiaohongshu.com/search_result/69bd3a7c000000001b020f2a?xsec_token=ABF7dcUDSTZIGsiEZF6ov9itLeVZTGrgLjK07tPTZ0-bY=&xsec_source=",
    resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/69bd3a7c000000001b020f2a",
    title: "学会这个突破脚步思路！",
    profileConfirmedTitle: "学会这个突破脚步思路！",
    thumbnailUrl: "https://sns-webpic-qc.xhscdn.com/202604140042/fa1d38b9360869cd9f82c07d8d167baf/1040g00831tufj8ng7e705oteuvfpt8q6ia36ovg!nc_n_nwebp_mw_1",
    preliminaryProblemTags: ["movement-slow"],
    discoveryQuery: "学会这个突破脚步思路 灵熙",
    surfaceDateText: "03-20",
    surfaceLikeText: "888",
    crossPlatformNotes: "No confirmed Bilibili surface is known for this creator. Treat Xiaohongshu as the primary direct-source surface and keep this record platform-specific.",
    priority: 2
  },
  {
    creatorName: "灵熙🎾",
    creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/63aef7df000000002702a346",
    creatorShortProfileUrl: "https://xhslink.com/m/2pkWMTS4aVj",
    rawUrl: "https://www.xiaohongshu.com/search_result/69b7f9f30000000022027926?xsec_token=ABirWRNWCMiUR2qY4LXhAMVRBj9r_tj0OhPxAc6BMB6EM=&xsec_source=",
    resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/69b7f9f30000000022027926",
    title: "身体参与不够，导致失误",
    profileConfirmedTitle: "身体参与不够，导致失误",
    thumbnailUrl: "https://sns-webpic-qc.xhscdn.com/202604140042/27809d67b46788e2bb995451aa93ef43/1040g2sg31tpbf4l17ee05oteuvfpt8q68edpi68!nc_n_nwebp_mw_1",
    preliminaryProblemTags: ["timing-off"],
    discoveryQuery: "身体参与不够 导致失误 灵熙",
    surfaceDateText: "03-16",
    surfaceLikeText: "492",
    crossPlatformNotes: "No confirmed Bilibili surface is known for this creator. Treat Xiaohongshu as the primary direct-source surface and keep this record platform-specific.",
    priority: 3
  },
  {
    creatorName: "灵熙🎾",
    creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/63aef7df000000002702a346",
    creatorShortProfileUrl: "https://xhslink.com/m/2pkWMTS4aVj",
    rawUrl: "https://www.xiaohongshu.com/search_result/69c68c91000000001a0367fd?xsec_token=ABjCT_vCi2frNBGvafOQlDi4vTR9G1DxX8T8efcz4poW4=&xsec_source=",
    resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/69c68c91000000001a0367fd",
    title: "发球带点beats",
    profileConfirmedTitle: "发球带点beats",
    thumbnailUrl: "https://sns-webpic-qc.xhscdn.com/202604140047/c7e4efa9ab2513085488b4137856931b/1040g00831u7ircaoio005oteuvfpt8q6qco52co!nc_n_nwebp_mw_1",
    preliminaryProblemTags: ["serve-rhythm"],
    discoveryQuery: "发球带点beats 灵熙",
    surfaceDateText: "03-27",
    surfaceLikeText: "461",
    crossPlatformNotes: "No confirmed Bilibili surface is known for this creator. Treat Xiaohongshu as the primary direct-source surface and keep this record platform-specific.",
    priority: 4
  },
  {
    creatorName: "灵熙🎾",
    creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/63aef7df000000002702a346",
    creatorShortProfileUrl: "https://xhslink.com/m/2pkWMTS4aVj",
    rawUrl: "https://www.xiaohongshu.com/search_result/69d1af64000000001a02c33c?xsec_token=AB12ts99ayAfderyCRUCRV6wUdKjEUY_9lr2meDk9aHnQ=&xsec_source=",
    resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/69d1af64000000001a02c33c",
    title: "哪个点对进攻端是至关重要的？",
    profileConfirmedTitle: "哪个点对进攻端是至关重要的？",
    thumbnailUrl: "https://sns-webpic-qc.xhscdn.com/202604140047/e26249b64751ae439e4c4c132fca2c86/1040g00831uienrftig005oteuvfpt8q6htndspo!nc_n_nwebp_mw_1",
    preliminaryProblemTags: ["passive-point-construction"],
    discoveryQuery: "哪个点对进攻端是至关重要的 灵熙🎾",
    surfaceDateText: "04-05",
    surfaceLikeText: "476",
    crossPlatformNotes: "No confirmed Bilibili surface is known for this creator. Treat Xiaohongshu as the primary direct-source surface and keep this record platform-specific.",
    priority: 5
  },
  {
    creatorName: "冠军教练 - 莫拉托格鲁",
    creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/6050684100000000010047d5",
    creatorShortProfileUrl: "https://xhslink.com/m/3yjLTuwVbKr",
    rawUrl: "https://www.xiaohongshu.com/search_result/69bfd507000000001a033bd7?xsec_token=ABRpCaHsh6cyF4AWyPa8TB-QcG2z_WetDfxsmTD77JhpA=&xsec_source=",
    resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/69bfd507000000001a033bd7",
    title: "别学费德勒的反手",
    profileConfirmedTitle: "别学费德勒的反手",
    thumbnailUrl: "https://sns-webpic-qc.xhscdn.com/202604140056/278f9b317615af03e01afb5ba5bc13d0/spectrum/1040g0k031u10u4n5gs005o2gd10g8hulunv0leg!nc_n_nwebp_mw_1",
    preliminaryProblemTags: ["backhand-basics"],
    discoveryQuery: "别学费德勒的反手 莫拉托格鲁",
    surfaceDateText: "03-28",
    surfaceLikeText: "1016",
    crossPlatformNotes: "Potential semantic overlap with existing Bilibili Mouratoglou coaching clips; keep as a separate Xiaohongshu record until manual review confirms equivalence.",
    priority: 1
  },
  {
    creatorName: "冠军教练 - 莫拉托格鲁",
    creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/6050684100000000010047d5",
    creatorShortProfileUrl: "https://xhslink.com/m/3yjLTuwVbKr",
    rawUrl: "https://www.xiaohongshu.com/search_result/69cbda3700000000230205b6?xsec_token=ABdb30tzXg5fUQ-t9JWNFTlKlYYWnGBjdL3e-1I4sV3uo=&xsec_source=",
    resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/69cbda3700000000230205b6",
    title: "如何正确正手发力?",
    profileConfirmedTitle: "如何正确正手发力?",
    thumbnailUrl: "https://sns-webpic-qc.xhscdn.com/202604140040/7d5bdd97ac3978a6e38ea538dd52d47e/spectrum/1040g0k031ucoitn32s005o2gd10g8huln4f1tk8!nc_n_nwebp_mw_1",
    preliminaryProblemTags: ["forehand-basics", "forehand-no-power"],
    discoveryQuery: "如何正确正手发力 莫拉托格鲁",
    surfaceDateText: "04-05",
    surfaceLikeText: "250",
    crossPlatformNotes: "Potential semantic overlap with existing Bilibili Mouratoglou forehand-teaching clips; keep as a separate Xiaohongshu record until manual review confirms equivalence.",
    priority: 2
  },
  {
    creatorName: "冠军教练 - 莫拉托格鲁",
    creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/6050684100000000010047d5",
    creatorShortProfileUrl: "https://xhslink.com/m/3yjLTuwVbKr",
    rawUrl: "https://www.xiaohongshu.com/search_result/69c12914000000002103bec0?xsec_token=ABqn6oFUYZhU5NCmT1Sue8REVnYe0YGSjK--cTJqTgAgo=&xsec_source=",
    resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/69c12914000000002103bec0",
    title: "如何破解网前漏洞？",
    profileConfirmedTitle: "如何破解网前漏洞？",
    thumbnailUrl: "https://sns-webpic-qc.xhscdn.com/202604140040/94f865684e41f47de0afa6ff335c9725/spectrum/1040g34o31u2acijp0s0g5o2gd10g8hulcuoo6c8!nc_n_nwebp_mw_1",
    preliminaryProblemTags: ["net-confidence"],
    discoveryQuery: "如何破解网前漏洞 莫拉托格鲁",
    surfaceDateText: "03-30",
    surfaceLikeText: "278",
    crossPlatformNotes: "Potential semantic overlap with existing Bilibili Mouratoglou net-play clips; keep as a separate Xiaohongshu record until manual review confirms equivalence.",
    priority: 3
  },
  {
    creatorName: "冠军教练 - 莫拉托格鲁",
    creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/6050684100000000010047d5",
    creatorShortProfileUrl: "https://xhslink.com/m/3yjLTuwVbKr",
    rawUrl: "https://www.xiaohongshu.com/search_result/69cbc48a000000001f0059d4?xsec_token=ABdb30tzXg5fUQ-t9JWNFTlMNPVZ8a8YOJ17-pKOG4qas=&xsec_source=",
    resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/69cbc48a000000001f0059d4",
    title: "选手们最常犯的4个错误",
    profileConfirmedTitle: "选手们最常犯的4个错误",
    thumbnailUrl: "https://sns-webpic-qc.xhscdn.com/202604140040/12a954f8d6a031c50e053155dd035fc2/spectrum/1040g0k031ucltlr6is005o2gd10g8hull8al4eo!nc_n_nwebp_mw_1",
    preliminaryProblemTags: ["general-improvement"],
    discoveryQuery: "选手们最常犯的4个错误 莫拉托格鲁",
    surfaceDateText: "04-01",
    surfaceLikeText: "166",
    crossPlatformNotes: "Potential semantic overlap with existing Bilibili Mouratoglou fundamentals clips; keep as a separate Xiaohongshu record until manual review confirms equivalence.",
    priority: 4
  },
  {
    creatorName: "冠军教练 - 莫拉托格鲁",
    creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/6050684100000000010047d5",
    creatorShortProfileUrl: "https://xhslink.com/m/3yjLTuwVbKr",
    rawUrl: "https://www.xiaohongshu.com/search_result/69cbc764000000001b02133b?xsec_token=ABdb30tzXg5fUQ-t9JWNFTlH5lrZcKtmy0ryLaFBmhwO0=&xsec_source=",
    resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/69cbc764000000001b02133b",
    title: "网球前四拍制胜法",
    profileConfirmedTitle: "网球前四拍制胜法",
    thumbnailUrl: "https://sns-webpic-qc.xhscdn.com/202604140041/1ef168ddd2373fcc5b77b712111d3179/spectrum/1040g34o31uf1jv6k1m0g5o2gd10g8hulf2i70vg!nc_n_nwebp_mw_1",
    preliminaryProblemTags: ["passive-point-construction"],
    discoveryQuery: "网球前四拍制胜法 莫拉托格鲁",
    surfaceDateText: "6天前",
    surfaceLikeText: "394",
    crossPlatformNotes: "Potential semantic overlap with existing Bilibili Mouratoglou point-construction clips; keep as a separate Xiaohongshu record until manual review confirms equivalence.",
    priority: 5
  }
];

function main() {
  const artifact = buildXiaohongshuSeedCandidateArtifact({
    generatedAt: new Date().toISOString(),
    inputs: CURATED_CANDIDATES
  });

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");

  console.log(`Wrote ${OUTPUT_PATH}`);
  for (const creator of artifact.summary.byCreator) {
    console.log(`${creator.creatorName}: saved=${creator.savedCount}`);
  }
  console.log(`candidate_count=${artifact.summary.candidateCount}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
