# -*- coding: utf-8 -*-
"""源码方式启动（不用打包 exe 时用这个）。

    python run.py

特点：不管仓库文件夹叫什么名字，都能把本目录当成包 ``plachecker`` 加载，
所以不需要重命名文件夹、也不用 `python -m 文件夹名.main`（那种写法遇到
带横杠的目录名会直接报错）。启动后浏览器打开 http://127.0.0.1:8200/
"""

import importlib.util
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PACKAGE_NAME = 'plachecker'
HOST = os.environ.get('HOST', '127.0.0.1')
PORT = int(os.environ.get('PORT', '8200'))


def load_package():
    """按路径加载本目录为包，包名固定 plachecker（内部到处是相对导入）。"""
    init = os.path.join(HERE, '__init__.py')
    if not os.path.isfile(init):
        raise SystemExit('找不到 %s，请把 run.py 放在源码根目录' % init)
    spec = importlib.util.spec_from_file_location(
        PACKAGE_NAME, init, submodule_search_locations=[HERE])
    module = importlib.util.module_from_spec(spec)
    sys.modules[PACKAGE_NAME] = module
    spec.loader.exec_module(module)
    return module


def main():
    package = load_package()
    print('已启动，浏览器打开：http://%s:%d/' % (HOST, PORT))
    package.app.run(host=HOST, port=PORT, debug=False, use_reloader=False, threaded=True)


if __name__ == '__main__':
    main()
