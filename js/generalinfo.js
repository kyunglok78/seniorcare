// generalinfo.js (최종 - 카카오 장소검색 + 수동입력 폼 전환 버전)

let mapInstance = null;
let ps = null; // 카카오 장소 검색 서비스 객체
let infowindow = null;
let markers = [];
let globalFacilityList = [];

// [1] 지도 초기화
function initMap() {
    const container = document.getElementById('kakao-map');
    if (!container) {
        setTimeout(initMap, 500);
        return;
    }
    // services 라이브러리가 켜져있는지 체크
    if(typeof kakao === 'undefined' || !kakao.maps || !kakao.maps.services) {
        console.error('카카오맵 API 서버와 연결되지 않았거나 services 라이브러리가 없습니다.');
        return;
    }
    
    // 기본 위치 설정 (서울)
    mapInstance = new kakao.maps.Map(container, { center: new kakao.maps.LatLng(37.566826, 126.9786567), level: 5 });
    ps = new kakao.maps.services.Places(); 
    infowindow = new kakao.maps.InfoWindow({zIndex:1});
    mapInstance.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);

    // 💡 처음 들어왔을 때 빈 양식을 보여줍니다.
    renderOverviewForm("", "");
}

// [2] 카카오 키워드 장소 검색 실행
function searchFacility() {
    const keyword = document.getElementById('search-facility-input').value.trim();
    if(!keyword) { 
        alert("검색할 기관명이나 지역을 입력해주세요. (예: 강남구 요양원)"); 
        return; 
    }
    
    // 💡 공공데이터 대신 카카오 장소 검색 실행 (에러 0%)
    ps.keywordSearch(keyword, placesSearchCB);
}

// 카카오 검색 결과 콜백 함수
function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
        displayPlaces(data);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.');
        updateFacilityListUI([]);
    } else if (status === kakao.maps.services.Status.ERROR) {
        alert('검색 중 오류가 발생했습니다.');
    }
}

// 검색 결과 마커 및 리스트 표시
function displayPlaces(places) {
    clearMap();
    globalFacilityList = places;
    const bounds = new kakao.maps.LatLngBounds();

    for (let i = 0; i < places.length; i++) {
        const placePosition = new kakao.maps.LatLng(places[i].y, places[i].x);
        const marker = new kakao.maps.Marker({ position: placePosition, map: mapInstance });
        markers.push(marker);
        
        const title = places[i].place_name;
        const address = places[i].road_address_name || places[i].address_name;

        // 💡 마커 클릭 이벤트
        kakao.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(`<div style="padding:5px;font-size:12px;">${title}</div>`);
            infowindow.open(mapInstance, marker);
            
            // 클릭 시 우측 사업장 개요 폼에 이름과 주소 자동 반영
            renderOverviewForm(title, address);
            
            // 좌측 리스트 활성화 색상 변경
            document.querySelectorAll('.facility-list-item').forEach(el => el.classList.remove('active'));
            const listItem = document.getElementById(`list-item-${i}`);
            if(listItem) listItem.classList.add('active');
        });

        bounds.extend(placePosition);
    }
    
    mapInstance.setBounds(bounds);
    updateFacilityListUI(places);
}

function clearMap() {
    markers.forEach(m => m.setMap(null));
    markers = [];
    if(infowindow) infowindow.close();
}

// 좌측 검색 리스트 렌더링
function updateFacilityListUI(places) {
    const container = document.getElementById('facility-list-container');
    const badge = document.getElementById('search-count-badge');
    if(badge) badge.innerText = places.length;
    if(!container) return;
    
    container.innerHTML = '';
    if (places.length === 0) {
        container.innerHTML = `<div style="padding: 30px 15px; text-align: center; color: #94a3b8; font-size: 0.9rem;">검색 결과가 없습니다.</div>`;
        return;
    }

    places.forEach((place, i) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'facility-list-item';
        itemDiv.id = `list-item-${i}`;
        
        const address = place.road_address_name || place.address_name;
        itemDiv.innerHTML = `<div class="facility-list-name">${place.place_name}</div><div class="facility-list-addr">${address}</div>`;
        
        itemDiv.onclick = () => {
            document.querySelectorAll('.facility-list-item').forEach(el => el.classList.remove('active'));
            itemDiv.classList.add('active');
            
            const pos = new kakao.maps.LatLng(place.y, place.x);
            mapInstance.panTo(pos);
            infowindow.setContent(`<div style="padding:5px;font-size:12px;">${place.place_name}</div>`);
            infowindow.open(mapInstance, markers[i]);
            
            // 💡 리스트 클릭 시에도 우측 폼에 정보 자동 반영
            renderOverviewForm(place.place_name, address);
        };
        container.appendChild(itemDiv);
    });
}

