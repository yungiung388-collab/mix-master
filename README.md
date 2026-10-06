# MIX / MASTER

Cubase 15 Pro에서 수동으로 적용할 믹스·마스터 시작값을 제안하는 한국어 웹 앱입니다. 곡의 키, 스케일, BPM, 보컬 구성과 실제 음역, 장르, 분위기, 가사, 튜닝 스타일, 마스터 목표를 입력합니다.

## 다운로드

[실행용 ZIP 받기](downloads/mix-master-studio.zip?raw=true) · [압축 파일 실행 안내](downloads/README.md)

빌드 결과가 포함되어 있습니다. Node.js 24.5 이상이 설치된 컴퓨터에서 압축을 푼 뒤 `start-windows.cmd` 또는 `sh start.sh`로 실행하세요. 모바일 접속 주소는 별도의 HTTPS 배포가 필요합니다.

휴대폰용 배포는 [HTTPS 배포 안내](DEPLOY.md)와 `render.yaml`을 참고하세요.

## 실행

Node.js 24.5 이상이 필요합니다. AI 연결에서도 시스템 프록시·인증서 검증을 사용합니다.

```sh
npm ci
npm run dev
```

터미널에 표시되는 개발 서버 주소를 브라우저에서 열면 됩니다. 클라우드의 기본 npm 캐시 경로에 쓰기 권한이 없으면 설치 명령에 `NPM_CONFIG_CACHE=/workspace/.npm-cache`를 지정하세요.

```sh
npm test
npm run build
npm run preview
npm start
```

`dist/`는 웹 빌드 결과입니다. 세팅 추천은 계정이나 API 키 없이 동작합니다. 폰트도 함께 제공하며 세팅 생성만으로 가사·세션을 외부 서버에 전송하지 않습니다. 대화 기능을 포함한 앱은 `npm start`로 Node 서버에서 실행하세요. 개발 서버와 preview에도 같은 대화 API가 연결됩니다.

## 기능

- 팝·힙합·R&B·발라드·EDM·록 및 여섯 가지 분위기별 추천.
- 보컬 Insert, 별도 리버브·딜레이 FX Send, 드럼 Group, 믹스 Group, Stereo Out, RX 전처리의 적용 위치 표시.
- Auto-Tune Pro, FabFilter Pro-Q/Pro-C/Pro-DS, Waves CLA-76/SSL G-Master Buss Compressor, Valhalla VintageVerb/Delay, Ozone Imager/Dynamics/Maximizer, RX Voice De-noise/De-click 설정.
- 추가 보유 도구: kHs Filter, Soundtoys MicroShift·LittleAlterBoy, MeldaProduction MAutoPitch. MicroShift와 kHs는 각각 켜고 끌 수 있습니다.
- 포먼트 효과는 기본적으로 꺼져 있으며 LittleAlterBoy 또는 MAutoPitch 중 하나로 살짝 낮게/높게 조절합니다. **MAutoPitch는 Auto-Tune 대체가 아닙니다.** 피치 보정은 Auto-Tune으로 유지하고 MAutoPitch의 Depth를 0%로 설정해 포먼트에만 사용합니다.
- Pro-Q 4 클린업: 가벼운 기본 밴드 감쇄와 추가 다이내믹 감쇄를 구분합니다. 순간적인 뭉침에는 다이내믹 밴드가 반응하도록 설정하고, 기본·추가·최대 총 감쇄를 안내합니다. 하이패스는 필요한 경우에만 켜는 별도 정적 필터입니다.
- 장르·분위기·튜닝 강도에 따라 디에서/컴프레서 순서를 선택하고 추천 이유를 표시합니다. 공간계 AUX와 별도 Group을 하나의 직렬 체인으로 오해하지 않도록 라우팅을 구분합니다.
- BPM에 따른 1/4·1/8·점8분·1/16 딜레이 시간 계산.
- 가사의 한글 음절·영문 단어 수와 행 길이에 따른 공간계 조정. 긴 구절은 잔향·Send를 줄이는 참고 규칙입니다.
- 악기곡의 보컬 체인 제외, 자연스러운 튜닝부터 강한 효과까지 선택, 스트리밍·클럽·다이내믹 보존 목표.
- 전체/개별 설정 복사, 텍스트·JSON 다운로드, 브라우저에 최대 20개 세션 저장·불러오기·삭제.
- 데스크톱·모바일 대응 및 플러그인 라이브러리·적용 가이드.
- 믹스 대화, 직접 카메라 촬영, 재촬영·사진 첨부·삭제. 사진을 갤러리에서 선택하거나 기기에 저장할 필요가 없습니다.

