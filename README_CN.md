# RNG 查闪工具 · 中文版源码（v1.1.4）

本仓库基于开源项目 [pla-multi-checker-web](https://github.com/capitalism-sudo/pla-multi-checker) 汉化并打包修改。

- 本工具由 **Lovely** 打包修改，原作者 **Cappy**
- 感谢 **Anubis、Kurt、Lincoln、Zyro 与 Santacrab420** 提供的代码与其他帮助

相对原版的改动：全界面汉化、程序内「使用说明」图文教程、种子栏「导入」按钮（读 pokeldn 插件的最新种子）、
「仅多闪路径」筛选修复、奖励轮未选宝可梦时的中文提示、打包成免安装单文件 exe。

<br>

# 安装 numba_pokemon_prngs
#### 通过命令安装：
**gitee 用户**
在 CMD 中输入 `pip install "numba-pokemon-prngs[numba] @ git+https://gitee.com/fifamvp/numba_pokemon_prngs"`

<br>

# 如何运行（源码方式）
1. 安装依赖项：`pip install -r requirements.txt`
2. 复制 `config.template.json` 并重命名为 `config.json`
3. 编辑其中的 `IP` 一栏为你的 Switch 的 IP 地址（只用种子计算的话改成 `SeedCheckOnly: true` 即可，不需要连 Switch）
4. 在仓库根目录运行：`python run.py`
5. 浏览器打开 `http://127.0.0.1:8200/`
6. 先点「设置」填研究等级，再去「传说阿尔宙斯」的各个页面计算

> 入口说明：旧版的 `main.py` 是上游遗留文件，内部是相对导入，直接运行会报错；`运行.bat`
> 依赖文件夹名，遇到带横杠的目录也会失败。请用 `run.py`，它把当前目录当包加载，跟目录名无关。

需要的 Python 版本、WebView2 等运行环境，见仓库里的 [`使用说明`](static/docs/guide.html) 或程序内导航栏的「使用说明」。

<br>

# 刷闪演示 / 教程
- 传阿教程：https://www.bilibili.com/video/BV1X7xszMEUz
- 刷闪流程演示：https://www.bilibili.com/video/BV1CsNceVE5B/
- 梦妖惊吓同消演示：https://www.bilibili.com/video/BV1Lu9vYAEVE/

[![刷闪](./misc/video01.png)](https://www.bilibili.com/video/BV1CsNceVE5B/)

<br>

# 许可证
沿用原项目 [LICENSE](LICENSE)，二次分发请保留原作者署名与许可声明。
