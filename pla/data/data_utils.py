import json
from ..filters import *
from ...bdsp.filters import *

filter_commands = {
    "is_shiny": is_shiny,
    "is_square": is_square,
    "is_alpha": is_alpha,
    "is_perfect": is_perfect,
    "has_5ivs": has_5ivs,
    "is_square_shiny": is_square_shiny,
    "no_attack": no_attack,
    "has_no_attack_5iv": has_no_attack_5iv,
    "has_6iv_over_30": has_6iv_over_30,
    "has_5iv_over_30": has_5iv_over_30,
    "has_no_attack_5iv_over_30": has_no_attack_5iv_over_30,
    "no_speed": no_speed,
    "has_no_speed_5iv_over_30": has_no_speed_5iv_over_30,
    "has_no_speed_5iv": has_no_speed_5iv,
    "has_no_speed_no_attack_4iv_over_30": has_no_speed_no_attack_4iv_over_30,
    "has_no_speed_no_attack_4iv": has_no_speed_no_attack_4iv,
    "has_no_speed_no_attack": has_no_speed_no_attack,
    "has_3ivs": has_3ivs,
    "has_4ivs": has_4ivs,
    "has_1ivs": has_1ivs,
    "has_2ivs": has_2ivs,
    "has_2iv_over_30": has_2iv_over_30,
    "has_3iv_over_30": has_3iv_over_30,
    "has_4iv_over_30": has_4iv_over_30,
    "is_rare": is_rare,
    "no_filter": no_filter
}

# These are utility functions for understanding PLA data that are not generally used in the app
map_names = ['AlabasterIcelands', 'CobaltCoastlands', 'CoronetHighlands', 'CrimsonMirelands', 'ObsidianFieldlands']

def encounter_names(map_name):
    """Get a set of all the pokemon that are encountered on the map"""
    m1 = json.load(open(f'static/resources/{map_name}.json'))
    m2 = [m.values() for m in m1.values()]
    m3 = [b.keys() for a in m2 for b in a]
    m4 = [b for a in m3 for b in a]
    return set(m4)

def all_encounter_names():
    """Get a set of all the pokemon encountered on all maps"""
    res = set()
    for m in map_names:
        res.update(encounter_names(m))
    return res

def all_mmo_pokemon():
    """Get a set all pokemon that are enountered in mmos"""
    mmo = json.load(open(f'static/resources/mmo_es.json'))
    return set([m['name'] for b in mmo.values() for m in b])

# functions for manipulating data returned by search functions

# 结果里的路径描述原来是英文（First Round Path / Bonus Path / Initial Spawn ...），
# 这里在输出前统一换成中文。顺序有讲究：
#   「First Round Path:」「Bonus Path:」必须排在「Path:」前面，
#   「Bonus Initial Spawn 」必须排在「Initial Spawn 」前面，
#   带冒号的长串必须排在「Bonus 」前面。
# 这些字符串在计算过程中被当作 key 解析，所以只能在 calc 完成后的出口处替换。
PATH_TEXT_REPLACEMENTS = (
    ("First Round Path: ", "第一轮路径："),
    ("Bonus Path: ", "奖励路径："),
    ("Bonus Initial Spawn ", "奖励初始生成 "),
    ("Initial Spawn ", "初始生成 "),
    ("Path: ", "路径："),
    ("First Round ", "第一轮 "),
    ("Bonus ", "奖励 "),
    ("[Clear Round]", "[清空轮]"),
    ("Revisit ", "重访 "),
)


def localize_path_text(text):
    """把路径描述里的英文片段换成中文，非字符串原样返回。"""
    if not isinstance(text, str):
        return text
    for src, dst in PATH_TEXT_REPLACEMENTS:
        text = text.replace(src, dst)
    return text


def localize_mmo_result(result):
    """浅拷贝结果并把 index / chains / dupes 里的路径文本汉化。"""
    if not isinstance(result, dict):
        return result
    res = dict(result)
    if isinstance(res.get('index'), str):
        res['index'] = localize_path_text(res['index'])
    for field in ('chains', 'dupes'):
        if isinstance(res.get(field), list):
            res[field] = [localize_path_text(v) for v in res[field]]
    return res


def flatten_all_mmo_results(results, filter_results=True, filter_function=is_shiny):
    res = []

    for map_results in results.values():
        res.extend(flatten_map_mmo_results(map_results, filter_results, filter_function))

    return res

def flatten_map_mmo_results(results, filter_results=True, filter_function=is_shiny):
    res = []

    for key, round in results.items():
        if key[-5:] == "bonus":
            res.extend(flatten_bonusround(round, filter_results, filter_function))
        else:
            res.extend(flatten_firstround(round, filter_results, filter_function))

    return res

def flatten_normal_outbreaks(results, filter_results=True, filter_function=is_shiny):
    # It's not a bonus round, but seems to have the same shape as one
    return flatten_bonusround(results, filter_results, filter_function)

def flatten_firstround(round, filter_results, filter_function):
    if filter_results:
        return [localize_mmo_result(p) for p in round.values() if filter_function(p)]
    else:
        return [localize_mmo_result(p) for p in round.values()]

def flatten_bonusround(round, filter_results, filter_function):
    if filter_results:
        return [localize_mmo_result(p) for b in round.values() for p in b.values() if filter_function(p)]
    else:
        return [localize_mmo_result(p) for b in round.values() for p in b.values()]

def flatten_multi(results, filter_results=True, filter_function=is_shiny):
    if filter_results:
        return list(filter(filter_function, results))
    else:
        return results

def flatten_overworld(results, filter_results=True, filter_function=is_shiny):

    res = []

    for result in results.values():
        res.extend(flatten_overworld_advance(result, filter_results, filter_function))

    return res

def flatten_overworld_advance(results, filter_results, filter_function):


    return [results]