// [3] 직접 입력 (버튼 클릭 시)
function addCustomFacility() {
    const customName = prompt("사업장(시설)의 이름을 입력하세요:", "OOO 요양원");
    if(!customName) return;
    const customAddr = prompt("기관의 대략적인 주소를 입력하세요 (예: 서울 강남구 테헤란로 123):");
    
    renderOverviewForm(customName, customAddr || "");
    alert("우측 입력폼에 사업장 정보가 반영되었습니다. 상세 내역을 입력해주세요.");
}

// [4] 사업장 개요 (위험성평가 기준) 입력 폼 렌더링 (가장 핵심!)
function renderOverviewForm(name, address) {
    const targetTitle = document.getElementById('current-info-facility-name');
    const targetGenTable = document.getElementById('table-general-status');
    const targetFacTable = document.getElementById('table-instt-status');
    const btnGen = document.getElementById('btn-add-gen-row');
    const btnFac = document.getElementById('btn-add-fac-row');
    
    // 불필요한 기존 플러스 버튼 숨기기
    if(btnGen) btnGen.style.display = 'none';
    if(btnFac) btnFac.style.display = 'none';
    
    if(targetTitle) {
        targetTitle.innerHTML = `${name || "사업장을 검색/선택해주세요"} <span style="font-size:0.9rem; color:#10b981;">(위험성평가 사업장 개요 입력)</span>`;
    }

    // 💡 대표님이 주신 이미지를 바탕으로 구성한 완벽한 사업장 개요 표 양식
    const formHTML = `
        <div style="background: #fff; padding: 15px; border-radius: 8px; font-family: 'Pretendard', sans-serif;">
            <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left; border-top: 2px solid #1e293b;">
                <tbody>
                    <tr>
                        <th style="width:15%; background:#f8fafc; padding:12px; border:1px solid #cbd5e1; color:#334155;">사업장명</th>
                        <td style="width:35%; padding:8px; border:1px solid #cbd5e1;">
                            <input type="text" id="overview-name" value="${name}" style="width:90%; padding:6px; border:1px solid #ccc; border-radius:4px;" placeholder="사업장명">
                        </td>
                        <th style="width:15%; background:#f8fafc; padding:12px; border:1px solid #cbd5e1; color:#334155;">대표자명</th>
                        <td style="width:35%; padding:8px; border:1px solid #cbd5e1;">
                            <input type="text" id="overview-ceo" style="width:90%; padding:6px; border:1px solid #ccc; border-radius:4px;" placeholder="대표자명">
                        </td>
                    </tr>
                    <tr>
                        <th style="background:#f8fafc; padding:12px; border:1px solid #cbd5e1; color:#334155;">소재지</th>
                        <td colspan="3" style="padding:8px; border:1px solid #cbd5e1;">
                            <input type="text" id="overview-address" value="${address}" style="width:96%; padding:6px; border:1px solid #ccc; border-radius:4px;" placeholder="주소 입력">
                        </td>
                    </tr>
                    <tr>
                        <th style="background:#f8fafc; padding:12px; border:1px solid #cbd5e1; color:#334155;">업종</th>
                        <td style="padding:8px; border:1px solid #cbd5e1;">
                            <input type="text" id="overview-industry" value="보건업 및 사회복지 서비스업" style="width:90%; padding:6px; border:1px solid #ccc; border-radius:4px;">
                        </td>
                        <th style="background:#f8fafc; padding:12px; border:1px solid #cbd5e1; color:#334155;">설립일자</th>
                        <td style="padding:8px; border:1px solid #cbd5e1;">
                            <input type="date" id="overview-date" style="width:90%; padding:6px; border:1px solid #ccc; border-radius:4px;">
                        </td>
                    </tr>
                    <tr>
                        <th style="background:#f8fafc; padding:12px; border:1px solid #cbd5e1; color:#334155;">근로자 수</th>
                        <td colspan="3" style="padding:8px; border:1px solid #cbd5e1;">
                            <div style="display:flex; gap:10px; align-items:center;">
                                <span>남:</span> <input type="number" id="overview-emp-m" style="width:60px; padding:6px; border:1px solid #ccc; border-radius:4px; text-align:right;" value="0" min="0"> 명
                                <span style="margin-left:15px;">여:</span> <input type="number" id="overview-emp-f" style="width:60px; padding:6px; border:1px solid #ccc; border-radius:4px; text-align:right;" value="0" min="0"> 명
                                <span style="margin-left:20px; font-weight:bold; color:#1e293b;">총 합계: <span id="overview-emp-total" style="color:#2563eb; font-size:16px;">0</span> 명</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th style="background:#f8fafc; padding:12px; border:1px solid #cbd5e1; color:#334155;">주요 사업<br>(생산품)</th>
                        <td colspan="3" style="padding:8px; border:1px solid #cbd5e1;">
                            <textarea id="overview-service" rows="3" style="width:96%; padding:8px; border:1px solid #ccc; border-radius:4px; resize:vertical;" placeholder="예: 노인요양시설 운영, 주야간 보호 서비스 등"></textarea>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div style="text-align:right; margin-top:20px;">
                <button onclick="saveOverviewData()" style="background:#2563eb; color:white; border:none; padding:12px 24px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    💾 사업장 정보 저장 및 평가 시작
                </button>
            </div>
        </div>
    `;

    if(targetGenTable) targetGenTable.innerHTML = formHTML;
    if(targetFacTable) targetFacTable.innerHTML = ""; // 하단 표는 지우고 사업장 개요 하나로 통합
    
    // 💡 근로자 수 남, 여 입력 시 '총 합계' 자동 계산 기능
    setTimeout(() => {
        const mInput = document.getElementById('overview-emp-m');
        const fInput = document.getElementById('overview-emp-f');
        const totSpan = document.getElementById('overview-emp-total');
        const calcTotal = () => {
            const m = parseInt(mInput.value) || 0;
            const f = parseInt(fInput.value) || 0;
            totSpan.innerText = m + f;
        };
        if(mInput && fInput) {
            mInput.addEventListener('input', calcTotal);
            fInput.addEventListener('input', calcTotal);
        }
    }, 100);
}

