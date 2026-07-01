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

// 💡 [핵심] 좌우 2단 분할 및 음수 차단 적용 / 주요사업 대신 '관계자 5명' 입력 폼 추가
function renderOverviewForm(name, address) {
    const targetTitle = document.getElementById('current-info-facility-name');
    const targetGenTable = document.getElementById('table-general-status');
    const targetFacTable = document.getElementById('table-instt-status');
    
    if(targetTitle) {
        targetTitle.innerHTML = `${name || "사업장을 검색/선택해주세요"} <span style="font-size:0.9rem; color:#10b981;">(보고서용 사업장 개요)</span>`;
    }

    const numInputFilter = `min="0" oninput="if(this.value < 0) this.value = 0;"`;

    const formHTML = `
        <div style="display: flex; gap: 40px; width: 100%; box-sizing: border-box; font-family: 'Pretendard', sans-serif;">
            
            <div style="flex: 1; padding-right: 10px;">
                <h3 style="margin-top:0; color:#1e293b; border-left:4px solid #2563eb; padding-left:10px; font-size:16px;">1. 기본 정보</h3>
                <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left; border-top: 2px solid #1e293b;">
                    <tbody>
                        <tr>
                            <th style="width:25%; background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1; color:#334155;">사업장명</th>
                            <td style="padding:8px; border:1px solid #cbd5e1;">
                                <input type="text" id="frm-name" value="${name}" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px;">
                            </td>
                        </tr>
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1; color:#334155;">대표자명</th>
                            <td style="padding:8px; border:1px solid #cbd5e1;">
                                <input type="text" id="frm-ceo" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px;">
                            </td>
                        </tr>
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1; color:#334155;">소재지</th>
                            <td style="padding:8px; border:1px solid #cbd5e1;">
                                <input type="text" id="frm-addr" value="${address}" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px;">
                            </td>
                        </tr>
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1; color:#334155;">연락처</th>
                            <td style="padding:8px; border:1px solid #cbd5e1;">
                                <input type="text" id="frm-contact" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px;" placeholder="예: 02-123-4567">
                            </td>
                        </tr>
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1; color:#334155;">업종</th>
                            <td style="padding:8px; border:1px solid #cbd5e1;">
                                <input type="text" id="frm-industry" value="보건업 및 사회복지 서비스업" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px;">
                            </td>
                        </tr>
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1; color:#334155;">시설관리자</th>
                            <td style="padding:8px; border:1px solid #cbd5e1;">
                                <input type="text" id="frm-manager" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px;" placeholder="성명 및 연락처 기입">
                            </td>
                        </tr>
                        
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1; color:#334155;">관계자<br>(안전진단 대응자)</th>
                            <td style="padding:8px; border:1px solid #cbd5e1;">
                                <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:center;">
                                    <tr style="background:#f1f5f9; border-bottom:1px solid #cbd5e1;">
                                        <th style="padding:6px; border:1px solid #cbd5e1; font-weight:normal; width:30%;">직급/소속</th>
                                        <th style="padding:6px; border:1px solid #cbd5e1; font-weight:normal; width:30%;">성명</th>
                                        <th style="padding:6px; border:1px solid #cbd5e1; font-weight:normal; width:40%;">연락처</th>
                                    </tr>
                                    ${[1,2,3,4,5].map(i => `
                                    <tr>
                                        <td style="padding:4px; border:1px solid #cbd5e1;"><input type="text" id="frm-resp-role-${i}" style="width:95%; padding:4px; border:1px solid #ccc; border-radius:3px;"></td>
                                        <td style="padding:4px; border:1px solid #cbd5e1;"><input type="text" id="frm-resp-name-${i}" style="width:95%; padding:4px; border:1px solid #ccc; border-radius:3px;"></td>
                                        <td style="padding:4px; border:1px solid #cbd5e1;"><input type="text" id="frm-resp-tel-${i}" style="width:95%; padding:4px; border:1px solid #ccc; border-radius:3px;"></td>
                                    </tr>
                                    `).join('')}
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style="flex: 1;">
                <h3 style="margin-top:0; color:#1e293b; border-left:4px solid #10b981; padding-left:10px; font-size:16px;">2. 시설 및 규모 상세</h3>
                <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:left; border-top: 2px solid #1e293b;">
                    <tbody>
                        <tr>
                            <th style="width:18%; background:#f1f5f9; padding:8px; border:1px solid #cbd5e1; color:#334155; text-align:center;" rowspan="5">규모/구조</th>
                            <td style="width:41%; padding:6px 10px; border:1px solid #cbd5e1;">
                                건축면적 <input type="number" id="frm-area-build" ${numInputFilter} step="0.01" style="width:60px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:right;"> ㎡
                            </td>
                            <td style="width:41%; padding:6px 10px; border:1px solid #cbd5e1;">
                                연면적 <input type="number" id="frm-area-tot" ${numInputFilter} step="0.01" style="width:60px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:right;"> ㎡
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:6px 10px; border:1px solid #cbd5e1;">
                                용도: <input type="text" id="frm-usage" style="width:100px; border:none; border-bottom:1px solid #94a3b8; outline:none;" value="노인복지시설">
                            </td>
                            <td style="padding:6px 10px; border:1px solid #cbd5e1;">
                                소방안전관리대상: <input type="number" id="frm-fire-class" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 급
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding:6px 10px; border:1px solid #cbd5e1;">
                                건축동수 <input type="number" id="frm-bld-cnt" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 개동 
                                <span style="color:#64748b; margin-left:10px;">(지상 <input type="number" id="frm-flr-g" ${numInputFilter} style="width:30px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 층 / 지하 <input type="number" id="frm-flr-u" ${numInputFilter} style="width:30px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 층)</span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding:6px 10px; border:1px solid #cbd5e1;">
                                건물구조: <input type="text" id="frm-structure" style="width:250px; border:none; border-bottom:1px solid #94a3b8; outline:none;" placeholder="예: 철근콘크리트조/슬래브">
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding:6px 10px; border:1px solid #cbd5e1;">
                                피난계단 <input type="number" id="frm-stair" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 개소 
                                &nbsp;&nbsp;|&nbsp;&nbsp; 승강기 <input type="number" id="frm-elev" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 대 
                                &nbsp;&nbsp;|&nbsp;&nbsp; 주차장: <input type="text" id="frm-park" style="width:120px; border:none; border-bottom:1px solid #94a3b8; outline:none;" placeholder="기계식 및 옥외">
                            </td>
                        </tr>

                        <tr>
                            <th style="background:#f1f5f9; padding:8px; border:1px solid #cbd5e1; color:#334155; text-align:center;" rowspan="3">인원현황</th>
                            <td colspan="2" style="padding:6px 10px; border:1px solid #cbd5e1;">
                                거주인원 총 <input type="number" id="frm-res-tot" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center; font-weight:bold;"> 명 
                                <span style="color:#64748b; margin-left:10px;">( 1인실: <input type="number" id="frm-res-1" ${numInputFilter} style="width:30px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 명, 2인실: <input type="number" id="frm-res-2" ${numInputFilter} style="width:30px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 명 )</span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding:6px 10px; border:1px solid #cbd5e1;">
                                근무인원 <input type="number" id="frm-emp-tot" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center; font-weight:bold;"> 명 
                                <span style="color:#64748b; margin-left:10px;">( 주간 <input type="number" id="frm-emp-d" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 명, 야간 <input type="number" id="frm-emp-n" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 명 )</span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding:6px 10px; border:1px solid #cbd5e1;">
                                고령자 <input type="number" id="frm-vul-old" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 명
                                &nbsp;&nbsp;&nbsp;&nbsp; 영유아 <input type="number" id="frm-vul-chi" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 명
                                &nbsp;&nbsp;&nbsp;&nbsp; 장애인 <input type="number" id="frm-vul-dis" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 명
                            </td>
                        </tr>

                        <tr>
                            <th style="background:#f1f5f9; padding:8px; border:1px solid #cbd5e1; color:#334155; text-align:center;">화재보험가입</th>
                            <td colspan="2" style="padding:0; border:1px solid #cbd5e1;">
                                <table style="width:100%; border-collapse:collapse; text-align:center;">
                                    <tr style="background:#f8fafc; border-bottom:1px solid #cbd5e1;">
                                        <th style="padding:6px; border-right:1px solid #cbd5e1; font-weight:normal;">가입기간</th>
                                        <th style="padding:6px; border-right:1px solid #cbd5e1; font-weight:normal;">보험사명</th>
                                        <th style="padding:6px; border-right:1px solid #cbd5e1; font-weight:normal;">가입대상</th>
                                        <th style="padding:6px; font-weight:normal;">가입금액</th>
                                    </tr>
                                    <tr>
                                        <td style="padding:6px; border-right:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1;" rowspan="2">
                                            <input type="date" id="frm-ins-start" style="width:100px; padding:2px; font-size:11px;"><br>~<br><input type="date" id="frm-ins-end" style="width:100px; padding:2px; font-size:11px;">
                                        </td>
                                        <td style="padding:6px; border-right:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1;" rowspan="2">
                                            <input type="text" id="frm-ins-comp" style="width:80px; padding:4px; text-align:center;" placeholder="한화 손해보험">
                                        </td>
                                        <td style="padding:6px; border-right:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1;">대인</td>
                                        <td style="padding:6px; border-bottom:1px solid #cbd5e1;">
                                            <input type="number" id="frm-ins-p" ${numInputFilter} style="width:60px; padding:4px; text-align:right;"> 천만원
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:6px; border-right:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1;">대물</td>
                                        <td style="padding:6px; border-bottom:1px solid #cbd5e1;">
                                            <input type="number" id="frm-ins-m" ${numInputFilter} style="width:60px; padding:4px; text-align:right;"> 천만원
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    if(targetGenTable && targetFacTable) {
        targetGenTable.innerHTML = formHTML;
        
        let rightEl = targetFacTable;
        while(rightEl && rightEl.parentElement) {
            rightEl.style.display = 'none';
            if (rightEl.parentElement.contains(targetGenTable)) break; 
            rightEl = rightEl.parentElement;
        }

        let leftEl = targetGenTable;
        while(leftEl && leftEl.parentElement) {
            leftEl.style.width = '100%';
            leftEl.style.maxWidth = '100%';
            leftEl.style.flex = '0 0 100%';
            
            if (leftEl.parentElement.contains(targetFacTable)) {
                leftEl.parentElement.style.display = 'block'; 
                break;
            }
            leftEl = leftEl.parentElement;
        }
    }
}

// [5] 💡 데이터 저장 시 관계자 5명 정보 배열화하여 추가
function saveOverviewData() {
    const name = document.getElementById('frm-name')?.value;
    if(!name) { 
        return null; 
    }
    
    // 관계자 데이터 배열 수집
    const responders = [];
    for (let i = 1; i <= 5; i++) {
        responders.push({
            role: document.getElementById(`frm-resp-role-${i}`)?.value || "",
            name: document.getElementById(`frm-resp-name-${i}`)?.value || "",
            tel: document.getElementById(`frm-resp-tel-${i}`)?.value || ""
        });
    }
    
    const overviewData = {
        name: name,
        ceo: document.getElementById('frm-ceo')?.value,
        address: document.getElementById('frm-addr')?.value,
        contact: document.getElementById('frm-contact')?.value,
        industry: document.getElementById('frm-industry')?.value,
        manager: document.getElementById('frm-manager')?.value,
        
        responders: responders, // 배열로 저장됨
        
        areaBuild: document.getElementById('frm-area-build')?.value,
        areaTot: document.getElementById('frm-area-tot')?.value,
        usage: document.getElementById('frm-usage')?.value,
        fireClass: document.getElementById('frm-fire-class')?.value,
        bldCnt: document.getElementById('frm-bld-cnt')?.value,
        flrG: document.getElementById('frm-flr-g')?.value,
        flrU: document.getElementById('frm-flr-u')?.value,
        structure: document.getElementById('frm-structure')?.value,
        stair: document.getElementById('frm-stair')?.value,
        elev: document.getElementById('frm-elev')?.value,
        park: document.getElementById('frm-park')?.value,
        
        resTot: document.getElementById('frm-res-tot')?.value,
        res1: document.getElementById('frm-res-1')?.value,
        res2: document.getElementById('frm-res-2')?.value,
        empTot: document.getElementById('frm-emp-tot')?.value,
        empD: document.getElementById('frm-emp-d')?.value,
        empN: document.getElementById('frm-emp-n')?.value,
        vulOld: document.getElementById('frm-vul-old')?.value,
        vulChi: document.getElementById('frm-vul-chi')?.value,
        vulDis: document.getElementById('frm-vul-dis')?.value,
        
        insStart: document.getElementById('frm-ins-start')?.value,
        insEnd: document.getElementById('frm-ins-end')?.value,
        insComp: document.getElementById('frm-ins-comp')?.value,
        insP: document.getElementById('frm-ins-p')?.value,
        insM: document.getElementById('frm-ins-m')?.value
    };
    
    return overviewData;
}

function fetchFacilityData() {} 
function loadMockFacilities() {}