/**
 * 마커 그라데이션 팔레트 (세련된 조합들)
 */
const GRADIENTS = [
  'linear-gradient(to right, #3b82f6, #8b5cf6)', // Blue to Violet
  'linear-gradient(to right, #ec4899, #f43f5e)', // Pink to Rose
  'linear-gradient(to right, #10b981, #3b82f6)', // Emerald to Blue
  'linear-gradient(to right, #f59e0b, #ef4444)', // Amber to Red
  'linear-gradient(to right, #8b5cf6, #d946ef)', // Violet to Fuchsia
  'linear-gradient(to right, #06b6d4, #10b981)', // Cyan to Emerald
];

/**
 * 꼬리 부분에 사용할 단일 대표 색상 (그라데이션의 첫 번째 색상 추출)
 */
const GET_REPRESENTATIVE_COLOR = (index: number) => {
  const baseColors = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
  return baseColors[index % baseColors.length];
};

/**
 * ID 문자열을 기반으로 고정된 그라데이션 인덱스를 반환합니다.
 */
const getGradientIndex = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % GRADIENTS.length;
};

/**
 * 마커 디자인 템플릿 (HTML 문자열)
 */
export const MARKER_TEMPLATES = {
  // 내 위치 마커
  myLocation: `
    <div style="position: relative; width: 24px; height: 24px;">
      <div style="position: absolute; width: 100%; height: 100%; background: #3b82f6; border-radius: 50%; opacity: 0.4; animation: pulse 2s infinite;"></div>
      <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
        <div style="width: 10px; height: 10px; background: #3b82f6; border-radius: 50%;"></div>
      </div>
    </div>
  `,

  // 클릭 지점 마커 (기록 작성 시)
  clickLocation: `
    <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: rgba(59, 130, 246, 0.2); border: 2px solid #3b82f6; border-radius: 50%; animation: clickPulse 1.5s infinite;">
      <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;"></div>
    </div>
    <style>@keyframes clickPulse { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }</style>
  `,

  // 클러스터 마커
  cluster: (count: number) => `
    <div style="
      display: flex; align-items: center; justify-content: center; 
      width: 44px; height: 44px; 
      background: white; border: 3px solid #3b82f6; 
      border-radius: 50%; color: #3b82f6; font-weight: bold; font-size: 14px;
      box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
      cursor: pointer; transition: transform 0.2s;
    " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
      ${count}
    </div>
  `,

  // 개별 기록 마커 (그라데이션 말풍선)
  recordBubble: (comment: string, id: string, isNew?: boolean) => {
    const displayComment = comment.length > 12 ? `${comment.slice(0, 12)}…` : comment;
    const gIndex = getGradientIndex(id);
    const gradient = GRADIENTS[gIndex];
    const repColor = GET_REPRESENTATIVE_COLOR(gIndex);

    return `
    <div class="record-marker">
      <div class="speech-bubble" style="
        border: 2.5px solid transparent;
        background-image: linear-gradient(#fff, #fff), ${gradient};
        background-origin: border-box;
        background-clip: padding-box, border-box;
      ">
        ${displayComment}
        ${
          isNew
            ? `
          <div style="
            position: absolute; 
            top: -6px; 
            right: -6px; 
            width: 16px; 
            height: 16px; 
            background: #fbbf24; 
            border: 1.5px solid white;
            border-radius: 50%; 
            color: #92400e; 
            font-size: 9px; 
            font-weight: 900; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            z-index: 1;
          ">N</div>
        `
            : ''
        }
        <!-- 꼬리 부분 -->
        <div style="
          position: absolute;
          left: 50%;
          bottom: -7.5px;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 9px solid transparent;
          border-right: 9px solid transparent;
          border-top: 9px solid ${repColor};
          z-index: -1;
        "></div>
        <div style="
          position: absolute;
          left: 50%;
          bottom: -4px;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 7px solid #fff;
          z-index: 0;
        "></div>
      </div>
    </div>
  `;
  },
};
