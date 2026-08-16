import type React from 'react';
import { Link, useParams } from 'react-router-dom';
import { PLACES } from '../data/places';
import { PANEL_WIDTH } from './ExplorerLayout';

/* =========================================================================
 * PlaceDetailSlot.tsx — STUB.
 * -------------------------------------------------------------------------
 * Placeholder only. The real detail content (photos, full description,
 * accessibility survey detail, etc.) is being built separately — this
 * just wires up the route (/places/:id), confirms the right place loads,
 * and sits in the exact same fixed left slot PlaceListPanel normally
 * occupies (same width/position/panel chrome — see `panelStyle` below,
 * which mirrors PlaceListPanel's own outer panel styling so the two
 * slots are visually interchangeable).
 *
 * Swap this file's contents for the real design whenever it's ready —
 * the route itself (in App.tsx) and the `id` param won't need to change.
 * =======================================================================*/

// Mirrors PlaceListPanel's own `styles.panel` (position/size/background/
// border/shadow/font) so the detail slot sits exactly where the list
// panel would, pixel for pixel.
const panelStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100vh',
  width: PANEL_WIDTH,
  maxWidth: '100%',
  boxSizing: 'border-box',
  overflowY: 'auto',
  background: '#ffffff',
  borderRight: '1px solid #e5e7eb',
  boxShadow: '4px 0 16px rgba(0,0,0,0.06)',
  zIndex: 1000,
  fontFamily:
    "'APHont', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: '20px 24px',
};

export default function PlaceDetailSlot() {
  const { id } = useParams<{ id: string }>();
  const place = PLACES.find((p) => p.id === id);

  return (
    <aside style={panelStyle} aria-label="Place detail panel">
      <Link to="/" style={{ fontSize: 14, color: '#4338ca', textDecoration: 'none' }}>
        ← 지도로 돌아가기
      </Link>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          border: '1px dashed #d1d5db',
          borderRadius: 16,
          background: '#f9fafb',
        }}
      >
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, color: '#9ca3af' }}>
          PLACEHOLDER — 상세 페이지 준비 중
        </p>

        {place ? (
          <>
            <h1 style={{ margin: '12px 0 4px', fontSize: 22, color: '#111827' }}>{place.name}</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>id: {place.id}</p>
          </>
        ) : (
          <p style={{ margin: '12px 0 0', fontSize: 14, color: '#c62828' }}>
            "{id}" 에 해당하는 장소를 찾을 수 없어요.
          </p>
        )}

        <p style={{ marginTop: 16, fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
          여기에 실제 상세 페이지(사진, 설명, 접근성 조사 상세 등)가 들어갈 예정입니다.
        </p>
      </div>
    </aside>
  );
}