// [5] 입력한 사업장 정보 저장 로직 (나중에 보고서로 자동 연결됨)
function saveOverviewData() {
    const name = document.getElementById('overview-name')?.value;
    if(!name) {
        alert("사업장명을 입력해주세요.");
        return;
    }
    
    // 로컬 스토리지에 저장하여 탭을 옮겨도 데이터가 유지되도록 함
    const overviewData = {
        name: name,
        ceo: document.getElementById('overview-ceo')?.value,
        address: document.getElementById('overview-address')?.value,
        industry: document.getElementById('overview-industry')?.value,
        date: document.getElementById('overview-date')?.value,
        empM: document.getElementById('overview-emp-m')?.value,
        empF: document.getElementById('overview-emp-f')?.value,
        empTotal: document.getElementById('overview-emp-total')?.innerText,
        service: document.getElementById('overview-service')?.value
    };
    
    localStorage.setItem('riskAssessmentOverview', JSON.stringify(overviewData));
    alert(`[${name}] 사업장 개요가 임시 저장되었습니다.\n상단의 '위험성 평가' 탭으로 이동하여 평가를 진행해주세요.`);
}

// * 기존 API 관련 미사용 함수 처리 (에러 방지용)
function fetchFacilityData() {} 
function loadMockFacilities() {}