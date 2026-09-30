from pathlib import Path
import json
import os
import shutil
import tempfile
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / 'examples/heap-memory'
OUT = ROOT / 'tmp/browser-checks'
OUT.mkdir(parents=True, exist_ok=True)
CHROME = os.environ.get('CHROMIUM_PATH')
URL = (TEMPLATE / 'index.html').as_uri()
checks = []

def check(name, condition):
    checks.append({'name': name, 'passed': bool(condition)})
    assert condition, name

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME, headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width':1980, 'height':1020})
    errors = []
    failed_files = []
    page.on('requestfailed', lambda request: failed_files.append(request.url) if request.url.startswith('file:') else None)
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(URL)
    page.wait_for_timeout(600)
    check('No autoplay on entry', page.evaluate('lessonPresenter.snapshot.position === 0 && !lessonPresenter.snapshot.running'))
    page.keyboard.press('ArrowRight')
    page.wait_for_timeout(70)
    check('Right begins one cue', page.evaluate('lessonPresenter.snapshot.running && lessonPresenter.snapshot.position === 0'))
    page.keyboard.press('ArrowRight')
    check('Right during motion finishes just that cue', page.evaluate('lessonPresenter.snapshot.position === 1 && !lessonPresenter.snapshot.running && lessonPresenter.snapshot.page === 0'))
    page.wait_for_timeout(700)
    check('Completed cue stays stopped', page.evaluate('lessonPresenter.snapshot.position === 1 && !lessonPresenter.snapshot.running'))
    page.keyboard.press('ArrowLeft')
    check('Left rewinds one cue', page.evaluate('lessonPresenter.snapshot.position === 0'))
    page.keyboard.press('ArrowRight')
    page.wait_for_timeout(600)
    check('Natural completion stops after one cue', page.evaluate('lessonPresenter.snapshot.position === 1 && !lessonPresenter.snapshot.running'))
    page.keyboard.press('p')
    page.wait_for_timeout(60)
    page.keyboard.press('n')
    check('Opening notes pauses motion', page.evaluate('!lessonPresenter.snapshot.running && !document.querySelector("#speaker-notes").hidden'))
    page.keyboard.press('n')
    page.keyboard.press('r')
    page.evaluate('lessonPresenter.showSlide(2)')
    page.keyboard.press('ArrowRight')
    page.wait_for_timeout(400)
    check('Target outline stays hidden while arrow grows', page.evaluate('Number(document.querySelector("#mem-arrow").dataset.progress) > 0 && Number(document.querySelector("#mem-arrow").dataset.progress) < 1 && Number(document.querySelector("#mem-focus").dataset.progress) === 0'))
    page.wait_for_timeout(700)
    check('Target outline completes after arrow arrives', page.evaluate('Number(document.querySelector("#mem-arrow").dataset.progress) === 1 && Number(document.querySelector("#mem-focus").dataset.progress) === 1'))
    page.evaluate('lessonPresenter.showSlide(3)')
    page.keyboard.press('ArrowRight')
    page.wait_for_timeout(1250)
    check('One action draws the full fd cycle only', page.evaluate('[...document.querySelectorAll("[data-cycle=fd]")].every(p => Number(p.dataset.progress) === 1) && [...document.querySelectorAll("[data-cycle=bk]")].every(p => Number(p.dataset.progress) === 0) && !lessonPresenter.snapshot.running'))
    page.keyboard.press('ArrowRight')
    page.wait_for_timeout(1250)
    check('Second action draws the full dashed bk cycle', page.evaluate('[...document.querySelectorAll("[data-cycle=bk]")].every(p => Number(p.dataset.progress) === 1 && getComputedStyle(p).strokeDasharray !== "none")'))
    page.keyboard.press('ArrowLeft')
    check('Left rewinds an entire cycle', page.evaluate('[...document.querySelectorAll("[data-cycle=bk]")].every(p => Number(p.dataset.progress) === 0) && [...document.querySelectorAll("[data-cycle=fd]")].every(p => Number(p.dataset.progress) === 1)'))
    page.keyboard.press('ArrowRight')
    page.evaluate('lessonPresenter.showSlide(0)')
    page.wait_for_timeout(1200)
    check('Leaving a page cancels the old animation', page.evaluate('lessonPresenter.snapshot.page === 0 && lessonPresenter.snapshot.position === 0 && !lessonPresenter.snapshot.running'))
    page.emulate_media(reduced_motion='reduce')
    page.keyboard.press('ArrowRight')
    check('Reduced motion advances one complete cue', page.evaluate('lessonPresenter.snapshot.position === 1 && !lessonPresenter.snapshot.running'))
    page.evaluate('lessonPresenter.showSlide(0, 6)')
    stack_values = page.locator('[data-slot] text').all_text_contents()
    check('Pop C, push D and E preserves stack order', stack_values == ['A','B','D','E'])
    for width, height in [(1980,1020),(1440,900),(844,390),(390,844)]:
        page.set_viewport_size({'width':width,'height':height})
        for i, slide in enumerate(['structure','state','reference','cycle','mapping']):
            page.evaluate('(i) => {lessonPresenter.showSlide(i, i === 0 ? 6 : 0); if (i !== 0) lessonPresenter.motion.finish();}',i)
            geometry = page.evaluate('''() => {
                const stage = document.querySelector('#stage').getBoundingClientRect();
                const controls = document.querySelector('.controls').getBoundingClientRect();
                const root = document.documentElement;
                return {horizontal:root.scrollWidth <= innerWidth+1,
                    vertical:root.scrollHeight <= innerHeight+1,
                    controls:controls.left >= -1 && controls.right <= innerWidth+1,
                    separated:stage.bottom <= controls.top+1};
            }''')
            check(f'{width} {slide}: no page horizontal overflow', geometry['horizontal'])
            check(f'{width} {slide}: controls fit',geometry['controls'])
            if width > 850:
                check(f'{width} {slide}: recording fits vertically',geometry['vertical'])
                check(f'{width} {slide}: controls outside diagram',geometry['separated'])
            if width in [1980,390]:
                page.screenshot(path=str(OUT/f'{slide}-{width}.png'),full_page=True)
    page.goto(URL+'?step=3&cue=1')
    check('Deep link restores completed cue without autoplay', page.evaluate('lessonPresenter.snapshot.slide === "cycle" && lessonPresenter.snapshot.position === 1 && !lessonPresenter.snapshot.running'))
    page.reload()
    check('Reload keeps the stopped cue',page.evaluate('lessonPresenter.snapshot.slide === "cycle" && lessonPresenter.snapshot.position === 1 && !lessonPresenter.snapshot.running'))
    page.evaluate('lessonPresenter.showSlide(0)')
    page.locator('#next').focus()
    page.keyboard.press('Space')
    check('Space on focused button advances only once',page.evaluate('lessonPresenter.snapshot.position === 1'))
    page.evaluate('document.activeElement.blur()')
    page.keyboard.press('Shift+ArrowRight')
    check('Modified arrow does not advance',page.evaluate('lessonPresenter.snapshot.position === 1'))
    page.evaluate('''() => { const input = document.createElement('input');
        input.id='test-editable'; document.body.append(input); input.focus(); }''')
    page.keyboard.press('ArrowRight')
    check('Editing a text field does not advance',page.evaluate('lessonPresenter.snapshot.position === 1'))
    page.evaluate('document.querySelector("#test-editable").remove()')
    page.evaluate('lessonPresenter.showSlide(1)')
    page.keyboard.press('ArrowRight')
    check('State changes before any reference appears',page.evaluate('document.querySelector("#state-label").textContent === "再利用待ち" && Number(document.querySelector("#state-arrow").dataset.progress) === 0'))
    page.keyboard.press('ArrowRight')
    check('Next action shows the reference',page.evaluate('Number(document.querySelector("#state-arrow").dataset.progress) === 1'))
    page.keyboard.press('ArrowLeft')
    page.keyboard.press('ArrowLeft')
    page.keyboard.press('ArrowLeft')
    check('Back from initial state opens previous slide completed',page.evaluate('lessonPresenter.snapshot.page === 0 && lessonPresenter.snapshot.completed'))
    check('No JavaScript errors', not errors)
    check('No local asset loading failures', not failed_files)
    page.goto((ROOT/'templates/html-lesson/index.html').as_uri())
    check('Starter waits initially',page.evaluate('lessonPresenter.snapshot.page === 0 && lessonPresenter.snapshot.position === 0 && !lessonPresenter.snapshot.running'))
    check('Starter keeps the dark palette',page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--gold').trim() === '#E3B968'"))
    page.keyboard.press('ArrowRight')
    page.keyboard.press('ArrowRight')
    check('Starter advances to next page after its cue',page.evaluate('lessonPresenter.snapshot.page === 1 && lessonPresenter.snapshot.position === 0'))
    page.keyboard.press('ArrowRight')
    check('Starter changes state before reference',page.evaluate('document.querySelector("#state-label").textContent === "更新後" && Number(document.querySelector("#state-arrow").dataset.progress) === 0'))
    page.keyboard.press('ArrowRight')
    check('Starter then shows the reference',page.evaluate('Number(document.querySelector("#state-arrow").dataset.progress) === 1'))
    for theme in ['midnight-dark','classic-light']:
        page.evaluate('(t) => document.documentElement.dataset.theme=t',theme)
        for width, height in [(1980,1020),(1440,900),(844,390),(390,844)]:
            page.set_viewport_size({'width':width,'height':height})
            for i in range(2):
                page.evaluate('(i) => {lessonPresenter.showSlide(i);lessonPresenter.motion.finish()}',i)
                check(f'Starter {theme} {width} page {i}: fits',page.evaluate('document.documentElement.scrollWidth <= innerWidth+1 && document.querySelector(".controls").getBoundingClientRect().right <= innerWidth+1'))
                if width > 850:
                    check(f'Starter {theme} {width} page {i}: recording fits',page.evaluate('document.documentElement.scrollHeight <= innerHeight+1 && document.querySelector("#stage").getBoundingClientRect().bottom <= document.querySelector(".controls").getBoundingClientRect().top+1'))
                if width in [1980,390]:
                    page.screenshot(path=str(OUT/f'starter-{theme}-{width}-{i}.png'),full_page=True)
    # Verify the documented copy operation with a fresh folder and relative assets.
    with tempfile.TemporaryDirectory(prefix='lesson-copy-') as copied:
        copy_root=Path(copied)
        shutil.copytree(ROOT/'shared',copy_root/'shared')
        shutil.copytree(ROOT/'templates/html-lesson',copy_root/'lessons/my-lesson')
        page.goto((copy_root/'lessons/my-lesson/index.html').as_uri()+'?step=1&cue=1')
        check('Copied lesson restores numeric step/cue with relative shared assets',page.evaluate('lessonPresenter.snapshot.page === 1 && lessonPresenter.snapshot.position === 1 && !lessonPresenter.snapshot.running'))
        page.keyboard.press('ArrowRight')
        check('Copied lesson remains interactive',page.evaluate('lessonPresenter.snapshot.completed'))
    # No network is needed for these pages. The original example uses optional MathJax.
    page.route('https://**/*',lambda route: route.abort())
    page.goto((ROOT/'examples/key-exchange-basics/index.html').as_uri()+'?step=1')
    check('Original key exchange example keeps URL navigation',page.locator('#title').inner_text()=='公開値を交換する')
    page.keyboard.press('ArrowLeft')
    check('Original key exchange example keeps previous navigation',page.locator('#title').inner_text()=='共通の出発点')
    check('Original example stays classic-light',page.evaluate("document.documentElement.dataset.theme === 'classic-light' && getComputedStyle(document.documentElement).getPropertyValue('--paper').trim() === '#efedeb'"))
    check('All pages remain free of JavaScript errors',not errors)
    check('All local assets loaded',not failed_files)
    browser.close()

(OUT/'verification.json').write_text(json.dumps({'checks':checks,'total':len(checks)},ensure_ascii=False,indent=2)+'\n')
print(f'{len(checks)} checks passed')
