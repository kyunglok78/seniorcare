// ==========================================
// [01] 전역 변수 및 평가 데이터셋
// ==========================================
let radarChartInstance = null;
let barChartInstances = [];
let recDataStorage = {}; 
let chartStorage = { fire: { radar: [], bar: [] }, safety: { radar: [], bar: [] } };

const fireData = [
  { major: "1. 화재 예방 대책", allocScore: 25, minors: [
    { title: "1) 일반 화재 요인 관리 및 통제", allocScore: 10, items: [
      { text: "[ ] 흡연장소는 실외로 지정하고, 주변에 가연물이 없는가?", maxScore: 1.0 },
      { text: "[ ] 화기 장소(주방, 보일러실 등)의 인화성 물질(라이터, 성냥 등)이 안전하게 관리되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 용접 및 용단 작업 시 불티 방지막이 설치되고 소화기가 비치되어 있는가?", maxScore: 1.0 },
      { text: "[ ] 쓰레기가 품목별로 분리수거되고, 화재 위험 물품이 별도로 관리되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 외부 방화를 방지하기 위해 출입구에 경비원이나 관리자가 배치되어 있는가?", maxScore: 1.0 },
      { text: "[ ] 주방 조리기구와 후드가 정기적으로 청소되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 취약계층을 위한 화재 감지 시스템(시각적·청각적 경보)이 제대로 작동하는가?", maxScore: 1.0 },
      { text: "[ ] 작업 구역 내 가연성 화학물질 저장소가 방화 기준을 준수하고 정기적으로 점검되고 있는가?", maxScore: 1.0 }
    ]},
    { title: "2) 전기화재위험 요소 사전관리 및 예방", allocScore: 10, items: [
      { text: "[ ] 전열기구 주변에서 가연물이 제거되고 안전거리가 확보되었는가?", maxScore: 1.0 },
      { text: "[ ] 난방기구에 자동 전원 차단 기능이 있는 제품을 사용하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 전기 배선과 배전반의 절연 상태가 양호하며 과부하 방지 장치가 있는가?", maxScore: 1.0 },
      { text: "[ ] 멀티탭과 플러그가 과열되지 않고 적정 용량을 초과하지 않는가?", maxScore: 1.0 },
      { text: "[ ] 에어컨 및 실외기가 노후되지 않았으며, 안전하게 설치되어 있는가?", maxScore: 1.0 },
      { text: "[ ] 전기 설비의 열화 상태를 열화상 카메라를 사용하여 점검하고 있는가?", maxScore: 1.0 }
    ]},
    { title: "3) 유류·가스 화재 예방 및 안전조치", allocScore: 5, items: [
      { text: "[ ] 유류 및 가스 저장소가 적정 위치에 설치되고 환기 상태가 양호한가?", maxScore: 1.0 },
      { text: "[ ] 가스 누출 감지 센서와 자동 차단 시스템이 설치되어 있는가?", maxScore: 1.0 },
      { text: "[ ] 가스 및 유류 사용 기기의 상태가 양호하며 적합한 소화기가 있는가?", maxScore: 1.0 },
      { text: "[ ] 가스 저장소와 주요 건물 사이에 10m 이상의 안전거리가 확보되었는가?", maxScore: 1.0 },
      { text: "[ ] 가스 밸브와 연결부의 누설 여부를 정기적으로 점검하고 있는가?", maxScore: 1.0 }
    ]}
  ]},
  { major: "2. 화재안전 설비 관리 체계", allocScore: 15, minors: [
    { title: "1) 소방시설 및 화재감지 시스템 점검", allocScore: 4.5, items: [
      { text: "[ ] 소방감지기와 경보 설비가 정상적으로 작동하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 옥내 소화전, 스프링클러 등 소방설비가 정상작동 되도록 유지관리되는가?", maxScore: 1.0 },
      { text: "[ ] 소방설비의 점검 기록이 문서화되고 개선권고사항이 기한 내에 처리되는가?", maxScore: 1.0 },
      { text: "[ ] 소방 설비에 IoT 기반 원격 모니터링 시스템이 도입되었거나 검토되는가?", maxScore: 1.0 }
    ]},
    { title: "2) 방화구획 구성 및 유지관리", allocScore: 3, items: [
      { text: "[ ] 방화문, 자동폐쇄장치, 방화구획이 제대로 작동하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 방화구획의 방염 및 방연 조치가 적절히 이루어지고 있는가?", maxScore: 1.0 },
      { text: "[ ] 자동폐쇄장치가 노약자가 쉽게 열 수 있도록 설계되어 있는가?", maxScore: 1.0 }
    ]},
    { title: "3) 피난 안전구역 및 피난설비/기구 운영 관리", allocScore: 4.5, items: [
      { text: "[ ] 피난 안전구역의 방염 및 차연 상태가 양호한가?", maxScore: 1.0 },
      { text: "[ ] 피난 구역으로의 유도 표지와 비상 조명이 제대로 설치되어 있는가?", maxScore: 1.0 },
      { text: "[ ] 피난기구 및 옥외 피난 경사로가 적절히 설치되고 관리되고 있는가?", maxScore: 1.0 }
    ]},
    { title: "4) 화재 대응 체계 구축 (공공/자위소방대)", allocScore: 3, items: [
      { text: "[ ] 공공소방대와의 정보 공유 체계가 마련되었는가?", maxScore: 1.0 },
      { text: "[ ] 화재 현장 진입로의 장애물이 제거되어 원활히 진입할 수 있는가?", maxScore: 1.0 },
      { text: "[ ] 공공소방대 지휘관과의 의사소통 체계가 명확히 구축되어 있는가?", maxScore: 1.0 },
      { text: "[ ] 자위소방대가 매뉴얼에 따라 초기 화재를 진압할 준비가 되어 있는가?", maxScore: 1.0 },
      { text: "[ ] 피난 경로가 사전에 확보되고, 대피 유도를 위한 절차가 마련되어 있는가?", maxScore: 1.0 },
      { text: "[ ] 피난 완료된 인원과 미대피자의 현황 파악 체계가 있는가?", maxScore: 1.0 }
    ]}
  ]},
  { major: "3. 피난 계획 및 대응 절차", allocScore: 30, minors: [
    { title: "1) 피난설비 관리 현황 및 점검", allocScore: 10, items: [
      { text: "[ ] 피난 설비가 정상적으로 작동하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 피난 설비가 관련 법규 및 인증 기준을 충족하고 있는가?", maxScore: 1.0 }
    ]},
    { title: "2) 비상 피난경로 매뉴얼화", allocScore: 10, items: [
      { text: "[ ] 비상 피난경로 매뉴얼이 작성되어 쉽게 접근 가능한 곳에 비치되어 있는가?", maxScore: 1.0 },
      { text: "[ ] 매뉴얼이 고령자와 장애인을 고려해 구성되어 있는가?", maxScore: 1.0 }
    ]},
    { title: "3) 피난대응 역량 강화 교육 및 평가", allocScore: 10, items: [
      { text: "[ ] 시설 특성을 반영한 피난훈련이 정기적으로 시행되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 피난훈련 후 개선 사항이 평가되고 결과가 반영되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 피난 훈련에 모든 직원과 시설 이용자가 참여하고 있는가?", maxScore: 1.0 }
    ]}
  ]},
  { major: "4. 화재 비상대응 및 복구", allocScore: 20, minors: [
    { title: "1) 긴급구호 체계 및 자원 동원 프로세스 구축", allocScore: 5, items: [
      { text: "[ ] 긴급 구호 물자와 동원 계획이 적절히 수립되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 비상대응 인력의 역할과 동원 절차가 명확히 정의되어 있는가?", maxScore: 1.0 }
    ]},
    { title: "2) 화재 대응 조직 운영 및 관리", allocScore: 5, items: [
      { text: "[ ] 화재 대응 조직 내 지휘 체계와 구성원 간 역할 분담이 이루어지고 있는가?", maxScore: 1.0 },
      { text: "[ ] 조직 간 통신 장비와 협력 체계가 적절히 유지되고 있는가?", maxScore: 1.0 }
    ]},
    { title: "3) 초기대응 및 응급조치 매뉴얼화", allocScore: 5, items: [
      { text: "[ ] 초기 화재 진압 및 응급처치 매뉴얼이 작성되어 검토되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 응급조치 훈련이 정기적으로 실시되고 결과가 매뉴얼에 반영되는가?", maxScore: 1.0 }
    ]},
    { title: "4) 사고 복구 지원 시스템 수립", allocScore: 5, items: [
      { text: "[ ] 사고 후 건물 및 설비 복구 절차가 명확히 수립되어 있는가?", maxScore: 1.0 },
      { text: "[ ] 복구 작업 중 환경오염 방지 조치가 마련되었는가?", maxScore: 1.0 }
    ]}
  ]},
  { major: "5. 화재사고 재발방지 및 개선 체계", allocScore: 10, minors: [
    { title: "1) 사고원인 분석 및 리스크 매트릭스 구축", allocScore: 2.5, items: [
      { text: "[ ] 사고 데이터를 수집하여 리스크 원인을 분석하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 분석 결과가 예방 조치와 설비 개선에 반영되고 있는가?", maxScore: 1.0 }
    ]},
    { title: "2) 예방조치 강화 및 사례 공유 시스템 구축", allocScore: 2.5, items: [
      { text: "[ ] 유사 사고 사례를 공유하고 예방 조치를 강화하기 위한 프로그램이 있는가?", maxScore: 1.0 },
      { text: "[ ] 사고 사례 데이터베이스를 구축하여 발생 패턴을 추적하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 화재 사고 사례가 조직 내에서 공유되고 있는가?", maxScore: 1.0 }
    ]},
    { title: "3) 안전문화 정착을 위한 교육·훈련 체계화", allocScore: 2.5, items: [
      { text: "[ ] 안전문화 정착을 위한 교육과 훈련이 정기적으로 실시되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 교육과 훈련 결과가 평가되고, 이를 정책에 반영하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 화재 위험 인식 교육이 실시되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 화재 예방 관련 규정과 지침이 명확히 제시되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 화재 예방과 대응을 위한 책임 의식이 정착되어 있는가?", maxScore: 1.0 }
    ]},
    { title: "4) 지속적 개선 및 안전 성과 평가 체계 마련", allocScore: 2.5, items: [
      { text: "[ ] 화재안전 성과를 평가할 수 있는 지표를 활용하여 정기적인 평가가 이루어지는가?", maxScore: 1.0 },
      { text: "[ ] 평가 결과를 기반으로 개선 계획이 수립되고 실행되고 있는가?", maxScore: 1.0 }
    ]}
  ]}
];

