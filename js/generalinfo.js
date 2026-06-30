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
    if(typeof kakao === 'undefined' || !kakao.maps || !kakao.maps.services) {
        console.error('카카오맵 API 서버와 연결되지 않았거나 services 라이브러리가 없습니다.');
        return;
    }
    
    mapInstance = new kakao.maps.Map(container, { center: new kakao.maps.LatLng(37.566826, 126.9786567), level: 5 });
    ps = new kakao.maps.services.Places(); 
    infowindow = new kakao.maps.InfoWindow({zIndex:1});
    mapInstance.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);

    renderOverviewForm("", "");
}

// [2] 카카오 키워드 장소 검색 실행
function searchFacility() {
    const keyword = document.getElementById('search-facility-input').value.trim();
    if(!keyword) { 
        alert("주소 또는 지역명(기관명)을 입력해주세요. (예: 서초구 형촌2길, OOO요양원)"); 
        return; 
    }
    ps.keywordSearch(keyword, placesSearchCB);
}

function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
        displayPlaces(data);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다. 주소를 다시 확인해주세요.');
        updateFacilityListUI([]);
    } else if (status === kakao.maps.services.Status.ERROR) {
        alert('검색 중 오류가 발생했습니다.');
    }
}

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

        kakao.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(`<div style="padding:5px;font-size:12px;">${title}</div>`);
            infowindow.open(mapInstance, marker);
            renderOverviewForm(title, address);
            
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
            
            renderOverviewForm(place.place_name, address);
        };
        container.appendChild(itemDiv);
    });
}

function addCustomFacility() {
    const customName = prompt("사업장(시설)의 이름을 입력하세요:", "OOO 요양원");
    if(!customName) return;
    const customAddr = prompt("기관의 대략적인 주소를 입력하세요:");
    renderOverviewForm(customName, customAddr || "");
}

