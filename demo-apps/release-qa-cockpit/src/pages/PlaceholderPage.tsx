import { useParams, useLocation } from 'react-router-dom';

export function PlaceholderPage() {
  const { releaseId } = useParams();
  const location = useLocation();

  return (
    <div>
      <h1>{location.pathname}</h1>
      <p>This screen is not yet implemented in PR-1.</p>
      {releaseId && <p>Release ID: {releaseId}</p>}
    </div>
  );
}