const safetyData = [
  { major: "1. 안전사고 예방 대책", allocScore: 25, minors: [
    { title: "1) 전기설비 및 전력시스템 안전관리", allocScore: 5, items: [
      { text: "[ ] 전기설비의 과부하 여부를 정기적으로 점검하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 전기 배선과 배전반을 정기적으로 청소하고, 손상 여부를 점검하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 누전차단기 및 보호장치의 정상 작동 여부를 확인하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 습기나 물기가 많은 장소에서는 전기기기를 접지하여 사용하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 노후된 전선이 교체되고, 실내외 노출된 전선은 보호 조치를 시행하고 있는가?", maxScore: 1.0 }
    ]},
    { title: "2) 가스 및 유류 취급시설 안전관리", allocScore: 5, items: [
      { text: "[ ] 가스 및 유류 저장 시설이 인가된 장소에 보관되고 접근이 통제되는가?", maxScore: 1.0 },
      { text: "[ ] 가스 연소기 주변에 가연성 물질이 적재되지 않도록 관리하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 가스 사용 시 환기가 잘 이루어지고 있으며, 사용 후에는 밸브를 잠그는가?", maxScore: 1.0 },
      { text: "[ ] 유류 사용 기기에 유류 확산을 방지하는 트레이가 설치되어 있는가?", maxScore: 1.0 },
      { text: "[ ] LPG 및 천연가스 저장소가 국제 기준에 따라 설치되어 있는가?", maxScore: 1.0 },
      { text: "[ ] 가스 누출 감지 센서와 자동 차단 시스템이 설치되어 있는가?", maxScore: 1.0 }
    ]},
    { title: "3) 낙상사고 예방을 위한 개선", allocScore: 15, items: [
      { text: "환경적 요인 점검", isSubTitle: true },
      { text: "[ ] 복도와 계단 등 이동 동선에 장애물이 없는가?", maxScore: 1.0 },
      { text: "[ ] 침실, 화장실 등 주요 공간의 조도가 적절한가?", maxScore: 1.0 },
      { text: "[ ] 복도와 계단에 시각적으로 명확한 유도 표시가 설치되어 있는가?", maxScore: 1.0 },
      { text: "[ ] 계단 모서리에 미끄럼 방지 처리가 추가되어 있는가?", maxScore: 1.0 },
      { text: "[ ] 겨울철 보행로의 낙상 위험을 방지하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 복도와 공용 공간에 휴식용 의자가 배치되어 있는가?", maxScore: 1.0 },
      { text: "기술적 장치 활용", isSubTitle: true },
      { text: "[ ] 계단 난간이 양쪽에 설치되어 있으며, 적절한 직경을 유지하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 스마트 낙상 감지 시스템이 설치되어 신속히 알림을 전송할 수 있는가?", maxScore: 1.0 },
      { text: "[ ] 병실과 복도에 센서 기반 자동 조명이 설치되어 있는가?", maxScore: 1.0 },
      { text: "[ ] 화장실, 샤워실 등 공간에 미끄럼 방지 매트가 설치되어 있는가?", maxScore: 1.0 },
      { text: "[ ] 외부 보행로에 미끄럼 방지 처리가 된 포장재가 사용되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 복도와 공용 공간의 바닥에 충격 흡수 기능 바닥재를 사용하고 있는가?", maxScore: 1.0 }
    ]}
  ]},
  { major: "2. 안전설비 관리 체계", allocScore: 25, minors: [
    { title: "1) 전기설비 예방정비 및 주기적 검사 체계", allocScore: 5, items: [
      { text: "[ ] 전기 설비의 예방 정비가 정기적으로 이루어지고 있는가?", maxScore: 1.0 },
      { text: "[ ] 분전반 및 배전반에 적정 용량의 차단기가 설치되어 월 1회 이상 확인하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 정전 대비를 위해 비상 전원 설비(UPS, 발전기 등)를 주기적으로 점검하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 시설의 전기 배선 상태를 열화상 카메라로 점검하여 과열 부위를 확인하고 있는가?", maxScore: 1.0 }
    ]},
    { title: "2) 가스·유류 시설 관리 및 유지체계 구축", allocScore: 5, items: [
      { text: "[ ] 가스탱크와 연소기의 누설 여부를 사용 전·후 점검하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 가스 시설 주변에 가연성 물질 관리 및 적합한 소화기가 비치되어 있는가?", maxScore: 1.0 },
      { text: "[ ] 가스 호스와 연결부의 상태를 주기적으로 점검하고 노후 부품은 교체하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 가스 설비의 감시를 위해 IoT 기반 누설 감지 및 알림 시스템을 도입하고 있는가?", maxScore: 1.0 }
    ]},
    { title: "3) 낙상 방지 설비 설치 및 유지관리", allocScore: 15, items: [
      { text: "[ ] 직원이 낙상사고 예방 장치 사용법 및 응급처치에 대해 정기적으로 교육받는가?", maxScore: 1.0 },
      { text: "[ ] 노인과 장애인을 대상으로 낙상 예방법 및 안전한 이동 방법에 대한 교육이 이루어지는가?", maxScore: 1.0 },
      { text: "[ ] 개인별 이동성 평가가 정기적으로 수행되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 휠체어, 보행기 등 보조기구의 상태를 주기적으로 점검하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 낙상사고 발생 시, 사고 기록을 작성하고 원인 분석이 이루어지고 있는가?", maxScore: 1.0 },
      { text: "[ ] 낙상사고 이후 물리치료, 심리적 지원 등 필요한 조치가 제공되고 있는가?", maxScore: 1.0 }
    ]}
  ]},
  { major: "3. 안전사고 대응 및 절차 수립", allocScore: 15, minors: [
    { title: "1) 사고대응 프로세스 설계 및 운영체계 구축", allocScore: 4.5, items: [
      { text: "[ ] 사고 발생 시 보고 및 대응 체계가 매뉴얼화되어 정기적으로 검토되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 사고 유형별 초기 대응 절차가 정의되어 관련 훈련이 정기적으로 실시되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 사고 데이터베이스를 활용하여 빈번한 사고 유형을 분석하고 예방 조치를 수립하는가?", maxScore: 1.0 }
    ]},
    { title: "2) 예방적 설비 점검 및 이상징후 감지 시스템 운영", allocScore: 6, items: [
      { text: "[ ] 설비 점검 시 소음, 과열 등의 이상징후를 감지하여 즉시 조치하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 온도, 진동 등 이상징후를 실시간으로 모니터링하기 위해 IoT 장치가 설치되어 있는가?", maxScore: 1.0 }
    ]},
    { title: "3) 사고유형별 대응훈련 및 평가", allocScore: 4.5, items: [
      { text: "[ ] 전기, 가스, 낙상 등 주요 사고 유형에 따라 대응 훈련이 정기적으로 실시되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 훈련 후 결과를 평가하고 개선 사항이 반영되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 노인 및 취약계층을 대상으로 맞춤형 대응 훈련을 실시하고 있는가?", maxScore: 1.0 }
    ]}
  ]},
  { major: "4. 안전사고 비상대응 및 복구지원 체계", allocScore: 15, minors: [
    { title: "1) 긴급구호 체계 및 자원동원 프로세스 구축", allocScore: 3.75, items: [
      { text: "[ ] 비상시에 사용할 긴급구호 물자와 인력 배치 계획이 마련되어 있는가?", maxScore: 1.0 },
      { text: "[ ] 긴급 대응 조직의 역할과 책임이 명확하며, 정기적인 훈련이 실시되고 있는가?", maxScore: 1.0 }
    ]},
    { title: "2) 안전사고 대응조직 운영 및 관리", allocScore: 3.75, items: [
      { text: "[ ] 안전사고 대응조직의 구조와 지휘 체계가 명확히 정의되어 있는가?", maxScore: 1.0 },
      { text: "[ ] 조직 간 통신 장비와 협력 체계가 적절히 유지되고 있는가?", maxScore: 1.0 }
    ]},
    { title: "3) 사고 유형별 응급조치 지침 매뉴얼화", allocScore: 3.75, items: [
      { text: "[ ] 사고 유형별 응급조치 지침이 매뉴얼로 작성되어 숙지되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 응급조치 매뉴얼이 정기적으로 검토 및 업데이트되고 있는가?", maxScore: 1.0 }
    ]},
    { title: "4) 안전사고 대응 프로세스 운영", allocScore: 3.75, items: [
      { text: "[ ] 사고 발생 시 대응 절차가 적절히 운영되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 복구 작업에서 환경오염(유해물질 등) 방지 조치가 마련되어 있는가?", maxScore: 1.0 }
    ]}
  ]},
  { major: "5. 안전사고 재발방지 및 개선 체계", allocScore: 20, minors: [
    { title: "1) 사고원인 분석 및 리스크 매트릭스 구축", allocScore: 5, items: [
      { text: "[ ] 사고 데이터를 수집하여 리스크 매트릭스를 작성하고 원인을 분석하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 분석 결과가 예방 조치와 설비 개선에 반영되고 있는가?", maxScore: 1.0 }
    ]},
    { title: "2) 예방조치 강화 및 사고사례 공유 시스템", allocScore: 5, items: [
      { text: "[ ] 사고 예방 조치가 강화되고, 사고 사례가 정기적으로 조직 내에서 공유되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 사고 사례 데이터베이스를 구축하여 사고 발생 패턴을 추적하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 안전 사고 사례가 조직 내에서 공유되고 있는가?", maxScore: 1.0 }
    ]},
    { title: "3) 안전문화 정착을 위한 교육 및 훈련 체계화", allocScore: 5, items: [
      { text: "[ ] 안전사고 예방 교육 프로그램이 정기적으로 운영되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 교육 및 훈련 내용이 최신 안전 기준과 사고 사례를 반영하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 교육과 훈련 후 참가자들의 이해도와 수행 역량을 평가하고 있는가?", maxScore: 1.0 },
      { text: "[ ] 개인 및 조직의 책임 의식 강화를 위한 캠페인이 진행되고 있는가?", maxScore: 1.0 },
      { text: "[ ] 교육 및 훈련 성과를 기반으로 안전 정책과 절차가 개선되고 있는가?", maxScore: 1.0 }
    ]},
    { title: "4) 지속적 개선과 안전관리 성과 평가체계 구축", allocScore: 5, items: [
      { text: "[ ] 안전사고관련 성과를 평가할 수 있는 지표를 활용하여 정기적인 평가가 이루어지는가?", maxScore: 1.0 },
      { text: "[ ] 평가 결과를 기반으로 개선 계획이 수립되고 실행되고 있는가?", maxScore: 1.0 }
    ]}
  ]}
];