// 💡 [핵심] 좌우 50:50 분할 구조 및 이미지 양식 100% 매칭
function renderOverviewForm(name, address) {
    const targetTitle = document.getElementById('current-info-facility-name');
    const targetGenTable = document.getElementById('table-general-status');
    const targetFacTable = document.getElementById('table-instt-status');
    
    const btnGen = document.getElementById('btn-add-gen-row');
    const btnFac = document.getElementById('btn-add-fac-row');
    if(btnGen) btnGen.style.display = 'none';
    if(btnFac) btnFac.style.display = 'none';
    
    if(targetTitle) {
        targetTitle.innerHTML = `${name || "사업장을 검색/선택해주세요"} <span style="font-size:0.9rem; color:#10b981;">(보고서용 사업장 개요)</span>`;
    }

    // display: flex; 를 활용해 좌측 50%, 우측 50%로 화면 꽉 차게 분할
    const formHTML = `
        <div style="display: flex; gap: 20px; width: 100%; box-sizing: border-box; font-family: 'Pretendard', sans-serif;">
            
            <div style="flex: 1; background: #fff; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <h3 style="margin-top:0; color:#1e293b; border-left:4px solid #2563eb; padding-left:10px; font-size:16px;">1. 기본 정보</h3>
                <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left; border-top: 2px solid #1e293b;">
                    <tbody>
                        <tr>
                            <th style="width:25%; background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1; color:#334155;">사업장명</th>
                            <td style="padding:10px; border:1px solid #cbd5e1;">
                                <input type="text" id="overview-name" value="${name}" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px;">
                            </td>
                        </tr>
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1; color:#334155;">대표자명</th>
                            <td style="padding:10px; border:1px solid #cbd5e1;">
                                <input type="text" id="overview-ceo" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px;">
                            </td>
                        </tr>
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1; color:#334155;">소재지</th>
                            <td style="padding:10px; border:1px solid #cbd5e1;">
                                <input type="text" id="overview-address" value="${address}" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px;">
                            </td>
                        </tr>
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1; color:#334155;">연락처</th>
                            <td style="padding:10px; border:1px solid #cbd5e1;">
                                <input type="text" id="overview-contact" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px;" placeholder="예: 02-123-4567">
                            </td>
                        </tr>
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1; color:#334155;">업종</th>
                            <td style="padding:10px; border:1px solid #cbd5e1;">
                                <input type="text" id="overview-industry" value="보건업 및 사회복지 서비스업" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px;">
                            </td>
                        </tr>
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1; color:#334155;">시설관리자</th>
                            <td style="padding:10px; border:1px solid #cbd5e1;">
                                <input type="text" id="overview-manager" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px;" placeholder="성명 입력">
                            </td>
                        </tr>
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1; color:#334155;">주요 사업<br>(생산품)</th>
                            <td style="padding:10px; border:1px solid #cbd5e1;">
                                <textarea id="overview-service" rows="3" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px; resize:vertical;">노인요양시설 운영 및 주야간 보호 서비스</textarea>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style="flex: 1; background: #fff; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <h3 style="margin-top:0; color:#1e293b; border-left:4px solid #10b981; padding-left:10px; font-size:16px;">2. 시설 및 규모 상세</h3>
                <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left; border-top: 2px solid #1e293b;">
                    <tbody>
                        <tr>
                            <th style="width:25%; background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1; color:#334155;">규모</th>
                            <td style="padding:10px; border:1px solid #cbd5e1;">
                                <div style="display:flex; flex-wrap:wrap; gap:10px; line-height: 1.8;">
                                    <div><span style="color:#64748b;">대지면적:</span> <input type="number" id="overview-area-land" style="width:70px; padding:4px; border:1px solid #ccc; border-radius:4px;"> ㎡</div>
                                    <div><span style="color:#64748b;">연면적:</span> <input type="number" id="overview-area-total" style="width:70px; padding:4px; border:1px solid #ccc; border-radius:4px;"> ㎡</div>
                                    <div><span style="color:#64748b;">층수:</span> 지하 <input type="number" id="overview-floor-under" style="width:40px; padding:4px; border:1px solid #ccc; border-radius:4px;"> 층 / 지상 <input type="number" id="overview-floor-ground" style="width:40px; padding:4px; border:1px solid #ccc; border-radius:4px;"> 층</div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1; color:#334155;">건축구조</th>
                            <td style="padding:10px; border:1px solid #cbd5e1;">
                                <input type="text" id="overview-structure" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px;" placeholder="예: 철근콘크리트조">
                            </td>
                        </tr>
                        
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1; color:#334155;" rowspan="2">인원현황</th>
                            <td style="padding:10px; border:1px solid #cbd5e1;">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <span style="font-weight:bold; background:#e2e8f0; padding:4px; border-radius:4px; width:55px; text-align:center;">종사자</span>
                                    <span>남 <input type="number" id="overview-emp-m" style="width:45px; padding:4px; border:1px solid #ccc; border-radius:4px; text-align:right;" value="0" min="0"></span>
                                    <span>여 <input type="number" id="overview-emp-f" style="width:45px; padding:4px; border:1px solid #ccc; border-radius:4px; text-align:right;" value="0" min="0"></span>
                                    <span style="margin-left:auto; font-weight:bold;">계 <span id="overview-emp-total" style="color:#2563eb; font-size:15px; margin:0 5px;">0</span>명</span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px; border:1px solid #cbd5e1;">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <span style="font-weight:bold; background:#e2e8f0; padding:4px; border-radius:4px; width:55px; text-align:center;">이용자</span>
                                    <span>남 <input type="number" id="overview-user-m" style="width:45px; padding:4px; border:1px solid #ccc; border-radius:4px; text-align:right;" value="0" min="0"></span>
                                    <span>여 <input type="number" id="overview-user-f" style="width:45px; padding:4px; border:1px solid #ccc; border-radius:4px; text-align:right;" value="0" min="0"></span>
                                    <span style="margin-left:auto; font-weight:bold;">계 <span id="overview-user-total" style="color:#2563eb; font-size:15px; margin:0 5px;">0</span>명</span>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1; color:#334155;">화재보험<br>가입 내역</th>
                            <td style="padding:10px; border:1px solid #cbd5e1;">
                                <div style="margin-bottom:10px;">
                                    <span style="color:#64748b; margin-right:15px; font-weight:bold;">가입 유무:</span>
                                    <label style="margin-right:15px;"><input type="radio" name="overview-insurance-yn" value="O" checked> 가입(O)</label>
                                    <label><input type="radio" name="overview-insurance-yn" value="X"> 미가입(X)</label>
                                </div>
                                <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center;">
                                    <div><span style="color:#64748b; font-weight:bold;">보험사명:</span> <input type="text" id="overview-insurance-company" style="width:120px; padding:4px; border:1px solid #ccc; border-radius:4px;"></div>
                                    <div style="width:100%;"><span style="color:#64748b; font-weight:bold;">보험기간:</span> <input type="text" id="overview-insurance-date" style="width:85%; padding:4px; border:1px solid #ccc; border-radius:4px;" placeholder="예: 2026.01.01 ~ 2027.01.01"></div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>

        <div style="text-align:right; margin-top:25px; width:100%;">
            <button onclick="saveOverviewData()" style="background:#2563eb; color:white; border:none; padding:14px 30px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:15px; box-shadow: 0 4px 6px rgba(37,99,235,0.2);">
                💾 입력 정보 저장 및 보고서 데이터 연동 준비
            </button>
        </div>
    `;

    if(targetGenTable) {
        targetGenTable.innerHTML = formHTML;
    }
    
    // 빈 박스 숨김
    if(targetFacTable) {
        targetFacTable.innerHTML = "";
        targetFacTable.style.display = 'none';
        const parentPanel = targetFacTable.closest('.info-panel') || targetFacTable.parentElement;
        if(parentPanel) parentPanel.style.display = 'none';
    }
    
    // 인원 합계 자동계산 이벤트 연결
    setTimeout(() => {
        const calcSum = (mId, fId, totId) => {
            const m = parseInt(document.getElementById(mId).value) || 0;
            const f = parseInt(document.getElementById(fId).value) || 0;
            document.getElementById(totId).innerText = m + f;
        };

        ['overview-emp-m', 'overview-emp-f'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.addEventListener('input', () => calcSum('overview-emp-m', 'overview-emp-f', 'overview-emp-total'));
        });

        ['overview-user-m', 'overview-user-f'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.addEventListener('input', () => calcSum('overview-user-m', 'overview-user-f', 'overview-user-total'));
        });
    }, 100);
}

