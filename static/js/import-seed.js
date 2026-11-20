// 「导入」按钮：读取 pokeldn 的 junli-pla-mmo-seed 插件写下的最新种子，填进种子栏。
// 页面本身在浏览器/WebView 里没有读本地文件的能力，所以走本地服务的 /api/latest-seed。

const DEFAULT_SEED_INPUT_ID = 'inputseed';

function formatSeedAge(mtimeSeconds) {
  if (!mtimeSeconds) return '';
  const seconds = Math.max(0, Date.now() / 1000 - mtimeSeconds);
  if (seconds < 90) return '刚刚';
  if (seconds < 3600) return Math.round(seconds / 60) + ' 分钟前';
  if (seconds < 86400) return Math.round(seconds / 3600) + ' 小时前';
  return Math.round(seconds / 86400) + ' 天前';
}

async function importLatestSeed(button) {
  const input = document.getElementById(button.dataset.target || DEFAULT_SEED_INPUT_ID);
  if (!input) return;

  const original = button.textContent;
  button.disabled = true;
  button.textContent = '读取中…';

  try {
    const response = await fetch('/api/latest-seed', { cache: 'no-store' });
    const data = await response.json();
    if (data.error) throw new Error(data.error);

    // 种子可能超过 2^53，按字符串写进 value 才不会丢精度
    input.value = String(data.seed);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    const age = formatSeedAge(data.mtime);
    button.textContent = age ? '已导入（' + age + '）' : '已导入';
  } catch (error) {
    button.textContent = '导入失败';
    window.alert(error && error.message ? error.message : String(error));
  } finally {
    setTimeout(() => {
      button.textContent = original;
      button.disabled = false;
    }, 1800);
  }
}

document.querySelectorAll('[data-import-seed]').forEach((button) => {
  button.addEventListener('click', () => importLatestSeed(button));
});