const circledNumbers = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫','⑬','⑭','⑮','⑯','⑰','⑱','⑲','⑳'];

// ==========================================
// [02] UI 제어 및 네비게이션
// ==========================================
function navigate(pageId) {
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    
    const menuItem = document.getElementById('menu-' + pageId);
    const pageItem = document.getElementById('page-' + pageId);
    
    if(menuItem) menuItem.classList.add('active');
    if(pageItem) pageItem.classList.add('active');
    
    // [변경 및 교체] 기존 'map' 조건을 삭제하고 'facility-info' 통합 연동 조건으로 변경
    if (pageId === 'facility-info') {
        document.getElementById('top-title').innerText = '기관별 시설 일반 현황 마스터';
        document.getElementById('btn-save').style.display = 'none';
        document.getElementById('btn-load').style.display = 'none';
        if(typeof initMap === 'function') setTimeout(initMap, 100); 
    } else if(pageId === 'evaluation') {
        document.getElementById('top-title').innerText = '현장 위험 평가 상세 입력';
        document.getElementById('btn-save').style.display = 'block';
        document.getElementById('btn-load').style.display = 'block';
    } else if (pageId === 'result') {
        document.getElementById('top-title').innerText = '안전점검 결과 종합 분석 리포트';
        document.getElementById('btn-save').style.display = 'none';
        document.getElementById('btn-load').style.display = 'none';
        const activeType = document.getElementById('rtab-fire').classList.contains('active') ? 'fire' : 'safety';
        buildVisualCharts(activeType);
    } else if (pageId === 'recommendation') {
        document.getElementById('top-title').innerText = '권장사항 작성 및 관리';
        document.getElementById('btn-save').style.display = 'block'; 
        document.getElementById('btn-load').style.display = 'block';
        buildRecommendations(); 
    } else if (pageId === 'report') {
        document.getElementById('top-title').innerText = '보고서 출력 뷰';
        document.getElementById('btn-save').style.display = 'none';
        document.getElementById('btn-load').style.display = 'none';
        renderReportTables(); 
    } else {
        document.getElementById('top-title').innerText = '통합 대시보드';
        document.getElementById('btn-save').style.display = 'none';
        document.getElementById('btn-load').style.display = 'none';
    }
}

function switchEvalTab(type) {
    document.getElementById('tab-fire').classList.remove('active');
    document.getElementById('tab-safety').classList.remove('active');
    document.getElementById('table-fire').classList.add('hidden');
    document.getElementById('table-safety').classList.add('hidden');
    document.getElementById('tab-' + type).classList.add('active');
    document.getElementById('table-' + type).classList.remove('hidden');
}

function switchResultTab(type) {
    document.getElementById('rtab-fire').classList.remove('active');
    document.getElementById('rtab-safety').classList.remove('active');
    document.getElementById('res-fire-container').classList.add('hidden');
    document.getElementById('res-safety-container').classList.add('hidden');
    document.getElementById('rtab-' + type).classList.add('active');
    document.getElementById('res-' + type + '-container').classList.remove('hidden');
    buildVisualCharts(type);
}

function switchRecTab(view) {
    document.getElementById('rectab-list').classList.remove('active');
    document.getElementById('rectab-detail').classList.remove('active');
    document.getElementById('rectab-impl').classList.remove('active');

    document.getElementById('rec-view-list').classList.add('hidden');
    document.getElementById('rec-view-detail').classList.add('hidden');
    document.getElementById('rec-view-impl').classList.add('hidden');

    document.getElementById('rectab-' + view).classList.add('active');
    document.getElementById('rec-view-' + view).classList.remove('hidden');
}

function toggleMajor(type, mIdx) {
    const icon = document.getElementById(`icon-maj-${type}-${mIdx}`);
    const isCollapsed = icon.innerText === '▶';
    const minors = document.querySelectorAll(`.maj-child-${type}-${mIdx}`);
    minors.forEach(el => isCollapsed ? el.classList.remove('hidden') : el.classList.add('hidden'));
    icon.innerText = isCollapsed ? '▼' : '▶';
}

function toggleMinor(event, type, mIdx, minIdx) {
    if(event.target.tagName === 'INPUT') return;
    const icon = document.getElementById(`icon-min-${type}-${mIdx}-${minIdx}`);
    const isCollapsed = icon.innerText === '▶';
    const items = document.querySelectorAll(`.min-child-${type}-${mIdx}-${minIdx}`);
    items.forEach(el => isCollapsed ? el.classList.remove('hidden') : el.classList.add('hidden'));
    icon.innerText = isCollapsed ? '▼' : '▶';
}

// ==========================================
// [03] 평가 데이터 입력 및 동기화 처리
// ==========================================
function syncPostScore(fieldElement) {
    const type = fieldElement.getAttribute('data-type');
    const mIdx = fieldElement.getAttribute('data-maj');
    const minIdx = fieldElement.getAttribute('data-min');
    const itemIdx = fieldElement.getAttribute('data-item');
    const postElement = document.querySelector(`.calc-input[data-col="post"][data-type="${type}"][data-maj="${mIdx}"][data-min="${minIdx}"][data-item="${itemIdx}"]`);
    if(postElement && !postElement.hasAttribute('data-is-modified')) {
        postElement.value = fieldElement.value;
    }
    updateSums(type);
}

