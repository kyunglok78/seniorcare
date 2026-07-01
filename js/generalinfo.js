let mapInstance = null;
let ps = null; 
let infowindow = null;
let markers = [];
let globalFacilityList = [];

function initMap() {
    const container = document.getElementById('kakao-map');
    if (!container) {
        setTimeout(initMap, 500);
        return;
    }
    if(typeof kakao === 'undefined' || !kakao.maps || !kakao.maps.services) {
        console.error('카카오맵 라이브러리 연결 실패');
        return;
    }
    
    mapInstance = new kakao.maps.Map(container, { center: new kakao.maps.LatLng(37.566826, 126.9786567), level: 5 });
    ps = new kakao.maps.services.Places(); 
    infowindow = new kakao.maps.InfoWindow({zIndex:1});
    mapInstance.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);

    const saved = localStorage.getItem('riskAssessmentOverview');
    if(saved) {
        const data = JSON.parse(saved);
        renderOverviewForm(data.name || "", data.address || "");
        restoreFormUIData(data);
    } else {
        renderOverviewForm("", "");
    }
}

function searchFacility() {
    const keyword = document.getElementById('search-facility-input').value.trim();
    if(!keyword) { alert("기관명 혹은 주소를 입력해 주십시오."); return; }
    ps.keywordSearch(keyword, placesSearchCB);
}

function placesSearchCB(data, status) {
    if (status === kakao.maps.services.Status.OK) { displayPlaces(data); }
    else if (status === kakao.maps.services.Status.ZERO_RESULT) { alert('결과가 없습니다.'); updateFacilityListUI([]); }
}

function displayPlaces(places) {
    clearMap();
    globalFacilityList = places;
    const bounds = new kakao.maps.LatLngBounds();

    for (let i = 0; i < places.length; i++) {
        const pos = new kakao.maps.LatLng(places[i].y, places[i].x);
        const marker = new kakao.maps.Marker({ position: pos, map: mapInstance });
        markers.push(marker);
        
        const title = places[i].place_name;
        const address = places[i].road_address_name || places[i].address_name;

        kakao.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(`<div style="padding:5px;font-size:12px;">${title}</div>`);
            infowindow.open(mapInstance, marker);
            renderOverviewForm(title, address);
            if(typeof updateGlobalFacilityLink === 'function') updateGlobalFacilityLink(title);
        });
        bounds.extend(pos);
    }
    mapInstance.setBounds(bounds);
    updateFacilityListUI(places);
}

function clearMap() { markers.forEach(m => m.setMap(null)); markers = []; }

function updateFacilityListUI(places) {
    const container = document.getElementById('facility-list-container');
    const badge = document.getElementById('search-count-badge');
    if(badge) badge.innerText = places.length;
    if(!container) return;
    
    container.innerHTML = '';
    if (places.length === 0) { container.innerHTML = `<div style="padding:30px;text-align:center;color:#94a3b8;">결과가 없습니다.</div>`; return; }

    places.forEach((place, i) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'facility-list-item';
        const address = place.road_address_name || place.address_name;
        itemDiv.innerHTML = `<div class="facility-list-name">${place.place_name}</div><div class="facility-list-addr">${address}</div>`;
        
        itemDiv.onclick = () => {
            const pos = new kakao.maps.LatLng(place.y, place.x);
            mapInstance.panTo(pos);
            infowindow.setContent(`<div style="padding:5px;font-size:12px;">${place.place_name}</div>`);
            infowindow.open(mapInstance, markers[i]);
            renderOverviewForm(place.place_name, address);
            if(typeof updateGlobalFacilityLink === 'function') updateGlobalFacilityLink(place.place_name);
        };
        container.appendChild(itemDiv);
    });
}