## Cubase 적용

1. Cubase 프로젝트의 BPM과 실제 조성을 확인하고 트랙 레벨·팬을 먼저 잡습니다.
2. 필요한 클립만 RX에서 복사본으로 정리한 뒤 가져옵니다. 깨끗한 소스에는 복원 처리를 생략합니다.
3. 추천 순서에 따라 보컬 트랙 Insert를 구성합니다. 보컬 구성보다 **실제 음역**이 Input Type·EQ·치찰음 대역을 결정합니다.
4. VintageVerb와 Delay는 각각 별도 FX 채널에서 Mix 100%로 사용하며 보컬 트랙의 Send로 양을 조절합니다. 인서트 사용 시 Mix를 다시 정하세요.
   MicroShift도 독립적인 FX Send로 사용합니다. 보컬이 넓어지면서 모노에서 얇아지면 Send를 줄이거나 생략하세요. kHs Filter를 켰다면 추천된 각 공간계 FX Return에 적용합니다.
5. CLA-76은 드럼 Group에, 버스 EQ와 SSL은 믹스 Group에 적용합니다. UI의 독립 라우팅을 확인하세요.
6. 마스터 체인은 Stereo Out에서 적용합니다. 선택적인 Dynamics는 이미 버스에서 압축했다면 생략할 수 있습니다. 최종 리미터는 Maximizer 하나로 시작하세요.
7. Threshold와 Gain은 고정값이 아니라 소스 레벨과 Gain Reduction을 보며 조정합니다. 음량을 맞춘 바이패스 비교·모노 합산·전체 곡의 LUFS-I와 True Peak 측정으로 마무리합니다.

## 추천의 범위

세팅 추천 엔진은 결정론적인 음악·오디오 작업 규칙을 사용합니다. 오디오 분석, 자동 키/BPM 검출, 가사 감정·실제 발음 속도 분석, Cubase 자동 제어는 하지 않습니다. 내보낸 파일은 Cubase/VST 프리셋 파일이 아니라 수동 적용용 가이드입니다. 별도의 믹스 대화는 아래 AI 연결을 선택적으로 사용합니다.

목표 음량 −14/−9/−16 LUFS-I는 선택한 사용처의 **참고 목표**이며 플랫폼 제출 의무값이 아닙니다. EQ·임계값·음압은 실제 음원에 따라 달라집니다. 특히 높은 음압에서 왜곡이나 트랜지언트 손상이 들리면 목표를 낮추세요.

대상 번들은 사용자가 지정한 Auto-Tune Unlimited 2023.12, FabFilter Total Bundle v2026, Waves Ultimate 16 v2025.08, Valhalla DSP Plugins Bundle v2024.03, Ozone 12 Advanced v12.0.0, RX 11 Advanced v11.2.0입니다. 설치 파일·라이선스를 제공하지 않으며 **해당 버전의 실제 설치판과 Cubase 통합 동작은 검증하지 않았습니다.** 컨트롤명이 다른 경우 설치판의 매뉴얼을 확인하세요.

추가 보유 플러그인은 Kilohearts kHs 번들, Soundtoys MicroShift와 LittleAlterBoy, MeldaProduction MAutoPitch이며 버전은 지정되지 않았습니다. 포먼트 선택 시 **둘 중 하나만** Auto-Tune 뒤에 적용합니다. MAutoPitch에서 포먼트만 바뀌고 피치는 원래대로 남는지 실제 설치판에서 확인하세요. 이는 가끔 사용하는 선택적인 음색 효과입니다.

세션은 현재 브라우저의 `localStorage`에 저장합니다. 브라우저 데이터를 지우면 사라지므로 중요한 설정은 텍스트·JSON으로 내보내세요. 다른 기기와 자동 동기화하지 않습니다.

## 믹스 대화와 직접 촬영

‘믹스 대화’ 메뉴에서 현재 생성한 레시피에 대한 질문을 입력하거나 ‘카메라로 직접 촬영’을 누릅니다. 브라우저 안에서 실시간 카메라를 열고 촬영·재촬영한 사진을 곧바로 메시지에 첨부합니다. 갤러리 선택용 파일 입력이나 이미지 다운로드를 사용하지 않습니다.

사진은 한 메시지에 최대 3장 첨부하며 긴 변을 최대 1600px로 줄입니다. 사진·대화는 브라우저 메모리에만 보관하며 새로고침 시 사라집니다. 메뉴를 이동할 때 카메라는 종료되지만 대화와 첨부는 유지됩니다. 촬영·대화 사진을 `localStorage`나 서버 파일에 저장하지 않습니다. 전송 오류 시 작성한 메시지와 사진을 유지해 다시 보낼 수 있습니다.