function markModified(postElement) {
    const type = postElement.getAttribute('data-type');
    const mIdx = postElement.getAttribute('data-maj');
    const minIdx = postElement.getAttribute('data-min');
    const itemIdx = postElement.getAttribute('data-item');
    const fieldElement = document.querySelector(`.calc-input[data-col="field"][data-type="${type}"][data-maj="${mIdx}"][data-min="${minIdx}"][data-item="${itemIdx}"]`);
    
    if (fieldElement && parseFloat(fieldElement.value || 0) === parseFloat(postElement.value || 0)) {
        postElement.classList.remove('modified-cell');
        postElement.removeAttribute('data-is-modified');
    } else {
        postElement.classList.add('modified-cell');
        postElement.setAttribute('data-is-modified', 'true');
    }
    updateSums(type);
}

function renderInputTable(data, type) {
    const tbody = document.getElementById('tbody-' + type);
    let html = '';
    data.forEach((group, mIdx) => {
        let majorMaxScore = group.minors.reduce((acc, min) => acc + min.items.reduce((s, i) => s + (i.maxScore || 0), 0), 0);
        html += `<tr class="row-major" onclick="toggleMajor('${type}', ${mIdx})"><td class="col-item"><span class="toggle-icon" id="icon-maj-${type}-${mIdx}">▼</span> ${group.major}</td><td class="sum-cell">${majorMaxScore}</td><td class="sum-cell" id="sum-${type}-maj-${mIdx}-field">0.0</td><td class="sum-cell" id="sum-${type}-maj-${mIdx}-post">0.0</td><td></td></tr>`;
        group.minors.forEach((minor, minIdx) => {
            let minorMaxScore = minor.items.reduce((s, i) => s + (i.maxScore || 0), 0);
            html += `<tr class="row-minor maj-child-${type}-${mIdx}" onclick="toggleMinor(event, '${type}', ${mIdx}, ${minIdx})"><td class="col-item"><span class="toggle-icon" id="icon-min-${type}-${mIdx}-${minIdx}">▼</span> ${minor.title}</td><td class="sum-cell">${minorMaxScore}</td><td class="sum-cell" id="sum-${type}-min-${mIdx}-${minIdx}-field">0.0</td><td class="sum-cell" id="sum-${type}-min-${mIdx}-${minIdx}-post">0.0</td><td></td></tr>`;
            let itemCounter = 0, itemIdx = 0, subTitleCounter = 0;
            minor.items.forEach(item => {
                if(item.isSubTitle) {
                    html += `<tr class="row-item maj-item-${type}-${mIdx} min-child-${type}-${mIdx}-${minIdx}"><td class="col-item subtitle-row">${circledNumbers[subTitleCounter]} ${item.text}</td><td style="background-color: #f1f5f9;">-</td><td style="background-color: #f1f5f9;"></td><td style="background-color: #f1f5f9;"></td><td style="background-color: #f1f5f9;"></td></tr>`;
                    subTitleCounter++;
                } else {
                    let displayText = item.text.replace(/\[\s*\]\s*/, circledNumbers[itemCounter] + ' '); itemCounter++;
                    html += `<tr class="row-item maj-item-${type}-${mIdx} min-child-${type}-${mIdx}-${minIdx}"><td class="col-item">${displayText}</td><td>${item.maxScore}</td><td><input type="number" class="calc-input" data-type="${type}" data-maj="${mIdx}" data-min="${minIdx}" data-item="${itemIdx}" data-col="field" min="0" max="${item.maxScore}" step="0.5" placeholder="입력" oninput="syncPostScore(this)"></td><td><input type="number" class="calc-input" data-type="${type}" data-maj="${mIdx}" data-min="${minIdx}" data-item="${itemIdx}" data-col="post" min="0" max="${item.maxScore}" step="0.5" placeholder="입력" oninput="markModified(this)"></td><td><input type="text" class="remark-input" data-type="${type}" data-maj="${mIdx}" data-min="${minIdx}" data-item="${itemIdx}" placeholder="소견 입력"></td></tr>`;
                }
                itemIdx++;
            });
        });
    });
    tbody.innerHTML = html;
}

function updateSums(type) {
    const data = type === 'fire' ? fireData : safetyData;
    const inputs = document.querySelectorAll(`.calc-input[data-type="${type}"]`);
    const rawSums = { field: {}, post: {} };
    
    data.forEach((major, mIdx) => {
        rawSums.field[mIdx] = {}; rawSums.post[mIdx] = {};
        major.minors.forEach((minor, minIdx) => { rawSums.field[mIdx][minIdx] = 0; rawSums.post[mIdx][minIdx] = 0; });
    });

    inputs.forEach(input => {
        const val = parseFloat(input.value) || 0, mIdx = input.getAttribute('data-maj'), minIdx = input.getAttribute('data-min'), col = input.getAttribute('data-col');
        if(rawSums[col] && rawSums[col][mIdx] && rawSums[col][mIdx][minIdx] !== undefined) {
            rawSums[col][mIdx][minIdx] += val;
        }
    });

    const radarLabels = [], radarFieldData = [], radarPostData = [];
    const barChartDataList = [];

    data.forEach((major, mIdx) => {
        let majorFieldConv = 0, majorPostConv = 0, majRawField = 0, majRawPost = 0;
        const barLabels = [], barFieldVals = [], barPostVals = [];

        major.minors.forEach((minor, minIdx) => {
            let rawMax = minor.items.reduce((s, i) => s + (i.maxScore || 0), 0);
            let minorFieldRaw = rawSums.field[mIdx][minIdx] || 0, minorPostRaw = rawSums.post[mIdx][minIdx] || 0;
            majRawField += minorFieldRaw; majRawPost += minorPostRaw;

            let minFieldConv = rawMax > 0 ? (minorFieldRaw / rawMax) * minor.allocScore : 0;
            let minPostConv = rawMax > 0 ? (minorPostRaw / rawMax) * minor.allocScore : 0;
            
            let fieldPct = (minFieldConv / minor.allocScore) * 100 || 0;
            let postPct = (minPostConv / minor.allocScore) * 100 || 0;

            const elMinFieldRaw = document.getElementById(`sum-${type}-min-${mIdx}-${minIdx}-field`);
            if(elMinFieldRaw) elMinFieldRaw.innerText = minorFieldRaw.toFixed(1);
            const elMinPostRaw = document.getElementById(`sum-${type}-min-${mIdx}-${minIdx}-post`);
            if(elMinPostRaw) elMinPostRaw.innerText = minorPostRaw.toFixed(1);
            
            const elMinFieldConv = document.getElementById(`res-${type}-min-${mIdx}-${minIdx}-field`);
            if(elMinFieldConv) elMinFieldConv.innerText = minFieldConv.toFixed(1);
            const elMinPostConv = document.getElementById(`res-${type}-min-${mIdx}-${minIdx}-post`);
            if(elMinPostConv) elMinPostConv.innerText = minPostConv.toFixed(1);
            
            const elMinFieldPct = document.getElementById(`res-${type}-min-${mIdx}-${minIdx}-field-pct`);
            if(elMinFieldPct) elMinFieldPct.innerText = fieldPct.toFixed(0) + '%';
            const elMinPostPct = document.getElementById(`res-${type}-min-${mIdx}-${minIdx}-post-pct`);
            if(elMinPostPct) elMinPostPct.innerText = postPct.toFixed(0) + '%';

            barLabels.push(minor.title);
            barFieldVals.push(parseFloat(fieldPct.toFixed(1)));
            barPostVals.push(parseFloat(postPct.toFixed(1)));

            majorFieldConv += minFieldConv; majorPostConv += minPostConv;
        });

        const elMajFieldRaw = document.getElementById(`sum-${type}-maj-${mIdx}-field`);
        if(elMajFieldRaw) elMajFieldRaw.innerText = majRawField.toFixed(1);
        const elMajPostRaw = document.getElementById(`sum-${type}-maj-${mIdx}-post`);
        if(elMajPostRaw) elMajPostRaw.innerText = majRawPost.toFixed(1);
        
        const elMajField = document.getElementById(`res-${type}-maj-${mIdx}-field`);
        if(elMajField) elMajField.innerText = majorFieldConv.toFixed(1);
        const elMajPost = document.getElementById(`res-${type}-maj-${mIdx}-post`);
        if(elMajPost) elMajPost.innerText = majorPostConv.toFixed(1);
        
        const elMajFieldPct = document.getElementById(`res-${type}-maj-${mIdx}-field-pct`);
        if(elMajFieldPct) elMajFieldPct.innerText = ((majorFieldConv / major.allocScore) * 100 || 0).toFixed(0) + '%';
        const elMajPostPct = document.getElementById(`res-${type}-maj-${mIdx}-post-pct`);
        if(elMajPostPct) elMajPostPct.innerText = ((majorPostConv / major.allocScore) * 100 || 0).toFixed(0) + '%';

        radarLabels.push(major.major.split(". ")[1] || major.major);
        radarFieldData.push(parseFloat(((majorFieldConv / major.allocScore) * 100 || 0).toFixed(1)));
        radarPostData.push(parseFloat(((majorPostConv / major.allocScore) * 100 || 0).toFixed(1)));

        barChartDataList.push({ title: major.major, maxScore: major.allocScore, labels: barLabels, field: barFieldVals, post: barPostVals });
    });

    chartStorage[type].radar = { labels: radarLabels, field: radarFieldData, post: radarPostData };
    chartStorage[type].bar = barChartDataList;
    
    if(document.getElementById('page-result').classList.contains('active')) {
        const activeType = document.getElementById('rtab-fire').classList.contains('active') ? 'fire' : 'safety';
        if (type === activeType) buildVisualCharts(type);
    }
}

