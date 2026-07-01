let mapInstance = null;
let geocoder = null;
let markers = [];
let currentInfowindow = null;

function initMap() {
    if(typeof kakao === 'undefined' || !kakao.maps) {
        alert('카카오맵 API 서버와 연결할 수 없습니다. 도메인 설정이나 인터넷 상태를 확인해주세요.');
        return;
    }

    if (mapInstance) {
        mapInstance.relayout();
        mapInstance.setCenter(new kakao.maps.LatLng(37.4589, 127.0182));
        return;
    }
    
    const container = document.getElementById('kakao-map');
    const options = {
        center: new kakao.maps.LatLng(37.4665, 127.0227),
        level: 8
    };
    mapInstance = new kakao.maps.Map(container, options);
    geocoder = new kakao.maps.services.Geocoder();

    const zoomControl = new kakao.maps.ZoomControl();
    mapInstance.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

    fetchFacilityData();
}

function clearMap() {
    markers.forEach(m => m.setMap(null));
    markers = [];
}

// 평가 페이지 연동
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
    if(reportNameCover) {
        reportNameCover.innerText = `[${name}]`;
    }
    
    if(typeof navigate === 'function') navigate('evaluation');

    if(currentInfowindow) {
        currentInfowindow.close();
        currentInfowindow = null;
    }
}

// 전국 장기요양기관 위치 매핑
function fetchFacilityData() {
    if(!mapInstance) return;
    clearMap();
    
    const apiKey = '8badc9836e19e169b28ce280ac25e8c4c0fba9aed68e7f39ee470c5968805a21';
    const url = `https://apis.data.go.kr/B550928/longTermCrmkinstInfoService01/getLongTermCrmkinstInfo01?serviceKey=${apiKey}&pageNo=1&numOfRows=100`;

    fetch(url)
        .then(res => {
            if(!res.ok) throw new Error(`HTTP 에러: ${res.status}`);
            return res.text();
        })
        .then(str => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(str, "text/xml");
            
            const errorNode = xmlDoc.getElementsByTagName("returnAuthMsg")[0] || xmlDoc.getElementsByTagName("errMsg")[0];
            if(errorNode) throw new Error(errorNode.textContent);

            const items = xmlDoc.getElementsByTagName("item");
            if(items.length === 0) throw new Error("정상 통신했으나 수신된 기관 데이터가 없습니다.");

            for (let i = 0; i < items.length; i++) {
                const name = items[i].getElementsByTagName("instNm")[0]?.textContent || items[i].getElementsByTagName("sigunguNm")[0]?.textContent || "장기요양기관";
                const addr = items[i].getElementsByTagName("addr")[0]?.textContent || "";
                const adminCd = items[i].getElementsByTagName("adminPymntCd")[0]?.textContent || items[i].getElementsByTagName("longTermAdminSym")[0]?.textContent || "";

                if(addr) {
                    geocoder.addressSearch(addr, function(result, status) {
                        if (status === kakao.maps.services.Status.OK) {
                            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                            const marker = new kakao.maps.Marker({ map: mapInstance, position: coords });
                            markers.push(marker);
                            
                            const content = `
                            <div style="padding:15px; width: 270px; font-family: Pretendard; box-sizing: border-box;">
                                <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px; white-space: normal; line-height: 1.3;">${name}</h4>
                                <p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b; white-space: normal;">📍 ${addr}</p>
                                <div style="display:flex; gap:5px;">
                                    <button id="btn-detail-${adminCd}" onclick="showFacilityDetails('${adminCd}', '${name}')" style="flex: 1; padding: 8px; background-color: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">🔍 상세 정보</button>
                                    <button onclick="selectFacilityForEval('${name}', '${addr}')" style="flex: 1; padding: 8px; background-color: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">📝 평가하기</button>
                                </div>
                            </div>`;
                            
                            const infowindow = new kakao.maps.InfoWindow({ content: content, removable: true });
                            
                            kakao.maps.event.addListener(marker, 'click', () => {
                                if(currentInfowindow) currentInfowindow.close();
                                infowindow.open(mapInstance, marker);
                                currentInfowindow = infowindow;
                            });
                        }
                    });
                }
            }
        })
        .catch(err => {
            console.error("연동 실패:", err.message);
            loadMockFacilities(); 
        });
}

