import { useOutletContext } from 'react-router-dom';
import PlaceListPanel from '../components/PlaceListPanel';
import type { ExplorerOutletContext } from './ExplorerLayout';

/** Index route ("/") — the left slot shows the place list. */
export default function PlaceListSlot() {
  const { visiblePlaces, activePlaceId, onSelectPlace, placesLoading } =
    useOutletContext<ExplorerOutletContext>();

  return (
    <PlaceListPanel
      places={visiblePlaces}
      activePlaceId={activePlaceId}
      onSelectPlace={onSelectPlace}
      loading={placesLoading}
    />
  );
}