// ==========================================
// [04] 리포트 테이블 및 시각화 (차트)
// ==========================================
function renderResultTable(data, type) {
    const tbody = document.getElementById('tbody-res-' + type);
    let html = '';
    data.forEach((major, mIdx) => {
        major.minors.forEach((minor, minIdx) => {
            html += `<tr>${minIdx === 0 ? `<td rowspan="${major.minors.length}" style="font-weight:bold; text-align:left;">${major.major}</td>` : ''}<td style="text-align:left; padding-left:15px;">${minor.title}</td><td style="font-weight:bold;">${minor.allocScore.toFixed(1)}</td><td id="res-${type}-min-${mIdx}-${minIdx}-field" style="color:#64748b; font-weight:bold;">0.0</td><td id="res-${type}-min-${mIdx}-${minIdx}-field-pct">0.0%</td><td id="res-${type}-min-${mIdx}-${minIdx}-post" style="color:#f59e0b; font-weight:bold;">0.0</td><td id="res-${type}-min-${mIdx}-${minIdx}-post-pct">0.0%</td></tr>`;
        });
        html += `<tr style="background-color:#f1f5f9; font-weight:bold;"><td colspan="2">소계</td><td>${major.allocScore.toFixed(1)}</td><td id="res-${type}-maj-${mIdx}-field">0.0</td><td id="res-${type}-maj-${mIdx}-field-pct">0.0%</td><td id="res-${type}-maj-${mIdx}-post">0.0</td><td id="res-${type}-maj-${mIdx}-post-pct">0.0%</td></tr>`;
    });
    tbody.innerHTML = html;
}

function renderReportTables() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dateEl = document.getElementById('report-date-cover');
    if(dateEl) dateEl.innerText = `${year}.${month}`;

    const fireTbody = document.getElementById('report-fire-tbody');
    if(fireTbody) {
        let fireHtml = '';
        fireData.forEach(major => {
            major.minors.forEach((minor, idx) => {
                fireHtml += `<tr>`;
                if(idx === 0) fireHtml += `<td rowspan="${major.minors.length}" style="font-weight:bold; background-color: #fafafa;">${major.major}</td>`;
                fireHtml += `<td>${minor.title}</td></tr>`;
            });
        });
        fireTbody.innerHTML = fireHtml;
    }

    const safetyTbody = document.getElementById('report-safety-tbody');
    if(safetyTbody) {
        let safetyHtml = '';
        safetyData.forEach(major => {
            major.minors.forEach((minor, idx) => {
                safetyHtml += `<tr>`;
                if(idx === 0) safetyHtml += `<td rowspan="${major.minors.length}" style="font-weight:bold; background-color: #fafafa;">${major.major}</td>`;
                safetyHtml += `<td>${minor.title}</td></tr>`;
            });
        });
        safetyTbody.innerHTML = safetyHtml;
    }
}

function buildVisualCharts(type) {
    const canvasRadar = document.getElementById('radarChart');
    if(!canvasRadar) return;
    
    if(radarChartInstance) radarChartInstance.destroy();
    barChartInstances.forEach(ins => ins.destroy());
    barChartInstances = [];

    const rData = chartStorage[type].radar;
    const bDataList = chartStorage[type].bar;

    const ctxRadar = canvasRadar.getContext('2d');
    radarChartInstance = new Chart(ctxRadar, {
        type: 'radar',
        data: {
            labels: rData.labels,
            datasets: [
                { label: '현장 평가 결과', data: rData.field, backgroundColor: 'rgba(100, 116, 139, 0.15)', borderColor: '#64748b', pointBackgroundColor: '#64748b', borderWidth: 2 },
                { label: '권장이행 후 결과', data: rData.post, backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: '#f59e0b', pointBackgroundColor: '#f59e0b', borderWidth: 2 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 100, ticks: { stepSize: 20 } } }, plugins: { legend: { position: 'top' } } }
    });

    const gridContainer = document.getElementById('barChartsGrid');
    if(!gridContainer) return;
    gridContainer.innerHTML = ''; 

    bDataList.forEach((bData, idx) => {
        const card = document.createElement('div');
        card.className = 'chart-card';
        card.innerHTML = `<h4>${bData.title}</h4><div class="chart-wrapper"><canvas id="barChart-${type}-${idx}"></canvas></div>`;
        gridContainer.appendChild(card);

        const canvasBar = document.getElementById(`barChart-${type}-${idx}`);
        if(!canvasBar) return;
        const ctxBar = canvasBar.getContext('2d');
        const barIns = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: bData.labels,
                datasets: [
                    { label: '현장결과', data: bData.field, backgroundColor: '#64748b' },
                    { label: '개선 후', data: bData.post, backgroundColor: '#f59e0b' }
                ]
            },
            options: {
                indexAxis: 'y', 
                responsive: true, maintainAspectRatio: false,
                scales: { 
                    x: { min: 0, max: 100, ticks: { callback: function(value) { return value + '%'; } } },
                    y: { ticks: { autoSkip: false, font: { size: 11 } } }
                },
                plugins: { legend: { display: false } }
            }
        });
        barChartInstances.push(barIns);
    });
}

// ==========================================
// [05] 권장사항 로직 (체크박스 일괄 숨김 기능 추가)
// ==========================================
function getBaseKey(key) {
    const parts = key.split('-');
    if (key.startsWith('rec-manual')) return parts.slice(0, 3).join('-');
    return parts.slice(0, 5).join('-');
}

function checkIfModified(keyBase) {
    const fieldsToCheck = ['-summary', '-status', '-action', '-rule', '-impl', '-img', '-title'];
    for (let ext of fieldsToCheck) {
        const val = recDataStorage[keyBase + ext];
        if (val && val.trim().length > 0) return true;
    }
    return recDataStorage[keyBase + '-is-changed'] || false;
}

function updateNumberColor(keyBase) {
    const numTd = document.getElementById(`num-col-${keyBase}`);
    if(numTd) {
        numTd.style.backgroundColor = checkIfModified(keyBase) ? '#fef08a' : '';
        numTd.style.color = checkIfModified(keyBase) ? '#854d0e' : '';
    }
}

function trackRecChange(el, key) {
    recDataStorage[key] = el.value;
    if(el.value.trim() !== "") {
        el.classList.add('modified-cell');
        recDataStorage[key + '-is-changed'] = true;
    } else {
        el.classList.remove('modified-cell');
        delete recDataStorage[key + '-is-changed'];
    }
    updateNumberColor(getBaseKey(key)); 
}

function handleImageUpload(input, imgKey) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgPreview = document.getElementById(`preview-${imgKey}`);
            const delBtn = document.getElementById(`del-img-${imgKey}`);
            if(imgPreview) {
                imgPreview.src = e.target.result;
                imgPreview.style.display = 'block'; 
            }
            if(delBtn) delBtn.style.display = 'block';
            recDataStorage[imgKey + '-img'] = e.target.result; 
            updateNumberColor(getBaseKey(imgKey)); 
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function handlePasteEvent(e, imgKey) {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = function(event) {
                const imgPreview = document.getElementById(`preview-${imgKey}`);
                const delBtn = document.getElementById(`del-img-${imgKey}`);
                if (imgPreview) {
                    imgPreview.src = event.target.result;
                    imgPreview.style.display = 'block';
                }
                if (delBtn) delBtn.style.display = 'block';
                recDataStorage[imgKey + '-img'] = event.target.result;
                updateNumberColor(getBaseKey(imgKey)); 
            };
            reader.readAsDataURL(blob);
            e.preventDefault();
            e.stopPropagation(); 
            break;
        }
    }
}

function deleteImage(event, imgKey) {
    event.stopPropagation();
    if(confirm('이 사진을 지우시겠습니까?')) {
        const imgPreview = document.getElementById(`preview-${imgKey}`);
        const delBtn = document.getElementById(`del-img-${imgKey}`);
        const fileInput = document.getElementById(`upload-${imgKey}`);
        
        if(imgPreview) { imgPreview.src = ''; imgPreview.style.display = 'none'; }
        if(delBtn) { delBtn.style.display = 'none'; }
        if(fileInput) { fileInput.value = ''; }
        
        delete recDataStorage[imgKey + '-img'];
        updateNumberColor(getBaseKey(imgKey)); 
    }
}

function deleteRec(keyBase) {
    recDataStorage['deleted_' + keyBase] = true;
    buildRecommendations(); 
}

function toggleAllRecs(source) {
    const checkboxes = document.querySelectorAll('.rec-checkbox');
    checkboxes.forEach(cb => cb.checked = source.checked);
}