// 🔍 통합 레이아웃용 상세조회 함수 (팝업 삭제, 하단 표 자동 로드 및 스크롤)
async function showFacilityDetails(adminCd, name) {
    if(!adminCd) {
        alert("해당 기관의 고유 기호가 없어 상세 정보를 조회할 수 없습니다.");
        return;
    }

    const btn = document.getElementById('btn-detail-' + adminCd);
    if(btn) btn.innerText = "⏳ 로딩중...";

    const apiKey = '8badc9836e19e169b28ce280ac25e8c4c0fba9aed68e7f39ee470c5968805a21';

    const url1 = `https://apis.data.go.kr/B550928/getLtcInsttDetailInfoService02/getGeneralSttusDetailInfoItem02?serviceKey=${apiKey}&adminPymntCd=${adminCd}`;
    const url2 = `https://apis.data.go.kr/B550928/getLtcInsttDetailInfoService02/getInsttSttusDetailInfoItem02?serviceKey=${apiKey}&adminPymntCd=${adminCd}`;

    try {
        const [res1, res2] = await Promise.all([fetch(url1), fetch(url2)]);
        const text1 = await res1.text();
        const text2 = await res2.text();

        const parser = new DOMParser();
        const xml1 = parser.parseFromString(text1, "text/xml");
        const xml2 = parser.parseFromString(text2, "text/xml");

        const parseToTableStyle = (xmlDoc) => {
            const item = xmlDoc.getElementsByTagName("item")[0];
            if(!item) return "<p style='color:#94a3b8; text-align:center; padding:60px 0;'>API 응답 데이터가 없습니다.</p>";
            
            let html = `<table style="width:100%; border-collapse:collapse; font-size:0.85rem;">`;
            for(let i=0; i<item.children.length; i++) {
                const tagName = item.children[i].tagName;
                const text = item.children[i].textContent.trim();
                if(text) {
                    html += `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 10px; font-weight: bold; color: #475569; width: 40%; background: #f8fafc;">${tagName}</td>
                        <td style="padding: 10px; color: #0f172a; width: 60%;">${text}</td>
                    </tr>`;
                }
            }
            html += `</table>`;
            return html;
        };

        const genInfoHtml = parseToTableStyle(xml1);
        const facInfoHtml = parseToTableStyle(xml2);

        // 하단 통합 테이블에 데이터 주입
        const targetTitle = document.getElementById('current-info-facility-name');
        const targetGenTable = document.getElementById('table-general-status');
        const targetFacTable = document.getElementById('table-instt-status');

        if(targetTitle) targetTitle.innerText = name;
        if(targetGenTable) targetGenTable.innerHTML = genInfoHtml;
        if(targetFacTable) targetFacTable.innerHTML = facInfoHtml;

        // [UX 개선] 표가 있는 하단으로 부드럽게 자동 스크롤
        if(targetTitle) {
            targetTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

    } catch (error) {
        console.error(error);
        alert("상세 정보 API 통신 중 오류가 발생했습니다.");
    } finally {
        if(btn) btn.innerText = "🔍 상세 정보";
    }
}

// 더미 데이터 로직 (테스트용)
function loadMockFacilities() {
    const facilities = [
        { name: "KB골든라이프케어 서초빌리지", address: "서울 서초구 우면동 604", lat: 37.4589, lng: 127.0182, adminCd: "test1" },
        { name: "KB골든라이프케어 위례빌리지", address: "서울 송파구 위례광장로 290", lat: 37.4789, lng: 127.1428, adminCd: "test2" }
    ];

    facilities.forEach((fac, idx) => {
        const coords = new kakao.maps.LatLng(fac.lat, fac.lng);
        const marker = new kakao.maps.Marker({ map: mapInstance, position: coords });
        markers.push(marker);

        const content = `
        <div style="padding:15px; width: 270px; font-family: Pretendard; box-sizing: border-box;">
            <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px; white-space: normal; line-height: 1.3;">${fac.name}</h4>
            <p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b; white-space: normal;">📍 ${fac.address}</p>
            <div style="display:flex; gap:5px;">
                <button onclick="alert('더미 데이터 모드에서는 상세 조회가 제한됩니다. API 연동을 확인해주세요.')" style="flex: 1; padding: 8px; background-color: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">🔍 상세 정보</button>
                <button onclick="selectFacilityForEval('${fac.name}', '${fac.address}')" style="flex: 1; padding: 8px; background-color: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">📝 평가하기</button>
            </div>
        </div>`;
        
        const infowindow = new kakao.maps.InfoWindow({ content: content, removable: true });
        
        kakao.maps.event.addListener(marker, 'click', function() { 
            if(currentInfowindow) currentInfowindow.close();
            infowindow.open(mapInstance, marker); 
            currentInfowindow = infowindow;
        });
        
        if (idx === 0) mapInstance.setCenter(coords);
    });
}