function renderOverviewForm(name, address) {
    const targetGenTable = document.getElementById('table-general-status');
    const numInputFilter = `min="0" oninput="if(this.value < 0) this.value = 0;"`;

    const formHTML = `
        <div style="display: flex; gap: 40px; width: 100%; box-sizing: border-box; font-family: 'Pretendard', sans-serif;">
            <div style="flex: 1; padding-right: 10px;">
                <h3 style="margin-top:0; color:#1e293b; border-left:4px solid #2563eb; padding-left:10px; font-size:16px;">1. 기본 정보</h3>
                <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left; border-top: 2px solid #1e293b;">
                    <tbody>
                        <tr>
                            <th style="width:25%; background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1;">사업장명</th>
                            <td><input type="text" id="frm-name" value="${name}" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px;" onchange="if(typeof updateGlobalFacilityLink==='function') updateGlobalFacilityLink(this.value);"></td>
                        </tr>
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1;">대표자명</th>
                            <td><input type="text" id="frm-ceo" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px;"></td>
                        </tr>
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1;">소재지</th>
                            <td><input type="text" id="frm-addr" value="${address}" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px;"></td>
                        </tr>
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1;">연락처</th>
                            <td><input type="text" id="frm-contact" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px;"></td>
                        </tr>
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1;">업종</th>
                            <td><input type="text" id="frm-industry" value="보건업 및 사회복지 서비스업" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px;"></td>
                        </tr>
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1;">시설관리자</th>
                            <td><input type="text" id="frm-manager" style="width:95%; padding:6px; border:1px solid #ccc; border-radius:4px;"></td>
                        </tr>
                        <tr>
                            <th style="background:#f8fafc; padding:12px 10px; border:1px solid #cbd5e1;">관계자<br>(안전진단 대응자)</th>
                            <td>
                                <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:center;">
                                    <tr style="background:#f1f5f9;">
                                        <th style="padding:6px; border:1px solid #cbd5e1; font-weight:normal;">직급/소속</th>
                                        <th style="padding:6px; border:1px solid #cbd5e1; font-weight:normal;">성명</th>
                                        <th style="padding:6px; border:1px solid #cbd5e1; font-weight:normal;">연락처</th>
                                    </tr>
                                    ${[1,2,3,4,5].map(i => `
                                    <tr>
                                        <td style="padding:4px; border:1px solid #cbd5e1;"><input type="text" id="frm-resp-role-${i}" style="width:95%; padding:4px; border:1px solid #ccc; border-radius:3px;"></td>
                                        <td style="padding:4px; border:1px solid #cbd5e1;"><input type="text" id="frm-resp-name-${i}" style="width:95%; padding:4px; border:1px solid #ccc; border-radius:3px;"></td>
                                        <td style="padding:4px; border:1px solid #cbd5e1;"><input type="text" id="frm-resp-tel-${i}" style="width:95%; padding:4px; border:1px solid #ccc; border-radius:3px;"></td>
                                    </tr>`).join('')}
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
                            <th style="width:18%; background:#f1f5f9; padding:8px; border:1px solid #cbd5e1; text-align:center;" rowspan="5">규모/구조</th>
                            <td style="width:41%; border:1px solid #cbd5e1;">건축면적 <input type="number" id="frm-area-build" ${numInputFilter} step="0.01" style="width:60px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:right;"> ㎡</td>
                            <td style="width:41%; border:1px solid #cbd5e1;">연면적 <input type="number" id="frm-area-tot" ${numInputFilter} step="0.01" style="width:60px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:right;"> ㎡</td>
                        </tr>
                        <tr>
                            <td style="border:1px solid #cbd5e1;">용도: <input type="text" id="frm-usage" style="width:100px; border:none; border-bottom:1px solid #94a3b8; outline:none;" value="노인복지시설"></td>
                            <td style="border:1px solid #cbd5e1;">소방안전관리대상: <input type="number" id="frm-fire-class" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 급</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="border:1px solid #cbd5e1;">건축동수 <input type="number" id="frm-bld-cnt" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 개동 (지상 <input type="number" id="frm-flr-g" ${numInputFilter} style="width:30px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 층 / 지하 <input type="number" id="frm-flr-u" ${numInputFilter} style="width:30px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 층)</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="border:1px solid #cbd5e1;">建物구조: <input type="text" id="frm-structure" style="width:250px; border:none; border-bottom:1px solid #94a3b8; outline:none;" placeholder="예: 철근콘크리트조/슬래브"></td>
                        </tr>
                        <tr>
                            <td colspan="2" style="border:1px solid #cbd5e1;">피난계단 <input type="number" id="frm-stair" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 개소 | 승강기 <input type="number" id="frm-elev" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 대 | 주차장: <input type="text" id="frm-park" style="width:120px; border:none; border-bottom:1px solid #94a3b8; outline:none;"></td>
                        </tr>
                        <tr>
                            <th style="background:#f1f5f9; padding:8px; border:1px solid #cbd5e1; text-align:center;" rowspan="3">인원현황</th>
                            <td colspan="2" style="border:1px solid #cbd5e1;">거주인원 총 <input type="number" id="frm-res-tot" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center; font-weight:bold;"> 명 ( 1인실: <input type="number" id="frm-res-1" ${numInputFilter} style="width:30px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 명, 2인실: <input type="number" id="frm-res-2" ${numInputFilter} style="width:30px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 명 )</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="border:1px solid #cbd5e1;">근무인원 <input type="number" id="frm-emp-tot" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center; font-weight:bold;"> 명 ( 주간 <input type="number" id="frm-emp-d" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 명, 야간 <input type="number" id="frm-emp-n" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 명 )</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="border:1px solid #cbd5e1;">고령자 <input type="number" id="frm-vul-old" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 명 &nbsp;&nbsp; 영유아 <input type="number" id="frm-vul-chi" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 명 &nbsp;&nbsp; 장애인 <input type="number" id="frm-vul-dis" ${numInputFilter} style="width:40px; border:none; border-bottom:1px solid #94a3b8; outline:none; text-align:center;"> 명</td>
                        </tr>
                        <tr>
                            <th style="background:#f1f5f9; padding:8px; border:1px solid #cbd5e1; text-align:center;">화재보험가입</th>
                            <td colspan="2" style="padding:0; border:1px solid #cbd5e1;">
                                <table style="width:100%; border-collapse:collapse; text-align:center;">
                                    <tr style="background:#f8fafc; border-bottom:1px solid #cbd5e1;">
                                        <th style="padding:6px; border-right:1px solid #cbd5e1; font-weight:normal;">가입기간</th>
                                        <th style="padding:6px; border-right:1px solid #cbd5e1; font-weight:normal;">보험사명</th>
                                        <th style="padding:6px; border-right:1px solid #cbd5e1; font-weight:normal;">가입대상</th>
                                        <th style="padding:6px; font-weight:normal;">가입금액</th>
                                    </tr>
                                    <tr>
                                        <td style="border-right:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1;" rowspan="2">
                                            <input type="date" id="frm-ins-start" style="width:95px; font-size:11px;"><br>~<br><input type="date" id="frm-ins-end" style="width:95px; font-size:11px;">
                                        </td>
                                        <td style="border-right:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1;" rowspan="2"><input type="text" id="frm-ins-comp" style="width:75px; text-align:center;"></td>
                                        <td style="border-right:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1;">대인</td>
                                        <td style="border-bottom:1px solid #cbd5e1;"><input type="number" id="frm-ins-p" ${numInputFilter} style="width:50px; text-align:right;"> 천만</td>
                                    </tr>
                                    <tr>
                                        <td style="border-right:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1;">대물</td>
                                        <td style="border-bottom:1px solid #cbd5e1;"><input type="number" id="frm-ins-m" ${numInputFilter} style="width:50px; text-align:right;"> 천만</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // 💡 화면 붕괴를 일으키던 무한 확장 코드(while)를 완전히 삭제했습니다!!
    if(targetGenTable) {
        targetGenTable.innerHTML = formHTML;
    }
}

function restoreFormUIData(data) {
    if(!data) return;
    setTimeout(() => {
        if(document.getElementById('frm-ceo')) document.getElementById('frm-ceo').value = data.ceo || "";
        if(document.getElementById('frm-contact')) document.getElementById('frm-contact').value = data.contact || "";
        if(document.getElementById('frm-manager')) document.getElementById('frm-manager').value = data.manager || "";
        if(document.getElementById('frm-industry')) document.getElementById('frm-industry').value = data.industry || "";
        
        if(data.responders && data.responders.length) {
            data.responders.forEach((resp, idx) => {
                const i = idx + 1;
                if(document.getElementById(`frm-resp-role-${i}`)) document.getElementById(`frm-resp-role-${i}`).value = resp.role || "";
                if(document.getElementById(`frm-resp-name-${i}`)) document.getElementById(`frm-resp-name-${i}`).value = resp.name || "";
                if(document.getElementById(`frm-resp-tel-${i}`)) document.getElementById(`frm-resp-tel-${i}`).value = resp.tel || "";
            });
        }
        
        if(document.getElementById('frm-area-build')) document.getElementById('frm-area-build').value = data.areaBuild || "";
        if(document.getElementById('frm-area-tot')) document.getElementById('frm-area-tot').value = data.areaTot || "";
        if(document.getElementById('frm-usage')) document.getElementById('frm-usage').value = data.usage || "";
        if(document.getElementById('frm-fire-class')) document.getElementById('frm-fire-class').value = data.fireClass || "";
        if(document.getElementById('frm-bld-cnt')) document.getElementById('frm-bld-cnt').value = data.bldCnt || "";
        if(document.getElementById('frm-flr-g')) document.getElementById('frm-flr-g').value = data.flrG || "";
        if(document.getElementById('frm-flr-u')) document.getElementById('frm-flr-u').value = data.flrU || "";
        if(document.getElementById('frm-structure')) document.getElementById('frm-structure').value = data.structure || "";
        if(document.getElementById('frm-stair')) document.getElementById('frm-stair').value = data.stair || "";
        if(document.getElementById('frm-elev')) document.getElementById('frm-elev').value = data.elev || "";
        if(document.getElementById('frm-park')) document.getElementById('frm-park').value = data.park || "";
        
        if(document.getElementById('frm-res-tot')) document.getElementById('frm-res-tot').value = data.resTot || "";
        if(document.getElementById('frm-res-1')) document.getElementById('frm-res-1').value = data.res1 || "";
        if(document.getElementById('frm-res-2')) document.getElementById('frm-res-2').value = data.res2 || "";
        if(document.getElementById('frm-emp-tot')) document.getElementById('frm-emp-tot').value = data.empTot || "";
        if(document.getElementById('frm-emp-d')) document.getElementById('frm-emp-d').value = data.empD || "";
        if(document.getElementById('frm-emp-n')) document.getElementById('frm-emp-n').value = data.empN || "";
        if(document.getElementById('frm-vul-old')) document.getElementById('frm-vul-old').value = data.vulOld || "";
        if(document.getElementById('frm-vul-chi')) document.getElementById('frm-vul-chi').value = data.vulChi || "";
        if(document.getElementById('frm-vul-dis')) document.getElementById('frm-vul-dis').value = data.vulDis || "";
        
        if(document.getElementById('frm-ins-start')) document.getElementById('frm-ins-start').value = data.insStart || "";
        if(document.getElementById('frm-ins-end')) document.getElementById('frm-ins-end').value = data.insEnd || "";
        if(document.getElementById('frm-ins-comp')) document.getElementById('frm-ins-comp').value = data.insComp || "";
        if(document.getElementById('frm-ins-p')) document.getElementById('frm-ins-p').value = data.insP || "";
        if(document.getElementById('frm-ins-m')) document.getElementById('frm-ins-m').value = data.insM || "";
    }, 200);
}

function saveOverviewData() {
    const nameEl = document.getElementById('frm-name');
    if(!nameEl || !nameEl.value.trim()) return null;
    
    const responders = [];
    for (let i = 1; i <= 5; i++) {
        responders.push({
            role: document.getElementById(`frm-resp-role-${i}`)?.value || "",
            name: document.getElementById(`frm-resp-name-${i}`)?.value || "",
            tel: document.getElementById(`frm-resp-tel-${i}`)?.value || ""
        });
    }
    
    return {
        name: nameEl.value,
        ceo: document.getElementById('frm-ceo')?.value,
        address: document.getElementById('frm-addr')?.value,
        contact: document.getElementById('frm-contact')?.value,
        industry: document.getElementById('frm-industry')?.value,
        manager: document.getElementById('frm-manager')?.value,
        responders: responders,
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
}
function fetchFacilityData() {} function loadMockFacilities() {}