function hideSelectedRecs() {
    const checkboxes = document.querySelectorAll('.rec-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('먼저 숨길 항목을 체크해 주세요.');
        return;
    }
    checkboxes.forEach(cb => {
        const keyBase = cb.getAttribute('data-key');
        recDataStorage['deleted_' + keyBase] = true;
    });
    const checkAllBox = document.querySelector('th input[type="checkbox"]');
    if (checkAllBox) checkAllBox.checked = false;
    buildRecommendations();
}

function hideUnmodifiedRecs() {
    let hideCount = 0;
    const listRows = document.querySelectorAll('#tbody-rec-list tr');
    
    listRows.forEach(row => {
        const titleInput = row.querySelector('input.title');
        if(!titleInput) return;
        const keyBase = getBaseKey(titleInput.getAttribute('data-key'));
        
        if(!checkIfModified(keyBase)) {
            recDataStorage['hidden_' + keyBase] = true;
            hideCount++;
        }
    });
    
    if(hideCount > 0) {
        buildRecommendations();
        alert(`내용 수정이 없는 빈 항목 ${hideCount}개가 숨김 처리되었습니다.`);
    } else {
        alert('숨길 빈 항목이 없습니다. (모든 항목이 작성 중이거나 이미 숨겨짐)');
    }
}

function showHiddenRecs() {
    let showCount = 0;
    for (let key in recDataStorage) {
        if ((key.startsWith('hidden_') || key.startsWith('deleted_')) && recDataStorage[key] === true) {
            recDataStorage[key] = false;
            showCount++;
        }
    }
    if (showCount > 0) {
        buildRecommendations();
        alert(`숨겨지거나 삭제되었던 ${showCount}개의 항목이 다시 표시되었습니다.`);
    } else {
        alert('현재 숨겨지거나 삭제된 항목이 없습니다.');
    }
}

function addManualRec() {
    if(!recDataStorage.manualKeys) recDataStorage.manualKeys = [];
    const keyBase = `rec-manual-${Date.now()}`;
    recDataStorage.manualKeys.push(keyBase);
    buildRecommendations(); 
}

function toggleMissionClear(keyBase, type, mIdx, minIdx, itemIdx) {
    const isCurrentlyCleared = recDataStorage['cleared_' + keyBase];
    
    if (!isCurrentlyCleared) {
        recDataStorage['cleared_' + keyBase] = true;
        if (type && mIdx !== null) {
            const fieldInput = document.querySelector(`.calc-input[data-col="field"][data-type="${type}"][data-maj="${mIdx}"][data-min="${minIdx}"][data-item="${itemIdx}"]`);
            const postInput = document.querySelector(`.calc-input[data-col="post"][data-type="${type}"][data-maj="${mIdx}"][data-min="${minIdx}"][data-item="${itemIdx}"]`);
            if (fieldInput && postInput) {
                recDataStorage['orig_' + keyBase] = fieldInput.value;
                fieldInput.value = postInput.value;
                fieldInput.classList.add('cleared-cell');
                updateSums(type);
            }
        }
    } else {
        recDataStorage['cleared_' + keyBase] = false;
        if (type && mIdx !== null) {
            const fieldInput = document.querySelector(`.calc-input[data-col="field"][data-type="${type}"][data-maj="${mIdx}"][data-min="${minIdx}"][data-item="${itemIdx}"]`);
            if (fieldInput) {
                fieldInput.value = recDataStorage['orig_' + keyBase] || 0;
                fieldInput.classList.remove('cleared-cell');
                updateSums(type);
            }
        }
    }
    buildRecommendations();
}

function addPhotoSlot(keyBase) {
    let openCount = recDataStorage[`open_slots_${keyBase}`] || 1;
    if (openCount < 4) {
        openCount++;
        recDataStorage[`open_slots_${keyBase}`] = openCount;
        let imgKey = `${keyBase}-${openCount}`;
        let slotEl = document.getElementById(`slot-${imgKey}`);
        if (slotEl) slotEl.style.display = 'block';
    } else {
        alert('사진은 최대 4장까지만 첨부할 수 있습니다.');
    }
}

