from enum import Enum
import json, os, sys


class AppMode(Enum):
    WEB = "WEB"
    LOCAL = "LOCAL"
    DEV = "DEV"


_PACKAGE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)
_LOCAL_ROOT = _PACKAGE_DIR + os.sep


def _find_config():
    """优先读取 exe 同目录的 config.json，方便用户自行改 IP / 模式。"""
    candidates = []
    if getattr(sys, 'frozen', False):
        candidates.append(os.path.join(os.path.dirname(os.path.abspath(sys.executable)), 'config.json'))
    candidates.append(os.path.join(_PACKAGE_DIR, 'config.json'))
    for path in candidates:
        if os.path.isfile(path):
            return path
    return candidates[-1]


_config_path = _find_config()

config = json.load(open(_config_path, encoding='utf-8-sig'))

if 'APP_MODE' not in config:
    print("警告：config.json 中没有 APP_MODE")


_root = {
    AppMode.WEB: config['WEB_PATH'] + 'pla-multi-checker-web-fix/',
    AppMode.LOCAL: _LOCAL_ROOT,
    AppMode.DEV: _LOCAL_ROOT,
}


APP_MODE = AppMode(config.get('APP_MODE', 'LOCAL'))
ROOT_PATH = _root[APP_MODE]

# 打包环境下 ROOT_PATH 指向包目录；万一 static 不在那儿，退回包根
if not os.path.isdir(ROOT_PATH + 'static'):
    ROOT_PATH = _LOCAL_ROOT

RESOURCE_PATH = ROOT_PATH + 'static/'
