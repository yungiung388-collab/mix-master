from playwright.sync_api import sync_playwright, expect
import json, os, pathlib, re, shutil, sys, tempfile, traceback
from urllib.parse import urljoin

BASE_URL = os.environ.get('MIX_MASTER_URL', 'http://127.0.0.1:5173')
ARTIFACT_DIR = pathlib.Path(os.environ.get('MIX_MASTER_ARTIFACT_DIR') or tempfile.mkdtemp(prefix='mix-master-qa-'))
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
CHROMIUM = os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium') or shutil.which('google-chrome')

results=[]
errors=[]
expected_cancellations=[]
status_responses=[]
STATUS_URL=urljoin(BASE_URL, '/api/status')

def ok(name, detail=''):
    results.append({'name':name, 'status':'pass','detail':detail})

def record_request_failure(request, context):
    # StrictMode cleans up its first effect by cancelling this status fetch; reload also
    # cancels outstanding work. Keep this exact lifecycle cancellation separate from failures.
    entry={'context':context, 'url':request.url, 'failure':request.failure}
    if request.url == STATUS_URL and request.failure == 'net::ERR_ABORTED':
        expected_cancellations.append(entry)
    else:
        errors.append({'type':f'{context}-requestfailed', 'message':request.url+' '+str(request.failure)})

def record_response(response, context):
    if response.status >= 400:
        errors.append({'type':f'{context}-http', 'message':str(response.status)+' '+response.url})
    if response.url == STATUS_URL and response.status == 200:
        try:
            payload=response.json()
            assert isinstance(payload.get('aiConfigured'), bool), payload
            status_responses.append({'context':context, 'status':response.status, 'payload':payload})
        except Exception as error:
            errors.append({'type':f'{context}-status', 'message':str(error)})

def assert_chat_status(page, context):
    state=page.locator('.chat-connection-status')
    # Wait for the app to consume the status JSON before checking the response observer.
    expect(state).to_contain_text(re.compile(r'현재 설정 기반 기본 가이드|AI 분석 요청 모드'))
    responses=[entry for entry in status_responses if entry['context'] == context]
    assert responses, f'{context} did not receive a valid 200 status JSON response'
    status=responses[-1]['payload']
    if status['aiConfigured']:
        expect(state).to_contain_text('AI 분석 요청 모드')
        expect(page.locator('.chat-local-notice')).to_have_count(0)
    else:
        expect(state).to_contain_text('현재 설정 기반 기본 가이드')
        expect(page.locator('.chat-local-notice')).to_contain_text('AI가 연결되지 않아 사진은 아직 분석할 수 없습니다.')
    assert '확인 중' not in state.inner_text()
    assert '확인 필요' not in state.inner_text()
    ok(f'{context} status response and completed chat connection state', {'aiConfigured':status['aiConfigured']})

def assert_overflow(page, name):
    x=page.evaluate('({scroll:document.documentElement.scrollWidth, viewport:window.innerWidth})')
    assert x['scroll']<=x['viewport'], x
    ok(name, x)

def generate(page):
    page.get_by_role('button',name='믹스 · 마스터 세팅 생성',exact=True).click()
    expect(page.get_by_role('button',name='믹스 · 마스터 세팅 생성',exact=True)).to_be_enabled()
    expect(page.locator('.result-status')).to_have_text('READY')

def section_steps(recipe, section='vocal'):
    return next(item['steps'] for item in recipe['sections'] if item['id'] == section)

def plugin_step(recipe, plugin):
    matches = [step for step in section_steps(recipe) if step['plugin'] == plugin]
    assert len(matches) == 1, f'Expected one {plugin} step: {[step["plugin"] for step in section_steps(recipe)]}'
    return matches[0]

def parameter_value(step, name):
    matches = [param['value'] for param in step['params'] if param['name'] == name]
    assert len(matches) == 1, f'Expected one {name} parameter in {step["plugin"]}: {step["params"]}'
    return matches[0]