function buildRecommendations() {
    const listTbody = document.getElementById('tbody-rec-list');
    const detailWrapper = document.getElementById('rec-detail-wrapper');
    const implWrapper = document.getElementById('rec-impl-wrapper');
    if(!listTbody || !detailWrapper || !implWrapper) return;
    
    listTbody.innerHTML = '';
    detailWrapper.innerHTML = '';
    implWrapper.innerHTML = '';

    let recCount = 1;
    const currentYear = new Date().getFullYear();

    const getPhotoHtml = (keyBase) => {
        let openCount = recDataStorage[`open_slots_${keyBase}`] || 1;
        let html = `<div id="photo-container-${keyBase}" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">`;
        
        for (let i = 1; i <= 4; i++) {
            let imgKey = i === 1 ? keyBase : `${keyBase}-${i}`;
            let capKey = i === 1 ? `${keyBase}-imgcap` : `${keyBase}-imgcap-${i}`;
            
            if (recDataStorage[`${imgKey}-img`] || recDataStorage[capKey]) {
                if (i > openCount) openCount = i;
            }
            let displayStyle = (i <= openCount) ? 'block' : 'none';
            
            html += `
            <div id="slot-${imgKey}" class="photo-slot" style="display: ${displayStyle}; border: 2px dashed #e2e8f0; padding: 15px; border-radius: 8px; background: #f8fafc; break-inside: avoid;">
                <div style="display: flex; gap: 10px; margin-bottom: 5px;">
                    <div class="img-upload-box" style="flex: 1; padding: 10px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer;" onclick="document.getElementById('upload-${imgKey}').click()">
                        <div style="color: #64748b; font-weight: bold; font-size: 0.85rem;">📁 사진 ${i} 첨부</div>
                        <input type="file" id="upload-${imgKey}" class="img-upload-input" accept="image/*" onchange="handleImageUpload(this, '${imgKey}')" style="display:none;">
                    </div>
                    <div class="img-upload-box" style="flex: 1; padding: 10px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; cursor: text;" tabindex="0" onpaste="handlePasteEvent(event, '${imgKey}')">
                        <div style="color: #64748b; font-weight: bold; font-size: 0.85rem;">📋 붙여넣기 (Ctrl+V)</div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 10px;">
                    <div style="display: inline-block; position: relative;">
                        <img id="preview-${imgKey}" class="uploaded-preview" style="max-width: 100%; max-height: 200px; display: none; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <button id="del-img-${imgKey}" class="btn-delete-img" style="top: -10px; right: -10px; z-index: 20; position:absolute; background-color:#ef4444; color:white; border-radius:50%; width:25px; height:25px; border:none; cursor:pointer;" onclick="deleteImage(event, '${imgKey}')">X</button>
                    </div>
                </div>
                <input type="text" class="rec-input-transparent" style="text-align: center; margin-top: 10px; font-size: 0.95rem; font-weight: bold; width: 100%; border-bottom: 1px dashed #cbd5e1; background:transparent;" data-key="${capKey}" placeholder="[사진 ${i} 설명 캡션 입력]" oninput="trackRecChange(this, '${capKey}')">
            </div>`;
        }
        recDataStorage[`open_slots_${keyBase}`] = openCount;
        html += `</div>`;
        html += `<button class="btn-top-action" style="margin-top: 15px; background-color: #f1f5f9; color: #3b82f6; border: 2px dashed #93c5fd; width: 100%; padding: 12px; font-size: 0.95rem; font-weight: bold; cursor: pointer; border-radius: 8px;" onclick="addPhotoSlot('${keyBase}')">➕ 사진 추가 (최대 4장)</button>`;
        return html;
    };

    ['fire', 'safety'].forEach(type => {
        const typeShort = type === 'fire' ? '화재사고' : '안전사고';
        const dataset = type === 'fire' ? fireData : safetyData;
        
        const postInputs = document.querySelectorAll(`.calc-input[data-col="post"][data-type="${type}"]`);
        
        postInputs.forEach(postInput => {
            const mIdx = postInput.getAttribute('data-maj');
            const minIdx = postInput.getAttribute('data-min');
            const itemIdx = postInput.getAttribute('data-item');
            const keyBase = `rec-${type}-${mIdx}-${minIdx}-${itemIdx}`;

            if(recDataStorage['hidden_' + keyBase] || recDataStorage['deleted_' + keyBase]) return;
            
            const fieldInput = document.querySelector(`.calc-input[data-col="field"][data-type="${type}"][data-maj="${mIdx}"][data-min="${minIdx}"][data-item="${itemIdx}"]`);
            if(!fieldInput) return;
            
            const postVal = parseFloat(postInput.value || 0);
            const fieldVal = parseFloat(fieldInput.value || 0);

            if (postVal > fieldVal || postInput.hasAttribute('data-is-modified') || recDataStorage['cleared_' + keyBase]) {
                const recId = `${currentYear}-${String(recCount).padStart(3, '0')}`;
                if(!dataset[mIdx] || !dataset[mIdx].minors[minIdx]) return;
                
                const majorTitle = dataset[mIdx].major;
                const minorTitle = dataset[mIdx].minors[minIdx].title;
                
                const tr = postInput.closest('tr');
                if(!tr) return;
                
                const colItemEl = tr.querySelector('.col-item');
                let itemText = colItemEl ? colItemEl.innerText.trim().replace(/^[①-⑳]\s*/, '') : '';
                
                if (recDataStorage[`${keyBase}-title`] === undefined) {
                    recDataStorage[`${keyBase}-title`] = itemText;
                }

                const isMod = checkIfModified(keyBase);
                const numStyle = isMod ? 'background-color: #fef08a; color: #854d0e;' : '';

                const isCleared = recDataStorage['cleared_' + keyBase];
                const statusBtn = isCleared 
                    ? `<button class="btn-status cleared" onclick="toggleMissionClear('${keyBase}', '${type}', ${mIdx}, ${minIdx}, ${itemIdx})">✅ 완료</button>`
                    : `<button class="btn-status pending" onclick="toggleMissionClear('${keyBase}', '${type}', ${mIdx}, ${minIdx}, ${itemIdx})">진행중</button>`;

                listTbody.innerHTML += `
                    <tr>
                        <td style="background-color: #f8fafc;"><input type="checkbox" class="rec-checkbox" data-key="${keyBase}"></td>
                        <td id="num-col-${keyBase}" class="rec-col-num" style="${numStyle}">${recId}</td>
                        <td class="rec-col-type">${typeShort}</td>
                        <td class="rec-col-maj">${majorTitle}</td>
                        <td class="rec-col-min">${minorTitle}</td>
                        <td class="rec-col-desc">
                            <input type="text" class="rec-input-transparent title" data-key="${keyBase}-title" placeholder="개선 타이틀" oninput="trackRecChange(this, '${keyBase}-title')">
                            <textarea class="rec-textarea-transparent" data-key="${keyBase}-summary" placeholder="- 개선 방안 등 세부내용 요약을 입력하세요." oninput="trackRecChange(this, '${keyBase}-summary')"></textarea>
                        </td>
                        <td class="rec-col-status">${statusBtn}</td>
                        <td class="rec-col-manage"><button class="btn-delete" style="background-color:#64748b;" onclick="deleteRec('${keyBase}')">숨김</button></td>
                    </tr>
                `;

                detailWrapper.innerHTML += `
                    <div class="rec-detail-card" style="page-break-after: always;">
                        <div class="rec-detail-header">
                            <span>[${recId} ${typeShort}]</span> 
                            <input type="text" class="rec-input-transparent" data-key="${keyBase}-title" placeholder="타이틀 입력..." style="font-weight: bold; font-size: 1.1rem; color: #000;" oninput="trackRecChange(this, '${keyBase}-title')">
                        </div>
                        <table class="rec-detail-table">
                            <tr>
                                <th>현황 및 위험요소</th>
                                <td>
                                    <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 5px;">* 원본항목: ${itemText}</div>
                                    <textarea class="rec-detail-textarea" data-key="${keyBase}-status" placeholder="현재 상황 및 위험요소를 입력하세요..." oninput="trackRecChange(this, '${keyBase}-status')"></textarea>
                                </td>
                            </tr>
                            <tr>
                                <th>권장사항</th>
                                <td><textarea class="rec-detail-textarea" data-key="${keyBase}-action" placeholder="구체적인 개선 조치사항을 입력하세요..." oninput="trackRecChange(this, '${keyBase}-action')"></textarea></td>
                            </tr>
                            <tr>
                                <th>참고 사진</th>
                                <td style="background-color: #f1f5f9;">${getPhotoHtml(keyBase)}</td>
                            </tr>
                            <tr>
                                <th>관련 규정</th>
                                <td><textarea class="rec-detail-textarea" data-key="${keyBase}-rule" placeholder="법적 근거 및 고시 기준을 입력하세요..." oninput="trackRecChange(this, '${keyBase}-rule')"></textarea></td>
                            </tr>
                        </table>
                    </div>
                `;

                implWrapper.innerHTML += `
                    <div class="rec-detail-card" style="page-break-after: always; border: 2px solid #10b981;">
                        <div class="rec-detail-header" style="background-color: #d1fae5; border-bottom: 2px solid #10b981; color: #065f46;">
                            <span>[${recId}]</span>
                            <span style="font-weight: bold; font-size: 1.1rem; margin-left: 10px;">권장사항 이행 현황 및 조치 결과 관리</span>
                        </div>
                        <table class="rec-detail-table" style="border-color: #10b981;">
                            <tr>
                                <th style="background-color: #ecfdf5; border-color: #10b981;">대상 항목</th>
                                <td style="border-color: #10b981; font-weight: bold; color: #0f172a;">${recDataStorage[`${keyBase}-title`] || '제목 없음'}</td>
                            </tr>
                            <tr>
                                <th style="background-color: #ecfdf5; border-color: #10b981;">이행 상태</th>
                                <td style="border-color: #10b981;">${statusBtn} <span style="font-size: 0.85rem; color: #64748b; margin-left: 10px;">(버튼을 클릭하여 완료/진행중 상태를 변경하세요)</span></td>
                            </tr>
                            <tr>
                                <th style="background-color: #ecfdf5; border-color: #10b981;">조치내용 및 사유</th>
                                <td style="background-color: #ffffff; border-color: #10b981;">
                                    <textarea class="rec-detail-textarea" data-key="${keyBase}-impl" placeholder="이행 현황을 '완료'로 표기한 경우 조치된 내용(예: 공사, 교육 등)을 적어주시고, 미이행인 경우 그 사유를 상세히 기록하세요..." oninput="trackRecChange(this, '${keyBase}-impl')"></textarea>
                                </td>
                            </tr>
                        </table>
                    </div>
                `;
                recCount++;
            }
        });
    });

    if (recDataStorage.manualKeys) {
        recDataStorage.manualKeys.forEach(keyBase => {
            if(recDataStorage['hidden_' + keyBase] || recDataStorage['deleted_' + keyBase]) return;
            
            const recId = `${currentYear}-${String(recCount).padStart(3, '0')}`;
            const isCleared = recDataStorage['cleared_' + keyBase];
            const isMod = checkIfModified(keyBase);
            const numStyle = isMod ? 'background-color: #fef08a; color: #854d0e;' : '';
            
            const statusBtn = isCleared 
                ? `<button class="btn-status cleared" onclick="toggleMissionClear('${keyBase}', null, null, null, null)">✅ 완료</button>`
                : `<button class="btn-status pending" onclick="toggleMissionClear('${keyBase}', null, null, null, null)">진행중</button>`;

            listTbody.innerHTML += `
                <tr>
                    <td style="background-color: #f8fafc;"><input type="checkbox" class="rec-checkbox" data-key="${keyBase}"></td>
                    <td id="num-col-${keyBase}" class="rec-col-num" style="${numStyle}">${recId}</td>
                    <td class="rec-col-type"><input type="text" class="rec-input-transparent" data-key="${keyBase}-type" placeholder="구분 입력" oninput="trackRecChange(this, '${keyBase}-type')" style="text-align:center; font-weight:bold;"></td>
                    <td class="rec-col-maj"><input type="text" class="rec-input-transparent" data-key="${keyBase}-maj" placeholder="대분류 입력" oninput="trackRecChange(this, '${keyBase}-maj')" style="text-align:left; font-weight:500;"></td>
                    <td class="rec-col-min"><input type="text" class="rec-input-transparent" data-key="${keyBase}-min" placeholder="중분류 입력" oninput="trackRecChange(this, '${keyBase}-min')" style="text-align:left; font-weight:500;"></td>
                    <td class="rec-col-desc">
                        <input type="text" class="rec-input-transparent title" data-key="${keyBase}-title" placeholder="개선 타이틀 (직접 입력)" oninput="trackRecChange(this, '${keyBase}-title')">
                        <textarea class="rec-textarea-transparent" data-key="${keyBase}-summary" placeholder="- 개선 방안 등 세부내용 요약을 입력하세요." oninput="trackRecChange(this, '${keyBase}-summary')"></textarea>
                    </td>
                    <td class="rec-col-status">${statusBtn}</td>
                    <td class="rec-col-manage"><button class="btn-delete" style="background-color:#64748b;" onclick="deleteRec('${keyBase}')">숨김</button></td>
                </tr>
            `;

            detailWrapper.innerHTML += `
                <div class="rec-detail-card" style="page-break-after: always;">
                    <div class="rec-detail-header">
                        <span>[${recId}]</span> 
                        <input type="text" class="rec-input-transparent" data-key="${keyBase}-title" placeholder="타이틀 입력..." style="font-weight: bold; font-size: 1.1rem; color: #000;" oninput="trackRecChange(this, '${keyBase}-title')">
                    </div>
                    <table class="rec-detail-table">
                        <tr><th>현황 및 위험요소</th><td><textarea class="rec-detail-textarea" data-key="${keyBase}-status" placeholder="현재 상황 및 위험요소를 입력하세요..." oninput="trackRecChange(this, '${keyBase}-status')"></textarea></td></tr>
                        <tr><th>권장사항</th><td><textarea class="rec-detail-textarea" data-key="${keyBase}-action" placeholder="구체적인 개선 권장사항을 입력하세요..." oninput="trackRecChange(this, '${keyBase}-action')"></textarea></td></tr>
                        <tr>
                            <th>참고 사진</th>
                            <td style="background-color: #f1f5f9;">${getPhotoHtml(keyBase)}</td>
                        </tr>
                        <tr><th>관련 규정</th><td><textarea class="rec-detail-textarea" data-key="${keyBase}-rule" placeholder="관련 기준을 입력하세요..." oninput="trackRecChange(this, '${keyBase}-rule')"></textarea></td></tr>
                    </table>
                </div>
            `;

            implWrapper.innerHTML += `
                <div class="rec-detail-card" style="page-break-after: always; border: 2px solid #10b981;">
                    <div class="rec-detail-header" style="background-color: #d1fae5; border-bottom: 2px solid #10b981; color: #065f46;">
                        <span>[${recId}]</span>
                        <span style="font-weight: bold; font-size: 1.1rem; margin-left: 10px;">권장사항 이행 현황 및 조치 결과 관리</span>
                    </div>
                    <table class="rec-detail-table" style="border-color: #10b981;">
                        <tr>
                            <th style="background-color: #ecfdf5; border-color: #10b981;">대상 항목</th>
                            <td style="border-color: #10b981; font-weight: bold; color: #0f172a;">${recDataStorage[`${keyBase}-title`] || '제목 없음'}</td>
                        </tr>
                        <tr>
                            <th style="background-color: #ecfdf5; border-color: #10b981;">이행 상태</th>
                            <td style="border-color: #10b981;">${statusBtn} <span style="font-size: 0.85rem; color: #64748b; margin-left: 10px;">(버튼을 클릭하여 완료/진행중 상태를 변경하세요)</span></td>
                        </tr>
                        <tr>
                            <th style="background-color: #ecfdf5; border-color: #10b981;">조치내용 및 사유</th>
                            <td style="background-color: #ffffff; border-color: #10b981;">
                                <textarea class="rec-detail-textarea" data-key="${keyBase}-impl" placeholder="이행 현황을 '완료'로 표기한 경우 조치된 내용(예: 공사, 교육 등)을 적어주시고, 미이행인 경우 그 사유를 상세히 기록하세요..." oninput="trackRecChange(this, '${keyBase}-impl')"></textarea>
                            </td>
                        </tr>
                    </table>
                </div>
            `;
            recCount++;
        });
    }

    if(recCount === 1) {
        listTbody.innerHTML = `<tr><td colspan="8" style="padding: 30px; color:#64748b;">추출된 평가 항목이 없습니다. 하단 버튼을 눌러 수동으로 추가해주세요.</td></tr>`;
        detailWrapper.innerHTML = `<div class="no-data-msg" style="padding:20px; background:#fff; text-align:center;">작성할 권장사항 항목이 없습니다.</div>`;
        implWrapper.innerHTML = `<div class="no-data-msg" style="padding:20px; background:#fff; text-align:center;">이행 내역을 관리할 항목이 없습니다.</div>`;
    }

    restoreRecData();
}

