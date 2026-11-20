# RNG 查闪工具

传说阿尔宙斯（PLA）、晶灿钻石 / 明亮珍珠（BDSP）、剑 / 盾（SWSH）、第三世代（RSE）的**离线查闪工具**。
免安装单文件 exe，双击即用，不需要装 Python，也不需要联网（纯种子计算模式下完全不连 Switch）。

基于开源项目 [pla-multi-checker-web](https://github.com/capitalism-sudo/pla-multi-checker) 汉化并打包修改。

---

## 下载

到 [Releases](https://github.com/lovelykoei123/plamc-Community/releases) 下载最新版：

| 文件 | 说明 |
|---|---|
| `RNG-shiny-checker-v1.1.4.exe` | 主程序，单文件 95.9 MB，自带全部运行库和默认配置 |
| `README_CN.txt` | 纯文本使用说明（可选，和 exe 放一起） |

> 附件名是英文：GitHub 会把中文附件名过滤成乱码，所以统一用 ASCII。下载后自己改名成 `RNG查闪工具-v1.1.4.exe` 一样能跑。

`config.json` **不用下载**：exe 已经内置了一份，双击就能用。只有要连 Switch 或想改默认值，才需要自己建一份放在 exe 旁边，说明见下文「配置」。

---

## 启动方法

1. 把 exe 放到任意位置（桌面、D 盘都行，路径带中文也没问题）。
2. 双击运行。先出现「正在启动」窗口，**第一次启动约 20~30 秒**（单文件版要先把内部文件解压到临时目录），之后进入主界面。这段时间不要重复双击。
3. 首次打开可能被 Windows 拦：弹「Windows 已保护你的电脑」时点「更多信息 → 仍要运行」。这是没买数字签名的 exe 的常规提示，不是病毒；被杀毒软件删掉就先把文件加进白名单。
4. 用完点右上角 ×，程序整个退出（不留后台进程）。

需要用系统浏览器打开（比如投到平板上看），给 exe 建个快捷方式，在「目标」末尾加一个空格再写 `--browser`。

出问题时看 exe 旁边的 `运行日志.txt`，里面写了具体原因。

---

## 运行环境

- **Windows 10 / 11，64 位**
- **WebView2 运行时**：Win11 自带；Win10 如果没装过，[下载安装](https://developer.microsoft.com/microsoft-edge/webview2/) 即可（装过 Edge 的机器一般已经有）
- 不需要 Python、不需要 Node、不需要联网

纯算种子（大量出现种子检查、单只生成、多只生成、BDSP、Gen3）**完全不需要 Switch**。
要用「读取游戏存档 / 传送 / 实时读当前大量出现」这类要连 Switch 的功能，看下面「CFW 配置」；只想算种子、不想让程序启动时去连主机，把 `SeedCheckOnly` 设成 `true`（见「配置」）。

### 开发者（跑源码 / 自行打包）

- **Python 3.12**
- 依赖：`pip install -r requirements.txt`（Flask 3.1.0、pyusb、z3、flatbuffers、platformdirs 等）
- 核心计算库要单独装，且必须带 numba 额外依赖：
  - GitHub：`pip install "numba-pokemon-prngs[numba] @ git+https://github.com/Lincoln-LM/numba_pokemon_prngs"`
  - Gitee 镜像：`pip install "numba-pokemon-prngs[numba] @ git+https://gitee.com/fifamvp/numba_pokemon_prngs"`
- 起服务（源码方式）：

  ```bash
  pip install -r requirements.txt
  cp config.template.json config.json     # 按需改 IP / SeedCheckOnly
  python run.py                           # 浏览器打开 http://127.0.0.1:8200/
  ```

  > `main.py` 和 `运行.bat` 是上游遗留文件：`main.py` 内部是相对导入，直接运行会报错；`运行.bat` 依赖文件夹名，遇到带横杠的目录也会失败。请用 `run.py`，它按路径把当前目录当作 `plachecker` 包加载，跟目录名无关。

- 打包 exe：PyInstaller（onefile）+ pywebview（WebView2 后端）。
  打包时要一并收集 `numba_pokemon_prngs` 的数据文件和 `z3` 的 `libz3.dll`，否则剑 / 盾大地图和部分求解功能会缺件。

---

## CFW 配置（进阶，可选）

> **普通用户用不到这一节。** 纯算种子不需要 Switch；只有要用「读取游戏存档 / 传送 / 实时读当前大量出现」这类必须连主机才能用的功能，才需要往下配。

### Switch 侧环境

- 已破解（CFW）的 Switch
- [sys-botbase](https://github.com/olliz0r/sys-botbase)（用 USB 的话换成 usb-botbase）
- 建议装 [ldn_mitm](https://github.com/spacemeowx2/ldn_mitm)：避免开游戏后 Switch 掉 Wi-Fi，连接更稳

主机这边就绪后，IP 和连接方式填在 `config.json` 里，字段说明见下面「配置」。

---

## 配置（可选）

**一般不用建这个文件。** exe 已经内置了一份 `config.json`（打包在程序内部），双击就能直接用；内置默认值是 `IP = 192.168.1.110`、走 Wi-Fi、`SeedCheckOnly = false`。

只有这两种情况才需要自己在 **exe 旁边**放一份同名 `config.json`：

- 要连 Switch 用「读存档 / 传送 / 实时读当前大量出现」——需要填主机 IP 和连接方式（主机侧环境见上面「CFW 配置」）
- **完全不连 Switch，只算种子**——把 `SeedCheckOnly` 改成 `true`，程序启动时就不会去连主机

格式照仓库里的 `config.template.json`，改完保存、重启 exe 生效。程序只读不写，**exe 旁边的同名文件优先于内置那份**；没有这个文件也能照常启动，直接用内置默认值。

| 字段 | 说明 |
|---|---|
| `IP` | Switch 的局域网 IP，默认 `192.168.1.110`。只有「读存档」「传送」「实时读取游戏」这类功能才需要 |
| `USB` | `true` 用 USB 线连接（需 usb-botbase），`false` 用 Wi-Fi |
| `SeedCheckOnly` | `true` = 纯种子模式，启动时完全不连 Switch，只算种子（此模式下「大量出现」检查器和时空扭曲检查器不可用） |
| `FILTER_ON_SERVER` | 保持 `true` |

---

## 功能

- **传说阿尔宙斯**：大量出现种子检查、单只生成、多只生成、时空扭曲、设置
- **晶灿钻石 / 明亮珍珠**：地下大洞窟、定点、野生、游荡、蛋、训练家 ID
- **剑 / 盾**：机器鹕 / 抽奖、大地图检查
- **第三世代（RSE）**：定点、野生
- 种子栏「导入」按钮：一键读取 PokeLDN 插件刚算出的最新种子（见下文「相关项目」）
- 结果筛选：闪光 / 性别 / 个体值 / 性格 /「仅多闪路径」等
- 内置图文使用说明：导航栏和页脚的「使用说明」，含导出存档、研究等级设置、结果卡片解读、路径走法、中英术语对照

界面用页面顶部左侧的菜单切换世代。

---

## 相关项目

| 项目 | 说明 |
|---|---|
| [PokeLDN](https://github.com/Decryptu/pokeldn) | 电脑端的联机工具（Windows / macOS / Linux，另有 Android、iOS 版）：用一块 ESP32 板当无线电台，走 Switch 的本地联机（LDN / Pia）跟正版游戏交换宝可梦、收发神秘礼物、开团体战。**不需要破解主机**，Switch 上什么都不用装，只要一份 `prod.keys`；支持插件（`.pokeplugin`） |
| [PokeLDN 简体中文语言包](https://github.com/easyworld/pokeldn/tree/codex/zh-hans-pack) | 第三方语言插件 `community-zh-hans`：把 PokeLDN 的界面文案、工具说明和文档翻成简体中文。从 Release 下载 `.pokeplugin`，在 Plugins 页安装，再到 Settings → App language 选「简体中文」并重启 |
| [PLA MMO Seed Finder](https://github.com/Yuutalin/PLA-MMO-Seed-Finder) | PokeLDN 的插件（ID `junli-pla-mmo-seed`）：凑齐同一 MMO 群体四只「最初捕获」宝可梦的交换确认记录后，调用 EtumrepMMO 反推群体 Seed。算完把种子写到 `%APPDATA%\pokeldn\plugin-data\junli-pla-mmo-seed\latest_seed.txt`——本工具的「导入」按钮读的就是这个文件 |

典型流程：电脑装好 PokeLDN（可以再装中文语言包）→ 在 Plugins 页装 MMO 种子插件、备好 EtumrepMMO（需 .NET 8 与 VC++ 运行库）→ Switch 上开游戏，跟电脑配对采集四只的记录 → 插件算出群体 Seed → 打开本工具点「导入」，直接开始筛选。

---

## 致谢

- 本工具由 **Lovely** 打包修改，原作者 **Cappy**
- 感谢 **Anubis、Kurt、Lincoln、Zyro 与 Santacrab420** 提供的代码与其他帮助
- 原项目 [pla-multi-checker-web](https://github.com/capitalism-sudo/pla-multi-checker)，作者 [capitalism-sudo](https://github.com/capitalism-sudo)（时空扭曲脚本）与 [Lincoln-LM](https://github.com/Lincoln-LM)（PyNXReader、PLA-Live-Map）
- PyNXReader 是 [wwwwwwzx](https://github.com/wwwwwwzx) 的 PyNXBot 的 fork
- [olliz0r](https://github.com/olliz0r) 的 [sys-botbase](https://github.com/olliz0r/sys-botbase)：在 Switch 上开 socket
- [spacemeowx2](https://github.com/spacemeowx2) 的 [ldn_mitm](https://github.com/spacemeowx2/ldn_mitm)：避免开游戏后掉 Wi-Fi

---

## 免责声明

本工具只做本地种子计算与数据展示，不修改游戏存档、不参与联机。
使用第三方插件 / 修改主机的风险由使用者自行承担，作者不对主机损坏、封号等后果负责。请自行确认所在地区的相关法律法规。

## 许可证

沿用原项目 [LICENSE](LICENSE)，二次分发请保留原作者署名与许可声明。
