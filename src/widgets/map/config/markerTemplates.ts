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
    <style>
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.4; }
        70% { transform: scale(3); opacity: 0; }
        100% { transform: scale(1); opacity: 0; }
      }
    </style>
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

  // 개별 기록 마커 (말풍선)
  recordBubble: (comment: string) => {
    const displayComment = comment.length > 12 ? `${comment.slice(0, 12)}…` : comment;

    return `
    <div class="record-marker">
      <div class="speech-bubble">
        ${displayComment}
      </div>
    </div>
  `;
  },
};
