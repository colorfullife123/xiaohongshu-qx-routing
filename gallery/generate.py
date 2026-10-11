#!/usr/bin/env python3
"""Refresh Quantumult X Icon Gallery manifests from actual upstream Git trees.

No external Python dependencies. Never copies third-party PNG binaries.
"""
import json
import sys
import urllib.request
from pathlib import Path
from urllib.parse import quote

HERE = Path(__file__).resolve().parent
QROOT = "https://raw.githubusercontent.com/Koolson/Qure/master/"
EROOT = "https://raw.githubusercontent.com/erdongchanyo/icon/main/"
OWN = "https://raw.githubusercontent.com/colorfullife123/xiaohongshu-qx-routing/main/"
CATS = ["Area", "Common", "Default", "Inhibition", "Media", "AppGame",
        "Server", "Service", "Other", "Archived"]

def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent":"QX-IconGallery-Updater/1.0","Accept":"application/vnd.github+json"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)

def select(tree, prefix):
    return sorted((item for item in tree if item.get("type") == "blob"
                   and item.get("size", 0) > 0
                   and item["path"].startswith(prefix)
                   and item["path"].lower().endswith(".png")),
                  key=lambda item: item["path"].lower())

def url(root, path):
    return root + "/".join(quote(piece, safe="") for piece in path.split("/"))

def make(items, root, label=""):
    return [{"name":label+e["path"].split("/")[-1][:-4],
             "url":url(root,e["path"])} for e in items]

def verify(icons, label):
    if not icons:
        raise ValueError(f"{label}: empty")
    urls = [item["url"] for item in icons]
    if len(urls) != len(set(urls)):
        raise ValueError(f"{label}: repeated image URL")
    if not all(u.startswith("https://raw.githubusercontent.com/") for u in urls):
        raise ValueError(f"{label}: non-GitHub URL")

