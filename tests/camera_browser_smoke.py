from playwright.sync_api import sync_playwright, expect
import json, os, pathlib, shutil, tempfile, traceback

BASE_URL = os.environ.get('MIX_MASTER_URL', 'http://127.0.0.1:5173')
CHROMIUM = os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium') or shutil.which('google-chrome')
OUT = pathlib.Path(os.environ.get('MIX_MASTER_ARTIFACT_DIR') or tempfile.mkdtemp(prefix='mix-master-camera-qa-'))
OUT.mkdir(parents=True, exist_ok=True)
results = []
errors = []

def ok(name, detail=None):
    results.append({'name': name, 'pass': True, 'detail': detail})

def no_overflow(page):
    size = page.evaluate('({scroll:document.documentElement.scrollWidth, width:innerWidth})')
    assert size['scroll'] <= size['width'], size
    return size

def all_tracks_stopped(page):
    page.wait_for_function('window.__qaCameraStreams.every(stream => stream.getTracks().every(track => track.readyState === "ended"))')
    return page.evaluate('window.__qaCameraStreams.every(stream => stream.getTracks().every(track => track.readyState === "ended"))')

def capture_photo(page):
    page.get_by_role('button', name='직접 촬영', exact=True).click()
    expect(page.get_by_role('dialog')).to_be_visible()
    button = page.get_by_role('button', name='촬영', exact=True)
    expect(button).to_be_enabled(timeout=10000)
    no_overflow(page)
    button.click()
    expect(page.get_by_role('heading', name='촬영한 사진 확인', exact=True)).to_be_visible()
    assert all_tracks_stopped(page)
    image = page.locator('.chat-captured-photo').evaluate('(image) => ({width:image.naturalWidth,height:image.naturalHeight,src:image.src})')
    assert image['src'].startswith('data:image/jpeg;base64,')
    assert 0 < max(image['width'], image['height']) <= 1600, image
    page.get_by_role('button', name='이 사진 첨부', exact=True).click()
    expect(page.get_by_role('dialog')).to_have_count(0)
    return {key: value for key, value in image.items() if key != 'src'}

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROMIUM, headless=True, args=[
        '--no-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream',
    ])
    context = browser.new_context(viewport={'width':390,'height':844}, permissions=['camera'])
    context.add_init_script('''
      window.__qaCameraStreams = [];
      if (navigator.mediaDevices?.getUserMedia) {
        window.__qaNativeGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = (constraints) => window.__qaNativeGetUserMedia(constraints).then(stream => {
          window.__qaCameraStreams.push(stream);
          return stream;
        });
      }
    ''')
    page = context.new_page()
    page.set_default_timeout(5000)
    page.on('pageerror', lambda err: errors.append(str(err)))
    page.on('requestfailed', lambda request: errors.append(request.url + ': ' + str(request.failure)) if not (request.url.endswith('/api/status') and request.failure == 'net::ERR_ABORTED') else None)
    try:
        page.goto(BASE_URL, wait_until='networkidle')
        page.get_by_role('button', name='믹스 대화', exact=True).click()
        expect(page.get_by_role('heading', name='스튜디오 대화', exact=True)).to_be_visible()
        expect(page.locator('.chat-local-notice')).to_contain_text('사진은 아직 분석할 수 없습니다')
        assert page.locator('.chat-panel input[type=file]').count() == 0
        ok('Mobile conversation and explicit local image-analysis state', no_overflow(page))

        # Camera can retake without saving a file, and switching releases old tracks.
        page.get_by_role('button', name='직접 촬영', exact=True).click()
        expect(page.get_by_role('button', name='촬영', exact=True)).to_be_enabled(timeout=10000)
        page.get_by_role('button', name='카메라 전환', exact=True).click()
        expect(page.get_by_role('button', name='촬영', exact=True)).to_be_enabled(timeout=10000)
        assert page.evaluate('window.__qaCameraStreams.slice(0,-1).every(s=>s.getTracks().every(t=>t.readyState==="ended"))')
        page.get_by_role('button', name='촬영', exact=True).click()
        assert all_tracks_stopped(page)
        page.get_by_role('button', name='다시 촬영', exact=True).click()
        expect(page.get_by_role('button', name='촬영', exact=True)).to_be_enabled(timeout=10000)
        page.get_by_role('button', name='촬영', exact=True).click()
        page.get_by_role('button', name='이 사진 첨부', exact=True).click()
        expect(page.locator('.chat-attachment')).to_have_count(1)
        ok('Front/rear switch and retake stop all old camera tracks')

        capture_photo(page)
        capture_photo(page)
        expect(page.locator('.chat-attachment')).to_have_count(3)
        expect(page.get_by_role('button', name='직접 촬영', exact=True)).to_be_disabled()
        page.get_by_role('button', name='첨부 사진 2 삭제', exact=True).click()
        expect(page.locator('.chat-attachment')).to_have_count(2)
        expect(page.get_by_role('button', name='직접 촬영', exact=True)).to_be_enabled()
        assert page.evaluate('Object.values(localStorage).every(value=>!value.includes("data:image/"))')
        page.screenshot(path=str(OUT / 'mobile-chat-with-photos.png'), full_page=True)
        ok('Three-photo limit, remove, resize, no photo in local storage', no_overflow(page))

        page.get_by_role('button', name='보낼 사진 1 크게 보기', exact=True).click()
        expect(page.get_by_role('heading', name='대화에 첨부한 사진', exact=True)).to_be_visible()
        page.keyboard.press('Escape')
        expect(page.get_by_role('dialog')).to_have_count(0)
        ok('Accessible attachment enlargement and Escape close')

        # A deliberate server failure must preserve both the text and attachments.
        failure_handler = lambda route: route.fulfill(status=502, content_type='application/json', body=json.dumps({'error':'테스트 연결 오류입니다.'}))
        page.route('**/api/chat', failure_handler)
        textarea = page.locator('#studio-chat-input')
        textarea.fill('사진을 보면서 치찰음을 같이 점검해 주세요')
        page.get_by_role('button', name='메시지 보내기', exact=True).click()
        expect(page.locator('.chat-send-error')).to_contain_text('테스트 연결 오류')
        expect(textarea).to_have_value('사진을 보면서 치찰음을 같이 점검해 주세요')
        expect(page.locator('.chat-attachment')).to_have_count(2)
        assert page.locator('.chat-message-user').count() == 0
        page.unroute('**/api/chat', failure_handler)
        page.get_by_role('button', name='다시 보내기', exact=True).click()
        expect(page.locator('.chat-message-user')).to_have_count(1)
        expect(page.locator('.chat-send-error')).to_have_count(0)
        expect(textarea).to_have_value('')
        expect(page.locator('.chat-attachment')).to_have_count(0)
        expect(page.locator('.chat-message-images .chat-image-button')).to_have_count(2)
        expect(page.locator('.chat-message').last).to_contain_text('사진')
        ok('Failed send preserves draft/photos; retry succeeds without duplicate message')

        # Korean composition Enter must finish composition, not send prematurely.
        requests = []
        page.on('request', lambda request: requests.append(request.url) if request.url.endswith('/api/chat') else None)
        textarea.fill('보컬이 묻혀요')
        textarea.dispatch_event('compositionstart')
        textarea.press('Enter')
        page.wait_for_timeout(150)
        assert requests == [], requests
        textarea.dispatch_event('compositionend')
        textarea.press('Shift+Enter')
        assert requests == [], requests
        textarea.press('Enter')
        expect(page.locator('.chat-message-user')).to_have_count(2)
        assert len(requests) == 1, requests
        ok('Korean IME Enter and Shift+Enter protect drafts; Enter sends once')

        # Switching the app page keeps the chat but immediately turns the camera off.
        capture_photo(page)
        page.get_by_role('button', name='직접 촬영', exact=True).click()
        expect(page.get_by_role('button', name='촬영', exact=True)).to_be_enabled(timeout=10000)
        page.evaluate('Array.from(document.querySelectorAll(".main-nav button")).find(b=>b.textContent==="워크스페이스").click()')
        expect(page.get_by_role('dialog')).to_have_count(0)
        assert all_tracks_stopped(page)
        page.get_by_role('button', name='믹스 대화', exact=True).click()
        expect(page.locator('.chat-message-user')).to_have_count(2)
        expect(page.locator('.chat-attachment')).to_have_count(1)
        ok('Page navigation stops camera while preserving conversation and unsent photo')

        # Clear releases every photo reference and returns to the welcome message.
        page.get_by_role('button', name='대화 비우기', exact=True).click()
        expect(page.locator('.chat-message')).to_have_count(1)
        expect(page.locator('.chat-panel img')).to_have_count(0)
        ok('Clear conversation releases draft and message photos')

        # AI mode is mocked: this checks the UI contract without sending a photo externally.
        ai_status = lambda route: route.fulfill(status=200, content_type='application/json', body=json.dumps({'aiConfigured':True,'cameraRequiresSecureContext':True,'model':'test-model'}))
        ai_chat = lambda route: route.fulfill(status=200, content_type='application/json', body=json.dumps({'reply':'테스트 사진 답변입니다. Auto-Tune 설정을 점검해 주세요.','mode':'ai','model':'test-model'}))
        page.route('**/api/status', ai_status)
        page.route('**/api/chat', ai_chat)
        page.get_by_role('button', name='연결 다시 확인', exact=True).click()
        expect(page.locator('.chat-connection-status')).to_contain_text('AI 분석 요청 모드')
        expect(page.locator('.chat-privacy-note')).to_contain_text('AI 서비스로 전달')
        expect(page.locator('.chat-local-notice')).to_have_count(0)
        capture_photo(page)
        textarea.fill('이 사진의 설정을 점검해 주세요')
        with page.expect_request('**/api/chat') as pending_request:
            page.get_by_role('button', name='메시지 보내기', exact=True).click()
        payload = pending_request.value.post_data_json
        assert payload['messages'][-1]['images'][0]['mimeType'] == 'image/jpeg'
        assert payload['recipe']['input']['bpm'] > 0
        expect(page.locator('.chat-message-mode').last).to_have_text('AI와 함께 점검한 가이드')
        expect(page.locator('.chat-message').last).to_contain_text('테스트 사진 답변')
        page.unroute('**/api/status', ai_status)
        page.unroute('**/api/chat', ai_chat)
        ok('Mock AI status, explicit photo transmission notice, image+recipe payload and reply')

        page.evaluate('() => {navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException("Denied","NotAllowedError")};}')
        page.get_by_role('button', name='직접 촬영', exact=True).click()
        expect(page.locator('.chat-camera-error')).to_contain_text('카메라 사용 권한이 필요합니다')
        expect(page.get_by_role('button', name='촬영', exact=True)).to_be_disabled()
        page.get_by_role('button', name='카메라 닫기', exact=True).click()
        assert all_tracks_stopped(page)
        ok('Denied camera permission provides recovery guidance and close works')

        page.evaluate('() => {navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException("Missing","NotFoundError")};}')
        page.get_by_role('button', name='직접 촬영', exact=True).click()
        expect(page.locator('.chat-camera-error')).to_contain_text('카메라를 찾지 못했습니다')
        page.get_by_role('button', name='카메라 닫기', exact=True).click()
        ok('Missing camera provides recovery guidance')

        page.evaluate('Object.defineProperty(window,"isSecureContext",{value:false,configurable:true})')
        page.get_by_role('button', name='직접 촬영', exact=True).click()
        expect(page.locator('.chat-camera-error')).to_contain_text('HTTPS 주소')
        page.keyboard.press('Escape')
        ok('Insecure mobile context explains HTTPS requirement')

        page.reload(wait_until='networkidle')
        page.get_by_role('button', name='믹스 대화', exact=True).click()
        expect(page.locator('.chat-panel img')).to_have_count(0)
        expect(page.locator('.chat-message')).to_have_count(1)
        assert errors == [], errors
        ok('Reload clears camera photos; no uncaught browser errors')
    except Exception:
        errors.append(traceback.format_exc())
    finally:
        (OUT / 'results.json').write_text(json.dumps({'results': results, 'errors': errors}, ensure_ascii=False, indent=2))
        print(json.dumps({'results': results, 'errors': errors, 'artifacts': str(OUT)}, ensure_ascii=False, indent=2))
        browser.close()
        if errors:
            raise SystemExit(1)