function restoreRecData() {
    const inputs = document.querySelectorAll('#page-recommendation input[type="text"], #page-recommendation textarea');
    inputs.forEach(input => {
        const key = input.getAttribute('data-key');
        if (key && recDataStorage[key] !== undefined) {
            input.value = recDataStorage[key];
            if (recDataStorage[key + '-is-changed']) {
                input.classList.add('modified-cell');
            }
        }
    });

    const imgPreviews = document.querySelectorAll('.uploaded-preview');
    imgPreviews.forEach(img => {
        const imgKey = img.id.replace('preview-', '');
        const key = imgKey + '-img';
        const delBtn = document.getElementById(`del-img-${imgKey}`);
        
        if (recDataStorage[key]) {
            img.src = recDataStorage[key];
            img.style.display = 'block';
            if(delBtn) delBtn.style.display = 'block';
        } else {
            img.style.display = 'none';
            if(delBtn) delBtn.style.display = 'none';
        }
    });
}

// ==========================================
// [06] 저장 및 파일 불러오기 기능
// ==========================================
function saveToFile() {
    const allInputs = document.querySelectorAll('.calc-input');
    const savedData = {};
    
    allInputs.forEach(input => {
        const type = input.getAttribute('data-type');
        const mIdx = input.getAttribute('data-maj');
        const minIdx = input.getAttribute('data-min');
        const itemIdx = input.getAttribute('data-item');
        const col = input.getAttribute('data-col');
        savedData[`${type}-${mIdx}-${minIdx}-${itemIdx}-${col}`] = { value: input.value, isModified: input.hasAttribute('data-is-modified') };
    });
    
    const allRemarks = document.querySelectorAll('.remark-input');
    allRemarks.forEach(input => {
        const type = input.getAttribute('data-type');
        const mIdx = input.getAttribute('data-maj');
        const minIdx = input.getAttribute('data-min');
        const itemIdx = input.getAttribute('data-item');
        savedData[`${type}-${mIdx}-${minIdx}-${itemIdx}-remark`] = { value: input.value };
    });

    savedData['recDataStorage'] = recDataStorage;

    const dataStr = JSON.stringify(savedData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    const today = new Date().toISOString().slice(0,10);
    a.download = `위험평가_백업_${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadFromFile(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const savedData = JSON.parse(e.target.result);
            
            const allInputs = document.querySelectorAll('.calc-input');
            allInputs.forEach(input => {
                const type = input.getAttribute('data-type');
                const mIdx = input.getAttribute('data-maj');
                const minIdx = input.getAttribute('data-min');
                const itemIdx = input.getAttribute('data-item');
                const col = input.getAttribute('data-col');
                const key = `${type}-${mIdx}-${minIdx}-${itemIdx}-${col}`;
                
                if(savedData[key] !== undefined) {
                    if (typeof savedData[key] === 'object' && savedData[key] !== null) {
                        let loadVal = savedData[key].value;
                        input.value = (loadVal !== undefined && loadVal !== null) ? loadVal : '';
                        
                        if(savedData[key].isModified) {
                            input.setAttribute('data-is-modified', 'true');
                            input.classList.add('modified-cell');
                        } else {
                            input.removeAttribute('data-is-modified');
                            input.classList.remove('modified-cell');
                        }
                    } else {
                        input.value = savedData[key] || '';
                        input.removeAttribute('data-is-modified');
                        input.classList.remove('modified-cell');
                    }
                }
            });

            const allRemarks = document.querySelectorAll('.remark-input');
            allRemarks.forEach(input => {
                const type = input.getAttribute('data-type');
                const mIdx = input.getAttribute('data-maj');
                const minIdx = input.getAttribute('data-min');
                const itemIdx = input.getAttribute('data-item');
                const key = `${type}-${mIdx}-${minIdx}-${itemIdx}-remark`;
                
                if(savedData[key] !== undefined) {
                    let rVal = typeof savedData[key] === 'object' && savedData[key] !== null ? savedData[key].value : savedData[key];
                    input.value = (rVal !== undefined && rVal !== null) ? rVal : '';
                }
            });

            if(savedData['recDataStorage']) {
                recDataStorage = savedData['recDataStorage'];
            } else {
                recDataStorage = {};
            }

            for(let key in recDataStorage) {
                if(key.startsWith('cleared_') && recDataStorage[key]) {
                    const parts = key.replace('cleared_rec-', '').split('-');
                    if(parts.length === 4) {
                        const fieldInput = document.querySelector(`.calc-input[data-col="field"][data-type="${parts[0]}"][data-maj="${parts[1]}"][data-min="${parts[2]}"][data-item="${parts[3]}"]`);
                        if(fieldInput) fieldInput.classList.add('cleared-cell');
                    }
                }
            }

            updateSums('fire');
            updateSums('safety');
            
            if (document.getElementById('page-recommendation').classList.contains('active')) {
                buildRecommendations();
            }

            alert('백업 파일에서 데이터를 성공적으로 복원했습니다.');
        } catch (error) {
            console.error(error);
            alert('파일을 읽는 도중 오류가 발생했습니다. 파일 형식을 확인해주세요.');
        }
        fileInput.value = ''; 
    };
    reader.readAsText(file);
}

// 화면 초기화 실행
document.addEventListener('DOMContentLoaded', () => {
    renderInputTable(fireData, 'fire');
    renderInputTable(safetyData, 'safety');
    renderResultTable(fireData, 'fire');
    renderResultTable(safetyData, 'safety');
    updateSums('fire');
    updateSums('safety');
});