def exported(page, fmt):
    page.get_by_role('button',name='내보내기',exact=True).click()
    name='JSON 파일 (.json)' if fmt=='json' else '텍스트 파일 (.txt)'
    with page.expect_download() as pending:
        page.get_by_role('button',name=name,exact=True).click()
    download=pending.value
    path=ARTIFACT_DIR / f'mix-master-settings.{fmt}'
    download.save_as(path)
    return pathlib.Path(path).read_text()

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=CHROMIUM,args=['--no-sandbox'],headless=True)
    context=browser.new_context(viewport={'width':1440,'height':1000},accept_downloads=True,permissions=['clipboard-read','clipboard-write'])
    page=context.new_page()
    page.set_default_timeout(5000)
    page.on('pageerror',lambda e: errors.append({'type':'pageerror','message':str(e)}))
    page.on('console',lambda m: errors.append({'type':'console','message':m.text}) if m.type=='error' else None)
    page.on('requestfailed',lambda r: record_request_failure(r, 'desktop'))
    page.on('response',lambda r: record_response(r, 'desktop'))
    try:
        page.goto(BASE_URL,wait_until='networkidle')
        assert_chat_status(page, 'desktop')
        expect(page.get_by_role('heading',name='어떤 곡인가요?')).to_be_visible()
        page.screenshot(path=str(ARTIFACT_DIR / 'desktop.png'),full_page=True)
        assert_overflow(page,'Desktop initial horizontal overflow')
        ok('Desktop initial render')
        expect(page.locator('#formant-mode')).to_have_value('off')
        expect(page.locator('#use-microshift')).to_be_checked()
        expect(page.locator('#use-kilohearts')).to_be_checked()
        ok('Additional vocal tools use formant off and enabled sends by default')
        page.locator('#song-title').fill('브라우저 QA 120')
        page.locator('#song-bpm').fill('120')
        page.locator('#song-key').select_option('C#')
        page.locator('#song-scale').select_option('major')
        page.locator('#song-gender').select_option('male')
        page.locator('#song-range').select_option('low')
        page.locator('#song-intensity').select_option('natural')
        page.locator('#song-target').select_option('dynamic')
        page.get_by_role('button',name='팝',exact=True).click()
        page.get_by_role('button',name='가사 추가',exact=False).click()
        lyrics='한글가사를빠르게밀도있게부르는노래입니다여기서더길게노래합니다\n다른한글가사를빠르게밀도있게부르는노래입니다더길게부릅니다'
        page.locator('#song-lyrics').fill(lyrics)
        expect(page.locator('.result-status')).to_have_text('입력 변경됨')
        page.get_by_role('button',name='세션 저장',exact=True).click()
        expect(page.get_by_role('alert')).to_contain_text('먼저 생성')
        ok('Dirty input reflected and saving stale recipe guarded')
        generate(page)
        expect(page.locator('.recipe-overview h3')).to_have_text('브라우저 QA 120')
        expect(page.locator('.recipe-metrics').first).to_contain_text('-16')
        expect(page.locator('.timing-values')).to_contain_text('500')
        timing=page.locator('.timing-values strong').all_text_contents()
        assert timing==['500 ms','250 ms','375 ms','125 ms'],timing
        expect(page.locator('.step-card').first).to_contain_text('C#')
        expect(page.locator('.step-card').first).to_contain_text('Major')
        ok('Generation updates key scale BPM male range intensity and dynamic target',{'timing':timing,'target':-16})
        page.locator('.analysis-panel > button').click()
        expect(page.locator('.analysis-panel')).to_contain_text('20%')
        expect(page.locator('.analysis-panel')).to_contain_text('2개 행')
        ok('Dense Korean lyrics influence settings')
        page.get_by_role('tab',name='마스터링',exact=False).click()
        expect(page.get_by_role('tabpanel')).to_contain_text('Ozone 12 Maximizer')
        page.get_by_role('tab',name='RX 정리',exact=False).click()
        expect(page.get_by_role('tabpanel')).to_contain_text('RX 11 Voice De-noise')
        page.get_by_role('tab',name='보컬 체인',exact=False).click()
        page.get_by_role('tab',name='보컬 체인',exact=False).press('ArrowRight')
        expect(page.get_by_role('tab',name='믹스 버스',exact=False)).to_have_attribute('aria-selected','true')
        page.get_by_role('tab',name='믹스 버스',exact=False).press('End')
        expect(page.get_by_role('tab',name='RX 정리',exact=False)).to_have_attribute('aria-selected','true')
        ok('Master/repair tabs and keyboard navigation')
        page.get_by_role('button',name='전체 세팅 복사',exact=True).click()
        expect(page.get_by_role('status')).to_contain_text('클립보드에 복사')
        clipboard=page.evaluate('navigator.clipboard.readText()')
        assert '# 브라우저 QA 120' in clipboard
        assert '박자 시간: 1/4 500 ms' in clipboard
        ok('Clipboard copies full generated recipe')
        data=json.loads(exported(page,'json'))
        assert data['input']['bpm']==120
        assert data['input']['lyrics']==lyrics
        assert data['targets']['lufs']==-16
        assert data['timing']=={'quarter':500,'eighth':250,'dottedEighth':375,'sixteenth':125}
        assert data['lyricAnalysis']['density']=='dense'
        assert data['input']['formantMode'] == 'off'
        assert data['input']['useMicroShift'] is True
        assert data['input']['useKilohearts'] is True
        default_plugins = [step['plugin'] for step in section_steps(data)]
        plugin_step(data, 'Auto-Tune Pro')
        assert 'MAutoPitch' not in default_plugins
        assert 'Soundtoys LittleAlterBoy' not in default_plugins
        plugin_step(data, 'Soundtoys MicroShift')
        assert default_plugins.count('kHs Filter') == 2
        ok('Default JSON preserves Auto-Tune, excludes formant processors and includes selected FX')
        text=exported(page,'txt')
        assert '# 브라우저 QA 120' in text and 'Ozone 12 Maximizer' in text and 'Cubase' in text
        ok('JSON and TXT downloads contain complete recipe')
        assert all(section['orderReason'] for section in data['sections'])
        assert all(section['orderReason'] in text for section in data['sections'])
        natural_ids = [step['id'] for step in section_steps(data)]
        assert natural_ids.index('vocal-eq') < natural_ids.index('vocal-compressor') < natural_ids.index('vocal-deesser')
        page.locator('#song-intensity').select_option('hard')
        generate(page)
        hard_recipe = json.loads(exported(page, 'json'))
        hard_ids = [step['id'] for step in section_steps(hard_recipe)]
        assert hard_ids.index('vocal-eq') < hard_ids.index('vocal-deesser') < hard_ids.index('vocal-compressor')
        assert section_steps(hard_recipe)[0]['plugin'] == 'Auto-Tune Pro'
        page.locator('#song-intensity').select_option('natural')
        generate(page)
        ok('Vocal order changes with processing style and exports the reason')
        page.get_by_role('button',name='세션 저장',exact=True).click()
        expect(page.get_by_role('status')).to_contain_text('저장했어요')
        page.reload(wait_until='networkidle')
        expect(page.locator('#song-title')).to_have_value('브라우저 QA 120')
        expect(page.get_by_role('button',name='저장된 세션 1개',exact=True)).to_be_visible()
        page.locator('#song-title').fill('Changed')
        page.get_by_role('button',name='저장된 세션 1개',exact=True).click()
        expect(page.get_by_role('dialog')).to_be_visible()
        page.get_by_role('dialog').get_by_role('button',name='브라우저 QA 120 팝',exact=False).click()
        expect(page.locator('#song-title')).to_have_value('브라우저 QA 120')
        expect(page.locator('.recipe-overview h3')).to_have_text('브라우저 QA 120')
        page.get_by_role('button',name='저장된 세션 1개',exact=True).click()
        page.get_by_role('button',name='브라우저 QA 120 세션 삭제',exact=True).click()
        expect(page.get_by_role('dialog')).to_contain_text('아직 저장된 세션이 없어요.')
        page.get_by_role('button',name='닫기',exact=True).click()
        page.reload(wait_until='networkidle')
        assert page.evaluate('JSON.parse(localStorage.getItem("mix-master:sessions:v1"))').__len__()==0
        ok('Save/reload/load/delete persists correctly')
        page.locator('#formant-engine').select_option('mautopitch')
        page.locator('#formant-mode').select_option('lower')
        generate(page)
        mauto_recipe = json.loads(exported(page, 'json'))
        mauto = plugin_step(mauto_recipe, 'MAutoPitch')
        plugin_step(mauto_recipe, 'Auto-Tune Pro')
        assert parameter_value(mauto, 'Depth') == 0
        assert parameter_value(mauto, 'Detune') == 0
        assert parameter_value(mauto, 'Formant shift') == -1
        assert 'Soundtoys LittleAlterBoy' not in [step['plugin'] for step in section_steps(mauto_recipe)]
        assert mauto_recipe['input']['formantEngine'] == 'mautopitch'
        assert mauto_recipe['input']['formantMode'] == 'lower'
        ok('MAutoPitch lower formant uses Depth 0 and preserves sole Auto-Tune pitch correction')
        page.locator('#formant-engine').select_option('littlealterboy')
        page.locator('#formant-mode').select_option('higher')
        generate(page)
        alter_recipe = json.loads(exported(page, 'json'))
        alterboy = plugin_step(alter_recipe, 'Soundtoys LittleAlterBoy')
        plugin_step(alter_recipe, 'Auto-Tune Pro')
        assert parameter_value(alterboy, 'Pitch') == 0
        assert parameter_value(alterboy, 'Formant') == 1
        assert 'MAutoPitch' not in [step['plugin'] for step in section_steps(alter_recipe)]
        assert alter_recipe['input']['formantEngine'] == 'littlealterboy'
        assert alter_recipe['input']['formantMode'] == 'higher'
        ok('LittleAlterBoy higher formant uses Pitch 0 without stacking MAutoPitch')
        page.locator('#formant-mode').select_option('off')
        page.locator('#use-microshift').uncheck()
        page.locator('#use-kilohearts').uncheck()
        generate(page)
        disabled_recipe = json.loads(exported(page, 'json'))
        disabled_plugins = [step['plugin'] for step in section_steps(disabled_recipe)]
        plugin_step(disabled_recipe, 'Auto-Tune Pro')
        assert disabled_recipe['input']['useMicroShift'] is False
        assert disabled_recipe['input']['useKilohearts'] is False
        for optional in ['MAutoPitch', 'Soundtoys LittleAlterBoy', 'Soundtoys MicroShift', 'kHs Filter']:
            assert optional not in disabled_plugins
        ok('Disabling optional FX and formant removes their modules from exported chain')
        page.locator('#use-microshift').check()
        generate(page)
        micro_recipe = json.loads(exported(page, 'json'))
        micro = plugin_step(micro_recipe, 'Soundtoys MicroShift')
        assert parameter_value(micro, 'Mix') == 100
        assert micro['routing']['kind'] == 'aux'
        assert 'kHs Filter' not in [step['plugin'] for step in section_steps(micro_recipe)]
        ok('MicroShift checkbox independently enables its FX Send')
        page.locator('#use-microshift').uncheck()
        page.locator('#use-kilohearts').check()
        generate(page)
        filters_recipe = json.loads(exported(page, 'json'))
        filters = [step for step in section_steps(filters_recipe) if step['plugin'] == 'kHs Filter']
        assert len(filters) == 2
        assert {step['id'] for step in filters} == {'vocal-reverb-filter', 'vocal-delay-filter'}
        assert all(parameter_value(step, 'Filter Type') == 'High Pass' for step in filters)
        assert 'Soundtoys MicroShift' not in [step['plugin'] for step in section_steps(filters_recipe)]
        ok('Kilohearts checkbox independently enables both FX Return filters')
        # Keep every optional tool selected to verify instrumental processing omits all of them.
        page.locator('#use-microshift').check()
        page.locator('#formant-mode').select_option('higher')
        page.locator('#song-gender').select_option('instrumental')
        expect(page.locator('#song-range')).to_be_disabled()
        for selector in ['#formant-engine', '#formant-mode', '#use-microshift', '#use-kilohearts']:
            expect(page.locator(selector)).to_be_disabled()
        generate(page)
        expect(page.get_by_role('tab',name='믹스 버스',exact=False)).to_have_attribute('aria-selected','true')
        page.get_by_role('tab',name='보컬 체인',exact=False).click()
        expect(page.get_by_role('tabpanel')).to_contain_text('악기곡은 보컬 체인 없이')
        instrument=json.loads(exported(page,'json'))
        assert len(next(s for s in instrument['sections'] if s['id']=='vocal')['steps'])==0
        assert len(next(s for s in instrument['sections'] if s['id']=='repair')['steps'])==1
        assert instrument['input']['formantMode'] == 'higher'
        assert instrument['input']['useMicroShift'] is True
        assert instrument['input']['useKilohearts'] is True
        all_instrument_plugins = [step['plugin'] for section in instrument['sections'] for step in section['steps']]
        for vocal_plugin in ['Auto-Tune Pro', 'MAutoPitch', 'Soundtoys LittleAlterBoy', 'Soundtoys MicroShift', 'kHs Filter']:
            assert vocal_plugin not in all_instrument_plugins
        ok('Instrumental selects mix, disables range, omits vocal processing')
        page.get_by_role('button',name='플러그인',exact=True).click()
        expect(page.get_by_role('heading',name='플러그인 라이브러리',exact=True)).to_be_visible()
        assert page.locator('.library-card').count()==9
        assert_overflow(page,'Desktop library horizontal overflow')
        page.get_by_role('button',name='사용 가이드',exact=True).click()
        expect(page.get_by_role('heading',name='Cubase에서 시작하기',exact=True)).to_be_visible()
        assert page.locator('.guide-card').count()==6
        assert_overflow(page,'Desktop guide horizontal overflow')
        ok('Desktop library and guide navigation')
        # Mobile starts fresh so the screenshot represents the default landing page.
        mobile_context=browser.new_context(viewport={'width':390,'height':844},accept_downloads=True,permissions=['clipboard-read','clipboard-write'])
        mobile=mobile_context.new_page()
        mobile.on('pageerror',lambda e: errors.append({'type':'mobile-pageerror','message':str(e)}))
        mobile.on('requestfailed',lambda r: record_request_failure(r, 'mobile'))
        mobile.on('response',lambda r: record_response(r, 'mobile'))
        mobile.on('console',lambda m: errors.append({'type':'mobile-console','message':m.text}) if m.type=='error' else None)
        mobile.goto(BASE_URL,wait_until='networkidle')
        assert_chat_status(mobile, 'mobile')
        mobile.screenshot(path=str(ARTIFACT_DIR / 'mobile.png'),full_page=True)
        assert_overflow(mobile,'Mobile initial horizontal overflow')
        for name,heading in [('플러그인','플러그인 라이브러리'),('사용 가이드','Cubase에서 시작하기')]:
            button=mobile.get_by_role('button',name=name,exact=True)
            expect(button).to_be_visible()
            button.click()
            expect(mobile.get_by_role('heading',name=heading,exact=True)).to_be_visible()
            assert_overflow(mobile,f'Mobile {name} horizontal overflow')
        mobile.get_by_role('button',name='워크스페이스',exact=True).click()
        mobile.locator('#song-bpm').fill('120')
        generate(mobile)
        assert mobile.locator('.timing-values strong').all_text_contents()==['500 ms','250 ms','375 ms','125 ms']
        for tab in ['마스터링','RX 정리','보컬 체인']:
            mobile.get_by_role('tab',name=tab,exact=False).click()
            expect(mobile.get_by_role('tab',name=tab,exact=False)).to_have_attribute('aria-selected','true')
        assert_overflow(mobile,'Mobile results horizontal overflow')
        mobile.get_by_role('button',name='세션 저장',exact=True).click()
        mobile.get_by_role('button',name='저장된 세션 1개',exact=True).click()
        expect(mobile.get_by_role('dialog')).to_be_visible()
        assert_overflow(mobile,'Mobile modal horizontal overflow')
        mobile.get_by_role('dialog').press('Escape')
        expect(mobile.get_by_role('dialog')).not_to_be_visible()
        ok('Mobile 390px navigation generation tabs session modal')
        assert not errors, errors
        ok('Browser JS, HTTP, network and console errors',errors)
    except Exception as exc:
        results.append({'name':'browser QA exception','status':'fail','detail':str(exc),'traceback':traceback.format_exc()})
        page.screenshot(path=str(ARTIFACT_DIR / 'failure.png'),full_page=True)
    finally:
        (ARTIFACT_DIR / 'report.json').write_text(json.dumps({'results':results,'errors':errors,'expectedCancellations':expected_cancellations,'statusResponses':status_responses},ensure_ascii=False,indent=2))
        passed = sum(result['status'] == 'pass' for result in results)
        failed = [result for result in results if result['status'] == 'fail']
        print(f'Browser smoke: {passed} passed, {len(failed)} failed, {len(errors)} browser errors')
        print(f'Status requests: {len(status_responses)} valid responses, {len(expected_cancellations)} expected lifecycle cancellations')
        for result in failed:
            print(f'{result["name"]}: {result["detail"]}')
        for error in errors:
            print(f'{error["type"]}: {error["message"]}')
        browser.close()

print(f'Browser artifacts: {ARTIFACT_DIR}')
sys.exit(1 if errors or any(result['status']=='fail' for result in results) else 0)