휴대폰의 카메라는 **HTTPS 주소와 카메라 권한**이 필요합니다. 개발용 localhost는 보안 컨텍스트로 취급되지만 다른 기기의 일반 HTTP 주소로 접속하면 촬영이 제한됩니다. 모바일 Safari/Chrome에서 실행할 수 있습니다. 브라우저별 실제 기기 검증은 별도로 필요합니다.

## AI 사진 분석 연결

서버 환경 변수 `MIX_MASTER_AI_KEY`에 OpenAI API 키를 안전하게 설정하세요. 클라우드에서는 저장된 환경 설정의 비밀값 항목에 입력하고 서버를 재시작합니다. 키를 채팅·소스 코드·`VITE_` 변수에 넣지 마세요. `MIX_MASTER_AI_MODEL`은 사진 입력을 지원하는 모델 이름으로 설정하며 기본값은 `gpt-4.1-mini`입니다. 이 모델의 실제 사용 권한은 해당 API 계정에서 확인해야 합니다.

키가 없으면 현재 레시피를 기반으로 기본 대화 가이드를 제공합니다. **키 없는 모드에서 사진 내용은 분석하지 않습니다.** 키가 연결되면 보내기를 눌렀을 때 메시지·첨부 사진·현재 레시피를 OpenAI에 전송합니다. API 사용에는 해당 계정의 비용과 데이터 처리 정책이 적용됩니다. 서버는 API 키를 클라이언트나 로그에 노출하지 않습니다.

AI는 사진에 보이는 플러그인 이름·컨트롤·값을 읽고 조언하도록 구성합니다. 사진만으로 실제 오디오의 공명, 피치 정확도, LUFS를 측정했다고 주장하지 않습니다. 읽기 어려운 화면은 다시 촬영하거나 값을 직접 적어야 합니다. 개별 설치판 및 실제 API 호출 검증 여부는 환경 설정 결과와 별도로 구분하세요.

`npm start`는 빌드된 앱과 대화 API를 같은 서버에서 제공합니다. 기본 포트는 4173이며 `PORT`·`HOST`로 변경할 수 있습니다. 모바일용으로 게시할 때는 HTTPS를 제공하는 호스팅이나 역방향 프록시를 사용하세요. 정적 파일만 호스팅하면 추천 화면은 사용할 수 있지만 서버 대화 API는 별도로 연결해야 합니다.

## 코드와 검증

- `src/engine.js`: 입력 정규화, 추천 규칙, 시간 계산, 가사 통계, 라우팅, 텍스트 내보내기.
- `src/App.jsx`: 입력 UI, 결과 체인, 로컬 저장, 복사·다운로드.
- `src/ChatPanel.jsx` / `src/camera.js`: 대화, 직접 촬영, 메모리 첨부, 카메라 수명 관리.
- `server/chat.js` / `server/index.js`: 기본 가이드·AI 사진 대화 API와 프로덕션 웹 서버.
- `tests/engine.test.js`: BPM 공식, 잘못된 입력, 실제 음역 우선, 장르/분위기/목표, 무보컬, 라우팅, 파라미터 범위, 가사 반영, 내보내기 검증.

```sh
npm test
```

브라우저 스모크 검증에는 선택적으로 Python Playwright와 Chromium을 사용할 수 있습니다. 개발 서버를 먼저 실행한 뒤 아래 명령을 실행합니다.

```sh
python3 -m pip install playwright
python3 -m playwright install chromium
python3 tests/browser_smoke.py
python3 tests/camera_browser_smoke.py
```

별도의 Chromium 설치를 사용할 경우 `CHROMIUM_EXECUTABLE`에 실행 파일 경로를 지정할 수 있습니다. 클라우드에는 `/usr/bin/chromium`과 Python Playwright가 이미 제공됩니다. 브라우저 테스트는 웹 UI와 추천 결과를 검증하며 실제 DAW의 소리를 검증하지 않습니다.

카메라 브라우저 테스트는 Chromium의 가상 카메라를 사용해 촬영·재촬영·전환·첨부·삭제·전송 실패 재시도와 카메라 종료를 검증합니다. AI 응답은 테스트용 mock이며 실제 API 사진 분석을 검증한 것으로 간주하지 않습니다. `tests/chat.test.js`도 공급자 요청을 mock으로 검증하며 실제 API 키나 비용이 발생하지 않습니다.
