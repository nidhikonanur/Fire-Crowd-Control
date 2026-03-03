# API Contract

Base URL: `http://localhost:8000`

## Health
### `GET /health`
Checks service liveness and DB connectivity.

Response:
```json
{
  "status": "ok",
  "database": "ok"
}
```

## Cameras
### `GET /api/cameras`
Returns all camera configs and latest status.

### `POST /api/cameras`
Creates a new camera.

Request body:
```json
{
  "name": "North Entrance Cam",
  "stream_url": "sim://sample",
  "enabled": true,
  "target_fps": 2,
  "alert_threshold": 120
}
```

Validation rules:
- `name`: alphanumeric + spaces/`_`/`-`, max 80 chars, unique.
- `stream_url` schemes: `http`, `https`, `rtsp`, `sim`, `device`, `camera`.
- `target_fps`: 1..5.
- `alert_threshold`: 1..10000.

### `PATCH /api/cameras/{camera_id}`
Partially updates camera config.

### `DELETE /api/cameras/{camera_id}`
Deletes camera and stops its worker.

### `GET /api/cameras/{camera_id}/latest`
Returns in-memory latest event when available, otherwise DB snapshot fallback.

## WebSocket
### `WS /ws/analytics`
Realtime event stream for all cameras.

Analytics event:
```json
{
  "camera_id": "31d4dbea-5424-4668-8f70-dc825d80d324",
  "ts": "2026-03-03T09:12:25.909954+00:00",
  "status": "online",
  "processed_fps": 2.4,
  "latency_ms": 88.2,
  "crowd_count": 123.5,
  "density_overlay_png_base64": "<base64 png>",
  "frame_jpeg_base64": "<base64 jpg>",
  "message": null
}
```

Notes:
- Server may send `{"type":"ping"}` keepalive frames.
- Client should ignore out-of-order events per camera (`ts` descending).
