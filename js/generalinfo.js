let mapInstance = null;
let geocoder = null;
let markers = [];
let markerObjects = {}; 
let infowindowObjects = {}; 
let currentInfowindow = null;
let globalFacilityList = [];

// [1] 지도 초기화
function initMap() {
    const container = document.getElementById('kakao-map');
    if (!container) {
        setTimeout(initMap, 500);
        return;
    }
    if(typeof kakao === 'undefined' || !kakao.maps) {
        console.error('카카오맵 API 서버와 연결되지 않았습니다.');
        return;
    }
    if (mapInstance) {
        mapInstance.relayout();
        return;
    }
    
    mapInstance = new kakao.maps.Map(container, { center: new kakao.maps.LatLng(37.4665, 127.0227), level: 8 });
    geocoder = new kakao.maps.services.Geocoder();
    mapInstance.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);

    fetchFacilityData();
}

function clearMap() {
    markers.forEach(m => m.setMap(null));
    markers = [];
    markerObjects = {};
    infowindowObjects = {};
    if(currentInfowindow) { currentInfowindow.close(); currentInfowindow = null; }
}

// [2] 검색 및 리스트 연동
function searchFacility() {
    const keyword = document.getElementById('search-facility-input').value.trim();
    if(!keyword) { alert("검색할 기관명을 입력해주세요."); return; }
    
    clearMap();
    let foundList = [];
    globalFacilityList.forEach(fac => {
        if (fac.name.includes(keyword) || fac.addr.includes(keyword)) {
            foundList.push(fac);
            drawMarker(fac.name, fac.addr, fac.adminCd, fac.isCustom);
        }
    });
    updateFacilityListUI(foundList);
}

function updateFacilityListUI(list) {
    const container = document.getElementById('facility-list-container');
    const badge = document.getElementById('search-count-badge');
    if(badge) badge.innerText = list.length;
    if(!container) return;
    
    container.innerHTML = '';
    if (list.length === 0) {
        container.innerHTML = `<div style="padding: 30px 15px; text-align: center; color: #94a3b8; font-size: 0.9rem;">검색 결과가 없습니다.</div>`;
        return;
    }

    list.forEach(fac => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'facility-list-item';
        itemDiv.id = `list-item-${fac.adminCd}`;
        
        const badgeHtml = fac.isCustom ? `<span style="background-color:#10b981; color:white; padding:2px 4px; border-radius:4px; font-size:10px; margin-left:5px;">수동추가</span>` : '';
        itemDiv.innerHTML = `<div class="facility-list-name">${fac.name} ${badgeHtml}</div><div class="facility-list-addr">${fac.addr}</div>`;
        
        itemDiv.onclick = () => {
            document.querySelectorAll('.facility-list-item').forEach(el => el.classList.remove('active'));
            itemDiv.classList.add('active');
            
            showFacilityDetails(fac.adminCd, fac.name, fac.isCustom);
            
            if(markerObjects[fac.adminCd]) {
                const position = markerObjects[fac.adminCd].getPosition();
                mapInstance.setLevel(4);
                mapInstance.panTo(position);
                
                if(currentInfowindow) currentInfowindow.close();
                infowindowObjects[fac.adminCd].open(mapInstance, markerObjects[fac.adminCd]);
                currentInfowindow = infowindowObjects[fac.adminCd];
            }
        };
        container.appendChild(itemDiv);
    });
}

function addCustomFacility() {
    const customName = prompt("추가할 기관의 이름을 입력하세요:", "OOO 요양원");
    if(!customName) return;
    const customAddr = prompt("기관의 대략적인 주소를 입력하세요 (예: 서울 강남구 테헤란로 123):");
    if(!customAddr) return;

    const customAdminCd = "CUSTOM_" + Date.now();
    const newFac = { name: customName, addr: customAddr, adminCd: customAdminCd, isCustom: true };
    
    globalFacilityList.push(newFac);
    drawMarker(customName, customAddr, customAdminCd, true);
    updateFacilityListUI([newFac]);
    
    geocoder.addressSearch(customAddr, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            mapInstance.setLevel(4); 
            mapInstance.setCenter(coords);
        }
    });
}

