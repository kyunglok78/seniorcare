/**
 * =========================================================
 * 💡 main.js
 * 시스템 전체 레이아웃 제어(탭 이동) 및 
 * 전역 데이터 마스터 통합 관리(저장/불러오기)를 담당합니다.
 * =========================================================
 */

// 1. 페이지 로드 시 초기화 작업 (카카오맵 등)
window.onload = function() {
    if (typeof initMap === 'function') {
        initMap();
    }
};

// 2. 좌측 메뉴 탭 전환 로직
function showPage(pageId, element) {
    // 모든 페이지 숨김 처리
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    // 선택된 페이지만 화면에 표시
    document.getElementById(pageId).classList.add('active');

    // 메뉴 활성화 스타일 (파란색 하이라이트) 변경
    if(element) {
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
        element.classList.add('active');
        
        // 상단 헤더 타이틀을 탭 이름으로 자동 변경 (이모지 제외)
        document.getElementById('main-header-title').innerText = element.innerText.replace(/[^\w\s가-힣]/g, '').trim();
    }

    // 지도 깨짐 방지: 일반현황 탭으로 돌아올 때 지도를 다시 그려줌
    if(pageId === 'page-general' && typeof mapInstance !== 'undefined' && mapInstance !== null) {
        setTimeout(() => { mapInstance.relayout(); }, 100);
    }
}

// 3. [통합 임시저장] 상단 빨간색 버튼 클릭 시 작동
function masterSaveAllData() {
    console.log("=== 통합 임시저장 프로세스 시작 ===");

    // [Step 1] 시설 일반 현황 데이터 수집 (generalinfo.js 함수 호출)
    let generalData = null;
    if (typeof saveOverviewData === 'function') {
        generalData = saveOverviewData(); 
    }

    // [Step 2] 현장 위험평가(체크리스트) 데이터 수집
    let evaluationData = null;
    const evalDataNode = localStorage.getItem('fieldEvaluationData'); 
    if(evalDataNode) {
        evaluationData = JSON.parse(evalDataNode);
    }

    // [Step 3] 최종 보고서 통합본 생성 (JSON 패키징)
    const currentFacilityName = (generalData && generalData.name) ? generalData.name : "미지정시설";
    
    const masterPackage = {
        saveTimestamp: new Date().toISOString(),
        facilityName: currentFacilityName,
        generalInfo: generalData,       // 폼 입력 데이터
        riskEvaluation: evaluationData  // 체크리스트 데이터
    };

    // 로컬 스토리지에 하나의 마스터 키로 묶어서 통합 저장!
    localStorage.setItem('masterSafetyAssessment', JSON.stringify(masterPackage));

    alert(`[${currentFacilityName}]의 일반현황 및 위험성평가 결과가 통합 임시저장되었습니다.`);
}

// 4. [통합 불러오기] 상단 초록색 버튼 클릭 시 작동
function masterLoadAllData() {
    console.log("=== 통합 불러오기 프로세스 시작 ===");
    
    // 로컬 스토리지에서 마스터 데이터 덩어리를 가져옵니다.
    const rawData = localStorage.getItem('masterSafetyAssessment');
    
    if (!rawData) {
        alert("이전에 저장된 평가 데이터가 존재하지 않습니다.");
        return;
    }

    const masterPackage = JSON.parse(rawData);
    
    // 데이터 복원 세팅
    if (masterPackage.generalInfo) {
        localStorage.setItem('riskAssessmentOverview', JSON.stringify(masterPackage.generalInfo));
    }
    if (masterPackage.riskEvaluation) {
        localStorage.setItem('fieldEvaluationData', JSON.stringify(masterPackage.riskEvaluation));
    }

    // 저장된 날짜 보기 좋게 변환
    const saveDate = new Date(masterPackage.saveTimestamp).toLocaleString('ko-KR');
    alert(`[${masterPackage.facilityName}]의 평가 데이터를 불러왔습니다.\n(최종 저장: ${saveDate})\n\n데이터 반영을 위해 화면을 새로고침합니다.`);
    
    // 데이터를 화면 요소들에 안전하게 반영하기 위해 새로고침 실행
    location.reload(); 
}