def main(check=False):
    qure = fetch("https://api.github.com/repos/Koolson/Qure/git/trees/master?recursive=1")
    edc = fetch("https://api.github.com/repos/erdongchanyo/icon/git/trees/main?recursive=1")
    if qure.get("truncated") or edc.get("truncated"):
        raise ValueError("GitHub tree response was truncated")
    q = qure["tree"]
    e = edc["tree"]
    qall = {
        "color":select(q,"IconSet/Color/"),
        "classic":[x for x in select(q,"IconSet/") if x["path"].count("/")==1],
        "dark":select(q,"IconSet/Dark/"),
        "mini":select(q,"IconSet/mini/")
    }
    eall = {
        "country":select(e,"Policy-Country/"),
        "filter":select(e,"Policy-Filter/"),
        "airport":select(e,"Airport/"),
        "task":select(e,"taskicon/")
    }
    manifests={key:fetch(QROOT+"Other/QureColor-"+key+".json") for key in CATS}
    def cat(*keys):
        wanted={it["name"] for key in keys for it in manifests[key]["icons"]}
        result=[it for it in qall["color"] if it["path"].split("/")[-1] in wanted]
        if len(result)!=len(wanted):
            raise ValueError(f"Upstream category missing assets: {keys}")
        return make(result,QROOT)
    def social():
        names=set(x.lower() for x in [
            "AI","ChatGPT","Copilot","X","Twitter","Telegram","Telegram_X","TikTok",
            "Instagram","Facebook","Discord","Gmail","GitHub","GitHub_Letter","Google",
            "WeChat","Weibo","QQ","Line","Kakao","Linkedin","Notion","Microsoft",
            "Apple","Cloudflare","YouTube","bilibili","Netease_Music","Steam","PayPal","Taobao"])
        return make([x for x in qall["color"]
                     if x["path"].split("/")[-1][:-4].lower() in names],QROOT)
    xhs={"name":"小红书上传 · Xiaohongshu","url":OWN+"assets/xiaohongshu-policy-108.png"}
    compact=[*make(qall["color"],QROOT,"彩色 · "),
             *make(eall["country"],EROOT,"EDC 国家 · "),
             *make(eall["filter"],EROOT,"EDC 策略 · "),
             *make(eall["airport"],EROOT,"EDC 机场 · "),
             *make(eall["task"],EROOT,"EDC 任务 · "),xhs]
    all_icons=[*make(qall["color"],QROOT,"彩色 · "),
               *make(qall["classic"],QROOT,"经典 · "),
               *make(qall["dark"],QROOT,"深色 · "),
               *make(qall["mini"],QROOT,"极简 · "),
               *make(eall["country"],EROOT,"EDC 国家 · "),
               *make(eall["filter"],EROOT,"EDC 策略 · "),
               *make(eall["airport"],EROOT,"EDC 机场 · "),
               *make(eall["task"],EROOT,"EDC 任务 · "),xhs]
    packages={}
    def add(filename,title,description,items):
        verify(items,filename)
        packages[filename]={"name":title,"description":description,"icons":items}
    add("icon-gallery.json",f"QX Icon Gallery · 全量 {len(all_icons)}",
        "Quantumult X 图标全集：四套 Qure 风格、EDC 国家/策略/机场/任务及自定义小红书，按图标名称搜索。",all_icons)
    add("color-plus.json","QX Icon Gallery · 彩色整合",
        "适合日常使用：Qure 彩色 + EDC 扩展 + 小红书。",compact)
    for name,title in {"color":"彩色","classic":"经典","dark":"深色","mini":"极简"}.items():
        add("qure-"+name+".json","Qure "+title+" · 全部",
            "源自 Koolson/Qure 的 "+title+" 风格图标，持续兼容 Quantumult X。",
            make(qall[name],QROOT))
    for name,title in {"country":"国家地区","filter":"分流策略","airport":"机场服务","task":"任务图标"}.items():
        add("edc-"+name+".json","EDC · "+title,
            "源自 erdongchanyo/icon 的 "+title+" 图标。",make(eall[name],EROOT))
    add("category-regions.json","QX · 国家与地区",
        "国家、地区、地理区域与旗帜；彩色 Qure + EDC。",
        [*cat("Area"),*make(eall["country"],EROOT,"EDC · ")])
    add("category-policy.json","QX · 基础策略与广告拦截",
        "DIRECT/PROXY/REJECT、延迟、智能切换、拦截、分流与网络策略。",
        [*cat("Default","Common","Inhibition"),*make(eall["filter"],EROOT,"EDC · ")])
    add("category-media.json","QX · 流媒体与音乐",
        "电影、电视剧、短视频、音乐、直播等应用图标。",cat("Media"))
    add("category-app-game.json","QX · App 与游戏",
        "应用商店、社交应用、游戏、游戏平台。",cat("AppGame"))
    add("category-service.json","QX · 云服务与节点",
        "常用云平台、网络服务与服务器。",cat("Service","Server"))
    add("category-other.json","QX · 其他与归档",
        "趣味、动物、抽象符号及归档资源。",cat("Other","Archived"))
    add("category-social-ai.json","QX · AI 与社交",
        "AI 助手、社交、聊天、开发工具及平台，并包含小红书策略。",
        [*social(),xhs])
    add("category-airport.json","QX · 机场与节点",
        "机场与节点服务图标，包括 Qure、EDC 两套。",
        [*cat("Server"),*make(eall["airport"],EROOT,"EDC · ")])
    add("category-task.json","QX · 定时任务",
        "适用于 Quantumult X Gallery/任务面板的图标。",make(eall["task"],EROOT))
    add("category-custom.json","QX · 自定义策略",
        "小红书发布/评论独立分流策略专用高清适配图标。",[xhs])
    failed=False
    for filename,body in packages.items():
        path=HERE/filename
        result=json.dumps(body,ensure_ascii=False,indent=2)+"\n"
        if check:
            if not path.exists() or path.read_text(encoding="utf-8")!=result:
                print("OUTDATED",path)
                failed=True
        else:
            path.write_text(result,encoding="utf-8")
        print(filename,len(body["icons"]))
    if check and failed:
        raise SystemExit(1)
    print("All galleries validated. Referenced resources:",len(all_icons))

if __name__=="__main__":
    main("--check" in sys.argv)