function selectFacilityForEval(name, address) {
    const evalPage = document.getElementById('page-evaluation');
    if(evalPage) {
        const facilityNameSpan = evalPage.querySelector('.info-panel .info-value');
        if(facilityNameSpan) {
            const shortAddr = address.split(' ').slice(0, 2).join(' ');
            facilityNameSpan.innerText = `${name} (${shortAddr})`;
        }
    }
    const reportNameCover = document.getElementById('report-facility-name-cover');
    if(reportNameCover) reportNameCover.innerText = `[${name}]`;
    if(typeof navigate === 'function') navigate('evaluation');
    if(currentInfowindow) { currentInfowindow.close(); currentInfowindow = null; }
}

function drawMarker(name, addr, adminCd, isCustom = false) {
    if(!addr || !geocoder) return;
    
    geocoder.addressSearch(addr, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            const marker = new kakao.maps.Marker({ map: mapInstance, position: coords });
            markers.push(marker);
            markerObjects[adminCd] = marker; 
            
            const badge = isCustom ? `<span style="background-color:#10b981; color:white; padding:2px 6px; border-radius:4px; font-size:10px; margin-left:5px;">수동추가</span>` : '';
            
            const content = `
            <div style="padding:15px; width: 270px; font-family: Pretendard; box-sizing: border-box;">
                <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px; white-space: normal; line-height: 1.3;">${name} ${badge}</h4>
                <p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b; white-space: normal;">📍 ${addr}</p>
                <div style="display:flex; gap:5px;">
                    <button onclick="selectFacilityForEval('${name}', '${addr}')" style="flex: 1; padding: 8px; background-color: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">📝 이 시설 평가하기</button>
                </div>
            </div>`;
            
            const infowindow = new kakao.maps.InfoWindow({ content: content, removable: true });
            infowindowObjects[adminCd] = infowindow;
            
            kakao.maps.event.addListener(marker, 'click', () => {
                if(currentInfowindow) currentInfowindow.close();
                infowindow.open(mapInstance, marker);
                currentInfowindow = infowindow;
                
                document.querySelectorAll('.facility-list-item').forEach(el => el.classList.remove('active'));
                const listItem = document.getElementById(`list-item-${adminCd}`);
                if(listItem) {
                    listItem.classList.add('active');
                    listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                showFacilityDetails(adminCd, name, isCustom);
            });
        }
    });
}

// [3] 공공데이터 리스트 호출 (안전 우회 모드 적용)
function fetchFacilityData() {
    if(!mapInstance) return;
    clearMap();
    globalFacilityList = [];
    const searchInput = document.getElementById('search-facility-input');
    if(searchInput) searchInput.value = '';
    
    mapInstance.setLevel(8);
    updateFacilityListUI([]); 

    const apiKey = '8badc9836e19e169b28ce280ac25e8c4c0fba9aed68e7f39ee470c5968805a21';
    
    // 💡 변경점 1: raw 대신 get을 사용하여 JSON 상자로 포장
    const proxyUrl = "https://api.allorigins.win/get?url=";
    const targetUrl = `https://apis.data.go.kr/B550928/longTermCareInstInfoService01/getLongTermCareInstInfo?serviceKey=${apiKey}&pageNo=1&numOfRows=50`;

    console.log("공공데이터 API에서 시설 정보를 불러오는 중입니다...");

    fetch(proxyUrl + encodeURIComponent(targetUrl))
        .then(res => {
            if(!res.ok) throw new Error(`HTTP 에러: ${res.status}`);
            return res.json(); // 💡 변경점 2: JSON으로 응답받기
        })
        .then(data => {
            // 💡 변경점 3: JSON 상자 안의 contents 에서 진짜 XML 텍스트 꺼내기
            const str = data.contents;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(str, "text/xml");
            
            const errorNode = xmlDoc.getElementsByTagName("returnAuthMsg")[0] || xmlDoc.getElementsByTagName("errMsg")[0];
            if(errorNode && !errorNode.textContent.includes("NORMAL_SERVICE")) {
                throw new Error(errorNode.textContent);
            }

            const items = xmlDoc.getElementsByTagName("item");
            if(items.length === 0) throw new Error("데이터가 없습니다.");

            for (let i = 0; i < items.length; i++) {
                const name = items[i].getElementsByTagName("instNm")[0]?.textContent || items[i].getElementsByTagName("adminNm")[0]?.textContent || "장기요양기관";
                const addr = items[i].getElementsByTagName("addr")[0]?.textContent || "";
                const adminCd = items[i].getElementsByTagName("longTermAdminSym")[0]?.textContent || items[i].getElementsByTagName("adminPymntCd")[0]?.textContent || "";
                const adminPttnCd = items[i].getElementsByTagName("adminPttnCd")[0]?.textContent || "A03"; 

                const facObj = { name: name, addr: addr, adminCd: adminCd, adminPttnCd: adminPttnCd, isCustom: false };
                globalFacilityList.push(facObj);
                
                setTimeout(() => {
                    drawMarker(name, addr, adminCd, false);
                }, i * 50);
            }
            updateFacilityListUI(globalFacilityList);
        })
        .catch(err => {
            console.error("API 연동 실패 사유:", err.message);
            loadMockFacilities(); 
        });
}