// [5] 보고서 연동용 데이터 저장 함수
function saveOverviewData() {
    const name = document.getElementById('overview-name')?.value;
    if(!name) { alert("사업장명을 입력해주세요."); return; }
    
    const insYnNode = document.querySelector('input[name="overview-insurance-yn"]:checked');
    
    const overviewData = {
        name: name,
        ceo: document.getElementById('overview-ceo')?.value,
        address: document.getElementById('overview-address')?.value,
        contact: document.getElementById('overview-contact')?.value,
        industry: document.getElementById('overview-industry')?.value,
        manager: document.getElementById('overview-manager')?.value,
        
        empM: document.getElementById('overview-emp-m')?.value,
        empF: document.getElementById('overview-emp-f')?.value,
        empTotal: document.getElementById('overview-emp-total')?.innerText,
        userM: document.getElementById('overview-user-m')?.value,
        userF: document.getElementById('overview-user-f')?.value,
        userTotal: document.getElementById('overview-user-total')?.innerText,
        
        areaLand: document.getElementById('overview-area-land')?.value,
        areaTotal: document.getElementById('overview-area-total')?.value,
        floorUnder: document.getElementById('overview-floor-under')?.value,
        floorGround: document.getElementById('overview-floor-ground')?.value,
        structure: document.getElementById('overview-structure')?.value,
        
        insuranceYn: insYnNode ? insYnNode.value : 'X',
        insuranceCompany: document.getElementById('overview-insurance-company')?.value,
        insuranceDate: document.getElementById('overview-insurance-date')?.value,
        service: document.getElementById('overview-service')?.value
    };
    
    localStorage.setItem('riskAssessmentOverview', JSON.stringify(overviewData));
    alert(`[${name}] 일반현황 데이터가 저장되었습니다.\n추후 보고서 출력 시 이 내용이 그대로 맵핑됩니다.`);
}

function fetchFacilityData() {} 
function loadMockFacilities() {}