// [4] 상세 정보 호출 (안전 우회 모드 적용)
async function showFacilityDetails(adminCd, name, isCustom = false) {
    if(!adminCd) return;

    const targetTitle = document.getElementById('current-info-facility-name');
    const targetGenTable = document.getElementById('table-general-status');
    const targetFacTable = document.getElementById('table-instt-status');
    const btnGen = document.getElementById('btn-add-gen-row');
    const btnFac = document.getElementById('btn-add-fac-row');
    
    if(btnGen) btnGen.style.display = isCustom ? 'block' : 'none';
    if(btnFac) btnFac.style.display = isCustom ? 'block' : 'none';

    if (isCustom) {
        if(targetTitle) targetTitle.innerHTML = `${name} <span style="font-size:0.9rem; color:#10b981;">(수동 추가 - 표 내부를 클릭하여 수정)</span>`;
        const editableGenHTML = `<table style="width:100%; border-collapse:collapse; font-size:0.85rem;"><tr style="border-bottom: 1px solid #cbd5e1;"><td style="padding: 10px; font-weight: bold; width: 40%; background: #f8fafc;">항목명</td><td style="padding: 10px; font-weight: bold; width: 60%; background: #f8fafc;">내용</td></tr><tr style="border-bottom: 1px dashed #e2e8f0;"><td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; border-right: 1px dashed #e2e8f0; outline:none;">설립일자</td><td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; outline:none;">예: 2020-01-01</td></tr><tr style="border-bottom: 1px dashed #e2e8f0;"><td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; border-right: 1px dashed #e2e8f0; outline:none;">입소 정원 / 현원</td><td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; outline:none;">예: 80명 / 75명</td></tr><tr style="border-bottom: 1px dashed #e2e8f0;"><td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; border-right: 1px dashed #e2e8f0; outline:none;">요양보호사 인원</td><td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; outline:none;">예: 25명</td></tr><tr style="border-bottom: 1px dashed #e2e8f0;"><td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; border-right: 1px dashed #e2e8f0; outline:none;">간호 및 의료 인력</td><td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; outline:none;">예: 간호사 1명, 간호조무사 3명</td></tr><tr style="border-bottom: 1px dashed #e2e8f0;"><td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; border-right: 1px dashed #e2e8f0; outline:none;">제공 서비스 종류</td><td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; outline:none;">예: 노인요양시설, 치매전담실</td></tr></table>`;
        const editableFacHTML = `<table style="width:100%; border-collapse:collapse; font-size:0.85rem;"><tr style="border-bottom: 1px solid #cbd5e1;"><td style="padding: 10px; font-weight: bold; width: 40%; background: #f8fafc;">항목명</td><td style="padding: 10px; font-weight: bold; width: 60%; background: #f8fafc;">내용</td></tr><tr style="border-bottom: 1px dashed #e2e8f0;"><td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; border-right: 1px dashed #e2e8f0; outline:none;">건축 연면적 (㎡)</td><td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; outline:none;">직접 입력하세요</td></tr><tr style="border-bottom: 1px dashed #e2e8f0;"><td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; border-right: 1px dashed #e2e8f0; outline:none;">침실 현황</td><td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; outline:none;">예: 총 20실 (1인실 2개, 4인실 18개)</td></tr><tr style="border-bottom: 1px dashed #e2e8f0;"><td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; border-right: 1px dashed #e2e8f0; outline:none;">주요 소방시설</td><td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; outline:none;">예: 스프링클러, 자동화재탐지설비 완비</td></tr><tr style="border-bottom: 1px dashed #e2e8f0;"><td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; border-right: 1px dashed #e2e8f0; outline:none;">비상 피난 설비</td><td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; outline:none;">예: 피난경사로, 구조대, 완강기</td></tr></table>`;
        if(targetGenTable) targetGenTable.innerHTML = editableGenHTML;
        if(targetFacTable) targetFacTable.innerHTML = editableFacHTML;
        if(targetTitle) targetTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return; 
    }

    if (adminCd === 'test1' || adminCd === 'test2') {
        if(targetTitle) targetTitle.innerHTML = `${name} <span style="font-size:0.8rem; color:#f59e0b;">(테스트용 가상 데이터)</span>`;
        return;
    }

    if(targetTitle) targetTitle.innerHTML = `${name} <span style="font-size:0.8rem; color:#f59e0b;">(공공데이터 로딩중...)</span>`;

    const apiKey = '8badc9836e19e169b28ce280ac25e8c4c0fba9aed68e7f39ee470c5968805a21';
    
    // 💡 상세 정보도 마찬가지로 JSON 상자 포장 방식 적용
    const proxyUrl = "https://api.allorigins.win/get?url=";
    
    const selectedFac = globalFacilityList.find(f => f.adminCd === adminCd);
    const pttnCd = selectedFac ? selectedFac.adminPttnCd : 'A03';

    const url1 = `https://apis.data.go.kr/B550928/getLtcInsttDetailInfoService02/getGeneralSttusDetailInfoItem02?serviceKey=${apiKey}&longTermAdminSym=${adminCd}&adminPttnCd=${pttnCd}`;
    const url2 = `https://apis.data.go.kr/B550928/getLtcInsttDetailInfoService02/getInsttSttusDetailInfoItem02?serviceKey=${apiKey}&longTermAdminSym=${adminCd}&adminPttnCd=${pttnCd}`;

    try {
        const [res1, res2] = await Promise.all([
            fetch(proxyUrl + encodeURIComponent(url1)), 
            fetch(proxyUrl + encodeURIComponent(url2))
        ]);
        
        // 💡 JSON으로 받기
        const data1 = await res1.json();
        const data2 = await res2.json();
        
        const parser = new DOMParser();
        // 💡 contents 안에서 XML 꺼내기
        const xml1 = parser.parseFromString(data1.contents, "text/xml");
        const xml2 = parser.parseFromString(data2.contents, "text/xml");

        const parseGeneralInfo = (xmlDoc) => {
            const item = xmlDoc.getElementsByTagName("item")[0];
            if(!item) return "<p style='color:#94a3b8; text-align:center; padding:20px 0;'>상세 데이터가 없습니다.</p>";

            const getVal = (tag) => item.getElementsByTagName(tag)[0]?.textContent || "-";
            let html = `<table style="width:100%; border-collapse:collapse; font-size:0.85rem;">`;
            const addRow = (label, val) => {
                html += `<tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px; font-weight: bold; color: #475569; width: 40%; background: #f8fafc;">${label}</td><td style="padding: 10px; color: #0f172a; width: 60%;">${val}</td></tr>`;
            };

            addRow("기관명", getVal("adminNm"));
            addRow("장기요양기관기호", getVal("longTermAdminSym"));
            addRow("기관지정일", getVal("longTermPeribRgtDt"));
            addRow("설치신고일자", getVal("stpRptDt"));
            addRow("우편번호", getVal("hmPostNo"));
            
            const tel1 = getVal("locTelNo_1") !== "-" ? getVal("locTelNo_1") : getVal("locTelNo1");
            const tel2 = getVal("locTelNo_2") !== "-" ? getVal("locTelNo_2") : getVal("locTelNo2");
            const tel3 = getVal("locTelNo_3") !== "-" ? getVal("locTelNo_3") : getVal("locTelNo3");
            const phone = `${tel1}-${tel2}-${tel3}`.replace(/--/g, '-');
            addRow("전화번호", phone !== "--" ? phone : "-");

            html += `</table>`;
            return html;
        };

        const parseFacilityInfo = (xmlDoc) => {
            const item = xmlDoc.getElementsByTagName("item")[0];
            if(!item) return "<p style='color:#94a3b8; text-align:center; padding:20px 0;'>상세 데이터가 없습니다.</p>";

            const getSafeVal = (tag1, tag2) => {
                let val = item.getElementsByTagName(tag1)[0]?.textContent;
                if (!val && tag2) val = item.getElementsByTagName(tag2)[0]?.textContent;
                return val || "0";
            }

            let html = `<table style="width:100%; border-collapse:collapse; font-size:0.85rem;">`;
            const addRow = (label, val) => {
                html += `<tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px; font-weight: bold; color: #475569; width: 40%; background: #f8fafc;">${label}</td><td style="padding: 10px; color: #0f172a; width: 60%;">${val}</td></tr>`;
            };

            addRow("1인실", getSafeVal("prsnRoomReal1", "prsnRoomreal1"));
            addRow("2인실", getSafeVal("prsnRoomReal2", "prsnRoomreal2"));
            addRow("3인실", getSafeVal("prsnRoomReal3", "prsnRoomreal3"));
            addRow("4인실", getSafeVal("prsnRoomReal4", "prsnRoomreal4"));
            addRow("특수침실", getSafeVal("spcAcupRoomReal", "spcAcupRoomreal"));
            addRow("사무실", getSafeVal("ofce", ""));
            addRow("의료 및 간호사실", getSafeVal("medRoomReal", "medRoomreal"));
            addRow("작업/일상훈련실", getSafeVal("funcTrnRoomReal", "funcTrnRoomreal"));
            addRow("프로그램실", getSafeVal("pgmRoomReal", "pgmRoomreal"));
            addRow("식당 및 조리실", getSafeVal("crmnyPrst", ""));
            addRow("화장실", getSafeVal("batRoom", ""));
            addRow("세면/목욕실", getSafeVal("taxPageLong", ""));
            addRow("세탁/건조장", getSafeVal("taxRoom", ""));

            html += `</table>`;
            return html;
        };

        if(targetTitle) targetTitle.innerText = name;
        if(targetGenTable) targetGenTable.innerHTML = parseGeneralInfo(xml1);
        if(targetFacTable) targetFacTable.innerHTML = parseFacilityInfo(xml2);
        if(targetTitle) targetTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        console.error(error);
        if(targetTitle) targetTitle.innerText = `${name} (상세 데이터 연결 오류)`;
    }
}

function addCustomRow(targetDivId) {
    const tableDiv = document.getElementById(targetDivId);
    if(tableDiv) {
        const tableInner = tableDiv.querySelector('table');
        if(tableInner) {
            const newRow = document.createElement('tr');
            newRow.style.borderBottom = '1px dashed #e2e8f0';
            newRow.innerHTML = `<td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; border-right: 1px dashed #e2e8f0; outline:none;">항목명</td><td contenteditable="true" style="padding: 10px; background: #fffbeb; cursor:text; outline:none;">내용</td>`;
            tableInner.appendChild(newRow);
        }
    }
}

function loadMockFacilities() {
    globalFacilityList = [
        { name: "KB골든라이프케어 서초빌리지", addr: "서울 서초구 우면동 604", adminCd: "test1", isCustom: false },
        { name: "KB골든라이프케어 위례빌리지", addr: "서울 송파구 위례광장로 290", adminCd: "test2", isCustom: false }
    ];
    globalFacilityList.forEach((fac, idx) => {
        setTimeout(() => drawMarker(fac.name, fac.addr, fac.adminCd, false), idx * 100);
    });
    updateFacilityListUI(globalFacilityList);
}